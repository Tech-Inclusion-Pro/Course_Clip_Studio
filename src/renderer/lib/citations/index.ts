// ─── Unified citation source client ───
// Mirrors src/renderer/lib/stock-api.ts: per-source adapter modules plus a
// switch-based dispatcher and an enabled-provider selector.

import type { CitationSourceProvider, CitationSourceRecord } from '@/types/citations'
import * as crossref from './crossref'
import * as custom from './custom'

export * from './http'
export { crossref, custom }

/** First enabled provider, preferring keyless built-ins; custom needs an endpoint. */
export function getFirstEnabledCitationProvider(
  providers: CitationSourceProvider[]
): CitationSourceProvider | null {
  return (
    providers.find((p) => p.enabled && (p.type !== 'custom' || !!p.endpoint)) ?? null
  )
}

/** Resolve a DOI to a CSL-JSON record using the given provider. */
export async function lookupByDoi(
  provider: CitationSourceProvider,
  doi: string
): Promise<CitationSourceRecord | null> {
  switch (provider.type) {
    case 'crossref':
    case 'datacite': // DataCite resolves via the same content-negotiation path for now
    case 'openalex':
      return crossref.lookupByDoi(doi, provider.contactEmail)
    case 'custom':
      return custom.lookupByDoi(provider, doi)
    default:
      return null
  }
}

/** Free-text search using the given provider. */
export async function searchCitations(
  provider: CitationSourceProvider,
  query: string
): Promise<CitationSourceRecord[]> {
  switch (provider.type) {
    case 'crossref':
    case 'datacite':
    case 'openalex':
      return crossref.search(query, provider.contactEmail)
    case 'custom':
      return custom.search(provider, query)
    default:
      return []
  }
}
