/**
 * FERPA Cloud Provider Warning
 *
 * Non-dismissible warning shown before TIPPY sends any query to a cloud
 * AI provider when the conversation may contain learner data. The author
 * must explicitly acknowledge before proceeding.
 *
 * This warning recommends switching to local Ollama for privacy-sensitive work.
 */

import { useEffect, useRef } from 'react'

interface Props {
  providerName: string
  actionDescription: string
  onAcknowledge: () => void
  onCancel: () => void
  onSwitchToOllama?: () => void
}

export function FerpaCloudWarning({
  providerName,
  actionDescription,
  onAcknowledge,
  onCancel,
  onSwitchToOllama
}: Props): JSX.Element {
  const panelRef = useRef<HTMLDivElement>(null)

  // Focus trap on mount
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  // Escape key to cancel
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
    >
      <div
        ref={panelRef}
        role="alertdialog"
        aria-modal="true"
        aria-label="FERPA Privacy Warning"
        tabIndex={-1}
        className="w-full max-w-md mx-4 rounded-xl shadow-xl p-5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid #d32f2f'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#d32f2f"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <h2 className="text-base font-bold" style={{ color: '#d32f2f' }}>
            FERPA Privacy Warning
          </h2>
        </div>

        {/* Body */}
        <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
          <p>
            You are about to <strong>{actionDescription}</strong> using{' '}
            <strong>{providerName}</strong>, a cloud-based AI provider.
          </p>

          <p style={{ color: 'var(--text-secondary)' }}>
            If your conversation includes learner names, IDs, response text, or other
            personally identifiable information, sending this data to a cloud service
            may violate FERPA regulations.
          </p>

          <div
            className="p-3 rounded-lg text-xs"
            style={{
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border-default)'
            }}
          >
            <strong>Recommendation:</strong> Use a local AI provider (Ollama) for
            any work involving learner data. You can configure Ollama in
            Settings &gt; AI/LLM.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={onAcknowledge}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: '#d32f2f',
              color: '#fff',
              border: 'none',
              cursor: 'pointer'
            }}
            type="button"
          >
            I understand the risks — proceed with {providerName}
          </button>

          {onSwitchToOllama && (
            <button
              onClick={onSwitchToOllama}
              className="w-full px-4 py-2 rounded-lg text-sm font-medium"
              style={{
                backgroundColor: 'var(--brand-indigo)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer'
              }}
              type="button"
            >
              Switch to Ollama (local, private)
            </button>
          )}

          <button
            onClick={onCancel}
            className="w-full px-4 py-2 rounded-lg text-sm font-medium"
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-default)',
              cursor: 'pointer'
            }}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
