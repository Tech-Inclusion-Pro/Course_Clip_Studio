import { useState } from 'react'
import { Plus, Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { useAppStore } from '@/stores/useAppStore'
import { RubricEditor } from '../cards/RubricEditor'
import { getProvider } from '@/lib/ai/ai-client'
import { baseBrainContext } from '@/lib/ai/prompts'
import { generateRubricPrompt, SYLLABUS_SYSTEM_PROMPT, extractJSON } from '@/lib/ai/syllabus-prompts'
import { GRADE_LEVELS } from '@/lib/syllabus-constants'
import type { RubricType } from '@/types/syllabus'

export function RubricsStep(): JSX.Element {
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)!
  const addRubric = useSyllabusStore((s) => s.addRubric)
  const isGenerating = useSyllabusStore((s) => s.isGenerating)
  const generatingTarget = useSyllabusStore((s) => s.generatingTarget)
  const generationError = useSyllabusStore((s) => s.generationError)
  const rubricPool = useSyllabusStore((s) => s.rubricPool)
  const importRubricFromPool = useSyllabusStore((s) => s.importRubricFromPool)

  const [showPool, setShowPool] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<string>(
    activeSyllabus.assignments[0]?.id ?? ''
  )

  async function handleGenerate(assignmentId: string): Promise<void> {
    const store = useSyllabusStore.getState()
    const appStore = useAppStore.getState()
    const syl = store.activeSyllabus!
    const assignment = syl.assignments.find((a) => a.id === assignmentId)
    if (!assignment) return

    store.startGeneration(`rubric-${assignmentId}`)

    try {
      const provider = getProvider(appStore.ai)
      const bbContext = baseBrainContext(appStore.baseBrain)
      const systemPrompt = SYLLABUS_SYSTEM_PROMPT + bbContext
      const objectives = syl.objectives.filter((o) => assignment.linkedObjectiveIds.includes(o.id))
      const gradeLabel = GRADE_LEVELS.find((g) => g.id === syl.audience.level)?.label ?? syl.audience.level
      const existingRubric = syl.rubrics.find((r) => r.assignmentId === assignmentId)

      const prompt = generateRubricPrompt(
        assignment,
        objectives,
        existingRubric?.type ?? 'analytic',
        gradeLabel
      )

      const result = await provider.generateText(prompt, systemPrompt)
      const parsed = extractJSON<{
        type?: string
        columns?: Array<{ label: string; points: number }>
        rows?: Array<{ label: string; weight?: number }>
        cells?: Record<string, string>
      }>(result)

      store.addRubric(assignmentId, {
        type: (parsed.type || 'analytic') as RubricType,
        columns: parsed.columns?.map((c, i) => ({ id: `lvl-gen-${i}`, label: c.label, points: c.points })),
        rows: parsed.rows?.map((r, i) => ({ id: `crit-gen-${i}`, label: r.label, weight: r.weight ?? 1 })),
        cells: parsed.cells ?? {}
      })

      useSyllabusStore.getState().finishGeneration()
    } catch (err) {
      useSyllabusStore.getState().failGeneration(err instanceof Error ? err.message : 'Generation failed')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Rubrics
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Create rubrics for your assignments. Choose from analytic, holistic, single-point, or checklist formats.
        </p>
      </div>

      {/* Assignment selector for adding rubrics */}
      {activeSyllabus.assignments.length > 0 && (
        <div className="flex items-end gap-2 flex-wrap">
          <div>
            <label htmlFor="rub-asn-select" className="block text-xs text-[var(--text-tertiary)] mb-1">Add rubric for:</label>
            <select
              id="rub-asn-select"
              value={selectedAssignment}
              onChange={(e) => setSelectedAssignment(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            >
              {activeSyllabus.assignments.map((asn) => (
                <option key={asn.id} value={asn.id}>{asn.title || 'Untitled Assignment'}</option>
              ))}
            </select>
          </div>
          <Button variant="secondary" size="sm" onClick={() => selectedAssignment && addRubric(selectedAssignment)}>
            <Plus size={14} />
            Add Rubric
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => selectedAssignment && handleGenerate(selectedAssignment)}
            disabled={isGenerating}
          >
            <Sparkles size={14} />
            {isGenerating && generatingTarget?.startsWith('rubric-') ? 'Generating...' : 'Generate with AI'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPool(!showPool)}
            disabled={rubricPool.length === 0}
            title={rubricPool.length === 0 ? 'Save rubrics to your pool to reuse them across syllabi' : undefined}
          >
            <Download size={14} />
            Import from Pool {rubricPool.length > 0 ? `(${rubricPool.length})` : ''}
          </Button>
        </div>
      )}

      {activeSyllabus.assignments.length === 0 && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
          Add assignments in the previous step before creating rubrics.
        </p>
      )}

      {/* AI status */}
      <div aria-live="polite">
        {isGenerating && generatingTarget?.startsWith('rubric-') && (
          <p className="text-sm text-[var(--text-secondary)] animate-pulse">Generating rubric with AI...</p>
        )}
        {generationError && (
          <p className="text-sm text-[var(--color-danger-500)]">Error: {generationError}</p>
        )}
      </div>

      {/* Pool import */}
      {showPool && rubricPool.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] p-3 space-y-2">
          <p className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">Rubric Pool</p>
          {rubricPool.map((rub) => (
            <div key={rub.id} className="flex items-center gap-2 p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-primary)] truncate">{rub.assignmentName ?? `Rubric (${rub.type})`}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{rub.rows.length} criteria, {rub.columns.length} levels</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectedAssignment && importRubricFromPool(rub, selectedAssignment)}
                disabled={!selectedAssignment}
              >
                <Plus size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Rubric editors grouped by assignment */}
      {activeSyllabus.assignments.map((asn) => {
        const rubrics = activeSyllabus.rubrics.filter((r) => r.assignmentId === asn.id)
        if (rubrics.length === 0) return null
        return (
          <div key={asn.id} className="space-y-3">
            {rubrics.map((rubric) => (
              <RubricEditor key={rubric.id} rubric={rubric} assignmentTitle={asn.title} />
            ))}
          </div>
        )
      })}
    </div>
  )
}
