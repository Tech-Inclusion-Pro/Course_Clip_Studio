// ─── AI Provider Abstraction Layer ───

export interface AIProvider {
  name: 'anthropic' | 'openai' | 'ollama'
  generateText(prompt: string, systemPrompt: string): Promise<string>
  generateJSON<T>(prompt: string, schema: string): Promise<T>
  testConnection(): Promise<boolean>
}

// ─── Interview Flow Types ───

export interface InterviewAnswers {
  audience: string
  objectives: string
  priorKnowledge: string
  tone: 'formal' | 'conversational' | 'scenario-based' | ''
  format: 'linear' | 'branching' | 'mixed' | ''
  accessibilityNeeds: string
  masterKeyContent: string | null
}

export const EMPTY_INTERVIEW: InterviewAnswers = {
  audience: '',
  objectives: '',
  priorKnowledge: '',
  tone: '',
  format: '',
  accessibilityNeeds: '',
  masterKeyContent: null
}

// ─── AI Action Types ───

export type AIAction =
  | 'generate-outline'
  | 'generate-lesson'
  | 'generate-quiz'
  | 'write-narration'
  | 'generate-alt-text'
  | 'translate-lesson'
  | 'wcag-review'
  | 'udl-suggestions'

export interface AIActionConfig {
  id: AIAction
  label: string
  description: string
  requiresInterview: boolean
  requiresSelection: boolean
}

export const AI_ACTIONS: AIActionConfig[] = [
  {
    id: 'generate-outline',
    label: 'Generate Course Outline',
    description: 'Create a structured module/lesson outline from a topic',
    requiresInterview: true,
    requiresSelection: false
  },
  {
    id: 'generate-lesson',
    label: 'Generate Lesson Content',
    description: 'Create content blocks for the selected lesson',
    requiresInterview: true,
    requiresSelection: false
  },
  {
    id: 'generate-quiz',
    label: 'Generate Quiz Questions',
    description: 'Create quiz questions from current lesson content',
    requiresInterview: false,
    requiresSelection: false
  },
  {
    id: 'write-narration',
    label: 'Write Narration Script',
    description: 'Generate a narration script for the current lesson',
    requiresInterview: false,
    requiresSelection: false
  },
  {
    id: 'generate-alt-text',
    label: 'Generate Alt Text',
    description: 'Suggest alt text for the selected image block',
    requiresInterview: false,
    requiresSelection: true
  },
  {
    id: 'translate-lesson',
    label: 'Translate Lesson',
    description: 'Translate the current lesson to another language',
    requiresInterview: false,
    requiresSelection: false
  },
  {
    id: 'wcag-review',
    label: 'WCAG Accessibility Review',
    description: 'Check the current lesson for accessibility issues',
    requiresInterview: false,
    requiresSelection: false
  },
  {
    id: 'udl-suggestions',
    label: 'UDL Improvement Suggestions',
    description: 'Get suggestions to improve UDL alignment',
    requiresInterview: false,
    requiresSelection: false
  }
]

// ─── AI Generation Results ───

export interface CourseOutlineResult {
  modules: {
    title: string
    description: string
    lessons: {
      title: string
      description: string
      suggestedBlocks: string[]
    }[]
  }[]
}

export interface QuizGenerationResult {
  questions: {
    type: 'multiple-choice' | 'true-false'
    prompt: string
    choices: { label: string; isCorrect: boolean }[]
    feedbackCorrect: string
    feedbackIncorrect: string
  }[]
}

export interface WCAGIssue {
  severity: 'critical' | 'serious' | 'moderate' | 'minor'
  criterion: string
  description: string
  suggestion: string
  element?: string
}

export interface UDLSuggestion {
  pillar: 'representation' | 'action' | 'engagement'
  suggestion: string
  priority: 'high' | 'medium' | 'low'
}
