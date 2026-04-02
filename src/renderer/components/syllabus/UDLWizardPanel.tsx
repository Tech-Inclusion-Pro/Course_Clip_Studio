import { useState } from 'react'
import { ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { useAppStore } from '@/stores/useAppStore'
import { getProvider } from '@/lib/ai/ai-client'
import { baseBrainContext } from '@/lib/ai/prompts'
import { generateUDLSuggestionsPrompt, SYLLABUS_SYSTEM_PROMPT } from '@/lib/ai/syllabus-prompts'
import { GRADE_LEVELS } from '@/lib/syllabus-constants'
import type { SyllabusAssignment, UDLAnnotation } from '@/types/syllabus'

interface UDLWizardPanelProps {
  assignment: SyllabusAssignment
}

type UDLPillar = 'representation' | 'actionExpression' | 'engagement'

const PILLAR_LABELS: Record<UDLPillar, { label: string; description: string; placeholder: string }> = {
  representation: {
    label: 'Representation',
    description: 'Multiple means of presenting information',
    placeholder: 'e.g., Provide written instructions AND a video tutorial; offer text in multiple formats...'
  },
  actionExpression: {
    label: 'Action & Expression',
    description: 'Multiple ways for learners to demonstrate knowledge',
    placeholder: 'e.g., Allow oral presentation OR written report; provide graphic organizer templates...'
  },
  engagement: {
    label: 'Engagement',
    description: 'Multiple ways to motivate and sustain effort',
    placeholder: 'e.g., Offer choice of topics; include collaborative and individual options; provide rubric upfront...'
  }
}

export function UDLWizardPanel({ assignment }: UDLWizardPanelProps): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const updateAssignmentUDL = useSyllabusStore((s) => s.updateAssignmentUDL)
  const isGenerating = useSyllabusStore((s) => s.isGenerating)
  const generatingTarget = useSyllabusStore((s) => s.generatingTarget)

  async function handleGenerateUDL(pillar: UDLPillar): Promise<void> {
    const store = useSyllabusStore.getState()
    const appStore = useAppStore.getState()
    const targetKey = `udl-${assignment.id}-${pillar}`
    store.startGeneration(targetKey)

    try {
      const provider = getProvider(appStore.ai)
      const bbContext = baseBrainContext(appStore.baseBrain)
      const systemPrompt = SYLLABUS_SYSTEM_PROMPT + bbContext
      const syl = store.activeSyllabus!
      const objectives = syl.objectives.filter((o) => assignment.linkedObjectiveIds.includes(o.id))
      const gradeLabel = GRADE_LEVELS.find((g) => g.id === syl.audience.level)?.label ?? syl.audience.level

      const prompt = generateUDLSuggestionsPrompt(assignment, objectives, gradeLabel, pillar)
      const result = await provider.generateText(prompt, systemPrompt)

      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      const parsed = JSON.parse(cleaned) as { strategies: string[] }
      const combined = parsed.strategies?.join('\n') || result

      updateAssignmentUDL(assignment.id, { [pillar]: combined } as Partial<UDLAnnotation>)
      useSyllabusStore.getState().finishGeneration()
    } catch (err) {
      useSyllabusStore.getState().failGeneration(err instanceof Error ? err.message : 'UDL generation failed')
    }
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--ring-brand)]"
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        UDL Accommodations
      </button>

      {expanded && (
        <div className="px-3 pb-3 space-y-3">
          {(Object.keys(PILLAR_LABELS) as UDLPillar[]).map((pillar) => {
            const config = PILLAR_LABELS[pillar]
            const generating = isGenerating && generatingTarget === `udl-${assignment.id}-${pillar}`
            return (
              <div key={pillar}>
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor={`udl-${assignment.id}-${pillar}`} className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                    {config.label}
                    <span className="text-[10px] text-[var(--text-tertiary)] ml-1">— {config.description}</span>
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleGenerateUDL(pillar)}
                    disabled={isGenerating}
                    className="!px-1.5 !py-0.5 text-[10px]"
                  >
                    <Sparkles size={10} />
                    {generating ? 'Generating...' : 'Suggest'}
                  </Button>
                </div>
                <textarea
                  id={`udl-${assignment.id}-${pillar}`}
                  value={assignment.udl[pillar]}
                  onChange={(e) => updateAssignmentUDL(assignment.id, { [pillar]: e.target.value } as Partial<UDLAnnotation>)}
                  rows={2}
                  placeholder={config.placeholder}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                />
              </div>
            )
          })}

          {/* AI status */}
          <div aria-live="polite">
            {isGenerating && generatingTarget?.startsWith(`udl-${assignment.id}`) && (
              <p className="text-[10px] text-[var(--text-secondary)] animate-pulse">Generating UDL suggestions...</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
