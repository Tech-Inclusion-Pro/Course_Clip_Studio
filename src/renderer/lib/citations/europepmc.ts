// ─── PubMed / Europe PMC adapter ───
// Biomedical core. Keyless; an NCBI key raises the rate limit (unused here — the
// Europe PMC REST API is keyless). Docs: https://europepmc.org  // verify-at-build

import type { CitationSourceRecord, CslName } from '@/types/citations'
import { citationGetJson } from './http'
import { yearToIssued, stripDoiPrefix } from './csl-utils'

const BASE = 'https://www.ebi.ac.uk/europepmc/webservices/rest' // verify-at-build

interface EpmcResult {
  title?: string
  authorList?: { author?: { fullName?: string; lastName?: string; firstName?: string }[] }
  pubYear?: string
  doi?: string
  journalInfo?: { journal?: { title?: string } }
  abstractText?: string
}

function toCsl(r: EpmcResult): CitationSourceRecord {
  const author: CslName[] = (r.authorList?.author ?? []).map((a) =>
    a.lastName || a.firstName
      ? { family: a.lastName, given: a.firstName }
      : { literal: a.fullName ?? '' }
  )
  return {
    id: r.doi || r.title || 'europepmc-record',
    type: 'article-journal',
    title: r.title,
    author,
    issued: yearToIssued(r.pubYear),
    DOI: r.doi,
    'container-title': r.journalInfo?.journal?.title,
    abstract: r.abstractText,
    retrievedFrom: 'pubmed'
  }
}

async function query(q: string, limit: number): Promise<CitationSourceRecord[]> {
  const url = `${BASE}/search?query=${encodeURIComponent(q)}&format=json&resultType=core&pageSize=${limit}`
  const data = await citationGetJson<{ resultList?: { result?: EpmcResult[] } }>(url)
  return (data.resultList?.result ?? []).map(toCsl)
}

export async function lookupByDoi(doi: string): Promise<CitationSourceRecord | null> {
  const results = await query(`DOI:${stripDoiPrefix(doi)}`, 1).catch(() => [])
  return results[0] ?? null
}

export async function search(q: string, limit = 10): Promise<CitationSourceRecord[]> {
  return query(q, limit)
}
