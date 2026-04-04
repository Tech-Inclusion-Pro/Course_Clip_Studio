/**
 * Pure functions computing analytics metrics from raw xAPI statements.
 */

import type { Course } from '@/types/course'
import type {
  LuminaStatement,
  CourseAnalyticsSummary,
  DropOffEntry,
  BlockEngagementEntry,
  AssessmentSummaryEntry
} from '@/types/analytics'
import { VERBS } from './verbs'

function uniqueActors(statements: LuminaStatement[]): Set<string> {
  return new Set(statements.map((s) => s.actorId))
}

export function computeCompletionRate(statements: LuminaStatement[]): number {
  const enrolled = uniqueActors(statements)
  if (enrolled.size === 0) return 0
  const completed = new Set(
    statements
      .filter((s) => s.verb === VERBS.COMPLETED.id && s.objectType === 'course')
      .map((s) => s.actorId)
  )
  return Math.round((completed.size / enrolled.size) * 100)
}

export function computeAverageScore(statements: LuminaStatement[]): number {
  const scored = statements.filter(
    (s) => (s.verb === VERBS.PASSED.id || s.verb === VERBS.FAILED.id) && s.scoreScaled != null
  )
  if (scored.length === 0) return 0
  const sum = scored.reduce((acc, s) => acc + (s.scoreScaled ?? 0), 0)
  return Math.round((sum / scored.length) * 100)
}

export function computeAverageTime(statements: LuminaStatement[]): number {
  const completed = statements.filter(
    (s) => s.verb === VERBS.COMPLETED.id && s.objectType === 'course' && s.durationSeconds != null
  )
  if (completed.length === 0) return 0
  const sum = completed.reduce((acc, s) => acc + (s.durationSeconds ?? 0), 0)
  return Math.round(sum / completed.length)
}

export function computeDropOff(statements: LuminaStatement[], course: Course): DropOffEntry[] {
  const allLessons = course.modules.flatMap((m) => m.lessons)
  return allLessons.map((lesson) => {
    const lessonStatements = statements.filter((s) => s.objectId?.includes(lesson.id))
    const started = uniqueActors(lessonStatements)
    const completedActors = new Set(
      lessonStatements
        .filter((s) => s.verb === VERBS.COMPLETED.id)
        .map((s) => s.actorId)
    )
    const startedCount = started.size
    const completedCount = completedActors.size
    return {
      lessonId: lesson.id,
      lessonTitle: lesson.title,
      startedCount,
      completedCount,
      exitRate: startedCount > 0 ? Math.round(((startedCount - completedCount) / startedCount) * 100) : 0
    }
  })
}

export function computeAssessmentSummaries(
  statements: LuminaStatement[],
  _course: Course
): AssessmentSummaryEntry[] {
  // Group by blockId for quiz-type blocks
  const quizStatements = statements.filter(
    (s) => (s.verb === VERBS.PASSED.id || s.verb === VERBS.FAILED.id) && s.blockId
  )
  const byBlock = new Map<string, LuminaStatement[]>()
  for (const s of quizStatements) {
    const key = s.blockId!
    if (!byBlock.has(key)) byBlock.set(key, [])
    byBlock.get(key)!.push(s)
  }

  return Array.from(byBlock.entries()).map(([blockId, stmts]) => {
    const scored = stmts.filter((s) => s.scoreScaled != null)
    const avgScore = scored.length > 0
      ? Math.round((scored.reduce((a, s) => a + (s.scoreScaled ?? 0), 0) / scored.length) * 100)
      : 0
    const passed = stmts.filter((s) => s.verb === VERBS.PASSED.id).length
    const passRate = stmts.length > 0 ? Math.round((passed / stmts.length) * 100) : 0
    return {
      blockId,
      blockName: stmts[0]?.objectName || blockId,
      averageScore: avgScore,
      passRate,
      attemptCount: stmts.length
    }
  })
}

export function computeMostReplayed(statements: LuminaStatement[]): BlockEngagementEntry[] {
  const experienced = statements.filter(
    (s) => s.verb === VERBS.EXPERIENCED.id && s.blockId
  )
  const byBlock = new Map<string, LuminaStatement[]>()
  for (const s of experienced) {
    const key = s.blockId!
    if (!byBlock.has(key)) byBlock.set(key, [])
    byBlock.get(key)!.push(s)
  }

  return Array.from(byBlock.entries())
    .map(([blockId, stmts]) => ({
      blockId,
      blockType: stmts[0]?.blockType || 'unknown',
      blockName: stmts[0]?.objectName || blockId,
      viewCount: stmts.length,
      uniqueActors: uniqueActors(stmts).size
    }))
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 10)
}

export function computeCourseSummary(
  statements: LuminaStatement[],
  course: Course
): CourseAnalyticsSummary {
  const enrolled = uniqueActors(statements)
  const completedActors = new Set(
    statements
      .filter((s) => s.verb === VERBS.COMPLETED.id && s.objectType === 'course')
      .map((s) => s.actorId)
  )

  return {
    courseId: course.id,
    enrollments: enrolled.size,
    completions: completedActors.size,
    completionRate: computeCompletionRate(statements),
    averageScore: computeAverageScore(statements),
    averageTimeSeconds: computeAverageTime(statements),
    dropOffByLesson: computeDropOff(statements, course),
    mostReplayedBlocks: computeMostReplayed(statements),
    assessmentSummaries: computeAssessmentSummaries(statements, course)
  }
}
