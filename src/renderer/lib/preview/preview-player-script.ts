/**
 * Returns the preview player JavaScript as a string.
 * Unlike the SCORM player script, this uses postMessage for navigation
 * and quiz score reporting instead of the SCORM API.
 */

export function getPreviewPlayerScript(): string {
  return `
// LuminaUDL Preview Player
(function() {
  'use strict';

  // No-op SCORM shim so blocks that reference SCORM don't throw
  window.SCORM = {
    init: function() { return true; },
    getValue: function() { return ''; },
    setValue: function() { return true; },
    commit: function() { return true; },
    finish: function() { return true; },
    setComplete: function() {},
    setPassed: function() {},
    setFailed: function() {},
    setScore: function() {},
    setLocation: function() {},
    getLocation: function() { return ''; },
    setSuspendData: function() {},
    getSuspendData: function() { return ''; },
    setSessionTime: function() {}
  };

  // Check if enrollment is required and not yet completed
  function isEnrollmentBlocking() {
    var overlay = document.getElementById('enrollment-overlay');
    return overlay && overlay.style.display !== 'none';
  }

  // Navigation via postMessage to parent
  window.scormNav = function(direction) {
    if (isEnrollmentBlocking()) return;
    window.parent.postMessage({
      type: 'lumina:nav',
      direction: direction > 0 ? 'next' : 'prev'
    }, '*');
  };

  window.scormFinish = function() {
    if (isEnrollmentBlocking()) return;
    window.parent.postMessage({
      type: 'lumina:nav',
      direction: 'finish'
    }, '*');
  };

  // Bind navigation buttons via addEventListener (CSP may block inline onclick)
  function initNavigation() {
    var prevBtn = document.getElementById('btn-prev');
    var nextBtn = document.getElementById('btn-next');
    var finishBtn = document.getElementById('btn-finish');
    if (prevBtn) prevBtn.addEventListener('click', function() { window.scormNav(-1); });
    if (nextBtn) nextBtn.addEventListener('click', function() { window.scormNav(1); });
    if (finishBtn) finishBtn.addEventListener('click', function() { window.scormFinish(); });
  }

  // Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded.
  // NOTE: We avoid 'load' because srcDoc iframes may miss the load event.
  function _initAll() {
    initNavigation();
    initEnrollment();
    initTabs();
    initFlashcards();
    initQuiz();
    initDragDrop();
    initMatching();
    initBranching();
    initAnimations();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', _initAll);
  } else {
    _initAll();
  }

  // Enrollment overlay
  function initEnrollment() {
    var form = document.getElementById('enrollment-form');
    var overlay = document.getElementById('enrollment-overlay');
    if (!form || !overlay) return;
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var nameInput = document.getElementById('enrollment-name');
      var name = nameInput ? nameInput.value.trim() : '';
      if (!name) return;
      // Store learner name for certificate
      try { sessionStorage.setItem('lumina_learner_name', name); } catch(ex) {}
      // Report to parent
      window.parent.postMessage({ type: 'lumina:enrollment', learnerName: name, timestamp: new Date().toISOString() }, '*');
      // Hide overlay
      overlay.style.display = 'none';
    });
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

      // Click to flip
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
          // All cards reviewed
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
            // Move item into zone visually
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
          // Deselect previous
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
          // Mark chosen
          choices.forEach(function(c) { c.classList.remove('chosen'); });
          btn.classList.add('chosen');

          // Show consequence
          var consequence = btn.dataset.consequence;
          if (consequence && consequenceDiv) {
            consequenceDiv.textContent = consequence;
            consequenceDiv.hidden = false;
          }

          // Show continue button
          if (continueBtn) {
            continueBtn.hidden = false;
            var nextId = btn.dataset.next;
            var action = btn.dataset.action || 'navigate';
            continueBtn.onclick = function() {
              if (action === 'restart') {
                window.parent.postMessage({ type: 'lumina:restart' }, '*');
              } else if (nextId) {
                window.parent.postMessage({ type: 'lumina:nav', direction: 'next' }, '*');
              }
            };
          }
        });
      });
    });
  }

  // Quiz — reports scores via postMessage
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

        // Report to parent
        window.parent.postMessage({
          type: 'lumina:quiz-score',
          score: score,
          passed: passed
        }, '*');
      });
    });
  }
  // Scroll sync
  var _scrollSyncing = false;
  window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'lumina:scroll-sync') {
      _scrollSyncing = true;
      var el = document.documentElement;
      el.scrollTop = e.data.fraction * (el.scrollHeight - el.clientHeight);
      requestAnimationFrame(function() { _scrollSyncing = false; });
    }
  });
  window.addEventListener('scroll', function() {
    if (_scrollSyncing) return;
    var el = document.documentElement;
    var max = el.scrollHeight - el.clientHeight;
    var fraction = max > 0 ? el.scrollTop / max : 0;
    window.parent.postMessage({ type: 'lumina:scroll-sync', fraction: fraction }, '*');
  }, { passive: true });

  // Scroll-triggered block animations via IntersectionObserver
  function initAnimations() {
    // Use requestAnimationFrame to ensure DOM is fully painted in srcDoc iframes
    requestAnimationFrame(function() {
      var blocks = document.querySelectorAll('[data-anim]');
      if (blocks.length === 0) return;

      // If reduced motion is preferred, show all blocks immediately
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
          // Ensure opacity is set after animation completes as fallback
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
