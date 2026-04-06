/**
 * Renders course lessons to self-contained HTML pages for SCORM packaging.
 * Each lesson becomes one HTML file (one SCO).
 */

import type { Course, Lesson, ContentBlock, CourseTheme, SlideElement, ChartBlock } from '@/types/course'
import { getLearnerProgressScript } from '@/lib/export/learner-progress-script'

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
  if (!str) return ''
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
function renderBlock(block: ContentBlock, options?: { enableSaveForLater?: boolean }): string {
  const animStyle = getAnimationStyle(block)
  const animClass = getAnimationClass(block)
  let html: string
  try {
    html = renderBlockInner(block, animStyle, animClass)
  } catch (err) {
    console.error('Error rendering block:', block.type, block.id, err)
    html = `<section class="block"><p style="color:#999;font-style:italic;">Block could not be rendered.</p></section>`
  }

  // Append per-block feedback if present
  if (block.feedback) {
    html += `\n<details class="block-feedback"><summary>Feedback</summary><div>${escapeHtml(block.feedback)}</div></details>`
  }

  // Append per-block "Save for Later" button (skip for divider and save-for-later blocks themselves)
  if (options?.enableSaveForLater && block.type !== 'divider' && block.type !== 'save-for-later') {
    html += `\n<button class="sfl-save-btn" data-block-id="${block.id}" data-block-type="${block.type}" data-block-label="${escapeHtml(block.ariaLabel)}" title="Save for Later">&#9733; Save for Later</button>`
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
        return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-video${animClass}" data-block-id="${escapeHtml(block.id)}"${block.transcript ? ' data-has-transcript="true"' : ''}${animStyle}>
  <div class="video-embed"><iframe src="${escapeHtml(block.url)}" allowfullscreen title="${escapeHtml(block.ariaLabel)}"></iframe></div>
  ${block.transcript ? `<details class="transcript"><summary>View Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`
      }
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-video${animClass}" data-block-id="${escapeHtml(block.id)}"${block.transcript ? ' data-has-transcript="true"' : ''}${(block.captions || []).length > 0 ? ' data-has-captions="true"' : ''}${animStyle}>
  <video controls aria-label="${escapeHtml(block.ariaLabel)}"${block.poster ? ` poster="${escapeHtml(block.poster)}"` : ''}>
    <source src="${escapeHtml(block.url)}" />
    ${(block.captions || []).map((c) => `<track kind="captions" src="${escapeHtml(c.src)}" srclang="${escapeHtml(c.language)}" label="${escapeHtml(c.label)}"${c.isDefault ? ' default' : ''} />`).join('\n    ')}
  </video>
  ${block.transcript ? `<details class="transcript"><summary>View Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`

    case 'audio':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-audio${animClass}" data-block-id="${escapeHtml(block.id)}"${block.transcript ? ' data-has-transcript="true"' : ''}${animStyle}>
  <audio controls aria-label="${escapeHtml(block.ariaLabel)}">
    <source src="${escapeHtml(block.assetPath)}" />
  </audio>
  ${block.transcript ? `<details class="transcript" open><summary>Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`

    case 'quiz':
      return renderQuiz(block, animStyle, animClass)

    case 'accordion': {
      const accordionLayout = block.layout === 'horizontal' ? ` accordion-horizontal accordion-cols-${block.columns ?? 2}` : ''
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-accordion${accordionLayout}${animClass}"${animStyle}>
  <div class="accordion-items">
  ${block.items.map((item, i) => `<details${i === 0 ? ' open' : ''}>
    <summary>${escapeHtml(item.title)}</summary>
    <div class="accordion-content">${item.content}</div>
  </details>`).join('\n  ')}
  </div>
</section>`
    }

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
  <div class="h5p-responsive-wrapper">
    <iframe src="${escapeHtml(block.embedUrl)}" title="${escapeHtml(block.ariaLabel)}" sandbox="allow-scripts allow-same-origin" allowfullscreen></iframe>
  </div>
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

    case 'file-upload':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-file-upload${animClass}"${animStyle}>
  <div class="file-upload-card">
    <div class="file-icon">&#128196;</div>
    <div class="file-info">
      <p class="file-name">${escapeHtml(block.fileName || 'File')}</p>
      <p class="file-meta">${block.fileSize > 0 ? `${(block.fileSize / 1024).toFixed(1)} KB` : ''} ${block.mimeType ? `· ${escapeHtml(block.mimeType)}` : ''}</p>
    </div>
    <div class="file-actions">
      ${block.allowDownload && block.filePath ? `<a href="${escapeHtml(block.filePath)}" download="${escapeHtml(block.fileName)}" class="file-download-btn">Download</a>` : ''}
      ${block.inlineViewer && block.filePath && (block.mimeType === 'application/pdf' || block.mimeType?.startsWith('text/')) ? `<button class="file-view-btn" data-file-src="${escapeHtml(block.filePath)}" data-file-type="${escapeHtml(block.mimeType)}">View</button>` : ''}
    </div>
  </div>
  <div class="file-viewer-container" hidden></div>
</section>`

    case 'save-for-later':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-save-for-later${animClass}"${animStyle}>
  <h3 class="sfl-heading">${escapeHtml(block.heading || 'Saved for Later')}</h3>
  <p class="sfl-description">${escapeHtml(block.description || '')}</p>
  <div class="sfl-items-list" aria-live="polite">
    <p class="sfl-empty">No items saved yet.</p>
  </div>
</section>`

    case 'timeline':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-timeline timeline-${block.orientation}${animClass}"${animStyle}>
  <ol class="timeline-list" style="border-left-style: ${block.lineStyle};">
    ${block.nodes.map((node) => `<li class="timeline-node">
      ${block.expandBehavior === 'all-open'
        ? `<div class="timeline-node-inner">
            <span class="timeline-date">${escapeHtml(node.date)}</span>
            <strong class="timeline-title">${escapeHtml(node.title)}</strong>
            <div class="timeline-content">${escapeHtml(node.content)}</div>
          </div>`
        : `<details${block.expandBehavior === 'click-to-expand' ? '' : ' open'}>
            <summary><span class="timeline-date">${escapeHtml(node.date)}</span> ${escapeHtml(node.title)}</summary>
            <div class="timeline-content">${escapeHtml(node.content)}</div>
          </details>`}
    </li>`).join('\n    ')}
  </ol>
</section>`

    case 'math':
      // Use KaTeX renderToString at build time
      try {
        const katex = require('katex')
        const mathHtml = katex.renderToString(block.latex || '', { displayMode: block.displayMode, throwOnError: false, trust: false })
        return `<section role="math" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-math${animClass}"${animStyle}>
  ${mathHtml}
</section>`
      } catch {
        return `<section role="math" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-math${animClass}"${animStyle}>
  <code>${escapeHtml(block.latex)}</code>
</section>`
      }

    case 'chart': {
      const chartBlock = block as ChartBlock
      const chartConfig = JSON.stringify({
        type: chartBlock.chartType,
        data: { labels: chartBlock.labels, datasets: chartBlock.datasets },
        options: { responsive: true }
      })
      // Data table for accessibility
      const tableHtml = `<table class="chart-accessible-table sr-only" aria-label="${escapeHtml(chartBlock.accessibleSummary || 'Chart data')}">
  <thead><tr><th>Label</th>${chartBlock.datasets.map((ds) => `<th>${escapeHtml(ds.label)}</th>`).join('')}</tr></thead>
  <tbody>${chartBlock.labels.map((label, i) => `<tr><td>${escapeHtml(label)}</td>${chartBlock.datasets.map((ds) => `<td>${ds.data[i] ?? ''}</td>`).join('')}</tr>`).join('')}</tbody>
</table>`
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-chart${animClass}"${animStyle}>
  <canvas id="chart-${block.id}" data-chart='${escapeHtml(chartConfig)}'></canvas>
  ${chartBlock.accessibleSummary ? `<p class="chart-summary sr-only">${escapeHtml(chartBlock.accessibleSummary)}</p>` : ''}
  ${tableHtml}
</section>`
    }

    case 'lottie':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-lottie${animClass}"${animStyle}>
  <div class="lottie-container" data-animation-path="${escapeHtml(block.animationPath)}" data-autoplay="${block.autoplay}" data-loop="${block.loop}" data-speed="${block.speed}" data-trigger="${block.trigger}"></div>
  ${block.fallbackImagePath ? `<noscript><img src="${escapeHtml(block.fallbackImagePath)}" alt="${escapeHtml(block.ariaLabel)}" /></noscript>` : ''}
</section>`

    case 'interactive-video':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-interactive-video${animClass}"${animStyle}>
  <video controls aria-label="${escapeHtml(block.ariaLabel)}" data-questions='${escapeHtml(JSON.stringify(block.questions))}' data-pause-behavior="${block.pauseBehavior}">
    <source src="${escapeHtml(block.url)}" />
  </video>
  <div class="iv-question-overlay" hidden></div>
  ${block.transcript ? `<details class="transcript"><summary>View Transcript</summary><div>${escapeHtml(block.transcript)}</div></details>` : ''}
</section>`

    case 'pdf-viewer':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-pdf-viewer${animClass}"${animStyle}>
  <div class="pdf-embed-wrapper">
    <embed src="${escapeHtml(block.filePath)}" type="application/pdf" width="100%" height="600px" />
  </div>
  ${block.allowDownload ? `<a href="${escapeHtml(block.filePath)}" download class="pdf-download-btn">Download PDF</a>` : ''}
  ${!block.hasAccessibilityTags ? '<p class="pdf-a11y-warning" role="alert">This PDF may not be fully accessible to screen readers.</p>' : ''}
</section>`

    case 'converted-doc':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-converted-doc${animClass}"${animStyle}>
  ${block.convertedHtml || '<p><em>Document content not yet converted.</em></p>'}
</section>`

    case 'image-map':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-image-map${animClass}"${animStyle}>
  <figure>
    <img src="${escapeHtml(block.imagePath)}" alt="${escapeHtml(block.imageAlt)}" usemap="#map-${block.id}" />
    <map name="map-${block.id}">
      ${block.hotspots.map((hs) => `<area shape="${hs.shape}" coords="${hs.coords.join(',')}" alt="${escapeHtml(hs.label)}" data-popup="${escapeHtml(hs.popupContent)}" tabindex="0" />`).join('\n      ')}
    </map>
  </figure>
  <div class="imagemap-popup" hidden></div>
</section>`

    case 'reveal-scroll':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-reveal-scroll${animClass}"${animStyle}>
  ${block.items.map((item, i) => `<div class="reveal-item" data-reveal-animation="${item.animation}" data-reveal-delay="${i * block.staggerDelay}" data-reveal-threshold="${block.threshold}" style="opacity:0;">
    ${item.content}
  </div>`).join('\n  ')}
</section>`

    case 'writing':
      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-writing${animClass}"${animStyle}>
  <div class="writing-variant-badge">${escapeHtml(block.variant)}</div>
  <div class="writing-instruction">${escapeHtml(block.instruction)}</div>
  ${block.promptSections.map((s) => `<div class="writing-section">
    <label class="writing-section-label">${escapeHtml(s.label)}</label>
    <textarea class="writing-textarea" placeholder="${escapeHtml(s.placeholder)}" data-min-words="${s.minWords || 0}" data-max-words="${s.maxWords || 0}"></textarea>
    <div class="writing-word-count">0 words${s.minWords ? ` (min: ${s.minWords})` : ''}${s.maxWords ? ` (max: ${s.maxWords})` : ''}</div>
  </div>`).join('\n  ')}
</section>`

    case 'knowledge-check': {
      const kcQuestions = block.questions.map((q, qi) => {
        let choicesHtml = ''
        if (q.type === 'multiple-choice' || q.type === 'true-false') {
          choicesHtml = `<fieldset>
            <legend class="sr-only">Choices for question ${qi + 1}</legend>
            ${q.choices.map((c) => `<label class="quiz-choice">
              <input type="radio" name="kc-q-${q.id}" value="${c.id}" data-correct="${c.isCorrect}" data-choice-id="${c.id}" />
              <span>${escapeHtml(c.label)}</span>
            </label>`).join('\n            ')}
          </fieldset>`
        } else if (q.type === 'short-answer') {
          choicesHtml = `<input type="text" class="short-answer" data-question="${q.id}" placeholder="Type your answer..." />`
        }
        return `<div class="quiz-question" data-type="${q.type}" data-id="${q.id}" data-question="${q.id}" data-bank-question-id="${q.bankQuestionId || ''}" data-difficulty="${q.difficulty || ''}">
          <p class="question-prompt"><strong>Q${qi + 1}.</strong> ${escapeHtml(q.prompt)}</p>
          ${choicesHtml}
          <div class="feedback feedback-correct" hidden>${escapeHtml(q.feedbackCorrect)}</div>
          <div class="feedback feedback-incorrect" hidden>${escapeHtml(q.feedbackIncorrect)}</div>
        </div>`
      }).join('\n    ')

      return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-knowledge-check${animClass}" data-block-id="${block.id}" data-block-type="knowledge-check" data-phase="${block.phase}" data-objectives="${block.objectives.join('|')}"${animStyle}>
  <div class="kc-phase-badge">${escapeHtml(block.phase)}</div>
  ${block.objectives.length > 0 ? `<ul class="kc-objectives">${block.objectives.map((o) => `<li>${escapeHtml(o)}</li>`).join('')}</ul>` : ''}
  ${kcQuestions}
  <div class="quiz-actions">
    <button class="quiz-submit" type="button">Check Answers</button>
  </div>
  <div class="quiz-result" hidden aria-live="polite"></div>
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
          <input type="radio" name="q-${q.id}" value="${c.id}" data-correct="${c.isCorrect}" data-choice-id="${c.id}" />
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
            <input type="radio" name="q-${q.id}" value="${c.id}" data-choice-id="${c.id}" />
            <span>${escapeHtml(c.label)}</span>
          </label>`).join('\n          ')}
        </div>
      </fieldset>`
    }

    return `<div class="quiz-question" data-type="${q.type}" data-id="${q.id}" data-question="${q.id}" data-bank-question-id="${q.bankQuestionId || ''}" data-difficulty="${q.difficulty || ''}">
      <p class="question-prompt"><strong>Q${qi + 1}.</strong> ${escapeHtml(q.prompt)}</p>
      ${choicesHtml}
      <div class="feedback feedback-correct" hidden>${escapeHtml(q.feedbackCorrect)}</div>
      <div class="feedback feedback-incorrect" hidden>${escapeHtml(q.feedbackIncorrect)}</div>
    </div>`
  }).join('\n    ')

  return `<section role="region" aria-label="${escapeHtml(block.ariaLabel)}" class="block block-quiz${animClass}" data-block-id="${block.id}" data-pass="${block.passThreshold}" data-feedback="${block.showFeedback}" data-retry="${block.allowRetry}"${animStyle}>
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
  // Check if any lesson in the course has a save-for-later block
  const hasSaveForLater = course.modules.some((m) =>
    m.lessons.some((l) => l.blocks.some((b) => b.type === 'save-for-later'))
  )
  const blocks = lesson.blocks.map((b) => renderBlock(b, { enableSaveForLater: hasSaveForLater })).join('\n\n    ')

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
<body data-course-id="${course.id}" data-lesson-id="${lesson.id}"${lesson.completionCriteria?.interactiveRequired ? ' data-interactive-required="true"' : ''}>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  ${settings.enrollmentPage && lessonIndex === 0 ? `<!-- Enrollment Overlay -->
  <div id="enrollment-overlay" style="position:fixed;inset:0;z-index:9999;background:${theme.backgroundColor};display:flex;align-items:center;justify-content:center;">
    <div style="max-width:420px;width:90%;padding:40px;background:#ffffff;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.12);text-align:center;">
      ${theme.logoPath ? `<img src="${escapeHtml(theme.logoPath)}" alt="Logo" style="max-height:60px;margin-bottom:20px;" />` : ''}
      <h1 style="font-family:${theme.fontFamilyHeading || theme.fontFamily};font-size:22px;color:#000000;margin-bottom:8px;">${escapeHtml(course.meta.title)}</h1>
      <p style="font-size:14px;color:#000000;margin-bottom:24px;">${escapeHtml(course.meta.description || 'Welcome! Please enter your name to begin.')}</p>
      <form id="enrollment-form" style="text-align:left;">
        <label style="display:block;font-size:13px;font-weight:600;color:#000000;margin-bottom:6px;">Your Name</label>
        <input id="enrollment-name" type="text" required placeholder="Enter your full name" style="width:100%;padding:10px 14px;font-size:15px;border:2px solid #00000020;border-radius:8px;background:#ffffff;color:#000000;outline:none;box-sizing:border-box;margin-bottom:16px;" />
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
      <button id="btn-progress" onclick="toggleProgress()" style="padding:4px 12px;font-size:12px;border-radius:6px;border:1px solid rgba(255,255,255,0.3);background:transparent;color:inherit;cursor:pointer;" aria-label="My Progress">My Progress</button>
    </div>
  </header>

  <!-- Main Content -->
  <main id="main-content" class="lesson-content">
    <div class="lesson-header">
      <span class="module-label">${escapeHtml(moduleTitle)}</span>
      <h1>${escapeHtml(lesson.title)}</h1>
    </div>

    ${settings.readmeContent && lessonIndex === 0 ? `<aside class="course-readme" role="note" aria-label="Course documentation">
      <details>
        <summary>&#128196; Course Documentation / Read Me</summary>
        <div class="readme-content">${escapeHtml(settings.readmeContent)}</div>
      </details>
    </aside>` : ''}

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
  <script>${getLearnerProgressScript()}</script>
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
      font-size: 13px; font-weight: 600; display: inline-block;
      text-decoration: none;
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
    .match-item:hover { background: ${theme.primaryColor}; color: #fff; }
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

    /* Enrollment overlay — force black text on white background */
    #enrollment-overlay { color: #000000; }
    #enrollment-overlay h1 { color: #000000 !important; }
    #enrollment-overlay p { color: #000000 !important; }
    #enrollment-overlay label { color: #000000 !important; }
    #enrollment-overlay input { color: #000000 !important; background: #ffffff !important; }
    #enrollment-overlay > div { background: #ffffff !important; }

    /* Accordion horizontal layout */
    .accordion-horizontal .accordion-items { display: grid; gap: 12px; }
    .accordion-horizontal.accordion-cols-2 .accordion-items { grid-template-columns: repeat(2, 1fr); }
    .accordion-horizontal.accordion-cols-3 .accordion-items { grid-template-columns: repeat(3, 1fr); }
    .accordion-horizontal details { margin-bottom: 0; }
    .accordion-horizontal details[open] .accordion-content { padding: 10px 14px; }
    @media (max-width: 768px) {
      .accordion-horizontal.accordion-cols-3 .accordion-items { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .accordion-horizontal .accordion-items { grid-template-columns: 1fr !important; }
    }

    /* H5P responsive wrapper — fills available viewport */
    .block-h5p iframe, .h5p-responsive-wrapper { width: 100%; min-height: 70vh; border: none; }
    .h5p-responsive-wrapper { position: relative; overflow: hidden; border-radius: 8px; }
    .h5p-responsive-wrapper iframe { width: 100%; height: 70vh; border: none; }
    @media (max-width: 600px) { .h5p-responsive-wrapper iframe, .block-h5p iframe { height: 60vh; min-height: 60vh; } }
    @media (min-width: 960px) { .h5p-responsive-wrapper iframe, .block-h5p iframe { height: 80vh; min-height: 80vh; } }

    /* File Upload block */
    .block-file-upload .file-upload-card { display: flex; align-items: center; gap: 16px; padding: 16px; border: 1px solid ${blockText}20; border-radius: 10px; background: ${blockBg}; }
    .file-icon { font-size: 32px; }
    .file-info { flex: 1; }
    .file-name { font-size: 15px; font-weight: 600; color: ${blockText}; margin-bottom: 2px; }
    .file-meta { font-size: 12px; color: ${blockText}; opacity: 0.7; }
    .file-actions { display: flex; gap: 8px; }
    .file-download-btn, .file-view-btn { padding: 8px 16px; border-radius: ${btnRadius}; font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: none; border: none; }
    .file-download-btn { background: ${theme.primaryColor}; color: #fff; }
    .file-view-btn { background: ${blockBg}; color: ${blockText}; border: 2px solid ${theme.primaryColor}; }
    .file-viewer-container { margin-top: 12px; border-radius: 8px; overflow: hidden; border: 1px solid ${blockText}20; }
    .file-viewer-container iframe { width: 100%; height: 500px; border: none; }

    /* Save for Later */
    .sfl-save-btn { display: block; margin: 6px 0 0 auto; padding: 4px 12px; font-size: 11px; background: none; border: 1px solid ${blockText}25; border-radius: ${btnRadius}; color: ${blockText}; opacity: 0.6; cursor: pointer; transition: all 0.2s; }
    .sfl-save-btn:hover { opacity: 1; border-color: ${theme.primaryColor}; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; }
    .sfl-save-btn.saved { opacity: 1; border-color: #22c55e; color: #22c55e; }
    .block-save-for-later { background: ${blockBg}; color: ${blockText}; padding: 24px; border-radius: 12px; border: 1px solid ${blockText}15; }
    .sfl-heading { font-size: 20px; font-weight: 700; margin-bottom: 4px; }
    .sfl-description { font-size: 14px; opacity: 0.8; margin-bottom: 16px; }
    .sfl-items-list { min-height: 40px; }
    .sfl-empty { font-size: 13px; opacity: 0.5; font-style: italic; }
    .sfl-item { display: flex; align-items: center; gap: 10px; padding: 10px 14px; margin-bottom: 6px; border: 1px solid ${blockText}15; border-radius: 8px; background: ${blockBg}; }
    .sfl-item-label { flex: 1; font-size: 13px; }
    .sfl-item-type { font-size: 10px; opacity: 0.5; text-transform: uppercase; }
    .sfl-item-remove { background: none; border: none; color: #ef4444; cursor: pointer; font-size: 14px; padding: 4px; }

    /* Incomplete section highlighting */
    .block-incomplete-highlight { outline: 4px dotted #dc2626 !important; outline-offset: 6px; border-radius: 4px; position: relative; }
    .block-incomplete-tooltip { position: absolute; top: -36px; left: 50%; transform: translateX(-50%); background: #dc2626; color: #fff; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 6px; white-space: nowrap; z-index: 100; pointer-events: none; box-shadow: 0 2px 8px rgba(0,0,0,0.15); }
    .block-incomplete-tooltip::after { content: ''; position: absolute; top: 100%; left: 50%; transform: translateX(-50%); border: 5px solid transparent; border-top-color: #dc2626; }

    /* Course README */
    .course-readme { margin-bottom: 24px; }
    .course-readme details { border: 1px solid ${theme.primaryColor}30; border-radius: 10px; }
    .course-readme summary { padding: 14px 18px; cursor: pointer; font-weight: 600; font-size: 14px; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; background: ${theme.primaryColor}08; border-radius: 10px; }
    .course-readme[open] summary { border-radius: 10px 10px 0 0; }
    .readme-content { padding: 16px 18px; font-size: 14px; line-height: 1.7; white-space: pre-wrap; color: ${bodyText}; }

    /* Timeline */
    .block-timeline .timeline-list { list-style: none; padding-left: 24px; border-left: 3px solid ${theme.primaryColor}; }
    .timeline-node { position: relative; padding: 8px 0 16px 16px; }
    .timeline-node::before { content: ''; position: absolute; left: -30px; top: 12px; width: 12px; height: 12px; border-radius: 50%; background: ${theme.primaryColor}; border: 2px solid ${theme.backgroundColor}; }
    .timeline-date { font-size: 12px; color: ${ensureContrast(theme.primaryColor, theme.backgroundColor)}; font-weight: 600; margin-right: 8px; }
    .timeline-title { font-size: 15px; font-weight: 600; color: ${bodyText}; }
    .timeline-content { font-size: 14px; margin-top: 4px; color: ${bodyText}; opacity: 0.85; }
    .timeline-horizontal .timeline-list { display: flex; border-left: none; border-top: 3px solid ${theme.primaryColor}; padding-left: 0; padding-top: 16px; overflow-x: auto; }
    .timeline-horizontal .timeline-node { padding: 16px 16px 0 0; min-width: 200px; }
    .timeline-horizontal .timeline-node::before { left: 0; top: -22px; }

    /* Math */
    .block-math { text-align: center; padding: 16px; font-size: 18px; overflow-x: auto; }

    /* Chart */
    .block-chart canvas { max-width: 100%; }
    .chart-accessible-table { width: 100%; border-collapse: collapse; }
    .chart-accessible-table th, .chart-accessible-table td { padding: 4px 8px; border: 1px solid ${blockText}20; text-align: left; }

    /* Lottie */
    .block-lottie .lottie-container { max-width: 400px; margin: 0 auto; }

    /* Interactive Video */
    .block-interactive-video video { width: 100%; border-radius: 8px; }
    .iv-question-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; border-radius: 8px; }

    /* PDF Viewer */
    .block-pdf-viewer .pdf-embed-wrapper { border-radius: 8px; overflow: hidden; border: 1px solid ${blockText}20; }
    .block-pdf-viewer embed { display: block; }
    .pdf-download-btn { display: inline-block; margin-top: 8px; padding: 8px 16px; background: ${theme.primaryColor}; color: #fff; border-radius: ${btnRadius}; text-decoration: none; font-size: 13px; font-weight: 600; }
    .pdf-a11y-warning { margin-top: 8px; padding: 8px 12px; background: #fffbeb; border: 1px solid #f59e0b40; border-radius: 6px; font-size: 12px; color: #713f12; }

    /* Converted Document */
    .block-converted-doc { line-height: 1.7; }

    /* Image Map */
    .block-image-map img { max-width: 100%; height: auto; display: block; }
    .imagemap-popup { position: absolute; padding: 12px 16px; background: ${blockBg}; color: ${blockText}; border: 1px solid ${blockText}20; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.12); max-width: 300px; z-index: 10; }

    /* Reveal Scroll */
    .reveal-item { transition: opacity 0.6s ease, transform 0.6s ease; margin-bottom: 16px; }

    /* Writing */
    .block-writing { background: ${blockBg}; color: ${blockText}; padding: 24px; border-radius: 12px; }
    .writing-variant-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 4px; background: ${theme.primaryColor}15; color: ${ensureContrast(theme.primaryColor, blockBg)}; margin-bottom: 12px; }
    .writing-instruction { font-size: 15px; margin-bottom: 16px; line-height: 1.6; }
    .writing-section { margin-bottom: 16px; }
    .writing-section-label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    .writing-textarea { width: 100%; min-height: 120px; padding: 12px; border: 1px solid ${blockText}20; border-radius: 8px; font-size: 14px; line-height: 1.6; resize: vertical; background: ${theme.backgroundColor}; color: ${bodyText}; }
    .writing-word-count { font-size: 11px; color: ${blockText}; opacity: 0.6; margin-top: 4px; text-align: right; }

    /* Knowledge Check */
    .block-knowledge-check { background: ${blockBg}; color: ${blockText}; padding: 24px; border-radius: 12px; }
    .kc-phase-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 2px 8px; border-radius: 4px; background: ${theme.accentColor}15; color: ${ensureContrast(theme.accentColor, blockBg)}; margin-bottom: 12px; }
    .kc-objectives { list-style: disc; padding-left: 20px; margin-bottom: 16px; font-size: 13px; }
    .kc-objectives li { margin-bottom: 4px; }

    @media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
    @media (max-width: 600px) {
      .lesson-content { padding: 16px 12px 80px; }
      .player-header { padding: 8px 12px; }
    }
  `
}
