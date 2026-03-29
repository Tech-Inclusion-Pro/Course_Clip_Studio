import { useEffect } from 'react'
import { useAppStore, type ThemeMode } from '@/stores/useAppStore'

function getResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export function useTheme(): void {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    function apply(): void {
      const resolved = getResolvedTheme(theme)
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    apply()

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (): void => apply()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  // Persist theme preference via IPC
  useEffect(() => {
    window.electronAPI?.theme.set(theme)
  }, [theme])
}
