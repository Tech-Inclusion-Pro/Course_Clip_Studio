import { useEffect, useRef } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { saveCourseToWorkspace } from '@/lib/workspace'
import type { Course } from '@/types/course'

const DEBOUNCE_MS = 1500

/**
 * Subscribes to course store changes and auto-saves to workspace on disk.
 * Uses per-course debounce timers to avoid unnecessary writes.
 */
export function useAutoSave(): void {
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const prevCourses = useRef<Course[]>([])

  useEffect(() => {
    const unsubscribe = useCourseStore.subscribe((state) => {
      const workspacePath = useAppStore.getState().workspacePath
      if (!workspacePath) return

      const courses = state.courses

      // Detect which courses changed by comparing updatedAt
      for (const course of courses) {
        const prev = prevCourses.current.find((c) => c.id === course.id)
        if (prev && prev.updatedAt === course.updatedAt) continue

        // Course is new or changed — debounce save
        const id = course.id
        if (timers.current[id]) {
          clearTimeout(timers.current[id])
        }
        timers.current[id] = setTimeout(() => {
          // Re-read latest state in case of additional changes during debounce
          const latest = useCourseStore.getState().courses.find((c) => c.id === id)
          if (latest && useAppStore.getState().workspacePath) {
            saveCourseToWorkspace(useAppStore.getState().workspacePath!, latest).catch((err) =>
              console.error(`Auto-save failed for course ${id}:`, err)
            )
          }
          delete timers.current[id]
        }, DEBOUNCE_MS)
      }

      prevCourses.current = courses
    })

    return () => {
      unsubscribe()
      // Flush pending timers
      for (const id of Object.keys(timers.current)) {
        clearTimeout(timers.current[id])
      }
    }
  }, [])
}
