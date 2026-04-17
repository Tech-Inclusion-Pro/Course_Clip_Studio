import type { Action } from '@/types/trigger-model'
import { ActionRow } from './ActionRow'

interface ActionListProps {
  actions: Action[]
  onChange: (actions: Action[]) => void
}

export function ActionList({ actions, onChange }: ActionListProps): JSX.Element {
  function handleUpdate(index: number, action: Action) {
    const updated = [...actions]
    updated[index] = action
    onChange(updated)
  }

  function handleRemove(index: number) {
    onChange(actions.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2">
      {actions.map((action, i) => (
        <ActionRow
          key={action.id}
          action={action}
          onChange={(a) => handleUpdate(i, a)}
          onRemove={() => handleRemove(i)}
        />
      ))}
    </div>
  )
}
