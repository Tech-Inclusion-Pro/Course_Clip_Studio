import { create } from 'zustand'
import type { Course } from '@/types/course'

interface CourseState {
  courses: Course[]
  activeCourseId: string | null
  setCourses: (courses: Course[]) => void
  setActiveCourse: (id: string | null) => void
  addCourse: (course: Course) => void
  removeCourse: (id: string) => void
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  activeCourseId: null,
  setCourses: (courses) => set({ courses }),
  setActiveCourse: (id) => set({ activeCourseId: id }),
  addCourse: (course) => set((state) => ({ courses: [...state.courses, course] })),
  removeCourse: (id) =>
    set((state) => ({
      courses: state.courses.filter((c) => c.id !== id),
      activeCourseId: state.activeCourseId === id ? null : state.activeCourseId
    }))
}))
