export interface Course {
  id: string
  meta: CourseMeta
  modules: Module[]
  theme: CourseTheme
  settings: CourseSettings
  udlChecklist: UDLChecklist
  certificate: CertificateConfig
  createdAt: string
  updatedAt: string
}

export interface CourseMeta {
  title: string
  description: string
  author: string
  version: string
  language: string
  tags: string[]
  thumbnail?: string
  duration?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
}

export interface Module {
  id: string
  title: string
  description: string
  lessons: Lesson[]
  order: number
}

export interface Lesson {
  id: string
  title: string
  description: string
  blocks: ContentBlock[]
  order: number
  duration?: string
}

// ─── Content Block Types ───

export type ContentBlock =
  | TextBlock
  | ImageBlock
  | VideoBlock
  | AudioBlock
  | QuizBlock
  | InteractiveBlock
  | CodeBlock
  | EmbedBlock
  | DividerBlock
  | CalloutBlock

interface BaseBlock {
  id: string
  order: number
  udlTags: UDLTag[]
}

export interface TextBlock extends BaseBlock {
  type: 'text'
  content: string
  format: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'list' | 'quote'
}

export interface ImageBlock extends BaseBlock {
  type: 'image'
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
}

export interface VideoBlock extends BaseBlock {
  type: 'video'
  src: string
  poster?: string
  caption?: string
  transcript?: string
}

export interface AudioBlock extends BaseBlock {
  type: 'audio'
  src: string
  caption?: string
  transcript?: string
}

export interface QuizBlock extends BaseBlock {
  type: 'quiz'
  question: string
  questionType: 'multiple-choice' | 'true-false' | 'short-answer' | 'matching'
  options?: QuizOption[]
  correctAnswer: string | string[]
  explanation?: string
  points: number
}

export interface QuizOption {
  id: string
  label: string
  isCorrect: boolean
}

export interface InteractiveBlock extends BaseBlock {
  type: 'interactive'
  interactionType: 'drag-drop' | 'hotspot' | 'timeline' | 'accordion' | 'tabs' | 'flipcard'
  data: Record<string, unknown>
}

export interface CodeBlock extends BaseBlock {
  type: 'code'
  language: string
  code: string
  runnable: boolean
}

export interface EmbedBlock extends BaseBlock {
  type: 'embed'
  url: string
  embedType: 'iframe' | 'scorm' | 'h5p' | 'lti'
  width?: number
  height?: number
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

// ─── UDL ───

export type UDLPrinciple = 'engagement' | 'representation' | 'action-expression'

export interface UDLTag {
  principle: UDLPrinciple
  guideline: string
}

export interface UDLChecklist {
  engagement: UDLChecklistItem[]
  representation: UDLChecklistItem[]
  actionExpression: UDLChecklistItem[]
}

export interface UDLChecklistItem {
  id: string
  label: string
  checked: boolean
}

// ─── Theme & Config ───

export interface CourseTheme {
  primaryColor: string
  accentColor: string
  fontFamily: string
  fontSize: number
  borderRadius: number
  customCSS?: string
}

export interface CertificateConfig {
  enabled: boolean
  title: string
  description: string
  signatoryName: string
  signatoryTitle: string
  logo?: string
  background?: string
}

export interface CourseSettings {
  navigation: 'free' | 'sequential' | 'gated'
  progressTracking: boolean
  completionThreshold: number
  showTimer: boolean
  allowRetakes: boolean
  maxAttempts: number
  passingScore: number
  exportFormats: ExportFormat[]
}

export type ExportFormat = 'scorm-1.2' | 'scorm-2004' | 'xapi' | 'html5' | 'pdf'
