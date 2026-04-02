import { useState } from 'react'
import { Plus, Sparkles, Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { useAppStore } from '@/stores/useAppStore'
import { BloomsReference } from '../BloomsReference'
import { ObjectiveCard } from '../cards/ObjectiveCard'
import { getProvider } from '@/lib/ai/ai-client'
import { baseBrainContext } from '@/lib/ai/prompts'
import { generateObjectivesPrompt, SYLLABUS_SYSTEM_PROMPT, extractJSON } from '@/lib/ai/syllabus-prompts'
import { CONTENT_AREAS, GRADE_LEVELS } from '@/lib/syllabus-constants'
import type { BloomsLevel } from '@/types/syllabus'

export function ObjectivesStep(): JSX.Element {
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)!
  const addObjective = useSyllabusStore((s) => s.addObjective)
  const isGenerating = useSyllabusStore((s) => s.isGenerating)
  const generatingTarget = useSyllabusStore((s) => s.generatingTarget)
  const generationError = useSyllabusStore((s) => s.generationError)
  const objectivePool = useSyllabusStore((s) => s.objectivePool)
  const importObjectiveFromPool = useSyllabusStore((s) => s.importObjectiveFromPool)

  const [showPool, setShowPool] = useState(false)

  async function handleGenerate(): Promise<void> {
    const store = useSyllabusStore.getState()
    const appStore = useAppStore.getState()
    store.startGeneration('objectives')

    try {
      const provider = getProvider(appStore.ai)
      const bbContext = baseBrainContext(appStore.baseBrain)
      const systemPrompt = SYLLABUS_SYSTEM_PROMPT + bbContext

      const contentAreaLabels = activeSyllabus.contentAreas
        .map((id) => CONTENT_AREAS.find((a) => a.id === id)?.label ?? id)
        .concat(activeSyllabus.customContentAreas)
      const gradeLabel = GRADE_LEVELS.find((g) => g.id === activeSyllabus.audience.level)?.label ?? activeSyllabus.audience.level

      const prompt = generateObjectivesPrompt(
        contentAreaLabels,
        activeSyllabus.courseGoal,
        gradeLabel,
        activeSyllabus.audience.context,
        activeSyllabus.objectives.map((o) => o.text)
      )

      const result = await provider.generateText(prompt, systemPrompt)

      const parsed = extractJSON<Array<{ text: string; bloomsLevel: string; rationale: string }>>(result)

      for (const obj of parsed) {
        store.addObjective({
          text: obj.text,
          bloomsLevel: (obj.bloomsLevel || 'understand') as BloomsLevel,
          rationale: obj.rationale || ''
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
          Learning Objectives
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Define what students will be able to do after completing this course. Use Bloom's Taxonomy to guide your verbs.
        </p>
      </div>

      {/* Bloom's Reference — expanded by default */}
      <BloomsReference />

      {/* Action bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button variant="secondary" size="sm" onClick={() => addObjective()}>
          <Plus size={14} />
          Add Objective
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          <Sparkles size={14} />
          {isGenerating && generatingTarget === 'objectives' ? 'Generating...' : 'Generate with AI'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPool(!showPool)}
          disabled={objectivePool.length === 0}
          title={objectivePool.length === 0 ? 'Save objectives to your pool to reuse them across syllabi' : undefined}
        >
          <Download size={14} />
          Import from Pool {objectivePool.length > 0 ? `(${objectivePool.length})` : ''}
        </Button>
      </div>

      {/* AI status */}
      <div aria-live="polite">
        {isGenerating && generatingTarget === 'objectives' && (
          <p className="text-sm text-[var(--text-secondary)] animate-pulse">Generating objectives with AI...</p>
        )}
        {generationError && (
          <p className="text-sm text-[var(--color-danger-500)]">Error: {generationError}</p>
        )}
      </div>

      {/* Pool import drawer */}
      {showPool && objectivePool.length > 0 && (
        <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] p-3 space-y-2">
          <p className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">Objective Pool</p>
          {objectivePool.map((obj) => (
            <div key={obj.id} className="flex items-center gap-2 p-2 rounded bg-[var(--bg-surface)] border border-[var(--border-default)]">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[var(--text-primary)] truncate">{obj.text}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{obj.bloomsLevel}{obj.syllabusName ? ` — ${obj.syllabusName}` : ''}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => importObjectiveFromPool(obj)}>
                <Plus size={12} />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Objective cards */}
      {activeSyllabus.objectives.length === 0 ? (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
          No objectives yet. Add one manually or generate with AI.
        </p>
      ) : (
        <div className="space-y-3">
          {activeSyllabus.objectives.map((obj, i) => (
            <ObjectiveCard key={obj.id} objective={obj} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
