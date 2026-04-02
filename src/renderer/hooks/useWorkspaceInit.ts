import { useEffect, useRef } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { loadWorkspacePath, loadWorkspace } from '@/lib/workspace'

/**
 * On mount: load workspace path from settings, scan folder, populate courses.
 */
export function useWorkspaceInit(): void {
  const initialized = useRef(false)
  const setWorkspacePath = useAppStore((s) => s.setWorkspacePath)
  const setWorkspaceLoaded = useAppStore((s) => s.setWorkspaceLoaded)
  const setCourses = useCourseStore((s) => s.setCourses)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    async function init() {
      try {
        const [path] = await Promise.all([
          loadWorkspacePath(),
          useAppStore.getState().loadAISettings(),
          useAppStore.getState().loadAccessibilitySettings(),
          useAppStore.getState().loadVisualApiSettings(),
          useAppStore.getState().loadBaseBrainSettings(),
          useAppStore.getState().loadContentAreas(),
          useAppStore.getState().loadUserTemplates(),
          useSyllabusStore.getState().loadSyllabusData()
        ])
        if (path) {
          setWorkspacePath(path)
          const courses = await loadWorkspace(path)
          setCourses(courses)
        }
      } catch (err) {
        console.error('Failed to load workspace:', err)
      } finally {
        setWorkspaceLoaded(true)
      }
    }

    init()
  }, [setWorkspacePath, setWorkspaceLoaded, setCourses])
}
