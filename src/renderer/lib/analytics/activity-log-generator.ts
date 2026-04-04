/**
 * Activity Log Generator — converts raw xAPI statements into
 * human-readable plain-language summaries.
 *
 * Supports two voices:
 * - first-person: "You completed Lesson 2." (for learner self-reports)
 * - third-person: "Completed Lesson 2." (for educator reports)
 *
 * Groups entries by date and generates daily summaries.
 */

import type { LuminaStatement, ActivityLogEntry, ActivityLogGroup, ActivityLogVoice } from '@/types/analytics'
import { getVerbDisplay } from '@/lib/analytics/verbs'

// ─── Verb-specific plain language templates ───

interface VerbTemplate {
  firstPerson: string
  thirdPerson: string
}

const VERB_TEMPLATES: Record<string, VerbTemplate> = {
  'launched': {
    firstPerson: 'You opened {object}',
    thirdPerson: 'Opened {object}'
  },
  'experienced': {
    firstPerson: 'You viewed {object}',
    thirdPerson: 'Viewed {object}'
  },
  'interacted': {
    firstPerson: 'You interacted with {object}',
    thirdPerson: 'Interacted with {object}'
  },
  'attempted': {
    firstPerson: 'You started {object}',
    thirdPerson: 'Started {object}'
  },
  'answered': {
    firstPerson: 'You answered a question in {object}',
    thirdPerson: 'Answered a question in {object}'
  },
  'passed': {
    firstPerson: 'You passed {object}{score}',
    thirdPerson: 'Passed {object}{score}'
  },
  'failed': {
    firstPerson: 'You did not meet the threshold on {object}{score}',
    thirdPerson: 'Did not meet the threshold on {object}{score}'
  },
  'completed': {
    firstPerson: 'You completed {object}',
    thirdPerson: 'Completed {object}'
  },
  'progressed': {
    firstPerson: 'You advanced to {object}',
    thirdPerson: 'Advanced to {object}'
  },
  'suspended': {
    firstPerson: 'You paused your session with a bookmark saved',
    thirdPerson: 'Paused session with bookmark saved'
  },
  'resumed': {
    firstPerson: 'You resumed from your last bookmark',
    thirdPerson: 'Resumed from last bookmark'
  },
  'commented': {
    firstPerson: 'You submitted a response in {object}',
    thirdPerson: 'Submitted a response in {object}'
  },
  'accessed audio alternative': {
    firstPerson: 'You accessed the audio version of {object}',
    thirdPerson: 'Accessed audio version of {object}'
  },
  'accessed text alternative': {
    firstPerson: 'You opened the transcript for {object}',
    thirdPerson: 'Opened transcript for {object}'
  },
  'accessed visual alternative': {
    firstPerson: 'You viewed the visual alternative for {object}',
    thirdPerson: 'Viewed visual alternative for {object}'
  },
  'accessed caption track': {
    firstPerson: 'You enabled captions on {object}',
    thirdPerson: 'Enabled captions on {object}'
  },
  'switched language': {
    firstPerson: 'You switched the language on {object}',
    thirdPerson: 'Switched language on {object}'
  },
  'expanded definition': {
    firstPerson: 'You expanded a definition in {object}',
    thirdPerson: 'Expanded a definition in {object}'
  },
  'used extended time': {
    firstPerson: 'You activated extended time on {object}',
    thirdPerson: 'Activated extended time on {object}'
  },
  'used text to speech': {
    firstPerson: 'You used text-to-speech on {object}',
    thirdPerson: 'Used text-to-speech on {object}'
  },
  'submitted drawing': {
    firstPerson: 'You submitted a drawing response in {object}',
    thirdPerson: 'Submitted drawing response in {object}'
  },
  'submitted audio response': {
    firstPerson: 'You submitted an audio response in {object}',
    thirdPerson: 'Submitted audio response in {object}'
  },
  'chose pathway': {
    firstPerson: 'You chose a learning pathway in {object}',
    thirdPerson: 'Chose a learning pathway in {object}'
  },
  'replayed content': {
    firstPerson: 'You revisited {object}',
    thirdPerson: 'Revisited {object}'
  },
  'bookmarked': {
    firstPerson: 'You bookmarked {object}',
    thirdPerson: 'Bookmarked {object}'
  },
  'rated difficulty': {
    firstPerson: 'You rated the difficulty of {object}',
    thirdPerson: 'Rated difficulty of {object}'
  }
}

// ─── Statement to Activity Log Entry ───

function formatScore(statement: LuminaStatement): string {
  if (statement.scoreScaled != null) {
    return ` with a score of ${Math.round(statement.scoreScaled * 100)}%`
  }
  if (statement.scoreRaw != null && statement.scoreMax != null) {
    return ` (${statement.scoreRaw} of ${statement.scoreMax})`
  }
  return ''
}

function getVerbKey(statement: LuminaStatement): string {
  const display = statement.verbDisplay || getVerbDisplay(statement.verb)
  return display.toLowerCase()
}

export function statementToLogEntry(
  statement: LuminaStatement,
  voice: ActivityLogVoice = 'first-person'
): ActivityLogEntry {
  const verbKey = getVerbKey(statement)
  const template = VERB_TEMPLATES[verbKey]
  const objectName = statement.objectName || 'this content'
  const score = formatScore(statement)

  let summary: string
  if (template) {
    const raw = voice === 'first-person' ? template.firstPerson : template.thirdPerson
    summary = raw
      .replace('{object}', objectName)
      .replace('{score}', score)
  } else {
    const prefix = voice === 'first-person' ? 'You ' : ''
    summary = `${prefix}${verbKey} ${objectName}${score}`
  }

  return {
    timestamp: statement.timestamp,
    verbDisplay: statement.verbDisplay || getVerbDisplay(statement.verb),
    objectDisplay: objectName,
    result: {
      score: statement.scoreScaled != null ? Math.round(statement.scoreScaled * 100) : undefined,
      success: statement.success,
      completion: statement.completion
    },
    udlPrinciple: statement.udlPrinciple ?? undefined,
    plainLanguageSummary: summary
  }
}

// ─── Group Entries by Date ───

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function groupByDate(entries: ActivityLogEntry[]): ActivityLogGroup[] {
  const groups = new Map<string, ActivityLogEntry[]>()
  for (const entry of entries) {
    const dateKey = entry.timestamp.slice(0, 10)
    if (!groups.has(dateKey)) groups.set(dateKey, [])
    groups.get(dateKey)!.push(entry)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a)) // newest first
    .map(([dateKey, dayEntries]) => ({
      date: formatDate(dateKey + 'T00:00:00'),
      entries: dayEntries,
      daySummary: generateDaySummary(dayEntries)
    }))
}

function generateDaySummary(entries: ActivityLogEntry[]): string {
  const completions = entries.filter((e) => e.result?.completion)
  const scores = entries.filter((e) => e.result?.score != null)
  const udlInteractions = entries.filter((e) => e.udlPrinciple)

  const parts: string[] = []
  if (completions.length > 0) {
    parts.push(`Completed ${completions.length} item${completions.length !== 1 ? 's' : ''}`)
  }
  if (scores.length > 0) {
    const avgScore = Math.round(scores.reduce((sum, e) => sum + (e.result!.score ?? 0), 0) / scores.length)
    parts.push(`averaged ${avgScore}% on ${scores.length} assessment${scores.length !== 1 ? 's' : ''}`)
  }
  if (udlInteractions.length > 0) {
    parts.push(`${udlInteractions.length} UDL pathway interaction${udlInteractions.length !== 1 ? 's' : ''}`)
  }
  if (parts.length === 0) {
    parts.push(`${entries.length} activit${entries.length !== 1 ? 'ies' : 'y'} recorded`)
  }
  return parts.join(', ')
}

// ─── Full Log Generation ───

/**
 * Generate a complete activity log from statements.
 */
export function generateActivityLog(
  statements: LuminaStatement[],
  voice: ActivityLogVoice = 'first-person'
): ActivityLogGroup[] {
  const sorted = [...statements].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const entries = sorted.map((s) => statementToLogEntry(s, voice))
  return groupByDate(entries)
}

/**
 * Generate a plain text version of the activity log for download.
 */
export function activityLogToPlainText(
  groups: ActivityLogGroup[],
  courseTitle: string
): string {
  const lines: string[] = []
  lines.push(`Activity Log — ${courseTitle}`)
  lines.push('='.repeat(40))
  lines.push('')

  for (const group of groups) {
    lines.push(`--- ${group.date} ---`)
    lines.push(`Summary: ${group.daySummary}`)
    lines.push('')
    for (const entry of group.entries) {
      const time = new Date(entry.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
      lines.push(`  ${time}  ${entry.plainLanguageSummary}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
