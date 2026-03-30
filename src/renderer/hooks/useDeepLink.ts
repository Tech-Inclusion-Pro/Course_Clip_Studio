import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/stores/useCourseStore'
import { ROUTES } from '@/lib/constants'

/**
 * Listen for deep link events (lumina://open?course=path)
 * and navigate to the corresponding course editor.
 */
export function useDeepLink(): void {
  const navigate = useNavigate()
  const courses = useCourseStore((s) => s.courses)
  const setActiveCourse = useCourseStore((s) => s.setActiveCourse)

  useEffect(() => {
    const cleanup = window.electronAPI.deepLink.onOpenCourse((coursePath) => {
      // Try to find a course that matches the path (by id or title slug)
      const match = courses.find(
        (c) => c.id === coursePath || c.meta.title.toLowerCase().replace(/\s+/g, '-') === coursePath
      )

      if (match) {
        setActiveCourse(match.id)
        navigate(ROUTES.EDITOR)
      }
    })

    return cleanup
  }, [courses, setActiveCourse, navigate])
}
