// ─── Grobid adapter (local) ───
// Grobid turns a PDF into structured references. It runs locally (default
// http://localhost:8070); everything stays on-device. If it isn't running we skip
// gracefully. Docs: https://grobid.readthedocs.io  // verify-at-build

import { XMLParser } from 'fast-xml-parser'
import type { CitationSourceRecord, CslName } from '@/types/citations'
import { citationRequest } from './http'

export const DEFAULT_GROBID_ENDPOINT = 'http://localhost:8070' // verify-at-build

const parser = new XMLParser({ ignoreAttributes: false, removeNSPrefix: true })

function asArray<T>(v: T | T[] | undefined): T[] {
  if (v == null) return []
  return Array.isArray(v) ? v : [v]
}

/** Is a Grobid server reachable at `endpoint`? */
export async function isGrobidRunning(endpoint = DEFAULT_GROBID_ENDPOINT): Promise<boolean> {
  try {
    const res = await citationRequest({ url: `${endpoint}/api/isalive`, timeoutMs: 2500 })
    return res.status >= 200 && res.status < 300
  } catch {
    return false
  }
}

// TEI <biblStruct> → CSL-JSON (best-effort).
interface TeiPersName {
  forename?: unknown
  surname?: string
}
interface TeiBibl {
  analytic?: { title?: unknown; author?: unknown }
  monogr?: {
    title?: unknown
    imprint?: { date?: { '@_when'?: string } | { '@_when'?: string }[] }
  }
  idno?: unknown
}

function textOf(v: unknown): string | undefined {
  if (v == null) return undefined
  if (typeof v === 'string') return v
  if (typeof v === 'object' && '#text' in (v as Record<string, unknown>))
    return String((v as Record<string, unknown>)['#text'])
  return undefined
}

function nameOf(p: TeiPersName): CslName {
  const forenames = asArray(p.forename).map(textOf).filter(Boolean).join(' ')
  return { family: p.surname, given: forenames || undefined }
}

function biblToCsl(b: TeiBibl, i: number): CitationSourceRecord {
  const title = textOf(b.analytic?.title) ?? textOf(b.monogr?.title)
  const persons = asArray((b.analytic as { author?: { persName?: TeiPersName }[] })?.author).map(
    (a) => a?.persName
  )
  const date = asArray(b.monogr?.imprint?.date)[0]?.['@_when']
  const year = date ? parseInt(date.slice(0, 4), 10) : undefined
  const idno = asArray(b.idno).map(textOf).find((s) => s && /10\.\d{4,}/.test(s))
  return {
    id: idno || title || `grobid-ref-${i}`,
    type: 'article-journal',
    title,
    author: persons.filter(Boolean).map((p) => nameOf(p as TeiPersName)),
    issued: year ? { 'date-parts': [[year]] } : undefined,
    DOI: idno?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, ''),
    'container-title': textOf(b.monogr?.title),
    retrievedFrom: undefined // local structural parse, not a network source
  }
}

/** Extract the reference list from a PDF's raw bytes via Grobid. */
export async function extractReferences(
  pdf: ArrayBuffer,
  fileName = 'document.pdf',
  endpoint = DEFAULT_GROBID_ENDPOINT
): Promise<CitationSourceRecord[]> {
  const res = await window.electronAPI.net.uploadFile({
    url: `${endpoint}/api/processReferences`,
    method: 'POST',
    fileData: pdf,
    fileName,
    fieldName: 'input',
    fileContentType: 'application/pdf',
    headers: { Accept: 'application/xml' }
  })
  if (res.status < 200 || res.status >= 300) return []
  return parseTeiReferences(res.body)
}

/** Parse a Grobid TEI document into CSL-JSON references (exported for testing). */
export function parseTeiReferences(tei: string): CitationSourceRecord[] {
  const doc = parser.parse(tei)
  // References live under teiCorpus/TEI or TEI → ...listBibl/biblStruct
  const teiRoot = doc?.TEI ?? doc?.teiCorpus?.TEI ?? doc
  const listBibl = teiRoot?.text?.back?.div?.listBibl ?? teiRoot?.text?.back?.listBibl
  const bibls = asArray<TeiBibl>(asArray(listBibl)[0]?.biblStruct ?? listBibl?.biblStruct)
  return bibls.map(biblToCsl)
}
