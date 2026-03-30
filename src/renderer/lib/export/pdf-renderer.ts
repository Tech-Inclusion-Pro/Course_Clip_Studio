/**
 * PDF Export Renderer
 * Generates a single printable HTML document containing the full course,
 * then triggers print-to-PDF via Electron IPC.
 */

import type { Course, ContentBlock, CourseTheme } from '@/types/course'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export interface PdfOptions {
  pageSize: 'A4' | 'Letter'
  includeQuizAnswers: boolean
  includeUdlNotes: boolean
}

/**
 * Render the full course as a single printable HTML string for PDF conversion.
 */
export function renderPdfHtml(course: Course, options: PdfOptions): string {
  const theme = course.theme
  const allLessons: Array<{
    lesson: typeof course.modules[0]['lessons'][0]
    moduleTitle: string
    moduleIdx: number
    lessonIdx: number
  }> = []

  for (let mi = 0; mi < course.modules.length; mi++) {
    const mod = course.modules[mi]
    for (let li = 0; li < mod.lessons.length; li++) {
      allLessons.push({ lesson: mod.lessons[li], moduleTitle: mod.title, moduleIdx: mi, lessonIdx: li })
    }
  }

  const lessonPages = allLessons.map(({ lesson, moduleTitle }, idx) => {
    const blocks = lesson.blocks.map((b) => renderPdfBlock(b, options)).join('\n')
    return `<section class="lesson-page" aria-label="${escapeHtml(lesson.title)}">
      <div class="module-label">${escapeHtml(moduleTitle)}</div>
      <h2 class="lesson-title">${escapeHtml(lesson.title)}</h2>
      ${blocks}
      ${idx < allLessons.length - 1 ? '<div class="page-break"></div>' : ''}
    </section>`
  }).join('\n\n')

  // Table of contents
  const toc = course.modules.map((mod, mi) => {
    const lessons = mod.lessons.map((l, li) => {
      const globalIdx = allLessons.findIndex((al) => al.moduleIdx === mi && al.lessonIdx === li)
      return `<li><a href="#lesson-${mi}-${li}">${escapeHtml(l.title)}</a></li>`
    }).join('\n')
    return `<li>
      <strong>${escapeHtml(mod.title)}</strong>
      <ol>${lessons}</ol>
    </li>`
  }).join('\n')

  return `<!DOCTYPE html>
<html lang="${course.meta.language || 'en'}">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(course.meta.title)}</title>
  <style>
    ${getPdfStyles(theme, options)}
  </style>
</head>
<body>
  <!-- Cover page -->
  <div class="cover-page">
    <h1>${escapeHtml(course.meta.title)}</h1>
    <p class="description">${escapeHtml(course.meta.description)}</p>
    <div class="meta">
      <div>Author: ${escapeHtml(course.meta.author)}</div>
      <div>Version: ${course.meta.version}</div>
      ${course.meta.estimatedDuration ? `<div>Estimated Duration: ${course.meta.estimatedDuration} minutes</div>` : ''}
      <div>Modules: ${course.modules.length} | Lessons: ${allLessons.length}</div>
    </div>
  </div>

  <div class="page-break"></div>

  <!-- Table of Contents -->
  <section class="toc">
    <h2>Table of Contents</h2>
    <ol class="toc-list">${toc}</ol>
  </section>

  <div class="page-break"></div>

  <!-- Lessons -->
  ${lessonPages}
</body>
</html>`
}

function renderPdfBlock(block: ContentBlock, options: PdfOptions): string {
  switch (block.type) {
    case 'text':
      return `<div class="block block-text">${block.content}</div>`

    case 'media':
      return `<figure class="block block-media">
        <img src="${escapeHtml(block.assetPath)}" alt="${escapeHtml(block.altText)}" />
        ${block.caption ? `<figcaption>${escapeHtml(block.caption)}</figcaption>` : ''}
      </figure>`

    case 'video':
      return `<div class="block block-video">
        <div class="media-placeholder">Video: ${escapeHtml(block.ariaLabel || block.url)}</div>
        ${block.transcript ? `<div class="transcript"><strong>Transcript:</strong> ${escapeHtml(block.transcript)}</div>` : ''}
      </div>`

    case 'audio':
      return `<div class="block block-audio">
        <div class="media-placeholder">Audio: ${escapeHtml(block.ariaLabel || block.assetPath)}</div>
        ${block.transcript ? `<div class="transcript"><strong>Transcript:</strong> ${escapeHtml(block.transcript)}</div>` : ''}
      </div>`

    case 'quiz':
      return renderPdfQuiz(block, options)

    case 'accordion':
      return `<div class="block block-accordion">
        ${block.items.map((item) => `<div class="accordion-item">
          <div class="accordion-title">${escapeHtml(item.title)}</div>
          <div class="accordion-content">${item.content}</div>
        </div>`).join('\n')}
      </div>`

    case 'tabs':
      return `<div class="block block-tabs">
        ${block.tabs.map((tab) => `<div class="tab-section">
          <div class="tab-label">${escapeHtml(tab.label)}</div>
          <div class="tab-content">${tab.content}</div>
        </div>`).join('\n')}
      </div>`

    case 'flashcard':
      return `<div class="block block-flashcard">
        <table class="flashcard-table">
          <thead><tr><th>Term</th><th>Definition</th></tr></thead>
          <tbody>
            ${block.cards.map((c) => `<tr><td>${escapeHtml(c.front)}</td><td>${escapeHtml(c.back)}</td></tr>`).join('\n')}
          </tbody>
        </table>
      </div>`

    case 'branching':
      return `<div class="block block-branching">
        <div class="scenario">${block.scenario}</div>
        <div class="choices">
          ${block.choices.map((c) => `<div class="branch-choice">
            <strong>${escapeHtml(c.label)}</strong>
            ${c.consequence ? `: ${escapeHtml(c.consequence)}` : ''}
          </div>`).join('\n')}
        </div>
      </div>`

    case 'code':
      return `<div class="block block-code">
        <div class="code-lang">${escapeHtml(block.language)}</div>
        <pre><code>${escapeHtml(block.code)}</code></pre>
      </div>`

    case 'callout':
      return `<div class="block block-callout callout-${block.variant}">
        <div class="callout-content">${block.content}</div>
      </div>`

    case 'divider':
      return '<hr class="block block-divider" />'

    case 'embed':
      return `<div class="block block-embed media-placeholder">Embedded content: ${escapeHtml(block.title || block.url)}</div>`

    case 'h5p':
      return `<div class="block block-h5p media-placeholder">H5P content: ${escapeHtml(block.embedUrl)}</div>`

    case 'custom-html':
      return `<div class="block block-custom"><em>Custom HTML content (see digital version)</em></div>`

    case 'drag-drop':
      return `<div class="block block-dragdrop">
        <p class="instruction"><strong>${escapeHtml(block.instruction)}</strong></p>
        <div class="items">Items: ${block.items.map((i) => escapeHtml(i.label)).join(', ')}</div>
        <div class="zones">Zones: ${block.zones.map((z) => escapeHtml(z.label)).join(', ')}</div>
      </div>`

    case 'matching':
      return `<div class="block block-matching">
        <p class="instruction"><strong>${escapeHtml(block.instruction)}</strong></p>
        <table>
          <tbody>
            ${block.leftItems.map((li, idx) => `<tr><td>${escapeHtml(li.label)}</td><td>↔</td><td>${block.rightItems[idx] ? escapeHtml(block.rightItems[idx].label) : ''}</td></tr>`).join('\n')}
          </tbody>
        </table>
      </div>`

    default:
      return ''
  }
}

function renderPdfQuiz(block: ContentBlock & { type: 'quiz' }, options: PdfOptions): string {
  const questions = block.questions.map((q, i) => {
    let choicesHtml = ''
    if (q.type === 'multiple-choice' || q.type === 'true-false') {
      choicesHtml = q.choices.map((c) => {
        const marker = options.includeQuizAnswers && c.isCorrect ? ' ✓' : ''
        return `<div class="quiz-choice${options.includeQuizAnswers && c.isCorrect ? ' correct' : ''}">${escapeHtml(c.label)}${marker}</div>`
      }).join('\n')
    } else if (q.type === 'short-answer') {
      choicesHtml = '<div class="answer-line">____________________</div>'
    } else if (q.type === 'likert') {
      choicesHtml = `<div class="likert">${q.choices.map((c) => escapeHtml(c.label)).join(' | ')}</div>`
    }

    return `<div class="quiz-question">
      <p class="question-prompt"><strong>Q${i + 1}.</strong> ${escapeHtml(q.prompt)}</p>
      ${choicesHtml}
      ${options.includeQuizAnswers && q.feedbackCorrect ? `<div class="feedback">${escapeHtml(q.feedbackCorrect)}</div>` : ''}
    </div>`
  }).join('\n')

  return `<div class="block block-quiz">
    <div class="quiz-header">Quiz${block.passThreshold > 0 ? ` (Pass: ${block.passThreshold}%)` : ''}</div>
    ${questions}
  </div>`
}

function getPdfStyles(theme: CourseTheme, options: PdfOptions): string {
  const pageSize = options.pageSize === 'Letter' ? 'letter' : 'A4'
  return `
    @page { size: ${pageSize}; margin: 20mm 15mm 25mm 15mm; }
    @media print { .page-break { page-break-after: always; } }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${theme.fontFamily || 'Arial, sans-serif'};
      font-size: 11pt; line-height: 1.6; color: #1a1a2e;
    }
    h1, h2, h3, h4 { font-family: ${theme.fontFamilyHeading || theme.fontFamily || 'Arial, sans-serif'}; }

    .cover-page {
      display: flex; flex-direction: column; justify-content: center;
      align-items: center; text-align: center; min-height: 80vh;
    }
    .cover-page h1 {
      font-size: 28pt; color: ${theme.primaryColor}; margin-bottom: 16px;
    }
    .cover-page .description { font-size: 12pt; color: #4a4a6a; max-width: 400px; margin-bottom: 24px; }
    .cover-page .meta { font-size: 10pt; color: #4a4a6a; line-height: 2; }

    .toc h2 { font-size: 18pt; margin-bottom: 16px; color: ${theme.primaryColor}; }
    .toc-list { padding-left: 20px; }
    .toc-list li { margin-bottom: 4px; font-size: 10pt; }
    .toc-list a { color: ${theme.primaryColor}; text-decoration: none; }
    .toc-list ol { padding-left: 20px; margin-top: 4px; }

    .lesson-page { margin-bottom: 24px; }
    .module-label {
      font-size: 9pt; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: ${theme.primaryColor}; margin-bottom: 4px;
    }
    .lesson-title { font-size: 18pt; margin-bottom: 16px; color: #1a1a2e; }

    .block { margin-bottom: 16px; }
    .block-text { font-size: 11pt; }
    .block-text p { margin-bottom: 8px; }
    .block-media img { max-width: 100%; height: auto; }
    .block-media figcaption { font-size: 9pt; color: #666; margin-top: 4px; text-align: center; }

    .media-placeholder {
      padding: 16px; background: #f5f4fb; border: 1px dashed #d4cef0;
      border-radius: 4px; font-size: 10pt; color: #4a4a6a; text-align: center;
    }
    .transcript { font-size: 9pt; color: #4a4a6a; margin-top: 8px; padding: 8px; background: #f9f9fb; border-radius: 4px; }

    .block-code { break-inside: avoid; }
    .code-lang { font-size: 8pt; color: #999; margin-bottom: 2px; }
    pre { background: #1e1e2e; color: #cdd6f4; padding: 12px; border-radius: 4px; font-size: 9pt; overflow: visible; white-space: pre-wrap; word-break: break-word; }
    code { font-family: 'JetBrains Mono', 'Courier New', monospace; }

    .block-callout { padding: 12px; border-left: 3px solid; border-radius: 4px; break-inside: avoid; }
    .callout-info { background: #eff6ff; border-color: #3b82f6; }
    .callout-tip { background: #f0fdf4; border-color: #22c55e; }
    .callout-warning { background: #fffbeb; border-color: #f59e0b; }
    .callout-success { background: #f0fdf4; border-color: #16a34a; }

    .block-quiz { background: #f5f4fb; padding: 16px; border-radius: 6px; break-inside: avoid; }
    .quiz-header { font-size: 12pt; font-weight: 700; margin-bottom: 12px; color: ${theme.primaryColor}; }
    .quiz-question { margin-bottom: 12px; }
    .question-prompt { margin-bottom: 6px; }
    .quiz-choice { padding: 4px 8px; margin: 2px 0; font-size: 10pt; }
    .quiz-choice.correct { background: #dcfce7; border-radius: 3px; }
    .feedback { font-size: 9pt; color: #166534; margin-top: 4px; font-style: italic; }
    .answer-line { margin: 8px 0; border-bottom: 1px solid #999; width: 200px; }
    .likert { font-size: 9pt; color: #666; }

    .accordion-item { margin-bottom: 8px; border: 1px solid #e5e5e5; border-radius: 4px; break-inside: avoid; }
    .accordion-title { font-weight: 700; padding: 8px 12px; background: #f9f9fb; }
    .accordion-content { padding: 8px 12px; font-size: 10pt; }

    .tab-section { margin-bottom: 12px; break-inside: avoid; }
    .tab-label { font-weight: 700; font-size: 10pt; color: ${theme.primaryColor}; margin-bottom: 4px; border-bottom: 2px solid ${theme.primaryColor}; display: inline-block; padding-bottom: 2px; }
    .tab-content { font-size: 10pt; }

    .flashcard-table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    .flashcard-table th { background: ${theme.primaryColor}; color: #fff; padding: 8px; text-align: left; }
    .flashcard-table td { padding: 8px; border: 1px solid #e5e5e5; }
    .flashcard-table tr:nth-child(even) td { background: #f9f9fb; }

    .block-branching { padding: 12px; background: #f5f4fb; border-radius: 6px; }
    .scenario { margin-bottom: 8px; }
    .branch-choice { padding: 4px 0; font-size: 10pt; }

    .block-matching table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    .block-matching td { padding: 6px 8px; border: 1px solid #e5e5e5; }
    .instruction { margin-bottom: 8px; }

    hr.block-divider { border: none; border-top: 1px solid #d4cef0; margin: 16px 0; }

    .page-break { page-break-after: always; break-after: page; }
  `
}

/**
 * Export the course as a PDF by generating printable HTML and using Electron's printToPDF.
 * Falls back to opening a print dialog in non-Electron environments.
 */
export async function buildPdf(
  course: Course,
  options: PdfOptions,
  onProgress?: (p: { step: string; current: number; total: number }) => void
): Promise<Blob> {
  onProgress?.({ step: 'Rendering course to HTML...', current: 1, total: 3 })

  const html = renderPdfHtml(course, options)

  onProgress?.({ step: 'Generating PDF...', current: 2, total: 3 })

  // Use Electron IPC to generate PDF if available
  if (window.electronAPI?.pdf?.generate) {
    const pdfBuffer = await window.electronAPI.pdf.generate(html, {
      pageSize: options.pageSize,
      printBackground: true,
      margins: { top: 20, bottom: 25, left: 15, right: 15 }
    })
    onProgress?.({ step: 'PDF ready', current: 3, total: 3 })
    return new Blob([pdfBuffer], { type: 'application/pdf' })
  }

  // Fallback: create an HTML blob the user can print to PDF
  onProgress?.({ step: 'Creating printable HTML...', current: 3, total: 3 })
  return new Blob([html], { type: 'text/html' })
}
