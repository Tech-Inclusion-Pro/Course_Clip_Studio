/**
 * Tier 2 — human-reviewed claim check (spec §6.2).
 *
 * Renders the resolved source and Tier-1 status inside TippyReasoningPanel, then
 * lets a human record whether the source supports a claim. The app stores the human
 * decision; it never asserts support itself. Badges pair an icon WITH text (never
 * colour alone) and announce changes via aria-live.
 */

import { CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { TippyReasoningPanel } from './TippyReasoningPanel'
import { buildClaimCheckReasoning } from '@/lib/citations/verify'
import type { CitationSourceRecord, ClaimReview, Tier1Result } from '@/types/citations'

interface Props {
  record: CitationSourceRecord
  claim: string
  tier1: Tier1Result
  apa?: string
  review?: ClaimReview
  onReview: (review: ClaimReview) => void
}

const REVIEW_META: Record<
  Exclude<ClaimReview, 'abstract_unavailable'>,
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  human_supported: { label: 'Supports the claim', icon: CheckCircle2, color: '#2e7d32' },
  human_rejected: { label: 'Does not support', icon: XCircle, color: '#d32f2f' },
  unclear: { label: 'Unclear', icon: HelpCircle, color: '#ed6c02' }
}

const CHOICES: { value: ClaimReview; label: string; icon: typeof CheckCircle2 }[] = [
  { value: 'human_supported', label: 'Supports', icon: CheckCircle2 },
  { value: 'human_rejected', label: "Doesn't support", icon: XCircle },
  { value: 'unclear', label: 'Unclear', icon: HelpCircle }
]

export function CitationClaimCheck({
  record,
  claim,
  tier1,
  apa,
  review,
  onReview
}: Props): JSX.Element {
  const reasoning = buildClaimCheckReasoning(record, claim, tier1, apa)
  const current = review && review !== 'abstract_unavailable' ? REVIEW_META[review] : null

  return (
    <div className="space-y-3">
      <TippyReasoningPanel reasoning={reasoning} />

      <fieldset className="border border-[var(--border-default)] rounded-lg p-3">
        <legend className="px-1 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
          Does this source support the claim?
        </legend>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Claim review decision">
          {CHOICES.map(({ value, label, icon: Icon }) => {
            const selected = review === value
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onReview(value)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border cursor-pointer min-h-[44px] focus:outline-none focus:ring-[3px] focus:ring-[var(--ring-brand)] ${
                  selected
                    ? 'border-[var(--color-brand-600,#6f2fa6)] bg-[var(--bg-hover)] text-[var(--text-primary)]'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </button>
            )
          })}
        </div>

        <div aria-live="polite" className="mt-2 min-h-[20px] text-xs">
          {current && (
            <span className="inline-flex items-center gap-1.5" style={{ color: current.color }}>
              <current.icon size={14} aria-hidden="true" />
              <span className="text-[var(--text-secondary)]">Recorded: {current.label}</span>
            </span>
          )}
        </div>
      </fieldset>
    </div>
  )
}
