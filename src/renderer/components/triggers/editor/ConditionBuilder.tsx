import { Plus } from 'lucide-react'
import { uid } from '@/lib/uid'
import { ConditionRow } from './ConditionRow'
import type { ConditionGroup, Condition } from '@/types/trigger-model'

interface ConditionBuilderProps {
  conditions: ConditionGroup | undefined
  onChange: (conditions: ConditionGroup | undefined) => void
}

export function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps): JSX.Element {
  const condList = conditions?.conditions ?? []

  function addCondition() {
    const newCond: Condition = {
      id: uid('cond'),
      sourceType: 'variable',
      sourceId: '',
      operator: 'eq',
      value: ''
    }
    onChange({
      logic: conditions?.logic ?? 'and',
      conditions: [...condList, newCond]
    })
  }

  function updateCondition(index: number, cond: Condition) {
    const updated = [...condList]
    updated[index] = cond
    onChange({ logic: conditions?.logic ?? 'and', conditions: updated })
  }

  function removeCondition(index: number) {
    const updated = condList.filter((_, i) => i !== index)
    if (updated.length === 0) {
      onChange(undefined)
    } else {
      onChange({ logic: conditions?.logic ?? 'and', conditions: updated })
    }
  }

  return (
    <div className="space-y-2">
      {condList.length === 0 && (
        <p className="text-xs text-[var(--text-tertiary)]">
          No conditions — trigger will always fire when the event occurs.
        </p>
      )}

      {condList.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)]">Match</span>
          <select
            value={conditions?.logic ?? 'and'}
            onChange={(e) => onChange({ logic: e.target.value as 'and' | 'or', conditions: condList })}
            className="px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="and">ALL conditions (AND)</option>
            <option value="or">ANY condition (OR)</option>
          </select>
        </div>
      )}

      {condList.map((cond, i) => (
        <ConditionRow
          key={cond.id}
          condition={cond}
          onChange={(c) => updateCondition(i, c)}
          onRemove={() => removeCondition(i)}
        />
      ))}

      <button
        onClick={addCondition}
        className="flex items-center gap-1 text-xs text-[var(--brand-indigo)] hover:underline cursor-pointer"
      >
        <Plus size={12} />
        Add Condition
      </button>
    </div>
  )
}
