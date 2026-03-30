/**
 * SCORM 2004 Packager
 * Orchestrates building a complete SCORM 2004 package: manifest + HTML + scripts → ZIP.
 */

import JSZip from 'jszip'
import type { Course } from '@/types/course'
import type { ManifestResource } from './manifest-generator'
import { generateScorm2004Manifest } from './scorm2004-manifest'
import { renderLessonHtml } from './html-renderer'
import { getScorm2004ApiScript, getScorm2004PlayerScript } from './scorm2004-api-script'
import type { PackageProgress, ProgressCallback } from './scorm-packager'

/**
 * Build a SCORM 2004 package as a Blob (ZIP archive).
 */
export async function buildScorm2004Package(
  course: Course,
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

  const totalSteps = allLessons.length + 3
  let currentStep = 0

  function progress(step: string) {
    currentStep++
    onProgress?.({ step, current: currentStep, total: totalSteps })
  }

  // 1. Add SCORM 2004 API wrapper
  progress('Adding SCORM 2004 API wrapper...')
  zip.file('scorm-api.js', getScorm2004ApiScript())

  // 2. Add player script
  progress('Adding player scripts...')
  zip.file('player.js', getScorm2004PlayerScript())

  // 3. Render each lesson as HTML
  const resources: ManifestResource[] = []
  let globalLessonIdx = 0

  for (const { lesson, moduleTitle, moduleIdx, lessonIdx } of allLessons) {
    const fileName = `lesson-${moduleIdx}-${lessonIdx}.html`

    progress(`Rendering ${lesson.title}...`)

    const html = renderLessonHtml(course, lesson, moduleTitle, globalLessonIdx, allLessons.length)
    zip.file(fileName, html)

    resources.push({
      identifier: `res-${moduleIdx}-${lessonIdx}`,
      href: fileName,
      type: 'sco',
      title: lesson.title,
      files: [fileName, 'scorm-api.js', 'player.js']
    })

    globalLessonIdx++
  }

  // 4. Generate SCORM 2004 manifest
  progress('Generating SCORM 2004 manifest...')
  const manifest = generateScorm2004Manifest(course, resources)
  zip.file('imsmanifest.xml', manifest)

  // 5. Build ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })

  return blob
}
