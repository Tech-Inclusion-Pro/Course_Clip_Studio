/**
 * Standalone HTML Packager
 * Produces a self-contained ZIP with index.html + lesson pages.
 * No server required — progress stored in localStorage.
 */

import JSZip from 'jszip'
import type { Course } from '@/types/course'
import { renderLessonHtml } from '@/lib/scorm/html-renderer'
import { getHtmlPlayerScript } from './html-player-script'
import type { PackageProgress, ProgressCallback } from '@/lib/scorm/scorm-packager'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * Build a standalone HTML package as a Blob (ZIP archive).
 */
export async function buildHtmlPackage(
  course: Course,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const zip = new JSZip()

  const allLessons: Array<{
    lesson: typeof course.modules[0]['lessons'][0]
    moduleTitle: string
    moduleIdx: number
    lessonIdx: number
    fileName: string
  }> = []

  for (let mi = 0; mi < course.modules.length; mi++) {
    const mod = course.modules[mi]
    for (let li = 0; li < mod.lessons.length; li++) {
      allLessons.push({
        lesson: mod.lessons[li],
        moduleTitle: mod.title,
        moduleIdx: mi,
        lessonIdx: li,
        fileName: `lesson-${mi}-${li}.html`
      })
    }
  }

  const totalSteps = allLessons.length + 4
  let currentStep = 0

  function progress(step: string) {
    currentStep++
    onProgress?.({ step, current: currentStep, total: totalSteps })
  }

  // 1. Add standalone player script
  progress('Adding player scripts...')
  zip.file('player.js', getHtmlPlayerScript())

  // 2. Add no-op scorm-api.js (the player script provides its own SCORM shim)
  zip.file('scorm-api.js', '// Standalone mode — SCORM API provided by player.js\n')

  // 3. Render each lesson
  for (let i = 0; i < allLessons.length; i++) {
    const { lesson, moduleTitle, moduleIdx, lessonIdx, fileName } = allLessons[i]
    progress(`Rendering ${lesson.title}...`)

    let html = renderLessonHtml(course, lesson, moduleTitle, i, allLessons.length)

    // Add data attributes for navigation
    const prevFile = i > 0 ? allLessons[i - 1].fileName : ''
    const nextFile = i < allLessons.length - 1 ? allLessons[i + 1].fileName : ''

    html = html.replace(
      '<body>',
      `<body data-course-id="${course.id}" data-lesson-id="lesson-${moduleIdx}-${lessonIdx}" data-prev-lesson="${prevFile}" data-next-lesson="${nextFile}">`
    )

    // Replace onclick handlers with data-driven navigation
    html = html.replace('onclick="scormNav(-1)"', '')
    html = html.replace('onclick="scormNav(1)"', '')
    html = html.replace('onclick="scormFinish()"', '')

    zip.file(fileName, html)
  }

  // 4. Generate index.html
  progress('Generating index.html...')
  const indexHtml = generateStandaloneIndex(course, allLessons)
  zip.file('index.html', indexHtml)

  // 5. Generate combined all-lessons page
  progress('Generating combined page...')
  const combinedHtml = generateCombinedHtml(course, allLessons)
  zip.file('course-complete.html', combinedHtml)

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })

  return blob
}

function generateStandaloneIndex(
  course: Course,
  allLessons: Array<{ lesson: { title: string }; moduleTitle: string; moduleIdx: number; lessonIdx: number; fileName: string }>
): string {
  const theme = course.theme

  return `<!DOCTYPE html>
<html lang="${course.meta.language || 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(course.meta.title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${theme.fontFamily || 'Arial, sans-serif'};
      background: ${theme.backgroundColor}; color: ${theme.textColor};
      min-height: 100vh;
    }
    .skip-link {
      position: absolute; left: -9999px; top: 0; z-index: 100;
      background: ${theme.primaryColor}; color: #fff; padding: 8px 16px;
    }
    .skip-link:focus { left: 8px; top: 8px; }
    header {
      background: ${theme.playerShell.headerColor}; color: #fff;
      padding: 32px 24px; text-align: center;
    }
    header h1 { font-size: 28px; font-family: ${theme.fontFamilyHeading || theme.fontFamily || 'Arial, sans-serif'}; margin-bottom: 8px; }
    header p { font-size: 14px; opacity: 0.85; max-width: 600px; margin: 0 auto; }
    .stats {
      display: flex; justify-content: center; gap: 24px; margin-top: 16px;
      font-size: 12px; opacity: 0.8;
    }
    .stats span { display: flex; align-items: center; gap: 4px; }
    main { max-width: 800px; margin: 0 auto; padding: 32px 24px; }
    .module-group { margin-bottom: 24px; }
    .module-title {
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.05em; color: ${theme.primaryColor}; margin-bottom: 8px;
    }
    .lesson-list { list-style: none; }
    .lesson-item { margin-bottom: 4px; }
    .lesson-item a {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      border-radius: 8px; text-decoration: none; color: ${theme.textColor};
      border: 1px solid ${theme.textColor}15; transition: all 0.15s;
    }
    .lesson-item a:hover { background: ${theme.primaryColor}08; border-color: ${theme.primaryColor}40; }
    .lesson-item a:focus { outline: 3px solid ${theme.primaryColor}; outline-offset: 2px; }
    .lesson-num {
      width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; background: ${theme.primaryColor}15; color: ${theme.primaryColor};
      font-size: 12px; font-weight: 700; flex-shrink: 0;
    }
    .lesson-title { font-size: 14px; font-weight: 600; }
    footer {
      text-align: center; padding: 24px; font-size: 11px;
      color: ${theme.textColor}60; border-top: 1px solid ${theme.textColor}10;
    }
    @media (max-width: 600px) {
      main { padding: 16px 12px; }
      header { padding: 24px 16px; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <h1>${escapeHtml(course.meta.title)}</h1>
    <p>${escapeHtml(course.meta.description)}</p>
    <div class="stats">
      <span>${course.modules.length} module${course.modules.length !== 1 ? 's' : ''}</span>
      <span>${allLessons.length} lesson${allLessons.length !== 1 ? 's' : ''}</span>
      ${course.meta.estimatedDuration ? `<span>${course.meta.estimatedDuration} min</span>` : ''}
    </div>
  </header>

  <main id="main-content">
    ${course.modules.map((mod, mi) => {
      const modLessons = allLessons.filter((l) => l.moduleIdx === mi)
      return `<div class="module-group">
      <div class="module-title">${escapeHtml(mod.title)}</div>
      <ol class="lesson-list">
        ${modLessons.map((l) => `<li class="lesson-item">
          <a href="${l.fileName}">
            <span class="lesson-num">${allLessons.indexOf(l) + 1}</span>
            <span class="lesson-title">${escapeHtml(l.lesson.title)}</span>
          </a>
        </li>`).join('\n        ')}
      </ol>
    </div>`
    }).join('\n    ')}
  </main>

  <div style="text-align:center;margin:24px 0;">
    <a href="course-complete.html" style="display:inline-block;padding:10px 24px;background:${theme.primaryColor};color:#fff;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">View all lessons on one page</a>
  </div>

  <footer>
    <p>Built with LuminaUDL</p>
  </footer>
</body>
</html>`
}

function generateCombinedHtml(
  course: Course,
  allLessons: Array<{ lesson: typeof course.modules[0]['lessons'][0]; moduleTitle: string; moduleIdx: number; lessonIdx: number; fileName: string }>
): string {
  const theme = course.theme

  // Render each lesson's content by extracting the body portion from renderLessonHtml
  const lessonSections = allLessons.map((entry, idx) => {
    const fullHtml = renderLessonHtml(course, entry.lesson, entry.moduleTitle, idx, allLessons.length)
    // Extract content between <body> and </body>
    const bodyMatch = fullHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/)
    const bodyContent = bodyMatch ? bodyMatch[1] : ''

    return `<section id="lesson-${entry.moduleIdx}-${entry.lessonIdx}" class="lesson-section">
      <div class="lesson-divider">
        <span class="lesson-divider-module">${escapeHtml(entry.moduleTitle)}</span>
        <h2 class="lesson-divider-title">Lesson ${idx + 1}: ${escapeHtml(entry.lesson.title)}</h2>
      </div>
      <div class="lesson-body">${bodyContent}</div>
    </section>`
  }).join('\n')

  // Build table of contents grouped by module
  const tocHtml = course.modules.map((mod, mi) => {
    const modLessons = allLessons.filter((l) => l.moduleIdx === mi)
    return `<div class="toc-module">
      <div class="toc-module-title">${escapeHtml(mod.title)}</div>
      <ul class="toc-list">
        ${modLessons.map((l) => {
          const globalIdx = allLessons.indexOf(l) + 1
          return `<li><a href="#lesson-${l.moduleIdx}-${l.lessonIdx}">${globalIdx}. ${escapeHtml(l.lesson.title)}</a></li>`
        }).join('\n        ')}
      </ul>
    </div>`
  }).join('\n    ')

  return `<!DOCTYPE html>
<html lang="${course.meta.language || 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(course.meta.title)} — Complete Course</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${theme.fontFamily || 'Arial, sans-serif'};
      background: ${theme.backgroundColor}; color: ${theme.textColor};
      min-height: 100vh; line-height: 1.6;
    }
    .skip-link {
      position: absolute; left: -9999px; top: 0; z-index: 100;
      background: ${theme.primaryColor}; color: #fff; padding: 8px 16px;
    }
    .skip-link:focus { left: 8px; top: 8px; }
    header {
      background: ${theme.playerShell.headerColor}; color: #fff;
      padding: 32px 24px; text-align: center;
    }
    header h1 { font-size: 28px; font-family: ${theme.fontFamilyHeading || theme.fontFamily || 'Arial, sans-serif'}; margin-bottom: 8px; }
    header p { font-size: 14px; opacity: 0.85; max-width: 600px; margin: 0 auto; }
    .stats {
      display: flex; justify-content: center; gap: 24px; margin-top: 16px;
      font-size: 12px; opacity: 0.8;
    }
    .back-link { text-align: center; margin: 16px 0; }
    .back-link a { color: ${theme.primaryColor}; font-size: 13px; text-decoration: none; }
    .back-link a:hover { text-decoration: underline; }
    main { max-width: 900px; margin: 0 auto; padding: 32px 24px; }
    .toc { background: ${theme.textColor}08; border: 1px solid ${theme.textColor}15; border-radius: 12px; padding: 24px; margin-bottom: 40px; }
    .toc h2 { font-size: 16px; font-weight: 700; margin-bottom: 16px; color: ${theme.primaryColor}; }
    .toc-module { margin-bottom: 12px; }
    .toc-module-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${theme.primaryColor}; margin-bottom: 4px; }
    .toc-list { list-style: none; padding-left: 8px; }
    .toc-list li { margin-bottom: 2px; }
    .toc-list a { color: ${theme.textColor}; text-decoration: none; font-size: 13px; }
    .toc-list a:hover { color: ${theme.primaryColor}; text-decoration: underline; }
    .lesson-section { margin-bottom: 48px; scroll-margin-top: 24px; }
    .lesson-divider { border-top: 3px solid ${theme.primaryColor}; padding-top: 16px; margin-bottom: 24px; }
    .lesson-divider-module { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: ${theme.primaryColor}; }
    .lesson-divider-title { font-size: 22px; font-weight: 700; margin-top: 4px; font-family: ${theme.fontFamilyHeading || theme.fontFamily || 'Arial, sans-serif'}; }
    .lesson-body { margin-top: 16px; }
    .lesson-body img { max-width: 100%; height: auto; }
    footer {
      text-align: center; padding: 24px; font-size: 11px;
      color: ${theme.textColor}60; border-top: 1px solid ${theme.textColor}10;
    }
    @media (max-width: 600px) {
      main { padding: 16px 12px; }
      header { padding: 24px 16px; }
    }
  </style>
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <header>
    <h1>${escapeHtml(course.meta.title)}</h1>
    <p>${escapeHtml(course.meta.description)}</p>
    <div class="stats">
      <span>${course.modules.length} module${course.modules.length !== 1 ? 's' : ''}</span>
      <span>${allLessons.length} lesson${allLessons.length !== 1 ? 's' : ''}</span>
      ${course.meta.estimatedDuration ? `<span>${course.meta.estimatedDuration} min</span>` : ''}
    </div>
  </header>

  <div class="back-link"><a href="index.html">&larr; Back to course index</a></div>

  <main id="main-content">
    <nav class="toc">
      <h2>Table of Contents</h2>
      ${tocHtml}
    </nav>

    ${lessonSections}
  </main>

  <footer>
    <p>Built with LuminaUDL</p>
  </footer>
</body>
</html>`
}
