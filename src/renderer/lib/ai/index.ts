export { getProvider, testProviderConnection, AIClientError } from './ai-client'
export type { AIProvider } from './types'
export {
  EMPTY_INTERVIEW,
  AI_ACTIONS,
  type InterviewAnswers,
  type AIAction,
  type AIActionConfig,
  type CourseOutlineResult,
  type QuizGenerationResult,
  type WCAGIssue,
  type UDLSuggestion
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
  baseBrainContext
} from './prompts'
