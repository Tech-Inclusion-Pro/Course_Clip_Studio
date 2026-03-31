import { create } from 'zustand'
import type { AISettings, AccessibilitySettings, BrandKit } from '@/types/course'

export type ThemeMode = 'light' | 'dark' | 'system'

interface AppState {
  // UI
  theme: ThemeMode
  sidebarCollapsed: boolean
  uiLanguage: string

  // Workspace
  workspacePath: string | null
  workspaceLoaded: boolean

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
  aiSettingsLoaded: boolean

  // Accessibility settings
  accessibility: AccessibilitySettings

  // Plugins
  pluginsPath: string | null
  setPluginsPath: (path: string | null) => void

  // UI actions
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setUILanguage: (lang: string) => void

  // Workspace actions
  setWorkspacePath: (path: string | null) => void
  setWorkspaceLoaded: (loaded: boolean) => void

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
  loadAISettings: () => Promise<void>
  updateAISettings: (settings: Partial<AISettings>) => void

  // Accessibility actions
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // UI defaults
  theme: 'system',
  sidebarCollapsed: false,
  uiLanguage: 'en',

  // Workspace defaults
  workspacePath: null,
  workspaceLoaded: false,

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
  aiSettingsLoaded: false,

  // Accessibility defaults
  accessibility: {
    highContrastMode: false,
    baseFontSize: 16,
    reducedMotion: false
  },

  // Plugins defaults
  pluginsPath: null,
  setPluginsPath: (path) => set({ pluginsPath: path }),

  // UI actions
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setUILanguage: (lang) => set({ uiLanguage: lang }),

  // Workspace actions
  setWorkspacePath: (path) => set({ workspacePath: path }),
  setWorkspaceLoaded: (loaded) => set({ workspaceLoaded: loaded }),

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
  loadAISettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('ai')) as Partial<AISettings> | null
      const anthropicApiKey = await window.electronAPI.secrets.get('anthropicApiKey')
      const openaiApiKey = await window.electronAPI.secrets.get('openaiApiKey')

      set((state) => ({
        ai: {
          ...state.ai,
          ...(saved?.provider !== undefined && { provider: saved.provider }),
          ...(saved?.ollamaEndpoint !== undefined && { ollamaEndpoint: saved.ollamaEndpoint }),
          ...(saved?.ollamaModel !== undefined && { ollamaModel: saved.ollamaModel }),
          ...(saved?.defaultAILanguage !== undefined && { defaultAILanguage: saved.defaultAILanguage }),
          ...(anthropicApiKey !== null && { anthropicApiKey }),
          ...(openaiApiKey !== null && { openaiApiKey })
        },
        aiSettingsLoaded: true
      }))
    } catch (err) {
      console.error('Failed to load AI settings:', err)
      set({ aiSettingsLoaded: true })
    }
  },

  updateAISettings: (settings) => {
    set((state) => ({ ai: { ...state.ai, ...settings } }))

    // Persist secrets
    if ('anthropicApiKey' in settings) {
      if (settings.anthropicApiKey) {
        window.electronAPI.secrets.set('anthropicApiKey', settings.anthropicApiKey)
      } else {
        window.electronAPI.secrets.delete('anthropicApiKey')
      }
    }
    if ('openaiApiKey' in settings) {
      if (settings.openaiApiKey) {
        window.electronAPI.secrets.set('openaiApiKey', settings.openaiApiKey)
      } else {
        window.electronAPI.secrets.delete('openaiApiKey')
      }
    }

    // Persist non-sensitive AI settings
    const { anthropicApiKey: _a, openaiApiKey: _o, ...nonSensitive } = { ...get().ai, ...settings }
    window.electronAPI.settings.set('ai', nonSensitive)
  },

  // Accessibility actions
  updateAccessibilitySettings: (settings) =>
    set((state) => ({ accessibility: { ...state.accessibility, ...settings } }))
}))
