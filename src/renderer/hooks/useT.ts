// ─── Translation Hook ───

import { useLocaleStore } from '@/stores/useLocaleStore'

/**
 * Primary hook for accessing translated strings.
 * Usage: const t = useT(); t('sidebar.myCourses', 'My Courses')
 * The fallback parameter ensures readability even before translations load.
 */
export function useT(): (key: string, fallback?: string) => string {
  return useLocaleStore((s) => s.t)
}
