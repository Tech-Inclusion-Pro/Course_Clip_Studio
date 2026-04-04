import { AlertTriangle } from 'lucide-react'

interface FerpaIdentifiedWarningModalProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  feature: string
  description: string
}

export function FerpaIdentifiedWarningModal({
  open,
  onConfirm,
  onCancel,
  feature,
  description
}: FerpaIdentifiedWarningModalProps): JSX.Element | null {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={`FERPA warning for ${feature}`}
    >
      <div className="bg-[var(--bg-surface)] rounded-xl p-6 max-w-md w-[92%] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle size={20} className="text-amber-500 shrink-0" />
          <h3 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            FERPA Compliance Notice
          </h3>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-3">
          {description}
        </p>

        <div className="p-3 rounded-md bg-amber-50 border border-amber-200 mb-4">
          <p className="text-xs text-amber-800">
            Enabling <strong>{feature}</strong> stores learner names alongside performance data.
            Ensure your institution&apos;s FERPA policy permits this and that your data storage
            practices comply with applicable privacy regulations.
          </p>
        </div>

        <p className="text-xs text-[var(--text-tertiary)] mb-6">
          You can disable this setting at any time to return to anonymized reporting.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded-md bg-amber-500 text-white font-[var(--font-weight-medium)] hover:bg-amber-600 cursor-pointer"
          >
            I Acknowledge &mdash; Enable
          </button>
        </div>
      </div>
    </div>
  )
}
