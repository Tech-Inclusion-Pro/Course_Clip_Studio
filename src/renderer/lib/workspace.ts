/**
 * Workspace persistence utilities.
 * Each course is stored as a subfolder with a course.json file.
 */

import type { Course } from '@/types/course'

const SETTINGS_KEY = 'workspacePath'

// ─── Settings helpers ───

export async function persistWorkspacePath(path: string): Promise<void> {
  await window.electronAPI.settings.set(SETTINGS_KEY, path)
}

export async function loadWorkspacePath(): Promise<string | null> {
  const val = await window.electronAPI.settings.get(SETTINGS_KEY)
  return typeof val === 'string' ? val : null
}

// ─── Folder naming ───

export function courseFolderName(course: Course): string {
  const safe = course.meta.title
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .replace(/\s+/g, '-')
    .toLowerCase()
    .slice(0, 48)
  // Append short id suffix for uniqueness
  const suffix = course.id.slice(-8)
  return `${safe}-${suffix}`
}

// ─── Workspace operations ───

export async function loadWorkspace(workspacePath: string): Promise<Course[]> {
  const entries = await window.electronAPI.fs.readDir(workspacePath)
  const courses: Course[] = []

  for (const entry of entries) {
    if (!entry.isDirectory) continue
    const coursePath = `${workspacePath}/${entry.name}/course.json`
    const exists = await window.electronAPI.fs.exists(coursePath)
    if (!exists) continue

    try {
      const json = await window.electronAPI.fs.readFile(coursePath, 'utf-8')
      const course = JSON.parse(json) as Course
      if (course.id && course.meta) {
        courses.push(course)
      }
    } catch {
      // Skip corrupt files
      console.warn(`Skipping corrupt course at ${coursePath}`)
    }
  }

  return courses
}

export async function saveCourseToWorkspace(
  workspacePath: string,
  course: Course
): Promise<void> {
  const folderName = courseFolderName(course)
  const folderPath = `${workspacePath}/${folderName}`
  const filePath = `${folderPath}/course.json`

  // Check if folder already exists with a different name (same id suffix)
  const suffix = course.id.slice(-8)
  const entries = await window.electronAPI.fs.readDir(workspacePath)
  for (const entry of entries) {
    if (entry.isDirectory && entry.name.endsWith(`-${suffix}`) && entry.name !== folderName) {
      // Course was renamed — remove old folder
      await window.electronAPI.fs.removeDir(`${workspacePath}/${entry.name}`)
    }
  }

  await window.electronAPI.fs.writeFile(filePath, JSON.stringify(course, null, 2))
}

export async function deleteCourseFromWorkspace(
  workspacePath: string,
  courseId: string
): Promise<void> {
  const suffix = courseId.slice(-8)
  const entries = await window.electronAPI.fs.readDir(workspacePath)
  for (const entry of entries) {
    if (entry.isDirectory && entry.name.endsWith(`-${suffix}`)) {
      await window.electronAPI.fs.removeDir(`${workspacePath}/${entry.name}`)
      return
    }
  }
}
