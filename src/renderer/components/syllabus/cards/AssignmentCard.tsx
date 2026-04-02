import { Trash2, Link } from 'lucide-react'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { ASSIGNMENT_TYPES } from '@/lib/syllabus-constants'
import { UDLWizardPanel } from '../UDLWizardPanel'
import type { SyllabusAssignment, AssignmentType } from '@/types/syllabus'

interface AssignmentCardProps {
  assignment: SyllabusAssignment
  index: number
}

export function AssignmentCard({ assignment, index }: AssignmentCardProps): JSX.Element {
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)!
  const updateAssignment = useSyllabusStore((s) => s.updateAssignment)
  const removeAssignment = useSyllabusStore((s) => s.removeAssignment)
  const saveAssignmentToPool = useSyllabusStore((s) => s.saveAssignmentToPool)

  const objectives = activeSyllabus.objectives

  function toggleObjectiveLink(objId: string): void {
    const linked = assignment.linkedObjectiveIds.includes(objId)
      ? assignment.linkedObjectiveIds.filter((id) => id !== objId)
      : [...assignment.linkedObjectiveIds, objId]
    updateAssignment(assignment.id, { linkedObjectiveIds: linked })
  }

  function handlePoolToggle(): void {
    if (!assignment.savedToPool) {
      saveAssignmentToPool(assignment)
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 space-y-3">
      <div className="flex items-start gap-2">
        <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] mt-1.5 shrink-0">
          {index + 1}.
        </span>
        <div className="flex-1 space-y-2">
          {/* Title */}
          <div>
            <label htmlFor={`asn-title-${assignment.id}`} className="sr-only">Assignment {index + 1} title</label>
            <input
              id={`asn-title-${assignment.id}`}
              type="text"
              value={assignment.title}
              onChange={(e) => updateAssignment(assignment.id, { title: e.target.value })}
              placeholder="Assignment title..."
              className="w-full px-2.5 py-1.5 text-sm font-[var(--font-weight-medium)] rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </div>

          {/* Type + Pool toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label htmlFor={`asn-type-${assignment.id}`} className="text-xs text-[var(--text-tertiary)]">Type:</label>
              <select
                id={`asn-type-${assignment.id}`}
                value={assignment.type}
                onChange={(e) => updateAssignment(assignment.id, { type: e.target.value as AssignmentType })}
                className="px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              >
                {ASSIGNMENT_TYPES.map((at) => (
                  <option key={at.id} value={at.id}>{at.label}</option>
                ))}
              </select>
            </div>

            <button
              role="switch"
              aria-checked={assignment.savedToPool}
              onClick={handlePoolToggle}
              className={`
                text-xs px-2 py-0.5 rounded-md cursor-pointer transition-colors
                focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
                ${assignment.savedToPool
                  ? 'bg-green-100 text-green-700'
                  : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}
              `}
            >
              {assignment.savedToPool ? 'Saved to Pool' : 'Save to Pool'}
            </button>
          </div>

          {/* Description */}
          <div>
            <label htmlFor={`asn-desc-${assignment.id}`} className="text-xs text-[var(--text-tertiary)]">Description:</label>
            <textarea
              id={`asn-desc-${assignment.id}`}
              value={assignment.description}
              onChange={(e) => updateAssignment(assignment.id, { description: e.target.value })}
              rows={2}
              placeholder="Describe the assignment..."
              className="w-full mt-0.5 px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            />
          </div>

          {/* Linked Objectives */}
          {objectives.length > 0 && (
            <div>
              <p className="text-xs text-[var(--text-tertiary)] mb-1 flex items-center gap-1">
                <Link size={12} />
                Linked Objectives:
              </p>
              <div className="flex flex-wrap gap-1">
                {objectives.map((obj, i) => {
                  const linked = assignment.linkedObjectiveIds.includes(obj.id)
                  return (
                    <button
                      key={obj.id}
                      onClick={() => toggleObjectiveLink(obj.id)}
                      aria-pressed={linked}
                      className={`
                        text-[10px] px-2 py-0.5 rounded cursor-pointer transition-colors
                        focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
                        ${linked
                          ? 'bg-[var(--brand-magenta)] text-white'
                          : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]'}
                      `}
                      title={obj.text}
                    >
                      Obj {i + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* UDL Panel */}
          <UDLWizardPanel assignment={assignment} />
        </div>

        {/* Delete */}
        <button
          onClick={() => removeAssignment(assignment.id)}
          className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer transition-colors"
          aria-label={`Remove assignment ${index + 1}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
