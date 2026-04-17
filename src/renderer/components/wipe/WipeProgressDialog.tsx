import { useEffect, useRef } from 'react'

interface WipeProgressDialogProps {
  onConfirm: () => void
  onCancel: () => void
}

export function WipeProgressDialog({ onConfirm, onCancel }: WipeProgressDialogProps): JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="wipe-title"
        aria-describedby="wipe-body"
        tabIndex={-1}
        className="w-full max-w-sm mx-4 rounded-xl shadow-xl bg-[var(--bg-surface)] p-6 focus:outline-none"
      >
        <h2
          id="wipe-title"
          className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2"
        >
          Clear this lesson's progress?
        </h2>

        <p
          id="wipe-body"
          className="text-sm text-[var(--text-secondary)] mb-5"
        >
          This will reset your answers and score for this lesson. Your progress in other lessons won't change.
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-[var(--font-weight-medium)] rounded-lg bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-[var(--font-weight-medium)] rounded-lg bg-[var(--color-danger-600)] text-white hover:bg-[var(--color-danger-500)] cursor-pointer min-tap-target"
          >
            Yes, clear this lesson
          </button>
        </div>
      </div>
    </div>
  )
}
