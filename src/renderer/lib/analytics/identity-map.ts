/**
 * Identity Map — manages the mapping between anonymized learner IDs
 * and their real names/emails when identified reporting is enabled.
 *
 * Stored at: {workspacePath}/{courseFolder}/analytics/identity-map.json
 * Only populated when the author explicitly enables identified mode.
 */

import type { Course } from '@/types/course'
import type { IdentityMap, IdentityMapEntry, LuminaStatement } from '@/types/analytics'
import { courseFolderName } from '@/lib/workspace'

const MAP_VERSION = '1.0'

function mapPath(workspacePath: string, course: Course): string {
  const folder = courseFolderName(course)
  return `${workspacePath}/${folder}/analytics/identity-map.json`
}

function emptyMap(courseId: string): IdentityMap {
  return {
    version: MAP_VERSION,
    courseId,
    identifiedModeEnabled: false,
    ferpaAcknowledgedAt: null,
    ferpaAcknowledgedBy: null,
    entries: []
  }
}

export async function loadIdentityMap(
  workspacePath: string,
  course: Course
): Promise<IdentityMap> {
  const path = mapPath(workspacePath, course)
  try {
    const exists = await window.electronAPI.fs.exists(path)
    if (!exists) return emptyMap(course.id)
    const json = await window.electronAPI.fs.readFile(path, 'utf-8')
    const map = JSON.parse(json) as IdentityMap
    if (!map.entries) return emptyMap(course.id)
    return map
  } catch {
    return emptyMap(course.id)
  }
}

export async function saveIdentityMap(
  workspacePath: string,
  course: Course,
  map: IdentityMap
): Promise<void> {
  const path = mapPath(workspacePath, course)
  await window.electronAPI.fs.writeFile(path, JSON.stringify(map, null, 2))
}

/**
 * Enable identified mode with FERPA acknowledgment.
 */
export async function enableIdentifiedMode(
  workspacePath: string,
  course: Course,
  acknowledgedBy: string
): Promise<IdentityMap> {
  const map = await loadIdentityMap(workspacePath, course)
  map.identifiedModeEnabled = true
  map.ferpaAcknowledgedAt = new Date().toISOString()
  map.ferpaAcknowledgedBy = acknowledgedBy
  await saveIdentityMap(workspacePath, course, map)
  return map
}

/**
 * Disable identified mode. Does NOT delete existing entries —
 * they remain for audit purposes but won't be displayed.
 */
export async function disableIdentifiedMode(
  workspacePath: string,
  course: Course
): Promise<IdentityMap> {
  const map = await loadIdentityMap(workspacePath, course)
  map.identifiedModeEnabled = false
  await saveIdentityMap(workspacePath, course, map)
  return map
}

/**
 * Add or update a learner identity mapping.
 */
export async function upsertLearnerIdentity(
  workspacePath: string,
  course: Course,
  entry: IdentityMapEntry
): Promise<IdentityMap> {
  const map = await loadIdentityMap(workspacePath, course)
  const idx = map.entries.findIndex((e) => e.anonymizedId === entry.anonymizedId)
  if (idx >= 0) {
    map.entries[idx] = { ...map.entries[idx], ...entry }
  } else {
    map.entries.push(entry)
  }
  await saveIdentityMap(workspacePath, course, map)
  return map
}

/**
 * Resolve a learner display name from the identity map.
 * Returns the anonymized ID if not in identified mode or not found.
 */
export function resolveLearnerName(
  map: IdentityMap,
  anonymizedId: string
): string {
  if (!map.identifiedModeEnabled) {
    return formatAnonymizedId(anonymizedId)
  }
  const entry = map.entries.find((e) => e.anonymizedId === anonymizedId)
  return entry?.displayName ?? formatAnonymizedId(anonymizedId)
}

/**
 * Format an anonymized ID into a display-friendly label.
 */
function formatAnonymizedId(id: string): string {
  const short = id.replace(/-/g, '').slice(0, 6).toUpperCase()
  return `Learner ${short}`
}

/**
 * Get unique learner IDs from a set of statements.
 */
export function getUniqueLearnerIds(statements: LuminaStatement[]): string[] {
  return [...new Set(statements.map((s) => s.actorId))]
}

/**
 * Bulk import learner identities (e.g., from a CSV roster).
 */
export async function importLearnerRoster(
  workspacePath: string,
  course: Course,
  entries: Array<{ anonymizedId: string; displayName: string; email?: string }>
): Promise<IdentityMap> {
  const map = await loadIdentityMap(workspacePath, course)
  const now = new Date().toISOString()
  for (const e of entries) {
    const idx = map.entries.findIndex((existing) => existing.anonymizedId === e.anonymizedId)
    const entry: IdentityMapEntry = {
      anonymizedId: e.anonymizedId,
      displayName: e.displayName,
      email: e.email,
      enrolledAt: now,
      lastActivityAt: now
    }
    if (idx >= 0) {
      map.entries[idx] = { ...map.entries[idx], ...entry }
    } else {
      map.entries.push(entry)
    }
  }
  await saveIdentityMap(workspacePath, course, map)
  return map
}
