import { describe, it, expect } from 'vitest'
import { csvToChart, csvToTable, chartToCsv, emptyChart } from '@/lib/presentation/chart-data'
import { bodyMdToHtml, inlineMdToHtml, bodyMdToPptxRuns } from '@/lib/presentation/markdown'
import {
  promptModeOutlinePrompt,
  refineSlidePrompt
} from '@/lib/presentation/outline-prompts'
import { collectCitations, buildReferencesSlide } from '@/lib/presentation/references'
import type { IntakeConfig, SlideDraft } from '@/types/presentation'

const INTAKE: IntakeConfig = {
  audience: 'teachers',
  slideCount: 8,
  density: 'medium',
  tone: 'educational',
  verbosity: 'concise',
  includeTitleSlide: true,
  includeToc: true
}

describe('outline prompt controls (Phase A)', () => {
  it('injects tone, verbosity, and title/TOC structure', () => {
    const p = promptModeOutlinePrompt('Fractions', INTAKE)
    expect(p).toContain('instructional tone')
    expect(p).toContain('favor a few crisp phrases')
    expect(p).toContain('"title" slide')
    expect(p).toContain('table of contents')
  })
})

describe('chart/table data (Phase F)', () => {
  it('parses CSV into a chart spec', () => {
    const spec = csvToChart('Quarter,Revenue,Cost\nQ1,100,60\nQ2,120,70', 'bar', 'summary')
    expect(spec.labels).toEqual(['Q1', 'Q2'])
    expect(spec.series).toHaveLength(2)
    expect(spec.series[0]).toEqual({ label: 'Revenue', data: [100, 120] })
    expect(spec.summary).toBe('summary')
  })
  it('round-trips chart ↔ CSV', () => {
    const spec = emptyChart('line')
    const csv = chartToCsv(spec)
    const back = csvToChart(csv, 'line')
    expect(back.labels).toEqual(spec.labels)
    expect(back.series[0].data).toEqual(spec.series[0].data)
  })
  it('parses CSV into a table spec', () => {
    const t = csvToTable('A,B\n1,2\n3,4', 'sum')
    expect(t.headers).toEqual(['A', 'B'])
    expect(t.rows).toEqual([['1', '2'], ['3', '4']])
  })
})

describe('refine prompt (Phase G)', () => {
  it('builds a single-object refine prompt with neighbor context', () => {
    const slide: SlideDraft = {
      id: '1', title: 'Intro', body: 'x', speakerNotes: '', imagePrompt: '', layoutHint: 'bullets', flags: []
    }
    const p = refineSlidePrompt(slide, 'shorten', ['Prev', 'Next'])
    expect(p).toContain('Tighten this slide')
    expect(p).toContain('"Prev"')
    expect(p).toContain('ONE JSON object')
  })
})

describe('markdown (Phase H)', () => {
  it('renders inline bold/italic', () => {
    expect(inlineMdToHtml('a **b** *c*')).toBe('a <strong>b</strong> <em>c</em>')
  })
  it('escapes HTML before formatting', () => {
    expect(inlineMdToHtml('<script>')).toBe('&lt;script&gt;')
  })
  it('wraps bullet lines in a list', () => {
    const html = bodyMdToHtml('- one\n- two')
    expect(html).toContain('<ul')
    expect(html).toContain('<li>one</li>')
  })
  it('produces pptx runs with bold + line breaks', () => {
    const runs = bodyMdToPptxRuns('plain **bold**\nsecond')
    expect(runs.some((r) => r.options.bold && r.text === 'bold')).toBe(true)
    expect(runs.some((r) => r.options.breakLine)).toBe(true)
  })
})

describe('references (Phase C)', () => {
  it('collects and de-dupes citation flags into a slide', () => {
    const slides: SlideDraft[] = [
      { id: '1', title: 'A', body: '', speakerNotes: '', imagePrompt: '', layoutHint: 'bullets', flags: [{ kind: 'citation', detail: 'Doe 2020' }] },
      { id: '2', title: 'B', body: '', speakerNotes: '', imagePrompt: '', layoutHint: 'bullets', flags: [{ kind: 'citation', detail: 'Doe 2020' }, { kind: 'citation', detail: 'Roe 2021' }] }
    ]
    const cites = collectCitations(slides)
    expect(cites).toEqual(['Doe 2020', 'Roe 2021'])
    const ref = buildReferencesSlide(cites)
    expect(ref.title).toBe('References')
    expect(ref.body).toContain('Doe 2020')
  })
})
