/**
 * xAPI / Tin Can Package Builder
 * Produces a standalone HTML package that sends xAPI statements to a configured LRS.
 * The package includes a tincan.xml launch descriptor.
 */

import JSZip from 'jszip'
import type { Course, XAPIConfig } from '@/types/course'
import { renderLessonHtml } from '@/lib/scorm/html-renderer'
import { getXapiPlayerScript } from './xapi-player-script'
import type { PackageProgress, ProgressCallback } from '@/lib/scorm/scorm-packager'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Generate tincan.xml launch descriptor for xAPI packages.
 */
function generateTincanXml(course: Course): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<tincan xmlns="http://projecttincan.com/tincan.xsd">
  <activities>
    <activity id="urn:lumina:course:${course.id}" type="http://adlnet.gov/expapi/activities/course">
      <name>${escapeXml(course.meta.title)}</name>
      <description>${escapeXml(course.meta.description)}</description>
      <launch lang="${course.meta.language || 'en'}">index.html</launch>
    </activity>
  </activities>
</tincan>`
}

/**
 * Build an xAPI package as a Blob (ZIP archive).
 */
export async function buildXapiPackage(
  course: Course,
  xapiConfig: XAPIConfig,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const zip = new JSZip()

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

  const totalSteps = allLessons.length + 4
  let currentStep = 0

  function progress(step: string) {
    currentStep++
    onProgress?.({ step, current: currentStep, total: totalSteps })
  }

  // 1. Build xAPI config script (injected into each lesson)
  progress('Configuring xAPI endpoint...')
  const authHeader = xapiConfig.authType === 'basic'
    ? 'Basic ' + btoa(`${xapiConfig.username}:${xapiConfig.password}`)
    : ''

  const xapiConfigScript = `
// xAPI Configuration
window.__XAPI_CONFIG__ = {
  endpoint: ${JSON.stringify(xapiConfig.endpoint)},
  auth: ${JSON.stringify(authHeader)},
  actor: {
    name: ${JSON.stringify(xapiConfig.actorName)},
    mbox: ${JSON.stringify('mailto:' + xapiConfig.actorEmail)}
  },
  courseTitle: ${JSON.stringify(course.meta.title)},
  activityId: ${JSON.stringify('urn:lumina:course:' + course.id)}
};
`
  zip.file('xapi-config.js', xapiConfigScript)

  // 2. Add xAPI player script
  progress('Adding xAPI player scripts...')
  zip.file('player.js', getXapiPlayerScript())

  // 3. Create a no-op scorm-api.js (player.js calls scormNav/scormFinish which don't need SCORM)
  zip.file('scorm-api.js', '// xAPI mode — no SCORM API needed\nwindow.SCORM = { init:function(){}, setComplete:function(){}, finish:function(){}, setSessionTime:function(){} };\n')

  // 4. Render each lesson as HTML
  const lessonFiles: string[] = []

  for (const { lesson, moduleTitle, moduleIdx, lessonIdx } of allLessons) {
    const fileName = `lesson-${moduleIdx}-${lessonIdx}.html`

    progress(`Rendering ${lesson.title}...`)

    let html = renderLessonHtml(course, lesson, moduleTitle, lessonFiles.length, allLessons.length)
    // Inject xAPI config before player.js
    html = html.replace(
      '<script src="scorm-api.js"></script>',
      '<script src="xapi-config.js"></script>\n  <script src="scorm-api.js"></script>'
    )

    zip.file(fileName, html)
    lessonFiles.push(fileName)
  }

  // 5. Generate index.html that redirects to first lesson
  progress('Generating index and tincan.xml...')
  const indexHtml = generateIndexHtml(course, lessonFiles)
  zip.file('index.html', indexHtml)

  // 6. Generate tincan.xml
  zip.file('tincan.xml', generateTincanXml(course))

  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })

  return blob
}

function generateIndexHtml(course: Course, lessonFiles: string[]): string {
  const theme = course.theme
  const lessonList = course.modules.flatMap((mod, mi) =>
    mod.lessons.map((l, li) => ({
      title: l.title,
      module: mod.title,
      file: `lesson-${mi}-${li}.html`
    }))
  )

  return `<!DOCTYPE html>
<html lang="${course.meta.language || 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeXml(course.meta.title)}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: ${theme.fontFamily || 'Arial, sans-serif'};
      background: ${theme.backgroundColor}; color: ${theme.textColor};
      display: flex; flex-direction: column; min-height: 100vh;
    }
    header { background: ${theme.playerShell.headerColor}; color: #fff; padding: 20px 24px; }
    header h1 { font-size: 24px; margin-bottom: 4px; }
    header p { font-size: 14px; opacity: 0.8; }
    main { max-width: 800px; margin: 0 auto; padding: 32px 24px; width: 100%; }
    .lesson-list { list-style: none; }
    .lesson-item { margin-bottom: 4px; }
    .lesson-item a {
      display: flex; align-items: center; gap: 12px; padding: 12px 16px;
      border-radius: 8px; text-decoration: none; color: ${theme.textColor};
      border: 1px solid ${theme.textColor}15; transition: background 0.15s;
    }
    .lesson-item a:hover { background: ${theme.primaryColor}08; border-color: ${theme.primaryColor}40; }
    .lesson-num { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;
      border-radius: 50%; background: ${theme.primaryColor}15; color: ${theme.primaryColor};
      font-size: 12px; font-weight: 700; flex-shrink: 0; }
    .lesson-info { flex: 1; }
    .lesson-title { font-size: 14px; font-weight: 600; }
    .lesson-module { font-size: 11px; color: ${theme.textColor}80; margin-top: 2px; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeXml(course.meta.title)}</h1>
    <p>${escapeXml(course.meta.description)}</p>
  </header>
  <main>
    <ol class="lesson-list">
      ${lessonList.map((l, i) => `<li class="lesson-item">
        <a href="${l.file}">
          <span class="lesson-num">${i + 1}</span>
          <span class="lesson-info">
            <span class="lesson-title">${escapeXml(l.title)}</span>
            <span class="lesson-module">${escapeXml(l.module)}</span>
          </span>
        </a>
      </li>`).join('\n      ')}
    </ol>
  </main>
</body>
</html>`
}
