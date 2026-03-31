import { describe, it, expect, beforeEach } from 'vitest'
import { useEditorStore } from '@/stores/useEditorStore'

describe('useEditorStore', () => {
  beforeEach(() => {
    useEditorStore.getState().resetEditor()
  })

  // ─── Navigation ───

  describe('navigation', () => {
    it('setActiveModule sets the active module id', () => {
      useEditorStore.getState().setActiveModule('mod-1')
      expect(useEditorStore.getState().activeModuleId).toBe('mod-1')
    })

    it('setActiveModule accepts null', () => {
      useEditorStore.getState().setActiveModule('mod-1')
      useEditorStore.getState().setActiveModule(null)
      expect(useEditorStore.getState().activeModuleId).toBeNull()
    })

    it('setActiveLesson sets active lesson and clears block selection', () => {
      useEditorStore.getState().setSelectedBlock('block-1')
      useEditorStore.getState().setActiveLesson('les-1')

      const state = useEditorStore.getState()
      expect(state.activeLessonId).toBe('les-1')
      expect(state.selectedBlockId).toBeNull()
      expect(state.selectedBlockIds).toEqual([])
    })
  })

  // ─── Block Selection ───

  describe('block selection', () => {
    it('setSelectedBlock sets a single block', () => {
      useEditorStore.getState().setSelectedBlock('b1')

      const state = useEditorStore.getState()
      expect(state.selectedBlockId).toBe('b1')
      expect(state.selectedBlockIds).toEqual(['b1'])
    })

    it('setSelectedBlock(null) clears selection', () => {
      useEditorStore.getState().setSelectedBlock('b1')
      useEditorStore.getState().setSelectedBlock(null)

      const state = useEditorStore.getState()
      expect(state.selectedBlockId).toBeNull()
      expect(state.selectedBlockIds).toEqual([])
    })

    it('toggleBlockSelection adds a block to multi-selection', () => {
      useEditorStore.getState().toggleBlockSelection('b1')
      useEditorStore.getState().toggleBlockSelection('b2')

      const state = useEditorStore.getState()
      expect(state.selectedBlockIds).toEqual(['b1', 'b2'])
    })

    it('toggleBlockSelection removes a block if already selected', () => {
      useEditorStore.getState().toggleBlockSelection('b1')
      useEditorStore.getState().toggleBlockSelection('b2')
      useEditorStore.getState().toggleBlockSelection('b1')

      const state = useEditorStore.getState()
      expect(state.selectedBlockIds).toEqual(['b2'])
      expect(state.selectedBlockId).toBe('b2') // single remaining becomes selectedBlockId
    })

    it('selectBlocks sets multiple blocks at once', () => {
      useEditorStore.getState().selectBlocks(['b1', 'b2', 'b3'])

      const state = useEditorStore.getState()
      expect(state.selectedBlockIds).toEqual(['b1', 'b2', 'b3'])
      expect(state.selectedBlockId).toBe('b1')
    })

    it('clearSelection resets all selection state', () => {
      useEditorStore.getState().selectBlocks(['b1', 'b2'])
      useEditorStore.getState().clearSelection()

      const state = useEditorStore.getState()
      expect(state.selectedBlockId).toBeNull()
      expect(state.selectedBlockIds).toEqual([])
    })
  })

  // ─── Canvas Mode ───

  describe('canvas mode', () => {
    it('defaults to block mode', () => {
      expect(useEditorStore.getState().canvasMode).toBe('block')
    })

    it('setCanvasMode changes the canvas mode', () => {
      useEditorStore.getState().setCanvasMode('slide')
      expect(useEditorStore.getState().canvasMode).toBe('slide')
    })

    it('toggleGrid toggles grid visibility', () => {
      expect(useEditorStore.getState().showGrid).toBe(false)
      useEditorStore.getState().toggleGrid()
      expect(useEditorStore.getState().showGrid).toBe(true)
      useEditorStore.getState().toggleGrid()
      expect(useEditorStore.getState().showGrid).toBe(false)
    })

    it('toggleSmartGuides toggles smart guides', () => {
      expect(useEditorStore.getState().showSmartGuides).toBe(true)
      useEditorStore.getState().toggleSmartGuides()
      expect(useEditorStore.getState().showSmartGuides).toBe(false)
    })
  })

  // ─── Panel Toggles ───

  describe('panel toggles', () => {
    it('toggleLeftPanel toggles left panel state', () => {
      expect(useEditorStore.getState().leftPanelOpen).toBe(true)
      useEditorStore.getState().toggleLeftPanel()
      expect(useEditorStore.getState().leftPanelOpen).toBe(false)
      useEditorStore.getState().toggleLeftPanel()
      expect(useEditorStore.getState().leftPanelOpen).toBe(true)
    })

    it('toggleRightPanel toggles right panel state', () => {
      expect(useEditorStore.getState().rightPanelOpen).toBe(true)
      useEditorStore.getState().toggleRightPanel()
      expect(useEditorStore.getState().rightPanelOpen).toBe(false)
    })

    it('toggleAIPanel toggles AI panel state', () => {
      expect(useEditorStore.getState().aiPanelOpen).toBe(false)
      useEditorStore.getState().toggleAIPanel()
      expect(useEditorStore.getState().aiPanelOpen).toBe(true)
    })

    it('toggleThemeEditor toggles theme editor', () => {
      expect(useEditorStore.getState().themeEditorOpen).toBe(false)
      useEditorStore.getState().toggleThemeEditor()
      expect(useEditorStore.getState().themeEditorOpen).toBe(true)
    })

    it('toggleAuditPanel toggles audit panel', () => {
      expect(useEditorStore.getState().auditPanelOpen).toBe(false)
      useEditorStore.getState().toggleAuditPanel()
      expect(useEditorStore.getState().auditPanelOpen).toBe(true)
    })

    it('toggleSplitPreview toggles preview', () => {
      expect(useEditorStore.getState().splitPreviewOpen).toBe(false)
      useEditorStore.getState().toggleSplitPreview()
      expect(useEditorStore.getState().splitPreviewOpen).toBe(true)
    })

    it('setPreviewDevice changes preview device', () => {
      useEditorStore.getState().setPreviewDevice('tablet')
      expect(useEditorStore.getState().previewDevice).toBe('tablet')
    })
  })

  // ─── Clipboard Operations ───

  describe('clipboard operations', () => {
    it('copyBlocks sets clipboard with copy operation', () => {
      useEditorStore.getState().copyBlocks(['b1', 'b2'])

      const state = useEditorStore.getState()
      expect(state.clipboardBlockIds).toEqual(['b1', 'b2'])
      expect(state.clipboardOperation).toBe('copy')
    })

    it('cutBlocks sets clipboard with cut operation', () => {
      useEditorStore.getState().cutBlocks(['b1'])

      const state = useEditorStore.getState()
      expect(state.clipboardBlockIds).toEqual(['b1'])
      expect(state.clipboardOperation).toBe('cut')
    })

    it('clearClipboard resets clipboard state', () => {
      useEditorStore.getState().copyBlocks(['b1'])
      useEditorStore.getState().clearClipboard()

      const state = useEditorStore.getState()
      expect(state.clipboardBlockIds).toEqual([])
      expect(state.clipboardOperation).toBeNull()
    })
  })

  // ─── Dirty State ───

  describe('dirty state', () => {
    it('markDirty sets isDirty to true', () => {
      useEditorStore.getState().markDirty()
      expect(useEditorStore.getState().isDirty).toBe(true)
    })

    it('markClean sets isDirty to false', () => {
      useEditorStore.getState().markDirty()
      useEditorStore.getState().markClean()
      expect(useEditorStore.getState().isDirty).toBe(false)
    })
  })

  // ─── Reset ───

  describe('resetEditor', () => {
    it('restores all state to initial values', () => {
      // Mutate several fields
      useEditorStore.getState().setActiveModule('mod-1')
      useEditorStore.getState().setActiveLesson('les-1')
      useEditorStore.getState().setCanvasMode('slide')
      useEditorStore.getState().markDirty()
      useEditorStore.getState().copyBlocks(['b1'])
      useEditorStore.getState().toggleLeftPanel()

      // Reset
      useEditorStore.getState().resetEditor()

      const state = useEditorStore.getState()
      expect(state.activeModuleId).toBeNull()
      expect(state.activeLessonId).toBeNull()
      expect(state.canvasMode).toBe('block')
      expect(state.isDirty).toBe(false)
      expect(state.clipboardBlockIds).toEqual([])
      expect(state.clipboardOperation).toBeNull()
      expect(state.leftPanelOpen).toBe(true)
      expect(state.selectedBlockId).toBeNull()
      expect(state.selectedBlockIds).toEqual([])
    })
  })
})
