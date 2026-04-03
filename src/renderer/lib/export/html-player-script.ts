/**
 * Returns the standalone HTML player JavaScript.
 * Uses localStorage for progress tracking — no LMS required.
 */

export function getHtmlPlayerScript(): string {
  return `
// LuminaUDL Standalone HTML Player
(function() {
  'use strict';

  var startTime = Date.now();
  var courseId = document.body.getAttribute('data-course-id') || 'lumina-course';
  var storageKey = 'lumina_progress_' + courseId;

  function getProgress() {
    try {
      var data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : { visited: [], scores: {}, bookmarks: [], lessonProgress: {} };
    } catch (e) { return { visited: [], scores: {}, bookmarks: [], lessonProgress: {} }; }
  }

  function saveProgress(progress) {
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch (e) {}
  }

  function getLessonProgress(progress, lid) {
    if (!progress.lessonProgress) progress.lessonProgress = {};
    if (!progress.lessonProgress[lid]) {
      progress.lessonProgress[lid] = { completed: false, quizScore: null, flashcardsMissed: null, matchingCompleted: false, dragdropCompleted: false };
    }
    return progress.lessonProgress[lid];
  }

  // Mark current lesson as visited
  var lessonId = document.body.getAttribute('data-lesson-id') || '';
  if (lessonId) {
    var progress = getProgress();
    if (progress.visited.indexOf(lessonId) === -1) {
      progress.visited.push(lessonId);
    }
    progress.lastVisited = lessonId;
    progress.lastTime = new Date().toISOString();
    getLessonProgress(progress, lessonId); // ensure entry exists
    saveProgress(progress);
  }

  // Restore completion indicators in navigation
  function restoreCompletionIndicators() {
    var progress = getProgress();
    var navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(function(btn) {
      var lid = btn.getAttribute('data-lesson-id');
      if (lid && progress.lessonProgress && progress.lessonProgress[lid] && progress.lessonProgress[lid].completed) {
        btn.classList.add('lesson-completed');
      }
    });
  }

  // No-op SCORM wrapper so existing player scripts work
  window.SCORM = {
    init: function() { return true; },
    getValue: function() { return ''; },
    setValue: function() { return true; },
    commit: function() { return true; },
    finish: function() { return true; },
    setComplete: function() {
      var p = getProgress();
      if (lessonId && p.visited.indexOf(lessonId) === -1) p.visited.push(lessonId);
      var lp = getLessonProgress(p, lessonId);
      lp.completed = true;
      saveProgress(p);
    },
    setPassed: function() {},
    setFailed: function() {},
    setScore: function(score) {
      var p = getProgress();
      p.scores[lessonId] = score;
      var lp = getLessonProgress(p, lessonId);
      lp.quizScore = score;
      saveProgress(p);
    },
    setLocation: function() {},
    getLocation: function() { return ''; },
    setSuspendData: function() {},
    getSuspendData: function() { return ''; },
    setSessionTime: function() {}
  };

  function _initAll() {
    initEnrollment();
    initTabs();
    initFlashcards();
    initQuiz();
    initNavigation();
    initDragDrop();
    initMatching();
    initBranching();
    initAnimations();
    initAutoSave();
    initSaveForLater();
    initFileViewer();
    initIncompleteHighlighting();
    restoreCompletionIndicators();
  }

  function initEnrollment() {
    var form = document.getElementById('enrollment-form');
    var overlay = document.getElementById('enrollment-overlay');
    if (!form || !overlay) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var nameInput = document.getElementById('enrollment-name');
      var name = nameInput ? nameInput.value.trim() : '';
      if (!name) return;
      var progress = getProgress();
      progress.learnerName = name;
      progress.enrolledAt = new Date().toISOString();
      saveProgress(progress);
      overlay.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initAll);
  } else {
    _initAll();
  }

  // Check if enrollment overlay is blocking navigation
  function isEnrollmentBlocking() {
    var overlay = document.getElementById('enrollment-overlay');
    return overlay && overlay.style.display !== 'none';
  }

  // Navigation via data attributes
  function initNavigation() {
    var prevBtn = document.getElementById('btn-prev');
    var nextBtn = document.getElementById('btn-next');
    var finishBtn = document.getElementById('btn-finish');

    if (prevBtn) {
      prevBtn.onclick = function() {
        if (isEnrollmentBlocking()) return;
        var prev = document.body.getAttribute('data-prev-lesson');
        if (prev) window.location.href = prev;
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function() {
        if (isEnrollmentBlocking()) return;
        var next = document.body.getAttribute('data-next-lesson');
        if (next) window.location.href = next;
      };
    }
    if (finishBtn) {
      finishBtn.onclick = function() {
        if (isEnrollmentBlocking()) return;
        window.location.href = 'index.html';
      };
    }
  }

  // Tab switching
  function initTabs() {
    var tabLists = document.querySelectorAll('[role="tablist"]');
    tabLists.forEach(function(tabList) {
      var tabs = tabList.querySelectorAll('[role="tab"]');
      var parent = tabList.parentElement;
      var panels = parent.querySelectorAll('[role="tabpanel"]');
      tabs.forEach(function(tab) {
        tab.addEventListener('click', function() {
          var idx = tab.getAttribute('data-tab');
          tabs.forEach(function(t) { t.setAttribute('aria-selected', 'false'); });
          panels.forEach(function(p) { p.hidden = true; });
          tab.setAttribute('aria-selected', 'true');
          var panel = parent.querySelector('[data-panel="' + idx + '"]');
          if (panel) panel.hidden = false;
        });
      });
    });
  }

  // Flashcards — 3D flip with self-test
  function initFlashcards() {
    document.querySelectorAll('.flashcard-deck').forEach(function(deck) {
      var cards = deck.querySelectorAll('.flashcard');
      var counter = deck.querySelector('.card-counter');
      var prevBtn = deck.querySelector('.prev-btn');
      var nextBtn = deck.querySelector('.next-btn');
      var selfTest = deck.querySelector('.fc-self-test');
      var gotItBtn = deck.querySelector('.fc-got-it');
      var reviewBtn = deck.querySelector('.fc-review');
      var reviewMissedBtn = deck.querySelector('.fc-review-missed');
      var current = 0;
      var missedCards = [];
      var activeIndices = [];
      for (var i = 0; i < cards.length; i++) activeIndices.push(i);

      cards.forEach(function(card) {
        card.addEventListener('click', function() {
          card.classList.toggle('flipped');
          if (selfTest && card.classList.contains('flipped')) {
            selfTest.style.display = 'flex';
          }
        });
      });

      function showCard(idx) {
        cards.forEach(function(c, ci) {
          if (ci !== idx) { c.classList.add('fc-hidden'); } else { c.classList.remove('fc-hidden'); }
        });
        current = idx;
        var posInSet = activeIndices.indexOf(idx) + 1;
        counter.textContent = posInSet + ' / ' + activeIndices.length;
        prevBtn.disabled = activeIndices.indexOf(idx) === 0;
        nextBtn.disabled = activeIndices.indexOf(idx) === activeIndices.length - 1;
        cards[idx].classList.remove('flipped');
        if (selfTest) selfTest.style.display = 'none';
      }

      function advanceOrFinish() {
        var pos = activeIndices.indexOf(current);
        if (pos < activeIndices.length - 1) {
          showCard(activeIndices[pos + 1]);
        } else {
          if (selfTest) selfTest.style.display = 'none';
          if (missedCards.length > 0 && reviewMissedBtn) {
            reviewMissedBtn.style.display = 'block';
            reviewMissedBtn.textContent = 'Review Missed (' + missedCards.length + ')';
          }
        }
      }

      if (gotItBtn) gotItBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        advanceOrFinish();
      });

      if (reviewBtn) reviewBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        if (missedCards.indexOf(current) === -1) missedCards.push(current);
        advanceOrFinish();
      });

      if (reviewMissedBtn) reviewMissedBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        activeIndices = missedCards.slice();
        missedCards = [];
        reviewMissedBtn.style.display = 'none';
        if (activeIndices.length > 0) showCard(activeIndices[0]);
      });

      if (prevBtn) prevBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var pos = activeIndices.indexOf(current);
        if (pos > 0) showCard(activeIndices[pos - 1]);
      });
      if (nextBtn) nextBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var pos = activeIndices.indexOf(current);
        if (pos < activeIndices.length - 1) showCard(activeIndices[pos + 1]);
      });
    });
  }

  // Drag & Drop
  function initDragDrop() {
    document.querySelectorAll('.block-dragdrop').forEach(function(block) {
      var items = block.querySelectorAll('.dd-item[draggable]');
      var zones = block.querySelectorAll('.dd-zone');

      items.forEach(function(item) {
        item.addEventListener('dragstart', function(e) {
          e.dataTransfer.setData('text/plain', item.dataset.pair);
          e.dataTransfer.setData('application/x-item-id', item.dataset.id);
          item.style.opacity = '0.5';
        });
        item.addEventListener('dragend', function() {
          item.style.opacity = '';
        });
      });

      zones.forEach(function(zone) {
        zone.addEventListener('dragover', function(e) {
          e.preventDefault();
          zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', function() {
          zone.classList.remove('drag-over');
        });
        zone.addEventListener('drop', function(e) {
          e.preventDefault();
          zone.classList.remove('drag-over');
          var pair = e.dataTransfer.getData('text/plain');
          var itemId = e.dataTransfer.getData('application/x-item-id');
          var correct = pair === zone.dataset.pair;
          zone.classList.add(correct ? 'dd-correct' : 'dd-incorrect');

          if (correct) {
            var draggedItem = block.querySelector('.dd-item[data-id="' + itemId + '"]');
            if (draggedItem) {
              draggedItem.classList.add('placed');
              draggedItem.setAttribute('draggable', 'false');
              zone.appendChild(draggedItem);
            }
          } else {
            setTimeout(function() { zone.classList.remove('dd-incorrect'); }, 1500);
          }
        });
      });
    });
  }

  // Matching — click-to-select
  function initMatching() {
    document.querySelectorAll('.block-matching').forEach(function(block) {
      var selectedLeft = null;

      block.querySelectorAll('.match-left').forEach(function(item) {
        item.addEventListener('click', function() {
          if (item.classList.contains('matched-correct')) return;
          if (selectedLeft) selectedLeft.classList.remove('selected');
          selectedLeft = item;
          item.classList.add('selected');
        });
      });

      block.querySelectorAll('.match-right').forEach(function(item) {
        item.addEventListener('click', function() {
          if (!selectedLeft || item.classList.contains('matched-correct')) return;
          var correct = selectedLeft.dataset.pair === item.dataset.id;
          if (correct) {
            selectedLeft.classList.remove('selected');
            selectedLeft.classList.add('matched-correct');
            item.classList.add('matched-correct');
          } else {
            selectedLeft.classList.add('matched-incorrect');
            item.classList.add('matched-incorrect');
            var left = selectedLeft;
            setTimeout(function() {
              left.classList.remove('matched-incorrect', 'selected');
              item.classList.remove('matched-incorrect');
            }, 1200);
          }
          selectedLeft = null;
        });
      });
    });
  }

  // Branching — choice buttons
  function initBranching() {
    document.querySelectorAll('.block-branching').forEach(function(block) {
      var choices = block.querySelectorAll('.branch-choice');
      var consequenceDiv = block.querySelector('.branch-consequence');
      var continueBtn = block.querySelector('.branch-continue');

      choices.forEach(function(btn) {
        btn.addEventListener('click', function() {
          choices.forEach(function(c) { c.classList.remove('chosen'); });
          btn.classList.add('chosen');

          var consequence = btn.dataset.consequence;
          if (consequence && consequenceDiv) {
            consequenceDiv.textContent = consequence;
            consequenceDiv.hidden = false;
          }

          if (continueBtn) {
            continueBtn.hidden = false;
            var nextId = btn.dataset.next;
            var action = btn.dataset.action || 'navigate';
            continueBtn.onclick = function() {
              if (action === 'restart') {
                try { localStorage.removeItem(storageKey); } catch(e) {}
                window.location.href = window.location.pathname.replace(/[^/]+$/, 'index.html');
              } else if (nextId) {
                var nextLesson = document.body.getAttribute('data-next-lesson');
                if (nextLesson) window.location.href = nextLesson;
              }
            };
          }
        });
      });
    });
  }

  // Quiz
  function initQuiz() {
    document.querySelectorAll('.block-quiz').forEach(function(quiz) {
      var submitBtn = quiz.querySelector('.quiz-submit');
      var resultDiv = quiz.querySelector('.quiz-result');
      var passThreshold = parseInt(quiz.getAttribute('data-pass') || '70');
      var showFeedback = quiz.getAttribute('data-feedback') === 'true';
      var allowRetry = quiz.getAttribute('data-retry') === 'true';

      if (!submitBtn) return;

      submitBtn.addEventListener('click', function() {
        var questions = quiz.querySelectorAll('.quiz-question');
        var correct = 0;
        var total = 0;

        questions.forEach(function(q) {
          var type = q.getAttribute('data-type');
          if (type === 'short-answer' || type === 'likert') return;
          total++;
          var selected = q.querySelector('input:checked');
          var isCorrect = selected && selected.getAttribute('data-correct') === 'true';
          if (isCorrect) correct++;

          if (showFeedback) {
            var fbCorrect = q.querySelector('.feedback-correct');
            var fbIncorrect = q.querySelector('.feedback-incorrect');
            if (isCorrect && fbCorrect) fbCorrect.hidden = false;
            if (!isCorrect && fbIncorrect) fbIncorrect.hidden = false;
          }
        });

        var score = total > 0 ? Math.round((correct / total) * 100) : 0;
        var passed = score >= passThreshold;

        SCORM.setScore(score);

        resultDiv.hidden = false;
        resultDiv.style.background = passed ? '#dcfce7' : '#fee2e2';
        resultDiv.style.color = passed ? '#166534' : '#991b1b';
        resultDiv.textContent = passed
          ? 'Passed! Score: ' + score + '%'
          : 'Not passed. Score: ' + score + '% (need ' + passThreshold + '%)';

        if (!allowRetry) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitted';
        }
      });
    });
  }

  // Auto-save progress periodically and on interaction
  function initAutoSave() {
    // Save scroll position
    var scrollKey = 'lumina_scroll_' + courseId + '_' + lessonId;
    var savedScroll = 0;
    try { savedScroll = parseInt(localStorage.getItem(scrollKey) || '0'); } catch(e) {}
    if (savedScroll > 0) window.scrollTo(0, savedScroll);

    // Periodically save scroll position
    var scrollTimer = null;
    window.addEventListener('scroll', function() {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function() {
        try { localStorage.setItem(scrollKey, String(window.scrollY)); } catch(e) {}
      }, 500);
    });

    // Auto-save on any input change (quiz answers, etc.)
    document.addEventListener('change', function(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
        var p = getProgress();
        if (!p.inputState) p.inputState = {};
        if (!p.inputState[lessonId]) p.inputState[lessonId] = {};
        var el = e.target;
        var name = el.name || el.id || el.getAttribute('data-question');
        if (name) {
          p.inputState[lessonId][name] = el.type === 'checkbox' || el.type === 'radio' ? el.checked + '|' + el.value : el.value;
          saveProgress(p);
        }
      }
    });

    // Restore saved input state
    var p = getProgress();
    if (p.inputState && p.inputState[lessonId]) {
      var state = p.inputState[lessonId];
      Object.keys(state).forEach(function(name) {
        var val = state[name];
        var els = document.querySelectorAll('[name="' + name + '"], [id="' + name + '"], [data-question="' + name + '"]');
        els.forEach(function(el) {
          if (el.type === 'radio' || el.type === 'checkbox') {
            var parts = val.split('|');
            if (parts[1] === el.value) el.checked = parts[0] === 'true';
          } else {
            el.value = val;
          }
        });
      });
    }
  }

  // Save for Later — per-block save buttons
  function initSaveForLater() {
    var sflKey = 'lumina_sfl_' + courseId;

    function getSaved() {
      try { var d = localStorage.getItem(sflKey); return d ? JSON.parse(d) : []; } catch(e) { return []; }
    }
    function setSaved(items) {
      try { localStorage.setItem(sflKey, JSON.stringify(items)); } catch(e) {}
    }

    // Init save buttons
    document.querySelectorAll('.sfl-save-btn').forEach(function(btn) {
      var blockId = btn.getAttribute('data-block-id');
      var saved = getSaved();
      if (saved.some(function(s) { return s.id === blockId; })) {
        btn.textContent = '\u2605 Saved';
        btn.classList.add('saved');
      }

      btn.addEventListener('click', function() {
        var items = getSaved();
        var existing = items.findIndex(function(s) { return s.id === blockId; });
        if (existing >= 0) {
          items.splice(existing, 1);
          btn.textContent = '\u2606 Save for Later';
          btn.classList.remove('saved');
        } else {
          items.push({
            id: blockId,
            type: btn.getAttribute('data-block-type'),
            label: btn.getAttribute('data-block-label'),
            lessonId: lessonId,
            savedAt: new Date().toISOString()
          });
          btn.textContent = '\u2605 Saved';
          btn.classList.add('saved');
        }
        setSaved(items);
        renderSflLists();
      });
    });

    // Render saved items in save-for-later blocks
    function renderSflLists() {
      document.querySelectorAll('.block-save-for-later').forEach(function(block) {
        var list = block.querySelector('.sfl-items-list');
        if (!list) return;
        var items = getSaved();
        if (items.length === 0) {
          list.innerHTML = '<p class="sfl-empty">No items saved yet.</p>';
          return;
        }
        list.innerHTML = items.map(function(item) {
          return '<div class="sfl-item"><span class="sfl-item-type">' + (item.type || '') + '</span><span class="sfl-item-label">' + (item.label || 'Untitled') + '</span><button class="sfl-item-remove" data-sfl-id="' + item.id + '" title="Remove">&times;</button></div>';
        }).join('');
        list.querySelectorAll('.sfl-item-remove').forEach(function(removeBtn) {
          removeBtn.addEventListener('click', function() {
            var rid = removeBtn.getAttribute('data-sfl-id');
            var current = getSaved();
            setSaved(current.filter(function(s) { return s.id !== rid; }));
            // Update corresponding save button if on this page
            var saveBtn = document.querySelector('.sfl-save-btn[data-block-id="' + rid + '"]');
            if (saveBtn) { saveBtn.textContent = '\u2606 Save for Later'; saveBtn.classList.remove('saved'); }
            renderSflLists();
          });
        });
      });
    }
    renderSflLists();
  }

  // File viewer - toggle inline PDF/HTML viewer
  function initFileViewer() {
    document.querySelectorAll('.file-view-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var container = btn.closest('.block-file-upload').querySelector('.file-viewer-container');
        if (!container) return;
        if (!container.hidden) {
          container.hidden = true;
          container.innerHTML = '';
          btn.textContent = 'View';
          return;
        }
        var src = btn.getAttribute('data-file-src');
        var type = btn.getAttribute('data-file-type');
        container.hidden = false;
        if (type === 'application/pdf') {
          container.innerHTML = '<iframe src="' + src + '" style="width:100%;height:500px;border:none;" title="PDF viewer"></iframe>';
        } else {
          container.innerHTML = '<iframe src="' + src + '" style="width:100%;height:400px;border:none;" title="Document viewer" sandbox="allow-same-origin"></iframe>';
        }
        btn.textContent = 'Hide';
      });
    });
  }

  // Incomplete section highlighting on Next click
  function initIncompleteHighlighting() {
    var INTERACTIVE_TYPES = ['video', 'audio', 'quiz', 'accordion', 'drag-drop', 'flashcard', 'feedback-form', 'matching', 'tabs'];
    var nextBtn = document.getElementById('btn-next');
    if (!nextBtn) return;

    var originalOnclick = nextBtn.onclick;
    nextBtn.onclick = function(e) {
      // Check for incomplete interactive blocks
      var incompleteBlocks = [];
      INTERACTIVE_TYPES.forEach(function(type) {
        document.querySelectorAll('.block-' + type.replace('-', '')).forEach(function(block) {
          incompleteBlocks.push(block);
        });
        // Also check with hyphen format
        document.querySelectorAll('.block-' + type).forEach(function(block) {
          if (incompleteBlocks.indexOf(block) === -1) incompleteBlocks.push(block);
        });
      });

      // Check which blocks need interaction
      var unfinished = [];
      incompleteBlocks.forEach(function(block) {
        // Quiz: check if submitted
        if (block.classList.contains('block-quiz')) {
          var result = block.querySelector('.quiz-result');
          if (!result || result.hidden) unfinished.push(block);
          return;
        }
        // Drag & Drop: check if all items placed
        if (block.classList.contains('block-dragdrop')) {
          var unplaced = block.querySelectorAll('.dd-item:not(.placed)');
          if (unplaced.length > 0) unfinished.push(block);
          return;
        }
        // Matching: check if all matched
        if (block.classList.contains('block-matching')) {
          var unmatched = block.querySelectorAll('.match-left:not(.matched-correct)');
          if (unmatched.length > 0) unfinished.push(block);
          return;
        }
        // Feedback form: check if submitted
        if (block.classList.contains('block-feedback-form') || block.querySelector('.feedback-submit')) {
          var submitted = block.querySelector('.feedback-thankyou');
          if (!submitted || submitted.hidden) unfinished.push(block);
        }
      });

      if (unfinished.length > 0) {
        // Remove previous highlights
        document.querySelectorAll('.block-incomplete-highlight').forEach(function(el) {
          el.classList.remove('block-incomplete-highlight');
        });
        // Highlight incomplete blocks
        unfinished.forEach(function(block) {
          block.classList.add('block-incomplete-highlight');
        });
        // Scroll to first incomplete block
        unfinished[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        e.preventDefault();
        e.stopPropagation();
        return false;
      }

      // All complete, proceed
      document.querySelectorAll('.block-incomplete-highlight').forEach(function(el) {
        el.classList.remove('block-incomplete-highlight');
      });
      if (originalOnclick) return originalOnclick.call(nextBtn, e);
      var next = document.body.getAttribute('data-next-lesson');
      if (next) window.location.href = next;
    };
  }

  // Scroll-triggered block animations via IntersectionObserver
  function initAnimations() {
    requestAnimationFrame(function() {
    var blocks = document.querySelectorAll('[data-anim]');
    if (blocks.length === 0) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      blocks.forEach(function(el) { el.style.opacity = '1'; });
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        var animType = el.getAttribute('data-anim');
        var duration = el.getAttribute('data-anim-duration') || '500';
        var delay = el.getAttribute('data-anim-delay') || '0';
        el.style.animation = 'lumina-' + animType + ' ' + duration + 'ms ease-out ' + delay + 'ms both';
        var totalMs = parseInt(duration) + parseInt(delay) + 50;
        setTimeout(function() { el.style.opacity = '1'; }, totalMs);
        observer.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -10% 0px' });

    blocks.forEach(function(el) { observer.observe(el); });
    });
  }
})();
`
}
