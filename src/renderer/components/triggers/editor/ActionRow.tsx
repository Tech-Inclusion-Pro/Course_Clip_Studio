import { Trash2 } from 'lucide-react'
import type { Action, ActionType } from '@/types/trigger-model'
import { ActionParamsEditor } from './ActionParamsEditor'

const ACTION_TYPE_OPTIONS: { value: ActionType; label: string }[] = [
  { value: 'navigate', label: 'Navigate to lesson' },
  { value: 'set_variable', label: 'Set variable' },
  { value: 'adjust_variable', label: 'Adjust variable' },
  { value: 'show_block', label: 'Show block' },
  { value: 'hide_block', label: 'Hide block' },
  { value: 'announce', label: 'Announce (screen reader)' }
]

interface ActionRowProps {
  action: Action
  onChange: (action: Action) => void
  onRemove: () => void
}

export function ActionRow({ action, onChange, onRemove }: ActionRowProps): JSX.Element {
  return (
    <div className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-2">
      <div className="flex items-center gap-2">
        <select
          value={action.type}
          onChange={(e) => onChange({ ...action, type: e.target.value as ActionType, params: {} })}
          className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        >
          {ACTION_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <button
          onClick={onRemove}
          className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
          aria-label="Remove action"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <ActionParamsEditor action={action} onChange={onChange} />
    </div>
  )
}
