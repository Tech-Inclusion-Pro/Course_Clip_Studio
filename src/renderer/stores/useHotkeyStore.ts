import { create } from 'zustand'
import type {
  HotkeyContext,
  HotkeyCategory,
  HotkeyDefinition,
  HotkeyMap,
  Platform,
  ConflictResult,
  ImportResult,
  HotkeyExportFile
} from '@/types/hotkeys'
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

  // Phase 3: Remapping
  setBinding: (actionId: string, newKey: string, platform?: Platform) => ConflictResult
  swapBindings: (actionIdA: string, actionIdB: string, platform?: Platform) => void
  clearBinding: (actionId: string, platform?: Platform) => void
  resetAll: () => void
  resetCategory: (category: HotkeyCategory) => void
  resetSingle: (actionId: string) => void
  findConflict: (binding: string, context: HotkeyContext, excludeId: string, platform?: Platform) => ConflictResult
  exportKeymap: () => string
  importKeymap: (json: string) => ImportResult
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
    return hotkey.current[getPlatform()]
  },

  getFilteredHotkeys: () => {
    const { keymap, referenceSearchQuery, referenceCategoryFilter } = get()
    const query = referenceSearchQuery.toLowerCase().trim()
    return Object.values(keymap).filter((h) => {
      if (referenceCategoryFilter !== 'all' && h.category !== referenceCategoryFilter) return false
      if (query) {
        if (!h.label.toLowerCase().includes(query) && !h.description.toLowerCase().includes(query) && !h.id.toLowerCase().includes(query)) return false
      }
      return true
    })
  },

  findConflict: (binding, context, excludeId, platform) => {
    const plat = platform ?? getPlatform()
    const { keymap } = get()
    const lower = binding.toLowerCase()

    for (const def of Object.values(keymap)) {
      if (def.id === excludeId) continue
      const existing = def.current[plat].toLowerCase()
      if (!existing || existing !== lower) continue

      const isCrossContext = def.context !== context && def.context !== 'global' && context !== 'global'
      return {
        hasConflict: !isCrossContext,
        conflictingActionId: def.id,
        conflictingActionLabel: def.label,
        conflictContext: def.context,
        isCrossContext
      }
    }
    return { hasConflict: false, isCrossContext: false }
  },

  setBinding: (actionId, newKey, platform) => {
    const plat = platform ?? getPlatform()
    const { keymap, findConflict } = get()
    const def = keymap[actionId]
    if (!def || !def.isRemappable) return { hasConflict: false, isCrossContext: false }

    const conflict = findConflict(newKey, def.context, actionId, plat)

    // If same-context conflict, reassign: clear the old action
    if (conflict.hasConflict && conflict.conflictingActionId) {
      const conflicting = keymap[conflict.conflictingActionId]
      if (conflicting) {
        set({
          keymap: {
            ...get().keymap,
            [conflict.conflictingActionId]: {
              ...conflicting,
              current: { ...conflicting.current, [plat]: '' }
            },
            [actionId]: {
              ...def,
              current: { ...def.current, [plat]: newKey }
            }
          }
        })
        return conflict
      }
    }

    set({
      keymap: {
        ...get().keymap,
        [actionId]: {
          ...def,
          current: { ...def.current, [plat]: newKey }
        }
      }
    })
    return conflict
  },

  swapBindings: (actionIdA, actionIdB, platform) => {
    const plat = platform ?? getPlatform()
    const { keymap } = get()
    const a = keymap[actionIdA]
    const b = keymap[actionIdB]
    if (!a || !b) return

    const bindingA = a.current[plat]
    const bindingB = b.current[plat]

    set({
      keymap: {
        ...keymap,
        [actionIdA]: { ...a, current: { ...a.current, [plat]: bindingB } },
        [actionIdB]: { ...b, current: { ...b.current, [plat]: bindingA } }
      }
    })
  },

  clearBinding: (actionId, platform) => {
    const plat = platform ?? getPlatform()
    const { keymap } = get()
    const def = keymap[actionId]
    if (!def || !def.isRemappable) return

    set({
      keymap: {
        ...keymap,
        [actionId]: { ...def, current: { ...def.current, [plat]: '' } }
      }
    })
  },

  resetAll: () => {
    set({ keymap: { ...DEFAULT_KEYMAP } })
  },

  resetCategory: (category) => {
    const { keymap } = get()
    const updated = { ...keymap }
    for (const [id, def] of Object.entries(updated)) {
      if (def.category === category) {
        updated[id] = { ...DEFAULT_KEYMAP[id] }
      }
    }
    set({ keymap: updated })
  },

  resetSingle: (actionId) => {
    const { keymap } = get()
    const original = DEFAULT_KEYMAP[actionId]
    if (!original) return
    set({
      keymap: { ...keymap, [actionId]: { ...original } }
    })
  },

  exportKeymap: () => {
    const plat = getPlatform()
    const { keymap } = get()
    const bindings: Record<string, string> = {}

    for (const [id, def] of Object.entries(keymap)) {
      const current = def.current[plat]
      const defaultVal = def.default[plat]
      if (current !== defaultVal) {
        bindings[id] = current
      }
    }

    const exportFile: HotkeyExportFile = {
      version: '1.0',
      platform: plat,
      exportedAt: new Date().toISOString(),
      bindings
    }
    return JSON.stringify(exportFile, null, 2)
  },

  importKeymap: (json) => {
    try {
      const data = JSON.parse(json) as HotkeyExportFile
      if (!data.bindings || data.version !== '1.0') {
        return { success: false, appliedCount: 0, skippedCount: 0, conflicts: [] }
      }

      const plat = getPlatform()
      const { keymap } = get()
      const updated = { ...keymap }
      let appliedCount = 0
      let skippedCount = 0
      const conflicts: ConflictResult[] = []

      for (const [id, binding] of Object.entries(data.bindings)) {
        const def = updated[id]
        if (!def || !def.isRemappable) {
          skippedCount++
          continue
        }

        // Check for conflicts
        const conflict = get().findConflict(binding, def.context, id, plat)
        if (conflict.hasConflict && conflict.conflictingActionId) {
          const conflicting = updated[conflict.conflictingActionId]
          if (conflicting) {
            updated[conflict.conflictingActionId] = {
              ...conflicting,
              current: { ...conflicting.current, [plat]: '' }
            }
          }
          conflicts.push(conflict)
        }

        updated[id] = { ...def, current: { ...def.current, [plat]: binding } }
        appliedCount++
      }

      set({ keymap: updated })
      return { success: true, appliedCount, skippedCount, conflicts }
    } catch {
      return { success: false, appliedCount: 0, skippedCount: 0, conflicts: [] }
    }
  }
}))
