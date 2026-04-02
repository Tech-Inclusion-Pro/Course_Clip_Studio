import { Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { RUBRIC_TYPES } from '@/lib/syllabus-constants'
import type { SyllabusRubric, RubricType } from '@/types/syllabus'

interface RubricEditorProps {
  rubric: SyllabusRubric
  assignmentTitle: string
}

export function RubricEditor({ rubric, assignmentTitle }: RubricEditorProps): JSX.Element {
  const updateRubric = useSyllabusStore((s) => s.updateRubric)
  const removeRubric = useSyllabusStore((s) => s.removeRubric)
  const addRubricRow = useSyllabusStore((s) => s.addRubricRow)
  const addRubricColumn = useSyllabusStore((s) => s.addRubricColumn)
  const removeRubricRow = useSyllabusStore((s) => s.removeRubricRow)
  const removeRubricColumn = useSyllabusStore((s) => s.removeRubricColumn)
  const updateRubricCell = useSyllabusStore((s) => s.updateRubricCell)
  const setRubricType = useSyllabusStore((s) => s.setRubricType)
  const saveRubricToPool = useSyllabusStore((s) => s.saveRubricToPool)

  function handlePoolToggle(): void {
    if (!rubric.savedToPool) {
      saveRubricToPool(rubric, assignmentTitle)
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          Rubric for: {assignmentTitle || 'Untitled Assignment'}
        </h4>
        <button
          onClick={() => removeRubric(rubric.id)}
          className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer transition-colors"
          aria-label="Remove rubric"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {/* Type selector + Pool toggle */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <label htmlFor={`rub-type-${rubric.id}`} className="text-xs text-[var(--text-tertiary)]">Type:</label>
          <select
            id={`rub-type-${rubric.id}`}
            value={rubric.type}
            onChange={(e) => setRubricType(rubric.id, e.target.value as RubricType)}
            className="px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            {RUBRIC_TYPES.map((rt) => (
              <option key={rt.id} value={rt.id}>{rt.label}</option>
            ))}
          </select>
        </div>
        <button
          role="switch"
          aria-checked={rubric.savedToPool}
          onClick={handlePoolToggle}
          className={`
            text-xs px-2 py-0.5 rounded-md cursor-pointer transition-colors
            focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
            ${rubric.savedToPool
              ? 'bg-green-100 text-green-700'
              : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}
          `}
        >
          {rubric.savedToPool ? 'Saved to Pool' : 'Save to Pool'}
        </button>
      </div>

      {/* Rubric body by type */}
      {rubric.type === 'analytic' && <AnalyticRubric rubric={rubric} />}
      {rubric.type === 'holistic' && <HolisticRubric rubric={rubric} />}
      {rubric.type === 'single-point' && <SinglePointRubric rubric={rubric} />}
      {rubric.type === 'checklist' && <ChecklistRubric rubric={rubric} />}

      {/* Add row/column for analytic */}
      {rubric.type === 'analytic' && (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => addRubricRow(rubric.id)}>
            <Plus size={12} /> Add Row
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addRubricColumn(rubric.id)}>
            <Plus size={12} /> Add Column
          </Button>
        </div>
      )}
      {(rubric.type === 'holistic' || rubric.type === 'single-point' || rubric.type === 'checklist') && (
        <Button variant="ghost" size="sm" onClick={() => addRubricRow(rubric.id)}>
          <Plus size={12} /> Add {rubric.type === 'checklist' ? 'Item' : 'Criterion'}
        </Button>
      )}
    </div>
  )
}

// ─── Analytic Rubric (table) ───

function AnalyticRubric({ rubric }: { rubric: SyllabusRubric }): JSX.Element {
  const updateRubricCell = useSyllabusStore((s) => s.updateRubricCell)
  const updateRubric = useSyllabusStore((s) => s.updateRubric)
  const removeRubricRow = useSyllabusStore((s) => s.removeRubricRow)
  const removeRubricColumn = useSyllabusStore((s) => s.removeRubricColumn)

  function updateRowLabel(rowId: string, label: string): void {
    updateRubric(rubric.id, {
      rows: rubric.rows.map((r) => (r.id === rowId ? { ...r, label } : r))
    })
  }

  function updateColLabel(colId: string, label: string): void {
    updateRubric(rubric.id, {
      columns: rubric.columns.map((c) => (c.id === colId ? { ...c, label } : c))
    })
  }

  function updateColPoints(colId: string, points: number): void {
    updateRubric(rubric.id, {
      columns: rubric.columns.map((c) => (c.id === colId ? { ...c, points } : c))
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr>
            <th scope="col" className="p-1.5 text-left bg-[var(--bg-muted)] border border-[var(--border-default)] min-w-[100px]">
              Criteria
            </th>
            {rubric.columns.map((col) => (
              <th key={col.id} scope="col" className="p-1.5 bg-[var(--bg-muted)] border border-[var(--border-default)] min-w-[120px]">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={col.label}
                    onChange={(e) => updateColLabel(col.id, e.target.value)}
                    className="w-full px-1 py-0.5 text-xs rounded border border-transparent hover:border-[var(--border-default)] bg-transparent text-[var(--text-primary)] font-[var(--font-weight-semibold)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
                    aria-label={`Column label for ${col.label}`}
                  />
                  <input
                    type="number"
                    min={0}
                    value={col.points}
                    onChange={(e) => updateColPoints(col.id, Number(e.target.value))}
                    className="w-8 px-0.5 py-0.5 text-[10px] text-center rounded border border-[var(--border-default)] bg-[var(--bg-surface)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
                    aria-label={`Points for ${col.label}`}
                  />
                  {rubric.columns.length > 1 && (
                    <button
                      onClick={() => removeRubricColumn(rubric.id, col.id)}
                      className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer"
                      aria-label={`Remove column ${col.label}`}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rubric.rows.map((row) => (
            <tr key={row.id}>
              <th scope="row" className="p-1.5 text-left border border-[var(--border-default)] bg-[var(--bg-muted)]">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateRowLabel(row.id, e.target.value)}
                    className="w-full px-1 py-0.5 text-xs rounded border border-transparent hover:border-[var(--border-default)] bg-transparent text-[var(--text-primary)] font-[var(--font-weight-medium)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
                    aria-label={`Row label for ${row.label}`}
                  />
                  {rubric.rows.length > 1 && (
                    <button
                      onClick={() => removeRubricRow(rubric.id, row.id)}
                      className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer"
                      aria-label={`Remove row ${row.label}`}
                    >
                      <X size={10} />
                    </button>
                  )}
                </div>
              </th>
              {rubric.columns.map((col) => {
                const key = `${row.id}:${col.id}`
                return (
                  <td key={key} className="p-1 border border-[var(--border-default)]">
                    <textarea
                      value={rubric.cells[key] || ''}
                      onChange={(e) => updateRubricCell(rubric.id, key, e.target.value)}
                      rows={2}
                      placeholder="Describe performance..."
                      className="w-full px-1.5 py-1 text-[10px] rounded border border-transparent hover:border-[var(--border-default)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-none"
                      aria-label={`${row.label} at ${col.label} level`}
                    />
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Holistic Rubric ───

function HolisticRubric({ rubric }: { rubric: SyllabusRubric }): JSX.Element {
  const updateRubricCell = useSyllabusStore((s) => s.updateRubricCell)
  const updateRubric = useSyllabusStore((s) => s.updateRubric)
  const removeRubricRow = useSyllabusStore((s) => s.removeRubricRow)

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-tertiary)]">Describe overall performance at each level:</p>
      {rubric.rows.map((row) => (
        <div key={row.id} className="flex items-start gap-2 p-2 rounded border border-[var(--border-default)]">
          <div className="shrink-0 w-24">
            <input
              type="text"
              value={row.label}
              onChange={(e) => updateRubric(rubric.id, { rows: rubric.rows.map((r) => r.id === row.id ? { ...r, label: e.target.value } : r) })}
              className="w-full px-1.5 py-1 text-xs font-[var(--font-weight-medium)] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
              aria-label={`Level label`}
            />
          </div>
          <textarea
            value={rubric.cells[`${row.id}:holistic`] || ''}
            onChange={(e) => updateRubricCell(rubric.id, `${row.id}:holistic`, e.target.value)}
            rows={2}
            placeholder="Describe what this level looks like..."
            className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-none"
            aria-label={`Description for ${row.label}`}
          />
          {rubric.rows.length > 1 && (
            <button
              onClick={() => removeRubricRow(rubric.id, row.id)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer"
              aria-label={`Remove level ${row.label}`}
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Single-Point Rubric ───

function SinglePointRubric({ rubric }: { rubric: SyllabusRubric }): JSX.Element {
  const updateRubricCell = useSyllabusStore((s) => s.updateRubricCell)
  const updateRubric = useSyllabusStore((s) => s.updateRubric)
  const removeRubricRow = useSyllabusStore((s) => s.removeRubricRow)

  return (
    <div className="space-y-2">
      <p className="text-xs text-[var(--text-tertiary)]">List criteria with space for strengths and areas for growth:</p>
      {rubric.rows.map((row) => (
        <div key={row.id} className="p-2 rounded border border-[var(--border-default)] space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={row.label}
              onChange={(e) => updateRubric(rubric.id, { rows: rubric.rows.map((r) => r.id === row.id ? { ...r, label: e.target.value } : r) })}
              className="flex-1 px-1.5 py-1 text-xs font-[var(--font-weight-medium)] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
              aria-label="Criterion label"
            />
            {rubric.rows.length > 1 && (
              <button
                onClick={() => removeRubricRow(rubric.id, row.id)}
                className="p-1 text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer"
                aria-label={`Remove criterion ${row.label}`}
              >
                <X size={12} />
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-[var(--text-tertiary)]">Areas for Growth</label>
              <textarea
                value={rubric.cells[`${row.id}:growth`] || ''}
                onChange={(e) => updateRubricCell(rubric.id, `${row.id}:growth`, e.target.value)}
                rows={2}
                className="w-full px-1.5 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-none"
                aria-label={`Areas for growth for ${row.label}`}
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-tertiary)]">Proficient</label>
              <textarea
                value={rubric.cells[`${row.id}:proficient`] || ''}
                onChange={(e) => updateRubricCell(rubric.id, `${row.id}:proficient`, e.target.value)}
                rows={2}
                className="w-full px-1.5 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-none"
                aria-label={`Proficient description for ${row.label}`}
              />
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-tertiary)]">Strengths</label>
              <textarea
                value={rubric.cells[`${row.id}:strengths`] || ''}
                onChange={(e) => updateRubricCell(rubric.id, `${row.id}:strengths`, e.target.value)}
                rows={2}
                className="w-full px-1.5 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-none"
                aria-label={`Strengths for ${row.label}`}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Checklist Rubric ───

function ChecklistRubric({ rubric }: { rubric: SyllabusRubric }): JSX.Element {
  const updateRubric = useSyllabusStore((s) => s.updateRubric)
  const removeRubricRow = useSyllabusStore((s) => s.removeRubricRow)

  return (
    <div className="space-y-1.5">
      <p className="text-xs text-[var(--text-tertiary)]">Checklist items (Yes/No criteria):</p>
      {rubric.rows.map((row) => (
        <div key={row.id} className="flex items-center gap-2 p-2 rounded border border-[var(--border-default)]">
          <div className="w-4 h-4 rounded border border-[var(--border-default)] bg-[var(--bg-muted)] shrink-0" aria-hidden="true" />
          <input
            type="text"
            value={row.label}
            onChange={(e) => updateRubric(rubric.id, { rows: rubric.rows.map((r) => r.id === row.id ? { ...r, label: e.target.value } : r) })}
            className="flex-1 px-1.5 py-0.5 text-xs rounded border border-transparent hover:border-[var(--border-default)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
            placeholder="Checklist item..."
            aria-label="Checklist item"
          />
          {rubric.rows.length > 1 && (
            <button
              onClick={() => removeRubricRow(rubric.id, row.id)}
              className="p-1 text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer"
              aria-label={`Remove item ${row.label}`}
            >
              <X size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  )
}
