import { describe, it, expect } from 'vitest'
import {
  createTextBlock,
  createMediaBlock,
  createVideoBlock,
  createAudioBlock,
  createQuizBlock,
  createDragDropBlock,
  createMatchingBlock,
  createAccordionBlock,
  createTabsBlock,
  createFlashcardBlock,
  createBranchingBlock,
  createEmbedBlock,
  createCodeBlock,
  createDividerBlock,
  createCalloutBlock,
  createH5PBlock,
  createCustomHTMLBlock,
  createQuizChoice,
  createQuizQuestion,
  createBlock
} from '@/lib/block-factories'

// ─── Individual Block Factories ───

describe('createTextBlock', () => {
  it('returns a text block with defaults', () => {
    const block = createTextBlock()
    expect(block.type).toBe('text')
    expect(block.id).toMatch(/^block-/)
    expect(block.content).toBe('')
    expect(block.ariaLabel).toBe('Text content')
    expect(block.notes).toBe('')
  })

  it('accepts overrides', () => {
    const block = createTextBlock({ content: 'Hello', ariaLabel: 'Custom label' })
    expect(block.content).toBe('Hello')
    expect(block.ariaLabel).toBe('Custom label')
  })
})

describe('createMediaBlock', () => {
  it('returns a media block with defaults', () => {
    const block = createMediaBlock()
    expect(block.type).toBe('media')
    expect(block.id).toMatch(/^block-/)
    expect(block.assetPath).toBe('')
    expect(block.caption).toBe('')
    expect(block.altText).toBe('')
  })
})

describe('createVideoBlock', () => {
  it('returns a video block with defaults', () => {
    const block = createVideoBlock()
    expect(block.type).toBe('video')
    expect(block.source).toBe('upload')
    expect(block.url).toBe('')
    expect(block.transcript).toBe('')
    expect(block.captions).toEqual([])
    expect(block.poster).toBe('')
  })
})

describe('createAudioBlock', () => {
  it('returns an audio block with defaults', () => {
    const block = createAudioBlock()
    expect(block.type).toBe('audio')
    expect(block.assetPath).toBe('')
    expect(block.transcript).toBe('')
    expect(block.captions).toEqual([])
  })
})

describe('createQuizBlock', () => {
  it('returns a quiz block with defaults', () => {
    const block = createQuizBlock()
    expect(block.type).toBe('quiz')
    expect(block.questions).toEqual([])
    expect(block.passThreshold).toBe(70)
    expect(block.showFeedback).toBe(true)
    expect(block.allowRetry).toBe(true)
    expect(block.shuffleQuestions).toBe(false)
    expect(block.shuffleAnswers).toBe(false)
  })
})

describe('createDragDropBlock', () => {
  it('returns a drag-drop block with defaults', () => {
    const block = createDragDropBlock()
    expect(block.type).toBe('drag-drop')
    expect(block.items).toEqual([])
    expect(block.zones).toEqual([])
    expect(block.instruction).toBe('Drag each item to the correct zone.')
  })
})

describe('createMatchingBlock', () => {
  it('returns a matching block with defaults', () => {
    const block = createMatchingBlock()
    expect(block.type).toBe('matching')
    expect(block.leftItems).toEqual([])
    expect(block.rightItems).toEqual([])
    expect(block.correctPairs).toEqual([])
    expect(block.instruction).toContain('Match each item')
  })
})

describe('createAccordionBlock', () => {
  it('returns an accordion block with one default section', () => {
    const block = createAccordionBlock()
    expect(block.type).toBe('accordion')
    expect(block.items).toHaveLength(1)
    expect(block.items[0].title).toBe('Section 1')
    expect(block.items[0].content).toBe('')
  })
})

describe('createTabsBlock', () => {
  it('returns a tabs block with one default tab', () => {
    const block = createTabsBlock()
    expect(block.type).toBe('tabs')
    expect(block.tabs).toHaveLength(1)
    expect(block.tabs[0].label).toBe('Tab 1')
  })
})

describe('createFlashcardBlock', () => {
  it('returns a flashcard block with one empty card', () => {
    const block = createFlashcardBlock()
    expect(block.type).toBe('flashcard')
    expect(block.cards).toHaveLength(1)
    expect(block.cards[0]).toEqual({ front: '', back: '' })
  })
})

describe('createBranchingBlock', () => {
  it('returns a branching block with defaults', () => {
    const block = createBranchingBlock()
    expect(block.type).toBe('branching')
    expect(block.scenario).toBe('')
    expect(block.choices).toEqual([])
  })
})

describe('createEmbedBlock', () => {
  it('returns an embed block with defaults', () => {
    const block = createEmbedBlock()
    expect(block.type).toBe('embed')
    expect(block.url).toBe('')
    expect(block.title).toBe('')
  })
})

describe('createCodeBlock', () => {
  it('returns a code block with defaults', () => {
    const block = createCodeBlock()
    expect(block.type).toBe('code')
    expect(block.language).toBe('javascript')
    expect(block.code).toBe('')
    expect(block.runnable).toBe(false)
  })
})

describe('createDividerBlock', () => {
  it('returns a divider block with defaults', () => {
    const block = createDividerBlock()
    expect(block.type).toBe('divider')
    expect(block.style).toBe('line')
  })
})

describe('createCalloutBlock', () => {
  it('returns a callout block with defaults', () => {
    const block = createCalloutBlock()
    expect(block.type).toBe('callout')
    expect(block.variant).toBe('info')
    expect(block.content).toBe('')
  })
})

describe('createH5PBlock', () => {
  it('returns an H5P block with defaults', () => {
    const block = createH5PBlock()
    expect(block.type).toBe('h5p')
    expect(block.embedUrl).toBe('')
  })
})

describe('createCustomHTMLBlock', () => {
  it('returns a custom HTML block with defaults', () => {
    const block = createCustomHTMLBlock()
    expect(block.type).toBe('custom-html')
    expect(block.html).toBe('')
    expect(block.css).toBe('')
    expect(block.js).toBe('')
  })
})

// ─── Quiz Helpers ───

describe('createQuizChoice', () => {
  it('creates a choice with defaults', () => {
    const choice = createQuizChoice()
    expect(choice.id).toMatch(/^choice-/)
    expect(choice.label).toBe('')
    expect(choice.isCorrect).toBe(false)
  })

  it('accepts overrides', () => {
    const choice = createQuizChoice({ label: 'Answer A', isCorrect: true })
    expect(choice.label).toBe('Answer A')
    expect(choice.isCorrect).toBe(true)
  })
})

describe('createQuizQuestion', () => {
  it('creates a multiple-choice question with 4 default choices', () => {
    const q = createQuizQuestion('multiple-choice')
    expect(q.type).toBe('multiple-choice')
    expect(q.id).toMatch(/^question-/)
    expect(q.choices).toHaveLength(4)
    expect(q.choices[0].label).toBe('Option A')
    expect(q.choices[0].isCorrect).toBe(true)
    expect(q.correctId).toBe(q.choices[0].id)
  })

  it('creates a true-false question with 2 choices', () => {
    const q = createQuizQuestion('true-false')
    expect(q.type).toBe('true-false')
    expect(q.choices).toHaveLength(2)
    expect(q.choices[0].label).toBe('True')
    expect(q.choices[1].label).toBe('False')
    expect(q.choices[0].isCorrect).toBe(true)
    expect(q.correctId).toBe(q.choices[0].id)
  })

  it('creates a likert question with 5 scale choices', () => {
    const q = createQuizQuestion('likert')
    expect(q.type).toBe('likert')
    expect(q.choices).toHaveLength(5)
    expect(q.choices[0].label).toBe('Strongly Disagree')
    expect(q.choices[4].label).toBe('Strongly Agree')
  })

  it('creates a short-answer question with no choices', () => {
    const q = createQuizQuestion('short-answer')
    expect(q.type).toBe('short-answer')
    expect(q.choices).toHaveLength(0)
  })

  it('defaults to multiple-choice when no type is provided', () => {
    const q = createQuizQuestion()
    expect(q.type).toBe('multiple-choice')
    expect(q.choices).toHaveLength(4)
  })
})

// ─── Universal Factory ───

describe('createBlock', () => {
  const blockTypes = [
    'text', 'media', 'video', 'audio', 'quiz',
    'drag-drop', 'matching', 'accordion', 'tabs',
    'flashcard', 'branching', 'embed', 'code',
    'divider', 'callout', 'h5p', 'custom-html'
  ] as const

  it.each(blockTypes)('creates a block of type "%s"', (type) => {
    const block = createBlock(type)
    expect(block.type).toBe(type)
    expect(block.id).toMatch(/^block-/)
    expect(typeof block.ariaLabel).toBe('string')
    expect(typeof block.notes).toBe('string')
  })

  it('each block type produces a unique id', () => {
    const ids = blockTypes.map((type) => createBlock(type).id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })
})
