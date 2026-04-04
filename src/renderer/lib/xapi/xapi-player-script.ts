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

  // UDL verb principle lookup
  var UDL_PRINCIPLES = {
    'accessed-audio-alternative': 'representation',
    'accessed-text-alternative': 'representation',
    'accessed-visual-alternative': 'representation',
    'accessed-caption-track': 'representation',
    'switched-language': 'representation',
    'expanded-definition': 'representation',
    'used-extended-time': 'action-expression',
    'used-text-to-speech': 'action-expression',
    'submitted-drawing': 'action-expression',
    'submitted-audio-response': 'action-expression',
    'chose-pathway': 'engagement',
    'replayed-content': 'engagement',
    'bookmarked': 'engagement',
    'rated-difficulty': 'engagement'
  };

  function sendStatement(verb, verbDisplay, extensions) {
    if (!endpoint) return;

    var isUdlVerb = UDL_PRINCIPLES.hasOwnProperty(verb);
    var verbIri = isUdlVerb
      ? 'https://luminaudl.app/verbs/' + verb
      : 'http://adlnet.gov/expapi/verbs/' + verb;

    var statement = {
      actor: {
        objectType: 'Agent',
        name: actor.name,
        mbox: actor.mbox
      },
      verb: {
        id: verbIri,
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

    // Add UDL context if applicable
    if (isUdlVerb) {
      if (!statement.context) statement.context = {};
      if (!statement.context.extensions) statement.context.extensions = {};
      statement.context.extensions['https://luminaudl.app/context/udl-principle'] = UDL_PRINCIPLES[verb];
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

  var courseId = document.body.getAttribute('data-course-id') || 'lumina-course';
  var lessonId = document.body.getAttribute('data-lesson-id') || '';
  var localStatementsKey = 'lumina_xapi_statements_' + courseId;
  var bookmarkKey = 'lumina_xapi_bookmark_' + courseId;

  // Local statement storage alongside LRS POST
  function storeLocally(verb, verbDisplay, extensions) {
    try {
      var isUdlVerb = UDL_PRINCIPLES.hasOwnProperty(verb);
      var verbIri = isUdlVerb
        ? 'https://luminaudl.app/verbs/' + verb
        : 'http://adlnet.gov/expapi/verbs/' + verb;
      var stmts = JSON.parse(localStorage.getItem(localStatementsKey) || '[]');
      stmts.push({
        verb: verbIri,
        verbDisplay: verbDisplay,
        actorName: actor.name,
        activityId: activityId,
        timestamp: new Date().toISOString(),
        udlPrinciple: isUdlVerb ? UDL_PRINCIPLES[verb] : null,
        result: extensions || null,
        accessibilityMode: extensions && extensions.accessibilityMode || undefined
      });
      localStorage.setItem(localStatementsKey, JSON.stringify(stmts));
    } catch(e) {}
  }

  var origSendStatement = sendStatement;
  sendStatement = function(verb, verbDisplay, extensions) {
    origSendStatement(verb, verbDisplay, extensions);
    storeLocally(verb, verbDisplay, extensions);
  };

  // Block view tracking via IntersectionObserver
  function initBlockViewTracking() {
    var blocks = document.querySelectorAll('.block[data-block-id]');
    if (blocks.length === 0) return;
    var dwellTimers = {};
    var logged = {};
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var bid = entry.target.getAttribute('data-block-id');
        if (entry.isIntersecting) {
          if (!dwellTimers[bid]) {
            dwellTimers[bid] = setTimeout(function() {
              if (!logged[bid]) {
                logged[bid] = true;
                sendStatement('experienced', 'experienced', { extensions: { blockId: bid, blockType: entry.target.getAttribute('data-block-type') || '' } });
              }
            }, 3000);
          }
        } else {
          if (dwellTimers[bid]) { clearTimeout(dwellTimers[bid]); dwellTimers[bid] = null; }
        }
      });
    }, { threshold: 0.5 });
    blocks.forEach(function(b) { observer.observe(b); });
  }

  // ─── UDL Tracking: Transcript toggle ───
  function initTranscriptTracking() {
    var transcriptLogged = {};
    document.querySelectorAll('details.transcript').forEach(function(details) {
      details.addEventListener('toggle', function() {
        if (!details.open) return;
        var block = details.closest('.block');
        var bid = block ? block.getAttribute('data-block-id') : null;
        var key = bid || 'transcript_' + Math.random();
        if (transcriptLogged[key]) return;
        transcriptLogged[key] = true;
        sendStatement('accessed-text-alternative', 'accessed text alternative', { extensions: { blockId: bid, blockType: block ? (block.classList.contains('block-video') ? 'video' : 'audio') : '' } });
      });
    });
  }

  // ─── UDL Tracking: Caption enable ───
  function initCaptionTracking() {
    var captionLogged = {};
    document.querySelectorAll('.block-video video').forEach(function(video) {
      var tracks = video.textTracks;
      if (!tracks || tracks.length === 0) return;
      var block = video.closest('.block');
      var bid = block ? block.getAttribute('data-block-id') : null;

      for (var i = 0; i < tracks.length; i++) {
        (function(track, idx) {
          var origMode = track.mode;
          var interval = setInterval(function() {
            if (track.mode === 'showing' && origMode !== 'showing') {
              var key = bid || 'caption_' + idx;
              if (!captionLogged[key]) {
                captionLogged[key] = true;
                sendStatement('accessed-caption-track', 'accessed caption track', { extensions: { blockId: bid, blockType: 'video' } });
              }
              clearInterval(interval);
            }
            origMode = track.mode;
          }, 1000);
        })(tracks[i], i);
      }
    });
  }

  // ─── UDL Tracking: Media replay ───
  function initMediaReplayTracking() {
    document.querySelectorAll('.block-video video, .block-audio audio').forEach(function(media) {
      var hasEnded = false;
      media.addEventListener('ended', function() { hasEnded = true; });
      media.addEventListener('play', function() {
        if (!hasEnded) return;
        hasEnded = false;
        var block = media.closest('.block');
        var bid = block ? block.getAttribute('data-block-id') : null;
        var btype = media.tagName === 'VIDEO' ? 'video' : 'audio';
        sendStatement('replayed-content', 'replayed content', { extensions: { blockId: bid, blockType: btype } });
      });
    });
  }

  // ─── UDL Tracking: Branching choice logging ───
  function initBranchingTracking() {
    document.querySelectorAll('.block-branching').forEach(function(block) {
      var bid = block.getAttribute('data-block-id') || '';
      block.querySelectorAll('.branch-choice').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var choiceLabel = btn.textContent || 'Choice';
          sendStatement('chose-pathway', 'chose pathway', { extensions: { blockId: bid, blockType: 'branching', choice: choiceLabel.trim() } });
        });
      });
    });
  }

  // ─── UDL Tracking: Bookmark/save-for-later ───
  function initBookmarkTracking() {
    document.querySelectorAll('.sfl-save-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        if (btn.classList.contains('saved')) return; // only log on save, not unsave
        var blockId = btn.getAttribute('data-block-id') || '';
        sendStatement('bookmarked', 'bookmarked', { extensions: { blockId: blockId, blockType: btn.getAttribute('data-block-type') || '' } });
      });
    });
  }

  // ─── UDL Tracking: Accessibility mode detection ───
  function detectAccessibilityMode() {
    var mode = {};
    try {
      mode.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      mode.highContrast = window.matchMedia('(prefers-contrast: more)').matches || window.matchMedia('(-ms-high-contrast: active)').matches;
    } catch(e) {}
    var videos = document.querySelectorAll('video');
    for (var i = 0; i < videos.length; i++) {
      var tracks = videos[i].textTracks;
      if (tracks) {
        for (var j = 0; j < tracks.length; j++) {
          if (tracks[j].mode === 'showing') { mode.captionsEnabled = true; break; }
        }
      }
      if (mode.captionsEnabled) break;
    }
    mode.screenReaderActive = !!(document.querySelector('[role="log"][aria-live]') || (navigator.userAgent && /NVDA|JAWS|VoiceOver/i.test(navigator.userAgent)));
    return mode;
  }

  // Emit launched on load
  window.addEventListener('load', function() {
    // Check for bookmark/resume
    try {
      var bm = JSON.parse(localStorage.getItem(bookmarkKey) || 'null');
      if (bm && bm.lessonId === lessonId) {
        sendStatement('resumed', 'resumed');
      }
    } catch(e) {}
    var a11yMode = detectAccessibilityMode();
    sendStatement('launched', 'launched', { accessibilityMode: a11yMode });
    sendStatement('initialized', 'initialized');
    initTabs();
    initFlashcards();
    initQuiz();
    initBlockViewTracking();
    initTranscriptTracking();
    initCaptionTracking();
    initMediaReplayTracking();
    initBranchingTracking();
    initBookmarkTracking();
  });

  // Emit suspended on unload + save bookmark
  window.addEventListener('beforeunload', function() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    var duration = 'PT' + elapsed + 'S';
    sendStatement('suspended', 'suspended', { duration: duration });
    try {
      localStorage.setItem(bookmarkKey, JSON.stringify({ lessonId: lessonId, timestamp: new Date().toISOString() }));
    } catch(e) {}
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
      var quizBlockId = quiz.getAttribute('data-block-id') || '';
      var quizPhase = quiz.getAttribute('data-phase') || '';
      var quizObjectivesRaw = quiz.getAttribute('data-objectives') || '';
      var quizObjectives = quizObjectivesRaw ? quizObjectivesRaw.split('|') : [];

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

          // Send answered statement per question with assessment context
          var qId = q.getAttribute('data-question') || q.getAttribute('data-id') || '';
          var choiceId = selected ? (selected.getAttribute('data-choice-id') || selected.value) : '';
          var bankQId = q.getAttribute('data-bank-question-id') || '';
          var difficulty = q.getAttribute('data-difficulty') || '';
          var extensions = {
            success: !!isCorrect,
            response: selected ? selected.value : '',
            extensions: { blockId: quizBlockId, blockType: 'quiz', questionId: qId, choiceId: choiceId }
          };
          if (quizPhase) extensions.extensions.phase = quizPhase;
          if (quizObjectives.length > 0) extensions.extensions.objectives = quizObjectives;
          if (bankQId) extensions.extensions.bankQuestionId = bankQId;
          if (difficulty) extensions.extensions.difficulty = difficulty;
          sendStatement('answered', 'answered', extensions);

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
        var resultExt = {
          score: { scaled: scaled, raw: score, min: 0, max: 100 },
          success: passed,
          completion: true,
          extensions: { blockId: quizBlockId, blockType: 'quiz' }
        };
        if (quizPhase) resultExt.extensions.phase = quizPhase;
        if (quizObjectives.length > 0) resultExt.extensions.objectives = quizObjectives;
        sendStatement(verb, verb, resultExt);

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

    // Knowledge Check blocks
    document.querySelectorAll('.block-knowledge-check').forEach(function(kc) {
      var submitBtn = kc.querySelector('.quiz-submit');
      var resultDiv = kc.querySelector('.quiz-result');
      var kcBlockId = kc.getAttribute('data-block-id') || '';
      var kcPhase = kc.getAttribute('data-phase') || '';
      var kcObjectivesRaw = kc.getAttribute('data-objectives') || '';
      var kcObjectives = kcObjectivesRaw ? kcObjectivesRaw.split('|') : [];

      if (!submitBtn) return;

      // Log attempted when KC first visible
      var attemptLogged = false;
      var kcObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !attemptLogged) {
            attemptLogged = true;
            var ext = { extensions: { blockId: kcBlockId, blockType: 'knowledge-check' } };
            if (kcPhase) ext.extensions.phase = kcPhase;
            if (kcObjectives.length > 0) ext.extensions.objectives = kcObjectives;
            sendStatement('attempted', 'attempted', ext);
            kcObserver.disconnect();
          }
        });
      }, { threshold: 0.3 });
      kcObserver.observe(kc);

      submitBtn.addEventListener('click', function() {
        var questions = kc.querySelectorAll('.quiz-question');
        var correct = 0;
        var total = 0;

        questions.forEach(function(q) {
          var type = q.getAttribute('data-type');
          if (type === 'short-answer') return;
          total++;
          var selected = q.querySelector('input:checked');
          var isCorrect = selected && selected.getAttribute('data-correct') === 'true';
          if (isCorrect) correct++;

          var fbCorrect = q.querySelector('.feedback-correct');
          var fbIncorrect = q.querySelector('.feedback-incorrect');
          if (isCorrect && fbCorrect) fbCorrect.hidden = false;
          if (!isCorrect && fbIncorrect) fbIncorrect.hidden = false;

          var qId = q.getAttribute('data-question') || q.getAttribute('data-id') || '';
          var choiceId = selected ? (selected.getAttribute('data-choice-id') || selected.value) : '';
          var bankQId = q.getAttribute('data-bank-question-id') || '';
          var difficulty = q.getAttribute('data-difficulty') || '';
          var extensions = {
            success: !!isCorrect,
            response: selected ? selected.value : '',
            extensions: { blockId: kcBlockId, blockType: 'knowledge-check', questionId: qId, choiceId: choiceId }
          };
          if (kcPhase) extensions.extensions.phase = kcPhase;
          if (kcObjectives.length > 0) extensions.extensions.objectives = kcObjectives;
          if (bankQId) extensions.extensions.bankQuestionId = bankQId;
          if (difficulty) extensions.extensions.difficulty = difficulty;
          sendStatement('answered', 'answered', extensions);
        });

        var score = total > 0 ? Math.round((correct / total) * 100) : 0;
        var passed = score >= 70;
        var scaled = total > 0 ? correct / total : 0;

        var verb = passed ? 'passed' : 'failed';
        var resultExt = {
          score: { scaled: scaled, raw: score, min: 0, max: 100 },
          success: passed,
          completion: true,
          extensions: { blockId: kcBlockId, blockType: 'knowledge-check' }
        };
        if (kcPhase) resultExt.extensions.phase = kcPhase;
        if (kcObjectives.length > 0) resultExt.extensions.objectives = kcObjectives;
        sendStatement(verb, verb, resultExt);

        resultDiv.hidden = false;
        resultDiv.style.background = passed ? '#dcfce7' : '#fee2e2';
        resultDiv.style.color = passed ? '#166534' : '#991b1b';
        resultDiv.textContent = passed
          ? 'Good job! Score: ' + score + '%'
          : 'Score: ' + score + '%. Review the material and try again.';
      });
    });
  }
})();
`
}
