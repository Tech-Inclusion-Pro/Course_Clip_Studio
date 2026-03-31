import type { ContentBlock } from '@/types/course'

/** The type of file being imported. */
export type ImportFormat = 'markdown' | 'pptx' | 'scorm'

/** A single parsed lesson from import, before user review. */
export interface ParsedLesson {
  title: string
  blocks: ContentBlock[]
  speakerNotes?: string
}

/** A single parsed module from import, before user review. */
export interface ParsedModule {
  title: string
  description: string
  lessons: ParsedLesson[]
}

/** The result of parsing an import file. User reviews this before confirming. */
export interface ImportResult {
  format: ImportFormat
  suggestedTitle: string
  modules: ParsedModule[]
  warnings: string[]
  /** Total number of content blocks across all lessons. */
  totalBlocks: number
  /** Total number of lessons across all modules. */
  totalLessons: number
}

/** Progress callback for import operations. */
export interface ImportProgress {
  phase: 'reading' | 'parsing' | 'mapping' | 'complete'
  message: string
  percent: number
}

export type ImportProgressCallback = (progress: ImportProgress) => void
