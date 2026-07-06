// ─── Unpaywall adapter ───
// Open-access full-text locator. Keyless but requires an email param (polite pool).
// DOI-only (Unpaywall is keyed by DOI). Docs: https://unpaywall.org/products/api

import type { CitationSourceRecord } from '@/types/citations'
import { citationGetJson } from './http'
import { yearToIssued, stripDoiPrefix } from './csl-utils'

const BASE = 'https://api.unpaywall.org/v2' // verify-at-build

interface UnpaywallResponse {
  title?: string
  year?: number
  doi?: string
  journal_name?: string
  publisher?: string
  z_authors?: { family?: string; given?: string }[]
  best_oa_location?: { url_for_pdf?: string; url?: string } | null
}

function toCsl(r: UnpaywallResponse): CitationSourceRecord {
  return {
    id: r.doi || r.title || 'unpaywall-record',
    type: 'article-journal',
    title: r.title,
    author: (r.z_authors ?? []).map((a) => ({ family: a.family, given: a.given })),
    issued: yearToIssued(r.year),
    DOI: r.doi,
    'container-title': r.journal_name,
    publisher: r.publisher,
    URL: r.best_oa_location?.url_for_pdf ?? r.best_oa_location?.url,
    retrievedFrom: 'unpaywall'
  }
}

/** Unpaywall needs a contact email; without one the lookup is skipped. */
export async function lookupByDoi(
  doi: string,
  contactEmail?: string
): Promise<CitationSourceRecord | null> {
  if (!contactEmail) return null
  const url = `${BASE}/${encodeURIComponent(stripDoiPrefix(doi))}?email=${encodeURIComponent(
    contactEmail
  )}`
  try {
    return toCsl(await citationGetJson<UnpaywallResponse>(url))
  } catch {
    return null
  }
}
