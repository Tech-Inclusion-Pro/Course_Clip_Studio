/**
 * Assessment-level analytics: per-question difficulty, answer distribution,
 * pre/post comparison, objective mastery, and learner scores.
 */

import type { Course } from '@/types/course'
import type {
  LuminaStatement,
  AssessmentAnalyticsSummary,
  AssessmentDetailEntry,
  QuestionDifficultyEntry,
  AnswerDistributionEntry,
  PrePostComparisonEntry,
  ObjectiveMasteryEntry,
  PhaseScoreEntry,
  LearnerScoreEntry
} from '@/types/analytics'
import { VERBS } from './verbs'

// ─── Helpers ───

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFn(item)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(item)
  }
  return map
}

function uniqueActors(statements: LuminaStatement[]): Set<string> {
  return new Set(statements.map((s) => s.actorId))
}

// ─── Question Difficulty ───

export function computeQuestionDifficulty(
  statements: LuminaStatement[]
): QuestionDifficultyEntry[] {
  const answered = statements.filter(
    (s) => s.verb === VERBS.ANSWERED.id && s.questionId
  )
  const byQuestion = groupBy(answered, (s) => s.questionId!)

  // Compute total scores per actor for discrimination index
  const actorTotalScores = computeActorTotalScores(statements)

  return Array.from(byQuestion.entries()).map(([questionId, stmts]) => {
    const totalAttempts = stmts.length
    const correctCount = stmts.filter((s) => s.success === true).length
    const difficultyIndex = totalAttempts > 0 ? correctCount / totalAttempts : 0
    const discriminationIndex = computeDiscriminationForQuestion(
      stmts,
      actorTotalScores
    )

    const distribution = computeAnswerDistributionForQuestion(stmts)

    return {
      questionId,
      questionPrompt: stmts[0]?.objectName || questionId,
      blockId: stmts[0]?.blockId || '',
      blockName: stmts[0]?.objectName || '',
      totalAttempts,
      correctCount,
      difficultyIndex: Math.round(difficultyIndex * 100) / 100,
      discriminationIndex: Math.round(discriminationIndex * 100) / 100,
      answerDistribution: distribution
    }
  })
}

function computeActorTotalScores(
  statements: LuminaStatement[]
): Map<string, number> {
  const scores = new Map<string, number[]>()
  const scored = statements.filter(
    (s) =>
      (s.verb === VERBS.PASSED.id || s.verb === VERBS.FAILED.id) &&
      s.scoreScaled != null
  )
  for (const s of scored) {
    if (!scores.has(s.actorId)) scores.set(s.actorId, [])
    scores.get(s.actorId)!.push(s.scoreScaled!)
  }
  const result = new Map<string, number>()
  for (const [actor, vals] of scores) {
    result.set(actor, vals.reduce((a, b) => a + b, 0) / vals.length)
  }
  return result
}

// Point-biserial correlation: correlation between getting question right (0/1)
// and actor's total score
function computeDiscriminationForQuestion(
  questionStatements: LuminaStatement[],
  actorTotalScores: Map<string, number>
): number {
  // Use only the latest attempt per actor
  const latestByActor = new Map<string, LuminaStatement>()
  for (const s of questionStatements) {
    const existing = latestByActor.get(s.actorId)
    if (!existing || s.timestamp > existing.timestamp) {
      latestByActor.set(s.actorId, s)
    }
  }

  const pairs: { correct: number; totalScore: number }[] = []
  for (const [actorId, stmt] of latestByActor) {
    const totalScore = actorTotalScores.get(actorId)
    if (totalScore == null) continue
    pairs.push({ correct: stmt.success ? 1 : 0, totalScore })
  }

  if (pairs.length < 3) return 0

  const n = pairs.length
  const meanX = pairs.reduce((a, p) => a + p.correct, 0) / n
  const meanY = pairs.reduce((a, p) => a + p.totalScore, 0) / n
  let covXY = 0
  let varX = 0
  let varY = 0
  for (const p of pairs) {
    const dx = p.correct - meanX
    const dy = p.totalScore - meanY
    covXY += dx * dy
    varX += dx * dx
    varY += dy * dy
  }
  if (varX === 0 || varY === 0) return 0
  return covXY / Math.sqrt(varX * varY)
}

// ─── Answer Distribution ───

function computeAnswerDistributionForQuestion(
  questionStatements: LuminaStatement[]
): AnswerDistributionEntry[] {
  const withChoices = questionStatements.filter((s) => s.choiceId)
  if (withChoices.length === 0) return []

  const byChoice = groupBy(withChoices, (s) => s.choiceId!)
  const total = withChoices.length

  return Array.from(byChoice.entries()).map(([choiceId, stmts]) => ({
    choiceId,
    choiceLabel: choiceId,
    count: stmts.length,
    percentage: Math.round((stmts.length / total) * 100),
    isCorrect: stmts.some((s) => s.success === true)
  }))
}

export function computeAnswerDistribution(
  statements: LuminaStatement[],
  questionId: string
): AnswerDistributionEntry[] {
  const answered = statements.filter(
    (s) => s.verb === VERBS.ANSWERED.id && s.questionId === questionId
  )
  return computeAnswerDistributionForQuestion(answered)
}

// ─── Pre/Post Comparison ───

export function computePrePostComparison(
  statements: LuminaStatement[]
): PrePostComparisonEntry[] {
  // Get all answered statements with objectives and phase
  const withPhase = statements.filter(
    (s) =>
      s.verb === VERBS.ANSWERED.id &&
      s.phase &&
      s.objectives &&
      s.objectives.length > 0
  )

  // Build objective → phase → actor → scores
  const objectiveMap = new Map<
    string,
    { pre: Map<string, number[]>; post: Map<string, number[]> }
  >()

  for (const s of withPhase) {
    if (s.phase !== 'pre' && s.phase !== 'post') continue
    for (const obj of s.objectives!) {
      if (!objectiveMap.has(obj)) {
        objectiveMap.set(obj, { pre: new Map(), post: new Map() })
      }
      const entry = objectiveMap.get(obj)!
      const phaseMap = s.phase === 'pre' ? entry.pre : entry.post
      if (!phaseMap.has(s.actorId)) phaseMap.set(s.actorId, [])
      phaseMap.get(s.actorId)!.push(s.success ? 1 : 0)
    }
  }

  return Array.from(objectiveMap.entries()).map(([objective, data]) => {
    const preActors = data.pre
    const postActors = data.post

    const preAvg = computePhaseAvg(preActors)
    const postAvg = computePhaseAvg(postActors)

    // Count learners with both pre and post
    const commonActors = new Set(
      [...preActors.keys()].filter((a) => postActors.has(a))
    )

    return {
      objective,
      preScore: Math.round(preAvg * 100),
      postScore: Math.round(postAvg * 100),
      delta: Math.round((postAvg - preAvg) * 100),
      learnerCount: commonActors.size
    }
  })
}

function computePhaseAvg(actorScores: Map<string, number[]>): number {
  if (actorScores.size === 0) return 0
  let total = 0
  for (const scores of actorScores.values()) {
    total += scores.reduce((a, b) => a + b, 0) / scores.length
  }
  return total / actorScores.size
}

// ─── Objective Mastery ───

export function computeObjectiveMastery(
  statements: LuminaStatement[]
): ObjectiveMasteryEntry[] {
  const answered = statements.filter(
    (s) =>
      s.verb === VERBS.ANSWERED.id &&
      s.objectives &&
      s.objectives.length > 0
  )

  const objMap = new Map<string, LuminaStatement[]>()
  for (const s of answered) {
    for (const obj of s.objectives!) {
      if (!objMap.has(obj)) objMap.set(obj, [])
      objMap.get(obj)!.push(s)
    }
  }

  return Array.from(objMap.entries()).map(([objective, stmts]) => {
    const correctCount = stmts.filter((s) => s.success === true).length
    const total = stmts.length
    const questionIds = new Set(stmts.map((s) => s.questionId).filter(Boolean))

    return {
      objective,
      masteryRate: total > 0 ? Math.round((correctCount / total) * 100) : 0,
      questionCount: questionIds.size,
      avgScore: total > 0 ? Math.round((correctCount / total) * 100) : 0
    }
  })
}

// ─── Phase Scores ───

export function computePhaseScores(
  statements: LuminaStatement[]
): PhaseScoreEntry[] {
  const phaseStatements = statements.filter(
    (s) =>
      (s.verb === VERBS.PASSED.id || s.verb === VERBS.FAILED.id) &&
      s.phase &&
      s.blockId
  )

  const byPhaseBlock = groupBy(
    phaseStatements,
    (s) => `${s.phase}::${s.blockId}`
  )

  return Array.from(byPhaseBlock.entries()).map(([key, stmts]) => {
    const [phase, blockId] = key.split('::')
    const scored = stmts.filter((s) => s.scoreScaled != null)
    const avgScore =
      scored.length > 0
        ? Math.round(
            (scored.reduce((a, s) => a + (s.scoreScaled ?? 0), 0) /
              scored.length) *
              100
          )
        : 0
    const passed = stmts.filter((s) => s.verb === VERBS.PASSED.id).length
    const passRate =
      stmts.length > 0 ? Math.round((passed / stmts.length) * 100) : 0

    return {
      phase: phase as 'pre' | 'post' | 'formative',
      blockId,
      blockName: stmts[0]?.objectName || blockId,
      averageScore: avgScore,
      passRate,
      attemptCount: stmts.length
    }
  })
}

// ─── Learner Scores ───

export function computeLearnerScores(
  statements: LuminaStatement[]
): LearnerScoreEntry[] {
  const actors = uniqueActors(statements)

  return Array.from(actors).map((actorId) => {
    const actorStmts = statements.filter((s) => s.actorId === actorId)

    // Assessment scores per block
    const passFailStmts = actorStmts.filter(
      (s) =>
        (s.verb === VERBS.PASSED.id || s.verb === VERBS.FAILED.id) && s.blockId
    )
    const byBlock = groupBy(passFailStmts, (s) => s.blockId!)
    const assessmentScores = Array.from(byBlock.entries()).map(
      ([blockId, stmts]) => {
        const latest = stmts.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0]
        return {
          blockId,
          blockName: latest.objectName || blockId,
          score: Math.round((latest.scoreScaled ?? 0) * 100),
          passed: latest.verb === VERBS.PASSED.id,
          attempts: stmts.length
        }
      }
    )

    // Phase scores per objective
    const answeredWithObjectives = actorStmts.filter(
      (s) =>
        s.verb === VERBS.ANSWERED.id &&
        s.objectives &&
        s.objectives.length > 0 &&
        s.phase
    )
    const objPhaseMap = new Map<
      string,
      { pre: number[]; post: number[] }
    >()
    for (const s of answeredWithObjectives) {
      for (const obj of s.objectives!) {
        if (!objPhaseMap.has(obj))
          objPhaseMap.set(obj, { pre: [], post: [] })
        const entry = objPhaseMap.get(obj)!
        if (s.phase === 'pre') entry.pre.push(s.success ? 1 : 0)
        else if (s.phase === 'post') entry.post.push(s.success ? 1 : 0)
      }
    }
    const phaseScores = Array.from(objPhaseMap.entries()).map(
      ([objective, data]) => ({
        objective,
        preScore:
          data.pre.length > 0
            ? Math.round(
                (data.pre.reduce((a, b) => a + b, 0) / data.pre.length) * 100
              )
            : null,
        postScore:
          data.post.length > 0
            ? Math.round(
                (data.post.reduce((a, b) => a + b, 0) / data.post.length) * 100
              )
            : null
      })
    )

    // Overall score
    const allScored = passFailStmts.filter((s) => s.scoreScaled != null)
    const overallScore =
      allScored.length > 0
        ? Math.round(
            (allScored.reduce((a, s) => a + (s.scoreScaled ?? 0), 0) /
              allScored.length) *
              100
          )
        : 0

    // Completion percent
    const completedBlocks = new Set(
      actorStmts
        .filter((s) => s.verb === VERBS.COMPLETED.id && s.blockId)
        .map((s) => s.blockId)
    )
    const allBlocks = new Set(
      statements.filter((s) => s.blockId).map((s) => s.blockId)
    )
    const completionPercent =
      allBlocks.size > 0
        ? Math.round((completedBlocks.size / allBlocks.size) * 100)
        : 0

    return {
      actorId,
      assessmentScores,
      phaseScores,
      overallScore,
      completionPercent
    }
  })
}

// ─── Assessment Detail ───

function computeAssessmentDetails(
  statements: LuminaStatement[],
  course: Course
): AssessmentDetailEntry[] {
  // Find all quiz and KC blocks from course
  const allBlocks = course.modules.flatMap((m) =>
    m.lessons.flatMap((l) => l.blocks)
  )
  const assessmentBlocks = allBlocks.filter(
    (b) => b.type === 'quiz' || b.type === 'knowledge-check'
  )

  return assessmentBlocks.map((block) => {
    const blockStmts = statements.filter((s) => s.blockId === block.id)
    const passFailStmts = blockStmts.filter(
      (s) => s.verb === VERBS.PASSED.id || s.verb === VERBS.FAILED.id
    )
    const answeredStmts = blockStmts.filter(
      (s) => s.verb === VERBS.ANSWERED.id
    )

    const scored = passFailStmts.filter((s) => s.scoreScaled != null)
    const avgScore =
      scored.length > 0
        ? Math.round(
            (scored.reduce((a, s) => a + (s.scoreScaled ?? 0), 0) /
              scored.length) *
              100
          )
        : 0
    const passed = passFailStmts.filter(
      (s) => s.verb === VERBS.PASSED.id
    ).length
    const passRate =
      passFailStmts.length > 0
        ? Math.round((passed / passFailStmts.length) * 100)
        : 0
    const actors = uniqueActors(passFailStmts)
    const avgAttempts =
      actors.size > 0
        ? Math.round((passFailStmts.length / actors.size) * 10) / 10
        : 0

    const questionDifficulty = computeQuestionDifficulty(answeredStmts)

    const blockType =
      block.type === 'knowledge-check' ? 'knowledge-check' : 'quiz'
    const phase =
      block.type === 'knowledge-check'
        ? (block as { phase: 'pre' | 'post' | 'formative' }).phase
        : undefined

    return {
      blockId: block.id,
      blockName: block.ariaLabel || block.id,
      blockType: blockType as 'quiz' | 'knowledge-check',
      phase,
      averageScore: avgScore,
      passRate,
      attemptCount: passFailStmts.length,
      averageAttempts: avgAttempts,
      questionDifficulty
    }
  })
}

// ─── Main Entry Point ───

export function computeAssessmentAnalytics(
  statements: LuminaStatement[],
  course: Course
): AssessmentAnalyticsSummary {
  return {
    assessments: computeAssessmentDetails(statements, course),
    questionDifficulty: computeQuestionDifficulty(statements),
    prePostComparisons: computePrePostComparison(statements),
    objectiveMastery: computeObjectiveMastery(statements),
    phaseScores: computePhaseScores(statements),
    learnerScores: computeLearnerScores(statements)
  }
}
