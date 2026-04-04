import { useState } from 'react'
import { Lock } from 'lucide-react'

interface ReauthPromptProps {
  open: boolean
  title: string
  description: string
  onAuthenticate: (password: string) => void
  onCancel: () => void
  error?: string | null
}

/**
 * Re-authentication prompt for accessing sensitive data exports.
 * Per the spec: "Downloading the Educator Learner Progress Report
 * requires the author to re-authenticate (password prompt) to
 * prevent unauthorized access."
 */
export function ReauthPrompt({
  open,
  title,
  description,
  onAuthenticate,
  onCancel,
  error
}: ReauthPromptProps): JSX.Element | null {
  const [password, setPassword] = useState('')

  if (!open) return null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.trim()) {
      onAuthenticate(password)
      setPassword('')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="bg-[var(--bg-surface)] rounded-xl p-6 max-w-sm w-[92%] shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Lock size={20} className="text-[var(--brand-magenta)]" />
          <h3 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {title}
          </h3>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-4">
          {description}
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="reauth-password" className="block text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] mb-1">
            Password
          </label>
          <input
            id="reauth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] mb-2"
            placeholder="Enter your password"
          />

          {error && (
            <p className="text-xs text-red-600 mb-2" role="alert">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={() => { setPassword(''); onCancel() }}
              className="px-4 py-2 text-sm rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!password.trim()}
              className="px-4 py-2 text-sm rounded-md bg-[var(--brand-magenta)] text-white font-[var(--font-weight-medium)] hover:opacity-90 disabled:opacity-50 cursor-pointer"
            >
              Authenticate
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
