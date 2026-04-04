/**
 * Pure aggregation functions for UDL engagement and accessibility analytics.
 */

import type {
  LuminaStatement,
  UDLEngagementSummary,
  AccessibilityReportSummary,
  BlockEngagementEntry,
  DropOffEntry,
} from '@/types/analytics'
import { UDL_VERB_PRINCIPLES } from './verbs'

const LUMINA_BASE = 'https://luminaudl.app/verbs'

function uniqueActors(stmts: LuminaStatement[]): Set<string> {
  return new Set(stmts.map((s) => s.actorId))
}

function rate(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

export function computeUDLEngagement(statements: LuminaStatement[]): UDLEngagementSummary {
  const allActors = uniqueActors(statements)
  const totalLearners = allActors.size || 1

  // Filter to UDL-specific statements
  const udlStatements = statements.filter((s) => s.verb.startsWith(LUMINA_BASE))
  const totalUDLInteractions = udlStatements.length

  // ── Representation ──
  const audioAltActors = uniqueActors(udlStatements.filter((s) => s.verb.endsWith('/accessed-audio-alternative')))
  const captionActors = uniqueActors(udlStatements.filter((s) => s.verb.endsWith('/accessed-caption-track')))
  const transcriptActors = uniqueActors(udlStatements.filter((s) => s.verb.endsWith('/accessed-text-alternative')))
  const langToggleActors = uniqueActors(udlStatements.filter((s) => s.verb.endsWith('/switched-language')))
  const ttsActors = uniqueActors(udlStatements.filter((s) => s.verb.endsWith('/used-text-to-speech')))

  // ── Action & Expression ──
  const extendedTimeActors = uniqueActors(udlStatements.filter((s) => s.verb.endsWith('/used-extended-time')))
  const responseTypes = [
    { type: 'Drawing', stmts: udlStatements.filter((s) => s.verb.endsWith('/submitted-drawing')) },
    { type: 'Audio Response', stmts: udlStatements.filter((s) => s.verb.endsWith('/submitted-audio-response')) },
  ]
  const totalResponses = responseTypes.reduce((sum, rt) => sum + rt.stmts.length, 0) || 1
  const responseTypeDistribution = responseTypes
    .filter((rt) => rt.stmts.length > 0)
    .map((rt) => ({
      type: rt.type,
      count: rt.stmts.length,
      percentage: rate(rt.stmts.length, totalResponses),
    }))

  const pathwayStmts = udlStatements.filter((s) => s.verb.endsWith('/chose-pathway'))
  const pathwayChoices: Record<string, number> = {}
  pathwayStmts.forEach((s) => {
    const choice = s.objectName || 'Unknown'
    pathwayChoices[choice] = (pathwayChoices[choice] || 0) + 1
  })
  const totalPathway = pathwayStmts.length || 1
  const pathwayChoiceDistribution = Object.entries(pathwayChoices).map(([choice, count]) => ({
    choice,
    count,
    percentage: rate(count, totalPathway),
  }))

  // ── Engagement ──
  const replayStmts = udlStatements.filter((s) => s.verb.endsWith('/replayed-content'))
  const replayByBlock: Record<string, { blockId: string; blockType: string; blockName: string; count: number; actors: Set<string> }> = {}
  replayStmts.forEach((s) => {
    const bid = s.blockId || 'unknown'
    if (!replayByBlock[bid]) {
      replayByBlock[bid] = { blockId: bid, blockType: s.blockType || '', blockName: s.objectName || bid, count: 0, actors: new Set() }
    }
    replayByBlock[bid].count++
    replayByBlock[bid].actors.add(s.actorId)
  })
  const replayRateByBlock: BlockEngagementEntry[] = Object.values(replayByBlock)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map((r) => ({
      blockId: r.blockId,
      blockType: r.blockType,
      blockName: r.blockName,
      viewCount: r.count,
      uniqueActors: r.actors.size,
    }))

  const bookmarkActors = uniqueActors(udlStatements.filter((s) => s.verb.endsWith('/bookmarked')))

  // Reuse drop-off from main statements (suspended per lesson)
  const suspendedByLesson: Record<string, { started: number; completed: number }> = {}
  statements.forEach((s) => {
    if (s.objectType === 'lesson' && s.blockId) {
      if (!suspendedByLesson[s.blockId]) suspendedByLesson[s.blockId] = { started: 0, completed: 0 }
    }
    if (s.verb.endsWith('/launched') && s.objectType === 'lesson') {
      const lid = s.blockId || s.objectId
      if (!suspendedByLesson[lid]) suspendedByLesson[lid] = { started: 0, completed: 0 }
      suspendedByLesson[lid].started++
    }
    if (s.verb.endsWith('/completed') && s.objectType === 'lesson') {
      const lid = s.blockId || s.objectId
      if (!suspendedByLesson[lid]) suspendedByLesson[lid] = { started: 0, completed: 0 }
      suspendedByLesson[lid].completed++
    }
  })
  const dropOffPoints: DropOffEntry[] = Object.entries(suspendedByLesson)
    .map(([lid, data]) => ({
      lessonId: lid,
      lessonTitle: lid,
      startedCount: data.started,
      completedCount: data.completed,
      exitRate: data.started > 0 ? rate(data.started - data.completed, data.started) : 0,
    }))
    .filter((d) => d.exitRate > 0)
    .sort((a, b) => b.exitRate - a.exitRate)
    .slice(0, 10)

  // ── By Principle ──
  const principleMap: Record<string, { stmts: LuminaStatement[]; actors: Set<string> }> = {
    representation: { stmts: [], actors: new Set() },
    'action-expression': { stmts: [], actors: new Set() },
    engagement: { stmts: [], actors: new Set() },
  }
  udlStatements.forEach((s) => {
    const principle = UDL_VERB_PRINCIPLES[s.verb] || s.udlPrinciple
    if (principle && principleMap[principle]) {
      principleMap[principle].stmts.push(s)
      principleMap[principle].actors.add(s.actorId)
    }
  })
  const byPrinciple = Object.entries(principleMap).map(([principle, data]) => ({
    principle,
    statementCount: data.stmts.length,
    uniqueLearners: data.actors.size,
    rate: rate(data.actors.size, totalLearners),
  }))

  return {
    representation: {
      audioAlternativeRate: rate(audioAltActors.size, totalLearners),
      captionUsageRate: rate(captionActors.size, totalLearners),
      transcriptAccessRate: rate(transcriptActors.size, totalLearners),
      languageToggleRate: rate(langToggleActors.size, totalLearners),
      ttsActivationRate: rate(ttsActors.size, totalLearners),
    },
    actionExpression: {
      responseTypeDistribution,
      extendedTimeRate: rate(extendedTimeActors.size, totalLearners),
      pathwayChoiceDistribution,
    },
    engagement: {
      replayRateByBlock,
      bookmarkRate: rate(bookmarkActors.size, totalLearners),
      dropOffPoints,
    },
    byPrinciple,
    totalLearners,
    totalUDLInteractions,
  }
}

export function computeAccessibilityReport(statements: LuminaStatement[]): AccessibilityReportSummary {
  const allActors = uniqueActors(statements)
  const totalLearners = allActors.size || 1

  // Count learners by accessibility mode flags (from launched statements)
  const launchedStmts = statements.filter((s) => s.verb.endsWith('/launched') && s.accessibilityMode)
  const reducedMotionActors = new Set<string>()
  const screenReaderActors = new Set<string>()
  const captionsEnabledActors = new Set<string>()
  const highContrastActors = new Set<string>()
  const textAltActors = new Set<string>()
  const audioAltActors = new Set<string>()

  launchedStmts.forEach((s) => {
    const am = s.accessibilityMode!
    if (am.reducedMotion) reducedMotionActors.add(s.actorId)
    if (am.screenReaderActive) screenReaderActors.add(s.actorId)
    if (am.captionsEnabled) captionsEnabledActors.add(s.actorId)
    if (am.highContrast) highContrastActors.add(s.actorId)
    if (am.textAlternativeUsed) textAltActors.add(s.actorId)
    if (am.audioAlternativeUsed) audioAltActors.add(s.actorId)
  })

  // Also count learners who triggered UDL verbs for text/audio alts
  const udlTextAltActors = uniqueActors(
    statements.filter((s) => s.verb.endsWith('/accessed-text-alternative'))
  )
  const udlAudioAltActors = uniqueActors(
    statements.filter((s) => s.verb.endsWith('/accessed-audio-alternative'))
  )
  udlTextAltActors.forEach((a) => textAltActors.add(a))
  udlAudioAltActors.forEach((a) => audioAltActors.add(a))

  // Extended time usage
  const extendedTimeActors = uniqueActors(
    statements.filter((s) => s.verb.endsWith('/used-extended-time'))
  )

  // TTS usage
  const ttsActors = uniqueActors(
    statements.filter((s) => s.verb.endsWith('/used-text-to-speech'))
  )

  // Caption usage from verb
  const captionVerbActors = uniqueActors(
    statements.filter((s) => s.verb.endsWith('/accessed-caption-track'))
  )
  captionVerbActors.forEach((a) => captionsEnabledActors.add(a))

  // Text alt preferred blocks: blocks where text-alternative access exceeds primary experienced
  const textAltByBlock: Record<string, { blockId: string; blockName: string; textAltCount: number; primaryCount: number }> = {}
  statements.forEach((s) => {
    if (!s.blockId) return
    if (s.verb.endsWith('/accessed-text-alternative')) {
      if (!textAltByBlock[s.blockId]) textAltByBlock[s.blockId] = { blockId: s.blockId, blockName: s.objectName || s.blockId, textAltCount: 0, primaryCount: 0 }
      textAltByBlock[s.blockId].textAltCount++
    }
    if (s.verb.endsWith('/experienced') && s.blockId) {
      if (!textAltByBlock[s.blockId]) textAltByBlock[s.blockId] = { blockId: s.blockId, blockName: s.objectName || s.blockId, textAltCount: 0, primaryCount: 0 }
      textAltByBlock[s.blockId].primaryCount++
    }
  })
  const textAltPreferredBlocks = Object.values(textAltByBlock)
    .filter((b) => b.textAltCount > 0)
    .map((b) => {
      const total = b.textAltCount + b.primaryCount || 1
      return {
        blockId: b.blockId,
        blockName: b.blockName,
        textAltRate: rate(b.textAltCount, total),
        primaryRate: rate(b.primaryCount, total),
      }
    })
    .sort((a, b) => b.textAltRate - a.textAltRate)

  // Audio alt score correlation: avg score for learners who used audio alt vs. those who didn't
  const scoredStatements = statements.filter(
    (s) => (s.verb.endsWith('/passed') || s.verb.endsWith('/failed')) && s.scoreScaled != null
  )
  const audioAltLearnerScores: number[] = []
  const nonAudioAltLearnerScores: number[] = []
  const actorScores: Record<string, number[]> = {}
  scoredStatements.forEach((s) => {
    if (!actorScores[s.actorId]) actorScores[s.actorId] = []
    actorScores[s.actorId].push(s.scoreScaled! * 100)
  })
  Object.entries(actorScores).forEach(([actorId, scores]) => {
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length
    if (udlAudioAltActors.has(actorId)) {
      audioAltLearnerScores.push(avg)
    } else {
      nonAudioAltLearnerScores.push(avg)
    }
  })
  const usedAudioAltAvg = audioAltLearnerScores.length > 0
    ? Math.round(audioAltLearnerScores.reduce((a, b) => a + b, 0) / audioAltLearnerScores.length)
    : 0
  const didNotUseAvg = nonAudioAltLearnerScores.length > 0
    ? Math.round(nonAudioAltLearnerScores.reduce((a, b) => a + b, 0) / nonAudioAltLearnerScores.length)
    : 0

  // Accommodation usage table
  const accommodationUsage = [
    { accommodation: 'Reduced Motion', learnerCount: reducedMotionActors.size, rate: rate(reducedMotionActors.size, totalLearners) },
    { accommodation: 'High Contrast', learnerCount: highContrastActors.size, rate: rate(highContrastActors.size, totalLearners) },
    { accommodation: 'Screen Reader', learnerCount: screenReaderActors.size, rate: rate(screenReaderActors.size, totalLearners) },
    { accommodation: 'Captions', learnerCount: captionsEnabledActors.size, rate: rate(captionsEnabledActors.size, totalLearners) },
    { accommodation: 'Text Alternatives', learnerCount: textAltActors.size, rate: rate(textAltActors.size, totalLearners) },
    { accommodation: 'Audio Alternatives', learnerCount: audioAltActors.size, rate: rate(audioAltActors.size, totalLearners) },
    { accommodation: 'Extended Time', learnerCount: extendedTimeActors.size, rate: rate(extendedTimeActors.size, totalLearners) },
    { accommodation: 'Text to Speech', learnerCount: ttsActors.size, rate: rate(ttsActors.size, totalLearners) },
  ]

  return {
    reducedMotionRate: rate(reducedMotionActors.size, totalLearners),
    screenReaderRate: rate(screenReaderActors.size, totalLearners),
    captionsEnabledRate: rate(captionsEnabledActors.size, totalLearners),
    highContrastRate: rate(highContrastActors.size, totalLearners),
    textAltPreferredBlocks,
    extendedTimeUsageRate: rate(extendedTimeActors.size, totalLearners),
    audioAltScoreCorrelation: { usedAudioAlt: usedAudioAltAvg, didNotUse: didNotUseAvg },
    totalLearners,
    accommodationUsage,
  }
}
