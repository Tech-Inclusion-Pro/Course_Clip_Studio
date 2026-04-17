import { Trash2 } from 'lucide-react'
import type { Condition, ConditionOperator } from '@/types/trigger-model'

const OPERATOR_OPTIONS: { value: ConditionOperator; label: string }[] = [
  { value: 'eq', label: 'equals' },
  { value: 'neq', label: 'not equals' },
  { value: 'gt', label: 'greater than' },
  { value: 'gte', label: 'greater or equal' },
  { value: 'lt', label: 'less than' },
  { value: 'lte', label: 'less or equal' },
  { value: 'contains', label: 'contains' },
  { value: 'not_contains', label: 'does not contain' },
  { value: 'starts_with', label: 'starts with' },
  { value: 'ends_with', label: 'ends with' },
  { value: 'is_empty', label: 'is empty' },
  { value: 'is_not_empty', label: 'is not empty' }
]

interface ConditionRowProps {
  condition: Condition
  onChange: (condition: Condition) => void
  onRemove: () => void
}

export function ConditionRow({ condition, onChange, onRemove }: ConditionRowProps): JSX.Element {
  const needsValue = !['is_empty', 'is_not_empty'].includes(condition.operator)

  return (
    <div className="flex items-start gap-1.5 p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)]">
      <div className="flex-1 space-y-1.5">
        <input
          type="text"
          value={condition.sourceId}
          onChange={(e) => onChange({ ...condition, sourceId: e.target.value })}
          placeholder="Variable ID"
          aria-label="Variable ID"
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
        <select
          value={condition.operator}
          onChange={(e) => onChange({ ...condition, operator: e.target.value as ConditionOperator })}
          aria-label="Comparison operator"
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        >
          {OPERATOR_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {needsValue && (
          <input
            type="text"
            value={String(condition.value)}
            onChange={(e) => {
              const v = e.target.value
              if (v === 'true') onChange({ ...condition, value: true })
              else if (v === 'false') onChange({ ...condition, value: false })
              else if (!isNaN(Number(v)) && v !== '') onChange({ ...condition, value: Number(v) })
              else onChange({ ...condition, value: v })
            }}
            placeholder="Value"
            aria-label="Comparison value"
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        )}
      </div>
      <button
        onClick={onRemove}
        className="p-1 mt-1 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
        aria-label="Remove condition"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}
