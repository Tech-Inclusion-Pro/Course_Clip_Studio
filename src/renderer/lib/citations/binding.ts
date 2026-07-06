// ─── Content Areas binding (spec §8) ───
//
// A Knowledge Web note is a FILE, not a profile — so it binds as a ContentAreaFile
// appended to a chosen ContentArea.files[], never as a new ContentArea. Because
// useAIStore.selectedContentAreaId already merges an area's files into generation
// context (see lib/ai/prompts.ts contentAreaFilesContext), a bound note auto-
// participates in AI authoring the moment it's attached — no generation-side change.

import type { ContentAreaFile } from '@/types/course'
import type {
  CitationNote,
  CitationProvenance,
  CitationSourceRecord,
  Tier1Result
} from '@/types/citations'
import { uid } from '@/lib/uid'
import { formatApa } from './apa'
import { authorIdentityFor } from './orcid'

const DOI_STATUS_LABEL: Record<Tier1Result['state'], string> = {
  verified: 'DOI-verified',
  mismatch: 'metadata mismatch',
  not_found: 'DOI not found',
  no_doi: 'no DOI'
}

const SOURCE_CLASS_LABEL: Record<CitationProvenance['sourceClass'], string> = {
  vetted_corpus: 'Vetted source',
  obsidian_vault: 'Vault source',
  open_web: 'Open-web source'
}

/** Condensed provenance summary for ContentAreaFile.context (spec §8.1). */
export function buildProvenanceContext(
  provenance: CitationProvenance,
  stats: { refs: number; doiVerified: number; needsReview: number }
): string {
  const parts = [
    `${SOURCE_CLASS_LABEL[provenance.sourceClass]} · ${stats.refs} ref${
      stats.refs === 1 ? '' : 's'
    }`
  ]
  if (stats.doiVerified > 0) parts.push(`${stats.doiVerified} DOI-verified`)
  if (stats.needsReview > 0) parts.push(`${stats.needsReview} needs review`)
  if (provenance.authorIdentity === 'orcid_verified') parts.push('author verified (ORCID)')
  return parts.join(' · ')
}

/** Render a citation note as Markdown (the .md written to the workspace). */
export function renderNoteMarkdown(
  title: string,
  record: CitationSourceRecord,
  apa: string,
  tier1: Tier1Result
): string {
  const lines = [
    `# ${title}`,
    '',
    '## Reference (APA 7)',
    apa,
    '',
    '## Verification',
    `- DOI: ${record.DOI ? `https://doi.org/${record.DOI}` : '—'}`,
    `- Status: ${DOI_STATUS_LABEL[tier1.state]}`
  ]
  if (record.abstract) {
    lines.push('', '## Abstract', record.abstract)
  }
  return lines.join('\n') + '\n'
}

export interface BindResult {
  file: ContentAreaFile
  note: CitationNote
  markdown: string
}

/**
 * Build the ContentAreaFile + CitationNote for a resolved source. Pure — the caller
 * writes `markdown` to `path` and calls addContentAreaFile(contentAreaId, file).
 */
export function buildBinding(opts: {
  contentAreaId: string
  workspacePath: string
  record: CitationSourceRecord
  tier1: Tier1Result
  priority: 1 | 2 | 3
  live: boolean
  sourceClass?: CitationProvenance['sourceClass']
  existingNames?: string[]
}): BindResult {
  const {
    contentAreaId,
    workspacePath,
    record,
    tier1,
    priority,
    live,
    sourceClass = 'vetted_corpus',
    existingNames = []
  } = opts

  const apaResult = formatApa(record)
  const title = record.title || 'Untitled source'

  // Safe, de-duplicated .md filename.
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60)
  let name = `${slug || 'citation'}.md`
  if (existingNames.includes(name)) {
    name = `${slug || 'citation'}-${Date.now().toString(36)}.md`
  }
  const path = `${workspacePath}/content-areas/${contentAreaId}/files/${name}`

  const provenance: CitationProvenance = {
    sourceClass,
    doiVerification: tier1.state,
    authorIdentity: authorIdentityFor(record),
    retrievedFrom: record.retrievedFrom ? [record.retrievedFrom] : []
  }
  const context = buildProvenanceContext(provenance, {
    refs: 1,
    doiVerified: tier1.state === 'verified' ? 1 : 0,
    needsReview: tier1.state === 'verified' ? 0 : 1
  })

  const noteId = uid('kwnote')
  const file: ContentAreaFile = {
    id: uid('caf'),
    name,
    path,
    priority,
    context,
    sourceNoteId: noteId,
    live
  }

  const note: CitationNote = {
    id: noteId,
    contentAreaFileId: file.id,
    record,
    apa: apaResult.text,
    apaIncomplete: apaResult.incomplete,
    tier1,
    provenance
  }

  return { file, note, markdown: renderNoteMarkdown(title, record, apaResult.text, tier1) }
}
