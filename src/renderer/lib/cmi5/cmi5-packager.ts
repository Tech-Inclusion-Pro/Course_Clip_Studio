/**
 * cmi5 Package Builder — creates a cmi5-compliant export package.
 *
 * A cmi5 package is a ZIP containing:
 * - cmi5.xml (course structure)
 * - Course HTML files (one per AU/lesson)
 * - Embedded cmi5 player script
 * - Assets (media files)
 */

import type { Course } from '@/types/course'
import type { Cmi5ExportOptions } from '@/types/analytics'
import { buildCmi5Structure, generateCmi5XML } from './cmi5-structure'
import { getCmi5PlayerScript } from './cmi5-player-script'

export interface Cmi5PackageFile {
  path: string
  content: string
  type: 'text' | 'binary'
}

/**
 * Generate all files needed for a cmi5 export package.
 * Returns an array of file descriptors that can be zipped together.
 */
export function buildCmi5Package(
  course: Course,
  htmlContent: string,
  options: Cmi5ExportOptions
): Cmi5PackageFile[] {
  const files: Cmi5PackageFile[] = []

  // 1. cmi5.xml course structure
  const structure = buildCmi5Structure(course, options)
  const cmi5XML = generateCmi5XML(structure)
  files.push({ path: 'cmi5.xml', content: cmi5XML, type: 'text' })

  // 2. Inject cmi5 player script into HTML
  const cmi5Script = getCmi5PlayerScript()
  const enhancedHtml = injectCmi5Script(htmlContent, cmi5Script, options)
  files.push({ path: 'index.html', content: enhancedHtml, type: 'text' })

  // 3. Generate per-lesson entry points (for LMS AU launch)
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const lessonHtml = generateLessonEntryPage(lesson.id, lesson.title)
      files.push({
        path: `lessons/${lesson.id}.html`,
        content: lessonHtml,
        type: 'text'
      })
    }
  }

  return files
}

/**
 * Inject cmi5 runtime script into the main HTML content.
 */
function injectCmi5Script(
  html: string,
  cmi5Script: string,
  options: Cmi5ExportOptions
): string {
  // Build the cmi5 integration hooks
  const integrationScript = `
<script>
${cmi5Script}

// cmi5 lifecycle hooks for LuminaUDL player
document.addEventListener('DOMContentLoaded', function() {
  // Hook into existing LuminaUDL player events
  var origComplete = window.onCourseComplete;
  window.onCourseComplete = function(score) {
    if (origComplete) origComplete(score);
    if (window.cmi5) {
      if (score >= ${options.masteryScore}) {
        window.cmi5.pass(score);
      } else {
        window.cmi5.fail(score);
      }
      window.cmi5.complete();
    }
  };

  // Progress updates
  var origProgress = window.onProgressUpdate;
  window.onProgressUpdate = function(percent) {
    if (origProgress) origProgress(percent);
    if (window.cmi5) {
      window.cmi5.progress(percent);
    }
  };
});
</script>`

  // Insert before </body>
  if (html.includes('</body>')) {
    return html.replace('</body>', integrationScript + '\n</body>')
  }
  return html + integrationScript
}

/**
 * Generate a minimal lesson entry page that redirects to the main player
 * with the lesson ID as a hash parameter.
 */
function generateLessonEntryPage(lessonId: string, lessonTitle: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escHtml(lessonTitle)}</title>
  <script>
    // Redirect to main player with lesson context and cmi5 launch params
    var params = window.location.search;
    window.location.href = '../index.html' + params + '#/lesson/${lessonId}';
  </script>
</head>
<body>
  <p>Loading ${escHtml(lessonTitle)}...</p>
</body>
</html>`
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * Get the default cmi5 export options.
 */
export function getDefaultCmi5Options(): Cmi5ExportOptions {
  return {
    includeUDLExtensions: true,
    masteryScore: 80,
    moveOnCriteria: 'CompletedOrPassed',
    launchMethod: 'AnyWindow'
  }
}
