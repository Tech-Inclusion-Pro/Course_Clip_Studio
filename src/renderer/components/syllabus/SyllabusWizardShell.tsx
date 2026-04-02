import { ArrowLeft, ArrowRight, X, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { WIZARD_STEPS, WIZARD_STEP_LABELS } from '@/lib/syllabus-constants'
import { CourseIdentityStep } from './steps/CourseIdentityStep'
import { AudienceLevelStep } from './steps/AudienceLevelStep'
import { ObjectivesStep } from './steps/ObjectivesStep'
import { AssignmentsStep } from './steps/AssignmentsStep'
import { RubricsStep } from './steps/RubricsStep'
import { ReviewExportStep } from './steps/ReviewExportStep'

export function SyllabusWizardShell(): JSX.Element {
  const wizardStep = useSyllabusStore((s) => s.wizardStep)
  const goNext = useSyllabusStore((s) => s.goNext)
  const goPrev = useSyllabusStore((s) => s.goPrev)
  const saveSyllabus = useSyllabusStore((s) => s.saveSyllabus)
  const closeSyllabus = useSyllabusStore((s) => s.closeSyllabus)
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)

  const currentIndex = WIZARD_STEPS.indexOf(wizardStep)
  const isFirst = currentIndex === 0
  const isLast = currentIndex === WIZARD_STEPS.length - 1

  function handleSaveAndClose(): void {
    saveSyllabus()
    closeSyllabus()
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <div className="flex items-center gap-3">
          <button
            onClick={closeSyllabus}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
            aria-label="Close wizard"
          >
            <X size={18} />
          </button>
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] truncate max-w-xs">
            {activeSyllabus?.name || 'New Syllabus'}
          </h2>
        </div>
        <Button variant="secondary" size="sm" onClick={() => saveSyllabus()}>
          <Save size={14} />
          Save
        </Button>
      </div>

      {/* Progress bar */}
      <nav className="px-6 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)]" aria-label="Wizard progress">
        <ol className="flex items-center gap-1">
          {WIZARD_STEPS.map((step, i) => {
            const isCurrent = step === wizardStep
            const isCompleted = i < currentIndex
            return (
              <li key={step} className="flex items-center gap-1 flex-1">
                <button
                  onClick={() => useSyllabusStore.getState().setWizardStep(step)}
                  className={`
                    flex items-center gap-1.5 px-2 py-1 rounded-md text-xs cursor-pointer
                    font-[var(--font-weight-medium)] transition-colors w-full
                    focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
                    ${isCurrent
                      ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                      : isCompleted
                        ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                        : 'text-[var(--text-tertiary)] hover:bg-[var(--bg-hover)]'}
                  `}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className={`
                    w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0
                    ${isCurrent
                      ? 'bg-[var(--brand-magenta)] text-white'
                      : isCompleted
                        ? 'bg-[var(--text-secondary)] text-white'
                        : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)]'}
                  `}>
                    {i + 1}
                  </span>
                  <span className="hidden sm:inline truncate">{WIZARD_STEP_LABELS[step]}</span>
                </button>
                {i < WIZARD_STEPS.length - 1 && (
                  <div className={`h-px flex-1 min-w-2 ${i < currentIndex ? 'bg-[var(--text-secondary)]' : 'bg-[var(--border-default)]'}`} />
                )}
              </li>
            )
          })}
        </ol>
      </nav>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-6">
        {wizardStep === 'identity' && <CourseIdentityStep />}
        {wizardStep === 'audience' && <AudienceLevelStep />}
        {wizardStep === 'objectives' && <ObjectivesStep />}
        {wizardStep === 'assignments' && <AssignmentsStep />}
        {wizardStep === 'rubrics' && <RubricsStep />}
        {wizardStep === 'review' && <ReviewExportStep />}
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={isFirst}>
          <ArrowLeft size={14} />
          Back
        </Button>
        <div className="flex items-center gap-2">
          {isLast ? (
            <Button variant="primary" size="sm" onClick={handleSaveAndClose}>
              <Save size={14} />
              Save to My Syllabi
            </Button>
          ) : (
            <Button variant="primary" size="sm" onClick={goNext}>
              Next
              <ArrowRight size={14} />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
