import type { Course, Lesson } from '@/types/course'
import { renderLessonHtml } from '@/lib/scorm/html-renderer'
import { getPreviewPlayerScript } from './preview-player-script'

/**
 * Renders a lesson as a self-contained HTML string for preview in an iframe.
 * Uses the preview player script (postMessage-based) instead of SCORM scripts.
 */
export function renderPreviewHtml(
  course: Course,
  lesson: Lesson,
  moduleTitle: string,
  lessonIndex: number,
  totalLessons: number,
  a11yCSS?: string
): string {
  let html = renderLessonHtml(course, lesson, moduleTitle, lessonIndex, totalLessons, {
    inlineScript: getPreviewPlayerScript()
  })

  // Inject accessibility CSS overrides if enabled
  if (a11yCSS) {
    html = html.replace('</head>', `<style>${a11yCSS}</style>\n</head>`)
  }

  return html
}
