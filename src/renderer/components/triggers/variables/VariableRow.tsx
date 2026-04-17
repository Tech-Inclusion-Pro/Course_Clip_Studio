import { useState } from 'react'
import { Edit3, Trash2, Check, X } from 'lucide-react'
import type { Variable, VariableType } from '@/types/trigger-model'

interface VariableRowProps {
  variable: Variable
  onUpdate: (partial: Partial<Variable>) => void
  onDelete: () => void
}

export function VariableRow({ variable, onUpdate, onDelete }: VariableRowProps): JSX.Element {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(variable.name)
  const [type, setType] = useState<VariableType>(variable.type)
  const [defaultValue, setDefaultValue] = useState(String(variable.defaultValue))
  const [description, setDescription] = useState(variable.description)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleSave() {
    let parsedDefault: boolean | number | string = defaultValue
    if (type === 'boolean') parsedDefault = defaultValue === 'true'
    else if (type === 'number') parsedDefault = Number(defaultValue) || 0

    onUpdate({ name, type, defaultValue: parsedDefault, description })
    setEditing(false)
  }

  function handleCancel() {
    setName(variable.name)
    setType(variable.type)
    setDefaultValue(String(variable.defaultValue))
    setDescription(variable.description)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="p-3 rounded-lg border border-[var(--brand-indigo)] bg-[var(--bg-muted)] space-y-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Variable name"
          aria-label="Variable name"
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
        <div className="flex gap-2">
          <select
            value={type}
            onChange={(e) => setType(e.target.value as VariableType)}
            aria-label="Variable type"
            className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="boolean">Boolean</option>
            <option value="number">Number</option>
            <option value="text">Text</option>
          </select>
          <input
            type="text"
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            placeholder="Default"
            aria-label="Default value"
            className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          aria-label="Variable description"
          rows={2}
          className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
        />
        <div className="flex gap-1.5">
          <button
            onClick={handleSave}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-[var(--brand-indigo)] text-white hover:opacity-90 cursor-pointer min-tap-target"
          >
            <Check size={12} /> Save
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
          >
            <X size={12} /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="group flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)] font-mono truncate">
            {variable.name}
          </p>
          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-secondary)]">
            {variable.type}
          </span>
          <span className="shrink-0 text-[10px] text-[var(--text-tertiary)]">
            = {String(variable.defaultValue)}
          </span>
        </div>
        {variable.description && (
          <p className="text-[10px] text-[var(--text-tertiary)] truncate mt-0.5">{variable.description}</p>
        )}
      </div>

      <div className="hidden group-hover:flex items-center gap-0.5">
        <button
          onClick={() => setEditing(true)}
          className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
          aria-label="Edit variable"
        >
          <Edit3 size={12} />
        </button>
        {confirmDelete ? (
          <button
            onClick={onDelete}
            className="px-2 py-0.5 text-[10px] rounded bg-[var(--color-danger-600)] text-white cursor-pointer min-tap-target"
          >
            Confirm
          </button>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
            aria-label="Delete variable"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
