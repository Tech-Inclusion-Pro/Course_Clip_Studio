import type { Action } from '@/types/trigger-model'

interface Props {
  action: Action
  onChange: (action: Action) => void
}

export function ActionParamsEditor({ action, onChange }: Props): JSX.Element | null {
  function update(params: typeof action.params) {
    onChange({ ...action, params })
  }

  switch (action.type) {
    case 'navigate':
      return (
        <input
          type="text"
          value={action.params.lessonId ?? ''}
          onChange={(e) => update({ ...action.params, lessonId: e.target.value })}
          placeholder="Lesson ID"
          aria-label="Target lesson ID"
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      )

    case 'set_variable':
      return (
        <div className="space-y-1.5">
          <input
            type="text"
            value={action.params.variableId ?? ''}
            onChange={(e) => update({ ...action.params, variableId: e.target.value })}
            placeholder="Variable ID"
            aria-label="Variable ID"
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
          <input
            type="text"
            value={String(action.params.value ?? '')}
            onChange={(e) => {
              const v = e.target.value
              // Auto-detect type
              if (v === 'true') update({ ...action.params, value: true })
              else if (v === 'false') update({ ...action.params, value: false })
              else if (!isNaN(Number(v)) && v !== '') update({ ...action.params, value: Number(v) })
              else update({ ...action.params, value: v })
            }}
            placeholder="Value (true/false, number, or text)"
            aria-label="Variable value"
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
      )

    case 'adjust_variable':
      return (
        <div className="space-y-1.5">
          <input
            type="text"
            value={action.params.variableId ?? ''}
            onChange={(e) => update({ ...action.params, variableId: e.target.value })}
            placeholder="Variable ID"
            aria-label="Variable ID"
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
          <select
            value={action.params.operation ?? 'increment'}
            onChange={(e) => update({ ...action.params, operation: e.target.value as 'increment' | 'decrement' | 'append' })}
            aria-label="Adjustment operation"
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="increment">Increment</option>
            <option value="decrement">Decrement</option>
            <option value="append">Append text</option>
          </select>
          <input
            type="text"
            value={String(action.params.amount ?? '')}
            onChange={(e) => {
              const v = e.target.value
              if (!isNaN(Number(v)) && v !== '') update({ ...action.params, amount: Number(v) })
              else update({ ...action.params, amount: v })
            }}
            placeholder="Amount"
            aria-label="Adjustment amount"
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
      )

    case 'show_block':
    case 'hide_block':
      return (
        <input
          type="text"
          value={action.params.blockId ?? ''}
          onChange={(e) => update({ ...action.params, blockId: e.target.value })}
          placeholder="Block ID"
          aria-label="Target block ID"
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      )

    case 'announce':
      return (
        <div className="space-y-1.5">
          <input
            type="text"
            value={action.params.message ?? ''}
            onChange={(e) => update({ ...action.params, message: e.target.value })}
            placeholder="Message to announce"
            aria-label="Announcement message"
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
          <select
            value={action.params.politeness ?? 'polite'}
            onChange={(e) => update({ ...action.params, politeness: e.target.value as 'polite' | 'assertive' })}
            aria-label="Announcement politeness level"
            className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="polite">Polite</option>
            <option value="assertive">Assertive</option>
          </select>
        </div>
      )

    default:
      return null
  }
}
