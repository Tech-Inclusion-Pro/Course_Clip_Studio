/**
 * Asset management — copies uploaded files into the course workspace folder
 * so that all assets are self-contained for packaging/export.
 */

import { courseFolderName } from './workspace'
import type { Course } from '@/types/course'

/**
 * Copy a file into the course's assets folder and return the relative path.
 * Returns the new absolute path of the copied file.
 */
export async function copyAssetToCourse(
  workspacePath: string,
  course: Course,
  sourceFilePath: string
): Promise<string> {
  const folderName = courseFolderName(course)
  const assetsDir = `${workspacePath}/${folderName}/assets`

  // Ensure assets directory exists
  const exists = await window.electronAPI.fs.exists(assetsDir)
  if (!exists) {
    await window.electronAPI.fs.mkdir(assetsDir)
  }

  // Get filename, dedup if needed
  const fileName = sourceFilePath.split(/[/\\]/).pop() || 'file'
  let destPath = `${assetsDir}/${fileName}`

  // If source is already in the assets folder, skip copy
  if (sourceFilePath.startsWith(assetsDir)) {
    return sourceFilePath
  }

  // Deduplicate filename
  const destExists = await window.electronAPI.fs.exists(destPath)
  if (destExists) {
    const ext = fileName.includes('.') ? '.' + fileName.split('.').pop() : ''
    const base = ext ? fileName.slice(0, -ext.length) : fileName
    const ts = Date.now().toString(36)
    destPath = `${assetsDir}/${base}-${ts}${ext}`
  }

  await window.electronAPI.fs.copyFile(sourceFilePath, destPath)
  return destPath
}

/**
 * Get the course's assets directory path.
 */
export function getCourseAssetsDir(workspacePath: string, course: Course): string {
  const folderName = courseFolderName(course)
  return `${workspacePath}/${folderName}/assets`
}
