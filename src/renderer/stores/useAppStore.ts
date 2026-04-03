import { create } from 'zustand'
import type { AISettings, AccessibilitySettings, BrandKit, VisualApiProvider, VideoApiProvider, ChartApiProvider, AudioApiProvider, DiagramApiProvider, InteractiveVideoApiProvider, MathApiProvider, ContentImportProvider, AssetManagementProvider, BaseBrainSettings, BaseBrainFile, ContentArea, ContentAreaFile, UserTemplate } from '@/types/course'
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

  // Video API settings
  videoApis: { providers: VideoApiProvider[] }

  // Chart API settings
  chartApis: { providers: ChartApiProvider[] }

  // Audio API settings
  audioApis: { providers: AudioApiProvider[] }

  // Diagram API settings
  diagramApis: { providers: DiagramApiProvider[] }

  // Interactive Video API settings
  interactiveVideoApis: { providers: InteractiveVideoApiProvider[] }

  // Math API settings
  mathApis: { providers: MathApiProvider[] }

  // Content Import settings
  contentImportApis: { providers: ContentImportProvider[] }

  // Asset Management settings
  assetManagementApis: { providers: AssetManagementProvider[] }

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

  // Video API actions
  loadVideoApiSettings: () => Promise<void>
  updateVideoApiProvider: (id: string, updates: Partial<VideoApiProvider>) => void
  addCustomVideoApi: () => void
  removeVideoApi: (id: string) => void

  // Chart API actions
  loadChartApiSettings: () => Promise<void>
  updateChartApiProvider: (id: string, updates: Partial<ChartApiProvider>) => void
  addCustomChartApi: () => void
  removeChartApi: (id: string) => void

  // Audio API actions
  loadAudioApiSettings: () => Promise<void>
  updateAudioApiProvider: (id: string, updates: Partial<AudioApiProvider>) => void
  addCustomAudioApi: () => void
  removeAudioApi: (id: string) => void

  // Diagram API actions
  loadDiagramApiSettings: () => Promise<void>
  updateDiagramApiProvider: (id: string, updates: Partial<DiagramApiProvider>) => void
  addCustomDiagramApi: () => void
  removeDiagramApi: (id: string) => void

  // Interactive Video API actions
  loadInteractiveVideoApiSettings: () => Promise<void>
  updateInteractiveVideoApiProvider: (id: string, updates: Partial<InteractiveVideoApiProvider>) => void
  addCustomInteractiveVideoApi: () => void
  removeInteractiveVideoApi: (id: string) => void

  // Math API actions
  loadMathApiSettings: () => Promise<void>
  updateMathApiProvider: (id: string, updates: Partial<MathApiProvider>) => void
  addCustomMathApi: () => void
  removeMathApi: (id: string) => void

  // Content Import actions
  loadContentImportApiSettings: () => Promise<void>
  updateContentImportProvider: (id: string, updates: Partial<ContentImportProvider>) => void
  addCustomContentImportApi: () => void
  removeContentImportApi: (id: string) => void

  // Asset Management actions
  loadAssetManagementApiSettings: () => Promise<void>
  updateAssetManagementProvider: (id: string, updates: Partial<AssetManagementProvider>) => void
  addCustomAssetManagementApi: () => void
  removeAssetManagementApi: (id: string) => void
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

  // Video API defaults
  videoApis: {
    providers: [
      { id: 'pexels-video', name: 'Pexels Video', type: 'pexels-video' as const, enabled: false, apiKey: null, notes: 'Fully free — same API as images' },
      { id: 'pixabay-video', name: 'Pixabay Video', type: 'pixabay-video' as const, enabled: false, apiKey: null, notes: 'Free — short clips, good variety' },
      { id: 'youtube-iframe', name: 'YouTube iFrame API', type: 'youtube-iframe' as const, enabled: false, apiKey: null, notes: 'Free — embed any public video, control playback via JS' },
      { id: 'vimeo-oembed', name: 'Vimeo oEmbed', type: 'vimeo-oembed' as const, enabled: false, apiKey: null, notes: 'Free — cleaner player than YouTube, accessibility-friendly' }
    ]
  },

  // Chart API defaults
  chartApis: {
    providers: [
      { id: 'quickchart', name: 'QuickChart.io', type: 'quickchart' as const, enabled: false, apiKey: null, local: false, notes: 'Free, open source, no watermarks — create chart images via URL, supports all Chart.js types' },
      { id: 'chartjs', name: 'Chart.js', type: 'chartjs' as const, enabled: false, apiKey: null, local: true, notes: 'Free (local) — client-side, no API call needed, highly customizable' },
      { id: 'd3', name: 'D3.js', type: 'd3' as const, enabled: false, apiKey: null, local: true, notes: 'Free (local) — most powerful for custom data viz, SVG-based, WCAG-friendly' },
      { id: 'recharts', name: 'Recharts', type: 'recharts' as const, enabled: false, apiKey: null, local: true, notes: 'Free (local) — React-native, great fit for Electron/React stack' },
      { id: 'observable-plot', name: 'Observable Plot', type: 'observable-plot' as const, enabled: false, apiKey: null, local: true, notes: 'Free (local) — modern D3 abstraction, cleaner API' }
    ]
  },

  // Audio API defaults
  audioApis: {
    providers: [
      { id: 'openai-whisper', name: 'OpenAI Whisper', type: 'openai-whisper' as const, enabled: false, apiKey: null, local: true, notes: 'Free (local via Ollama) — auto-transcription for any uploaded audio/video, runs on your M3' },
      { id: 'elevenlabs', name: 'ElevenLabs', type: 'elevenlabs' as const, enabled: false, apiKey: null, local: false, notes: 'Free tier (limited) — high-quality TTS for narration generation' },
      { id: 'kokoro-piper', name: 'Kokoro / Piper TTS', type: 'kokoro-piper' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free (local) — open source TTS that runs entirely on-device via Ollama' }
    ]
  },

  // Diagram API defaults
  diagramApis: {
    providers: [
      { id: 'mermaid', name: 'Mermaid.js', type: 'mermaid' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free — text-to-diagram (flowcharts, sequence diagrams, Gantt charts), renders live from syntax' },
      { id: 'excalidraw', name: 'Excalidraw', type: 'excalidraw' as const, enabled: false, apiKey: null, local: true, notes: 'Free (open source) — sketch-style whiteboards embeddable in Electron, great for visual learners' },
      { id: 'kroki', name: 'Kroki API', type: 'kroki' as const, enabled: false, apiKey: null, local: false, notes: 'Fully free, self-hostable — unified diagram rendering for 20+ diagram types from plain text' },
      { id: 'd3-diagrams', name: 'D3.js', type: 'd3-diagrams' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free — custom data visualizations, already in your React stack' }
    ]
  },

  // Interactive Video API defaults
  interactiveVideoApis: {
    providers: [
      { id: 'youtube-interactive', name: 'YouTube iFrame API', type: 'youtube-interactive' as const, enabled: false, apiKey: null, local: false, notes: 'Fully free — programmatic playback control, chapter markers, caption toggling' },
      { id: 'vimeo-player', name: 'Vimeo oEmbed + Player API', type: 'vimeo-player' as const, enabled: false, apiKey: null, local: false, notes: 'Free (basic) — cleaner accessibility controls than YouTube, custom captions' },
      { id: 'h5p', name: 'H5P.org API', type: 'h5p' as const, enabled: false, apiKey: null, local: true, notes: 'Free (self-hosted) — interactive video, branching scenarios, quiz overlays, open source and WCAG-tested' },
      { id: 'videojs', name: 'Video.js', type: 'videojs' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free (open source) — WCAG-compliant video player you control entirely, better than embedding iframes' }
    ]
  },

  // Math API defaults
  mathApis: {
    providers: [
      { id: 'mathjax', name: 'MathJax', type: 'mathjax' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free — renders LaTeX/MathML, accessible to screen readers, better than images of equations' },
      { id: 'katex', name: 'KaTeX', type: 'katex' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free — faster than MathJax, same accessibility output' },
      { id: 'chemistry-rdkit', name: 'Chemistry.js / RDKit.js', type: 'chemistry-rdkit' as const, enabled: false, apiKey: null, local: true, notes: 'Free — for STEM course authors, molecular structure rendering' }
    ]
  },

  // Content Import defaults
  contentImportApis: {
    providers: [
      { id: 'mammoth', name: 'Mammoth.js', type: 'mammoth' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free — convert .docx to clean HTML in the browser, auto-structure Word docs' },
      { id: 'pdfjs', name: 'pdf.js (Mozilla)', type: 'pdfjs' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free — parse PDFs client-side, extract text blocks with reading order' },
      { id: 'turndown', name: 'Turndown', type: 'turndown' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free — HTML to Markdown converter for clean content normalization' },
      { id: 'pptxgenjs', name: 'PptxGenJS', type: 'pptxgenjs' as const, enabled: false, apiKey: null, local: true, notes: 'Fully free — already in your stack, export back to PPTX as a secondary deliverable' }
    ]
  },

  // Asset Management defaults
  assetManagementApis: {
    providers: [
      { id: 'pexels-unsplash', name: 'Pexels + Unsplash', type: 'pexels-unsplash' as const, enabled: false, apiKey: null, notes: 'Fully free — diverse, curated, accessible stock photos and videos' },
      { id: 'noun-project', name: 'Noun Project API', type: 'noun-project' as const, enabled: false, apiKey: null, notes: 'Free tier (limited) — 5M+ icons, all SVG, searchable, colorable, accessible' },
      { id: 'font-awesome', name: 'Font Awesome API', type: 'font-awesome' as const, enabled: false, apiKey: null, local: true, notes: 'Free (self-hosted) — icon system with ARIA labels baked in' },
      { id: 'lottie-files', name: 'LottieFiles API', type: 'lottie-files' as const, enabled: false, apiKey: null, notes: 'Free tier — animation library, Lottie JSON files are lightweight, scalable, screen-reader compatible with ARIA' }
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
  },

  // Video API actions
  loadVideoApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('videoApis')) as { providers: Omit<VideoApiProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`videoApi_${p.id}`)
            return { ...p, apiKey } as VideoApiProvider
          })
        )
        set({ videoApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load video API settings:', err)
    }
  },

  updateVideoApiProvider: (id, updates) => {
    set((state) => {
      const providers = state.videoApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )

      // Persist API key to secrets
      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`videoApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`videoApi_${id}`)
        }
      }

      // Persist non-sensitive config to settings
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('videoApis', { providers: nonSensitive })

      return { videoApis: { providers } }
    })
  },

  addCustomVideoApi: () => {
    set((state) => {
      const newProvider: VideoApiProvider = {
        id: uid('vidapi'),
        name: 'Custom Video API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: '',
        headerName: 'Authorization',
        headerValuePrefix: 'Bearer '
      }
      const providers = [...state.videoApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('videoApis', { providers: nonSensitive })
      return { videoApis: { providers } }
    })
  },

  removeVideoApi: (id) => {
    set((state) => {
      const providers = state.videoApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`videoApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('videoApis', { providers: nonSensitive })
      return { videoApis: { providers } }
    })
  },

  // Chart API actions
  loadChartApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('chartApis')) as { providers: Omit<ChartApiProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`chartApi_${p.id}`)
            return { ...p, apiKey } as ChartApiProvider
          })
        )
        set({ chartApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load chart API settings:', err)
    }
  },

  updateChartApiProvider: (id, updates) => {
    set((state) => {
      const providers = state.chartApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )

      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`chartApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`chartApi_${id}`)
        }
      }

      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('chartApis', { providers: nonSensitive })

      return { chartApis: { providers } }
    })
  },

  addCustomChartApi: () => {
    set((state) => {
      const newProvider: ChartApiProvider = {
        id: uid('chartapi'),
        name: 'Custom Chart API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: '',
        headerName: 'Authorization',
        headerValuePrefix: 'Bearer '
      }
      const providers = [...state.chartApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('chartApis', { providers: nonSensitive })
      return { chartApis: { providers } }
    })
  },

  removeChartApi: (id) => {
    set((state) => {
      const providers = state.chartApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`chartApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('chartApis', { providers: nonSensitive })
      return { chartApis: { providers } }
    })
  },

  // Audio API actions
  loadAudioApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('audioApis')) as { providers: Omit<AudioApiProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`audioApi_${p.id}`)
            return { ...p, apiKey } as AudioApiProvider
          })
        )
        set({ audioApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load audio API settings:', err)
    }
  },

  updateAudioApiProvider: (id, updates) => {
    set((state) => {
      const providers = state.audioApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )

      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`audioApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`audioApi_${id}`)
        }
      }

      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('audioApis', { providers: nonSensitive })

      return { audioApis: { providers } }
    })
  },

  addCustomAudioApi: () => {
    set((state) => {
      const newProvider: AudioApiProvider = {
        id: uid('audapi'),
        name: 'Custom Audio API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: '',
        headerName: 'Authorization',
        headerValuePrefix: 'Bearer '
      }
      const providers = [...state.audioApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('audioApis', { providers: nonSensitive })
      return { audioApis: { providers } }
    })
  },

  removeAudioApi: (id) => {
    set((state) => {
      const providers = state.audioApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`audioApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('audioApis', { providers: nonSensitive })
      return { audioApis: { providers } }
    })
  },

  // Diagram API actions
  loadDiagramApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('diagramApis')) as { providers: Omit<DiagramApiProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`diagramApi_${p.id}`)
            return { ...p, apiKey } as DiagramApiProvider
          })
        )
        set({ diagramApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load diagram API settings:', err)
    }
  },

  updateDiagramApiProvider: (id, updates) => {
    set((state) => {
      const providers = state.diagramApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )

      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`diagramApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`diagramApi_${id}`)
        }
      }

      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('diagramApis', { providers: nonSensitive })

      return { diagramApis: { providers } }
    })
  },

  addCustomDiagramApi: () => {
    set((state) => {
      const newProvider: DiagramApiProvider = {
        id: uid('diagapi'),
        name: 'Custom Diagram API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: '',
        headerName: 'Authorization',
        headerValuePrefix: 'Bearer '
      }
      const providers = [...state.diagramApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('diagramApis', { providers: nonSensitive })
      return { diagramApis: { providers } }
    })
  },

  removeDiagramApi: (id) => {
    set((state) => {
      const providers = state.diagramApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`diagramApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('diagramApis', { providers: nonSensitive })
      return { diagramApis: { providers } }
    })
  },

  // Interactive Video API actions
  loadInteractiveVideoApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('interactiveVideoApis')) as { providers: Omit<InteractiveVideoApiProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`ivApi_${p.id}`)
            return { ...p, apiKey } as InteractiveVideoApiProvider
          })
        )
        set({ interactiveVideoApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load interactive video API settings:', err)
    }
  },

  updateInteractiveVideoApiProvider: (id, updates) => {
    set((state) => {
      const providers = state.interactiveVideoApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )

      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`ivApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`ivApi_${id}`)
        }
      }

      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('interactiveVideoApis', { providers: nonSensitive })

      return { interactiveVideoApis: { providers } }
    })
  },

  addCustomInteractiveVideoApi: () => {
    set((state) => {
      const newProvider: InteractiveVideoApiProvider = {
        id: uid('ivapi'),
        name: 'Custom Interactive Video API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: '',
        headerName: 'Authorization',
        headerValuePrefix: 'Bearer '
      }
      const providers = [...state.interactiveVideoApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('interactiveVideoApis', { providers: nonSensitive })
      return { interactiveVideoApis: { providers } }
    })
  },

  removeInteractiveVideoApi: (id) => {
    set((state) => {
      const providers = state.interactiveVideoApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`ivApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('interactiveVideoApis', { providers: nonSensitive })
      return { interactiveVideoApis: { providers } }
    })
  },

  // Math API actions
  loadMathApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('mathApis')) as { providers: Omit<MathApiProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`mathApi_${p.id}`)
            return { ...p, apiKey } as MathApiProvider
          })
        )
        set({ mathApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load math API settings:', err)
    }
  },

  updateMathApiProvider: (id, updates) => {
    set((state) => {
      const providers = state.mathApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )

      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`mathApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`mathApi_${id}`)
        }
      }

      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('mathApis', { providers: nonSensitive })

      return { mathApis: { providers } }
    })
  },

  addCustomMathApi: () => {
    set((state) => {
      const newProvider: MathApiProvider = {
        id: uid('mathapi'),
        name: 'Custom Math API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: '',
        headerName: 'Authorization',
        headerValuePrefix: 'Bearer '
      }
      const providers = [...state.mathApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('mathApis', { providers: nonSensitive })
      return { mathApis: { providers } }
    })
  },

  removeMathApi: (id) => {
    set((state) => {
      const providers = state.mathApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`mathApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('mathApis', { providers: nonSensitive })
      return { mathApis: { providers } }
    })
  },

  // Content Import actions
  loadContentImportApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('contentImportApis')) as { providers: Omit<ContentImportProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`contentImportApi_${p.id}`)
            return { ...p, apiKey } as ContentImportProvider
          })
        )
        set({ contentImportApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load content import API settings:', err)
    }
  },

  updateContentImportProvider: (id, updates) => {
    set((state) => {
      const providers = state.contentImportApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`contentImportApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`contentImportApi_${id}`)
        }
      }
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('contentImportApis', { providers: nonSensitive })
      return { contentImportApis: { providers } }
    })
  },

  addCustomContentImportApi: () => {
    set((state) => {
      const newProvider: ContentImportProvider = {
        id: uid('cimportapi'),
        name: 'Custom Import API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: ''
      }
      const providers = [...state.contentImportApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('contentImportApis', { providers: nonSensitive })
      return { contentImportApis: { providers } }
    })
  },

  removeContentImportApi: (id) => {
    set((state) => {
      const providers = state.contentImportApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`contentImportApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('contentImportApis', { providers: nonSensitive })
      return { contentImportApis: { providers } }
    })
  },

  // Asset Management actions
  loadAssetManagementApiSettings: async () => {
    try {
      const saved = (await window.electronAPI.settings.get('assetManagementApis')) as { providers: Omit<AssetManagementProvider, 'apiKey'>[] } | null
      if (saved?.providers) {
        const providers = await Promise.all(
          saved.providers.map(async (p) => {
            const apiKey = await window.electronAPI.secrets.get(`assetApi_${p.id}`)
            return { ...p, apiKey } as AssetManagementProvider
          })
        )
        set({ assetManagementApis: { providers } })
      }
    } catch (err) {
      console.error('Failed to load asset management API settings:', err)
    }
  },

  updateAssetManagementProvider: (id, updates) => {
    set((state) => {
      const providers = state.assetManagementApis.providers.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      )
      if ('apiKey' in updates) {
        if (updates.apiKey) {
          window.electronAPI.secrets.set(`assetApi_${id}`, updates.apiKey)
        } else {
          window.electronAPI.secrets.delete(`assetApi_${id}`)
        }
      }
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('assetManagementApis', { providers: nonSensitive })
      return { assetManagementApis: { providers } }
    })
  },

  addCustomAssetManagementApi: () => {
    set((state) => {
      const newProvider: AssetManagementProvider = {
        id: uid('assetapi'),
        name: 'Custom Asset API',
        type: 'custom',
        enabled: false,
        apiKey: null,
        endpoint: ''
      }
      const providers = [...state.assetManagementApis.providers, newProvider]
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('assetManagementApis', { providers: nonSensitive })
      return { assetManagementApis: { providers } }
    })
  },

  removeAssetManagementApi: (id) => {
    set((state) => {
      const providers = state.assetManagementApis.providers.filter((p) => p.id !== id)
      window.electronAPI.secrets.delete(`assetApi_${id}`)
      const nonSensitive = providers.map(({ apiKey: _, ...rest }) => rest)
      window.electronAPI.settings.set('assetManagementApis', { providers: nonSensitive })
      return { assetManagementApis: { providers } }
    })
  }
}))
