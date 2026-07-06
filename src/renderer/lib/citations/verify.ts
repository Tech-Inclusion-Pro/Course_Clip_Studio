// ─── Two-tier source verification (spec §6) ───
//
// Tier 1 (default ON, local, deterministic): resolve a DOI and confirm it matches
// the claimed title / first author / year.
// Tier 2 (opt-in): render the claim + source in TippyReasoningPanel for a HUMAN to
// judge. The app records the human decision — it never asserts support itself.

import type {
  CitationSourceRecord,
  DoiVerification,
  Tier1Result
} from '@/types/citations'
import type {
  TippyReasoningData,
  TippyConfidenceLevel
} from '@/types/analytics'
import { lookupByDoi } from './crossref'

/** Lowercase, strip diacritics + non-alphanumerics for lenient comparison. */
function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function recordYear(record: CitationSourceRecord): number | undefined {
  return record.issued?.['date-parts']?.[0]?.[0]
}

function firstAuthorFamily(record: CitationSourceRecord): string | undefined {
  const a = record.author?.[0]
  return a?.family ?? a?.literal
}

export interface ExpectedMetadata {
  title?: string
  firstAuthorFamily?: string
  year?: number
}

/**
 * Tier 1 — deterministic DOI validation. Resolves the DOI (Crossref) and, when
 * expected metadata is supplied, confirms title / first-author / year agreement.
 * States: verified | mismatch | not_found | no_doi.
 */
export async function verifyDoi(
  doi: string | undefined,
  expected?: ExpectedMetadata,
  contactEmail?: string
): Promise<Tier1Result> {
  if (!doi || !doi.trim()) return { state: 'no_doi' }

  const record = await lookupByDoi(doi, contactEmail)
  if (!record) return { state: 'not_found' }

  const resolvedTitle = record.title
  const resolvedFirstAuthor = firstAuthorFamily(record)
  const resolvedYear = recordYear(record)

  let state: DoiVerification = 'verified'
  if (expected) {
    const titleOk =
      !expected.title ||
      (!!resolvedTitle && normalize(resolvedTitle).includes(normalize(expected.title).slice(0, 40)))
    const authorOk =
      !expected.firstAuthorFamily ||
      (!!resolvedFirstAuthor &&
        normalize(resolvedFirstAuthor) === normalize(expected.firstAuthorFamily))
    // Allow ±1 year (online-first vs print) before flagging a mismatch.
    const yearOk =
      expected.year == null ||
      resolvedYear == null ||
      Math.abs(resolvedYear - expected.year) <= 1
    if (!titleOk || !authorOk || !yearOk) state = 'mismatch'
  }

  return { state, resolvedTitle, resolvedFirstAuthor, resolvedYear }
}

function confidenceForTier1(state: DoiVerification): TippyConfidenceLevel {
  switch (state) {
    case 'verified':
      return 'high'
    case 'mismatch':
      return 'low'
    case 'not_found':
      return 'uncertain'
    case 'no_doi':
      return 'uncertain'
  }
}

const TIER1_EXPLANATION: Record<DoiVerification, string> = {
  verified: 'The DOI resolves and its title, first author, and year match the reference.',
  mismatch: 'The DOI resolves but its metadata does not match the reference. Compare them carefully.',
  not_found: 'The DOI could not be resolved. The reference may be mistyped or unregistered.',
  no_doi: 'No DOI was provided, so automatic validation was skipped.'
}

/**
 * Tier 2 — build the reasoning payload for TippyReasoningPanel. The panel presents
 * the source + Tier-1 status and asks the human to judge whether the source supports
 * the claim. `humanReviewRequired` is always non-empty: the decision is theirs.
 */
export function buildClaimCheckReasoning(
  record: CitationSourceRecord,
  claim: string,
  tier1: Tier1Result,
  apa?: string
): TippyReasoningData {
  const reference = record.DOI ? `https://doi.org/${record.DOI}` : record.URL
  const label = apa || record.title || record.id

  return {
    sources: [{ label, type: 'standard', reference }],
    overallConfidence: confidenceForTier1(tier1.state),
    confidenceBreakdown: [
      {
        category: 'DOI verification',
        level: confidenceForTier1(tier1.state),
        explanation: TIER1_EXPLANATION[tier1.state]
      }
    ],
    limitations: [
      'The app does not judge whether this source supports the claim — that is a human decision.',
      record.abstract
        ? 'Only the abstract was retrieved; the full text may qualify or contradict the claim.'
        : 'No abstract was available, so review the source directly.'
    ],
    humanReviewRequired: [
      `Confirm this source actually supports the claim: “${claim}”.`,
      'Read the abstract or full text and mark whether it supports, does not support, or is unclear.'
    ]
  }
}
