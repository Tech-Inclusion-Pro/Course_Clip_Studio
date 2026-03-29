import { create } from 'zustand'

interface EditorState {
  selectedBlockId: string | null
  activeLessonId: string | null
  setSelectedBlock: (id: string | null) => void
  setActiveLesson: (id: string | null) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedBlockId: null,
  activeLessonId: null,
  setSelectedBlock: (id) => set({ selectedBlockId: id }),
  setActiveLesson: (id) => set({ activeLessonId: id })
}))
