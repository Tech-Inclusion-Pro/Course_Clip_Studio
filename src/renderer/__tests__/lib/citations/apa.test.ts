import { describe, it, expect } from 'vitest'
import { formatApa } from '@/lib/citations/apa'
import type { CitationSourceRecord } from '@/types/citations'

describe('formatApa', () => {
  it('formats a journal article in APA 7', () => {
    const record: CitationSourceRecord = {
      id: '10.1000/xyz',
      type: 'article-journal',
      title: 'The nature of prejudice',
      author: [{ family: 'Allport', given: 'Gordon W.' }],
      issued: { 'date-parts': [[1954]] },
      'container-title': 'Journal of Social Issues',
      volume: '10',
      page: '1-10',
      DOI: '10.1000/xyz'
    }
    const { text, incomplete } = formatApa(record)
    expect(incomplete).toBeUndefined()
    expect(text).toContain('Allport, G. W.')
    expect(text).toContain('(1954)')
    expect(text).toContain('The nature of prejudice')
    expect(text).toContain('Journal of Social Issues')
    expect(text).toContain('https://doi.org/10.1000/xyz')
  })

  it('formats a book', () => {
    const record: CitationSourceRecord = {
      id: 'b1',
      type: 'book',
      title: 'Thinking, fast and slow',
      author: [{ family: 'Kahneman', given: 'Daniel' }],
      issued: { 'date-parts': [[2011]] },
      publisher: 'Farrar, Straus and Giroux'
    }
    const { text } = formatApa(record)
    expect(text).toContain('Kahneman, D.')
    expect(text).toContain('(2011)')
    expect(text).toContain('Thinking, fast and slow')
  })

  it('flags a missing required field, naming it', () => {
    const noTitle: CitationSourceRecord = {
      id: 'x',
      type: 'article-journal',
      author: [{ family: 'Doe', given: 'Jane' }],
      issued: { 'date-parts': [[2020]] }
    }
    expect(formatApa(noTitle).incomplete).toEqual({ missingField: 'title' })

    const noAuthor: CitationSourceRecord = {
      id: 'y',
      type: 'article-journal',
      title: 'Orphan work',
      issued: { 'date-parts': [[2020]] }
    }
    expect(formatApa(noAuthor).incomplete).toEqual({ missingField: 'author' })

    const noYear: CitationSourceRecord = {
      id: 'z',
      type: 'article-journal',
      title: 'Undated',
      author: [{ family: 'Doe', given: 'Jane' }]
    }
    expect(formatApa(noYear).incomplete).toEqual({ missingField: 'year' })
  })
})
