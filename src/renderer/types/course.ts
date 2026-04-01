// ─── Publish Status ───

export type PublishStatus = 'draft' | 'review' | 'published' | 'archived'

// ─── Core Course Structure ───

export interface Course {
  id: string
  meta: CourseMeta
  theme: CourseTheme
  modules: Module[]
  certificate: CertificateConfig | null
  settings: CourseSettings
  history: VersionSnapshot[]
  publishStatus: PublishStatus
  questionBank?: QuizQuestion[]
  createdAt: string
  updatedAt: string
}

// ─── Course Template ───

export interface CourseTemplate {
  id: string
  name: string
  description: string
  icon: string
  tags: string[]
  factory: () => Omit<Course, 'id' | 'createdAt' | 'updatedAt'>
}

export interface CourseMeta {
  title: string
  description: string
  author: string
  language: string
  estimatedDuration: number
  tags: string[]
  thumbnail: string | null
  version: string
}

export interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  udlChecklist: UDLChecklist
  completionRequired: boolean
}

export interface Lesson {
  id: string
  title: string
  blocks: ContentBlock[]
  notes: CollaboratorNote[]
  accessibilityScore: number | null
  readingLevel: number | null
}

// ─── Content Block Union ───

export type ContentBlock =
  | TextBlock
  | MediaBlock
  | VideoBlock
  | AudioBlock
  | QuizBlock
  | DragDropBlock
  | MatchingBlock
  | AccordionBlock
  | TabsBlock
  | FlashcardBlock
  | BranchingBlock
  | EmbedBlock
  | CodeBlock
  | DividerBlock
  | CalloutBlock
  | H5PBlock
  | CustomHTMLBlock
  | PluginBlock
  | FeedbackFormBlock

// ─── Base Block ───

export interface BaseBlock {
  id: string
  type: string
  ariaLabel: string
  altText?: string
  notes: string
  animation?: BlockAnimation
}

export interface BlockAnimation {
  type: 'fade-in' | 'slide-up' | 'slide-left' | 'scale' | 'none'
  duration: number
  delay: number
}

// ─── Block Types ───

export interface TextBlock extends BaseBlock {
  type: 'text'
  content: string
  readingLevel?: number
}

export interface MediaBlock extends BaseBlock {
  type: 'media'
  assetPath: string
  caption: string
  altText: string
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  source: 'upload' | 'embed'
  url: string
  transcript: string
  captions: CaptionTrack[]
  poster: string
}

export interface AudioBlock extends BaseBlock {
  type: 'audio'
  assetPath: string
  transcript: string
  captions: CaptionTrack[]
}

export interface CaptionTrack {
  id: string
  language: string
  label: string
  src: string
  kind: 'subtitles' | 'captions' | 'descriptions'
}

export interface QuizBlock extends BaseBlock {
  type: 'quiz'
  questions: QuizQuestion[]
  passThreshold: number
  showFeedback: boolean
  allowRetry: boolean
  shuffleQuestions: boolean
  shuffleAnswers: boolean
}

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'likert'
  prompt: string
  choices: QuizChoice[]
  correctId: string | string[]
  feedbackCorrect: string
  feedbackIncorrect: string
  bankQuestionId?: string
}

export interface QuizChoice {
  id: string
  label: string
  isCorrect: boolean
}

export interface DragDropBlock extends BaseBlock {
  type: 'drag-drop'
  items: DragItem[]
  zones: DropZone[]
  instruction: string
}

export interface DragItem {
  id: string
  label: string
  image?: string
  correctZoneId: string
}

export interface DropZone {
  id: string
  label: string
}

export interface MatchingBlock extends BaseBlock {
  type: 'matching'
  leftItems: MatchItem[]
  rightItems: MatchItem[]
  correctPairs: { leftId: string; rightId: string }[]
  instruction: string
}

export interface MatchItem {
  id: string
  label: string
}

export interface AccordionBlock extends BaseBlock {
  type: 'accordion'
  items: { title: string; content: string }[]
}

export interface TabsBlock extends BaseBlock {
  type: 'tabs'
  tabs: { label: string; content: string }[]
}

export interface FlashcardBlock extends BaseBlock {
  type: 'flashcard'
  cards: { front: string; back: string }[]
}

export interface BranchingBlock extends BaseBlock {
  type: 'branching'
  scenario: string
  choices: BranchChoice[]
}

export interface BranchChoice {
  id: string
  label: string
  consequence: string
  nextLessonId: string | null
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed'
  url: string
  title: string
  width?: number
  height?: number
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
  runnable: boolean
}

export interface DividerBlock extends BaseBlock {
  type: 'divider'
  style: 'line' | 'space' | 'dots'
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout'
  variant: 'info' | 'warning' | 'success' | 'danger' | 'tip'
  title?: string
  content: string
}

export interface H5PBlock extends BaseBlock {
  type: 'h5p'
  embedUrl: string
}

export interface CustomHTMLBlock extends BaseBlock {
  type: 'custom-html'
  html: string
  css: string
  js: string
}

export interface PluginBlock extends BaseBlock {
  type: 'plugin'
  pluginType: string
  data: Record<string, unknown>
}

export interface FeedbackFormBlock extends BaseBlock {
  type: 'feedback-form'
  questions: FeedbackQuestion[]
  submitLabel: string
  thankYouMessage: string
}

export type FeedbackQuestionType = 'likert' | 'free-text' | 'rating' | 'multiple-choice'

export interface FeedbackQuestion {
  id: string
  type: FeedbackQuestionType
  prompt: string
  required: boolean
  options?: string[] // for multiple-choice
  maxRating?: number // for rating (default 5)
  scale?: string[] // for likert
}

// ─── UDL ───

export interface UDLChecklist {
  representation: {
    multipleFormats: boolean
    altTextPresent: boolean
    transcriptsPresent: boolean
    captionsPresent: boolean
    readingLevelAppropriate: boolean
  }
  action: {
    keyboardNavigable: boolean
    multipleResponseModes: boolean
    sufficientTime: boolean
  }
  engagement: {
    choiceAndAutonomy: boolean
    relevantContext: boolean
    feedbackPresent: boolean
    progressVisible: boolean
  }
}

// ─── Theme & Branding ───

export interface CourseTheme {
  id: string
  name: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  surfaceColor: string
  textColor: string
  fontFamily: string
  fontFamilyHeading: string
  googleFontUrl: string | null
  logoPath: string | null
  customCSS: string
  darkMode: boolean
  playerShell: PlayerShellConfig
  loadingScreen: LoadingScreenConfig
}

export interface PlayerShellConfig {
  headerColor: string
  buttonStyle: 'rounded' | 'square' | 'pill'
  progressBarColor: string
  backgroundColor: string
  showLogo: boolean
}

export interface LoadingScreenConfig {
  logoPath: string | null
  backgroundColor: string
  showProgressRing: boolean
  message: string
}

// ─── Certificate ───

export interface CertificateConfig {
  enabled: boolean
  template: string
  triggerOnCompletion: boolean
  passScoreRequired: number | null
  logoPath: string | null
  signatureLine: string
  brandColors: boolean
}

// ─── Course Settings ───

export interface CourseSettings {
  requireLinearNavigation: boolean
  allowSkip: boolean
  showProgressBar: boolean
  showEstimatedTime: boolean
  learnerNotesEnabled: boolean
  learnerBookmarksEnabled: boolean
  feedbackFormsEnabled: boolean
  accessibilityModeToggle: boolean
  completionCriteria: 'visit-all' | 'quiz-pass' | 'both'
  xapi: XAPIConfig | null
  scorm: SCORMConfig | null
}

export interface XAPIConfig {
  endpoint: string
  authType: 'basic' | 'oauth'
  username: string
  password: string
  actorName: string
  actorEmail: string
}

export interface SCORMConfig {
  version: '1.2' | '2004-2nd' | '2004-3rd' | '2004-4th'
  completionCriteria: 'launch' | 'complete' | 'passed'
  masteryScore: number
  lessonMode: 'normal' | 'browse' | 'review'
}

// ─── Version History ───

export interface VersionSnapshot {
  id: string
  timestamp: string
  label: string
  courseJson: string
}

// ─── Collaboration ───

export interface CollaboratorNote {
  id: string
  blockId: string
  author: string
  content: string
  timestamp: string
  resolved: boolean
}

// ─── Export Formats ───

export type ExportFormat = 'scorm-1.2' | 'scorm-2004' | 'xapi' | 'html5' | 'pdf'

// ─── Block Type Literal ───

export type BlockType = ContentBlock['type']

export const BLOCK_TYPES: readonly BlockType[] = [
  'text',
  'media',
  'video',
  'audio',
  'quiz',
  'drag-drop',
  'matching',
  'accordion',
  'tabs',
  'flashcard',
  'branching',
  'embed',
  'code',
  'divider',
  'callout',
  'h5p',
  'custom-html',
  'plugin',
  'feedback-form'
] as const

export const BLOCK_TYPE_LABELS: Record<BlockType, string> = {
  'text': 'Text',
  'media': 'Image / Media',
  'video': 'Video',
  'audio': 'Audio',
  'quiz': 'Quiz',
  'drag-drop': 'Drag & Drop',
  'matching': 'Matching',
  'accordion': 'Accordion',
  'tabs': 'Tabs',
  'flashcard': 'Flashcard',
  'branching': 'Branching Scenario',
  'embed': 'Embed',
  'code': 'Code',
  'divider': 'Divider',
  'callout': 'Callout',
  'h5p': 'H5P',
  'custom-html': 'Custom HTML',
  'plugin': 'Plugin',
  'feedback-form': 'Feedback Form'
}

// ─── Brand Kit ───

export interface BrandKit {
  id: string
  name: string
  logoPath: string | null
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  fontFamilyHeading: string
  customFontPaths: string[]
  createdAt: string
  updatedAt: string
}

// ─── App Settings ───

export interface AppSettings {
  authorName: string
  defaultLanguage: string
  autoSaveIntervalMs: number
  defaultExportFolder: string | null
  activeBrandKitId: string | null
  brandKits: BrandKit[]
  ai: AISettings
  accessibility: AccessibilitySettings
}

export interface AISettings {
  provider: 'anthropic' | 'openai' | 'ollama' | null
  anthropicApiKey: string | null
  openaiApiKey: string | null
  ollamaEndpoint: string
  ollamaModel: string | null
  defaultAILanguage: string
}

export type ColorBlindMode = 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'
export type CursorStyle = 'default' | 'large' | 'crosshair' | 'high-contrast'

export interface AccessibilitySettings {
  highContrastMode: boolean
  baseFontSize: number
  reducedMotion: boolean
  colorBlindMode: ColorBlindMode
  cursorStyle: CursorStyle
  cursorTrail: boolean
  openDyslexic: boolean
  bionicReading: boolean
  enhancedTextSpacing: boolean
  enhancedFocusIndicators: boolean
}
