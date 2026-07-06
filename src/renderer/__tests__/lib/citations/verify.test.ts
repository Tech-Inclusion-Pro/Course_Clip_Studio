import { describe, it, expect, vi, beforeEach } from 'vitest'
import { verifyDoi, buildClaimCheckReasoning } from '@/lib/citations/verify'
import type { CitationSourceRecord } from '@/types/citations'

const MESSAGE = {
  DOI: '10.1000/xyz',
  type: 'journal-article',
  title: ['The nature of prejudice'],
  author: [{ family: 'Allport', given: 'Gordon W.' }],
  issued: { 'date-parts': [[1954]] }
}

function mockCrossref(body: unknown, status = 200): void {
  vi.mocked(window.electronAPI.net.request).mockResolvedValue({
    status,
    statusText: 'OK',
    headers: {},
    body: JSON.stringify(body)
  })
}

describe('verifyDoi (Tier 1)', () => {
  beforeEach(() => vi.mocked(window.electronAPI.net.request).mockReset())

  it('returns no_doi when no DOI is given', async () => {
    expect((await verifyDoi(undefined)).state).toBe('no_doi')
    expect((await verifyDoi('   ')).state).toBe('no_doi')
  })

  it('returns not_found when the DOI does not resolve', async () => {
    mockCrossref('Not Found', 404)
    expect((await verifyDoi('10.9999/nope')).state).toBe('not_found')
  })

  it('returns verified when expected metadata matches', async () => {
    mockCrossref({ message: MESSAGE })
    const r = await verifyDoi('10.1000/xyz', {
      title: 'The nature of prejudice',
      firstAuthorFamily: 'Allport',
      year: 1954
    })
    expect(r.state).toBe('verified')
    expect(r.resolvedFirstAuthor).toBe('Allport')
    expect(r.resolvedYear).toBe(1954)
  })

  it('returns mismatch when the resolved author disagrees', async () => {
    mockCrossref({ message: MESSAGE })
    const r = await verifyDoi('10.1000/xyz', { firstAuthorFamily: 'Skinner' })
    expect(r.state).toBe('mismatch')
  })

  it('tolerates a ±1 year difference (online-first vs print)', async () => {
    mockCrossref({ message: MESSAGE })
    const r = await verifyDoi('10.1000/xyz', { year: 1955 })
    expect(r.state).toBe('verified')
  })
})

describe('buildClaimCheckReasoning (Tier 2)', () => {
  it('produces a well-formed TippyReasoningData that defers to the human', () => {
    const record: CitationSourceRecord = {
      id: '10.1000/xyz',
      type: 'article-journal',
      title: 'The nature of prejudice',
      DOI: '10.1000/xyz'
    }
    const reasoning = buildClaimCheckReasoning(
      record,
      'Contact reduces prejudice',
      { state: 'verified' },
      'Allport, G. W. (1954). The nature of prejudice.'
    )
    expect(reasoning.overallConfidence).toBe('high')
    expect(reasoning.sources[0].reference).toBe('https://doi.org/10.1000/xyz')
    expect(reasoning.humanReviewRequired.length).toBeGreaterThan(0)
    expect(reasoning.humanReviewRequired.join(' ')).toContain('Contact reduces prejudice')
  })
})
