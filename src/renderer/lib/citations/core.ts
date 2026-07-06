// ─── CORE adapter ───
// Open-access full-text aggregator. Key REQUIRED (heavier); disabled by default.
// v3 search is a GET with a Bearer token. Docs: https://core.ac.uk/services/api

import type { CitationSourceRecord } from '@/types/citations'
import { citationGetJson } from './http'
import { yearToIssued, nameFromDisplay, stripDoiPrefix } from './csl-utils'

const BASE = 'https://api.core.ac.uk/v3' // verify-at-build

interface CoreWork {
  title?: string
  authors?: { name?: string }[]
  yearPublished?: number
  doi?: string
  publisher?: string
  abstract?: string
  downloadUrl?: string
}

function toCsl(w: CoreWork): CitationSourceRecord {
  return {
    id: w.doi || w.title || 'core-record',
    type: 'article-journal',
    title: w.title,
    author: (w.authors ?? []).map((a) => nameFromDisplay(a.name ?? '')),
    issued: yearToIssued(w.yearPublished),
    DOI: w.doi,
    publisher: w.publisher,
    URL: w.downloadUrl,
    abstract: w.abstract,
    retrievedFrom: 'core'
  }
}

function auth(apiKey: string): Record<string, string> {
  return { Authorization: `Bearer ${apiKey}` }
}

export async function search(
  query: string,
  apiKey: string,
  limit = 10
): Promise<CitationSourceRecord[]> {
  const url = `${BASE}/search/works?q=${encodeURIComponent(query)}&limit=${limit}`
  const data = await citationGetJson<{ results?: CoreWork[] }>(url, auth(apiKey))
  return (data.results ?? []).map(toCsl)
}

export async function lookupByDoi(
  doi: string,
  apiKey: string
): Promise<CitationSourceRecord | null> {
  const results = await search(`doi:"${stripDoiPrefix(doi)}"`, apiKey, 1).catch(() => [])
  return results[0] ?? null
}
