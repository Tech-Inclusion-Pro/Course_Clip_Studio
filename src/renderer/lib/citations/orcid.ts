// ─── ORCID identity (spec §4, §5, §6.3) ───
//
// Two modes:
//  • Pass-through disambiguation — keyless. Builds a public ORCID search URL so a
//    user can confirm an author's identity by hand. No credentials leave the app.
//  • Native own-record — opt-in. Exchanges client credentials for a read-public
//    token (client_credentials grant — no browser redirect) and lists the user's
//    own works. Read-only, public data only.

import type { CitationSourceRecord, CslName } from '@/types/citations'
import { citationRequest, citationGetJson, CitationHttpError } from './http'
import { yearToIssued } from './csl-utils'

type OrcidEnv = 'production' | 'sandbox'

function hosts(env: OrcidEnv): { oauth: string; pub: string } {
  return env === 'sandbox'
    ? { oauth: 'https://sandbox.orcid.org', pub: 'https://pub.sandbox.orcid.org' }
    : { oauth: 'https://orcid.org', pub: 'https://pub.orcid.org' }
}

/** Pass-through: a public ORCID search URL for manual disambiguation (keyless). */
export function orcidSearchUrl(authorName: string, env: OrcidEnv = 'production'): string {
  return `${hosts(env).oauth}/orcid-search/search?searchQuery=${encodeURIComponent(authorName)}`
}

/** Does any author on this record carry an ORCID iD? Drives the identity badge. */
export function authorIdentityFor(
  record: CitationSourceRecord
): 'orcid_verified' | 'unverified' {
  return record.author?.some((a) => !!a.ORCID) ? 'orcid_verified' : 'unverified'
}

/** Exchange client credentials for a read-public token (client_credentials grant). */
export async function getReadPublicToken(
  clientId: string,
  clientSecret: string,
  env: OrcidEnv = 'production'
): Promise<string> {
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'client_credentials',
    scope: '/read-public'
  }).toString()
  const res = await citationRequest({
    url: `${hosts(env).oauth}/oauth/token`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    body
  })
  if (res.status < 200 || res.status >= 300) {
    throw new CitationHttpError("Couldn't reach ORCID for a token.", res.status)
  }
  const token = (JSON.parse(res.body) as { access_token?: string }).access_token
  if (!token) throw new CitationHttpError('ORCID did not return a token.')
  return token
}

// ORCID /works summary shapes (subset).
interface OrcidWorkSummary {
  title?: { title?: { value?: string } }
  'journal-title'?: { value?: string }
  'publication-date'?: { year?: { value?: string } }
  'external-ids'?: { 'external-id'?: { 'external-id-type'?: string; 'external-id-value'?: string }[] }
}

function summaryToCsl(orcidId: string, s: OrcidWorkSummary): CitationSourceRecord {
  const ids = s['external-ids']?.['external-id'] ?? []
  const doi = ids.find((x) => x['external-id-type'] === 'doi')?.['external-id-value']
  const year = s['publication-date']?.year?.value
  // The record's own author is the ORCID owner — mark them verified.
  const author: CslName[] = [{ ORCID: orcidId }]
  return {
    id: doi || s.title?.title?.value || `orcid-${orcidId}`,
    type: 'article-journal',
    title: s.title?.title?.value,
    author,
    issued: yearToIssued(year),
    DOI: doi,
    'container-title': s['journal-title']?.value,
    retrievedFrom: undefined
  }
}

/** List an ORCID record's public works as CSL-JSON. */
export async function worksByOrcid(
  orcidId: string,
  token: string,
  env: OrcidEnv = 'production'
): Promise<CitationSourceRecord[]> {
  const data = await citationGetJson<{ group?: { 'work-summary'?: OrcidWorkSummary[] }[] }>(
    `${hosts(env).pub}/v3.0/${encodeURIComponent(orcidId)}/works`,
    { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  )
  return (data.group ?? [])
    .map((g) => g['work-summary']?.[0])
    .filter((s): s is OrcidWorkSummary => !!s)
    .map((s) => summaryToCsl(orcidId, s))
}
