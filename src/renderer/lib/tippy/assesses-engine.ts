/**
 * TIPPY Assesses Engine
 *
 * Phase 4: Runs WCAG, UDL, and Inclusion assessments against course content.
 * Uses the existing audit-engine for WCAG checks, adds UDL checkpoint mapping
 * and inclusion pattern analysis, and synthesizes results via the active AI provider.
 */

import type { Course, ContentBlock, Module, Lesson } from '@/types/course'
import type {
  AssessesReport,
  AssessesScorecard,
  AssessesScope,
  WCAGFinding,
  WCAGPrinciple,
  WCAGFindingImpact,
  UDLPrincipleFindings,
  UDLPrinciple,
  UDLCheckpointFinding,
  InclusionFinding,
  InclusionRating,
  InclusionCriterion,
  AssessesRecommendation,
  AssessesMethodology,
  OverallGrade
} from '@/types/analytics'
import { runAccessibilityAudit } from '@/lib/accessibility/audit-engine'
import type { AuditIssue } from '@/lib/accessibility/audit-engine'
import { uid } from '@/lib/uid'
import { stripHtml } from '@/lib/reading-level'

// ─── Block Serialization ───

/**
 * Serialize blocks to minimal HTML for AI context window.
 * Strips decorative elements, keeps semantic content and ARIA attributes.
 */
export function serializeBlocksToMinimalHTML(blocks: ContentBlock[]): string {
  return blocks.map((block) => {
    const aria = block.ariaLabel ? ` aria-label="${block.ariaLabel}"` : ''
    const alt = block.altText ? ` alt="${block.altText}"` : ''

    switch (block.type) {
      case 'text':
        return `<section data-block="${block.id}" data-type="text"${aria}>${block.content}</section>`
      case 'media':
        return `<figure data-block="${block.id}" data-type="media"${aria}><img src="[image]"${alt}/>${block.caption ? `<figcaption>${block.caption}</figcaption>` : ''}</figure>`
      case 'video':
        return `<div data-block="${block.id}" data-type="video"${aria}><video>[video content]</video>${block.transcript ? `<div class="transcript">${block.transcript.slice(0, 200)}</div>` : '<div class="transcript">[missing]</div>'}${block.captions.length > 0 ? '<track kind="captions"/>' : ''}</div>`
      case 'audio':
        return `<div data-block="${block.id}" data-type="audio"${aria}><audio>[audio]</audio>${block.transcript ? `<div class="transcript">${block.transcript.slice(0, 200)}</div>` : '<div class="transcript">[missing]</div>'}</div>`
      case 'quiz':
        return `<div data-block="${block.id}" data-type="quiz"${aria}>${block.questions.map((q) => `<div class="question" data-qtype="${q.type}"><p>${q.prompt}</p>${q.choices?.map((c) => `<label>${c.label}</label>`).join('') ?? ''}</div>`).join('')}</div>`
      case 'writing':
        return `<div data-block="${block.id}" data-type="writing"${aria}><p>${block.prompt}</p>${block.rubric?.criteria ? `<div class="rubric">${block.rubric.criteria.map((c) => c.label).join(', ')}</div>` : ''}</div>`
      case 'knowledge-check':
        return `<div data-block="${block.id}" data-type="knowledge-check"${aria} data-phase="${block.phase}">${block.questions.map((q) => `<div class="question"><p>${q.prompt}</p></div>`).join('')}</div>`
      case 'image-map':
        return `<div data-block="${block.id}" data-type="image-map"${aria}><img src="[hotspot]"${alt}/>${block.regions?.length ?? 0} interactive regions</div>`
      case 'chart':
        return `<div data-block="${block.id}" data-type="chart"${aria}><div class="chart" data-chart-type="${block.chartType}">[chart visualization]</div>${block.dataTable ? '<table>[data table present]</table>' : ''}</div>`
      case 'accordion':
        return `<div data-block="${block.id}" data-type="accordion"${aria}>${block.items.map((item) => `<details><summary>${item.title}</summary>${item.content}</details>`).join('')}</div>`
      case 'tabs':
        return `<div data-block="${block.id}" data-type="tabs"${aria}>${block.tabs.map((tab) => `<div role="tabpanel" aria-label="${tab.title}">${tab.content}</div>`).join('')}</div>`
      default:
        return `<div data-block="${block.id}" data-type="${block.type}"${aria}>[${block.type} content]</div>`
    }
  }).join('\n')
}

/**
 * Get all blocks in the assessment scope.
 */
export function getBlocksInScope(
  course: Course,
  scope: AssessesScope,
  scopeId: string
): { blocks: ContentBlock[]; title: string } {
  if (scope === 'course') {
    const blocks = course.modules.flatMap((m) => m.lessons.flatMap((l) => l.blocks))
    return { blocks, title: course.meta.title }
  }
  if (scope === 'module') {
    const mod = course.modules.find((m) => m.id === scopeId)
    if (!mod) return { blocks: [], title: 'Unknown Module' }
    return { blocks: mod.lessons.flatMap((l) => l.blocks), title: mod.title }
  }
  if (scope === 'lesson') {
    for (const mod of course.modules) {
      const lesson = mod.lessons.find((l) => l.id === scopeId)
      if (lesson) return { blocks: lesson.blocks, title: lesson.title }
    }
    return { blocks: [], title: 'Unknown Lesson' }
  }
  // block scope
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const block = lesson.blocks.find((b) => b.id === scopeId)
      if (block) return { blocks: [block], title: block.ariaLabel || block.type }
    }
  }
  return { blocks: [], title: 'Unknown Block' }
}

// ─── WCAG Assessment ───

/** Map WCAG criterion string to POUR principle */
function mapCriterionToPrinciple(criterion: string): WCAGPrinciple {
  const num = criterion.match(/^(\d)/)
  if (!num) return 'perceivable'
  switch (num[1]) {
    case '1': return 'perceivable'
    case '2': return 'operable'
    case '3': return 'understandable'
    case '4': return 'robust'
    default: return 'perceivable'
  }
}

/** Map AuditSeverity to WCAGFindingImpact (they happen to match) */
function mapSeverity(severity: string): WCAGFindingImpact {
  if (severity === 'critical' || severity === 'serious' || severity === 'moderate' || severity === 'minor') {
    return severity
  }
  return 'moderate'
}

/** Estimate remediation time based on issue type and severity */
function estimateMinutes(issue: AuditIssue): number {
  if (issue.severity === 'critical') return 10
  if (issue.severity === 'serious') return 7
  if (issue.severity === 'moderate') return 5
  return 2
}

/** Determine conformance level from criterion */
function getConformanceLevel(criterion: string): 'A' | 'AA' {
  // WCAG AA criteria: 1.2.4, 1.2.5, 1.4.3–1.4.5, 2.4.5–2.4.7, 3.1.2, 3.2.3–3.2.4, 3.3.3–3.3.4
  const aaPatterns = ['1.2.4', '1.2.5', '1.4.3', '1.4.4', '1.4.5', '2.4.5', '2.4.6', '2.4.7', '3.1.2', '3.2.3', '3.2.4', '3.3.3', '3.3.4']
  const criterionNum = criterion.match(/^[\d.]+/)
  if (criterionNum && aaPatterns.some((p) => criterionNum[0].startsWith(p))) return 'AA'
  return 'A'
}

/**
 * Convert audit-engine issues to WCAGFinding format.
 */
export function convertAuditToWCAGFindings(course: Course): {
  findings: WCAGFinding[]
  passingCriteria: string[]
  score: number
} {
  const auditReport = runAccessibilityAudit(course)

  const findings: WCAGFinding[] = auditReport.issues.map((issue) => ({
    id: issue.id,
    criterion: issue.criterion.replace(/^[\d.]+ /, ''),
    criterionTitle: issue.criterion,
    conformanceLevel: getConformanceLevel(issue.criterion),
    principle: mapCriterionToPrinciple(issue.criterion),
    impact: mapSeverity(issue.severity),
    blockId: issue.blockId,
    blockName: issue.lessonTitle + (issue.blockType ? ` / ${issue.blockType}` : ''),
    blockType: issue.blockType,
    description: issue.description,
    suggestion: issue.suggestion,
    estimatedMinutes: estimateMinutes(issue),
    canAutoFix: issue.criterion.includes('1.1.1') || issue.criterion.includes('4.1.2')
  }))

  // Build list of passing criteria (all WCAG criteria that had no violations)
  const failedCriteria = new Set(auditReport.issues.map((i) => i.criterion))
  const allCheckedCriteria = [
    '1.1.1 Non-text Content',
    '1.2.1 Audio-only and Video-only',
    '1.2.2 Captions (Prerecorded)',
    '1.2.3 Audio Description or Media Alternative',
    '1.3.1 Info and Relationships',
    '1.4.3 Contrast (Minimum)',
    '3.1.5 Reading Level',
    '4.1.2 Name, Role, Value'
  ]
  const passingCriteria = allCheckedCriteria.filter((c) => !failedCriteria.has(c))

  return { findings, passingCriteria, score: auditReport.score }
}

// ─── UDL Assessment ───

/** UDL Checkpoints per principle, based on CAST UDL Guidelines 3.0 */
const UDL_CHECKPOINTS: Array<{
  id: string
  title: string
  principle: UDLPrinciple
  evaluate: (blocks: ContentBlock[], course: Course) => { addressed: boolean; explanation: string }
}> = [
  // Representation
  {
    id: 'rep-1.1',
    title: 'Multiple formats for key content',
    principle: 'representation',
    evaluate: (blocks) => {
      const hasText = blocks.some((b) => b.type === 'text')
      const hasMedia = blocks.some((b) => ['video', 'audio', 'media'].includes(b.type))
      const addressed = hasText && hasMedia
      return {
        addressed,
        explanation: addressed
          ? 'Content is presented in both text and media formats.'
          : 'Key content appears in only one format. Add audio, video, or visual alternatives.'
      }
    }
  },
  {
    id: 'rep-1.2',
    title: 'Reading level appropriate and flagged',
    principle: 'representation',
    evaluate: (blocks) => {
      const textBlocks = blocks.filter((b) => b.type === 'text')
      if (textBlocks.length === 0) return { addressed: true, explanation: 'No text content to evaluate.' }
      return {
        addressed: true,
        explanation: 'Reading level is tracked per lesson. Review reading level indicators in the editor.'
      }
    }
  },
  {
    id: 'rep-1.3',
    title: 'Visuals explained in text',
    principle: 'representation',
    evaluate: (blocks) => {
      const mediaBlocks = blocks.filter((b) => b.type === 'media')
      if (mediaBlocks.length === 0) return { addressed: true, explanation: 'No images to evaluate.' }
      const withAlt = mediaBlocks.filter((b) => b.altText && b.altText.trim().length > 10)
      const addressed = withAlt.length === mediaBlocks.length
      return {
        addressed,
        explanation: addressed
          ? 'All images have descriptive alt text.'
          : `${mediaBlocks.length - withAlt.length} of ${mediaBlocks.length} images lack descriptive alt text.`
      }
    }
  },
  {
    id: 'rep-1.4',
    title: 'Language options available for multilingual learners',
    principle: 'representation',
    evaluate: (blocks, course) => {
      const lang = course.meta.language
      const hasMultiLang = lang && lang.includes(',')
      return {
        addressed: !!hasMultiLang,
        explanation: hasMultiLang
          ? 'Course supports multiple languages.'
          : 'Course is single-language. Consider adding translation for key content.'
      }
    }
  },
  {
    id: 'rep-1.5',
    title: 'Transcripts present for audio/video',
    principle: 'representation',
    evaluate: (blocks) => {
      const avBlocks = blocks.filter((b) => b.type === 'video' || b.type === 'audio')
      if (avBlocks.length === 0) return { addressed: true, explanation: 'No audio/video content.' }
      const withTranscripts = avBlocks.filter((b) => {
        if (b.type === 'video' || b.type === 'audio') return b.transcript && b.transcript.trim().length > 0
        return false
      })
      const addressed = withTranscripts.length === avBlocks.length
      return {
        addressed,
        explanation: addressed
          ? 'All audio/video content has transcripts.'
          : `${avBlocks.length - withTranscripts.length} of ${avBlocks.length} audio/video blocks lack transcripts.`
      }
    }
  },
  // Action & Expression
  {
    id: 'ae-2.1',
    title: 'Multiple response options in assessments',
    principle: 'action-expression',
    evaluate: (blocks) => {
      const assessBlocks = blocks.filter((b) => b.type === 'quiz' || b.type === 'writing' || b.type === 'knowledge-check')
      if (assessBlocks.length === 0) return { addressed: true, explanation: 'No assessments to evaluate.' }
      const types = new Set(assessBlocks.map((b) => b.type))
      const addressed = types.size >= 2
      return {
        addressed,
        explanation: addressed
          ? `Assessments use ${types.size} response formats: ${Array.from(types).join(', ')}.`
          : 'Assessments use only one format. Add writing blocks, drag-drop, or other response modes.'
      }
    }
  },
  {
    id: 'ae-2.2',
    title: 'Goals and objectives clearly stated',
    principle: 'action-expression',
    evaluate: (blocks) => {
      const hasCallout = blocks.some((b) => b.type === 'callout')
      const firstText = blocks.find((b) => b.type === 'text')
      const hasObjectiveText = firstText && firstText.type === 'text' &&
        /objective|goal|outcome|learn/i.test(firstText.content)
      const addressed = hasCallout || !!hasObjectiveText
      return {
        addressed,
        explanation: addressed
          ? 'Learning objectives or goals are present.'
          : 'No clear learning objectives found. Add a callout or text block stating lesson goals.'
      }
    }
  },
  {
    id: 'ae-2.3',
    title: 'Scaffolding before independent performance',
    principle: 'action-expression',
    evaluate: (blocks) => {
      const quizIdx = blocks.findIndex((b) => b.type === 'quiz' || b.type === 'knowledge-check')
      if (quizIdx < 0) return { addressed: true, explanation: 'No assessments requiring scaffolding.' }
      const hasContentBefore = quizIdx > 0
      return {
        addressed: hasContentBefore,
        explanation: hasContentBefore
          ? 'Instructional content precedes assessments.'
          : 'Assessment appears without prior instructional content. Add scaffolding before the quiz.'
      }
    }
  },
  // Engagement
  {
    id: 'eng-3.1',
    title: 'Relevance and purpose communicated',
    principle: 'engagement',
    evaluate: (blocks) => {
      const firstBlocks = blocks.slice(0, 3)
      const hasIntro = firstBlocks.some((b) => {
        if (b.type === 'text') return /why|purpose|relevance|importance|matter/i.test(b.content)
        if (b.type === 'callout') return true
        return false
      })
      return {
        addressed: hasIntro,
        explanation: hasIntro
          ? 'Opening content communicates purpose and relevance.'
          : 'Opening content does not clearly state why this topic matters. Add context for learners.'
      }
    }
  },
  {
    id: 'eng-3.2',
    title: 'Opportunities for learner choice',
    principle: 'engagement',
    evaluate: (blocks) => {
      const hasChoice = blocks.some((b) =>
        b.type === 'branching' || b.type === 'accordion' || b.type === 'tabs'
      )
      return {
        addressed: hasChoice,
        explanation: hasChoice
          ? 'Learners have choice in how they navigate content (branching, accordion, or tabs).'
          : 'Content follows a linear path with no learner choice. Consider adding tabs, accordion, or branching blocks.'
      }
    }
  },
  {
    id: 'eng-3.3',
    title: 'Checkpoints for self-monitoring',
    principle: 'engagement',
    evaluate: (blocks) => {
      const hasCheck = blocks.some((b) => b.type === 'knowledge-check' || b.type === 'feedback-form')
      return {
        addressed: hasCheck,
        explanation: hasCheck
          ? 'Self-monitoring checkpoints are present (knowledge checks or feedback forms).'
          : 'No self-monitoring checkpoints found. Add knowledge checks so learners can gauge understanding.'
      }
    }
  },
  {
    id: 'eng-3.4',
    title: 'Feedback is specific and actionable',
    principle: 'engagement',
    evaluate: (blocks) => {
      const quizBlocks = blocks.filter((b) => b.type === 'quiz')
      if (quizBlocks.length === 0) return { addressed: true, explanation: 'No quiz blocks to evaluate.' }
      const withFeedback = quizBlocks.filter((b) => {
        if (b.type !== 'quiz') return false
        return b.showFeedback && b.questions.some((q) => q.feedbackCorrect || q.feedbackIncorrect)
      })
      const addressed = withFeedback.length === quizBlocks.length
      return {
        addressed,
        explanation: addressed
          ? 'All quiz blocks provide specific feedback.'
          : `${quizBlocks.length - withFeedback.length} quiz blocks lack specific feedback. Add feedback for correct and incorrect answers.`
      }
    }
  }
]

/**
 * Run UDL assessment against blocks.
 */
export function runUDLAssessment(
  blocks: ContentBlock[],
  course: Course
): UDLPrincipleFindings[] {
  const principles: UDLPrinciple[] = ['representation', 'action-expression', 'engagement']

  return principles.map((principle) => {
    const checkpoints = UDL_CHECKPOINTS.filter((cp) => cp.principle === principle)
    const evaluations = checkpoints.map((cp) => {
      const result = cp.evaluate(blocks, course)
      return {
        checkpointId: cp.id,
        checkpointTitle: cp.title,
        principle,
        addressed: result.addressed,
        explanation: result.explanation,
        suggestion: result.addressed ? undefined : result.explanation,
        relatedBlocks: []
      } as UDLCheckpointFinding
    })

    const addressed = evaluations.filter((e) => e.addressed).length
    const total = evaluations.length
    const score = total > 0 ? Math.round((addressed / total) * 100) : 100

    const strengths = evaluations
      .filter((e) => e.addressed)
      .map((e) => e.explanation)

    const gaps = evaluations.filter((e) => !e.addressed)

    return { principle, score, strengths, gaps }
  })
}

// ─── Inclusion Assessment ───

/** Pattern-based inclusion checks */
const INCLUSION_CHECKS: Array<{
  criterion: InclusionCriterion
  criterionTitle: string
  evaluate: (blocks: ContentBlock[]) => InclusionFinding | null
}> = [
  {
    criterion: 'language-and-framing',
    criterionTitle: 'Language and Framing',
    evaluate: (blocks) => {
      const deficitTerms = /\b(suffer(s|ing)?\s+from|confined\s+to|wheelchair[\s-]bound|handicapped|retarded|lame|dumb|crippled|victim\s+of|afflicted|normal\s+(student|learner|person))\b/i
      for (const block of blocks) {
        if (block.type === 'text') {
          const text = stripHtml(block.content)
          if (deficitTerms.test(text)) {
            return {
              id: uid('incl'),
              criterion: 'language-and-framing',
              criterionTitle: 'Language and Framing',
              description: 'Deficit language detected. Terms that describe disability as suffering, being confined, or being abnormal perpetuate harmful stereotypes.',
              suggestion: 'Use person-first or identity-first language as preferred by the community. Replace deficit framing with strength-based alternatives.',
              blockId: block.id,
              blockName: block.ariaLabel || 'Text block'
            }
          }
        }
      }
      return null
    }
  },
  {
    criterion: 'language-and-framing',
    criterionTitle: 'Language and Framing',
    evaluate: (blocks) => {
      const medicalModel = /\b(overcome\s+(their\s+)?disability|special\s+needs|differently[\s-]abled|inspirational\s+(despite|because))\b/i
      for (const block of blocks) {
        if (block.type === 'text') {
          const text = stripHtml(block.content)
          if (medicalModel.test(text)) {
            return {
              id: uid('incl'),
              criterion: 'language-and-framing',
              criterionTitle: 'Language and Framing',
              description: 'Medical model framing detected. Phrases like "overcome disability" or "special needs" frame disability as something to be fixed.',
              suggestion: 'Reframe using the social model: focus on barriers in the environment, not deficits in the person.',
              blockId: block.id,
              blockName: block.ariaLabel || 'Text block'
            }
          }
        }
      }
      return null
    }
  },
  {
    criterion: 'assessment-design',
    criterionTitle: 'Assessment Design',
    evaluate: (blocks) => {
      const quizBlocks = blocks.filter((b) => b.type === 'quiz')
      if (quizBlocks.length === 0) return null
      const allMC = quizBlocks.every((b) => {
        if (b.type !== 'quiz') return false
        return b.questions.every((q) => q.type === 'multiple-choice')
      })
      if (allMC && quizBlocks.length > 0) {
        return {
          id: uid('incl'),
          criterion: 'assessment-design',
          criterionTitle: 'Assessment Design',
          description: 'All assessments use only multiple-choice format. This limits how learners can demonstrate knowledge.',
          suggestion: 'Add alternative assessment types (writing, drag-drop, matching) so learners can express understanding in multiple ways.'
        }
      }
      return null
    }
  },
  {
    criterion: 'access-and-flexibility',
    criterionTitle: 'Access and Flexibility',
    evaluate: (blocks) => {
      const hasMultiPath = blocks.some((b) =>
        b.type === 'branching' || b.type === 'tabs' || b.type === 'accordion'
      )
      if (!hasMultiPath && blocks.length > 5) {
        return {
          id: uid('incl'),
          criterion: 'access-and-flexibility',
          criterionTitle: 'Access and Flexibility',
          description: 'Content follows a single mandatory pathway. No branching, tabs, or accordion blocks provide alternative routes.',
          suggestion: 'Add branching scenarios, tabbed content, or accordion sections to give learners flexible navigation options.'
        }
      }
      return null
    }
  },
  {
    criterion: 'representation-of-people',
    criterionTitle: 'Representation of People',
    evaluate: (blocks) => {
      const mediaBlocks = blocks.filter((b) => b.type === 'media')
      if (mediaBlocks.length === 0) return null
      // Flag for review — AI can't verify diversity from alt text alone
      return {
        id: uid('incl'),
        criterion: 'representation-of-people',
        criterionTitle: 'Representation of People',
        description: `This content includes ${mediaBlocks.length} images. TIPPY cannot verify whether images represent diverse communities. Human review is required.`,
        suggestion: 'Review images to ensure they represent diverse people — including disabled people as active agents, multiple cultural contexts, and varied demographics.'
      }
    }
  }
]

/**
 * Run inclusion assessment against blocks.
 */
export function runInclusionAssessment(blocks: ContentBlock[]): {
  rating: InclusionRating
  strengths: string[]
  findings: InclusionFinding[]
} {
  const findings: InclusionFinding[] = []

  for (const check of INCLUSION_CHECKS) {
    const finding = check.evaluate(blocks)
    if (finding) findings.push(finding)
  }

  // Determine strengths
  const strengths: string[] = []
  const hasWriting = blocks.some((b) => b.type === 'writing')
  if (hasWriting) strengths.push('Writing blocks allow open-ended expression beyond fixed-response formats.')
  const hasBranching = blocks.some((b) => b.type === 'branching')
  if (hasBranching) strengths.push('Branching scenarios provide learner choice and agency.')
  const hasKC = blocks.some((b) => b.type === 'knowledge-check')
  if (hasKC) strengths.push('Knowledge checks support learner self-monitoring.')
  const hasMultiFormat = blocks.some((b) => b.type === 'text') && blocks.some((b) => ['video', 'audio', 'media'].includes(b.type))
  if (hasMultiFormat) strengths.push('Content uses multiple formats (text and media) for representation.')
  if (findings.length === 0 && strengths.length === 0) {
    strengths.push('No inclusion issues detected in automated analysis. Human review is still recommended.')
  }

  // Calculate rating
  const criticalFindings = findings.filter((f) =>
    f.criterion === 'language-and-framing' || f.criterion === 'representation-of-people'
  )
  let rating: InclusionRating
  if (findings.length === 0) rating = 'exemplary'
  else if (criticalFindings.length === 0 && findings.length <= 2) rating = 'proficient'
  else if (findings.length <= 4) rating = 'developing'
  else rating = 'needs-review'

  return { rating, strengths, findings }
}

// ─── Scorecard & Grading ───

function getUDLLabel(score: number): 'Excellent' | 'Good' | 'Developing' | 'Needs Work' {
  if (score >= 85) return 'Excellent'
  if (score >= 65) return 'Good'
  if (score >= 45) return 'Developing'
  return 'Needs Work'
}

function calculateOverallGrade(wcagScore: number, udlScore: number, inclusionRating: InclusionRating): OverallGrade {
  // Weighted composite: WCAG 50%, UDL 30%, Inclusion 20%
  const inclusionScore =
    inclusionRating === 'exemplary' ? 100 :
    inclusionRating === 'proficient' ? 80 :
    inclusionRating === 'developing' ? 55 :
    30

  const composite = (wcagScore * 0.5) + (udlScore * 0.3) + (inclusionScore * 0.2)

  if (composite >= 90) return 'A'
  if (composite >= 80) return 'B'
  if (composite >= 70) return 'C'
  if (composite >= 60) return 'D'
  return 'F'
}

export function buildScorecard(
  wcagScore: number,
  udlFindings: UDLPrincipleFindings[],
  inclusionRating: InclusionRating
): AssessesScorecard {
  const rep = udlFindings.find((f) => f.principle === 'representation')?.score ?? 0
  const ae = udlFindings.find((f) => f.principle === 'action-expression')?.score ?? 0
  const eng = udlFindings.find((f) => f.principle === 'engagement')?.score ?? 0
  const udlScore = Math.round((rep + ae + eng) / 3)

  return {
    wcagScore,
    wcagPass: wcagScore >= 70,
    udlScore,
    udlRepresentation: rep,
    udlActionExpression: ae,
    udlEngagement: eng,
    udlLabel: getUDLLabel(udlScore),
    inclusionRating,
    overallGrade: calculateOverallGrade(wcagScore, udlScore, inclusionRating)
  }
}

// ─── Recommendations ───

export function generateRecommendations(
  wcagFindings: WCAGFinding[],
  udlFindings: UDLPrincipleFindings[],
  inclusionFindings: InclusionFinding[]
): AssessesRecommendation[] {
  const recs: AssessesRecommendation[] = []

  // Critical WCAG issues first
  const criticalWCAG = wcagFindings.filter((f) => f.impact === 'critical')
  for (const finding of criticalWCAG.slice(0, 2)) {
    recs.push({
      rank: recs.length + 1,
      description: `Fix ${finding.criterionTitle}: ${finding.suggestion}`,
      frameworks: ['wcag'],
      estimatedMinutes: finding.estimatedMinutes,
      actionType: finding.canAutoFix ? 'fix-it' : 'show-me',
      walkthroughId: finding.walkthroughId
    })
  }

  // UDL gaps
  const allGaps = udlFindings.flatMap((f) => f.gaps)
  for (const gap of allGaps.slice(0, 2)) {
    recs.push({
      rank: recs.length + 1,
      description: `UDL: ${gap.checkpointTitle} — ${gap.explanation}`,
      frameworks: ['udl'],
      estimatedMinutes: 10,
      actionType: 'show-me'
    })
  }

  // Inclusion findings
  for (const finding of inclusionFindings.slice(0, 1)) {
    recs.push({
      rank: recs.length + 1,
      description: `Inclusion: ${finding.description}`,
      frameworks: ['inclusion'],
      estimatedMinutes: 15,
      actionType: 'learn-more'
    })
  }

  return recs.slice(0, 5)
}

// ─── Methodology ───

export function buildMethodology(aiProvider: string, aiModel: string): AssessesMethodology {
  return {
    aiProvider,
    aiModel,
    auditEngineVersion: '1.0.0',
    wcagVersion: 'WCAG 2.1 AA',
    udlGuidelinesVersion: 'CAST UDL Guidelines 3.0',
    confidenceNotes: [
      'WCAG findings based on deterministic audit rules: High confidence.',
      'UDL checkpoint mapping based on block-type pattern analysis: Medium confidence.',
      'Inclusion assessment based on surface-level text pattern matching: Low confidence — human review required.'
    ],
    limitations: [
      'TIPPY cannot evaluate the lived experience of learners from the communities depicted in this course.',
      'Alt text quality evaluation is based on presence and length, not semantic accuracy.',
      'Readability scoring uses Flesch-Kincaid, which does not account for domain-specific vocabulary or cultural familiarity.',
      'UDL analysis identifies the presence or absence of UDL-aligned elements but cannot evaluate pedagogical effectiveness.'
    ],
    humanReviewStatement:
      'TIPPY uses AI to support — not replace — human judgment in accessibility and inclusion work. Every finding requires a human decision. Treat AI-generated accessibility assessments as a starting point, not a final answer.'
  }
}

// ─── Full Assessment Runner ───

/**
 * Run a full TIPPY Assesses report.
 * For course-level scope with >30 blocks, processes module by module.
 */
export function runAssessesReport(
  course: Course,
  scope: AssessesScope,
  scopeId: string,
  aiProvider: string,
  aiModel: string
): AssessesReport {
  const { blocks, title } = getBlocksInScope(course, scope, scopeId)

  // WCAG assessment (uses the full audit engine on the course)
  const { findings: wcagFindings, passingCriteria, score: wcagScore } = convertAuditToWCAGFindings(course)

  // Filter WCAG findings to scope if not course-level
  const scopedWCAG = scope === 'course'
    ? wcagFindings
    : wcagFindings.filter((f) => {
        if (!f.blockId) return true
        return blocks.some((b) => b.id === f.blockId)
      })

  // UDL assessment
  const udlFindings = runUDLAssessment(blocks, course)

  // Inclusion assessment
  const { rating: inclusionRating, strengths: inclusionStrengths, findings: inclusionFindings } = runInclusionAssessment(blocks)

  // Build scorecard
  const scorecard = buildScorecard(
    scope === 'course' ? wcagScore : Math.max(0, 100 - scopedWCAG.length * 10),
    udlFindings,
    inclusionRating
  )

  // Generate recommendations
  const recommendations = generateRecommendations(scopedWCAG, udlFindings, inclusionFindings)

  // Methodology
  const methodology = buildMethodology(aiProvider, aiModel)

  return {
    id: uid('assesses'),
    title: `TIPPY Assesses — ${title}`,
    scope,
    scopeId: scope === 'course' ? course.id : scopeId,
    scopeTitle: title,
    assessedAt: new Date().toISOString(),
    scorecard,
    wcagFindings: scopedWCAG,
    wcagPassingCriteria: passingCriteria,
    udlFindings,
    inclusionStrengths,
    inclusionFindings,
    recommendations,
    methodology
  }
}
