import type { Course, Lesson } from '@/types/course'
import { renderLessonHtml } from '@/lib/scorm/html-renderer'
import { getPreviewPlayerScript } from './preview-player-script'

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'audio/ogg',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
}

function getMimeType(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase()
  return MIME_TYPES[ext] || 'application/octet-stream'
}

/**
 * Finds local file paths in src="..." attributes and replaces them with
 * base64 data URIs so the iframe CSP doesn't block them.
 */
async function inlineLocalAssets(html: string): Promise<string> {
  // Match src="..." where the path looks like a local file (starts with / or drive letter)
  const srcRegex = /src="((?:\/|[A-Za-z]:\\)[^"]+)"/g
  const matches: { full: string; path: string }[] = []

  let match: RegExpExecArray | null
  while ((match = srcRegex.exec(html)) !== null) {
    matches.push({ full: match[0], path: match[1] })
  }

  if (matches.length === 0) return html

  // Deduplicate paths
  const uniquePaths = [...new Set(matches.map((m) => m.path))]
  const dataUriMap = new Map<string, string>()

  for (const filePath of uniquePaths) {
    try {
      const exists = await window.electronAPI.fs.exists(filePath)
      if (!exists) continue
      const base64 = await window.electronAPI.fs.readFile(filePath, 'base64')
      const mime = getMimeType(filePath)
      dataUriMap.set(filePath, `data:${mime};base64,${base64}`)
    } catch {
      // Skip files that can't be read
    }
  }

  let result = html
  for (const [filePath, dataUri] of dataUriMap) {
    result = result.replaceAll(`src="${filePath}"`, `src="${dataUri}"`)
  }

  return result
}

/**
 * Renders a lesson as a self-contained HTML string for preview in an iframe.
 * Uses the preview player script (postMessage-based) instead of SCORM scripts.
 * Async to allow inlining local file assets as base64 data URIs.
 */
export async function renderPreviewHtml(
  course: Course,
  lesson: Lesson,
  moduleTitle: string,
  lessonIndex: number,
  totalLessons: number,
  a11yCSS?: string
): Promise<string> {
  let html = renderLessonHtml(course, lesson, moduleTitle, lessonIndex, totalLessons, {
    inlineScript: getPreviewPlayerScript()
  })

  // Inject Google Font URL if configured
  if (course.theme.googleFontUrl) {
    html = html.replace('</head>', `<link rel="stylesheet" href="${course.theme.googleFontUrl}" />\n</head>`)
  }

  // Inject accessibility CSS overrides if enabled
  if (a11yCSS) {
    html = html.replace('</head>', `<style>${a11yCSS}</style>\n</head>`)
  }

  // Inline local file assets as base64 data URIs to avoid CSP blocking
  html = await inlineLocalAssets(html)

  return html
}
