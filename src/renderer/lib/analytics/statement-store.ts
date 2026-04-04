/**
 * JSON file I/O for xAPI statement storage per course.
 * Uses window.electronAPI.fs for file operations.
 */

import type { Course } from '@/types/course'
import type { LuminaStatement, StatementStore } from '@/types/analytics'
import { courseFolderName } from '@/lib/workspace'

const STORE_VERSION = '1.0'

function statementsPath(workspacePath: string, course: Course): string {
  const folder = courseFolderName(course)
  return `${workspacePath}/${folder}/analytics/statements.json`
}

function emptyStore(): StatementStore {
  return { version: STORE_VERSION, statements: [], lastUpdated: new Date().toISOString() }
}

export async function loadStatements(workspacePath: string, course: Course): Promise<StatementStore> {
  const path = statementsPath(workspacePath, course)
  try {
    const exists = await window.electronAPI.fs.exists(path)
    if (!exists) return emptyStore()
    const json = await window.electronAPI.fs.readFile(path, 'utf-8')
    const store = JSON.parse(json) as StatementStore
    if (!store.statements) return emptyStore()
    return store
  } catch {
    return emptyStore()
  }
}

export async function saveStatements(
  workspacePath: string,
  course: Course,
  store: StatementStore
): Promise<void> {
  const path = statementsPath(workspacePath, course)
  store.lastUpdated = new Date().toISOString()
  await window.electronAPI.fs.writeFile(path, JSON.stringify(store, null, 2))
}

export async function addStatements(
  workspacePath: string,
  course: Course,
  newStatements: LuminaStatement[]
): Promise<StatementStore> {
  const store = await loadStatements(workspacePath, course)
  store.statements.push(...newStatements)
  store.lastUpdated = new Date().toISOString()
  await saveStatements(workspacePath, course, store)
  return store
}

export async function clearStatements(
  workspacePath: string,
  course: Course
): Promise<void> {
  const store = emptyStore()
  await saveStatements(workspacePath, course, store)
}

export function importStatementsFromJson(jsonString: string): LuminaStatement[] {
  const parsed = JSON.parse(jsonString)
  if (Array.isArray(parsed)) return parsed as LuminaStatement[]
  if (parsed.statements && Array.isArray(parsed.statements)) return parsed.statements as LuminaStatement[]
  return []
}
