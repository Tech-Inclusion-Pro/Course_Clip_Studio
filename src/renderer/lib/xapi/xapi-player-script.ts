/**
 * Returns the xAPI player JavaScript as a string.
 * Emits xAPI statements to a configured LRS endpoint.
 */

export function getXapiPlayerScript(): string {
  return `
// LuminaUDL xAPI Player
(function() {
  'use strict';

  var startTime = Date.now();
  var config = window.__XAPI_CONFIG__ || {};
  var endpoint = config.endpoint || '';
  var auth = config.auth || '';
  var actor = config.actor || { name: 'Learner', mbox: 'mailto:learner@example.com' };
  var activityId = config.activityId || window.location.href;
  var courseTitle = config.courseTitle || document.title;

  function sendStatement(verb, verbDisplay, extensions) {
    if (!endpoint) return;

    var statement = {
      actor: {
        objectType: 'Agent',
        name: actor.name,
        mbox: actor.mbox
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/' + verb,
        display: { 'en-US': verbDisplay }
      },
      object: {
        objectType: 'Activity',
        id: activityId,
        definition: {
          name: { 'en-US': courseTitle },
          type: 'http://adlnet.gov/expapi/activities/lesson'
        }
      },
      timestamp: new Date().toISOString()
    };

    if (extensions) {
      statement.result = extensions;
    }

    try {
      var xhr = new XMLHttpRequest();
      xhr.open('POST', endpoint + '/statements', true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('X-Experience-API-Version', '1.0.3');
      if (auth) xhr.setRequestHeader('Authorization', auth);
      xhr.send(JSON.stringify(statement));
    } catch (e) {
      console.warn('xAPI statement failed:', e);
    }
  }

  // Emit launched on load
  window.addEventListener('load', function() {
    sendStatement('launched', 'launched');
    sendStatement('initialized', 'initialized');
    initTabs();
    initFlashcards();
    initQuiz();
  });

  // Emit completed on unload
  window.addEventListener('beforeunload', function() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    var duration = 'PT' + elapsed + 'S';
    sendStatement('progressed', 'progressed', { duration: duration });
  });

  window.scormNav = function(direction) {
    sendStatement('completed', 'completed', {
      completion: true,
      duration: 'PT' + Math.floor((Date.now() - startTime) / 1000) + 'S'
    });
  };

  window.scormFinish = function() {
    sendStatement('completed', 'completed', {
      completion: true,
      duration: 'PT' + Math.floor((Date.now() - startTime) / 1000) + 'S'
    });
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

  // Quiz with xAPI statements
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

          // Send answered statement per question
          sendStatement('answered', 'answered', {
            success: !!isCorrect,
            response: selected ? selected.value : ''
          });

          if (showFeedback) {
            var fbCorrect = q.querySelector('.feedback-correct');
            var fbIncorrect = q.querySelector('.feedback-incorrect');
            if (isCorrect && fbCorrect) fbCorrect.hidden = false;
            if (!isCorrect && fbIncorrect) fbIncorrect.hidden = false;
          }
        });

        var score = total > 0 ? Math.round((correct / total) * 100) : 0;
        var passed = score >= passThreshold;
        var scaled = total > 0 ? correct / total : 0;

        // Send passed/failed statement
        var verb = passed ? 'passed' : 'failed';
        sendStatement(verb, verb, {
          score: { scaled: scaled, raw: score, min: 0, max: 100 },
          success: passed,
          completion: true
        });

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
