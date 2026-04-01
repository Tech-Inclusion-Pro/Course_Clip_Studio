import { uid } from '@/lib/uid'
import type {
  ContentBlock,
  BlockType,
  TextBlock,
  MediaBlock,
  VideoBlock,
  AudioBlock,
  QuizBlock,
  QuizQuestion,
  QuizChoice,
  DragDropBlock,
  MatchingBlock,
  AccordionBlock,
  TabsBlock,
  FlashcardBlock,
  BranchingBlock,
  EmbedBlock,
  CodeBlock,
  DividerBlock,
  CalloutBlock,
  H5PBlock,
  CustomHTMLBlock,
  PluginBlock,
  FeedbackFormBlock
} from '@/types/course'

// ─── Individual Block Factories ───

export function createTextBlock(overrides: Partial<TextBlock> = {}): TextBlock {
  return {
    id: uid('block'),
    type: 'text',
    ariaLabel: 'Text content',
    notes: '',
    content: '',
    ...overrides
  }
}

export function createMediaBlock(overrides: Partial<MediaBlock> = {}): MediaBlock {
  return {
    id: uid('block'),
    type: 'media',
    ariaLabel: 'Image',
    notes: '',
    assetPath: '',
    caption: '',
    altText: '',
    ...overrides
  }
}

export function createVideoBlock(overrides: Partial<VideoBlock> = {}): VideoBlock {
  return {
    id: uid('block'),
    type: 'video',
    ariaLabel: 'Video',
    notes: '',
    source: 'upload',
    url: '',
    transcript: '',
    captions: [],
    poster: '',
    ...overrides
  }
}

export function createAudioBlock(overrides: Partial<AudioBlock> = {}): AudioBlock {
  return {
    id: uid('block'),
    type: 'audio',
    ariaLabel: 'Audio',
    notes: '',
    assetPath: '',
    transcript: '',
    captions: [],
    ...overrides
  }
}

export function createQuizBlock(overrides: Partial<QuizBlock> = {}): QuizBlock {
  return {
    id: uid('block'),
    type: 'quiz',
    ariaLabel: 'Quiz',
    notes: '',
    questions: [],
    passThreshold: 70,
    showFeedback: true,
    allowRetry: true,
    shuffleQuestions: false,
    shuffleAnswers: false,
    ...overrides
  }
}

export function createDragDropBlock(overrides: Partial<DragDropBlock> = {}): DragDropBlock {
  return {
    id: uid('block'),
    type: 'drag-drop',
    ariaLabel: 'Drag and drop activity',
    notes: '',
    items: [],
    zones: [],
    instruction: 'Drag each item to the correct zone.',
    ...overrides
  }
}

export function createMatchingBlock(overrides: Partial<MatchingBlock> = {}): MatchingBlock {
  return {
    id: uid('block'),
    type: 'matching',
    ariaLabel: 'Matching activity',
    notes: '',
    leftItems: [],
    rightItems: [],
    correctPairs: [],
    instruction: 'Match each item on the left with the correct item on the right.',
    ...overrides
  }
}

export function createAccordionBlock(overrides: Partial<AccordionBlock> = {}): AccordionBlock {
  return {
    id: uid('block'),
    type: 'accordion',
    ariaLabel: 'Expandable content sections',
    notes: '',
    items: [{ title: 'Section 1', content: '' }],
    ...overrides
  }
}

export function createTabsBlock(overrides: Partial<TabsBlock> = {}): TabsBlock {
  return {
    id: uid('block'),
    type: 'tabs',
    ariaLabel: 'Tabbed content',
    notes: '',
    tabs: [{ label: 'Tab 1', content: '' }],
    ...overrides
  }
}

export function createFlashcardBlock(overrides: Partial<FlashcardBlock> = {}): FlashcardBlock {
  return {
    id: uid('block'),
    type: 'flashcard',
    ariaLabel: 'Flashcards',
    notes: '',
    cards: [{ front: '', back: '' }],
    ...overrides
  }
}

export function createBranchingBlock(overrides: Partial<BranchingBlock> = {}): BranchingBlock {
  return {
    id: uid('block'),
    type: 'branching',
    ariaLabel: 'Branching scenario',
    notes: '',
    scenario: '',
    choices: [],
    mode: 'user-choice',
    ...overrides
  }
}

export function createEmbedBlock(overrides: Partial<EmbedBlock> = {}): EmbedBlock {
  return {
    id: uid('block'),
    type: 'embed',
    ariaLabel: 'Embedded content',
    notes: '',
    url: '',
    title: '',
    ...overrides
  }
}

export function createCodeBlock(overrides: Partial<CodeBlock> = {}): CodeBlock {
  return {
    id: uid('block'),
    type: 'code',
    ariaLabel: 'Code example',
    notes: '',
    language: 'javascript',
    code: '',
    runnable: false,
    ...overrides
  }
}

export function createDividerBlock(overrides: Partial<DividerBlock> = {}): DividerBlock {
  return {
    id: uid('block'),
    type: 'divider',
    ariaLabel: 'Content divider',
    notes: '',
    style: 'line',
    ...overrides
  }
}

export function createCalloutBlock(overrides: Partial<CalloutBlock> = {}): CalloutBlock {
  return {
    id: uid('block'),
    type: 'callout',
    ariaLabel: 'Callout',
    notes: '',
    variant: 'info',
    content: '',
    ...overrides
  }
}

export function createH5PBlock(overrides: Partial<H5PBlock> = {}): H5PBlock {
  return {
    id: uid('block'),
    type: 'h5p',
    ariaLabel: 'H5P interactive content',
    notes: '',
    embedUrl: '',
    ...overrides
  }
}

export function createCustomHTMLBlock(overrides: Partial<CustomHTMLBlock> = {}): CustomHTMLBlock {
  return {
    id: uid('block'),
    type: 'custom-html',
    ariaLabel: 'Custom HTML content',
    notes: '',
    html: '',
    css: '',
    js: '',
    ...overrides
  }
}

export function createPluginBlock(overrides: Partial<PluginBlock> = {}): PluginBlock {
  return {
    id: uid('block'),
    type: 'plugin',
    ariaLabel: 'Plugin content',
    notes: '',
    pluginType: '',
    data: {},
    ...overrides
  }
}

export function createFeedbackFormBlock(overrides: Partial<FeedbackFormBlock> = {}): FeedbackFormBlock {
  return {
    id: uid('block'),
    type: 'feedback-form',
    ariaLabel: 'Feedback form',
    notes: '',
    questions: [],
    submitLabel: 'Submit Feedback',
    thankYouMessage: 'Thank you for your feedback!',
    ...overrides
  }
}

// ─── Quiz Helpers ───

export function createQuizChoice(overrides: Partial<QuizChoice> = {}): QuizChoice {
  return {
    id: uid('choice'),
    label: '',
    isCorrect: false,
    ...overrides
  }
}

export function createQuizQuestion(
  type: QuizQuestion['type'] = 'multiple-choice',
  overrides: Partial<QuizQuestion> = {}
): QuizQuestion {
  const baseQuestion: QuizQuestion = {
    id: uid('question'),
    type,
    prompt: '',
    choices: [],
    correctId: '',
    feedbackCorrect: '',
    feedbackIncorrect: '',
    ...overrides
  }

  // Set up default choices based on type
  if (baseQuestion.choices.length === 0) {
    switch (type) {
      case 'multiple-choice': {
        const a = createQuizChoice({ label: 'Option A', isCorrect: true })
        const b = createQuizChoice({ label: 'Option B' })
        const c = createQuizChoice({ label: 'Option C' })
        const d = createQuizChoice({ label: 'Option D' })
        baseQuestion.choices = [a, b, c, d]
        baseQuestion.correctId = a.id
        break
      }
      case 'true-false': {
        const t = createQuizChoice({ label: 'True', isCorrect: true })
        const f = createQuizChoice({ label: 'False' })
        baseQuestion.choices = [t, f]
        baseQuestion.correctId = t.id
        break
      }
      case 'likert': {
        baseQuestion.choices = [
          createQuizChoice({ label: 'Strongly Disagree' }),
          createQuizChoice({ label: 'Disagree' }),
          createQuizChoice({ label: 'Neutral' }),
          createQuizChoice({ label: 'Agree' }),
          createQuizChoice({ label: 'Strongly Agree' })
        ]
        break
      }
      // short-answer has no choices
      default:
        break
    }
  }

  return baseQuestion
}

// ─── Universal Factory ───

const factories: Record<BlockType, (overrides?: Record<string, unknown>) => ContentBlock> = {
  'text': createTextBlock,
  'media': createMediaBlock,
  'video': createVideoBlock,
  'audio': createAudioBlock,
  'quiz': createQuizBlock,
  'drag-drop': createDragDropBlock,
  'matching': createMatchingBlock,
  'accordion': createAccordionBlock,
  'tabs': createTabsBlock,
  'flashcard': createFlashcardBlock,
  'branching': createBranchingBlock,
  'embed': createEmbedBlock,
  'code': createCodeBlock,
  'divider': createDividerBlock,
  'callout': createCalloutBlock,
  'h5p': createH5PBlock,
  'custom-html': createCustomHTMLBlock,
  'plugin': createPluginBlock,
  'feedback-form': createFeedbackFormBlock
}

/**
 * Create a content block of any type.
 * Use this when the block type is determined dynamically (e.g., from block inserter UI).
 */
export function createBlock(type: BlockType): ContentBlock {
  return factories[type]()
}
