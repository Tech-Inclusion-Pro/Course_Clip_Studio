import { useState } from 'react'
import { Plus, Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { useAppStore } from '@/stores/useAppStore'
import { AssignmentCard } from '../cards/AssignmentCard'
import { getProvider } from '@/lib/ai/ai-client'
import { baseBrainContext } from '@/lib/ai/prompts'
import { generateAssignmentPrompt, SYLLABUS_SYSTEM_PROMPT } from '@/lib/ai/syllabus-prompts'
import { GRADE_LEVELS } from '@/lib/syllabus-constants'
import type { AssignmentType } from '@/types/syllabus'

export function AssignmentsStep(): JSX.Element {
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)!
  const addAssignment = useSyllabusStore((s) => s.addAssignment)
  const isGenerating = useSyllabusStore((s) => s.isGenerating)
  const generatingTarget = useSyllabusStore((s) => s.generatingTarget)
  const generationError = useSyllabusStore((s) => s.generationError)
  const assignmentPool = useSyllabusStore((s) => s.assignmentPool)
  const importAssignmentFromPool = useSyllabusStore((s) => s.importAssignmentFromPool)

  const [showPool, setShowPool] = useState(false)

  async function handleGenerate(): Promise<void> {
    const store = useSyllabusStore.getState()
    const appStore = useAppStore.getState()
    store.startGeneration('assignments')

    try {
      const provider = getProvider(appStore.ai)
      const bbContext = baseBrainContext(appStore.baseBrain)
      const systemPrompt = SYLLABUS_SYSTEM_PROMPT + bbContext
      const gradeLabel = GRADE_LEVELS.find((g) => g.id === activeSyllabus.audience.level)?.label ?? activeSyllabus.audience.level

      const prompt = generateAssignmentPrompt(
        activeSyllabus.objectives,
        gradeLabel,
        activeSyllabus.audience.context,
        activeSyllabus.assignments.map((a) => a.title)
      )

      const result = await provider.generateText(prompt, systemPrompt)
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned) as Array<{
        title: string; description: string; type: string
        linkedObjectiveIds?: string[]
        udl?: { representation: string; actionExpression: string; engagement: string }
      }>

      for (const asn of parsed) {
        store.addAssignment({
          title: asn.title,
          description: asn.description,
          type: (asn.type || 'written-essay') as AssignmentType,
          linkedObjectiveIds: asn.linkedObjectiveIds ?? [],
          udl: asn.udl ?? { representation: '', actionExpression: '', engagement: '' }
        })
      }

      useSyllabusStore.getState().finishGeneration()
    } catch (err) {
      useSyllabusStore.getState().failGeneration(err instanceof Error ? err.message : 'Generation failed')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Assignments
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Create assignments linked to your learning objectives. Include UDL accommodations for each.
        </p>
      </div>

      {/* Objectives summary */}
      {activeSyllabus.objectives.length > 0 && (
        <div className="rounded-lg bg-[var(--bg-muted)] p-3">
          <p className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] mb-1">Your Objectives:</p>
          <ol className="list-decimal list-inside text-xs text-[var(--text-secondary)] space-y-0.5">
            {activeSyllabus.objectives.map((obj) => (
              <li key={obj.id} className="truncate">{obj.text || 'Untitled objective'}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="secondary" size="sm" onClick={() => addAssignment()}>
          <Plus size={14} />
          Add Assignment
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <Sparkles size={14} />
          {isGenerating && generatingTarget === 'assignments' ? 'Generating...' : 'Generate with AI'}
        </Button>
        {assignmentPool.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setShowPool(!showPool)}>
            <Download size={14} />
            Import from Pool ({assignmentPool.length})
          </Button>
        )}
      </div>

      {/* AI status */}
      <div aria-live="polite">
        {isGenerating && generatingTarget === 'assignments' && (
          <p className="text-sm text-[var(--text-secondary)] animate-pulse">Generating assignments with AI...</p>
        )}
        {generationError && (
          <p className="text-sm text-[var(--color-danger-500)]">Error: {generationError}</p>
        )}
      </div>

      {/* Pool import */}
      {showPool && assignmentPool.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] p-3 space-y-2">
          <p className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">Assignment Pool</p>
          {assignmentPool.map((asn) => (
            <div key={asn.id} className="flex items-center gap-2 p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-primary)] truncate">{asn.title || 'Untitled'}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{asn.type}{asn.syllabusName ? ` — ${asn.syllabusName}` : ''}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => importAssignmentFromPool(asn)}>
                <Plus size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Assignment cards */}
      {activeSyllabus.assignments.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
          No assignments yet. Add one manually or generate with AI.
        </p>
      ) : (
        <div className="space-y-3">
          {activeSyllabus.assignments.map((asn, i) => (
            <AssignmentCard key={asn.id} assignment={asn} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
