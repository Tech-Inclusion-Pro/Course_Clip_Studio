/**
 * Returns the SCORM 1.2 API wrapper JavaScript as a string.
 * This gets embedded as scorm-api.js in the SCORM package.
 */

export function getScormApiScript(): string {
  return `
// SCORM 1.2 API Wrapper
(function() {
  'use strict';

  var api = null;
  var initialized = false;

  // Find the SCORM API object in the window hierarchy
  function findAPI(win) {
    var attempts = 0;
    while (win && !win.API && attempts < 10) {
      attempts++;
      if (win.parent && win.parent !== win) {
        win = win.parent;
      } else if (win.opener) {
        win = win.opener;
      } else {
        break;
      }
    }
    return win ? win.API : null;
  }

  function getAPI() {
    if (api) return api;
    api = findAPI(window);
    if (!api && window.opener) {
      api = findAPI(window.opener);
    }
    return api;
  }

  // SCORM wrapper object
  window.SCORM = {
    init: function() {
      var a = getAPI();
      if (!a) { console.warn('SCORM API not found'); return false; }
      var result = a.LMSInitialize('');
      initialized = (result === 'true' || result === true);
      if (initialized) {
        a.LMSSetValue('cmi.core.lesson_status', 'incomplete');
        a.LMSCommit('');
      }
      return initialized;
    },

    getValue: function(key) {
      var a = getAPI();
      if (!a || !initialized) return '';
      return a.LMSGetValue(key);
    },

    setValue: function(key, value) {
      var a = getAPI();
      if (!a || !initialized) return false;
      var result = a.LMSSetValue(key, String(value));
      return result === 'true' || result === true;
    },

    commit: function() {
      var a = getAPI();
      if (!a || !initialized) return false;
      return a.LMSCommit('');
    },

    finish: function() {
      var a = getAPI();
      if (!a || !initialized) return false;
      a.LMSCommit('');
      var result = a.LMSFinish('');
      initialized = false;
      return result === 'true' || result === true;
    },

    setComplete: function() {
      this.setValue('cmi.core.lesson_status', 'completed');
      this.commit();
    },

    setPassed: function() {
      this.setValue('cmi.core.lesson_status', 'passed');
      this.commit();
    },

    setFailed: function() {
      this.setValue('cmi.core.lesson_status', 'failed');
      this.commit();
    },

    setScore: function(score, min, max) {
      this.setValue('cmi.core.score.raw', score);
      if (min !== undefined) this.setValue('cmi.core.score.min', min);
      if (max !== undefined) this.setValue('cmi.core.score.max', max);
      this.commit();
    },

    setLocation: function(loc) {
      this.setValue('cmi.core.lesson_location', loc);
      this.commit();
    },

    getLocation: function() {
      return this.getValue('cmi.core.lesson_location');
    },

    setSuspendData: function(data) {
      this.setValue('cmi.suspend_data', data);
      this.commit();
    },

    getSuspendData: function() {
      return this.getValue('cmi.suspend_data');
    },

    setSessionTime: function(seconds) {
      var h = Math.floor(seconds / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = seconds % 60;
      var time = String(h).padStart(4, '0') + ':' +
                 String(m).padStart(2, '0') + ':' +
                 String(s).padStart(2, '0');
      this.setValue('cmi.core.session_time', time);
    }
  };
})();
`
}

/**
 * Returns the player JavaScript as a string.
 * Handles quiz scoring, tab switching, flashcards, drag-drop, matching, branching, and SCORM communication.
 */
export function getPlayerScript(): string {
  return `
// LuminaUDL SCORM Player
(function() {
  'use strict';

  var startTime = Date.now();
  var lessonId = document.body.getAttribute('data-lesson-id') || '';

  function getSuspendProgress() {
    try {
      var raw = SCORM.getSuspendData();
      return raw ? JSON.parse(raw) : { lessonProgress: {} };
    } catch(e) { return { lessonProgress: {} }; }
  }

  function saveSuspendProgress(progress) {
    try { SCORM.setSuspendData(JSON.stringify(progress)); } catch(e) {}
  }

  function getLessonProgress(progress, lid) {
    if (!progress.lessonProgress) progress.lessonProgress = {};
    if (!progress.lessonProgress[lid]) {
      progress.lessonProgress[lid] = { completed: false, quizScore: null, flashcardsMissed: null, matchingCompleted: false, dragdropCompleted: false };
    }
    return progress.lessonProgress[lid];
  }

  // Initialize SCORM on load
  function _initAll() {
    SCORM.init();

    // Restore bookmark
    var loc = SCORM.getLocation();
    if (loc) {
      var el = document.getElementById(loc);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    // Restore suspend data progress
    var suspendProgress = getSuspendProgress();
    getLessonProgress(suspendProgress, lessonId);
    saveSuspendProgress(suspendProgress);

    initEnrollment();
    initTabs();
    initFlashcards();
    initQuiz();
    initDragDrop();
    initMatching();
    initBranching();
    initAnimations();
    initAutoSave();
    initSaveForLater();
    initFileViewer();
    initIncompleteHighlighting();
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
      SCORM.setValue('cmi.core.student_name', name);
      SCORM.commit();
      overlay.style.display = 'none';
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initAll);
  } else {
    _initAll();
  }

  // Save session time before unload
  window.addEventListener('beforeunload', function() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    SCORM.setSessionTime(elapsed);
    SCORM.finish();
  });

  // Navigation
  window.scormNav = function(direction) {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    SCORM.setSessionTime(elapsed);
    SCORM.setComplete();
    SCORM.finish();
    // Navigation handled by LMS frameset
  };

  window.scormFinish = function() {
    SCORM.setComplete();
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    SCORM.setSessionTime(elapsed);
    SCORM.finish();
  };

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
                SCORM.setValue('cmi.core.lesson_status', 'incomplete');
                SCORM.setValue('cmi.core.score.raw', '0');
                SCORM.commit();
                window.location.reload();
              } else if (nextId) {
                SCORM.setComplete();
                SCORM.finish();
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
          if (type === 'short-answer' || type === 'likert') return; // Not auto-graded

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

        SCORM.setScore(score, 0, 100);
        if (passed) SCORM.setPassed(); else SCORM.setFailed();

        // Persist to suspend data
        var sp = getSuspendProgress();
        var lp = getLessonProgress(sp, lessonId);
        lp.quizScore = score;
        if (passed) lp.completed = true;
        saveSuspendProgress(sp);

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

  // Scroll-triggered block animations via IntersectionObserver
  function initAnimations() {
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
        observer.unobserve(el);
      });
    }, { threshold: 0.15 });

    blocks.forEach(function(el) { observer.observe(el); });
  }

  // Auto-save progress via SCORM suspend_data
  function initAutoSave() {
    var sp = getSuspendProgress();

    // Restore scroll position
    if (sp.scrollPositions && sp.scrollPositions[lessonId]) {
      var savedScroll = parseInt(sp.scrollPositions[lessonId]);
      if (savedScroll > 0) window.scrollTo(0, savedScroll);
    }

    // Periodically save scroll position
    var scrollTimer = null;
    window.addEventListener('scroll', function() {
      if (scrollTimer) clearTimeout(scrollTimer);
      scrollTimer = setTimeout(function() {
        var progress = getSuspendProgress();
        if (!progress.scrollPositions) progress.scrollPositions = {};
        progress.scrollPositions[lessonId] = String(window.scrollY);
        saveSuspendProgress(progress);
      }, 500);
    });

    // Auto-save on any input change
    document.addEventListener('change', function(e) {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) {
        var progress = getSuspendProgress();
        if (!progress.inputState) progress.inputState = {};
        if (!progress.inputState[lessonId]) progress.inputState[lessonId] = {};
        var el = e.target;
        var name = el.name || el.id || el.getAttribute('data-question');
        if (name) {
          progress.inputState[lessonId][name] = el.type === 'checkbox' || el.type === 'radio' ? el.checked + '|' + el.value : el.value;
          saveSuspendProgress(progress);
        }
      }
    });

    // Restore saved input state
    if (sp.inputState && sp.inputState[lessonId]) {
      var state = sp.inputState[lessonId];
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

  // Save for Later via SCORM suspend_data
  function initSaveForLater() {
    function getSaved() {
      var sp = getSuspendProgress();
      return sp.savedForLater || [];
    }
    function setSaved(items) {
      var sp = getSuspendProgress();
      sp.savedForLater = items;
      saveSuspendProgress(sp);
    }

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

  // Incomplete section highlighting on navigation
  function initIncompleteHighlighting() {
    var INTERACTIVE_TYPES = ['video', 'audio', 'quiz', 'accordion', 'drag-drop', 'flashcard', 'feedback-form', 'matching', 'tabs'];
    var nextBtn = document.getElementById('btn-next');
    if (!nextBtn) return;

    var originalOnclick = nextBtn.onclick;
    nextBtn.onclick = function(e) {
      var incompleteBlocks = [];
      INTERACTIVE_TYPES.forEach(function(type) {
        document.querySelectorAll('.block-' + type.replace('-', '')).forEach(function(block) {
          incompleteBlocks.push(block);
        });
        document.querySelectorAll('.block-' + type).forEach(function(block) {
          if (incompleteBlocks.indexOf(block) === -1) incompleteBlocks.push(block);
        });
      });

      var unfinished = [];
      incompleteBlocks.forEach(function(block) {
        if (block.classList.contains('block-quiz')) {
          var result = block.querySelector('.quiz-result');
          if (!result || result.hidden) unfinished.push(block);
          return;
        }
        if (block.classList.contains('block-dragdrop') || block.classList.contains('block-drag-drop')) {
          var unplaced = block.querySelectorAll('.dd-item:not(.placed)');
          if (unplaced.length > 0) unfinished.push(block);
          return;
        }
        if (block.classList.contains('block-matching')) {
          var unmatched = block.querySelectorAll('.match-left:not(.matched-correct)');
          if (unmatched.length > 0) unfinished.push(block);
          return;
        }
        if (block.classList.contains('block-feedback-form') || block.querySelector('.feedback-submit')) {
          var submitted = block.querySelector('.feedback-thankyou');
          if (!submitted || submitted.hidden) unfinished.push(block);
        }
      });

      if (unfinished.length > 0) {
        document.querySelectorAll('.block-incomplete-highlight').forEach(function(el) {
          el.classList.remove('block-incomplete-highlight');
        });
        unfinished.forEach(function(block) {
          block.classList.add('block-incomplete-highlight');
        });
        unfinished[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (e) { e.preventDefault(); e.stopPropagation(); }
        return false;
      }

      document.querySelectorAll('.block-incomplete-highlight').forEach(function(el) {
        el.classList.remove('block-incomplete-highlight');
      });
      if (originalOnclick) return originalOnclick.call(nextBtn, e);
    };
  }
})();
`
}
