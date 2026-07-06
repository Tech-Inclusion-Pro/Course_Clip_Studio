import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { EntryScreen } from './EntryScreen'
import { OutlineEditor } from './OutlineEditor'
import { RenderingView } from './RenderingView'
import { DeckPreview } from './DeckPreview'
import type { PresentationWizardStep } from '@/types/presentation'

const STEP_LABELS: Record<PresentationWizardStep, string> = {
  entry: 'Create',
  outline: 'Edit Outline',
  render: 'Render',
  preview: 'Preview & Export'
}

const STEPS: PresentationWizardStep[] = ['entry', 'outline', 'render', 'preview']

export function PresentationBuilderShell(): JSX.Element {
  const step = usePresentationStore((s) => s.step)
  const closeDraft = usePresentationStore((s) => s.closeDraft)
  const draftTitle = usePresentationStore((s) => s.activeDraft?.title)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="sm" onClick={closeDraft}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <span className="text-sm text-[var(--text-tertiary)]">/</span>
        <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] truncate">
          {draftTitle || 'New Presentation'}
        </span>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            {i > 0 && <div className="w-6 h-px bg-[var(--border-default)]" />}
            <div
              className={`px-3 py-1 rounded-full text-xs font-[var(--font-weight-medium)] ${
                s === step
                  ? 'bg-[var(--brand-magenta)] text-white'
                  : STEPS.indexOf(s) < STEPS.indexOf(step)
                    ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                    : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)]'
              }`}
            >
              {STEP_LABELS[s]}
            </div>
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        {step === 'entry' && <EntryScreen />}
        {step === 'outline' && <OutlineEditor />}
        {step === 'render' && <RenderingView />}
        {step === 'preview' && <DeckPreview />}
      </div>
    </div>
  )
}
