// ─── Unified citation source client ───
// Mirrors src/renderer/lib/stock-api.ts: per-source adapter modules plus a
// switch-based dispatcher and an enabled-provider selector.

import type { CitationSourceProvider, CitationSourceRecord } from '@/types/citations'
import * as crossref from './crossref'
import * as custom from './custom'
import * as semanticScholar from './semantic-scholar'
import * as europepmc from './europepmc'
import * as unpaywall from './unpaywall'
import * as arxiv from './arxiv'
import * as core from './core'

export * from './http'
export { crossref, custom, semanticScholar, europepmc, unpaywall, arxiv, core }

// Sources that cannot be used without an API key (spec §4.1 / §11).
const KEY_REQUIRED: ReadonlySet<CitationSourceProvider['type']> = new Set(['openalex', 'core'])

/** Whether a provider is actually usable (enabled + any required key/endpoint present). */
export function isProviderUsable(p: CitationSourceProvider): boolean {
  if (!p.enabled) return false
  if (KEY_REQUIRED.has(p.type) && !p.apiKey) return false
  if (p.type === 'custom' && !p.endpoint) return false
  return true
}

/** First usable provider, preferring keyless built-ins. */
export function getFirstEnabledCitationProvider(
  providers: CitationSourceProvider[]
): CitationSourceProvider | null {
  return providers.find(isProviderUsable) ?? null
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
    case 'semanticScholar':
      return semanticScholar.lookupByDoi(doi, provider.apiKey)
    case 'pubmed':
      return europepmc.lookupByDoi(doi)
    case 'unpaywall':
      return unpaywall.lookupByDoi(doi, provider.contactEmail)
    case 'arxiv':
      return arxiv.lookupByDoi(doi)
    case 'core':
      return provider.apiKey ? core.lookupByDoi(doi, provider.apiKey) : null
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
    case 'semanticScholar':
      return semanticScholar.search(query, provider.apiKey)
    case 'pubmed':
      return europepmc.search(query)
    case 'arxiv':
      return arxiv.search(query)
    case 'core':
      return provider.apiKey ? core.search(query, provider.apiKey) : []
    case 'unpaywall':
      return [] // Unpaywall is DOI-only; no free-text search
    case 'custom':
      return custom.search(provider, query)
    default:
      return []
  }
}
