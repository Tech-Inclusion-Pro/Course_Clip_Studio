import { create } from 'zustand'

interface LearnerNote {
  id: string
  lessonId: string
  blockId?: string
  content: string
  timestamp: string
}

interface LearnerBookmark {
  id: string
  lessonId: string
  title: string
  timestamp: string
}

interface PreviewState {
  notes: LearnerNote[]
  bookmarks: LearnerBookmark[]

  addNote: (note: LearnerNote) => void
  removeNote: (id: string) => void
  updateNote: (id: string, content: string) => void

  addBookmark: (bookmark: LearnerBookmark) => void
  removeBookmark: (id: string) => void

  clearAll: () => void
}

export const usePreviewStore = create<PreviewState>((set) => ({
  notes: [],
  bookmarks: [],

  addNote: (note) => set((s) => ({ notes: [...s.notes, note] })),
  removeNote: (id) => set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  updateNote: (id, content) => set((s) => ({
    notes: s.notes.map((n) => (n.id === id ? { ...n, content } : n))
  })),

  addBookmark: (bookmark) => set((s) => ({ bookmarks: [...s.bookmarks, bookmark] })),
  removeBookmark: (id) => set((s) => ({ bookmarks: s.bookmarks.filter((b) => b.id !== id) })),

  clearAll: () => set({ notes: [], bookmarks: [] })
}))
