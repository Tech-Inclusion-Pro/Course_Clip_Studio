// ─── xAPI Statement Types ───

export interface AccessibilityModeContext {
  reducedMotion?: boolean
  highContrast?: boolean
  screenReaderActive?: boolean
  captionsEnabled?: boolean
  audioAlternativeUsed?: boolean
  textAlternativeUsed?: boolean
}

export interface LuminaStatement {
  id: string
  actorId: string
  verb: string
  verbDisplay: string
  objectId: string
  objectType: string
  objectName: string
  udlPrinciple: string | null
  blockId: string | null
  blockType: string | null
  scoreRaw?: number
  scoreMax?: number
  scoreScaled?: number
  success?: boolean
  completion?: boolean
  durationSeconds?: number
  timestamp: string
  // Phase 2: Assessment Analytics fields
  questionId?: string
  choiceId?: string
  phase?: 'pre' | 'post' | 'formative'
  objectives?: string[]
  bankQuestionId?: string
  difficulty?: string
  bloomsLevel?: string
  // Phase 3: UDL & Accessibility
  accessibilityMode?: AccessibilityModeContext
}

export interface StatementStore {
  version: string
  statements: LuminaStatement[]
  lastUpdated: string
}

// ─── Analytics Summary Types ───

export interface CourseAnalyticsSummary {
  courseId: string
  enrollments: number
  completions: number
  completionRate: number
  averageScore: number
  averageTimeSeconds: number
  dropOffByLesson: DropOffEntry[]
  mostReplayedBlocks: BlockEngagementEntry[]
  assessmentSummaries: AssessmentSummaryEntry[]
}

export interface DropOffEntry {
  lessonId: string
  lessonTitle: string
  startedCount: number
  completedCount: number
  exitRate: number
}

export interface BlockEngagementEntry {
  blockId: string
  blockType: string
  blockName: string
  viewCount: number
  uniqueActors: number
}

export interface AssessmentSummaryEntry {
  blockId: string
  blockName: string
  averageScore: number
  passRate: number
  attemptCount: number
}

// ─── Phase 2: Assessment Analytics Types ───

export interface QuestionDifficultyEntry {
  questionId: string
  questionPrompt: string
  blockId: string
  blockName: string
  totalAttempts: number
  correctCount: number
  difficultyIndex: number
  discriminationIndex: number
  answerDistribution: AnswerDistributionEntry[]
}

export interface AnswerDistributionEntry {
  choiceId: string
  choiceLabel: string
  count: number
  percentage: number
  isCorrect: boolean
}

export interface PrePostComparisonEntry {
  objective: string
  preScore: number
  postScore: number
  delta: number
  learnerCount: number
}

export interface ObjectiveMasteryEntry {
  objective: string
  masteryRate: number
  questionCount: number
  avgScore: number
}

export interface PhaseScoreEntry {
  phase: 'pre' | 'post' | 'formative'
  blockId: string
  blockName: string
  averageScore: number
  passRate: number
  attemptCount: number
}

export interface LearnerScoreEntry {
  actorId: string
  assessmentScores: { blockId: string; blockName: string; score: number; passed: boolean; attempts: number }[]
  phaseScores: { objective: string; preScore: number | null; postScore: number | null }[]
  overallScore: number
  completionPercent: number
}

export interface AssessmentAnalyticsSummary {
  assessments: AssessmentDetailEntry[]
  questionDifficulty: QuestionDifficultyEntry[]
  prePostComparisons: PrePostComparisonEntry[]
  objectiveMastery: ObjectiveMasteryEntry[]
  phaseScores: PhaseScoreEntry[]
  learnerScores: LearnerScoreEntry[]
}

export interface AssessmentDetailEntry {
  blockId: string
  blockName: string
  blockType: 'quiz' | 'knowledge-check'
  phase?: 'pre' | 'post' | 'formative'
  averageScore: number
  passRate: number
  attemptCount: number
  averageAttempts: number
  questionDifficulty: QuestionDifficultyEntry[]
}

// ─── Phase 3: UDL Engagement & Accessibility Types ───

export interface UDLEngagementSummary {
  representation: {
    audioAlternativeRate: number
    captionUsageRate: number
    transcriptAccessRate: number
    languageToggleRate: number
    ttsActivationRate: number
  }
  actionExpression: {
    responseTypeDistribution: { type: string; count: number; percentage: number }[]
    extendedTimeRate: number
    pathwayChoiceDistribution: { choice: string; count: number; percentage: number }[]
  }
  engagement: {
    replayRateByBlock: BlockEngagementEntry[]
    bookmarkRate: number
    dropOffPoints: DropOffEntry[]
  }
  byPrinciple: { principle: string; statementCount: number; uniqueLearners: number; rate: number }[]
  totalLearners: number
  totalUDLInteractions: number
}

export interface AccessibilityReportSummary {
  reducedMotionRate: number
  screenReaderRate: number
  captionsEnabledRate: number
  highContrastRate: number
  textAltPreferredBlocks: { blockId: string; blockName: string; textAltRate: number; primaryRate: number }[]
  extendedTimeUsageRate: number
  audioAltScoreCorrelation: { usedAudioAlt: number; didNotUse: number }
  totalLearners: number
  accommodationUsage: { accommodation: string; learnerCount: number; rate: number }[]
}

// ─── Phase 4: LRS Configuration Types ───

export type LRSStatementMode = 'realtime' | 'batch'

export interface LRSConfig {
  endpointUrl: string
  key: string
  secret: string
  statementMode: LRSStatementMode
  batchIntervalMinutes: number
  anonymization: boolean
  queueOnFailure: boolean
  enabled: boolean
}

export interface LRSConnectionTestResult {
  success: boolean
  statusCode: number | null
  message: string
  testedAt: string
}

// ─── Phase 4: Statement Queue Types ───

export type QueueEntryStatus = 'pending' | 'sending' | 'failed'

export interface StatementQueueEntry {
  id: string
  statement: LuminaStatement
  status: QueueEntryStatus
  attempts: number
  lastAttemptAt: string | null
  errorMessage: string | null
  createdAt: string
}

export interface StatementQueue {
  version: string
  entries: StatementQueueEntry[]
  lastFlushedAt: string | null
}

export interface QueueStats {
  pending: number
  failed: number
  total: number
  oldestEntryAt: string | null
  lastFlushedAt: string | null
}

// ─── Phase 4: Identified Learner Mode ───

export interface IdentityMapEntry {
  anonymizedId: string
  displayName: string
  email?: string
  enrolledAt: string
  lastActivityAt: string
}

export interface IdentityMap {
  version: string
  courseId: string
  identifiedModeEnabled: boolean
  ferpaAcknowledgedAt: string | null
  ferpaAcknowledgedBy: string | null
  entries: IdentityMapEntry[]
}

// ─── Phase 4: Activity Log Generation ───

export type ActivityLogVoice = 'first-person' | 'third-person'

export interface ActivityLogEntry {
  timestamp: string
  verbDisplay: string
  objectDisplay: string
  result?: {
    score?: number
    success?: boolean
    completion?: boolean
  }
  udlPrinciple?: string
  plainLanguageSummary: string
}

export interface ActivityLogGroup {
  date: string
  entries: ActivityLogEntry[]
  daySummary: string
}

// ─── Phase 4: Learner Progress Record ───

export interface ModuleProgressEntry {
  moduleId: string
  moduleTitle: string
  status: 'completed' | 'in-progress' | 'not-started'
  completionPercent: number
  timeSeconds: number
}

export interface AssessmentScoreEntry {
  blockId: string
  blockName: string
  score: number
  passed: boolean
  attempts: number
}

export interface LearnerProgressRecord {
  learnerId: string
  learnerDisplayName?: string
  courseCompletionPercent: number
  moduleProgress: ModuleProgressEntry[]
  assessmentScores: AssessmentScoreEntry[]
  knowledgeCheckPhaseScores: { objective: string; preScore: number | null; postScore: number | null; delta: number | null }[]
  udlPathwaysUsed: string[]
  totalTimeSeconds: number
  lastActivity: string
  activityLog: ActivityLogEntry[]
}

// ─── Phase 4: Educator Report Types ───

export type ReportFormat = 'pdf' | 'html' | 'csv'

export interface EducatorReportOptions {
  format: ReportFormat
  includeActivityLog: boolean
  includeAccommodationData: boolean
  includeAINarrative: boolean
  anonymize: boolean
  dateRange?: { start: string; end: string }
  cohort?: string
  learnerIds?: string[]
}

export interface EducatorReportData {
  courseTitle: string
  courseId: string
  generatedAt: string
  generatedBy: string
  dateRange: { start: string; end: string } | null
  learners: LearnerProgressRecord[]
  courseSummary: CourseAnalyticsSummary
  assessmentSummary: AssessmentAnalyticsSummary | null
  accessibilityReport: AccessibilityReportSummary | null
}

// ─── Phase 4: Item Analysis Types ───

export interface DistractorAnalysis {
  choiceId: string
  choiceLabel: string
  selectedCount: number
  selectedRate: number
  isCorrect: boolean
  /** Correlation between selecting this distractor and low total scores */
  pointBiserial: number
  flag: 'effective' | 'non-functional' | 'implausible'
}

export interface ItemAnalysisEntry {
  questionId: string
  questionPrompt: string
  blockId: string
  blockName: string
  difficultyIndex: number
  discriminationIndex: number
  pointBiserialCorrect: number
  totalAttempts: number
  correctCount: number
  distractors: DistractorAnalysis[]
  flag: 'good' | 'review' | 'poor'
  flagReason: string | null
}

export interface ItemAnalysisSummary {
  items: ItemAnalysisEntry[]
  overallReliability: number
  averageDifficulty: number
  averageDiscrimination: number
  flaggedItemCount: number
}

// ─── Phase 4: cmi5 Types ───

export interface Cmi5AUDefinition {
  id: string
  title: string
  description: string
  url: string
  launchMethod: 'OwnWindow' | 'AnyWindow'
  moveOn: 'Completed' | 'Passed' | 'CompletedAndPassed' | 'CompletedOrPassed' | 'NotApplicable'
  masteryScore?: number
}

export interface Cmi5BlockDefinition {
  id: string
  title: string
  description: string
  objectives?: { id: string; title: string }[]
  children?: Cmi5BlockDefinition[]
  au?: Cmi5AUDefinition
}

export interface Cmi5CourseStructure {
  courseId: string
  courseTitle: string
  courseDescription: string
  publisher: string
  version: string
  blocks: Cmi5BlockDefinition[]
}

export interface Cmi5ExportOptions {
  includeUDLExtensions: boolean
  masteryScore: number
  moveOnCriteria: Cmi5AUDefinition['moveOn']
  launchMethod: Cmi5AUDefinition['launchMethod']
}

// ─── TIPPY Phase 1: Reasoning Transparency Types ───

export type TippyConfidenceLevel = 'high' | 'medium' | 'low' | 'uncertain'

export interface TippySource {
  label: string
  type: 'standard' | 'feature-kb' | 'author-profile' | 'tool-result' | 'ai-provider'
  reference?: string
}

export interface TippyConfidenceBreakdown {
  category: string
  level: TippyConfidenceLevel
  explanation: string
}

export interface TippyReasoningData {
  sources: TippySource[]
  overallConfidence: TippyConfidenceLevel
  confidenceBreakdown: TippyConfidenceBreakdown[]
  limitations: string[]
  humanReviewRequired: string[]
}

export interface FerpaCloudWarningState {
  visible: boolean
  actionDescription: string
  providerName: string
  onAcknowledge: (() => void) | null
  onCancel: (() => void) | null
}

// ─── TIPPY Phase 1: Features KB Section ───

export interface TippyFeatureSection {
  heading: string
  keywords: string[]
  content: string
}

export interface TippyFeaturesIndex {
  sections: TippyFeatureSection[]
  version: string
  lastUpdated: string
}

// ─── TIPPY Phase 2: Author Profile / Get to Know You ───

export type OnboardingSectionId =
  | 'about-you'
  | 'your-audience'
  | 'design-philosophy'
  | 'brand-visual'
  | 'workflow'
  | 'ai-preferences'

export interface OnboardingSectionMeta {
  id: OnboardingSectionId
  title: string
  icon: string
  questions: string[]
}

export interface OnboardingSectionData {
  id: OnboardingSectionId
  completed: boolean
  responses: string[]
  summary: string
  updatedAt: string | null
}

export interface AuthorProfile {
  name: string
  preferredName: string
  role: string
  organization: string
  credentials: string

  audienceDescription: string
  disabilityFocus: string
  multilingualFocus: string
  audienceWishes: string

  designApproach: string
  accessibilityPrinciples: string
  inclusionMeaning: string
  frameworks: string

  brandColors: string
  typography: string
  visualStyle: string
  visualAvoidances: string

  workflowStart: string
  teamComposition: string
  biggestPainPoint: string
  aiWorkflowWishes: string

  aiSupportPreference: string
  reasoningDetail: string
  cautionTopics: string
  privacyPreferences: string
}

export interface AuthorProfileStore {
  profile: AuthorProfile | null
  sections: OnboardingSectionData[]
  profileMarkdown: string
  createdAt: string | null
  updatedAt: string | null
}

// ─── TIPPY Phase 3: Walkthrough Types ───

export type WalkthroughHighlightStyle = 'border' | 'spotlight' | 'pulse'
export type WalkthroughAction = 'click' | 'focus' | 'scroll-to' | 'open-modal' | 'none'

export interface WalkthroughStep {
  id: string
  instruction: string
  targetSelector: string
  highlightStyle: WalkthroughHighlightStyle
  navigateTo?: {
    panel: string
    subPanel?: string
    blockType?: string
  }
  action?: WalkthroughAction
  waitForEvent?: string
  allowSkip: boolean
}

export interface TIPPYWalkthrough {
  id: string
  title: string
  triggerPhrases: string[]
  featureSection: string
  steps: WalkthroughStep[]
  dummyCourseRequired: boolean
}

export interface WalkthroughState {
  active: boolean
  walkthroughId: string | null
  stepIndex: number
  totalSteps: number
}

export interface DemoCourseDefinition {
  id: string
  title: string
  description: string
  modules: {
    id: string
    title: string
    lessons: {
      id: string
      title: string
      blockTypes: string[]
    }[]
  }[]
}

// ─── TIPPY Phase 4: Assesses Types ───

export type AssessesScope = 'block' | 'lesson' | 'module' | 'course'

export type WCAGFindingImpact = 'critical' | 'serious' | 'moderate' | 'minor'

export type WCAGPrinciple = 'perceivable' | 'operable' | 'understandable' | 'robust'

export interface WCAGFinding {
  id: string
  criterion: string
  criterionTitle: string
  conformanceLevel: 'A' | 'AA'
  principle: WCAGPrinciple
  impact: WCAGFindingImpact
  blockId: string | null
  blockName: string
  blockType: string | null
  description: string
  suggestion: string
  estimatedMinutes: number
  canAutoFix: boolean
  walkthroughId?: string
}

export type UDLPrinciple = 'representation' | 'action-expression' | 'engagement'

export interface UDLCheckpointFinding {
  checkpointId: string
  checkpointTitle: string
  principle: UDLPrinciple
  addressed: boolean
  explanation: string
  suggestion?: string
  relatedBlocks: string[]
}

export interface UDLPrincipleFindings {
  principle: UDLPrinciple
  score: number
  strengths: string[]
  gaps: UDLCheckpointFinding[]
}

export type InclusionRating = 'exemplary' | 'proficient' | 'developing' | 'needs-review'

export type InclusionCriterion =
  | 'representation-of-people'
  | 'language-and-framing'
  | 'assessment-design'
  | 'access-and-flexibility'

export interface InclusionFinding {
  id: string
  criterion: InclusionCriterion
  criterionTitle: string
  description: string
  suggestion: string
  blockId?: string
  blockName?: string
}

export type OverallGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface AssessesScorecard {
  wcagScore: number
  wcagPass: boolean
  udlScore: number
  udlRepresentation: number
  udlActionExpression: number
  udlEngagement: number
  udlLabel: 'Excellent' | 'Good' | 'Developing' | 'Needs Work'
  inclusionRating: InclusionRating
  overallGrade: OverallGrade
}

export interface AssessesRecommendation {
  rank: number
  description: string
  frameworks: ('wcag' | 'udl' | 'inclusion')[]
  estimatedMinutes: number
  actionType: 'fix-it' | 'show-me' | 'learn-more'
  walkthroughId?: string
}

export interface AssessesMethodology {
  aiProvider: string
  aiModel: string
  auditEngineVersion: string
  wcagVersion: string
  udlGuidelinesVersion: string
  confidenceNotes: string[]
  limitations: string[]
  humanReviewStatement: string
}

export interface AssessesReport {
  id: string
  title: string
  scope: AssessesScope
  scopeId: string
  scopeTitle: string
  assessedAt: string
  scorecard: AssessesScorecard
  wcagFindings: WCAGFinding[]
  wcagPassingCriteria: string[]
  udlFindings: UDLPrincipleFindings[]
  inclusionStrengths: string[]
  inclusionFindings: InclusionFinding[]
  recommendations: AssessesRecommendation[]
  methodology: AssessesMethodology
  /** Progress tracking for module-by-module assessment */
  modulesAssessed?: number
  modulesTotal?: number
}
