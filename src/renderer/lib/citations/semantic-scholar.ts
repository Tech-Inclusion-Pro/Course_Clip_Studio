// ─── Semantic Scholar adapter ───
// Keyless pool; a private key (x-api-key) lifts the rate limit. Provides TLDRs.
// Docs: https://api.semanticscholar.org  // verify-at-build

import type { CitationSourceRecord } from '@/types/citations'
import { citationGetJson } from './http'
import { yearToIssued, nameFromDisplay, stripDoiPrefix } from './csl-utils'

const BASE = 'https://api.semanticscholar.org/graph/v1' // verify-at-build
const FIELDS = 'title,authors,year,externalIds,venue,abstract'

interface S2Paper {
  title?: string
  authors?: { name?: string }[]
  year?: number
  venue?: string
  abstract?: string
  externalIds?: { DOI?: string }
}

function toCsl(p: S2Paper): CitationSourceRecord {
  return {
    id: p.externalIds?.DOI || p.title || 'semanticScholar-record',
    type: 'article-journal',
    title: p.title,
    author: (p.authors ?? []).map((a) => nameFromDisplay(a.name ?? '')),
    issued: yearToIssued(p.year),
    DOI: p.externalIds?.DOI,
    'container-title': p.venue,
    abstract: p.abstract,
    retrievedFrom: 'semanticScholar'
  }
}

function headers(apiKey: string | null): Record<string, string> {
  return apiKey ? { 'x-api-key': apiKey } : {}
}

export async function lookupByDoi(
  doi: string,
  apiKey: string | null = null
): Promise<CitationSourceRecord | null> {
  const url = `${BASE}/paper/DOI:${encodeURIComponent(stripDoiPrefix(doi))}?fields=${FIELDS}`
  try {
    return toCsl(await citationGetJson<S2Paper>(url, headers(apiKey)))
  } catch {
    return null
  }
}

export async function search(
  query: string,
  apiKey: string | null = null,
  limit = 10
): Promise<CitationSourceRecord[]> {
  const url = `${BASE}/paper/search?query=${encodeURIComponent(query)}&limit=${limit}&fields=${FIELDS}`
  const data = await citationGetJson<{ data?: S2Paper[] }>(url, headers(apiKey))
  return (data.data ?? []).map(toCsl)
}
