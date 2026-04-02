import { create } from 'zustand'
import type { AISettings, AccessibilitySettings, BrandKit, VisualApiProvider, BaseBrainSettings, BaseBrainFile, ContentArea, ContentAreaFile, UserTemplate } from '@/types/course'
import { uid } from '@/lib/uid'
import wcagScreener from '@/assets/base-brain/01_WCAG_Accessibility_Screener.md?raw'
import udlScreener from '@/assets/base-brain/02_UDL_Screener.md?raw'
import discritScreener from '@/assets/base-brain/03_DisCrit_Inclusive_Identity_Screener.md?raw'

const DEFAULT_BRAIN_FILES: BaseBrainFile[] = [
  { name: '01_WCAG_Accessibility_Screener.md', content: wcagScreener, category: 'accessibility' },
  { name: '02_UDL_Screener.md', content: udlScreener, category: 'udl' },
  { name: '03_DisCrit_Inclusive_Identity_Screener.md', content: discritScreener, category: 'inclusive' }
]

export type ThemeMode = 'light' | 'dark' | 'system' | 'sepia' | 'midnight' | 'forest' | 'ocean' | `brand-${string}`

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

  // Visual API settings
  visualApis: { providers: VisualApiProvider[] }

  // Base Brain
  baseBrain: BaseBrainSettings

  // User Templates
  userTemplates: UserTemplate[]

  // Content Areas
  contentAreas: ContentArea[]

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
  loadAccessibilitySettings: () => Promise<void>
  updateAccessibilitySettings: (settings: Partial<AccessibilitySettings>) => void

  // Base Brain actions
  loadBaseBrainSettings: () => Promise<void>
  updateBaseBrain: (partial: Partial<BaseBrainSettings>) => void
  addBaseBrainFile: (name: string, content: string, category?: BaseBrainFile['category']) => void
  removeBaseBrainFile: (index: number) => void

  // User Template actions
  loadUserTemplates: () => Promise<void>
  addUserTemplate: (template: UserTemplate) => void
  removeUserTemplate: (id: string) => void

  // Content Area actions
  loadContentAreas: () => Promise<void>
  addContentArea: (area: Omit<ContentArea, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateContentArea: (id: string, partial: Partial<ContentArea>) => void
  removeContentArea: (id: string) => void
  addContentAreaFile: (contentAreaId: string, file: ContentAreaFile) => void
  updateContentAreaFilePriority: (contentAreaId: string, fileId: string, priority: 1 | 2 | 3) => void
  updateContentAreaFileContext: (contentAreaId: string, fileId: string, context: string) => void
  reorderContentAreaFiles: (contentAreaId: string, fileIds: string[]) => void
  removeContentAreaFile: (contentAreaId: string, fileId: string) => void

  // Visual API actions
  loadVisualApiSettings: () => Promise<void>
  updateVisualApiProvider: (id: string, updates: Partial<VisualApiProvider>) => void
  addCustomVisualApi: () => void
  removeVisualApi: (id: string) => void
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
    reducedMotion: false,
    colorBlindMode: 'none',
    cursorStyle: 'default',
    cursorTrail: false,
    openDyslexic: false,
    bionicReading: false,
    enhancedTextSpacing: false,
    enhancedFocusIndicators: false
  },

  // Base Brain defaults
  baseBrain: {
    enabled: false,
    referenceFiles: [],
    designAssumptions: '',
    toneAndVoice: '',
    visualPreferences: '',
    goals: '',
    designConsiderations: ''
  },

  // User Templates defaults
  userTemplates: [],

  // Content Areas defaults
  contentAreas: [],

  // Visual API defaults
  visualApis: {
    providers: [
      { id: 'pexels', name: 'Pexels', type: 'pexels' as const, enabled: false, apiKey: null },
      { id: 'unsplash', name: 'Unsplash', type: 'unsplash' as const, enabled: false, apiKey: null },
      { id: 'pixabay', name: 'Pixabay', type: 'pixabay' as const, enabled: false, apiKey: null }
    ]
  },

  // Plugins defaults
  pluginsPath: null,
  setPluginsPath: (path) => set({ pluginsPath: path }),

  // UI actions
  setTheme: (theme) => {
    set({ theme })
    window.electronAPI?.settings.set('themeMode', theme)
  },
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
  loadAccessibilitySettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('accessibility')) as Partial<AccessibilitySettings> | null
      if (saved) {
        set((state) => ({ accessibility: { ...state.accessibility, ...saved } }))
      }
      const savedTheme = (await window.electronAPI.settings.get('themeMode')) as ThemeMode | null
      if (savedTheme) {
        set({ theme: savedTheme })
      }
    } catch (err) {
      console.error('Failed to load accessibility settings:', err)
    }
  },

  updateAccessibilitySettings: (settings) => {
    set((state) => {
      const updated = { ...state.accessibility, ...settings }
      window.electronAPI.settings.set('accessibility', updated)
      return { accessibility: updated }
    })
  },

  // Base Brain actions
  loadBaseBrainSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('baseBrain')) as Partial<BaseBrainSettings> | null
      if (saved) {
        // Migrate old files without category
        const files = (saved.referenceFiles ?? []).map((f) => ({
          ...f,
          category: (f as BaseBrainFile).category || ('general' as const)
        }))
        set((state) => ({ baseBrain: { ...state.baseBrain, ...saved, referenceFiles: files } }))
      }
      // Auto-populate defaults if no reference files exist
      const current = get().baseBrain
      if (current.referenceFiles.length === 0) {
        const updated = { ...current, referenceFiles: DEFAULT_BRAIN_FILES }
        set({ baseBrain: updated })
        window.electronAPI.settings.set('baseBrain', updated)
      }
    } catch (err) {
      console.error('Failed to load Base Brain settings:', err)
    }
  },

  updateBaseBrain: (partial) => {
    set((state) => {
      const updated = { ...state.baseBrain, ...partial }
      window.electronAPI.settings.set('baseBrain', updated)
      return { baseBrain: updated }
    })
  },

  addBaseBrainFile: (name, content, category = 'general') => {
    set((state) => {
      const updated = {
        ...state.baseBrain,
        referenceFiles: [...state.baseBrain.referenceFiles, { name, content, category }]
      }
      window.electronAPI.settings.set('baseBrain', updated)
      return { baseBrain: updated }
    })
  },

  removeBaseBrainFile: (index) => {
    set((state) => {
      const updated = {
        ...state.baseBrain,
        referenceFiles: state.baseBrain.referenceFiles.filter((_, i) => i !== index)
      }
      window.electronAPI.settings.set('baseBrain', updated)
      return { baseBrain: updated }
    })
  },

  // User Template actions
  loadUserTemplates: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('userTemplates')) as UserTemplate[] | null
      if (saved && Array.isArray(saved)) {
        set({ userTemplates: saved })
      }
    } catch (err) {
      console.error('Failed to load user templates:', err)
    }
  },

  addUserTemplate: (template) => {
    set((state) => {
      const updated = [...state.userTemplates, template]
      window.electronAPI.settings.set('userTemplates', updated)
      return { userTemplates: updated }
    })
  },

  removeUserTemplate: (id) => {
    set((state) => {
      const updated = state.userTemplates.filter((t) => t.id !== id)
      window.electronAPI.settings.set('userTemplates', updated)
      return { userTemplates: updated }
    })
  },

  // Content Area actions
  loadContentAreas: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('contentAreas')) as ContentArea[] | null
      if (saved && Array.isArray(saved)) {
        set({ contentAreas: saved })
      }
    } catch (err) {
      console.error('Failed to load content areas:', err)
    }
  },

  addContentArea: (area) => {
    const newId = uid('ca')
    set((state) => {
      const now = new Date().toISOString()
      const newArea: ContentArea = {
        ...area,
        id: newId,
        createdAt: now,
        updatedAt: now
      }
      const updated = [...state.contentAreas, newArea]
      window.electronAPI.settings.set('contentAreas', updated)
      return { contentAreas: updated }
    })
    return newId
  },

  updateContentArea: (id, partial) => {
    set((state) => {
      const updated = state.contentAreas.map((ca) =>
        ca.id === id ? { ...ca, ...partial, updatedAt: new Date().toISOString() } : ca
      )
      window.electronAPI.settings.set('contentAreas', updated)
      return { contentAreas: updated }
    })
  },

  removeContentArea: (id) => {
    set((state) => {
      const updated = state.contentAreas.filter((ca) => ca.id !== id)
      window.electronAPI.settings.set('contentAreas', updated)
      return { contentAreas: updated }
    })
  },

  addContentAreaFile: (contentAreaId, file) => {
    set((state) => {
      const updated = state.contentAreas.map((ca) =>
        ca.id === contentAreaId
          ? { ...ca, files: [...(ca.files ?? []), file], updatedAt: new Date().toISOString() }
          : ca
      )
      window.electronAPI.settings.set('contentAreas', updated)
      return { contentAreas: updated }
    })
  },

  updateContentAreaFilePriority: (contentAreaId, fileId, priority) => {
    set((state) => {
      const updated = state.contentAreas.map((ca) =>
        ca.id === contentAreaId
          ? {
              ...ca,
              files: (ca.files ?? []).map((f) => f.id === fileId ? { ...f, priority } : f),
              updatedAt: new Date().toISOString()
            }
          : ca
      )
      window.electronAPI.settings.set('contentAreas', updated)
      return { contentAreas: updated }
    })
  },

  updateContentAreaFileContext: (contentAreaId, fileId, context) => {
    set((state) => {
      const updated = state.contentAreas.map((ca) =>
        ca.id === contentAreaId
          ? {
              ...ca,
              files: (ca.files ?? []).map((f) => f.id === fileId ? { ...f, context } : f),
              updatedAt: new Date().toISOString()
            }
          : ca
      )
      window.electronAPI.settings.set('contentAreas', updated)
      return { contentAreas: updated }
    })
  },

  reorderContentAreaFiles: (contentAreaId, fileIds) => {
    set((state) => {
      const updated = state.contentAreas.map((ca) => {
        if (ca.id !== contentAreaId) return ca
        const files = ca.files ?? []
        const reordered = fileIds
          .map((id) => files.find((f) => f.id === id))
          .filter(Boolean) as ContentAreaFile[]
        return { ...ca, files: reordered, updatedAt: new Date().toISOString() }
      })
      window.electronAPI.settings.set('contentAreas', updated)
      return { contentAreas: updated }
    })
  },

  removeContentAreaFile: (contentAreaId, fileId) => {
    set((state) => {
      const updated = state.contentAreas.map((ca) =>
        ca.id === contentAreaId
          ? {
              ...ca,
              files: (ca.files ?? []).filter((f) => f.id !== fileId),
              updatedAt: new Date().toISOString()
            }
          : ca
      )
      window.electronAPI.settings.set('contentAreas', updated)
      return { contentAreas: updated }
    })
  },

  // Visual API actions
  loadVisualApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('visualApis')) as { providers: Omit<VisualApiProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`visualApi_${p.id}`)
            return { ...p, apiKey } as VisualApiProvider
          })
        )
        set({ visualApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load visual API settings:', err)
    }
  },

  updateVisualApiProvider: (id, updates) => {
    set((state) => {
      const providers = state.visualApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )

      // Persist API key to secrets
      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`visualApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`visualApi_${id}`)
        }
      }

      // Persist non-sensitive config to settings
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('visualApis', { providers: nonSensitive })

      return { visualApis: { providers } }
    })
  },

  addCustomVisualApi: () => {
    set((state) => {
      const newProvider: VisualApiProvider = {
        id: uid('vapi'),
        name: 'Custom API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: '',
        headerName: 'Authorization',
        headerValuePrefix: 'Bearer '
      }
      const providers = [...state.visualApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('visualApis', { providers: nonSensitive })
      return { visualApis: { providers } }
    })
  },

  removeVisualApi: (id) => {
    set((state) => {
      const providers = state.visualApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`visualApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('visualApis', { providers: nonSensitive })
      return { visualApis: { providers } }
    })
  }
}))
