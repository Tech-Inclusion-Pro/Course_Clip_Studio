// ─── Custom citation source adapter ───
// User-defined scholarly API (spec §13.2). Mirrors the Visual APIs custom
// provider: caller supplies an endpoint + optional auth header. We assume the
// endpoint accepts a `query` param and returns CSL-JSON (an array, or {items:[]}).

import type { CitationSourceProvider, CitationSourceRecord } from '@/types/citations'
import { citationGetJson } from './http'

function authHeaders(provider: CitationSourceProvider): Record<string, string> {
  if (provider.apiKey && provider.headerName) {
    return { [provider.headerName]: `${provider.headerValuePrefix ?? ''}${provider.apiKey}` }
  }
  return {}
}

function coerceRecords(data: unknown): CitationSourceRecord[] {
  const items = Array.isArray(data)
    ? data
    : ((data as { items?: unknown[]; results?: unknown[] })?.items ??
      (data as { results?: unknown[] })?.results ??
      [])
  return (items as Record<string, unknown>[]).map((r, i) => ({
    id: (r.DOI as string) || (r.id as string) || `custom-${i}`,
    type: (r.type as string) || 'article-journal',
    title: (r.title as string) ?? undefined,
    author: r.author as CitationSourceRecord['author'],
    issued: r.issued as CitationSourceRecord['issued'],
    DOI: r.DOI as string | undefined,
    URL: r.URL as string | undefined,
    'container-title': r['container-title'] as string | undefined,
    retrievedFrom: 'custom'
  }))
}

export async function search(
  provider: CitationSourceProvider,
  query: string
): Promise<CitationSourceRecord[]> {
  if (!provider.endpoint) return []
  const sep = provider.endpoint.includes('?') ? '&' : '?'
  const url = `${provider.endpoint}${sep}query=${encodeURIComponent(query)}`
  const data = await citationGetJson(url, authHeaders(provider))
  return coerceRecords(data)
}

export async function lookupByDoi(
  provider: CitationSourceProvider,
  doi: string
): Promise<CitationSourceRecord | null> {
  const records = await search(provider, doi)
  return records[0] ?? null
}
