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
      return data ? JSON.parse(data) : { visited: [], scores: {}, bookmarks: [] };
    } catch (e) { return { visited: [], scores: {}, bookmarks: [] }; }
  }

  function saveProgress(progress) {
    try { localStorage.setItem(storageKey, JSON.stringify(progress)); } catch (e) {}
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
    saveProgress(progress);
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
      saveProgress(p);
    },
    setPassed: function() {},
    setFailed: function() {},
    setScore: function(score) {
      var p = getProgress();
      p.scores[lessonId] = score;
      saveProgress(p);
    },
    setLocation: function() {},
    getLocation: function() { return ''; },
    setSuspendData: function() {},
    getSuspendData: function() { return ''; },
    setSessionTime: function() {}
  };

  window.addEventListener('load', function() {
    initTabs();
    initFlashcards();
    initQuiz();
    initNavigation();
  });

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

  // Flashcards
  function initFlashcards() {
    document.querySelectorAll('.flashcard-deck').forEach(function(deck) {
      var cards = deck.querySelectorAll('.flashcard');
      var counter = deck.querySelector('.card-counter');
      var prevBtn = deck.querySelector('.prev-btn');
      var nextBtn = deck.querySelector('.next-btn');
      var current = 0;

      deck.querySelectorAll('.flip-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var card = btn.closest('.flashcard');
          var back = card.querySelector('.flashcard-back');
          var front = card.querySelector('.flashcard-front');
          if (back.hidden) { back.hidden = false; front.hidden = true; }
          else { back.hidden = true; front.hidden = false; }
        });
      });

      function showCard(idx) {
        cards.forEach(function(c, i) { c.hidden = i !== idx; });
        current = idx;
        counter.textContent = (idx + 1) + ' / ' + cards.length;
        prevBtn.disabled = idx === 0;
        nextBtn.disabled = idx === cards.length - 1;
        var card = cards[idx];
        card.querySelector('.flashcard-front').hidden = false;
        card.querySelector('.flashcard-back').hidden = true;
      }

      if (prevBtn) prevBtn.addEventListener('click', function() { if (current > 0) showCard(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function() { if (current < cards.length - 1) showCard(current + 1); });
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
