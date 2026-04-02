/**
 * Renders course lessons to self-contained HTML pages for SCORM packaging.
 * Each lesson becomes one HTML file (one SCO).
 */

import type { Course, Lesson, ContentBlock, CourseTheme, SlideElement } from '@/types/course'

/** Compute relative luminance of a hex color (WCAG formula). */
function luminance(hex: string): number {
  const h = hex.replace('#', '')
  const r = parseInt(h.substring(0, 2), 16) / 255
  const g = parseInt(h.substring(2, 4), 16) / 255
  const b = parseInt(h.substring(4, 6), 16) / 255
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4))
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
}

/** Ensure text has sufficient contrast (WCAG AA 4.5:1) against the background. */
function ensureContrast(textHex: string, bgHex: string): string {
  // Only process valid 6-digit hex colors
  if (!/^#[0-9a-fA-F]{6}$/.test(textHex) || !/^#[0-9a-fA-F]{6}$/.test(bgHex)) return textHex
  const bgLum = luminance(bgHex)
  const textLum = luminance(textHex)
  const ratio = (Math.max(bgLum, textLum) + 0.05) / (Math.min(bgLum, textLum) + 0.05)
  if (ratio >= 4.5) return textHex
  return bgLum > 0.5 ? '#1e293b' : '#f8fafc'
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function renderSlideElement(el: SlideElement): string {
  const posStyle = `position: absolute; left: ${el.x}px; top: ${el.y}px; width: ${el.width}px; height: ${el.height}px;`
  switch (el.type) {
    case 'button':
      return `<a href="${escapeHtml(el.data.buttonUrl || '#')}" class="slide-btn" style="${posStyle}" target="_blank" rel="noopener">${escapeHtml(el.data.buttonLabel || 'Button')}</a>`
    case 'text':
      return `<div style="${posStyle} display:flex; align-items:center; padding:8px; font-size:14px;">${escapeHtml(el.data.textContent || '')}</div>`
    case 'image':
      return `<img src="${escapeHtml(el.data.imagePath || '')}" alt="${escapeHtml(el.data.imageAlt || '')}" style="${posStyle} object-fit:contain;" />`
    case 'embed':
      return `<iframe src="${escapeHtml(el.data.embedUrl || '')}" title="${escapeHtml(el.data.embedTitle || 'Embed')}" style="${posStyle} border:none;" sandbox="allow-scripts allow-same-origin"></iframe>`
    case 'quiz':
      return `<div style="${posStyle} display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.9); border-radius:8px; padding:12px; font-size:13px;">${escapeHtml(el.data.quizPrompt || 'Quiz element')}</div>`
    case 'matching':
      return `<div style="${posStyle} display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.9); border-radius:8px; padding:12px; font-size:13px;">Matching (${el.data.matchingPairs?.length || 0} pairs)</div>`
    default:
      return ''
  }
}

/**
 * Build data attributes + initial hidden style for scroll-triggered animations.
 * The actual animation is triggered by IntersectionObserver in the player scripts.
 */
function getAnimationStyle(block: ContentBlock): string {
  const anim = block.animation
  if (!anim || anim.type === 'none') return ''
  return ` style="opacity:0;" data-anim="${anim.type}" data-anim-duration="${anim.duration}" data-anim-delay="${anim.delay}"`
}

/** Build an animation class if the block has an animation. */
function getAnimationClass(block: ContentBlock): string {
  const anim = block.animation
  if (!anim || anim.type === 'none') return ''
  return ' anim-pending'
}

/**
 * Render a content block to HTML string.
 */
function renderBlock(block: ContentBlock): string {
  const animStyle = getAnimationStyle(block)
  const animClass = getAnimationClass(block)
  let html = renderBlockInner(block, animStyle, animClass)

  // Append per-block feedback if present
  if (block.feedback) {
    html += `\n<details class="block-feedback"><summary>Feedback</summary><div>${escapeHtml(block.feedback)}</div></details>`
  }

  return html
}

function renderBlockInner(block: ContentBlock, animStyle: string, animClass: string): string {
  switch (block.type) {
    case 'text':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-text${animClass}"${animStyle}>
  ${block.content}
</section>`

    case 'media':
      return `<figure role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-media${animClass}"${animStyle}>
  <img src="${escapeHtml(block.assetPath)}" alt="${escapeHtml(block.altText)}" loading="lazy" />
  ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
</figure>`

    case 'video':
      if (block.source === 'embed') {
        return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-video${animClass}"${animStyle}>
  <div class="video-embed"><iframe src="${escapeHtml(block.url)}" allowfullscreen title="${escapeHtml(block.ariaLabel)}"></iframe></div>
  ${block.transcript ? `<details class="transcript"><summary>View Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`
      }
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-video${animClass}"${animStyle}>
  <video controls aria-label="${escapeHtml(block.ariaLabel)}"${block.poster ? ` poster="${escapeHtml(block.poster)}"` : ''}>
    <source src="${escapeHtml(block.url)}" />
    ${block.captions.map((c) => `<track kind="captions" src="${escapeHtml(c.src)}" srclang="${escapeHtml(c.language)}" label="${escapeHtml(c.label)}"${c.isDefault ? ' default' : ''} />`).join('\n    ')}
  </video>
  ${block.transcript ? `<details class="transcript"><summary>View Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`

    case 'audio':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-audio${animClass}"${animStyle}>
  <audio controls aria-label="${escapeHtml(block.ariaLabel)}">
    <source src="${escapeHtml(block.assetPath)}" />
  </audio>
  ${block.transcript ? `<details class="transcript" open><summary>Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`

    case 'quiz':
      return renderQuiz(block, animStyle, animClass)

    case 'accordion':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-accordion${animClass}"${animStyle}>
  ${block.items.map((item, i) => `<details${i === 0 ? ' open' : ''}>
    <summary>${escapeHtml(item.title)}</summary>
    <div class="accordion-content">${item.content}</div>
  </details>`).join('\n  ')}
</section>`

    case 'tabs':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-tabs${animClass}"${animStyle}>
  <div role="tablist">
    ${block.tabs.map((tab, i) => `<button role="tab" aria-selected="${i === 0}" data-tab="${i}">${escapeHtml(tab.label)}</button>`).join('\n    ')}
  </div>
  ${block.tabs.map((tab, i) => `<div role="tabpanel" data-panel="${i}"${i > 0 ? ' hidden' : ''}>${tab.content}</div>`).join('\n  ')}
</section>`

    case 'flashcard':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-flashcard${animClass}"${animStyle}>
  <div class="flashcard-deck" data-total="${block.cards.length}">
    ${block.cards.map((card, i) => `<div class="flashcard${i > 0 ? ' fc-hidden' : ''}" data-index="${i}">
      <div class="flashcard-inner">
        <div class="flashcard-front">${escapeHtml(card.front)}</div>
        <div class="flashcard-back">${escapeHtml(card.back)}</div>
      </div>
    </div>`).join('\n    ')}
    <div class="fc-self-test" style="display:none;">
      <button class="fc-got-it">Got It</button>
      <button class="fc-review">Review Again</button>
    </div>
    <div class="flashcard-nav">
      <button class="prev-btn" disabled>Previous</button>
      <span class="card-counter">1 / ${block.cards.length}</span>
      <button class="next-btn"${block.cards.length <= 1 ? ' disabled' : ''}>Next</button>
    </div>
    <button class="fc-review-missed" style="display:none;">Review Missed (0)</button>
  </div>
</section>`

    case 'callout':
      return `<aside role="note" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-callout callout-${block.variant}${animClass}"${animStyle}>
  <div class="callout-content">${block.content}</div>
</aside>`

    case 'code':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-code${animClass}"${animStyle}>
  <pre><code class="language-${escapeHtml(block.language)}">${escapeHtml(block.code)}</code></pre>
</section>`

    case 'divider':
      return `<hr class="block block-divider divider-${block.style}" aria-hidden="true" />`

    case 'embed':
      if (block.display === 'new-tab') {
        return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-embed${animClass}"${animStyle}>
  <a href="${escapeHtml(block.url)}" target="_blank" rel="noopener noreferrer" class="embed-link">${escapeHtml(block.title || block.url)}</a>
</section>`
      }
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-embed${animClass}"${animStyle}>
  <iframe src="${escapeHtml(block.url)}" title="${escapeHtml(block.title || block.ariaLabel)}" sandbox="allow-scripts allow-same-origin"></iframe>
</section>`

    case 'h5p':
      if (block.display === 'new-tab') {
        return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-h5p${animClass}"${animStyle}>
  <a href="${escapeHtml(block.embedUrl)}" target="_blank" rel="noopener noreferrer" class="embed-link">${escapeHtml(block.ariaLabel || 'Open H5P Content')}</a>
</section>`
      }
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-h5p${animClass}"${animStyle}>
  <iframe src="${escapeHtml(block.embedUrl)}" title="${escapeHtml(block.ariaLabel)}" sandbox="allow-scripts allow-same-origin" allowfullscreen></iframe>
</section>`

    case 'branching':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-branching${animClass}"${animStyle}>
  <div class="scenario">${block.scenario}</div>
  <div class="choices" role="group" aria-label="Choose an option">
    ${block.choices.map((c) => `<button class="branch-choice" data-next="${c.nextLessonId ?? ''}" data-consequence="${escapeHtml(c.consequence)}" data-action="${c.action ?? 'navigate'}">${escapeHtml(c.label)}${c.action === 'restart' ? ' ↺' : ''}</button>`).join('\n    ')}
  </div>
  <div class="branch-consequence" hidden></div>
  <button class="branch-continue" hidden>Continue</button>
</section>`

    case 'custom-html':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-custom${animClass}"${animStyle}>
  <div class="custom-warning" role="alert">Custom content — accessibility may vary</div>
  <style>${block.css}</style>
  ${block.html}
</section>`

    case 'drag-drop':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-dragdrop${animClass}"${animStyle}>
  <p class="instruction">${escapeHtml(block.instruction)}</p>
  <div class="drag-items" role="group" aria-label="Draggable items">
    ${block.items.map((item) => `<div class="dd-item" draggable="true" data-id="${item.id}" data-pair="${item.correctZoneId}">${escapeHtml(item.label)}</div>`).join('\n    ')}
  </div>
  <div class="drop-zones" role="group" aria-label="Drop zones">
    ${block.zones.map((zone) => `<div class="dd-zone" data-id="${zone.id}" data-pair="${zone.id}" aria-label="${escapeHtml(zone.label)}">${escapeHtml(zone.label)}</div>`).join('\n    ')}
  </div>
</section>`

    case 'matching': {
      const pairMap = new Map<string, string>()
      for (const p of block.correctPairs) {
        pairMap.set(p.leftId, p.rightId)
        pairMap.set(p.rightId, p.leftId)
      }
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-matching${animClass}" data-pairs='${escapeHtml(JSON.stringify(block.correctPairs))}'${animStyle}>
  <p class="instruction">${escapeHtml(block.instruction)}</p>
  <div class="matching-columns">
    <div class="left-column" role="list" aria-label="Items to match">
      ${block.leftItems.map((item) => `<div class="match-item match-left" role="listitem" data-id="${item.id}" data-pair="${pairMap.get(item.id) ?? ''}">${escapeHtml(item.label)}</div>`).join('\n      ')}
    </div>
    <div class="right-column" role="list" aria-label="Match targets">
      ${block.rightItems.map((item) => `<div class="match-item match-right" role="listitem" data-id="${item.id}" data-pair="${pairMap.get(item.id) ?? ''}">${escapeHtml(item.label)}</div>`).join('\n      ')}
    </div>
  </div>
</section>`
    }

    case 'slide': {
      const bgStyle = [
        `background-color: ${block.backgroundColor || '#ffffff'}`,
        block.backgroundImage ? `background-image: url('${escapeHtml(block.backgroundImage)}'); background-size: cover; background-position: center` : ''
      ].filter(Boolean).join('; ')
      const elements = block.elements.map((el) => renderSlideElement(el)).join('\n      ')
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-slide" style="${bgStyle}">
  <div class="slide-container">
      ${elements}
  </div>
</section>`
    }

    default:
      return `<!-- Unknown block type: ${(block as ContentBlock).type} -->`
  }
}

function renderCompletionCriteria(lesson: Lesson): string {
  const c = lesson.completionCriteria
  if (!c) return ''
  const items: string[] = []
  if (c.quizPassRequired) items.push(`Pass the quiz with a score of ${c.quizPassScore}% or higher`)
  if (c.interactiveRequired) items.push('Complete all interactive activities')
  if (c.minimumTimeSeconds > 0) {
    const mins = Math.floor(c.minimumTimeSeconds / 60)
    const secs = c.minimumTimeSeconds % 60
    items.push(`Spend at least ${mins > 0 ? `${mins} minute${mins !== 1 ? 's' : ''}` : ''}${mins > 0 && secs > 0 ? ' and ' : ''}${secs > 0 ? `${secs} second${secs !== 1 ? 's' : ''}` : ''} on this lesson`)
  }
  if (items.length === 0) return ''
  return `<aside class="completion-criteria" role="note" aria-label="Completion requirements">
  <div class="criteria-header">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
    <strong>To complete this lesson:</strong>
  </div>
  <ul>${items.map((i) => `<li>${i}</li>`).join('')}</ul>
</aside>`
}

function renderQuiz(block: ContentBlock & { type: 'quiz' }, animStyle: string = '', animClass: string = ''): string {
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

  return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-quiz${animClass}" data-pass="${block.passThreshold}" data-feedback="${block.showFeedback}" data-retry="${block.allowRetry}"${animStyle}>
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
<body data-course-id="${course.id}" data-lesson-id="${lesson.id}">
  <a href="#main-content" class="skip-link">Skip to main content</a>

  ${settings.enrollmentPage && lessonIndex === 0 ? `<!-- Enrollment Overlay -->
  <div id="enrollment-overlay" style="position:fixed;inset:0;z-index:9999;background:${theme.backgroundColor};display:flex;align-items:center;justify-content:center;">
    <div style="max-width:420px;width:90%;padding:40px;background:${theme.surfaceColor};border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12);text-align:center;">
      ${theme.logoPath ? `<img src="${escapeHtml(theme.logoPath)}" alt="Logo" style="max-height:60px;margin-bottom:20px;" />` : ''}
      <h1 style="font-family:${theme.fontFamilyHeading || theme.fontFamily};font-size:22px;color:${theme.textColor};margin-bottom:8px;">${escapeHtml(course.meta.title)}</h1>
      <p style="font-size:14px;color:${theme.textColor}aa;margin-bottom:24px;">${escapeHtml(course.meta.description || 'Welcome! Please enter your name to begin.')}</p>
      <form id="enrollment-form" style="text-align:left;">
        <label style="display:block;font-size:13px;font-weight:600;color:${theme.textColor};margin-bottom:6px;">Your Name</label>
        <input id="enrollment-name" type="text" required placeholder="Enter your full name" style="width:100%;padding:10px 14px;font-size:15px;border:2px solid ${theme.textColor}20;border-radius:8px;background:${theme.backgroundColor};color:${theme.textColor};outline:none;box-sizing:border-box;margin-bottom:16px;" />
        <button type="submit" style="width:100%;padding:12px;font-size:15px;font-weight:600;background:${theme.primaryColor};color:#fff;border:none;border-radius:8px;cursor:pointer;">Begin Course</button>
      </form>
    </div>
  </div>` : ''}

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

    ${renderCompletionCriteria(lesson)}
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
  const blockBg = theme.blockBackgroundColor || theme.surfaceColor
  const blockText = ensureContrast(theme.blockTextColor || theme.textColor, blockBg)
  const bodyText = ensureContrast(theme.textColor, theme.backgroundColor)
  const footerText = ensureContrast(theme.textColor, blockBg)

  return `
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${theme.fontFamily || 'Arial, sans-serif'};
      font-size: 16px;
      line-height: 1.6;
      color: ${bodyText};
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
      color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; text-transform: uppercase; letter-spacing: 0.05em;
      margin-bottom: 4px;
    }

    .block { margin-bottom: 24px; }
    .block-media img { max-width: 100%; height: auto; border-radius: 8px; }
    figcaption { font-size: 13px; color: ${bodyText}; opacity: 0.85; margin-top: 8px; text-align: center; }

    .block-video video, .block-video iframe { width: 100%; aspect-ratio: 16/9; border-radius: 8px; border: none; }
    .block-audio audio { width: 100%; }
    .transcript { margin-top: 8px; font-size: 14px; }
    .transcript summary { cursor: pointer; font-weight: 600; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; }

    .block-callout {
      padding: 16px; border-radius: 8px; border-left: 4px solid; color: #1e293b;
    }
    .callout-info { background: #eff6ff; border-color: #3b82f6; color: #1e3a5f; }
    .callout-tip { background: #f0fdf4; border-color: #22c55e; color: #14532d; }
    .callout-warning { background: #fffbeb; border-color: #f59e0b; color: #713f12; }
    .callout-success { background: #f0fdf4; border-color: #16a34a; color: #14532d; }
    .callout-danger { background: #fef2f2; border-color: #ef4444; color: #7f1d1d; }

    .embed-link {
      display: inline-flex; align-items: center; gap: 8px; padding: 12px 20px;
      border: 2px solid ${theme.primaryColor}; border-radius: 8px; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)};
      text-decoration: none; font-weight: 600; font-size: 14px; transition: all 0.2s;
    }
    .embed-link:hover { background: ${theme.primaryColor}10; }
    .embed-link::after { content: '\\2197'; }

    .block-code pre {
      background: #1e1e2e; color: #cdd6f4; padding: 16px;
      border-radius: 8px; overflow-x: auto; font-size: 14px;
      font-family: 'JetBrains Mono', 'Courier New', monospace;
    }

    details { border: 1px solid ${theme.textColor}20; border-radius: 8px; margin-bottom: 8px; }
    details summary {
      padding: 12px 16px; cursor: pointer; font-weight: 600;
      background: ${blockBg}; color: ${blockText}; border-radius: 8px;
    }
    details[open] summary { border-radius: 8px 8px 0 0; }
    details > div, .accordion-content { padding: 12px 16px; }

    .block-quiz { background: ${blockBg}; color: ${blockText}; padding: 24px; border-radius: 12px; }
    .quiz-question { margin-bottom: 20px; }
    .question-prompt { margin-bottom: 10px; font-size: 15px; color: ${blockText}; }
    .quiz-choice { display: block; padding: 8px 12px; margin: 4px 0; cursor: pointer; border-radius: 6px; color: ${blockText}; }
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
      background: ${blockBg}; color: ${footerText}; border-top: 1px solid ${footerText}15;
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
    .lesson-counter { font-size: 12px; color: ${footerText}; opacity: 0.85; }

    /* Flashcard 3D flip */
    .block-flashcard .flashcard { perspective: 1000px; cursor: pointer; min-height: 200px; margin-bottom: 8px; }
    .flashcard-inner { transition: transform 0.6s; transform-style: preserve-3d; -webkit-transform-style: preserve-3d; position: relative; min-height: 200px; width: 100%; }
    .flashcard.flipped .flashcard-inner { transform: rotateY(180deg); }
    .flashcard-front, .flashcard-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; display: flex; align-items: center; justify-content: center; padding: 32px; border: 1px solid ${theme.textColor}20; border-radius: 12px; text-align: center; min-height: 200px; width: 100%; position: absolute; inset: 0; }
    .flashcard-front { background: ${blockBg}; color: ${blockText}; z-index: 2; }
    .flashcard-back { transform: rotateY(180deg); background: ${blockBg}; color: ${blockText}; z-index: 1; }
    .flashcard.fc-hidden { display: none; }
    .flashcard-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 12px; }
    .flashcard-nav button { padding: 4px 12px; border: 1px solid ${theme.textColor}30; border-radius: ${btnRadius}; background: none; color: ${theme.textColor}; cursor: pointer; }
    .fc-self-test { display: flex; justify-content: center; gap: 12px; margin-top: 12px; }
    .fc-got-it { padding: 8px 20px; border: none; border-radius: ${btnRadius}; background: #22c55e; color: #fff; font-weight: 600; cursor: pointer; font-size: 14px; }
    .fc-got-it:hover { opacity: 0.9; }
    .fc-review { padding: 8px 20px; border: none; border-radius: ${btnRadius}; background: #f59e0b; color: #fff; font-weight: 600; cursor: pointer; font-size: 14px; }
    .fc-review:hover { opacity: 0.9; }
    .fc-review-missed { display: block; margin: 16px auto 0; padding: 10px 24px; border: 2px solid ${theme.primaryColor}; border-radius: ${btnRadius}; background: ${theme.primaryColor}10; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; font-weight: 600; cursor: pointer; font-size: 14px; }
    .fc-review-missed:hover { background: ${theme.primaryColor}20; }

    /* Matching — click-to-select */
    .block-matching .matching-columns { display: flex; gap: 24px; }
    .matching-columns > div { flex: 1; }
    .match-item { padding: 8px 12px; margin: 4px 0; border: 2px solid ${blockText}20; border-radius: 6px; cursor: pointer; transition: all 0.2s; color: ${blockText}; background: ${blockBg}; }
    .match-item:hover { background: ${theme.primaryColor}10; }
    .match-item.selected { border-color: ${theme.primaryColor}; background: ${theme.primaryColor}15; box-shadow: 0 0 0 2px ${theme.primaryColor}30; }
    .match-item.matched-correct { border-color: #22c55e; background: #dcfce7; color: #166534; cursor: default; }
    .match-item.matched-incorrect { border-color: #ef4444; background: #fee2e2; color: #991b1b; }

    /* Drag & Drop */
    .block-dragdrop .instruction { margin-bottom: 12px; font-weight: 600; }
    .drag-items { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .dd-item { padding: 8px 16px; background: ${blockBg}; color: ${blockText}; border: 2px solid ${blockText}20; border-radius: 6px; cursor: grab; transition: all 0.2s; }
    .dd-item:active { cursor: grabbing; }
    .dd-item.placed { opacity: 0.4; cursor: default; }
    .dd-zone { min-height: 60px; padding: 12px; border: 2px dashed ${blockText}30; border-radius: 8px; margin-bottom: 8px; text-align: center; transition: all 0.2s; color: ${blockText}; background: ${blockBg}; }
    .dd-zone.drag-over { border-color: ${theme.primaryColor}; background: ${theme.primaryColor}10; }
    .dd-zone.dd-correct { border-color: #22c55e; border-style: solid; background: #dcfce7; color: #166534; }
    .dd-zone.dd-incorrect { border-color: #ef4444; border-style: solid; background: #fee2e2; color: #991b1b; }

    /* Branching */
    .block-branching .scenario { margin-bottom: 16px; font-size: 15px; line-height: 1.6; }
    .block-branching .choices { display: flex; flex-direction: column; gap: 8px; }
    .branch-choice { padding: 12px 16px; border: 2px solid ${blockText}20; border-radius: 8px; background: ${blockBg}; color: ${blockText}; cursor: pointer; text-align: left; font-size: 14px; transition: all 0.2s; }
    .branch-choice:hover { border-color: ${theme.primaryColor}; background: ${theme.primaryColor}10; }
    .branch-choice.chosen { border-color: ${theme.primaryColor}; background: ${theme.primaryColor}15; }
    .branch-consequence { margin-top: 16px; padding: 16px; border-radius: 8px; background: ${theme.surfaceColor}; border-left: 4px solid ${theme.primaryColor}; font-size: 14px; }
    .branch-continue { margin-top: 12px; padding: 8px 20px; background: ${theme.primaryColor}; color: #fff; border: none; border-radius: ${btnRadius}; cursor: pointer; font-size: 13px; font-weight: 600; }

    /* Completion Criteria */
    .completion-criteria { margin-top: 32px; padding: 16px 20px; border-radius: 10px; background: ${theme.primaryColor}08; border: 1px solid ${theme.primaryColor}25; }
    .criteria-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; font-size: 14px; }
    .completion-criteria ul { list-style: none; padding: 0; margin: 0; }
    .completion-criteria li { position: relative; padding: 4px 0 4px 20px; font-size: 13px; color: ${bodyText}; }
    .completion-criteria li::before { content: '\\2713'; position: absolute; left: 0; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; font-weight: bold; }

    [role="tablist"] { display: flex; border-bottom: 2px solid ${theme.textColor}15; margin-bottom: 12px; }
    [role="tab"] { padding: 8px 16px; border: none; background: none; cursor: pointer; font-weight: 600; border-bottom: 2px solid transparent; margin-bottom: -2px; }
    [role="tab"][aria-selected="true"] { border-bottom-color: ${theme.primaryColor}; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; }

    /* Slide block */
    .block-slide { position: relative; border-radius: 12px; overflow: hidden; }
    .slide-container { position: relative; width: 100%; padding-bottom: 56.25%; /* 16:9 */ }
    .slide-btn {
      display: inline-flex; align-items: center; justify-content: center;
      background: ${theme.primaryColor}; color: #fff; border-radius: 6px;
      text-decoration: none; font-size: 14px; font-weight: 600;
      cursor: pointer; transition: opacity 0.2s;
    }
    .slide-btn:hover { opacity: 0.9; }

    /* Block feedback */
    .block-feedback { margin-top: 8px; border: 1px solid ${theme.primaryColor}30; border-radius: 8px; }
    .block-feedback summary { padding: 8px 14px; cursor: pointer; font-weight: 600; font-size: 13px; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; background: ${theme.primaryColor}08; border-radius: 8px; }
    .block-feedback[open] summary { border-radius: 8px 8px 0 0; }
    .block-feedback > div { padding: 10px 14px; font-size: 13px; color: ${bodyText}; }

    /* Lesson completion indicator */
    .lesson-completed::after { content: ' \\2713'; color: #22c55e; font-weight: bold; }

    /* Block animations */
    @keyframes lumina-fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes lumina-slide-up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes lumina-slide-left { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
    @keyframes lumina-scale { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }

    @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
    @media (max-width: 600px) {
      .lesson-content { padding: 16px 12px 80px; }
      .player-header { padding: 8px 12px; }
    }
  `
}
