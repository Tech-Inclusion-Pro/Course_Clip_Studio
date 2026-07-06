import { describe, it, expect, vi, beforeEach } from 'vitest'
import { crossrefToCsl, lookupByDoi } from '@/lib/citations/crossref'

const CROSSREF_MESSAGE = {
  DOI: '10.1037/0003-066x.59.1.29',
  type: 'journal-article',
  title: ['The nature of prejudice'],
  author: [{ family: 'Allport', given: 'Gordon W.' }],
  issued: { 'date-parts': [[1954, 3]] },
  'container-title': ['American Psychologist'],
  volume: '59',
  issue: '1',
  page: '29-40',
  publisher: 'APA',
  URL: 'https://doi.org/10.1037/0003-066x.59.1.29'
}

describe('crossrefToCsl', () => {
  it('maps a Crossref message to a CSL-JSON record', () => {
    const rec = crossrefToCsl(CROSSREF_MESSAGE)
    expect(rec.DOI).toBe('10.1037/0003-066x.59.1.29')
    expect(rec.title).toBe('The nature of prejudice')
    expect(rec.author?.[0]).toMatchObject({ family: 'Allport', given: 'Gordon W.' })
    expect(rec.issued?.['date-parts']).toEqual([[1954, 3]])
    expect(rec['container-title']).toBe('American Psychologist')
    expect(rec.retrievedFrom).toBe('crossref')
  })
})

describe('lookupByDoi', () => {
  beforeEach(() => {
    vi.mocked(window.electronAPI.net.request).mockReset()
  })

  it('resolves a DOI via net.request and maps the body', async () => {
    vi.mocked(window.electronAPI.net.request).mockResolvedValue({
      status: 200,
      statusText: 'OK',
      headers: {},
      body: JSON.stringify({ message: CROSSREF_MESSAGE })
    })
    const rec = await lookupByDoi('https://doi.org/10.1037/0003-066x.59.1.29', 'me@example.edu')
    expect(rec?.title).toBe('The nature of prejudice')
    // Strips the doi.org prefix and includes the polite mailto param.
    const calledUrl = vi.mocked(window.electronAPI.net.request).mock.calls[0][0].url
    expect(calledUrl).toContain('/works/10.1037')
    expect(calledUrl).toContain('mailto=me%40example.edu')
  })

  it('returns null when the DOI is not found', async () => {
    vi.mocked(window.electronAPI.net.request).mockResolvedValue({
      status: 404,
      statusText: 'Not Found',
      headers: {},
      body: 'Not Found'
    })
    expect(await lookupByDoi('10.9999/missing')).toBeNull()
  })
})
