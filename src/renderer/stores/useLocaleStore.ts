// ─── Locale Store — AI-Driven Localization ───

import { create } from 'zustand'
import { EN_STRINGS } from '@/lib/i18n/en-strings'
import { getLanguage, isRTL } from '@/lib/i18n/languages'
import { loadFontForLanguage } from '@/lib/i18n/fonts'
import { translateUIStrings } from '@/lib/i18n/translate-ui'
import { getProvider } from '@/lib/ai/ai-client'
import { useAppStore } from './useAppStore'

interface LocaleState {
  activeLanguage: string
  translations: Record<string, string>
  isTranslating: boolean
  translationProgress: number
  error: string | null

  setLanguage: (code: string) => Promise<void>
  t: (key: string, fallback?: string) => string
  loadCachedTranslation: (code: string) => boolean
}

function cacheKey(code: string): string {
  return `locale_cache_${code}`
}

export const useLocaleStore = create<LocaleState>((set, get) => ({
  activeLanguage: 'en',
  translations: { ...EN_STRINGS },
  isTranslating: false,
  translationProgress: 0,
  error: null,

  loadCachedTranslation: (code: string): boolean => {
    try {
      const cached = localStorage.getItem(cacheKey(code))
      if (cached) {
        const parsed = JSON.parse(cached) as Record<string, string>
        set({ translations: parsed, activeLanguage: code, error: null })
        return true
      }
    } catch {
      // Cache corrupted — ignore
    }
    return false
  },

  setLanguage: async (code: string): Promise<void> => {
    // English is instant — it's the source
    if (code === 'en') {
      set({
        activeLanguage: 'en',
        translations: { ...EN_STRINGS },
        isTranslating: false,
        translationProgress: 0,
        error: null
      })
      document.documentElement.setAttribute('lang', 'en')
      document.documentElement.setAttribute('dir', 'ltr')
      window.electronAPI?.settings.set('uiLanguage', 'en')
      return
    }

    // Check localStorage cache
    if (get().loadCachedTranslation(code)) {
      document.documentElement.setAttribute('lang', code)
      document.documentElement.setAttribute('dir', isRTL(code) ? 'rtl' : 'ltr')
      loadFontForLanguage(code)
      window.electronAPI?.settings.set('uiLanguage', code)
      return
    }

    // AI translation needed
    set({ isTranslating: true, translationProgress: 0, error: null, activeLanguage: code })
    document.documentElement.setAttribute('lang', code)
    document.documentElement.setAttribute('dir', isRTL(code) ? 'rtl' : 'ltr')
    loadFontForLanguage(code)

    try {
      const aiSettings = useAppStore.getState().ai
      const provider = getProvider(aiSettings)

      const translated = await translateUIStrings(
        provider,
        EN_STRINGS,
        code,
        (percent) => set({ translationProgress: percent })
      )

      // Merge with EN_STRINGS so any missing keys fall back
      const merged = { ...EN_STRINGS, ...translated }

      // Cache in localStorage
      try {
        localStorage.setItem(cacheKey(code), JSON.stringify(merged))
      } catch {
        // localStorage full — continue without caching
      }

      set({
        translations: merged,
        isTranslating: false,
        translationProgress: 100,
        error: null
      })

      window.electronAPI?.settings.set('uiLanguage', code)
    } catch (err) {
      console.error('Translation failed:', err)
      set({
        translations: { ...EN_STRINGS },
        isTranslating: false,
        error: err instanceof Error ? err.message : 'Translation failed',
        activeLanguage: code
      })
    }
  },

  t: (key: string, fallback?: string): string => {
    const { translations } = get()
    return translations[key] ?? EN_STRINGS[key] ?? fallback ?? key
  }
}))
