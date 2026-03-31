import { describe, it, expect } from 'vitest'
import {
  reorder,
  findModule,
  findLesson,
  findBlock,
  getAllLessons,
  getAllBlocks,
  countLessons,
  countBlocks,
  udlChecklistScore,
  udlPillarScores,
  udlStatusColor,
  findMissingAltText,
  findMissingTranscripts,
  serializeCourse,
  deserializeCourse,
  estimateDuration
} from '@/lib/course-helpers'
import type { Course, Module, Lesson, ContentBlock, UDLChecklist } from '@/types/course'

// ─── Helpers ───

function makeUDLChecklist(overrides: Partial<{
  representation: Partial<UDLChecklist['representation']>
  action: Partial<UDLChecklist['action']>
  engagement: Partial<UDLChecklist['engagement']>
}> = {}): UDLChecklist {
  return {
    representation: {
      multipleFormats: false,
      altTextPresent: false,
      transcriptsPresent: false,
      captionsPresent: false,
      readingLevelAppropriate: false,
      ...overrides.representation
    },
    action: {
      keyboardNavigable: false,
      multipleResponseModes: false,
      sufficientTime: false,
      ...overrides.action
    },
    engagement: {
      choiceAndAutonomy: false,
      relevantContext: false,
      feedbackPresent: false,
      progressVisible: false,
      ...overrides.engagement
    }
  }
}

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: 'les-1',
    title: 'Lesson 1',
    blocks: [],
    notes: [],
    accessibilityScore: null,
    readingLevel: null,
    ...overrides
  }
}

function makeModule(overrides: Partial<Module> = {}): Module {
  return {
    id: 'mod-1',
    title: 'Module 1',
    description: '',
    lessons: [],
    udlChecklist: makeUDLChecklist(),
    completionRequired: false,
    ...overrides
  }
}

function makeCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: 'c1',
    meta: {
      title: 'Test Course',
      description: '',
      author: 'Tester',
      language: 'en',
      estimatedDuration: 30,
      tags: [],
      thumbnail: null,
      version: '1.0'
    },
    theme: {
      id: 'theme-1',
      name: 'Default',
      primaryColor: '#000',
      secondaryColor: '#111',
      accentColor: '#222',
      backgroundColor: '#fff',
      surfaceColor: '#f5f5f5',
      textColor: '#000',
      fontFamily: 'sans-serif',
      fontFamilyHeading: 'sans-serif',
      googleFontUrl: null,
      logoPath: null,
      customCSS: '',
      darkMode: false,
      playerShell: {
        headerColor: '#000',
        buttonStyle: 'rounded',
        progressBarColor: '#0000ff',
        backgroundColor: '#fff',
        showLogo: false
      },
      loadingScreen: {
        logoPath: null,
        backgroundColor: '#fff',
        showProgressRing: true,
        message: 'Loading...'
      }
    },
    modules: [],
    certificate: null,
    settings: {
      requireLinearNavigation: false,
      allowSkip: true,
      showProgressBar: true,
      showEstimatedTime: true,
      learnerNotesEnabled: false,
      learnerBookmarksEnabled: false,
      feedbackFormsEnabled: false,
      accessibilityModeToggle: true,
      completionCriteria: 'visit-all',
      xapi: null,
      scorm: null
    },
    history: [],
    publishStatus: 'draft',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    ...overrides
  }
}

// ─── Tests ───

describe('reorder', () => {
  it('moves an item from one index to another', () => {
    const arr = ['a', 'b', 'c', 'd']
    expect(reorder(arr, 0, 2)).toEqual(['b', 'c', 'a', 'd'])
  })

  it('moves an item to a lower index', () => {
    const arr = ['a', 'b', 'c', 'd']
    expect(reorder(arr, 3, 1)).toEqual(['a', 'd', 'b', 'c'])
  })

  it('returns a new array (does not mutate original)', () => {
    const arr = ['a', 'b', 'c']
    const result = reorder(arr, 0, 2)
    expect(result).not.toBe(arr)
    expect(arr).toEqual(['a', 'b', 'c']) // original unchanged
  })

  it('handles same index (no-op)', () => {
    const arr = ['a', 'b', 'c']
    expect(reorder(arr, 1, 1)).toEqual(['a', 'b', 'c'])
  })
})

describe('findModule', () => {
  it('returns the module when found', () => {
    const mod = makeModule({ id: 'mod-1', title: 'Found' })
    const course = makeCourse({ modules: [mod] })

    const result = findModule(course, 'mod-1')
    expect(result).toBeDefined()
    expect(result?.title).toBe('Found')
  })

  it('returns undefined when not found', () => {
    const course = makeCourse({ modules: [] })
    expect(findModule(course, 'nonexistent')).toBeUndefined()
  })
})

describe('findLesson', () => {
  it('returns the lesson and its parent module', () => {
    const lesson = makeLesson({ id: 'les-1', title: 'Target' })
    const mod = makeModule({ id: 'mod-1', lessons: [lesson] })
    const course = makeCourse({ modules: [mod] })

    const result = findLesson(course, 'les-1')
    expect(result).toBeDefined()
    expect(result?.lesson.title).toBe('Target')
    expect(result?.module.id).toBe('mod-1')
  })

  it('returns undefined when not found', () => {
    const course = makeCourse({ modules: [makeModule()] })
    expect(findLesson(course, 'nonexistent')).toBeUndefined()
  })
})

describe('findBlock', () => {
  it('returns block, lesson, and module when found', () => {
    const block: ContentBlock = {
      id: 'b1',
      type: 'text',
      ariaLabel: 'Text',
      notes: '',
      content: 'Hello'
    } as ContentBlock
    const lesson = makeLesson({ id: 'les-1', blocks: [block] })
    const mod = makeModule({ id: 'mod-1', lessons: [lesson] })
    const course = makeCourse({ modules: [mod] })

    const result = findBlock(course, 'b1')
    expect(result).toBeDefined()
    expect(result?.block.id).toBe('b1')
    expect(result?.lesson.id).toBe('les-1')
    expect(result?.module.id).toBe('mod-1')
  })

  it('returns undefined when not found', () => {
    const course = makeCourse()
    expect(findBlock(course, 'nonexistent')).toBeUndefined()
  })
})

describe('getAllLessons', () => {
  it('returns all lessons flattened across modules', () => {
    const l1 = makeLesson({ id: 'l1' })
    const l2 = makeLesson({ id: 'l2' })
    const l3 = makeLesson({ id: 'l3' })
    const course = makeCourse({
      modules: [
        makeModule({ id: 'm1', lessons: [l1, l2] }),
        makeModule({ id: 'm2', lessons: [l3] })
      ]
    })

    const result = getAllLessons(course)
    expect(result).toHaveLength(3)
    expect(result.map((l) => l.id)).toEqual(['l1', 'l2', 'l3'])
  })
})

describe('getAllBlocks', () => {
  it('returns all blocks flattened across modules and lessons', () => {
    const b1 = { id: 'b1', type: 'text', ariaLabel: '', notes: '', content: '' } as ContentBlock
    const b2 = { id: 'b2', type: 'text', ariaLabel: '', notes: '', content: '' } as ContentBlock
    const course = makeCourse({
      modules: [
        makeModule({ id: 'm1', lessons: [makeLesson({ id: 'l1', blocks: [b1] })] }),
        makeModule({ id: 'm2', lessons: [makeLesson({ id: 'l2', blocks: [b2] })] })
      ]
    })

    const result = getAllBlocks(course)
    expect(result).toHaveLength(2)
  })
})

describe('countLessons', () => {
  it('counts total lessons across all modules', () => {
    const course = makeCourse({
      modules: [
        makeModule({ lessons: [makeLesson({ id: 'l1' }), makeLesson({ id: 'l2' })] }),
        makeModule({ id: 'm2', lessons: [makeLesson({ id: 'l3' })] })
      ]
    })

    expect(countLessons(course)).toBe(3)
  })

  it('returns 0 for an empty course', () => {
    expect(countLessons(makeCourse())).toBe(0)
  })
})

describe('countBlocks', () => {
  it('counts total blocks across all modules and lessons', () => {
    const b1 = { id: 'b1', type: 'text', ariaLabel: '', notes: '', content: '' } as ContentBlock
    const b2 = { id: 'b2', type: 'text', ariaLabel: '', notes: '', content: '' } as ContentBlock
    const b3 = { id: 'b3', type: 'text', ariaLabel: '', notes: '', content: '' } as ContentBlock
    const course = makeCourse({
      modules: [
        makeModule({ lessons: [makeLesson({ blocks: [b1, b2] })] }),
        makeModule({ id: 'm2', lessons: [makeLesson({ id: 'l2', blocks: [b3] })] })
      ]
    })

    expect(countBlocks(course)).toBe(3)
  })
})

describe('udlChecklistScore', () => {
  it('returns 0/12 when nothing is checked', () => {
    const checklist = makeUDLChecklist()
    const result = udlChecklistScore(checklist)
    expect(result).toEqual({ checked: 0, total: 12 })
  })

  it('returns 12/12 when everything is checked', () => {
    const checklist = makeUDLChecklist({
      representation: {
        multipleFormats: true,
        altTextPresent: true,
        transcriptsPresent: true,
        captionsPresent: true,
        readingLevelAppropriate: true
      },
      action: {
        keyboardNavigable: true,
        multipleResponseModes: true,
        sufficientTime: true
      },
      engagement: {
        choiceAndAutonomy: true,
        relevantContext: true,
        feedbackPresent: true,
        progressVisible: true
      }
    })
    const result = udlChecklistScore(checklist)
    expect(result).toEqual({ checked: 12, total: 12 })
  })

  it('counts partial checks correctly', () => {
    const checklist = makeUDLChecklist({
      representation: { multipleFormats: true, altTextPresent: true },
      action: { keyboardNavigable: true }
    })
    const result = udlChecklistScore(checklist)
    expect(result).toEqual({ checked: 3, total: 12 })
  })
})

describe('udlStatusColor', () => {
  it('returns "red" for low scores (< 40%)', () => {
    const checklist = makeUDLChecklist()
    expect(udlStatusColor(checklist)).toBe('red')
  })

  it('returns "yellow" for medium scores (40-74%)', () => {
    // 6/12 = 50% -> yellow
    const checklist = makeUDLChecklist({
      representation: {
        multipleFormats: true,
        altTextPresent: true,
        transcriptsPresent: true,
        captionsPresent: true,
        readingLevelAppropriate: true
      },
      action: { keyboardNavigable: true }
    })
    expect(udlStatusColor(checklist)).toBe('yellow')
  })

  it('returns "green" for high scores (>= 75%)', () => {
    // 9/12 = 75% -> green
    const checklist = makeUDLChecklist({
      representation: {
        multipleFormats: true,
        altTextPresent: true,
        transcriptsPresent: true,
        captionsPresent: true,
        readingLevelAppropriate: true
      },
      action: {
        keyboardNavigable: true,
        multipleResponseModes: true,
        sufficientTime: true
      },
      engagement: { choiceAndAutonomy: true }
    })
    expect(udlStatusColor(checklist)).toBe('green')
  })
})

describe('udlPillarScores', () => {
  it('returns 0% for all pillars when nothing is checked', () => {
    const checklist = makeUDLChecklist()
    const result = udlPillarScores(checklist)
    expect(result).toEqual({ representation: 0, action: 0, engagement: 0 })
  })

  it('computes per-pillar percentages correctly', () => {
    // representation: 2/5 = 40%, action: 1/3 = 33%, engagement: 3/4 = 75%
    const checklist = makeUDLChecklist({
      representation: { multipleFormats: true, altTextPresent: true },
      action: { keyboardNavigable: true },
      engagement: { choiceAndAutonomy: true, relevantContext: true, feedbackPresent: true }
    })
    const result = udlPillarScores(checklist)
    expect(result.representation).toBe(40)
    expect(result.action).toBe(33)
    expect(result.engagement).toBe(75)
  })

  it('returns 100% for full completion', () => {
    const checklist = makeUDLChecklist({
      representation: {
        multipleFormats: true,
        altTextPresent: true,
        transcriptsPresent: true,
        captionsPresent: true,
        readingLevelAppropriate: true
      },
      action: {
        keyboardNavigable: true,
        multipleResponseModes: true,
        sufficientTime: true
      },
      engagement: {
        choiceAndAutonomy: true,
        relevantContext: true,
        feedbackPresent: true,
        progressVisible: true
      }
    })
    const result = udlPillarScores(checklist)
    expect(result).toEqual({ representation: 100, action: 100, engagement: 100 })
  })
})

describe('findMissingAltText', () => {
  it('returns media blocks without alt text', () => {
    const mediaNoAlt = { id: 'b1', type: 'media', ariaLabel: '', notes: '', assetPath: '', caption: '', altText: '' } as ContentBlock
    const mediaWithAlt = { id: 'b2', type: 'media', ariaLabel: '', notes: '', assetPath: '', caption: '', altText: 'Has alt' } as ContentBlock
    const course = makeCourse({
      modules: [makeModule({ lessons: [makeLesson({ title: 'L1', blocks: [mediaNoAlt, mediaWithAlt] })] })]
    })

    const issues = findMissingAltText(course)
    expect(issues).toHaveLength(1)
    expect(issues[0].block.id).toBe('b1')
    expect(issues[0].lessonTitle).toBe('L1')
  })
})

describe('findMissingTranscripts', () => {
  it('returns video/audio blocks without transcripts', () => {
    const videoNoTranscript = { id: 'b1', type: 'video', ariaLabel: '', notes: '', source: 'upload', url: '', transcript: '', captions: [], poster: '' } as ContentBlock
    const audioWithTranscript = { id: 'b2', type: 'audio', ariaLabel: '', notes: '', assetPath: '', transcript: 'Has transcript', captions: [] } as ContentBlock
    const course = makeCourse({
      modules: [makeModule({ lessons: [makeLesson({ title: 'L1', blocks: [videoNoTranscript, audioWithTranscript] })] })]
    })

    const issues = findMissingTranscripts(course)
    expect(issues).toHaveLength(1)
    expect(issues[0].block.id).toBe('b1')
  })
})

describe('serializeCourse / deserializeCourse', () => {
  it('round-trips a course through JSON', () => {
    const course = makeCourse({ id: 'round-trip' })
    const json = serializeCourse(course)
    const restored = deserializeCourse(json)
    expect(restored.id).toBe('round-trip')
    expect(restored.meta.title).toBe('Test Course')
  })
})

describe('estimateDuration', () => {
  it('returns 0 for a course with no modules', () => {
    expect(estimateDuration(makeCourse())).toBe(0)
  })

  it('estimates 5 min per lesson + 2 min per generic block', () => {
    const textBlock = { id: 'b1', type: 'text', ariaLabel: '', notes: '', content: '' } as ContentBlock
    const course = makeCourse({
      modules: [makeModule({ lessons: [makeLesson({ blocks: [textBlock] })] })]
    })
    // 1 lesson (5 min) + 1 text block (2 min) = 7 min
    expect(estimateDuration(course)).toBe(7)
  })

  it('estimates more time for quiz, video, and audio blocks', () => {
    const quiz = { id: 'b1', type: 'quiz', ariaLabel: '', notes: '', questions: [], passThreshold: 70, showFeedback: true, allowRetry: true, shuffleQuestions: false, shuffleAnswers: false } as ContentBlock
    const video = { id: 'b2', type: 'video', ariaLabel: '', notes: '', source: 'upload', url: '', transcript: '', captions: [], poster: '' } as ContentBlock
    const audio = { id: 'b3', type: 'audio', ariaLabel: '', notes: '', assetPath: '', transcript: '', captions: [] } as ContentBlock
    const course = makeCourse({
      modules: [makeModule({ lessons: [makeLesson({ blocks: [quiz, video, audio] })] })]
    })
    // 1 lesson (5) + quiz (5) + video (8) + audio (4) = 22 min
    expect(estimateDuration(course)).toBe(22)
  })
})
