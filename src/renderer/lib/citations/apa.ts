// ─── Local APA 7 formatting (spec §7) ───
// citeproc-js + bundled APA 7 CSL, fed CSL-JSON. On-device, offline-capable.
// Missing a required field → flag `incomplete`, naming the field.

import CSL from 'citeproc'
import type { CitationSourceRecord } from '@/types/citations'
import apaStyle from '@/assets/citations/apa.csl?raw'
import enUsLocale from '@/assets/citations/locales-en-US.xml?raw'

export interface ApaResult {
  text: string
  incomplete?: { missingField: string }
}

/** Strip citeproc's HTML wrapper to a single plain-text reference. */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#38;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Name the first required field that's missing (title, author/editor, year). */
function firstMissingField(record: CitationSourceRecord): string | undefined {
  if (!record.title) return 'title'
  const hasAuthor = Array.isArray(record.author) && record.author.length > 0
  if (!hasAuthor) return 'author'
  if (!record.issued?.['date-parts']?.[0]?.[0]) return 'year'
  return undefined
}

/** Format a single CSL-JSON record as an APA 7 reference string. */
export function formatApa(record: CitationSourceRecord): ApaResult {
  const missingField = firstMissingField(record)

  const item: Record<string, unknown> = {
    ...record,
    id: record.id,
    type: record.type || 'article-journal'
  }

  const sys = {
    retrieveLocale: () => enUsLocale,
    retrieveItem: () => item
  }

  const engine = new CSL.Engine(sys, apaStyle)
  engine.updateItems([item.id as string])
  const [, entries] = engine.makeBibliography()
  const text = stripHtml(entries.join(''))

  return missingField ? { text, incomplete: { missingField } } : { text }
}

/** Format several records into an APA reference list (one entry per record). */
export function formatApaList(records: CitationSourceRecord[]): ApaResult[] {
  return records.map(formatApa)
}
