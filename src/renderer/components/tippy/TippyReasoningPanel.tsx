/**
 * TIPPY Reasoning Transparency Panel
 *
 * "How does TIPPY reason?" — expandable disclosure on every substantive
 * assistant response. Shows sources, confidence, limitations, and human
 * review requirements.
 *
 * Uses the HTML <details>/<summary> pattern with ARIA for accessibility.
 */

import { useState } from 'react'
import type { TippyReasoningData, TippyConfidenceLevel } from '@/types/analytics'

interface Props {
  reasoning: TippyReasoningData
  /** Whether this is the first few uses in a course (show full AI note) */
  showFullAINote?: boolean
}

const CONFIDENCE_LABELS: Record<TippyConfidenceLevel, string> = {
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  uncertain: 'Uncertain'
}

const CONFIDENCE_COLORS: Record<TippyConfidenceLevel, string> = {
  high: '#2e7d32',
  medium: '#ed6c02',
  low: '#d32f2f',
  uncertain: '#9e9e9e'
}

const AI_NOTE = `TIPPY uses AI to support — not replace — human judgment in accessibility and inclusion work. AI systems can identify patterns, apply standards, and surface issues, but they can also miss context, misread intent, and reflect the biases of their training data. Every TIPPY recommendation requires a human decision. Standards like WCAG and frameworks like UDL exist to protect people — treat AI-generated accessibility assessments as a starting point, not a final answer.`

export function TippyReasoningPanel({ reasoning, showFullAINote = false }: Props): JSX.Element {
  const [aiNoteExpanded, setAINoteExpanded] = useState(false)

  return (
    <details
      className="mt-2 rounded-lg text-xs"
      style={{
        backgroundColor: 'var(--bg-muted)',
        border: '1px solid var(--border-default)'
      }}
    >
      <summary
        className="cursor-pointer px-3 py-2 font-medium select-none"
        style={{ color: 'var(--text-secondary)' }}
      >
        How does TIPPY reason?
      </summary>

      <div className="px-3 pb-3 space-y-3">
        {/* Sources */}
        {reasoning.sources.length > 0 && (
          <Section title="Sources">
            <ul className="list-disc pl-4 space-y-0.5">
              {reasoning.sources.map((s, i) => (
                <li key={i} style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                    {s.label}
                  </span>
                  {s.reference && (
                    <span style={{ color: 'var(--text-tertiary)' }}> — {s.reference}</span>
                  )}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Confidence */}
        <Section title="Confidence">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">Overall:</span>
            <span
              className="px-1.5 py-0.5 rounded font-semibold"
              style={{
                color: '#fff',
                backgroundColor: CONFIDENCE_COLORS[reasoning.overallConfidence]
              }}
            >
              {CONFIDENCE_LABELS[reasoning.overallConfidence]}
            </span>
          </div>
          {reasoning.confidenceBreakdown.length > 0 && (
            <div className="space-y-1 mt-1">
              {reasoning.confidenceBreakdown.map((cb, i) => (
                <div key={i} className="flex gap-2">
                  <span
                    className="shrink-0 w-16 text-right font-medium"
                    style={{ color: CONFIDENCE_COLORS[cb.level] }}
                  >
                    {CONFIDENCE_LABELS[cb.level]}
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {cb.category}:
                    </span>{' '}
                    {cb.explanation}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Limitations */}
        {reasoning.limitations.length > 0 && (
          <Section title="Limitations">
            <ul className="list-disc pl-4 space-y-0.5">
              {reasoning.limitations.map((lim, i) => (
                <li key={i} style={{ color: 'var(--text-secondary)' }}>
                  {lim}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Human Review Required */}
        {reasoning.humanReviewRequired.length > 0 && (
          <Section title="Human Review Required">
            <ul className="list-disc pl-4 space-y-0.5">
              {reasoning.humanReviewRequired.map((hr, i) => (
                <li key={i} style={{ color: 'var(--text-secondary)' }}>
                  {hr}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* AI Note */}
        {showFullAINote ? (
          <div
            className="p-2 rounded text-xs italic leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-tertiary)',
              borderLeft: '3px solid var(--brand-indigo)'
            }}
          >
            {AI_NOTE}
          </div>
        ) : (
          <button
            className="text-xs underline cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
            onClick={() => setAINoteExpanded(!aiNoteExpanded)}
            type="button"
          >
            {aiNoteExpanded ? 'Hide' : 'Why does TIPPY say this?'}
          </button>
        )}
        {!showFullAINote && aiNoteExpanded && (
          <div
            className="p-2 rounded text-xs italic leading-relaxed"
            style={{
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-tertiary)',
              borderLeft: '3px solid var(--brand-indigo)'
            }}
          >
            {AI_NOTE}
          </div>
        )}
      </div>
    </details>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <div
        className="text-[10px] uppercase tracking-wider font-semibold mb-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {title}
      </div>
      {children}
    </div>
  )
}
