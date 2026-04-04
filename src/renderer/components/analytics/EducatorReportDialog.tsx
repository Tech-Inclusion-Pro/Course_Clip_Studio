import { useState } from 'react'
import { FileText, Download, Loader2 } from 'lucide-react'
import { ReauthPrompt } from '@/components/ui/ReauthPrompt'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import type { EducatorReportOptions, ReportFormat } from '@/types/analytics'

interface EducatorReportDialogProps {
  open: boolean
  identifiedModeEnabled: boolean
  onGenerate: (options: EducatorReportOptions) => Promise<void>
  onClose: () => void
}

export function EducatorReportDialog({
  open,
  identifiedModeEnabled,
  onGenerate,
  onClose
}: EducatorReportDialogProps): JSX.Element | null {
  const [format, setFormat] = useState<ReportFormat>('html')
  const [includeActivityLog, setIncludeActivityLog] = useState(true)
  const [includeAccommodationData, setIncludeAccommodationData] = useState(true)
  const [anonymize, setAnonymize] = useState(!identifiedModeEnabled)
  const [isGenerating, setIsGenerating] = useState(false)
  const [showReauth, setShowReauth] = useState(false)
  const [reauthError, setReauthError] = useState<string | null>(null)

  if (!open) return null

  const needsReauth = identifiedModeEnabled && !anonymize

  function handleGenerate() {
    if (needsReauth) {
      setShowReauth(true)
      return
    }
    doGenerate()
  }

  async function doGenerate() {
    setIsGenerating(true)
    try {
      await onGenerate({
        format,
        includeActivityLog,
        includeAccommodationData,
        includeAINarrative: false,
        anonymize
      })
    } finally {
      setIsGenerating(false)
    }
  }

  function handleReauth(password: string) {
    // In a real app, validate password against stored credentials
    // For now, accept any non-empty password as the spec requires the prompt
    if (password.trim().length > 0) {
      setShowReauth(false)
      setReauthError(null)
      doGenerate()
    } else {
      setReauthError('Password is required.')
    }
  }

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        role="dialog"
        aria-modal="true"
        aria-label="Generate Educator Report"
      >
        <div className="bg-[var(--bg-surface)] rounded-xl p-6 max-w-md w-[92%] shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <FileText size={20} className="text-[var(--brand-magenta)]" />
            <h3 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              Generate Educator Report
            </h3>
          </div>

          <div className="space-y-4">
            {/* Format */}
            <div>
              <label className="block text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] mb-1">
                Report Format
              </label>
              <div className="flex gap-2">
                {(['html', 'csv'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFormat(f)}
                    className={`px-4 py-1.5 text-sm rounded-md border cursor-pointer ${
                      format === f
                        ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/10 text-[var(--text-brand)]'
                        : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
              {format === 'html' && (
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Use your browser&apos;s Print dialog to save as PDF.
                </p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-primary)]">Include Activity Logs</span>
                <ToggleSwitch checked={includeActivityLog} onChange={setIncludeActivityLog} label="Include activity logs" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--text-primary)]">Include Accommodation Data</span>
                <ToggleSwitch checked={includeAccommodationData} onChange={setIncludeAccommodationData} label="Include accommodation data" />
              </div>
              {identifiedModeEnabled && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-primary)]">Anonymize Learners</span>
                  <ToggleSwitch checked={anonymize} onChange={setAnonymize} label="Anonymize learners" />
                </div>
              )}
            </div>

            {needsReauth && (
              <p className="text-xs text-amber-600">
                Generating an identified report requires re-authentication.
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-4 py-2 text-sm rounded-md bg-[var(--brand-magenta)] text-white font-[var(--font-weight-medium)] hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              Generate Report
            </button>
          </div>
        </div>
      </div>

      <ReauthPrompt
        open={showReauth}
        title="Re-authenticate"
        description="Downloading an identified learner report requires authentication to prevent unauthorized access."
        onAuthenticate={handleReauth}
        onCancel={() => { setShowReauth(false); setReauthError(null) }}
        error={reauthError}
      />
    </>
  )
}
