import { useState, useEffect, useRef } from 'react'
import { RefreshCw, List, BarChart3, RotateCcw, ArrowRight } from 'lucide-react'
import type { ProgressionSettings } from '@/types/trigger-model'

interface WhatsNextModalProps {
  completedCount: number
  totalCount: number
  settings: ProgressionSettings
  onRetry: () => void
  onPickAnother: () => void
  onReviewProgress: () => void
  onStartOver: () => void
  onContinueAnyway: () => void
  onClose: () => void
}

export function WhatsNextModal({
  completedCount,
  totalCount,
  settings,
  onRetry,
  onPickAnother,
  onReviewProgress,
  onStartOver,
  onContinueAnyway,
  onClose
}: WhatsNextModalProps): JSX.Element {
  const [confirmContinue, setConfirmContinue] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const opts = settings.whatsNextOptions

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="whats-next-title"
        tabIndex={-1}
        className="w-full max-w-md mx-4 rounded-xl shadow-xl bg-[var(--bg-surface)] p-6 focus:outline-none"
      >
        <h2
          id="whats-next-title"
          className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-3"
        >
          What would you like to do next?
        </h2>

        <p className="text-sm text-[var(--text-secondary)] mb-3">
          You've completed {completedCount} of {totalCount} activities in this course.
        </p>

        {/* Progress bar */}
        <div className="mb-5">
          <div className="h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand-magenta)] rounded-full transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="sr-only">{pct}% complete</p>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {opts.retry && (
            <ActionButton
              icon={RefreshCw}
              label="Try this lesson again"
              description="Clear your progress and start fresh"
              onClick={onRetry}
            />
          )}

          {opts.pickAnother && (
            <ActionButton
              icon={List}
              label="Choose another lesson"
              description="Browse available lessons in the sidebar"
              onClick={onPickAnother}
            />
          )}

          {opts.reviewProgress && (
            <ActionButton
              icon={BarChart3}
              label="Review my progress"
              description="See how you're doing across the course"
              onClick={onReviewProgress}
            />
          )}

          {opts.startOver && (
            <ActionButton
              icon={RotateCcw}
              label="Start the course over"
              description="Reset all progress and begin again"
              onClick={onStartOver}
            />
          )}

          {opts.continueAnyway && (
            confirmContinue ? (
              <div className="p-3 rounded-lg bg-[var(--bg-muted)] border border-[var(--border-default)]">
                <p className="text-xs text-[var(--text-secondary)] mb-2">
                  Are you sure? You may miss important content.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={onContinueAnyway}
                    className="px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md bg-[var(--brand-magenta)] text-white hover:opacity-90 cursor-pointer min-tap-target"
                  >
                    Yes, continue
                  </button>
                  <button
                    onClick={() => setConfirmContinue(false)}
                    className="px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
                  >
                    Go back
                  </button>
                </div>
              </div>
            ) : (
              <ActionButton
                icon={ArrowRight}
                label="Continue anyway"
                description="Move on without completing this lesson"
                onClick={() => setConfirmContinue(true)}
              />
            )
          )}
        </div>
      </div>
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  description,
  onClick
}: {
  icon: typeof RefreshCw
  label: string
  description: string
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left min-h-[56px] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
    >
      <Icon size={18} className="shrink-0 text-[var(--brand-magenta)]" />
      <div className="min-w-0">
        <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
      </div>
    </button>
  )
}
