import { create } from 'zustand'

export type CanvasMode = 'block' | 'slide'
export type PreviewDevice = 'desktop' | 'tablet' | 'mobile'

interface EditorState {
  // Navigation
  activeModuleId: string | null
  activeLessonId: string | null

  // Selection
  selectedBlockId: string | null
  selectedBlockIds: string[]

  // Canvas
  canvasMode: CanvasMode
  showGrid: boolean
  showSmartGuides: boolean
  slideAspectRatio: '16:9' | '4:3'

  // Preview
  splitPreviewOpen: boolean
  previewDevice: PreviewDevice
  scrollSyncEnabled: boolean

  // Panels
  leftPanelOpen: boolean
  rightPanelOpen: boolean
  aiPanelOpen: boolean
  themeEditorOpen: boolean
  auditPanelOpen: boolean
  certificateDesignerOpen: boolean
  versionHistoryOpen: boolean
  notesPanelOpen: boolean
  branchingGraphOpen: boolean
  questionBankOpen: boolean
  mediaLibraryOpen: boolean
  analyticsOpen: boolean
  triggersPanelOpen: boolean

  // Trigger modals
  variablesModalOpen: boolean
  triggerEditorOpen: boolean
  editingTriggerId: string | null

  // Dirty state
  isDirty: boolean

  // Clipboard
  clipboardBlockIds: string[]
  clipboardOperation: 'copy' | 'cut' | null

  // ─── Actions ───

  // Navigation
  setActiveModule: (id: string | null) => void
  setActiveLesson: (id: string | null) => void

  // Selection
  setSelectedBlock: (id: string | null) => void
  toggleBlockSelection: (id: string) => void
  selectBlocks: (ids: string[]) => void
  clearSelection: () => void

  // Canvas
  setCanvasMode: (mode: CanvasMode) => void
  toggleGrid: () => void
  toggleSmartGuides: () => void
  setSlideAspectRatio: (ratio: '16:9' | '4:3') => void

  // Preview
  toggleSplitPreview: () => void
  setPreviewDevice: (device: PreviewDevice) => void
  toggleScrollSync: () => void

  // Panels
  toggleLeftPanel: () => void
  toggleRightPanel: () => void
  toggleAIPanel: () => void
  toggleThemeEditor: () => void
  toggleAuditPanel: () => void
  toggleCertificateDesigner: () => void
  toggleVersionHistory: () => void
  toggleNotesPanel: () => void
  toggleBranchingGraph: () => void
  toggleQuestionBank: () => void
  toggleMediaLibrary: () => void
  toggleAnalytics: () => void
  toggleTriggersPanel: () => void

  // Trigger modals
  openVariablesModal: () => void
  closeVariablesModal: () => void
  openTriggerEditor: (id: string | null) => void
  closeTriggerEditor: () => void

  // Dirty
  markDirty: () => void
  markClean: () => void

  // Clipboard
  copyBlocks: (blockIds: string[]) => void
  cutBlocks: (blockIds: string[]) => void
  clearClipboard: () => void

  // Reset
  resetEditor: () => void
}

const initialState = {
  activeModuleId: null as string | null,
  activeLessonId: null as string | null,
  selectedBlockId: null as string | null,
  selectedBlockIds: [] as string[],
  canvasMode: 'block' as CanvasMode,
  showGrid: false,
  showSmartGuides: true,
  slideAspectRatio: '16:9' as '16:9' | '4:3',
  splitPreviewOpen: false,
  previewDevice: 'desktop' as PreviewDevice,
  scrollSyncEnabled: true,
  leftPanelOpen: true,
  rightPanelOpen: true,
  aiPanelOpen: false,
  themeEditorOpen: false,
  auditPanelOpen: false,
  certificateDesignerOpen: false,
  versionHistoryOpen: false,
  notesPanelOpen: false,
  branchingGraphOpen: false,
  questionBankOpen: false,
  mediaLibraryOpen: false,
  analyticsOpen: false,
  triggersPanelOpen: false,
  variablesModalOpen: false,
  triggerEditorOpen: false,
  editingTriggerId: null as string | null,
  isDirty: false,
  clipboardBlockIds: [] as string[],
  clipboardOperation: null as 'copy' | 'cut' | null
}

export const useEditorStore = create<EditorState>((set) => ({
  ...initialState,

  // Navigation
  setActiveModule: (id) => set({ activeModuleId: id }),
  setActiveLesson: (id) => set({ activeLessonId: id, selectedBlockId: null, selectedBlockIds: [] }),

  // Selection
  setSelectedBlock: (id) =>
    set({ selectedBlockId: id, selectedBlockIds: id ? [id] : [] }),

  toggleBlockSelection: (id) =>
    set((state) => {
      const ids = state.selectedBlockIds.includes(id)
        ? state.selectedBlockIds.filter((bid) => bid !== id)
        : [...state.selectedBlockIds, id]
      return {
        selectedBlockIds: ids,
        selectedBlockId: ids.length === 1 ? ids[0] : ids.length === 0 ? null : state.selectedBlockId
      }
    }),

  selectBlocks: (ids) =>
    set({
      selectedBlockIds: ids,
      selectedBlockId: ids.length === 1 ? ids[0] : ids.length > 0 ? ids[0] : null
    }),

  clearSelection: () =>
    set({ selectedBlockId: null, selectedBlockIds: [] }),

  // Canvas
  setCanvasMode: (mode) => set({ canvasMode: mode }),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),
  toggleSmartGuides: () => set((s) => ({ showSmartGuides: !s.showSmartGuides })),
  setSlideAspectRatio: (ratio) => set({ slideAspectRatio: ratio }),

  // Preview
  toggleSplitPreview: () => set((s) => ({ splitPreviewOpen: !s.splitPreviewOpen })),
  setPreviewDevice: (device) => set({ previewDevice: device }),
  toggleScrollSync: () => set((s) => ({ scrollSyncEnabled: !s.scrollSyncEnabled })),

  // Panels
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  toggleAIPanel: () => set((s) => ({ aiPanelOpen: !s.aiPanelOpen })),
  toggleThemeEditor: () => set((s) => ({ themeEditorOpen: !s.themeEditorOpen })),
  toggleAuditPanel: () => set((s) => ({ auditPanelOpen: !s.auditPanelOpen })),
  toggleCertificateDesigner: () => set((s) => ({ certificateDesignerOpen: !s.certificateDesignerOpen })),
  toggleVersionHistory: () => set((s) => ({ versionHistoryOpen: !s.versionHistoryOpen })),
  toggleNotesPanel: () => set((s) => ({ notesPanelOpen: !s.notesPanelOpen })),
  toggleBranchingGraph: () => set((s) => ({ branchingGraphOpen: !s.branchingGraphOpen })),
  toggleQuestionBank: () => set((s) => ({ questionBankOpen: !s.questionBankOpen })),
  toggleMediaLibrary: () => set((s) => ({ mediaLibraryOpen: !s.mediaLibraryOpen })),
  toggleAnalytics: () => set((s) => ({ analyticsOpen: !s.analyticsOpen })),
  toggleTriggersPanel: () => set((s) => ({ triggersPanelOpen: !s.triggersPanelOpen })),

  // Trigger modals
  openVariablesModal: () => set({ variablesModalOpen: true }),
  closeVariablesModal: () => set({ variablesModalOpen: false }),
  openTriggerEditor: (id) => set({ triggerEditorOpen: true, editingTriggerId: id }),
  closeTriggerEditor: () => set({ triggerEditorOpen: false, editingTriggerId: null }),

  // Dirty
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),

  // Clipboard
  copyBlocks: (blockIds) => set({ clipboardBlockIds: blockIds, clipboardOperation: 'copy' }),
  cutBlocks: (blockIds) => set({ clipboardBlockIds: blockIds, clipboardOperation: 'cut' }),
  clearClipboard: () => set({ clipboardBlockIds: [], clipboardOperation: null }),

  // Reset
  resetEditor: () => set(initialState)
}))
