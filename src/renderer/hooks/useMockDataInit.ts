import { useEffect, useRef } from 'react'
import { useCourseStore } from '@/stores/useCourseStore'
import { createMockCourses } from '@/lib/mock-data'

export function useMockDataInit(): void {
  const seeded = useRef(false)
  const courses = useCourseStore((s) => s.courses)
  const setCourses = useCourseStore((s) => s.setCourses)

  useEffect(() => {
    if (seeded.current || courses.length > 0) return
    seeded.current = true
    setCourses(createMockCourses())
  }, [courses.length, setCourses])
}
