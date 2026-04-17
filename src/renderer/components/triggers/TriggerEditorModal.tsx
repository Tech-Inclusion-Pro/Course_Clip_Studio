import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useTriggersStore } from '@/stores/triggers-store'
import { uid } from '@/lib/uid'
import { EventPicker } from './editor/EventPicker'
import { ActionList } from './editor/ActionList'
import { ConditionBuilder } from './editor/ConditionBuilder'
import type { TriggerEvent, EventParams, Action, ConditionGroup } from '@/types/trigger-model'

export function TriggerEditorModal(): JSX.Element {
  const closeTriggerEditor = useEditorStore((s) => s.closeTriggerEditor)
  const editingTriggerId = useEditorStore((s) => s.editingTriggerId)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const activeCourseId = useCourseStore((s) => s.activeCourseId)

  const panelRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<Element | null>(null)

  // Load existing trigger or start fresh
  const existingTrigger = editingTriggerId && activeCourseId
    ? useTriggersStore.getState().getInteractivity(activeCourseId).triggers.find((t) => t.id === editingTriggerId)
    : null

  const [name, setName] = useState(existingTrigger?.name ?? '')
  const [description, setDescription] = useState(existingTrigger?.description ?? '')
  const [event, setEvent] = useState<TriggerEvent>(existingTrigger?.event ?? 'on_click')
  const [eventParams, setEventParams] = useState<EventParams>(existingTrigger?.eventParams ?? {})
  const [actions, setActions] = useState<Action[]>(
    existingTrigger?.actions ?? [{ id: uid('action'), type: 'announce', params: { message: '' } }]
  )
  const [conditions, setConditions] = useState<ConditionGroup | undefined>(existingTrigger?.conditions)
  const [enabled, setEnabled] = useState(existingTrigger?.enabled ?? true)
  const [executionOrder, setExecutionOrder] = useState(existingTrigger?.executionOrder ?? 0)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Focus trap
  useEffect(() => {
    returnFocusRef.current = document.activeElement
    panelRef.current?.focus()
    return () => {
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus()
      }
    }
  }, [])

  // Escape key
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeTriggerEditor()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeTriggerEditor])

  const handleSave = useCallback(() => {
    if (!activeCourseId || !selectedBlockId) return
    if (actions.length === 0) return

    const triggerData = {
      name,
      description,
      event,
      eventParams,
      actions,
      conditions,
      scope: 'block' as const,
      scopeId: selectedBlockId,
      enabled,
      executionOrder
    }

    if (editingTriggerId) {
      useTriggersStore.getState().updateTrigger(activeCourseId, editingTriggerId, triggerData)
    } else {
      useTriggersStore.getState().addTrigger(activeCourseId, triggerData)
    }

    closeTriggerEditor()
  }, [activeCourseId, selectedBlockId, editingTriggerId, name, description, event, eventParams, actions, conditions, enabled, executionOrder, closeTriggerEditor])

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) closeTriggerEditor() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trigger-editor-title"
        tabIndex={-1}
        className="w-full max-w-[720px] max-h-[90vh] mx-4 rounded-xl shadow-xl bg-[var(--bg-surface)] flex flex-col focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <h2 id="trigger-editor-title" className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {editingTriggerId ? 'Edit Trigger' : 'New Trigger'}
          </h2>
          <button
            onClick={closeTriggerEditor}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Section 1: Trigger Name */}
          <section>
            <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
              Trigger Name
            </h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 80))}
              placeholder="Auto-generated..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </section>

          {/* Section 2: Event (When) */}
          <section>
            <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
              Event (When)
            </h3>
            <EventPicker
              event={event}
              eventParams={eventParams}
              onChange={(e, p) => { setEvent(e); setEventParams(p) }}
            />
          </section>

          {/* Section 3: Actions (Do) */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                Actions (Do)
              </h3>
              <button
                onClick={() => setActions([...actions, { id: uid('action'), type: 'announce', params: { message: '' } }])}
                className="flex items-center gap-1 text-xs text-[var(--brand-indigo)] hover:underline cursor-pointer"
              >
                <Plus size={12} />
                Add Action
              </button>
            </div>
            <ActionList
              actions={actions}
              onChange={setActions}
            />
            {actions.length === 0 && (
              <p className="text-xs text-[var(--color-danger-600)]">At least one action is required.</p>
            )}
          </section>

          {/* Section 4: Conditions (If) */}
          <section>
            <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
              Conditions (If)
            </h3>
            <ConditionBuilder
              conditions={conditions}
              onChange={setConditions}
            />
          </section>

          {/* Section 5: Advanced */}
          <section>
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
            >
              {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
            </button>
            {showAdvanced && (
              <div className="mt-3 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                    className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
                  />
                  <span className="text-xs text-[var(--text-secondary)]">Enabled</span>
                </label>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                    placeholder="Describe what this trigger does..."
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--text-secondary)] mb-1 block">Execution Order</label>
                  <input
                    type="number"
                    value={executionOrder}
                    onChange={(e) => setExecutionOrder(parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-20 px-3 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-default)]">
          <button
            onClick={closeTriggerEditor}
            className="px-4 py-2 text-sm font-[var(--font-weight-medium)] rounded-lg bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={actions.length === 0}
            className="px-4 py-2 text-sm font-[var(--font-weight-medium)] rounded-lg bg-[var(--brand-indigo)] text-white hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-tap-target"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
