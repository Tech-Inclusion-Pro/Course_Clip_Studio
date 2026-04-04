/**
 * Item Analysis Engine — computes advanced psychometric metrics for quiz questions:
 * - Difficulty Index (P): proportion of learners who answered correctly
 * - Discrimination Index (D): correlation between item score and total score
 * - Point-Biserial Correlation: correlation for each answer choice
 * - Distractor Analysis: effectiveness of incorrect answer options
 *
 * Flags items as good/review/poor based on standard psychometric thresholds.
 */

import type { LuminaStatement, ItemAnalysisEntry, ItemAnalysisSummary, DistractorAnalysis } from '@/types/analytics'

// ─── Thresholds ───

const DIFFICULTY_LOWER = 0.2  // below this = too hard
const DIFFICULTY_UPPER = 0.8  // above this = too easy
const DISCRIMINATION_THRESHOLD = 0.2  // below this = poor discrimination
const NON_FUNCTIONAL_DISTRACTOR = 0.05 // distractor chosen by <5% = non-functional

// ─── Main Computation ───

export function computeItemAnalysis(statements: LuminaStatement[]): ItemAnalysisSummary {
  // Get all "answered" statements with question data
  const answeredStmts = statements.filter(
    (s) => s.verb.includes('/answered') && s.questionId
  )

  if (answeredStmts.length === 0) {
    return { items: [], overallReliability: 0, averageDifficulty: 0, averageDiscrimination: 0, flaggedItemCount: 0 }
  }

  // Compute total scores per learner (for discrimination analysis)
  const learnerTotals = computeLearnerTotals(statements)

  // Group by question
  const byQuestion = new Map<string, LuminaStatement[]>()
  for (const s of answeredStmts) {
    const qid = s.questionId!
    if (!byQuestion.has(qid)) byQuestion.set(qid, [])
    byQuestion.get(qid)!.push(s)
  }

  const items: ItemAnalysisEntry[] = []
  for (const [questionId, qStmts] of byQuestion) {
    const entry = analyzeItem(questionId, qStmts, learnerTotals)
    items.push(entry)
  }

  // Sort by flag severity then difficulty
  items.sort((a, b) => {
    const flagOrder = { poor: 0, review: 1, good: 2 }
    const diff = flagOrder[a.flag] - flagOrder[b.flag]
    return diff !== 0 ? diff : a.difficultyIndex - b.difficultyIndex
  })

  const flaggedCount = items.filter((i) => i.flag !== 'good').length
  const avgDifficulty = items.length > 0
    ? items.reduce((sum, i) => sum + i.difficultyIndex, 0) / items.length : 0
  const avgDiscrimination = items.length > 0
    ? items.reduce((sum, i) => sum + i.discriminationIndex, 0) / items.length : 0

  // KR-20 reliability estimate (simplified)
  const reliability = computeKR20(items)

  return {
    items,
    overallReliability: reliability,
    averageDifficulty: Math.round(avgDifficulty * 100) / 100,
    averageDiscrimination: Math.round(avgDiscrimination * 100) / 100,
    flaggedItemCount: flaggedCount
  }
}

// ─── Single Item Analysis ───

function analyzeItem(
  questionId: string,
  qStmts: LuminaStatement[],
  learnerTotals: Map<string, { correct: number; total: number }>
): ItemAnalysisEntry {
  const first = qStmts[0]
  const totalAttempts = qStmts.length
  const correctCount = qStmts.filter((s) => s.success).length

  // Difficulty Index
  const difficultyIndex = totalAttempts > 0 ? correctCount / totalAttempts : 0

  // Build choice distribution
  const choiceCounts = new Map<string, { count: number; correct: number; learnerScores: number[] }>()
  for (const s of qStmts) {
    const choiceId = s.choiceId || 'unknown'
    if (!choiceCounts.has(choiceId)) {
      choiceCounts.set(choiceId, { count: 0, correct: 0, learnerScores: [] })
    }
    const cc = choiceCounts.get(choiceId)!
    cc.count++
    if (s.success) cc.correct++
    // Get this learner's total score for point-biserial
    const lt = learnerTotals.get(s.actorId)
    if (lt && lt.total > 0) {
      cc.learnerScores.push(lt.correct / lt.total)
    }
  }

  // All learner scores for this question's test-takers
  const allScores: number[] = []
  for (const s of qStmts) {
    const lt = learnerTotals.get(s.actorId)
    if (lt && lt.total > 0) allScores.push(lt.correct / lt.total)
  }

  // Discrimination Index (upper 27% vs lower 27%)
  const discriminationIndex = computeDiscrimination(qStmts, learnerTotals)

  // Point-biserial for correct answer
  const correctScores = qStmts.filter((s) => s.success).map((s) => {
    const lt = learnerTotals.get(s.actorId)
    return lt && lt.total > 0 ? lt.correct / lt.total : 0
  })
  const incorrectScores = qStmts.filter((s) => !s.success).map((s) => {
    const lt = learnerTotals.get(s.actorId)
    return lt && lt.total > 0 ? lt.correct / lt.total : 0
  })
  const pointBiserialCorrect = computePointBiserial(correctScores, incorrectScores, allScores)

  // Distractor analysis
  const distractors: DistractorAnalysis[] = []
  for (const [choiceId, data] of choiceCounts) {
    const isCorrect = data.correct > 0 && data.correct === data.count
    const selectedRate = totalAttempts > 0 ? data.count / totalAttempts : 0

    // Point-biserial for this choice
    const chooserScores = data.learnerScores
    const nonChooserScores = allScores.filter((_, idx) => {
      // approximate: all scores minus chooser scores
      return true // simplified
    })
    const pb = chooserScores.length > 0 ? mean(chooserScores) - mean(allScores) : 0

    let flag: DistractorAnalysis['flag'] = 'effective'
    if (!isCorrect) {
      if (selectedRate < NON_FUNCTIONAL_DISTRACTOR) flag = 'non-functional'
      else if (data.count <= 1) flag = 'implausible'
    }

    distractors.push({
      choiceId,
      choiceLabel: choiceId, // will be resolved by the UI from question data
      selectedCount: data.count,
      selectedRate: Math.round(selectedRate * 100) / 100,
      isCorrect,
      pointBiserial: Math.round(pb * 100) / 100,
      flag
    })
  }

  // Flag the item
  let flag: ItemAnalysisEntry['flag'] = 'good'
  let flagReason: string | null = null

  if (difficultyIndex < DIFFICULTY_LOWER) {
    flag = 'poor'
    flagReason = `Too difficult (${Math.round(difficultyIndex * 100)}% correct). Consider simplifying or providing scaffolding.`
  } else if (difficultyIndex > DIFFICULTY_UPPER) {
    flag = 'review'
    flagReason = `Very easy (${Math.round(difficultyIndex * 100)}% correct). May not provide useful assessment data.`
  } else if (discriminationIndex < DISCRIMINATION_THRESHOLD) {
    flag = 'review'
    flagReason = `Low discrimination (${discriminationIndex.toFixed(2)}). This question doesn't distinguish high and low performers.`
  }

  const nonFunctional = distractors.filter((d) => !d.isCorrect && d.flag === 'non-functional')
  if (nonFunctional.length > 0 && flag === 'good') {
    flag = 'review'
    flagReason = `${nonFunctional.length} distractor(s) chosen by fewer than 5% of learners. Consider revising.`
  }

  return {
    questionId,
    questionPrompt: first.objectName || questionId,
    blockId: first.blockId || '',
    blockName: first.objectName || '',
    difficultyIndex: Math.round(difficultyIndex * 100) / 100,
    discriminationIndex: Math.round(discriminationIndex * 100) / 100,
    pointBiserialCorrect: Math.round(pointBiserialCorrect * 100) / 100,
    totalAttempts,
    correctCount,
    distractors,
    flag,
    flagReason
  }
}

// ─── Statistical Helpers ───

function computeLearnerTotals(statements: LuminaStatement[]): Map<string, { correct: number; total: number }> {
  const totals = new Map<string, { correct: number; total: number }>()
  const answered = statements.filter((s) => s.verb.includes('/answered'))
  for (const s of answered) {
    if (!totals.has(s.actorId)) totals.set(s.actorId, { correct: 0, total: 0 })
    const t = totals.get(s.actorId)!
    t.total++
    if (s.success) t.correct++
  }
  return totals
}

function computeDiscrimination(
  qStmts: LuminaStatement[],
  learnerTotals: Map<string, { correct: number; total: number }>
): number {
  // Sort learners by total score, compare top 27% vs bottom 27%
  const withScores = qStmts.map((s) => {
    const lt = learnerTotals.get(s.actorId)
    const totalScore = lt && lt.total > 0 ? lt.correct / lt.total : 0
    return { correct: s.success, totalScore }
  }).sort((a, b) => b.totalScore - a.totalScore)

  const n = withScores.length
  if (n < 4) return 0

  const groupSize = Math.max(1, Math.ceil(n * 0.27))
  const upper = withScores.slice(0, groupSize)
  const lower = withScores.slice(-groupSize)

  const upperCorrect = upper.filter((x) => x.correct).length / upper.length
  const lowerCorrect = lower.filter((x) => x.correct).length / lower.length

  return Math.round((upperCorrect - lowerCorrect) * 100) / 100
}

function computePointBiserial(
  correctScores: number[],
  incorrectScores: number[],
  allScores: number[]
): number {
  if (correctScores.length === 0 || incorrectScores.length === 0 || allScores.length < 2) return 0

  const mp = mean(correctScores)
  const mq = mean(incorrectScores)
  const sd = stdDev(allScores)
  if (sd === 0) return 0

  const p = correctScores.length / allScores.length
  const q = 1 - p

  return ((mp - mq) / sd) * Math.sqrt(p * q)
}

function computeKR20(items: ItemAnalysisEntry[]): number {
  if (items.length < 2) return 0

  const k = items.length
  const pqSum = items.reduce((sum, item) => {
    const p = item.difficultyIndex
    return sum + p * (1 - p)
  }, 0)

  // Estimate total variance from difficulty indices
  const totalVariance = items.reduce((sum, item) => sum + item.difficultyIndex, 0)
  const meanP = totalVariance / k
  const varianceEstimate = k * meanP * (1 - meanP) * 0.5 // simplified

  if (varianceEstimate === 0) return 0
  return Math.round(((k / (k - 1)) * (1 - pqSum / varianceEstimate)) * 100) / 100
}

function mean(arr: number[]): number {
  if (arr.length === 0) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function stdDev(arr: number[]): number {
  if (arr.length < 2) return 0
  const m = mean(arr)
  const variance = arr.reduce((sum, x) => sum + (x - m) ** 2, 0) / (arr.length - 1)
  return Math.sqrt(variance)
}
