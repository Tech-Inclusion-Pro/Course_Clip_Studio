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

  // Navigation via data attributes
  function initNavigation() {
    var prevBtn = document.getElementById('btn-prev');
    var nextBtn = document.getElementById('btn-next');
    var finishBtn = document.getElementById('btn-finish');

    if (prevBtn) {
      prevBtn.onclick = function() {
        var prev = document.body.getAttribute('data-prev-lesson');
        if (prev) window.location.href = prev;
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function() {
        var next = document.body.getAttribute('data-next-lesson');
        if (next) window.location.href = next;
      };
    }
    if (finishBtn) {
      finishBtn.onclick = function() {
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
})();
`
}
