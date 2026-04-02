import { useCallback } from 'react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useAppStore } from '@/stores/useAppStore'
import { copyAssetToCourse } from '@/lib/asset-manager'

/**
 * Hook that returns a function to copy an uploaded file into the course's
 * assets folder. Returns the new path, or the original if copy fails.
 */
export function useAssetUpload(): (sourcePath: string) => Promise<string> {
  const course = useCourseStore((s) => s.getActiveCourse())
  const workspacePath = useAppStore((s) => s.workspacePath)

  return useCallback(
    async (sourcePath: string): Promise<string> => {
      if (!course || !workspacePath) return sourcePath
      try {
        return await copyAssetToCourse(workspacePath, course, sourcePath)
      } catch {
        // If copy fails, fall back to original path
        return sourcePath
      }
    },
    [course, workspacePath]
  )
}
