import { create } from 'zustand'
import type { AISettings, AccessibilitySettings, BrandKit } from '@/types/course'

export type ThemeMode = 'light' | 'dark' | 'system'

interface AppState {
  // UI
  theme: ThemeMode
  sidebarCollapsed: boolean

  // Author settings
  authorName: string
  defaultLanguage: string
  autoSaveIntervalMs: number
  defaultExportFolder: string | null

  // Brand kits
  activeBrandKitId: string | null
  brandKits: BrandKit[]

  // AI settings
  ai: AISettings

  // Accessibility settings
  accessibility: AccessibilitySettings

  // UI actions
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Author actions
  setAuthorName: (name: string) => void
  setDefaultLanguage: (lang: string) => void
  setAutoSaveInterval: (ms: number) => void
  setDefaultExportFolder: (path: string | null) => void

  // Brand kit actions
  setActiveBrandKit: (id: string | null) => void
  addBrandKit: (kit: BrandKit) => void
  updateBrandKit: (id: string, partial: Partial<BrandKit>) => void
  removeBrandKit: (id: string) => void

  // AI actions
  updateAISettings: (settings: Partial<AISettings>) => void

  // Accessibility actions
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void
}

export const useAppStore = create<AppState>((set) => ({
  // UI defaults
  theme: 'system',
  sidebarCollapsed: false,

  // Author defaults
  authorName: 'Course Author',
  defaultLanguage: 'en',
  autoSaveIntervalMs: 5 * 60 * 1000, // 5 minutes
  defaultExportFolder: null,

  // Brand kit defaults
  activeBrandKitId: null,
  brandKits: [],

  // AI defaults
  ai: {
    provider: null,
    anthropicApiKey: null,
    openaiApiKey: null,
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: null,
    defaultAILanguage: 'en'
  },

  // Accessibility defaults
  accessibility: {
    highContrastMode: false,
    baseFontSize: 16,
    reducedMotion: false
  },

  // UI actions
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

  // Author actions
  setAuthorName: (name) => set({ authorName: name }),
  setDefaultLanguage: (lang) => set({ defaultLanguage: lang }),
  setAutoSaveInterval: (ms) => set({ autoSaveIntervalMs: ms }),
  setDefaultExportFolder: (path) => set({ defaultExportFolder: path }),

  // Brand kit actions
  setActiveBrandKit: (id) => set({ activeBrandKitId: id }),
  addBrandKit: (kit) => set((state) => ({ brandKits: [...state.brandKits, kit] })),
  updateBrandKit: (id, partial) =>
    set((state) => ({
      brandKits: state.brandKits.map((k) =>
        k.id === id ? { ...k, ...partial, updatedAt: new Date().toISOString() } : k
      )
    })),
  removeBrandKit: (id) =>
    set((state) => ({
      brandKits: state.brandKits.filter((k) => k.id !== id),
      activeBrandKitId: state.activeBrandKitId === id ? null : state.activeBrandKitId
    })),

  // AI actions
  updateAISettings: (settings) =>
    set((state) => ({ ai: { ...state.ai, ...settings } })),

  // Accessibility actions
  updateAccessibilitySettings: (settings) =>
    set((state) => ({ accessibility: { ...state.accessibility, ...settings } }))
}))
