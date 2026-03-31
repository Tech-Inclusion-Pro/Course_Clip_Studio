import { describe, it, expect, beforeEach } from 'vitest'
import { useHistoryStore } from '@/stores/useHistoryStore'

describe('useHistoryStore', () => {
  beforeEach(() => {
    useHistoryStore.getState().clearHistory()
  })

  // ─── pushSnapshot ───

  describe('pushSnapshot', () => {
    it('adds a snapshot to the undo stack', () => {
      useHistoryStore.getState().pushSnapshot('{"id":"c1"}', 'Initial save')

      const { undoStack } = useHistoryStore.getState()
      expect(undoStack).toHaveLength(1)
      expect(undoStack[0].courseJson).toBe('{"id":"c1"}')
      expect(undoStack[0].label).toBe('Initial save')
    })

    it('uses "Auto-save" as default label', () => {
      useHistoryStore.getState().pushSnapshot('{}')

      const { undoStack } = useHistoryStore.getState()
      expect(undoStack[0].label).toBe('Auto-save')
    })

    it('clears the redo stack on new push', () => {
      // Push, undo, then push again
      useHistoryStore.getState().pushSnapshot('{"v":1}')
      useHistoryStore.getState().undo()
      expect(useHistoryStore.getState().redoStack).toHaveLength(1)

      useHistoryStore.getState().pushSnapshot('{"v":2}')
      expect(useHistoryStore.getState().redoStack).toHaveLength(0)
    })

    it('limits undo stack to 50 entries', () => {
      for (let i = 0; i < 55; i++) {
        useHistoryStore.getState().pushSnapshot(`{"v":${i}}`)
      }

      expect(useHistoryStore.getState().undoStack.length).toBeLessThanOrEqual(50)
    })

    it('assigns unique ids and timestamps to snapshots', () => {
      useHistoryStore.getState().pushSnapshot('{"a":1}')
      useHistoryStore.getState().pushSnapshot('{"a":2}')

      const { undoStack } = useHistoryStore.getState()
      expect(undoStack[0].id).not.toBe(undoStack[1].id)
      expect(undoStack[0].timestamp).toBeDefined()
      expect(undoStack[1].timestamp).toBeDefined()
    })
  })

  // ─── undo ───

  describe('undo', () => {
    it('returns undefined when undo stack is empty', () => {
      const result = useHistoryStore.getState().undo()
      expect(result).toBeUndefined()
    })

    it('removes the last snapshot from undo stack and adds to redo', () => {
      useHistoryStore.getState().pushSnapshot('{"v":1}')
      useHistoryStore.getState().pushSnapshot('{"v":2}')

      const snapshot = useHistoryStore.getState().undo()

      expect(snapshot?.courseJson).toBe('{"v":2}')
      expect(useHistoryStore.getState().undoStack).toHaveLength(1)
      expect(useHistoryStore.getState().redoStack).toHaveLength(1)
    })
  })

  // ─── redo ───

  describe('redo', () => {
    it('returns undefined when redo stack is empty', () => {
      const result = useHistoryStore.getState().redo()
      expect(result).toBeUndefined()
    })

    it('pops from redo stack and pushes to undo stack', () => {
      useHistoryStore.getState().pushSnapshot('{"v":1}')
      useHistoryStore.getState().pushSnapshot('{"v":2}')
      useHistoryStore.getState().undo()

      const snapshot = useHistoryStore.getState().redo()

      expect(snapshot?.courseJson).toBe('{"v":2}')
      expect(useHistoryStore.getState().undoStack).toHaveLength(2)
      expect(useHistoryStore.getState().redoStack).toHaveLength(0)
    })
  })

  // ─── canUndo / canRedo ───

  describe('canUndo and canRedo', () => {
    it('canUndo returns false with empty stack', () => {
      expect(useHistoryStore.getState().canUndo()).toBe(false)
    })

    it('canUndo returns true with snapshots in stack', () => {
      useHistoryStore.getState().pushSnapshot('{}')
      expect(useHistoryStore.getState().canUndo()).toBe(true)
    })

    it('canRedo returns false with empty stack', () => {
      expect(useHistoryStore.getState().canRedo()).toBe(false)
    })

    it('canRedo returns true after undo', () => {
      useHistoryStore.getState().pushSnapshot('{}')
      useHistoryStore.getState().undo()
      expect(useHistoryStore.getState().canRedo()).toBe(true)
    })
  })

  // ─── clearHistory ───

  describe('clearHistory', () => {
    it('clears both undo and redo stacks', () => {
      useHistoryStore.getState().pushSnapshot('{"v":1}')
      useHistoryStore.getState().pushSnapshot('{"v":2}')
      useHistoryStore.getState().undo()

      useHistoryStore.getState().clearHistory()

      expect(useHistoryStore.getState().undoStack).toHaveLength(0)
      expect(useHistoryStore.getState().redoStack).toHaveLength(0)
    })
  })

  // ─── Auto-snapshot timing ───

  describe('auto-snapshot timing', () => {
    it('shouldAutoSnapshot returns true when interval has elapsed', () => {
      // Set last auto snapshot to the past
      useHistoryStore.setState({ lastAutoSnapshotAt: Date.now() - 60000 })

      expect(useHistoryStore.getState().shouldAutoSnapshot(30000)).toBe(true)
    })

    it('shouldAutoSnapshot returns false when interval has not elapsed', () => {
      useHistoryStore.setState({ lastAutoSnapshotAt: Date.now() })

      expect(useHistoryStore.getState().shouldAutoSnapshot(30000)).toBe(false)
    })

    it('markAutoSnapshot updates lastAutoSnapshotAt', () => {
      const before = Date.now()
      useHistoryStore.getState().markAutoSnapshot()
      const after = Date.now()

      const { lastAutoSnapshotAt } = useHistoryStore.getState()
      expect(lastAutoSnapshotAt).toBeGreaterThanOrEqual(before)
      expect(lastAutoSnapshotAt).toBeLessThanOrEqual(after)
    })
  })
})
