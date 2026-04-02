export { getProvider, testProviderConnection, AIClientError } from './ai-client'
export type { AIProvider } from './types'
export {
  EMPTY_INTERVIEW,
  AI_ACTIONS,
  REFERENCE_FILE_CATEGORIES,
  type InterviewAnswers,
  type AIAction,
  type AIActionConfig,
  type CourseOutlineResult,
  type QuizGenerationResult,
  type WCAGIssue,
  type UDLSuggestion,
  type ReferenceFileCategory
} from './types'
export {
  SYSTEM_PROMPT,
  outlinePrompt,
  lessonContentPrompt,
  quizPrompt,
  narrationPrompt,
  altTextPrompt,
  translatePrompt,
  wcagReviewPrompt,
  udlSuggestionsPrompt,
  baseBrainContext,
  categorizedRefFilesContext,
  contentAreaFilesContext
} from './prompts'
