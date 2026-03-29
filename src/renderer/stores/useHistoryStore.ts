import { create } from 'zustand'
import { uid } from '@/lib/uid'
import type { VersionSnapshot } from '@/types/course'

const MAX_UNDO_STACK = 50

interface HistoryState {
  // Undo/redo stacks store serialized course JSON
  undoStack: VersionSnapshot[]
  redoStack: VersionSnapshot[]

  // Auto-snapshot tracking
  lastAutoSnapshotAt: number

  // Actions
  pushSnapshot: (courseJson: string, label?: string) => void
  undo: () => VersionSnapshot | undefined
  redo: () => VersionSnapshot | undefined
  canUndo: () => boolean
  canRedo: () => boolean
  clearHistory: () => void

  // Auto-snapshot
  shouldAutoSnapshot: (intervalMs: number) => boolean
  markAutoSnapshot: () => void
}

export const useHistoryStore = create<HistoryState>((set, get) => ({
  undoStack: [],
  redoStack: [],
  lastAutoSnapshotAt: Date.now(),

  pushSnapshot: (courseJson, label) => {
    const snapshot: VersionSnapshot = {
      id: uid('snap'),
      timestamp: new Date().toISOString(),
      label: label || 'Auto-save',
      courseJson
    }
    set((state) => ({
      undoStack: [...state.undoStack.slice(-MAX_UNDO_STACK + 1), snapshot],
      redoStack: [] // Clear redo on new action
    }))
  },

  undo: () => {
    const { undoStack } = get()
    if (undoStack.length === 0) return undefined
    const snapshot = undoStack[undoStack.length - 1]
    set((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, snapshot]
    }))
    return snapshot
  },

  redo: () => {
    const { redoStack } = get()
    if (redoStack.length === 0) return undefined
    const snapshot = redoStack[redoStack.length - 1]
    set((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, snapshot]
    }))
    return snapshot
  },

  canUndo: () => get().undoStack.length > 0,
  canRedo: () => get().redoStack.length > 0,

  clearHistory: () => set({ undoStack: [], redoStack: [], lastAutoSnapshotAt: Date.now() }),

  shouldAutoSnapshot: (intervalMs) => {
    return Date.now() - get().lastAutoSnapshotAt >= intervalMs
  },

  markAutoSnapshot: () => set({ lastAutoSnapshotAt: Date.now() })
}))
