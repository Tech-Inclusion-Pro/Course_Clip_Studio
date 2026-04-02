/**
 * SCORM 1.2 Packager
 * Orchestrates building the complete SCORM package: manifest + HTML + scripts → ZIP.
 */

import JSZip from 'jszip'
import type { Course, ContentBlock } from '@/types/course'
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
 * Collect all local file paths referenced in course blocks.
 */
function collectAssetPaths(course: Course): string[] {
  const paths = new Set<string>()

  function addPath(p: string | undefined | null) {
    if (p && (p.startsWith('/') || /^[A-Za-z]:\\/.test(p))) {
      paths.add(p)
    }
  }

  // Theme logo
  addPath(course.theme.logoPath)

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        collectBlockPaths(block, addPath)
      }
    }
  }

  return [...paths]
}

function collectBlockPaths(block: ContentBlock, addPath: (p: string | undefined | null) => void): void {
  switch (block.type) {
    case 'media':
      addPath(block.assetPath)
      break
    case 'video':
      if (block.source === 'upload') addPath(block.url)
      addPath(block.poster)
      addPath(block.srtFilePath)
      break
    case 'audio':
      addPath(block.assetPath)
      addPath(block.srtFilePath)
      break
    case 'slide':
      addPath(block.backgroundImage)
      for (const el of block.elements) {
        addPath(el.data.imagePath)
      }
      break
  }
}

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

  // Collect assets
  const assetPaths = collectAssetPaths(course)
  const totalSteps = allLessons.length + assetPaths.length + 3
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

  // 3. Read and add asset files to ZIP, build path map
  const pathMap = new Map<string, string>() // absolute path -> relative zip path

  for (const assetPath of assetPaths) {
    const fileName = assetPath.split(/[/\\]/).pop() || 'file'
    // Deduplicate filenames in the ZIP
    let zipPath = `assets/${fileName}`
    let counter = 1
    while ([...pathMap.values()].includes(zipPath)) {
      const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : ''
      const base = ext ? fileName.slice(0, -ext.length) : fileName
      zipPath = `assets/${base}-${counter}${ext}`
      counter++
    }

    progress(`Packaging ${fileName}...`)
    try {
      const exists = await window.electronAPI.fs.exists(assetPath)
      if (exists) {
        const buffer = await window.electronAPI.fs.readFileBuffer(assetPath)
        zip.file(zipPath, buffer)
        pathMap.set(assetPath, zipPath)
      }
    } catch {
      // Skip files that can't be read
    }
  }

  // 4. Render each lesson as an HTML file and collect manifest resources
  const resources: ManifestResource[] = []
  let globalLessonIdx = 0
  const assetFileNames = [...new Set(pathMap.values())]

  for (const { lesson, moduleTitle, moduleIdx, lessonIdx } of allLessons) {
    const fileName = `lesson-${moduleIdx}-${lessonIdx}.html`

    progress(`Rendering ${lesson.title}...`)

    let html = renderLessonHtml(
      course,
      lesson,
      moduleTitle,
      globalLessonIdx,
      allLessons.length
    )

    // Replace absolute paths with relative ZIP paths
    for (const [absPath, relPath] of pathMap) {
      html = html.replaceAll(absPath, relPath)
    }

    zip.file(fileName, html)

    resources.push({
      identifier: `res-${moduleIdx}-${lessonIdx}`,
      href: fileName,
      type: 'sco',
      title: lesson.title,
      files: [fileName, 'scorm-api.js', 'player.js', ...assetFileNames]
    })

    globalLessonIdx++
  }

  // 5. Generate and add imsmanifest.xml
  progress('Generating SCORM manifest...')
  const manifest = generateManifest(course, resources)
  zip.file('imsmanifest.xml', manifest)

  // 6. Build ZIP
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
