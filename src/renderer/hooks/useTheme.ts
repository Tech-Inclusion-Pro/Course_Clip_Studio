import { useEffect } from 'react'
import { useAppStore, type ThemeMode } from '@/stores/useAppStore'

const ALL_THEME_CLASSES = ['light', 'dark', 'sepia', 'midnight', 'forest', 'ocean']
const DARK_THEMES = new Set(['dark', 'midnight', 'ocean'])

function resolveThemeClass(mode: ThemeMode): string {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  // Built-in themes
  if (ALL_THEME_CLASSES.includes(mode)) {
    return mode
  }
  // Brand kit themes use a dynamic style element — apply dark/light base
  return 'light'
}

function applyBrandKitTheme(brandKitId: string): void {
  const brandKits = useAppStore.getState().brandKits
  const kit = brandKits.find((k) => k.id === brandKitId)
  let el = document.getElementById('brand-theme-vars')

  if (!kit) {
    el?.remove()
    return
  }

  if (!el) {
    el = document.createElement('style')
    el.id = 'brand-theme-vars'
    document.head.appendChild(el)
  }

  // Generate a light theme derived from brand kit colors
  el.textContent = `
    :root {
      --brand-magenta: ${kit.primaryColor};
      --brand-indigo: ${kit.secondaryColor};
      --brand-purple: ${kit.accentColor};
      --text-brand: ${kit.primaryColor};
      --border-brand: ${kit.secondaryColor};
      --icon-active: ${kit.primaryColor};
      --focus-ring-color: ${kit.secondaryColor};
    }
  `
}

function removeBrandKitTheme(): void {
  document.getElementById('brand-theme-vars')?.remove()
}

export function useTheme(): void {
  const theme = useAppStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    function apply(): void {
      const themeClass = resolveThemeClass(theme)

      // Remove all theme classes
      root.classList.remove(...ALL_THEME_CLASSES)
      root.classList.add(themeClass)

      // Handle brand kit themes
      if (typeof theme === 'string' && theme.startsWith('brand-')) {
        const brandKitId = theme.slice(6)
        applyBrandKitTheme(brandKitId)
      } else {
        removeBrandKitTheme()
      }
    }

    apply()

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (): void => apply()
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }

    return undefined
  }, [theme])

  // Persist theme preference via IPC
  useEffect(() => {
    window.electronAPI?.theme.set(theme)
  }, [theme])
}

export { ALL_THEME_CLASSES, DARK_THEMES }
