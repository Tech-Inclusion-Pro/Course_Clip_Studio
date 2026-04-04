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
  var statementsKey = 'lumina_statements_' + courseId;
  var bookmarkKey = 'lumina_bookmark_' + courseId;
  var sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);

  // ─── Statement Logging ───
  function getStatements() {
    try { var d = localStorage.getItem(statementsKey); return d ? JSON.parse(d) : []; } catch(e) { return []; }
  }
  function saveStatements(stmts) {
    try { localStorage.setItem(statementsKey, JSON.stringify(stmts)); } catch(e) {}
  }
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

  function logStatement(verb, verbDisplay, objectId, objectName, extras) {
    var isUdlVerb = UDL_PRINCIPLES.hasOwnProperty(verb);
    var verbIri = isUdlVerb
      ? 'https://luminaudl.app/verbs/' + verb
      : 'http://adlnet.gov/expapi/verbs/' + verb;
    var udlPrinciple = (extras && extras.udlPrinciple) || (isUdlVerb ? UDL_PRINCIPLES[verb] : null);

    var stmt = {
      id: sessionId + '_' + Date.now(),
      actorId: getActorId(),
      verb: verbIri,
      verbDisplay: verbDisplay,
      objectId: objectId || (courseId + '/' + lessonId),
      objectType: extras && extras.objectType || 'lesson',
      objectName: objectName || '',
      udlPrinciple: udlPrinciple,
      blockId: extras && extras.blockId || null,
      blockType: extras && extras.blockType || null,
      scoreRaw: extras && extras.scoreRaw,
      scoreMax: extras && extras.scoreMax,
      scoreScaled: extras && extras.scoreScaled,
      success: extras && extras.success,
      completion: extras && extras.completion,
      durationSeconds: extras && extras.durationSeconds,
      timestamp: new Date().toISOString(),
      questionId: extras && extras.questionId || undefined,
      choiceId: extras && extras.choiceId || undefined,
      phase: extras && extras.phase || undefined,
      objectives: extras && extras.objectives || undefined,
      bankQuestionId: extras && extras.bankQuestionId || undefined,
      difficulty: extras && extras.difficulty || undefined,
      accessibilityMode: extras && extras.accessibilityMode || undefined
    };
    var stmts = getStatements();
    stmts.push(stmt);
    saveStatements(stmts);
  }
  function getActorId() {
    var key = 'lumina_actor_' + courseId;
    var id = '';
    try { id = localStorage.getItem(key) || ''; } catch(e) {}
    if (!id) {
      id = 'actor_' + Math.random().toString(36).slice(2, 10);
      try { localStorage.setItem(key, id); } catch(e) {}
    }
    return id;
  }

  // ─── Bookmark / Resume ───
  function getBookmark() {
    try { var d = localStorage.getItem(bookmarkKey); return d ? JSON.parse(d) : null; } catch(e) { return null; }
  }
  function saveBookmark() {
    var data = { lessonId: lessonId, scrollY: window.scrollY, timestamp: new Date().toISOString() };
    try { localStorage.setItem(bookmarkKey, JSON.stringify(data)); } catch(e) {}
  }
  function initBookmarkResume() {
    var bm = getBookmark();
    if (bm && bm.lessonId && bm.lessonId !== lessonId) {
      // Show resume banner at top
      var banner = document.createElement('div');
      banner.id = 'resume-banner';
      banner.setAttribute('role', 'alert');
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:9998;background:#1e293b;color:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;font-size:14px;box-shadow:0 2px 8px rgba(0,0,0,0.2);';
      banner.innerHTML = '<span>Resume where you left off?</span><div style="display:flex;gap:8px;"><button id="btn-resume" style="padding:6px 16px;border-radius:6px;background:#e11d8f;color:#fff;border:none;cursor:pointer;font-size:13px;">Resume</button><button id="btn-start-over" style="padding:6px 16px;border-radius:6px;background:transparent;color:#fff;border:1px solid #fff4;cursor:pointer;font-size:13px;">Start Over</button></div>';
      document.body.prepend(banner);

      document.getElementById('btn-resume').addEventListener('click', function() {
        logStatement('resumed', 'resumed', courseId + '/' + bm.lessonId, 'Resume session', { objectType: 'course' });
        // Navigate to bookmarked lesson — find nav btn with matching lesson id
        var navBtns = document.querySelectorAll('.nav-btn[data-lesson-id]');
        for (var i = 0; i < navBtns.length; i++) {
          if (navBtns[i].getAttribute('data-lesson-id') === bm.lessonId) {
            var href = navBtns[i].getAttribute('data-href') || navBtns[i].getAttribute('href');
            if (href) { window.location.href = href; return; }
          }
        }
        banner.remove();
      });
      document.getElementById('btn-start-over').addEventListener('click', function() {
        try { localStorage.removeItem(bookmarkKey); } catch(e) {}
        banner.remove();
      });
    } else if (bm && bm.lessonId === lessonId && bm.scrollY > 0) {
      // Same lesson — restore scroll position
      logStatement('resumed', 'resumed', courseId + '/' + lessonId, 'Resume lesson', { objectType: 'lesson' });
      setTimeout(function() { window.scrollTo(0, bm.scrollY); }, 100);
    }
  }

  // Save bookmark + suspended statement on page unload
  window.addEventListener('beforeunload', function() {
    saveBookmark();
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    logStatement('suspended', 'suspended', courseId + '/' + lessonId, 'Session suspended', { objectType: 'lesson', durationSeconds: elapsed });
  });

  // ─── Block View Tracking via IntersectionObserver ───
  function initBlockViewTracking() {
    var blocks = document.querySelectorAll('.block[data-block-id]');
    if (blocks.length === 0) return;
    var dwellTimers = {};
    var logged = {};

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var bid = entry.target.getAttribute('data-block-id');
        var btype = entry.target.getAttribute('data-block-type') || '';
        if (entry.isIntersecting) {
          if (!dwellTimers[bid]) {
            dwellTimers[bid] = setTimeout(function() {
              if (!logged[bid]) {
                logged[bid] = true;
                logStatement('experienced', 'experienced', courseId + '/' + lessonId + '/' + bid, entry.target.getAttribute('aria-label') || btype, { objectType: 'block', blockId: bid, blockType: btype });
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
        var btype = block ? (block.classList.contains('block-video') ? 'video' : block.classList.contains('block-audio') ? 'audio' : '') : '';
        logStatement('accessed-text-alternative', 'accessed text alternative', courseId + '/' + lessonId + '/' + (bid || ''), 'Transcript', { objectType: 'block', blockId: bid, blockType: btype, udlPrinciple: 'representation' });
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
        (function(track) {
          var origMode = track.mode;
          var interval = setInterval(function() {
            if (track.mode === 'showing' && origMode !== 'showing') {
              var key = bid || 'caption_' + i;
              if (!captionLogged[key]) {
                captionLogged[key] = true;
                logStatement('accessed-caption-track', 'accessed caption track', courseId + '/' + lessonId + '/' + (bid || ''), 'Captions', { objectType: 'block', blockId: bid, blockType: 'video', udlPrinciple: 'representation' });
              }
              clearInterval(interval);
            }
            origMode = track.mode;
          }, 1000);
        })(tracks[i]);
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
        logStatement('replayed-content', 'replayed content', courseId + '/' + lessonId + '/' + (bid || ''), 'Replay ' + btype, { objectType: 'block', blockId: bid, blockType: btype, udlPrinciple: 'engagement' });
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
    // Check if any captions are enabled by default
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
    // Screen reader hint: check for aria-live regions or known SR indicators
    mode.screenReaderActive = !!(document.querySelector('[role="log"][aria-live]') || (navigator.userAgent && /NVDA|JAWS|VoiceOver/i.test(navigator.userAgent)));
    return mode;
  }

  function _initAll() {
    var a11yMode = detectAccessibilityMode();
    logStatement('launched', 'launched', courseId, document.title, { objectType: 'course', accessibilityMode: a11yMode });
    initBookmarkResume();
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
    initMediaTracking();
    initIncompleteHighlighting();
    restoreCompletionIndicators();
    initBlockViewTracking();
    initTranscriptTracking();
    initCaptionTracking();
    initMediaReplayTracking();
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
        logStatement('progressed', 'progressed', courseId + '/' + lessonId, 'Navigate previous', { objectType: 'lesson' });
        var prev = document.body.getAttribute('data-prev-lesson');
        if (prev) window.location.href = prev;
      };
    }
    if (nextBtn) {
      nextBtn.onclick = function() {
        if (isEnrollmentBlocking()) return;
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        logStatement('completed', 'completed', courseId + '/' + lessonId, document.title, { objectType: 'lesson', completion: true, durationSeconds: elapsed });
        logStatement('progressed', 'progressed', courseId + '/' + lessonId, 'Navigate next', { objectType: 'lesson' });
        var next = document.body.getAttribute('data-next-lesson');
        if (next) window.location.href = next;
      };
    }
    if (finishBtn) {
      finishBtn.onclick = function() {
        if (isEnrollmentBlocking()) return;
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        logStatement('completed', 'completed', courseId, document.title, { objectType: 'course', completion: true, durationSeconds: elapsed });
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
          if (card.classList.contains('flipped')) {
            card.setAttribute('data-flipped', 'true');
            var deckId = deck.getAttribute('data-block-id') || '';
            logStatement('interacted', 'interacted', courseId + '/' + lessonId + '/' + deckId, 'Flashcard flip', { objectType: 'block', blockId: deckId, blockType: 'flashcard' });
          }
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

          var ddBlockId = block.getAttribute('data-block-id') || '';
          logStatement('interacted', 'interacted', courseId + '/' + lessonId + '/' + ddBlockId, 'Drag-drop placement', { objectType: 'block', blockId: ddBlockId, blockType: 'drag-drop', success: correct });

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
          var matchBlockId = block.getAttribute('data-block-id') || '';
          logStatement('interacted', 'interacted', courseId + '/' + lessonId + '/' + matchBlockId, 'Matching selection', { objectType: 'block', blockId: matchBlockId, blockType: 'matching', success: correct });
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
      var branchBlockId = block.getAttribute('data-block-id') || '';

      choices.forEach(function(btn) {
        btn.addEventListener('click', function() {
          choices.forEach(function(c) { c.classList.remove('chosen'); });
          btn.classList.add('chosen');

          // Log UDL chose-pathway statement
          var choiceLabel = btn.textContent || btn.getAttribute('data-choice') || 'Choice';
          logStatement('chose-pathway', 'chose pathway', courseId + '/' + lessonId + '/' + branchBlockId, choiceLabel.trim(), { objectType: 'block', blockId: branchBlockId, blockType: 'branching', udlPrinciple: 'engagement' });

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

        SCORM.setScore(score);

        // Log answered statements per question
        questions.forEach(function(q) {
          var qType = q.getAttribute('data-type');
          if (qType === 'short-answer' || qType === 'likert') return;
          var sel = q.querySelector('input:checked');
          var qCorrect = sel && sel.getAttribute('data-correct') === 'true';
          var qId = q.getAttribute('data-question') || q.getAttribute('data-id') || '';
          var choiceId = sel ? (sel.getAttribute('data-choice-id') || sel.value) : '';
          var bankQId = q.getAttribute('data-bank-question-id') || '';
          var difficulty = q.getAttribute('data-difficulty') || '';
          var promptEl = q.querySelector('.question-prompt');
          var extras = {
            objectType: 'block',
            blockId: quizBlockId,
            blockType: 'quiz',
            success: !!qCorrect,
            questionId: qId,
            choiceId: choiceId
          };
          if (quizPhase) extras.phase = quizPhase;
          if (quizObjectives.length > 0) extras.objectives = quizObjectives;
          if (bankQId) extras.bankQuestionId = bankQId;
          if (difficulty) extras.difficulty = difficulty;
          logStatement('answered', 'answered', courseId + '/' + lessonId + '/' + qId, promptEl ? promptEl.textContent : 'Question', extras);
        });

        // Log passed/failed statement
        var verb = passed ? 'passed' : 'failed';
        var passExtras = { objectType: 'block', blockId: quizBlockId, blockType: 'quiz', scoreRaw: score, scoreMax: 100, scoreScaled: scaled, success: passed, completion: true };
        if (quizPhase) passExtras.phase = quizPhase;
        if (quizObjectives.length > 0) passExtras.objectives = quizObjectives;
        logStatement(verb, verb, courseId + '/' + lessonId + '/' + quizBlockId, 'Quiz', passExtras);

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

    // Knowledge Check blocks — same scoring logic
    document.querySelectorAll('.block-knowledge-check').forEach(function(kc) {
      var submitBtn = kc.querySelector('.quiz-submit');
      var resultDiv = kc.querySelector('.quiz-result');
      var kcBlockId = kc.getAttribute('data-block-id') || '';
      var kcPhase = kc.getAttribute('data-phase') || '';
      var kcObjectivesRaw = kc.getAttribute('data-objectives') || '';
      var kcObjectives = kcObjectivesRaw ? kcObjectivesRaw.split('|') : [];

      if (!submitBtn) return;

      // Log attempted when KC first becomes visible
      var attemptLogged = false;
      var kcObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !attemptLogged) {
            attemptLogged = true;
            var extras = { objectType: 'block', blockId: kcBlockId, blockType: 'knowledge-check' };
            if (kcPhase) extras.phase = kcPhase;
            if (kcObjectives.length > 0) extras.objectives = kcObjectives;
            logStatement('attempted', 'attempted', courseId + '/' + lessonId + '/' + kcBlockId, 'Knowledge Check', extras);
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

          // Show feedback
          var fbCorrect = q.querySelector('.feedback-correct');
          var fbIncorrect = q.querySelector('.feedback-incorrect');
          if (isCorrect && fbCorrect) fbCorrect.hidden = false;
          if (!isCorrect && fbIncorrect) fbIncorrect.hidden = false;
        });

        var score = total > 0 ? Math.round((correct / total) * 100) : 0;
        var passed = score >= 70;
        var scaled = total > 0 ? correct / total : 0;

        // Log answered per question
        questions.forEach(function(q) {
          var qType = q.getAttribute('data-type');
          if (qType === 'short-answer') return;
          var sel = q.querySelector('input:checked');
          var qCorrect = sel && sel.getAttribute('data-correct') === 'true';
          var qId = q.getAttribute('data-question') || q.getAttribute('data-id') || '';
          var choiceId = sel ? (sel.getAttribute('data-choice-id') || sel.value) : '';
          var bankQId = q.getAttribute('data-bank-question-id') || '';
          var difficulty = q.getAttribute('data-difficulty') || '';
          var promptEl = q.querySelector('.question-prompt');
          var extras = {
            objectType: 'block',
            blockId: kcBlockId,
            blockType: 'knowledge-check',
            success: !!qCorrect,
            questionId: qId,
            choiceId: choiceId
          };
          if (kcPhase) extras.phase = kcPhase;
          if (kcObjectives.length > 0) extras.objectives = kcObjectives;
          if (bankQId) extras.bankQuestionId = bankQId;
          if (difficulty) extras.difficulty = difficulty;
          logStatement('answered', 'answered', courseId + '/' + lessonId + '/' + qId, promptEl ? promptEl.textContent : 'Question', extras);
        });

        // Log passed/failed
        var verb = passed ? 'passed' : 'failed';
        var passExtras = { objectType: 'block', blockId: kcBlockId, blockType: 'knowledge-check', scoreRaw: score, scoreMax: 100, scoreScaled: scaled, success: passed, completion: true };
        if (kcPhase) passExtras.phase = kcPhase;
        if (kcObjectives.length > 0) passExtras.objectives = kcObjectives;
        logStatement(verb, verb, courseId + '/' + lessonId + '/' + kcBlockId, 'Knowledge Check', passExtras);

        resultDiv.hidden = false;
        resultDiv.style.background = passed ? '#dcfce7' : '#fee2e2';
        resultDiv.style.color = passed ? '#166534' : '#991b1b';
        resultDiv.textContent = passed
          ? 'Good job! Score: ' + score + '%'
          : 'Score: ' + score + '%. Review the material and try again.';
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
          // Log UDL bookmarked statement
          logStatement('bookmarked', 'bookmarked', courseId + '/' + lessonId + '/' + blockId, btn.getAttribute('data-block-label') || 'Block', { objectType: 'block', blockId: blockId, blockType: btn.getAttribute('data-block-type') || '', udlPrinciple: 'engagement' });
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

  // Track media ended events for video/audio completion
  function initMediaTracking() {
    document.querySelectorAll('.block-video video, .block-audio audio').forEach(function(media) {
      media.addEventListener('ended', function() {
        var block = media.closest('.block');
        if (block) block.setAttribute('data-media-ended', 'true');
      });
    });
  }

  // Incomplete section highlighting on Next click
  function initIncompleteHighlighting() {
    if (document.body.getAttribute('data-interactive-required') !== 'true') return;

    var BLOCK_CHECKS = [
      { sel: '.block-quiz', check: function(b) { var r = b.querySelector('.quiz-result'); return !r || r.hidden; }, msg: 'Submit your answers to complete this quiz' },
      { sel: '.block-video', check: function(b) { if (b.querySelector('iframe')) return false; return b.getAttribute('data-media-ended') !== 'true'; }, msg: 'Watch the video to the end' },
      { sel: '.block-audio', check: function(b) { return b.getAttribute('data-media-ended') !== 'true'; }, msg: 'Listen to the audio to the end' },
      { sel: '.block-dragdrop', check: function(b) { return b.querySelectorAll('.dd-item:not(.placed)').length > 0; }, msg: 'Place all items in their correct zones' },
      { sel: '.block-flashcard', check: function(b) { var cards = b.querySelectorAll('.flashcard'); var allFlipped = true; cards.forEach(function(c) { if (c.getAttribute('data-flipped') !== 'true') allFlipped = false; }); return !allFlipped; }, msg: 'Flip through all flashcards' },
      { sel: '.block-matching', check: function(b) { return b.querySelectorAll('.match-left:not(.matched-correct)').length > 0; }, msg: 'Match all items correctly' },
      { sel: '.block-feedback-form', check: function(b) { var ty = b.querySelector('.feedback-thankyou'); return !ty || ty.hidden; }, msg: 'Submit the feedback form' }
    ];

    var nextBtn = document.getElementById('btn-next');
    var finishBtn = document.getElementById('btn-finish');

    function checkAndBlock(e, originalFn) {
      // Remove old highlights and tooltips
      document.querySelectorAll('.block-incomplete-highlight').forEach(function(el) { el.classList.remove('block-incomplete-highlight'); });
      document.querySelectorAll('.block-incomplete-tooltip').forEach(function(el) { el.remove(); });

      var unfinished = [];
      BLOCK_CHECKS.forEach(function(bc) {
        document.querySelectorAll(bc.sel).forEach(function(block) {
          if (bc.check(block)) unfinished.push({ block: block, msg: bc.msg });
        });
      });

      if (unfinished.length > 0) {
        unfinished.forEach(function(item) {
          item.block.classList.add('block-incomplete-highlight');
          var tip = document.createElement('div');
          tip.className = 'block-incomplete-tooltip';
          tip.textContent = item.msg;
          item.block.appendChild(tip);
        });
        unfinished[0].block.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (e) { e.preventDefault(); e.stopPropagation(); }
        return true;
      }
      return false;
    }

    if (nextBtn) {
      var origNext = nextBtn.onclick;
      nextBtn.onclick = function(e) {
        if (checkAndBlock(e)) return false;
        if (origNext) return origNext.call(nextBtn, e);
        var next = document.body.getAttribute('data-next-lesson');
        if (next) window.location.href = next;
      };
    }

    if (finishBtn) {
      var origFinish = finishBtn.onclick;
      finishBtn.onclick = function(e) {
        if (checkAndBlock(e)) return false;
        if (origFinish) return origFinish.call(finishBtn, e);
      };
    }
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
