// Shared helpers for mapping source responses into minimal CSL-JSON records.
import type { CslDate, CslName } from '@/types/citations'

export function yearToIssued(year?: number | string | null): CslDate | undefined {
  const y = typeof year === 'string' ? parseInt(year, 10) : year
  return y && !Number.isNaN(y) ? { 'date-parts': [[y]] } : undefined
}

/** Split a "Given Family" display name into a CSL name (best-effort). */
export function nameFromDisplay(display: string): CslName {
  const parts = display.trim().split(/\s+/)
  if (parts.length === 1) return { literal: display.trim() }
  return { given: parts.slice(0, -1).join(' '), family: parts[parts.length - 1] }
}

export function stripDoiPrefix(doi: string): string {
  return doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
}
