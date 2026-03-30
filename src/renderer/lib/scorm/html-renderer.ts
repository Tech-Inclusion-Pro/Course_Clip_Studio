/**
 * Renders course lessons to self-contained HTML pages for SCORM packaging.
 * Each lesson becomes one HTML file (one SCO).
 */

import type { Course, Lesson, ContentBlock, CourseTheme } from '@/types/course'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Render a content block to HTML string.
 */
function renderBlock(block: ContentBlock): string {
  switch (block.type) {
    case 'text':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-text">
  ${block.content}
</section>`

    case 'media':
      return `<figure role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-media">
  <img src="${escapeHtml(block.assetPath)}" alt="${escapeHtml(block.altText)}" loading="lazy" />
  ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
</figure>`

    case 'video':
      if (block.source === 'embed') {
        return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-video">
  <div class="video-embed"><iframe src="${escapeHtml(block.url)}" allowfullscreen title="${escapeHtml(block.ariaLabel)}"></iframe></div>
  ${block.transcript ? `<details class="transcript"><summary>View Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`
      }
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-video">
  <video controls aria-label="${escapeHtml(block.ariaLabel)}"${block.poster ? ` poster="${escapeHtml(block.poster)}"` : ''}>
    <source src="${escapeHtml(block.url)}" />
    ${block.captions.map((c) => `<track kind="captions" src="${escapeHtml(c.src)}" srclang="${escapeHtml(c.language)}" label="${escapeHtml(c.label)}"${c.isDefault ? ' default' : ''} />`).join('\n    ')}
  </video>
  ${block.transcript ? `<details class="transcript"><summary>View Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`

    case 'audio':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-audio">
  <audio controls aria-label="${escapeHtml(block.ariaLabel)}">
    <source src="${escapeHtml(block.assetPath)}" />
  </audio>
  ${block.transcript ? `<details class="transcript" open><summary>Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`

    case 'quiz':
      return renderQuiz(block)

    case 'accordion':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-accordion">
  ${block.items.map((item, i) => `<details${i === 0 ? ' open' : ''}>
    <summary>${escapeHtml(item.title)}</summary>
    <div class="accordion-content">${item.content}</div>
  </details>`).join('\n  ')}
</section>`

    case 'tabs':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-tabs">
  <div role="tablist">
    ${block.tabs.map((tab, i) => `<button role="tab" aria-selected="${i === 0}" data-tab="${i}">${escapeHtml(tab.label)}</button>`).join('\n    ')}
  </div>
  ${block.tabs.map((tab, i) => `<div role="tabpanel" data-panel="${i}"${i > 0 ? ' hidden' : ''}>${tab.content}</div>`).join('\n  ')}
</section>`

    case 'flashcard':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-flashcard">
  <div class="flashcard-deck" data-total="${block.cards.length}">
    ${block.cards.map((card, i) => `<div class="flashcard" data-index="${i}"${i > 0 ? ' hidden' : ''}>
      <div class="flashcard-front">${escapeHtml(card.front)}</div>
      <div class="flashcard-back" hidden>${escapeHtml(card.back)}</div>
      <button class="flip-btn" aria-label="Flip card">Flip</button>
    </div>`).join('\n    ')}
    <div class="flashcard-nav">
      <button class="prev-btn" disabled>Previous</button>
      <span class="card-counter">1 / ${block.cards.length}</span>
      <button class="next-btn"${block.cards.length <= 1 ? ' disabled' : ''}>Next</button>
    </div>
  </div>
</section>`

    case 'callout':
      return `<aside role="note" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-callout callout-${block.variant}">
  <div class="callout-content">${block.content}</div>
</aside>`

    case 'code':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-code">
  <pre><code class="language-${escapeHtml(block.language)}">${escapeHtml(block.code)}</code></pre>
</section>`

    case 'divider':
      return `<hr class="block block-divider divider-${block.style}" aria-hidden="true" />`

    case 'embed':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-embed">
  <iframe src="${escapeHtml(block.url)}" title="${escapeHtml(block.title || block.ariaLabel)}" sandbox="allow-scripts allow-same-origin"></iframe>
</section>`

    case 'h5p':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-h5p">
  <iframe src="${escapeHtml(block.embedUrl)}" title="${escapeHtml(block.ariaLabel)}" sandbox="allow-scripts allow-same-origin" allowfullscreen></iframe>
</section>`

    case 'branching':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-branching">
  <div class="scenario">${block.scenario}</div>
  <div class="choices" role="group" aria-label="Choose an option">
    ${block.choices.map((c) => `<button class="branch-choice" data-next="${c.nextLessonId ?? ''}">${escapeHtml(c.label)}</button>`).join('\n    ')}
  </div>
</section>`

    case 'custom-html':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-custom">
  <div class="custom-warning" role="alert">Custom content — accessibility may vary</div>
  <style>${block.css}</style>
  ${block.html}
</section>`

    case 'drag-drop':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-dragdrop">
  <p class="instruction">${escapeHtml(block.instruction)}</p>
  <div class="drag-items" role="group" aria-label="Draggable items">
    ${block.items.map((item) => `<div class="drag-item" draggable="true" data-id="${item.id}">${escapeHtml(item.label)}</div>`).join('\n    ')}
  </div>
  <div class="drop-zones" role="group" aria-label="Drop zones">
    ${block.zones.map((zone) => `<div class="drop-zone" data-id="${zone.id}" aria-label="${escapeHtml(zone.label)}">${escapeHtml(zone.label)}</div>`).join('\n    ')}
  </div>
</section>`

    case 'matching':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-matching">
  <p class="instruction">${escapeHtml(block.instruction)}</p>
  <div class="matching-columns">
    <div class="left-column" role="list" aria-label="Items to match">
      ${block.leftItems.map((item) => `<div class="match-item" role="listitem" data-id="${item.id}">${escapeHtml(item.label)}</div>`).join('\n      ')}
    </div>
    <div class="right-column" role="list" aria-label="Match targets">
      ${block.rightItems.map((item) => `<div class="match-item" role="listitem" data-id="${item.id}">${escapeHtml(item.label)}</div>`).join('\n      ')}
    </div>
  </div>
</section>`

    default:
      return `<!-- Unknown block type: ${(block as ContentBlock).type} -->`
  }
}

function renderQuiz(block: ContentBlock & { type: 'quiz' }): string {
  const questions = block.questions.map((q, qi) => {
    let choicesHtml = ''

    if (q.type === 'multiple-choice' || q.type === 'true-false') {
      choicesHtml = `<fieldset>
        <legend class="sr-only">Choices for question ${qi + 1}</legend>
        ${q.choices.map((c) => `<label class="quiz-choice">
          <input type="radio" name="q-${q.id}" value="${c.id}" data-correct="${c.isCorrect}" />
          <span>${escapeHtml(c.label)}</span>
        </label>`).join('\n        ')}
      </fieldset>`
    } else if (q.type === 'short-answer') {
      choicesHtml = `<label>
        <span class="sr-only">Your answer</span>
        <input type="text" class="short-answer" data-question="${q.id}" placeholder="Type your answer..." />
      </label>`
    } else if (q.type === 'likert') {
      choicesHtml = `<fieldset>
        <legend class="sr-only">Rate for question ${qi + 1}</legend>
        <div class="likert-scale">
          ${q.choices.map((c) => `<label class="likert-option">
            <input type="radio" name="q-${q.id}" value="${c.id}" />
            <span>${escapeHtml(c.label)}</span>
          </label>`).join('\n          ')}
        </div>
      </fieldset>`
    }

    return `<div class="quiz-question" data-type="${q.type}" data-id="${q.id}">
      <p class="question-prompt"><strong>Q${qi + 1}.</strong> ${escapeHtml(q.prompt)}</p>
      ${choicesHtml}
      <div class="feedback feedback-correct" hidden>${escapeHtml(q.feedbackCorrect)}</div>
      <div class="feedback feedback-incorrect" hidden>${escapeHtml(q.feedbackIncorrect)}</div>
    </div>`
  }).join('\n    ')

  return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-quiz" data-pass="${block.passThreshold}" data-feedback="${block.showFeedback}" data-retry="${block.allowRetry}">
    ${questions}
    <div class="quiz-actions">
      <button class="quiz-submit" type="button">Submit Answers</button>
    </div>
    <div class="quiz-result" hidden aria-live="polite"></div>
  </section>`
}

/**
 * Generate the full HTML page for a lesson.
 */
export function renderLessonHtml(
  course: Course,
  lesson: Lesson,
  moduleTitle: string,
  lessonIndex: number,
  totalLessons: number,
  options?: { inlineScript?: string }
): string {
  const theme = course.theme
  const settings = course.settings
  const blocks = lesson.blocks.map(renderBlock).join('\n\n    ')

  return `<!DOCTYPE html>
<html lang="${escapeHtml(course.meta.language || 'en')}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(lesson.title)} — ${escapeHtml(course.meta.title)}</title>
  <style>
    ${getPlayerStyles(theme)}
    ${theme.customCSS || ''}
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Player Shell Header -->
  <header class="player-header" style="background:${theme.playerShell.headerColor}">
    <div class="header-inner">
      <span class="course-title">${escapeHtml(course.meta.title)}</span>
      ${settings.showProgressBar ? `<div class="progress-bar" role="progressbar" aria-valuenow="${lessonIndex + 1}" aria-valuemin="1" aria-valuemax="${totalLessons}" aria-label="Course progress">
        <div class="progress-fill" style="width:${Math.round(((lessonIndex + 1) / totalLessons) * 100)}%;background:${theme.playerShell.progressBarColor}"></div>
      </div>` : ''}
      ${settings.showEstimatedTime ? `<span class="est-time">${course.meta.estimatedDuration} min</span>` : ''}
    </div>
  </header>

  <!-- Main Content -->
  <main id="main-content" class="lesson-content">
    <div class="lesson-header">
      <span class="module-label">${escapeHtml(moduleTitle)}</span>
      <h1>${escapeHtml(lesson.title)}</h1>
    </div>

    ${blocks}
  </main>

  <!-- Navigation Footer -->
  <footer class="player-footer">
    <nav class="lesson-nav" aria-label="Lesson navigation">
      ${lessonIndex > 0 ? '<button id="btn-prev" class="nav-btn" onclick="scormNav(-1)">← Previous</button>' : '<span></span>'}
      <span class="lesson-counter">${lessonIndex + 1} / ${totalLessons}</span>
      ${lessonIndex < totalLessons - 1
        ? '<button id="btn-next" class="nav-btn" onclick="scormNav(1)">Next →</button>'
        : '<button id="btn-finish" class="nav-btn nav-finish" onclick="scormFinish()">Complete Course</button>'}
    </nav>
  </footer>

  ${options?.inlineScript
    ? `<script>${options.inlineScript}</script>`
    : `<script src="scorm-api.js"></script>
  <script src="player.js"></script>`}
</body>
</html>`
}

function getPlayerStyles(theme: CourseTheme): string {
  const btnRadius = theme.playerShell.buttonStyle === 'pill' ? '999px' : theme.playerShell.buttonStyle === 'rounded' ? '8px' : '2px'

  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${theme.fontFamily || 'Arial, sans-serif'};
      font-size: 16px;
      line-height: 1.6;
      color: ${theme.textColor};
      background: ${theme.backgroundColor};
    }
    h1, h2, h3, h4 { font-family: ${theme.fontFamilyHeading || theme.fontFamily || 'Arial, sans-serif'}; }
    h1 { font-size: 28px; margin-bottom: 16px; }
    h2 { font-size: 22px; margin: 24px 0 12px; }
    h3 { font-size: 18px; margin: 20px 0 8px; }

    .skip-link {
      position: absolute; left: -9999px; top: 0; z-index: 100;
      background: ${theme.primaryColor}; color: #fff; padding: 8px 16px;
      text-decoration: none; font-weight: bold;
    }
    .skip-link:focus { left: 8px; top: 8px; }

    .player-header {
      position: sticky; top: 0; z-index: 50;
      padding: 12px 24px; color: #fff;
    }
    .header-inner {
      display: flex; align-items: center; justify-content: space-between;
      max-width: 960px; margin: 0 auto;
    }
    .course-title { font-size: 14px; font-weight: 600; }
    .progress-bar {
      flex: 1; max-width: 200px; height: 6px; margin: 0 16px;
      background: rgba(255,255,255,0.3); border-radius: 3px; overflow: hidden;
    }
    .progress-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
    .est-time { font-size: 12px; opacity: 0.8; }

    .lesson-content {
      max-width: 800px; margin: 0 auto; padding: 32px 24px 80px;
    }
    .lesson-header { margin-bottom: 32px; }
    .module-label {
      display: inline-block; font-size: 12px; font-weight: 600;
      color: ${theme.primaryColor}; text-transform: uppercase; letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .block { margin-bottom: 24px; }
    .block-media img { max-width: 100%; height: auto; border-radius: 8px; }
    figcaption { font-size: 13px; color: ${theme.textColor}80; margin-top: 8px; text-align: center; }

    .block-video video, .block-video iframe { width: 100%; aspect-ratio: 16/9; border-radius: 8px; border: none; }
    .block-audio audio { width: 100%; }
    .transcript { margin-top: 8px; font-size: 14px; }
    .transcript summary { cursor: pointer; font-weight: 600; color: ${theme.primaryColor}; }

    .block-callout {
      padding: 16px; border-radius: 8px; border-left: 4px solid;
    }
    .callout-info { background: #eff6ff; border-color: #3b82f6; }
    .callout-tip { background: #f0fdf4; border-color: #22c55e; }
    .callout-warning { background: #fffbeb; border-color: #f59e0b; }
    .callout-success { background: #f0fdf4; border-color: #16a34a; }

    .block-code pre {
      background: #1e1e2e; color: #cdd6f4; padding: 16px;
      border-radius: 8px; overflow-x: auto; font-size: 14px;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
    }

    details { border: 1px solid ${theme.textColor}20; border-radius: 8px; margin-bottom: 8px; }
    details summary {
      padding: 12px 16px; cursor: pointer; font-weight: 600;
      background: ${theme.surfaceColor}; border-radius: 8px;
    }
    details[open] summary { border-radius: 8px 8px 0 0; }
    details > div, .accordion-content { padding: 12px 16px; }

    .block-quiz { background: ${theme.surfaceColor}; padding: 24px; border-radius: 12px; }
    .quiz-question { margin-bottom: 20px; }
    .question-prompt { margin-bottom: 10px; font-size: 15px; }
    .quiz-choice { display: block; padding: 8px 12px; margin: 4px 0; cursor: pointer; border-radius: 6px; }
    .quiz-choice:hover { background: ${theme.primaryColor}10; }
    .quiz-choice input { margin-right: 8px; }
    .quiz-submit {
      background: ${theme.primaryColor}; color: #fff; border: none;
      padding: 10px 24px; border-radius: ${btnRadius}; cursor: pointer;
      font-size: 14px; font-weight: 600;
    }
    .quiz-submit:hover { opacity: 0.9; }
    .quiz-result { margin-top: 16px; padding: 12px; border-radius: 8px; font-weight: 600; }
    .feedback { font-size: 13px; padding: 8px; margin-top: 4px; border-radius: 4px; }
    .feedback-correct { background: #dcfce7; color: #166534; }
    .feedback-incorrect { background: #fee2e2; color: #991b1b; }

    .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }

    .player-footer {
      position: fixed; bottom: 0; left: 0; right: 0;
      background: ${theme.surfaceColor}; border-top: 1px solid ${theme.textColor}15;
      padding: 12px 24px; z-index: 50;
    }
    .lesson-nav {
      display: flex; align-items: center; justify-content: space-between;
      max-width: 800px; margin: 0 auto;
    }
    .nav-btn {
      background: ${theme.primaryColor}; color: #fff; border: none;
      padding: 8px 20px; border-radius: ${btnRadius}; cursor: pointer;
      font-size: 13px; font-weight: 600;
    }
    .nav-btn:hover { opacity: 0.9; }
    .nav-finish { background: ${theme.accentColor}; }
    .lesson-counter { font-size: 12px; color: ${theme.textColor}80; }

    .block-flashcard .flashcard { text-align: center; padding: 32px; min-height: 200px; border: 1px solid ${theme.textColor}20; border-radius: 12px; }
    .flip-btn { margin-top: 16px; padding: 6px 16px; border: 1px solid ${theme.primaryColor}; color: ${theme.primaryColor}; background: none; border-radius: ${btnRadius}; cursor: pointer; }
    .flashcard-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 12px; }
    .flashcard-nav button { padding: 4px 12px; border: 1px solid ${theme.textColor}30; border-radius: ${btnRadius}; background: none; cursor: pointer; }

    .block-matching .matching-columns { display: flex; gap: 24px; }
    .matching-columns > div { flex: 1; }
    .match-item { padding: 8px 12px; margin: 4px 0; border: 1px solid ${theme.textColor}20; border-radius: 6px; cursor: pointer; }
    .match-item:hover { background: ${theme.primaryColor}10; }

    .block-dragdrop .instruction { margin-bottom: 12px; font-weight: 600; }
    .drag-items { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .drag-item { padding: 8px 16px; background: ${theme.surfaceColor}; border: 1px solid ${theme.textColor}20; border-radius: 6px; cursor: grab; }
    .drop-zone { min-height: 60px; padding: 12px; border: 2px dashed ${theme.textColor}30; border-radius: 8px; margin-bottom: 8px; text-align: center; }

    [role="tablist"] { display: flex; border-bottom: 2px solid ${theme.textColor}15; margin-bottom: 12px; }
    [role="tab"] { padding: 8px 16px; border: none; background: none; cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    [role="tab"][aria-selected="true"] { border-bottom-color: ${theme.primaryColor}; color: ${theme.primaryColor}; }

    @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
    @media (max-width: 600px) {
      .lesson-content { padding: 16px 12px 80px; }
      .player-header { padding: 8px 12px; }
    }
  `
}
