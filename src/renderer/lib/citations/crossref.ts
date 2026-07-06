// ─── Crossref adapter ───
// DOI + metadata backbone. Keyless; uses the "polite pool" via a mailto param
// and a descriptive User-Agent when a contact email is configured.
// Docs: https://api.crossref.org  // verify-at-build

import type { CitationSourceRecord, CslName } from '@/types/citations'
import { citationGetJson } from './http'

const BASE_URL = 'https://api.crossref.org' // verify-at-build

function politeParam(contactEmail?: string): string {
  return contactEmail ? `?mailto=${encodeURIComponent(contactEmail)}` : ''
}

function politeHeaders(contactEmail?: string): Record<string, string> {
  // Crossref asks tools to identify themselves; harmless when email is absent.
  const ua = contactEmail
    ? `CourseClipStudio/0.1.0 (mailto:${contactEmail})`
    : 'CourseClipStudio/0.1.0'
  return { 'User-Agent': ua }
}

/** Map a Crossref `message` object to our minimal CSL-JSON record. */
export function crossrefToCsl(msg: Record<string, unknown>): CitationSourceRecord {
  const authors = Array.isArray(msg.author)
    ? (msg.author as Record<string, string>[]).map((a): CslName => {
        // Crossref exposes ORCID + an authenticated-orcid flag on each author.
        const orcid = a.ORCID || (a as Record<string, unknown>)['authenticated-orcid']
        return {
          family: a.family,
          given: a.given,
          literal: a.name,
          ORCID: typeof orcid === 'string' ? orcid : undefined
        }
      })
    : undefined
  const issued = (msg.issued as { 'date-parts'?: number[][] } | undefined)?.['date-parts']
  const title = Array.isArray(msg.title) ? (msg.title as string[])[0] : (msg.title as string)
  const container = Array.isArray(msg['container-title'])
    ? (msg['container-title'] as string[])[0]
    : (msg['container-title'] as string | undefined)

  return {
    id: (msg.DOI as string) || (msg.URL as string) || title || 'crossref-record',
    type: (msg.type as string) || 'article-journal',
    title,
    author: authors,
    issued: issued ? { 'date-parts': issued } : undefined,
    DOI: msg.DOI as string | undefined,
    URL: msg.URL as string | undefined,
    'container-title': container,
    publisher: msg.publisher as string | undefined,
    volume: msg.volume as string | undefined,
    issue: msg.issue as string | undefined,
    page: msg.page as string | undefined,
    abstract: msg.abstract as string | undefined,
    retrievedFrom: 'crossref'
  }
}

/** Resolve a single DOI to a CSL-JSON record, or null if not found. */
export async function lookupByDoi(
  doi: string,
  contactEmail?: string
): Promise<CitationSourceRecord | null> {
  const clean = doi.trim().replace(/^https?:\/\/(dx\.)?doi\.org\//i, '')
  const url = `${BASE_URL}/works/${encodeURIComponent(clean)}${politeParam(contactEmail)}`
  try {
    const data = await citationGetJson<{ message?: Record<string, unknown> }>(
      url,
      politeHeaders(contactEmail)
    )
    return data.message ? crossrefToCsl(data.message) : null
  } catch {
    return null
  }
}

/** Free-text search returning ranked CSL-JSON records. */
export async function search(
  query: string,
  contactEmail?: string,
  rows = 10
): Promise<CitationSourceRecord[]> {
  const url = `${BASE_URL}/works?query=${encodeURIComponent(query)}&rows=${rows}${
    contactEmail ? `&mailto=${encodeURIComponent(contactEmail)}` : ''
  }`
  const data = await citationGetJson<{ message?: { items?: Record<string, unknown>[] } }>(
    url,
    politeHeaders(contactEmail)
  )
  return (data.message?.items ?? []).map(crossrefToCsl)
}
