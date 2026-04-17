import { useState } from 'react'
import type { Variable, VariableType } from '@/types/trigger-model'

interface VariableFormProps {
  onSave: (data: Omit<Variable, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  existingNames: string[]
}

export function VariableForm({ onSave, onCancel, existingNames }: VariableFormProps): JSX.Element {
  const [name, setName] = useState('')
  const [type, setType] = useState<VariableType>('boolean')
  const [defaultValue, setDefaultValue] = useState('false')
  const [description, setDescription] = useState('')

  const nameError = name && existingNames.includes(name)
    ? 'Variable name must be unique'
    : name && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)
      ? 'Use letters, numbers, and underscores only'
      : ''

  function handleSave() {
    if (!name || nameError) return

    let parsedDefault: boolean | number | string
    if (type === 'boolean') parsedDefault = defaultValue === 'true'
    else if (type === 'number') parsedDefault = Number(defaultValue) || 0
    else parsedDefault = defaultValue

    onSave({
      name,
      type,
      scope: 'course',
      defaultValue: parsedDefault,
      description,
      system: false
    })
  }

  return (
    <div className="p-3 rounded-lg border-2 border-[var(--brand-indigo)] bg-[var(--bg-muted)] space-y-2">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Variable name (e.g., score)"
          aria-label="Variable name"
          autoFocus
          className={`w-full px-2.5 py-1.5 text-xs rounded-md border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] ${
            nameError ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]'
          }`}
        />
        {nameError && <p className="text-[10px] text-[var(--color-danger-600)] mt-0.5">{nameError}</p>}
      </div>

      <div className="flex gap-2">
        <select
          value={type}
          aria-label="Variable type"
          onChange={(e) => {
            const t = e.target.value as VariableType
            setType(t)
            if (t === 'boolean') setDefaultValue('false')
            else if (t === 'number') setDefaultValue('0')
            else setDefaultValue('')
          }}
          className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        >
          <option value="boolean">Boolean</option>
          <option value="number">Number</option>
          <option value="text">Text</option>
        </select>

        {type === 'boolean' ? (
          <select
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            aria-label="Default value"
            className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="false">false</option>
            <option value="true">true</option>
          </select>
        ) : (
          <input
            type={type === 'number' ? 'number' : 'text'}
            value={defaultValue}
            onChange={(e) => setDefaultValue(e.target.value)}
            placeholder="Default value"
            aria-label="Default value"
            className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        )}
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
          disabled={!name || !!nameError}
          className="px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md bg-[var(--brand-indigo)] text-white hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-tap-target"
        >
          Create Variable
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
