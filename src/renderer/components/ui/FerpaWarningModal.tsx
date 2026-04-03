import { useEffect, useRef } from 'react'
import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FerpaWarningModalProps {
  open: boolean
  provider: 'anthropic' | 'openai'
  featureLabel: string
  onAcknowledge: () => void
  onCancel: () => void
}

const PROVIDER_LABELS: Record<string, string> = {
  anthropic: 'Anthropic (Claude)',
  openai: 'OpenAI (GPT)'
}

/**
 * Non-dismissible FERPA compliance warning modal.
 * Shown once per course per AI feature when using a cloud provider.
 * Must be explicitly acknowledged or cancelled — no backdrop dismiss.
 */
export function FerpaWarningModal({
  open,
  provider,
  featureLabel,
  onAcknowledge,
  onCancel
}: FerpaWarningModalProps): JSX.Element | null {
  const acknowledgeRef = useRef<HTMLButtonElement>(null)

  // Trap focus on open
  useEffect(() => {
    if (open) {
      acknowledgeRef.current?.focus()
    }
  }, [open])

  // Block Escape — modal is non-dismissible (must choose a button)
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="ferpa-title"
      aria-describedby="ferpa-desc"
    >
      <div className="w-full max-w-lg mx-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-800">
          <ShieldAlert size={24} className="text-amber-600 dark:text-amber-400 shrink-0" />
          <h2
            id="ferpa-title"
            className="text-base font-[var(--font-weight-semibold)] text-amber-900 dark:text-amber-100"
          >
            FERPA Compliance Warning
          </h2>
        </div>

        {/* Body */}
        <div id="ferpa-desc" className="px-5 py-4 space-y-3">
          <p className="text-sm text-[var(--text-primary)]">
            <strong>{featureLabel}</strong> will send learner data to{' '}
            <strong>{PROVIDER_LABELS[provider] ?? provider}</strong>, a cloud-based AI service.
          </p>

          <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
              Under FERPA (Family Educational Rights and Privacy Act), transmitting
              personally identifiable student information to third-party cloud services
              requires appropriate safeguards. By proceeding, you confirm that:
            </p>
            <ul className="mt-2 space-y-1 text-xs text-amber-800 dark:text-amber-200 list-disc pl-4">
              <li>Your institution has authorized the use of this AI provider for educational purposes</li>
              <li>Appropriate data protection agreements are in place with the provider</li>
              <li>Learner data transmitted will be limited to what is necessary for the feature</li>
              <li>You understand that student responses/content will be processed externally</li>
            </ul>
          </div>

          <p className="text-xs text-[var(--text-tertiary)]">
            To avoid sending data to cloud services, switch to <strong>Ollama (local)</strong> in
            Settings &gt; AI Provider. Local AI processing is FERPA-safe.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-[var(--border-default)] bg-[var(--bg-muted)]">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            ref={acknowledgeRef}
            variant="primary"
            size="sm"
            onClick={onAcknowledge}
          >
            I Acknowledge &amp; Proceed
          </Button>
        </div>
      </div>
    </div>
  )
}
