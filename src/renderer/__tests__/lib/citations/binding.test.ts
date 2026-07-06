import { describe, it, expect } from 'vitest'
import { buildBinding, buildProvenanceContext } from '@/lib/citations/binding'
import type { CitationSourceRecord } from '@/types/citations'

const RECORD: CitationSourceRecord = {
  id: '10.1000/xyz',
  type: 'article-journal',
  title: 'The Nature of Prejudice',
  author: [{ family: 'Allport', given: 'Gordon W.' }],
  issued: { 'date-parts': [[1954]] },
  DOI: '10.1000/xyz',
  retrievedFrom: 'crossref'
}

describe('buildProvenanceContext', () => {
  it('summarizes source class and verification counts', () => {
    const ctx = buildProvenanceContext(
      { sourceClass: 'vetted_corpus', doiVerification: 'verified', retrievedFrom: ['crossref'] },
      { refs: 8, doiVerified: 7, needsReview: 1 }
    )
    expect(ctx).toContain('Vetted source')
    expect(ctx).toContain('8 refs')
    expect(ctx).toContain('7 DOI-verified')
    expect(ctx).toContain('1 needs review')
  })
})

describe('buildBinding', () => {
  it('produces a ContentAreaFile with live-link fields and a note path', () => {
    const { file, note, markdown } = buildBinding({
      contentAreaId: 'ca-1',
      workspacePath: '/ws',
      record: RECORD,
      tier1: { state: 'verified', resolvedTitle: RECORD.title },
      priority: 3,
      live: true
    })

    expect(file.priority).toBe(3)
    expect(file.live).toBe(true)
    expect(file.sourceNoteId).toBe(note.id)
    expect(file.path).toBe('/ws/content-areas/ca-1/files/the-nature-of-prejudice.md')
    expect(file.context).toContain('DOI-verified')

    expect(note.contentAreaFileId).toBe(file.id)
    expect(note.tier1.state).toBe('verified')
    expect(note.apa).toContain('Allport')

    expect(markdown).toContain('# The Nature of Prejudice')
    expect(markdown).toContain('## Reference (APA 7)')
    expect(markdown).toContain('https://doi.org/10.1000/xyz')
  })

  it('de-duplicates the filename against existing files', () => {
    const { file } = buildBinding({
      contentAreaId: 'ca-1',
      workspacePath: '/ws',
      record: RECORD,
      tier1: { state: 'verified' },
      priority: 2,
      live: false,
      existingNames: ['the-nature-of-prejudice.md']
    })
    expect(file.path).not.toBe('/ws/content-areas/ca-1/files/the-nature-of-prejudice.md')
    expect(file.name).toMatch(/^the-nature-of-prejudice-.*\.md$/)
  })
})
