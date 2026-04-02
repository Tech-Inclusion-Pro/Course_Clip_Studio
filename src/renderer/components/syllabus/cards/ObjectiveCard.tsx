import { Trash2 } from 'lucide-react'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { BLOOMS_LEVELS } from '@/lib/syllabus-constants'
import type { SyllabusObjective, BloomsLevel } from '@/types/syllabus'

interface ObjectiveCardProps {
  objective: SyllabusObjective
  index: number
}

export function ObjectiveCard({ objective, index }: ObjectiveCardProps): JSX.Element {
  const updateObjective = useSyllabusStore((s) => s.updateObjective)
  const removeObjective = useSyllabusStore((s) => s.removeObjective)
  const saveObjectiveToPool = useSyllabusStore((s) => s.saveObjectiveToPool)

  const bloomsConfig = BLOOMS_LEVELS.find((b) => b.id === objective.bloomsLevel)

  function handlePoolToggle(): void {
    if (!objective.savedToPool) {
      saveObjectiveToPool(objective)
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] mt-1.5 shrink-0">
          {index + 1}.
        </span>
        <div className="flex-1 space-y-2">
          {/* Objective text */}
          <div>
            <label htmlFor={`obj-text-${objective.id}`} className="sr-only">
              Objective {index + 1} text
            </label>
            <textarea
              id={`obj-text-${objective.id}`}
              value={objective.text}
              onChange={(e) => updateObjective(objective.id, { text: e.target.value })}
              rows={2}
              placeholder="Students will be able to..."
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Bloom's level */}
            <div className="flex items-center gap-1.5">
              <label htmlFor={`obj-blooms-${objective.id}`} className="text-xs text-[var(--text-tertiary)]">
                Bloom's:
              </label>
              <select
                id={`obj-blooms-${objective.id}`}
                value={objective.bloomsLevel}
                onChange={(e) => updateObjective(objective.id, { bloomsLevel: e.target.value as BloomsLevel })}
                className="px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              >
                {BLOOMS_LEVELS.map((bl) => (
                  <option key={bl.id} value={bl.id}>{bl.label}</option>
                ))}
              </select>
              {bloomsConfig && (
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-[var(--font-weight-semibold)] text-white"
                  style={{ backgroundColor: bloomsConfig.color }}
                >
                  {bloomsConfig.label}
                </span>
              )}
            </div>

            {/* Save to Pool toggle */}
            <button
              role="switch"
              aria-checked={objective.savedToPool}
              onClick={handlePoolToggle}
              className={`
                text-xs px-2 py-0.5 rounded-md cursor-pointer transition-colors
                focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
                ${objective.savedToPool
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}
              `}
            >
              {objective.savedToPool ? 'Saved to Pool' : 'Save to Pool'}
            </button>
          </div>

          {/* Rationale */}
          <div>
            <label htmlFor={`obj-rationale-${objective.id}`} className="text-xs text-[var(--text-tertiary)]">
              Rationale (optional):
            </label>
            <input
              id={`obj-rationale-${objective.id}`}
              type="text"
              value={objective.rationale}
              onChange={(e) => updateObjective(objective.id, { rationale: e.target.value })}
              placeholder="Why is this objective important?"
              className="w-full mt-0.5 px-2.5 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => removeObjective(objective.id)}
          className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer transition-colors"
          aria-label={`Remove objective ${index + 1}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
