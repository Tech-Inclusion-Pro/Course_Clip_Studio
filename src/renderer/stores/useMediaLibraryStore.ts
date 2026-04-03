import { create } from 'zustand'
import type {
  MediaAsset,
  AssetManifest,
  MediaLibraryTab,
  MediaLibraryFilters,
  ColorPalette,
  PaletteColor,
  AssetMetadata
} from '@/types/media'
import { getBuiltInAssets } from '@/lib/built-in-assets'
import {
  loadProjectManifest,
  saveProjectManifest,
  loadGlobalManifest,
  addAssetToManifest,
  removeAssetFromManifest,
  updateAssetInManifest,
  ensureAssetDirectories
} from '@/lib/media-manifest'
import { contrastRatio } from '@/lib/contrast'
import { uid } from '@/lib/uid'
import type { Course } from '@/types/course'

// ─── Default Lumina palette ───

function buildPaletteColor(hex: string, name: string): PaletteColor {
  const onWhite = contrastRatio(hex, '#ffffff') ?? 1
  const onBlack = contrastRatio(hex, '#000000') ?? 21
  return {
    hex,
    name,
    contrastOnWhite: Math.round(onWhite * 100) / 100,
    contrastOnBlack: Math.round(onBlack * 100) / 100,
    meetsAA: onWhite >= 4.5,
    meetsAALarge: onWhite >= 3
  }
}

const LUMINA_PALETTE: ColorPalette = {
  id: 'lumina-brand',
  name: 'Lumina Brand',
  colors: [
    buildPaletteColor('#a23b84', 'Magenta'),
    buildPaletteColor('#3a2b95', 'Indigo'),
    buildPaletteColor('#6f2fa6', 'Purple')
  ],
  isSystem: true,
  createdAt: '2024-01-01T00:00:00.000Z'
}

// ─── Store Interface ───

interface MediaLibraryState {
  // Tab & filters
  activeTab: MediaLibraryTab
  filters: MediaLibraryFilters
  // Assets
  builtInAssets: MediaAsset[]
  projectAssets: MediaAsset[]
  globalAssets: MediaAsset[]
  projectManifest: AssetManifest | null
  globalManifest: AssetManifest | null
  // Selection
  selectedAssetId: string | null
  // Modals
  metadataEditorOpen: boolean
  metadataEditorAssetId: string | null
  colorPaletteManagerOpen: boolean
  // Palettes
  palettes: ColorPalette[]
  // Loading
  isLoading: boolean

  // ─── Actions ───
  setTab: (tab: MediaLibraryTab) => void
  setFilter: (key: keyof MediaLibraryFilters, value: string) => void
  resetFilters: () => void
  selectAsset: (id: string | null) => void
  openMetadataEditor: (assetId: string | null) => void
  closeMetadataEditor: () => void
  toggleColorPaletteManager: () => void

  // Asset CRUD
  loadManifests: (workspacePath: string, course: Course) => Promise<void>
  addAsset: (asset: MediaAsset, workspacePath: string, course: Course) => Promise<void>
  removeAsset: (assetId: string, workspacePath: string, course: Course) => Promise<void>
  updateAssetMetadata: (
    assetId: string,
    updates: Partial<AssetMetadata>,
    workspacePath: string,
    course: Course
  ) => Promise<void>

  // Palette CRUD
  loadPalettes: () => Promise<void>
  addPalette: (name: string) => Promise<void>
  removePalette: (id: string) => Promise<void>
  updatePalette: (id: string, updates: Partial<ColorPalette>) => Promise<void>
  addColorToPalette: (paletteId: string, hex: string, name: string) => Promise<void>
  removeColorFromPalette: (paletteId: string, colorIndex: number) => Promise<void>
}

const DEFAULT_FILTERS: MediaLibraryFilters = {
  search: '',
  assetType: 'all',
  tier: 'all',
  wcagStatus: 'all',
  udlTag: 'all',
  category: 'all'
}

export const useMediaLibraryStore = create<MediaLibraryState>((set, get) => ({
  activeTab: 'all',
  filters: { ...DEFAULT_FILTERS },
  builtInAssets: getBuiltInAssets(),
  projectAssets: [],
  globalAssets: [],
  projectManifest: null,
  globalManifest: null,
  selectedAssetId: null,
  metadataEditorOpen: false,
  metadataEditorAssetId: null,
  colorPaletteManagerOpen: false,
  palettes: [LUMINA_PALETTE],
  isLoading: false,

  setTab: (tab) => set({ activeTab: tab }),

  setFilter: (key, value) =>
    set((s) => ({
      filters: { ...s.filters, [key]: value }
    })),

  resetFilters: () => set({ filters: { ...DEFAULT_FILTERS } }),

  selectAsset: (id) => set({ selectedAssetId: id }),

  openMetadataEditor: (assetId) =>
    set({ metadataEditorOpen: true, metadataEditorAssetId: assetId }),

  closeMetadataEditor: () =>
    set({ metadataEditorOpen: false, metadataEditorAssetId: null }),

  toggleColorPaletteManager: () =>
    set((s) => ({ colorPaletteManagerOpen: !s.colorPaletteManagerOpen })),

  // ─── Load manifests from disk ───

  loadManifests: async (workspacePath, course) => {
    set({ isLoading: true })
    try {
      await ensureAssetDirectories(workspacePath, course)

      const [projectManifest, globalManifest] = await Promise.all([
        loadProjectManifest(workspacePath, course),
        loadGlobalManifest()
      ])

      const projectAssets = Object.values(projectManifest.assets)
      const globalAssets = Object.values(globalManifest.assets)

      set({ projectManifest, globalManifest, projectAssets, globalAssets, isLoading: false })
    } catch (err) {
      console.error('Failed to load media manifests:', err)
      set({ isLoading: false })
    }
  },

  // ─── Add asset ───

  addAsset: async (asset, workspacePath, course) => {
    const { projectManifest } = get()
    if (!projectManifest) return

    const updated = addAssetToManifest(projectManifest, asset)
    await saveProjectManifest(workspacePath, course, updated)

    set({
      projectManifest: updated,
      projectAssets: Object.values(updated.assets)
    })
  },

  // ─── Remove asset ───

  removeAsset: async (assetId, workspacePath, course) => {
    const { projectManifest } = get()
    if (!projectManifest) return

    const updated = removeAssetFromManifest(projectManifest, assetId)
    await saveProjectManifest(workspacePath, course, updated)

    set({
      projectManifest: updated,
      projectAssets: Object.values(updated.assets),
      selectedAssetId: get().selectedAssetId === assetId ? null : get().selectedAssetId
    })
  },

  // ─── Update asset metadata ───

  updateAssetMetadata: async (assetId, updates, workspacePath, course) => {
    const { projectManifest } = get()
    if (!projectManifest) return

    const existing = projectManifest.assets[assetId]
    if (!existing) return

    const updatedAsset: MediaAsset = {
      ...existing,
      metadata: { ...existing.metadata, ...updates }
    }
    const updated = updateAssetInManifest(projectManifest, assetId, updatedAsset)
    await saveProjectManifest(workspacePath, course, updated)

    set({
      projectManifest: updated,
      projectAssets: Object.values(updated.assets)
    })
  },

  // ─── Palette operations ───

  loadPalettes: async () => {
    try {
      const saved = await window.electronAPI.settings.get('colorPalettes')
      if (Array.isArray(saved) && saved.length > 0) {
        // Always include Lumina system palette
        const custom = (saved as ColorPalette[]).filter((p) => !p.isSystem)
        set({ palettes: [LUMINA_PALETTE, ...custom] })
      }
    } catch {
      // Keep defaults
    }
  },

  addPalette: async (name) => {
    const newPalette: ColorPalette = {
      id: uid('palette'),
      name,
      colors: [],
      isSystem: false,
      createdAt: new Date().toISOString()
    }
    const palettes = [...get().palettes, newPalette]
    set({ palettes })
    await window.electronAPI.settings.set('colorPalettes', palettes)
  },

  removePalette: async (id) => {
    const palettes = get().palettes.filter((p) => p.id !== id || p.isSystem)
    set({ palettes })
    await window.electronAPI.settings.set('colorPalettes', palettes)
  },

  updatePalette: async (id, updates) => {
    const palettes = get().palettes.map((p) =>
      p.id === id && !p.isSystem ? { ...p, ...updates } : p
    )
    set({ palettes })
    await window.electronAPI.settings.set('colorPalettes', palettes)
  },

  addColorToPalette: async (paletteId, hex, name) => {
    const color = buildPaletteColor(hex, name)
    const palettes = get().palettes.map((p) =>
      p.id === paletteId ? { ...p, colors: [...p.colors, color] } : p
    )
    set({ palettes })
    await window.electronAPI.settings.set('colorPalettes', palettes)
  },

  removeColorFromPalette: async (paletteId, colorIndex) => {
    const palettes = get().palettes.map((p) =>
      p.id === paletteId
        ? { ...p, colors: p.colors.filter((_, i) => i !== colorIndex) }
        : p
    )
    set({ palettes })
    await window.electronAPI.settings.set('colorPalettes', palettes)
  }
}))
