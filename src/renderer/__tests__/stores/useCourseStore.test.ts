import { describe, it, expect, beforeEach } from 'vitest'
import { useCourseStore } from '@/stores/useCourseStore'
import type { Course, Module, Lesson, ContentBlock } from '@/types/course'

// ─── Helpers ───

function makeUDLChecklist() {
  return {
    representation: {
      multipleFormats: false,
      altTextPresent: false,
      transcriptsPresent: false,
      captionsPresent: false,
      readingLevelAppropriate: false
    },
    action: {
      keyboardNavigable: false,
      multipleResponseModes: false,
      sufficientTime: false
    },
    engagement: {
      choiceAndAutonomy: false,
      relevantContext: false,
      feedbackPresent: false,
      progressVisible: false
    }
  }
}

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: 'lesson-1',
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
    id: 'course-1',
    meta: {
      title: 'Test Course',
      description: 'A test course',
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

function makeBlock(overrides: Partial<ContentBlock> = {}): ContentBlock {
  return {
    id: 'block-1',
    type: 'text',
    ariaLabel: 'Text content',
    notes: '',
    content: 'Hello world'
  } as ContentBlock
}

// ─── Tests ───

describe('useCourseStore', () => {
  beforeEach(() => {
    useCourseStore.setState({ courses: [], activeCourseId: null })
  })

  // ─── Course-level ───

  describe('course-level operations', () => {
    it('starts with an empty courses array', () => {
      const { courses } = useCourseStore.getState()
      expect(courses).toEqual([])
    })

    it('addCourse adds a course', () => {
      const course = makeCourse()
      useCourseStore.getState().addCourse(course)

      const { courses } = useCourseStore.getState()
      expect(courses).toHaveLength(1)
      expect(courses[0].id).toBe('course-1')
    })

    it('removeCourse removes a course by id', () => {
      const c1 = makeCourse({ id: 'c1' })
      const c2 = makeCourse({ id: 'c2' })
      useCourseStore.setState({ courses: [c1, c2] })

      useCourseStore.getState().removeCourse('c1')

      const { courses } = useCourseStore.getState()
      expect(courses).toHaveLength(1)
      expect(courses[0].id).toBe('c2')
    })

    it('removeCourse clears activeCourseId when removing the active course', () => {
      const course = makeCourse({ id: 'c1' })
      useCourseStore.setState({ courses: [course], activeCourseId: 'c1' })

      useCourseStore.getState().removeCourse('c1')

      expect(useCourseStore.getState().activeCourseId).toBeNull()
    })

    it('removeCourse preserves activeCourseId when removing a different course', () => {
      const c1 = makeCourse({ id: 'c1' })
      const c2 = makeCourse({ id: 'c2' })
      useCourseStore.setState({ courses: [c1, c2], activeCourseId: 'c1' })

      useCourseStore.getState().removeCourse('c2')

      expect(useCourseStore.getState().activeCourseId).toBe('c1')
    })

    it('updateCourse partially updates a course', () => {
      const course = makeCourse({ id: 'c1' })
      useCourseStore.setState({ courses: [course] })

      useCourseStore.getState().updateCourse('c1', { publishStatus: 'published' })

      const updated = useCourseStore.getState().courses[0]
      expect(updated.publishStatus).toBe('published')
      expect(updated.meta.title).toBe('Test Course') // unchanged fields preserved
    })

    it('setActiveCourse sets the active course id', () => {
      useCourseStore.getState().setActiveCourse('c1')
      expect(useCourseStore.getState().activeCourseId).toBe('c1')
    })

    it('setCourses replaces all courses', () => {
      const c1 = makeCourse({ id: 'c1' })
      const c2 = makeCourse({ id: 'c2' })
      useCourseStore.getState().setCourses([c1, c2])

      expect(useCourseStore.getState().courses).toHaveLength(2)
    })

    it('getActiveCourse returns the active course', () => {
      const course = makeCourse({ id: 'c1' })
      useCourseStore.setState({ courses: [course], activeCourseId: 'c1' })

      expect(useCourseStore.getState().getActiveCourse()?.id).toBe('c1')
    })

    it('getActiveCourse returns undefined when no course is active', () => {
      expect(useCourseStore.getState().getActiveCourse()).toBeUndefined()
    })

    it('duplicateCourse creates a copy with new id and "(Copy)" suffix', () => {
      const course = makeCourse({ id: 'c1' })
      useCourseStore.setState({ courses: [course] })

      useCourseStore.getState().duplicateCourse('c1')

      const { courses } = useCourseStore.getState()
      expect(courses).toHaveLength(2)
      expect(courses[1].id).not.toBe('c1')
      expect(courses[1].meta.title).toBe('Test Course (Copy)')
      expect(courses[1].publishStatus).toBe('draft')
    })

    it('duplicateCourse does nothing if course id not found', () => {
      useCourseStore.setState({ courses: [] })

      useCourseStore.getState().duplicateCourse('nonexistent')

      expect(useCourseStore.getState().courses).toHaveLength(0)
    })
  })

  // ─── Module-level ───

  describe('module-level operations', () => {
    it('addModule appends a module to the course', () => {
      const course = makeCourse({ id: 'c1' })
      useCourseStore.setState({ courses: [course] })

      const mod = makeModule({ id: 'mod-1' })
      useCourseStore.getState().addModule('c1', mod)

      const updated = useCourseStore.getState().courses[0]
      expect(updated.modules).toHaveLength(1)
      expect(updated.modules[0].id).toBe('mod-1')
    })

    it('removeModule removes a module by id', () => {
      const mod1 = makeModule({ id: 'mod-1' })
      const mod2 = makeModule({ id: 'mod-2' })
      const course = makeCourse({ id: 'c1', modules: [mod1, mod2] })
      useCourseStore.setState({ courses: [course] })

      useCourseStore.getState().removeModule('c1', 'mod-1')

      const updated = useCourseStore.getState().courses[0]
      expect(updated.modules).toHaveLength(1)
      expect(updated.modules[0].id).toBe('mod-2')
    })

    it('reorderModules moves a module from one index to another', () => {
      const mod1 = makeModule({ id: 'mod-1', title: 'First' })
      const mod2 = makeModule({ id: 'mod-2', title: 'Second' })
      const mod3 = makeModule({ id: 'mod-3', title: 'Third' })
      const course = makeCourse({ id: 'c1', modules: [mod1, mod2, mod3] })
      useCourseStore.setState({ courses: [course] })

      useCourseStore.getState().reorderModules('c1', 0, 2)

      const updated = useCourseStore.getState().courses[0]
      expect(updated.modules.map((m) => m.id)).toEqual(['mod-2', 'mod-3', 'mod-1'])
    })
  })

  // ─── Lesson-level ───

  describe('lesson-level operations', () => {
    it('addLesson appends a lesson to a module', () => {
      const mod = makeModule({ id: 'mod-1' })
      const course = makeCourse({ id: 'c1', modules: [mod] })
      useCourseStore.setState({ courses: [course] })

      const lesson = makeLesson({ id: 'les-1' })
      useCourseStore.getState().addLesson('c1', 'mod-1', lesson)

      const updated = useCourseStore.getState().courses[0]
      expect(updated.modules[0].lessons).toHaveLength(1)
    })

    it('removeLesson removes a lesson by id', () => {
      const lesson = makeLesson({ id: 'les-1' })
      const mod = makeModule({ id: 'mod-1', lessons: [lesson] })
      const course = makeCourse({ id: 'c1', modules: [mod] })
      useCourseStore.setState({ courses: [course] })

      useCourseStore.getState().removeLesson('c1', 'mod-1', 'les-1')

      const updated = useCourseStore.getState().courses[0]
      expect(updated.modules[0].lessons).toHaveLength(0)
    })
  })

  // ─── Block-level ───

  describe('block-level operations', () => {
    const block1: ContentBlock = {
      id: 'b1',
      type: 'text',
      ariaLabel: 'Text',
      notes: '',
      content: 'Block 1'
    } as ContentBlock

    const block2: ContentBlock = {
      id: 'b2',
      type: 'text',
      ariaLabel: 'Text',
      notes: '',
      content: 'Block 2'
    } as ContentBlock

    function setupWithBlocks(blocks: ContentBlock[]) {
      const lesson = makeLesson({ id: 'les-1', blocks })
      const mod = makeModule({ id: 'mod-1', lessons: [lesson] })
      const course = makeCourse({ id: 'c1', modules: [mod] })
      useCourseStore.setState({ courses: [course] })
    }

    it('addBlock appends a block to a lesson', () => {
      setupWithBlocks([])
      useCourseStore.getState().addBlock('c1', 'mod-1', 'les-1', block1)

      const blocks = useCourseStore.getState().courses[0].modules[0].lessons[0].blocks
      expect(blocks).toHaveLength(1)
      expect(blocks[0].id).toBe('b1')
    })

    it('addBlock inserts at specific index', () => {
      setupWithBlocks([block1])
      useCourseStore.getState().addBlock('c1', 'mod-1', 'les-1', block2, 0)

      const blocks = useCourseStore.getState().courses[0].modules[0].lessons[0].blocks
      expect(blocks).toHaveLength(2)
      expect(blocks[0].id).toBe('b2')
      expect(blocks[1].id).toBe('b1')
    })

    it('removeBlock removes a block by id', () => {
      setupWithBlocks([block1, block2])
      useCourseStore.getState().removeBlock('c1', 'mod-1', 'les-1', 'b1')

      const blocks = useCourseStore.getState().courses[0].modules[0].lessons[0].blocks
      expect(blocks).toHaveLength(1)
      expect(blocks[0].id).toBe('b2')
    })

    it('updateBlock partially updates a block', () => {
      setupWithBlocks([block1])
      useCourseStore.getState().updateBlock('c1', 'mod-1', 'les-1', 'b1', { ariaLabel: 'Updated' })

      const block = useCourseStore.getState().courses[0].modules[0].lessons[0].blocks[0]
      expect(block.ariaLabel).toBe('Updated')
    })

    it('reorderBlocks moves a block within a lesson', () => {
      const b3: ContentBlock = { id: 'b3', type: 'text', ariaLabel: 'Text', notes: '', content: 'Block 3' } as ContentBlock
      setupWithBlocks([block1, block2, b3])

      useCourseStore.getState().reorderBlocks('c1', 'mod-1', 'les-1', 2, 0)

      const blocks = useCourseStore.getState().courses[0].modules[0].lessons[0].blocks
      expect(blocks.map((b) => b.id)).toEqual(['b3', 'b1', 'b2'])
    })

    it('duplicateBlock creates a copy after the original', () => {
      setupWithBlocks([block1, block2])
      useCourseStore.getState().duplicateBlock('c1', 'mod-1', 'les-1', 'b1')

      const blocks = useCourseStore.getState().courses[0].modules[0].lessons[0].blocks
      expect(blocks).toHaveLength(3)
      expect(blocks[1].id).not.toBe('b1')
      expect(blocks[1].type).toBe('text')
      expect(blocks[2].id).toBe('b2')
    })
  })
})
