import JSZip from 'jszip'
import type { Course } from '@/types/course'

/**
 * Save a course as a .lumina ZIP file containing course.json + media/ assets.
 */
export async function saveLuminaFile(course: Course): Promise<ArrayBuffer> {
  const zip = new JSZip()
  zip.file('course.json', JSON.stringify(course, null, 2))

  // Collect media asset paths from blocks
  const mediaPaths = new Set<string>()
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if ('assetPath' in block && block.assetPath) mediaPaths.add(block.assetPath)
        if ('url' in block && block.type === 'video' && block.source === 'upload' && block.url) mediaPaths.add(block.url)
        if ('poster' in block && block.poster) mediaPaths.add(block.poster)
      }
    }
  }

  // Try to bundle local media files
  for (const path of mediaPaths) {
    if (path.startsWith('http://') || path.startsWith('https://')) continue
    try {
      const buffer = await window.electronAPI.fs.readFileBuffer(path)
      const fileName = path.split('/').pop() || path
      zip.file(`media/${fileName}`, buffer)
    } catch {
      // Skip files that can't be read
    }
  }

  return await zip.generateAsync({ type: 'arraybuffer' })
}

/**
 * Load a course from a .lumina ZIP file or plain course.json.
 */
export async function loadLuminaFile(data: ArrayBuffer): Promise<{ course: Course; mediaFiles: Map<string, ArrayBuffer> }> {
  const mediaFiles = new Map<string, ArrayBuffer>()

  // Try as ZIP first
  try {
    const zip = await JSZip.loadAsync(data)
    const courseFile = zip.file('course.json')
    if (!courseFile) throw new Error('No course.json found in archive')

    const courseJson = await courseFile.async('string')
    const course = JSON.parse(courseJson) as Course

    // Extract media files
    const mediaFolder = zip.folder('media')
    if (mediaFolder) {
      const files = mediaFolder.file(/.+/)
      for (const file of files) {
        const buffer = await file.async('arraybuffer')
        const name = file.name.replace('media/', '')
        mediaFiles.set(name, buffer)
      }
    }

    return { course, mediaFiles }
  } catch {
    // Fall back to plain JSON
    const text = new TextDecoder().decode(data)
    const course = JSON.parse(text) as Course
    return { course, mediaFiles }
  }
}
