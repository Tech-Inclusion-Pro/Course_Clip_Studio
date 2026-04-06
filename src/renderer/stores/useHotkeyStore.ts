import { create } from 'zustand'
import type { HotkeyContext, HotkeyCategory, HotkeyDefinition, HotkeyMap } from '@/types/hotkeys'
import { DEFAULT_KEYMAP } from '@/lib/default-keymap'
import { getPlatform } from '@/lib/hotkey-utils'

interface HotkeyState {
  keymap: HotkeyMap
  activeContext: HotkeyContext
  referenceOpen: boolean
  referenceSearchQuery: string
  referenceCategoryFilter: HotkeyCategory | 'all'

  setActiveContext: (context: HotkeyContext) => void
  toggleReference: () => void
  setReferenceOpen: (open: boolean) => void
  setReferenceSearch: (query: string) => void
  setReferenceCategoryFilter: (filter: HotkeyCategory | 'all') => void
  getHotkey: (id: string) => HotkeyDefinition | undefined
  getHotkeysForCategory: (category: HotkeyCategory) => HotkeyDefinition[]
  getCurrentBinding: (id: string) => string
  getFilteredHotkeys: () => HotkeyDefinition[]
}

export const useHotkeyStore = create<HotkeyState>((set, get) => ({
  keymap: { ...DEFAULT_KEYMAP },
  activeContext: 'global',
  referenceOpen: false,
  referenceSearchQuery: '',
  referenceCategoryFilter: 'all',

  setActiveContext: (context) => set({ activeContext: context }),

  toggleReference: () => set((s) => ({ referenceOpen: !s.referenceOpen })),

  setReferenceOpen: (open) => set({ referenceOpen: open }),

  setReferenceSearch: (query) => set({ referenceSearchQuery: query }),

  setReferenceCategoryFilter: (filter) => set({ referenceCategoryFilter: filter }),

  getHotkey: (id) => get().keymap[id],

  getHotkeysForCategory: (category) =>
    Object.values(get().keymap).filter((h) => h.category === category),

  getCurrentBinding: (id) => {
    const hotkey = get().keymap[id]
    if (!hotkey) return ''
    const platform = getPlatform()
    return hotkey.current[platform]
  },

  getFilteredHotkeys: () => {
    const { keymap, referenceSearchQuery, referenceCategoryFilter } = get()
    const query = referenceSearchQuery.toLowerCase().trim()
    return Object.values(keymap).filter((h) => {
      if (referenceCategoryFilter !== 'all' && h.category !== referenceCategoryFilter) return false
      if (query) {
        const matchesLabel = h.label.toLowerCase().includes(query)
        const matchesDesc = h.description.toLowerCase().includes(query)
        const matchesId = h.id.toLowerCase().includes(query)
        if (!matchesLabel && !matchesDesc && !matchesId) return false
      }
      return true
    })
  }
}))
