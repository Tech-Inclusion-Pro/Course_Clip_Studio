/**
 * SCORM 1.2 Packager
 * Orchestrates building the complete SCORM package: manifest + HTML + scripts → ZIP.
 */

import JSZip from 'jszip'
import type { Course } from '@/types/course'
import { generateManifest, type ManifestResource } from './manifest-generator'
import { renderLessonHtml } from './html-renderer'
import { getScormApiScript, getPlayerScript } from './scorm-api-script'

export interface PackageProgress {
  step: string
  current: number
  total: number
}

export type ProgressCallback = (progress: PackageProgress) => void

/**
 * Build a SCORM 1.2 package as a Blob (ZIP archive).
 */
export async function buildScormPackage(
  course: Course,
  onProgress?: ProgressCallback
): Promise<Blob> {
  const zip = new JSZip()

  // Count total lessons for progress tracking
  const allLessons: Array<{ lesson: typeof course.modules[0]['lessons'][0]; moduleTitle: string; moduleIdx: number; lessonIdx: number }> = []
  for (let mi = 0; mi < course.modules.length; mi++) {
    const mod = course.modules[mi]
    for (let li = 0; li < mod.lessons.length; li++) {
      allLessons.push({ lesson: mod.lessons[li], moduleTitle: mod.title, moduleIdx: mi, lessonIdx: li })
    }
  }

  const totalSteps = allLessons.length + 3 // lessons + scripts + manifest + zip
  let currentStep = 0

  function progress(step: string) {
    currentStep++
    onProgress?.({ step, current: currentStep, total: totalSteps })
  }

  // 1. Add SCORM API wrapper script
  progress('Adding SCORM API wrapper...')
  zip.file('scorm-api.js', getScormApiScript())

  // 2. Add player script
  progress('Adding player scripts...')
  zip.file('player.js', getPlayerScript())

  // 3. Render each lesson as an HTML file and collect manifest resources
  const resources: ManifestResource[] = []
  let globalLessonIdx = 0

  for (const { lesson, moduleTitle, moduleIdx, lessonIdx } of allLessons) {
    const fileName = `lesson-${moduleIdx}-${lessonIdx}.html`

    progress(`Rendering ${lesson.title}...`)

    const html = renderLessonHtml(
      course,
      lesson,
      moduleTitle,
      globalLessonIdx,
      allLessons.length
    )

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

  // 4. Generate and add imsmanifest.xml
  progress('Generating SCORM manifest...')
  const manifest = generateManifest(course, resources)
  zip.file('imsmanifest.xml', manifest)

  // 5. Build ZIP
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 }
  })

  return blob
}

/**
 * Trigger a browser download of the SCORM package.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
