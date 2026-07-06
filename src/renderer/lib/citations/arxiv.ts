// ─── arXiv adapter ───
// Preprints. Keyless. Returns an Atom XML feed, parsed with fast-xml-parser.
// Docs: https://info.arxiv.org/help/api  // verify-at-build

import { XMLParser } from 'fast-xml-parser'
import type { CitationSourceRecord } from '@/types/citations'
import { citationRequest } from './http'
import { nameFromDisplay } from './csl-utils'

const BASE = 'https://export.arxiv.org/api/query' // verify-at-build
const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true })

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

interface ArxivEntry {
  title?: string
  author?: { name?: string } | { name?: string }[]
  published?: string
  id?: string
  doi?: string
  summary?: string
}

function toCsl(e: ArxivEntry): CitationSourceRecord {
  const year = e.published ? parseInt(e.published.slice(0, 4), 10) : undefined
  return {
    id: e.doi || e.id || e.title || 'arxiv-record',
    type: 'article',
    title: (e.title ?? '').replace(/\s+/g, ' ').trim(),
    author: asArray(e.author).map((a) => nameFromDisplay(a.name ?? '')),
    issued: year ? { 'date-parts': [[year]] } : undefined,
    DOI: e.doi,
    URL: e.id,
    abstract: e.summary?.trim(),
    'container-title': 'arXiv',
    retrievedFrom: 'arxiv'
  }
}

export async function search(query: string, maxResults = 10): Promise<CitationSourceRecord[]> {
  const url = `${BASE}?search_query=${encodeURIComponent(`all:${query}`)}&max_results=${maxResults}`
  const res = await citationRequest({ url })
  if (res.status < 200 || res.status >= 300) return []
  const feed = parser.parse(res.body)?.feed
  return asArray<ArxivEntry>(feed?.entry).map(toCsl)
}

/** arXiv isn't indexed by DOI; fall back to a DOI-as-query search. */
export async function lookupByDoi(doi: string): Promise<CitationSourceRecord | null> {
  const results = await search(doi, 1).catch(() => [])
  return results[0] ?? null
}
