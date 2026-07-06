import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getFirstEnabledCitationProvider, isProviderUsable } from '@/lib/citations'
import * as semanticScholar from '@/lib/citations/semantic-scholar'
import * as arxiv from '@/lib/citations/arxiv'
import { parseTeiReferences } from '@/lib/citations/grobid'
import { authorIdentityFor, orcidSearchUrl } from '@/lib/citations/orcid'
import type { CitationSourceProvider, CitationSourceRecord } from '@/types/citations'

function provider(p: Partial<CitationSourceProvider>): CitationSourceProvider {
  return { id: 'x', name: 'X', type: 'crossref', enabled: true, apiKey: null, ...p }
}

function mockNet(body: unknown, status = 200): void {
  vi.mocked(window.electronAPI.net.request).mockResolvedValue({
    status,
    statusText: 'OK',
    headers: {},
    body: typeof body === 'string' ? body : JSON.stringify(body)
  })
}

describe('provider usability + selection (key-gating §11)', () => {
  it('key-required sources are unusable without a key', () => {
    expect(isProviderUsable(provider({ type: 'openalex', apiKey: null }))).toBe(false)
    expect(isProviderUsable(provider({ type: 'openalex', apiKey: 'k' }))).toBe(true)
    expect(isProviderUsable(provider({ type: 'core', apiKey: null }))).toBe(false)
  })
  it('local sources (Grobid) are not DOI resolvers', () => {
    expect(isProviderUsable(provider({ type: 'grobid', local: true }))).toBe(false)
  })
  it('custom needs an endpoint', () => {
    expect(isProviderUsable(provider({ type: 'custom', endpoint: '' }))).toBe(false)
    expect(isProviderUsable(provider({ type: 'custom', endpoint: 'https://x' }))).toBe(true)
  })
  it('picks the first usable provider, skipping gated ones', () => {
    const chosen = getFirstEnabledCitationProvider([
      provider({ id: 'oa', type: 'openalex', apiKey: null }), // gated out
      provider({ id: 'cr', type: 'crossref' }) // keyless → chosen
    ])
    expect(chosen?.id).toBe('cr')
  })
})

describe('Semantic Scholar adapter', () => {
  beforeEach(() => vi.mocked(window.electronAPI.net.request).mockReset())
  it('maps a paper to CSL-JSON and sends the key header', async () => {
    mockNet({
      title: 'Deep learning',
      authors: [{ name: 'Yann LeCun' }],
      year: 2015,
      venue: 'Nature',
      externalIds: { DOI: '10.1038/nature14539' }
    })
    const rec = await semanticScholar.lookupByDoi('10.1038/nature14539', 'my-key')
    expect(rec?.title).toBe('Deep learning')
    expect(rec?.author?.[0]).toMatchObject({ family: 'LeCun', given: 'Yann' })
    expect(rec?.DOI).toBe('10.1038/nature14539')
    const call = vi.mocked(window.electronAPI.net.request).mock.calls[0][0]
    expect(call.headers?.['x-api-key']).toBe('my-key')
  })
})

describe('arXiv adapter (Atom XML)', () => {
  beforeEach(() => vi.mocked(window.electronAPI.net.request).mockReset())
  it('parses an Atom feed into CSL records', async () => {
    mockNet(
      `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
        <entry><title>Attention Is All You Need</title>
          <author><name>Ashish Vaswani</name></author>
          <author><name>Noam Shazeer</name></author>
          <published>2017-06-12T00:00:00Z</published>
          <id>http://arxiv.org/abs/1706.03762</id></entry>
      </feed>`
    )
    const results = await arxiv.search('transformer')
    expect(results).toHaveLength(1)
    expect(results[0].title).toBe('Attention Is All You Need')
    expect(results[0].author).toHaveLength(2)
    expect(results[0].issued?.['date-parts']).toEqual([[2017]])
    expect(results[0]['container-title']).toBe('arXiv')
  })
})

describe('Grobid TEI parsing', () => {
  it('extracts biblStruct references into CSL-JSON', () => {
    const tei = `<?xml version="1.0"?><TEI xmlns="http://www.tei-c.org/ns/1.0"><text><back><div><listBibl>
      <biblStruct><analytic><title level="a">Contact and prejudice</title>
        <author><persName><forename type="first">Gordon</forename><surname>Allport</surname></persName></author></analytic>
        <monogr><title level="j">American Psychologist</title><imprint><date when="1954"/></imprint></monogr>
        <idno type="DOI">10.1037/0003-066X.59.1.29</idno></biblStruct>
    </listBibl></div></back></text></TEI>`
    const refs = parseTeiReferences(tei)
    expect(refs).toHaveLength(1)
    expect(refs[0].title).toBe('Contact and prejudice')
    expect(refs[0].author?.[0]).toMatchObject({ family: 'Allport', given: 'Gordon' })
    expect(refs[0].DOI).toBe('10.1037/0003-066X.59.1.29')
    expect(refs[0].issued?.['date-parts']).toEqual([[1954]])
  })
})

describe('ORCID identity', () => {
  it('flags orcid_verified when any author carries an ORCID iD', () => {
    const withOrcid: CitationSourceRecord = {
      id: '1',
      type: 'article-journal',
      author: [{ family: 'Doe', ORCID: '0000-0002-1825-0097' }]
    }
    const without: CitationSourceRecord = {
      id: '2',
      type: 'article-journal',
      author: [{ family: 'Doe' }]
    }
    expect(authorIdentityFor(withOrcid)).toBe('orcid_verified')
    expect(authorIdentityFor(without)).toBe('unverified')
  })
  it('builds a keyless pass-through search URL', () => {
    expect(orcidSearchUrl('Gordon Allport')).toContain('orcid.org/orcid-search')
    expect(orcidSearchUrl('Gordon Allport')).toContain('Gordon%20Allport')
    expect(orcidSearchUrl('x', 'sandbox')).toContain('sandbox.orcid.org')
  })
})
