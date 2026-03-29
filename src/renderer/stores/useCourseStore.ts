import { create } from 'zustand'
import { uid } from '@/lib/uid'
import { reorder } from '@/lib/course-helpers'
import type { Course, Module, Lesson, ContentBlock, CourseMeta, CourseSettings, CourseTheme, UDLChecklist, PublishStatus } from '@/types/course'

// ─── Helper: immutably update a course by ID ───

function mapCourse(
  courses: Course[],
  courseId: string,
  updater: (course: Course) => Course
): Course[] {
  return courses.map((c) => (c.id === courseId ? updater(c) : c))
}

function mapModule(
  course: Course,
  moduleId: string,
  updater: (mod: Module) => Module
): Course {
  return {
    ...course,
    modules: course.modules.map((m) => (m.id === moduleId ? updater(m) : m)),
    updatedAt: new Date().toISOString()
  }
}

function mapLesson(
  course: Course,
  moduleId: string,
  lessonId: string,
  updater: (lesson: Lesson) => Lesson
): Course {
  return mapModule(course, moduleId, (mod) => ({
    ...mod,
    lessons: mod.lessons.map((l) => (l.id === lessonId ? updater(l) : l))
  }))
}

// ─── Store Interface ───

interface CourseState {
  courses: Course[]
  activeCourseId: string | null

  // Course-level
  setCourses: (courses: Course[]) => void
  setActiveCourse: (id: string | null) => void
  addCourse: (course: Course) => void
  removeCourse: (id: string) => void
  updateCourse: (id: string, partial: Partial<Course>) => void
  updateCourseMeta: (courseId: string, meta: Partial<CourseMeta>) => void
  updateCourseSettings: (courseId: string, settings: Partial<CourseSettings>) => void
  updateCourseTheme: (courseId: string, theme: Partial<CourseTheme>) => void
  setPublishStatus: (courseId: string, status: PublishStatus) => void
  duplicateCourse: (id: string) => void

  // Module-level
  addModule: (courseId: string, module: Module) => void
  removeModule: (courseId: string, moduleId: string) => void
  updateModule: (courseId: string, moduleId: string, partial: Partial<Module>) => void
  reorderModules: (courseId: string, fromIndex: number, toIndex: number) => void
  updateUDLChecklist: (courseId: string, moduleId: string, checklist: Partial<UDLChecklist>) => void

  // Lesson-level
  addLesson: (courseId: string, moduleId: string, lesson: Lesson) => void
  removeLesson: (courseId: string, moduleId: string, lessonId: string) => void
  updateLesson: (courseId: string, moduleId: string, lessonId: string, partial: Partial<Lesson>) => void
  reorderLessons: (courseId: string, moduleId: string, fromIndex: number, toIndex: number) => void
  moveLessonToModule: (courseId: string, fromModuleId: string, toModuleId: string, lessonId: string, toIndex: number) => void

  // Block-level
  addBlock: (courseId: string, moduleId: string, lessonId: string, block: ContentBlock, atIndex?: number) => void
  removeBlock: (courseId: string, moduleId: string, lessonId: string, blockId: string) => void
  updateBlock: (courseId: string, moduleId: string, lessonId: string, blockId: string, partial: Partial<ContentBlock>) => void
  reorderBlocks: (courseId: string, moduleId: string, lessonId: string, fromIndex: number, toIndex: number) => void
  duplicateBlock: (courseId: string, moduleId: string, lessonId: string, blockId: string) => void

  // Computed (selectors)
  getActiveCourse: () => Course | undefined
}

export const useCourseStore = create<CourseState>((set, get) => ({
  courses: [],
  activeCourseId: null,

  // ─── Course-level ───

  setCourses: (courses) => set({ courses }),
  setActiveCourse: (id) => set({ activeCourseId: id }),

  addCourse: (course) =>
    set((state) => ({ courses: [...state.courses, course] })),

  removeCourse: (id) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== id),
      activeCourseId: state.activeCourseId === id ? null : state.activeCourseId
    })),

  updateCourse: (id, partial) =>
    set((state) => ({
      courses: mapCourse(state.courses, id, (c) => ({
        ...c,
        ...partial,
        updatedAt: new Date().toISOString()
      }))
    })),

  updateCourseMeta: (courseId, meta) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) => ({
        ...c,
        meta: { ...c.meta, ...meta },
        updatedAt: new Date().toISOString()
      }))
    })),

  updateCourseSettings: (courseId, settings) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) => ({
        ...c,
        settings: { ...c.settings, ...settings },
        updatedAt: new Date().toISOString()
      }))
    })),

  updateCourseTheme: (courseId, theme) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) => ({
        ...c,
        theme: { ...c.theme, ...theme },
        updatedAt: new Date().toISOString()
      }))
    })),

  setPublishStatus: (courseId, status) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) => ({
        ...c,
        publishStatus: status,
        updatedAt: new Date().toISOString()
      }))
    })),

  duplicateCourse: (id) =>
    set((state) => {
      const source = state.courses.find((c) => c.id === id)
      if (!source) return state
      const now = new Date().toISOString()
      const copy: Course = {
        ...structuredClone(source),
        id: uid('course'),
        meta: { ...source.meta, title: `${source.meta.title} (Copy)` },
        publishStatus: 'draft',
        createdAt: now,
        updatedAt: now,
        history: []
      }
      return { courses: [...state.courses, copy] }
    }),

  // ─── Module-level ───

  addModule: (courseId, module) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) => ({
        ...c,
        modules: [...c.modules, module],
        updatedAt: new Date().toISOString()
      }))
    })),

  removeModule: (courseId, moduleId) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) => ({
        ...c,
        modules: c.modules.filter((m) => m.id !== moduleId),
        updatedAt: new Date().toISOString()
      }))
    })),

  updateModule: (courseId, moduleId, partial) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapModule(c, moduleId, (m) => ({ ...m, ...partial }))
      )
    })),

  reorderModules: (courseId, fromIndex, toIndex) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) => ({
        ...c,
        modules: reorder(c.modules, fromIndex, toIndex),
        updatedAt: new Date().toISOString()
      }))
    })),

  updateUDLChecklist: (courseId, moduleId, checklist) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapModule(c, moduleId, (m) => ({
          ...m,
          udlChecklist: {
            representation: { ...m.udlChecklist.representation, ...checklist.representation },
            action: { ...m.udlChecklist.action, ...checklist.action },
            engagement: { ...m.udlChecklist.engagement, ...checklist.engagement }
          }
        }))
      )
    })),

  // ─── Lesson-level ───

  addLesson: (courseId, moduleId, lesson) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapModule(c, moduleId, (m) => ({
          ...m,
          lessons: [...m.lessons, lesson]
        }))
      )
    })),

  removeLesson: (courseId, moduleId, lessonId) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapModule(c, moduleId, (m) => ({
          ...m,
          lessons: m.lessons.filter((l) => l.id !== lessonId)
        }))
      )
    })),

  updateLesson: (courseId, moduleId, lessonId, partial) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapLesson(c, moduleId, lessonId, (l) => ({ ...l, ...partial }))
      )
    })),

  reorderLessons: (courseId, moduleId, fromIndex, toIndex) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapModule(c, moduleId, (m) => ({
          ...m,
          lessons: reorder(m.lessons, fromIndex, toIndex)
        }))
      )
    })),

  moveLessonToModule: (courseId, fromModuleId, toModuleId, lessonId, toIndex) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) => {
        const fromMod = c.modules.find((m) => m.id === fromModuleId)
        if (!fromMod) return c
        const lesson = fromMod.lessons.find((l) => l.id === lessonId)
        if (!lesson) return c

        return {
          ...c,
          modules: c.modules.map((m) => {
            if (m.id === fromModuleId) {
              return { ...m, lessons: m.lessons.filter((l) => l.id !== lessonId) }
            }
            if (m.id === toModuleId) {
              const newLessons = [...m.lessons]
              newLessons.splice(toIndex, 0, lesson)
              return { ...m, lessons: newLessons }
            }
            return m
          }),
          updatedAt: new Date().toISOString()
        }
      })
    })),

  // ─── Block-level ───

  addBlock: (courseId, moduleId, lessonId, block, atIndex) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapLesson(c, moduleId, lessonId, (l) => {
          const blocks = [...l.blocks]
          if (atIndex !== undefined && atIndex >= 0 && atIndex <= blocks.length) {
            blocks.splice(atIndex, 0, block)
          } else {
            blocks.push(block)
          }
          return { ...l, blocks }
        })
      )
    })),

  removeBlock: (courseId, moduleId, lessonId, blockId) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapLesson(c, moduleId, lessonId, (l) => ({
          ...l,
          blocks: l.blocks.filter((b) => b.id !== blockId)
        }))
      )
    })),

  updateBlock: (courseId, moduleId, lessonId, blockId, partial) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapLesson(c, moduleId, lessonId, (l) => ({
          ...l,
          blocks: l.blocks.map((b) =>
            b.id === blockId ? ({ ...b, ...partial } as ContentBlock) : b
          )
        }))
      )
    })),

  reorderBlocks: (courseId, moduleId, lessonId, fromIndex, toIndex) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapLesson(c, moduleId, lessonId, (l) => ({
          ...l,
          blocks: reorder(l.blocks, fromIndex, toIndex)
        }))
      )
    })),

  duplicateBlock: (courseId, moduleId, lessonId, blockId) =>
    set((state) => ({
      courses: mapCourse(state.courses, courseId, (c) =>
        mapLesson(c, moduleId, lessonId, (l) => {
          const index = l.blocks.findIndex((b) => b.id === blockId)
          if (index === -1) return l
          const source = l.blocks[index]
          const copy = { ...structuredClone(source), id: uid('block') }
          const blocks = [...l.blocks]
          blocks.splice(index + 1, 0, copy)
          return { ...l, blocks }
        })
      )
    })),

  // ─── Computed ───

  getActiveCourse: () => {
    const { courses, activeCourseId } = get()
    return courses.find((c) => c.id === activeCourseId)
  }
}))
