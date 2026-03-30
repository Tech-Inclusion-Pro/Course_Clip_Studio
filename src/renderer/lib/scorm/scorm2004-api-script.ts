/**
 * Returns the SCORM 2004 API wrapper JavaScript as a string.
 * SCORM 2004 uses API_1484_11 (not API), and different data model elements.
 */

export function getScorm2004ApiScript(): string {
  return `
// SCORM 2004 API Wrapper
(function() {
  'use strict';

  var api = null;
  var initialized = false;

  // Find the SCORM 2004 API (API_1484_11) in the window hierarchy
  function findAPI(win) {
    var attempts = 0;
    while (win && !win.API_1484_11 && attempts < 10) {
      attempts++;
      if (win.parent && win.parent !== win) {
        win = win.parent;
      } else if (win.opener) {
        win = win.opener;
      } else {
        break;
      }
    }
    return win ? win.API_1484_11 : null;
  }

  function getAPI() {
    if (api) return api;
    api = findAPI(window);
    if (!api && window.opener) {
      api = findAPI(window.opener);
    }
    return api;
  }

  // SCORM 2004 wrapper object
  window.SCORM = {
    version: '2004',

    init: function() {
      var a = getAPI();
      if (!a) { console.warn('SCORM 2004 API (API_1484_11) not found'); return false; }
      var result = a.Initialize('');
      initialized = (result === 'true' || result === true);
      if (initialized) {
        a.SetValue('cmi.completion_status', 'incomplete');
        a.SetValue('cmi.exit', 'suspend');
        a.Commit('');
      }
      return initialized;
    },

    getValue: function(key) {
      var a = getAPI();
      if (!a || !initialized) return '';
      return a.GetValue(key);
    },

    setValue: function(key, value) {
      var a = getAPI();
      if (!a || !initialized) return false;
      var result = a.SetValue(key, String(value));
      return result === 'true' || result === true;
    },

    commit: function() {
      var a = getAPI();
      if (!a || !initialized) return false;
      return a.Commit('');
    },

    finish: function() {
      var a = getAPI();
      if (!a || !initialized) return false;
      a.Commit('');
      var result = a.Terminate('');
      initialized = false;
      return result === 'true' || result === true;
    },

    setComplete: function() {
      this.setValue('cmi.completion_status', 'completed');
      this.commit();
    },

    setPassed: function() {
      this.setValue('cmi.success_status', 'passed');
      this.setValue('cmi.completion_status', 'completed');
      this.commit();
    },

    setFailed: function() {
      this.setValue('cmi.success_status', 'failed');
      this.commit();
    },

    setScore: function(score, min, max) {
      // SCORM 2004 uses cmi.score.scaled (0.0 to 1.0)
      var scaled = max > 0 ? score / max : 0;
      this.setValue('cmi.score.scaled', scaled.toFixed(2));
      this.setValue('cmi.score.raw', score);
      if (min !== undefined) this.setValue('cmi.score.min', min);
      if (max !== undefined) this.setValue('cmi.score.max', max);
      this.commit();
    },

    setLocation: function(loc) {
      this.setValue('cmi.location', loc);
      this.commit();
    },

    getLocation: function() {
      return this.getValue('cmi.location');
    },

    setSuspendData: function(data) {
      this.setValue('cmi.suspend_data', data);
      this.commit();
    },

    getSuspendData: function() {
      return this.getValue('cmi.suspend_data');
    },

    setSessionTime: function(seconds) {
      // SCORM 2004 uses ISO 8601 duration format: PT#H#M#S
      var h = Math.floor(seconds / 3600);
      var m = Math.floor((seconds % 3600) / 60);
      var s = seconds % 60;
      var time = 'PT' + h + 'H' + m + 'M' + s + 'S';
      this.setValue('cmi.session_time', time);
    }
  };
})();
`
}

/**
 * Returns the SCORM 2004 player script.
 * Same interactive logic as SCORM 1.2 player but calls the 2004-compatible SCORM wrapper.
 */
export function getScorm2004PlayerScript(): string {
  return `
// LuminaUDL SCORM 2004 Player
(function() {
  'use strict';

  var startTime = Date.now();

  window.addEventListener('load', function() {
    SCORM.init();

    var loc = SCORM.getLocation();
    if (loc) {
      var el = document.getElementById(loc);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }

    initTabs();
    initFlashcards();
    initQuiz();
  });

  window.addEventListener('beforeunload', function() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    SCORM.setSessionTime(elapsed);
    SCORM.finish();
  });

  window.scormNav = function(direction) {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    SCORM.setSessionTime(elapsed);
    SCORM.setComplete();
    SCORM.finish();
  };

  window.scormFinish = function() {
    SCORM.setComplete();
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    SCORM.setSessionTime(elapsed);
    SCORM.finish();
  };

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

        SCORM.setScore(score, 0, 100);
        if (passed) SCORM.setPassed(); else SCORM.setFailed();

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
