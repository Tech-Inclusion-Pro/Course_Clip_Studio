import { useState } from 'react'
import { Zap, ChevronDown, ChevronRight, Copy, Trash2, Edit3, Power } from 'lucide-react'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useTriggersStore } from '@/stores/triggers-store'
import type { Trigger } from '@/types/trigger-model'

function generateLabel(trigger: Trigger): string {
  const event = trigger.event.replace('on_', '').replace(/_/g, ' ')
  const firstAction = trigger.actions[0]
  if (!firstAction) return `On ${event}`
  const action = firstAction.type.replace(/_/g, ' ')
  return `On ${event}: ${action}`
}

export function TriggerRow({ trigger }: { trigger: Trigger }): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const openTriggerEditor = useEditorStore((s) => s.openTriggerEditor)
  const activeCourseId = useCourseStore((s) => s.activeCourseId)

  const conditionCount = trigger.conditions?.conditions.length ?? 0
  const label = trigger.name || generateLabel(trigger)

  function handleDuplicate() {
    if (!activeCourseId) return
    useTriggersStore.getState().duplicateTrigger(activeCourseId, trigger.id)
  }

  function handleDelete() {
    if (!activeCourseId) return
    useTriggersStore.getState().removeTrigger(activeCourseId, trigger.id)
  }

  function handleToggle() {
    if (!activeCourseId) return
    useTriggersStore.getState().toggleTrigger(activeCourseId, trigger.id)
  }

  return (
    <div
      role="listitem"
      className="group rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] mb-1.5"
    >
      {/* Main row */}
      <div className="flex items-center gap-2 px-2.5 py-2">
        <button
          onClick={() => setExpanded(!expanded)}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse trigger details' : 'Expand trigger details'}
          className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <Zap
          size={14}
          className={trigger.enabled ? 'text-[var(--brand-magenta)]' : 'text-[var(--text-tertiary)]'}
        />

        <div className="flex-1 min-w-0">
          <p className={`text-xs font-[var(--font-weight-medium)] truncate ${
            trigger.enabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)]'
          }`}>
            {label}
          </p>
        </div>

        {conditionCount > 0 && (
          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-muted)] text-[var(--text-secondary)]">
            if {conditionCount}
          </span>
        )}

        {/* Hover actions */}
        <div className="hidden group-hover:flex items-center gap-0.5">
          <button
            onClick={() => openTriggerEditor(trigger.id)}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
            aria-label="Edit trigger"
            title="Edit"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={handleDuplicate}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
            aria-label="Duplicate trigger"
            title="Duplicate"
          >
            <Copy size={12} />
          </button>
          <button
            onClick={handleToggle}
            className={`p-1 rounded hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target ${
              trigger.enabled ? 'text-[var(--brand-magenta)]' : 'text-[var(--text-tertiary)]'
            }`}
            aria-label={trigger.enabled ? 'Disable trigger' : 'Enable trigger'}
            title={trigger.enabled ? 'Disable' : 'Enable'}
          >
            <Power size={12} />
          </button>
          <button
            onClick={handleDelete}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
            aria-label="Delete trigger"
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-3 pb-2.5 border-t border-[var(--border-default)] pt-2 space-y-1.5">
          <p className="text-[10px] text-[var(--text-secondary)]">
            <span className="font-[var(--font-weight-medium)]">Event:</span> {trigger.event}
          </p>
          {trigger.actions.map((action) => (
            <p key={action.id} className="text-[10px] text-[var(--text-secondary)]">
              <span className="font-[var(--font-weight-medium)]">Action:</span> {action.type.replace(/_/g, ' ')}
              {action.params.message && ` — "${action.params.message}"`}
              {action.params.variableId && ` — var: ${action.params.variableId}`}
              {action.params.lessonId && ` — lesson: ${action.params.lessonId}`}
            </p>
          ))}
          {conditionCount > 0 && (
            <p className="text-[10px] text-[var(--text-secondary)]">
              <span className="font-[var(--font-weight-medium)]">Conditions:</span> {conditionCount} condition{conditionCount !== 1 ? 's' : ''} ({trigger.conditions!.logic.toUpperCase()})
            </p>
          )}
          {trigger.description && (
            <p className="text-[10px] text-[var(--text-tertiary)] italic">{trigger.description}</p>
          )}
        </div>
      )}
    </div>
  )
}
