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

  // Navigation via postMessage to parent
  window.scormNav = function(direction) {
    window.parent.postMessage({
      type: 'lumina:nav',
      direction: direction > 0 ? 'next' : 'prev'
    }, '*');
  };

  window.scormFinish = function() {
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

  // Flashcards — 3D flip
  function initFlashcards() {
    document.querySelectorAll('.flashcard-deck').forEach(function(deck) {
      var cards = deck.querySelectorAll('.flashcard');
      var counter = deck.querySelector('.card-counter');
      var prevBtn = deck.querySelector('.prev-btn');
      var nextBtn = deck.querySelector('.next-btn');
      var current = 0;

      // Click to flip
      cards.forEach(function(card) {
        card.addEventListener('click', function() {
          card.classList.toggle('flipped');
        });
      });

      function showCard(idx) {
        cards.forEach(function(c, i) {
          if (i !== idx) { c.classList.add('fc-hidden'); } else { c.classList.remove('fc-hidden'); }
        });
        current = idx;
        counter.textContent = (idx + 1) + ' / ' + cards.length;
        prevBtn.disabled = idx === 0;
        nextBtn.disabled = idx === cards.length - 1;
        // Reset flip state
        cards[idx].classList.remove('flipped');
      }

      if (prevBtn) prevBtn.addEventListener('click', function(e) { e.stopPropagation(); if (current > 0) showCard(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function(e) { e.stopPropagation(); if (current < cards.length - 1) showCard(current + 1); });
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
})();
`
}
