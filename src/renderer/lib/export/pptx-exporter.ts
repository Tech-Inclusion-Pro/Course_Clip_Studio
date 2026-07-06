import PptxGenJS from 'pptxgenjs'
import type { DeckObject, RenderedSlide, PresentationTheme, PptxElement, ChartSpec, TableSpec } from '@/types/presentation'
import { getLayoutDef } from '@/lib/presentation/slide-layouts'
import { bodyMdToPptxRuns } from '@/lib/presentation/markdown'

function hexToRgb6(hex: string): string {
  return hex.replace('#', '').toUpperCase()
}

function resolveColor(
  colorKey: string | undefined,
  theme: PresentationTheme,
  accentBg: boolean
): string {
  switch (colorKey) {
    case 'titleColor':
      return accentBg ? hexToRgb6(theme.textOnAccent) : hexToRgb6(theme.textPrimary)
    case 'bodyColor':
      return hexToRgb6(theme.textPrimary)
    case 'accentColor':
      return hexToRgb6(theme.accent)
    case 'onAccentColor':
      return hexToRgb6(theme.textOnAccent)
    default:
      return hexToRgb6(theme.textPrimary)
  }
}

/** Parse quote body into { text, attribution } */
function parseQuoteBody(body: string): { text: string; attribution: string } {
  const lines = body.split('\n')
  const attrIdx = lines.findIndex((l) => l.trim().startsWith('--'))
  if (attrIdx >= 0) {
    return {
      text: lines.slice(0, attrIdx).join('\n').trim(),
      attribution: lines[attrIdx].replace(/^--\s*/, '').trim()
    }
  }
  return { text: body.trim(), attribution: '' }
}

/** Split body into two columns at "---" separator */
function splitColumns(body: string): { left: string; right: string; leftLabel: string; rightLabel: string } {
  const parts = body.split('---')
  const leftLines = (parts[0] || '').trim().split('\n')
  const rightLines = (parts[1] || '').trim().split('\n')

  // First line of each part is the label if it doesn't start with a bullet
  const leftLabel = leftLines[0]?.startsWith('•') || leftLines[0]?.startsWith('-') ? '' : leftLines.shift() || ''
  const rightLabel = rightLines[0]?.startsWith('•') || rightLines[0]?.startsWith('-') ? '' : rightLines.shift() || ''

  return {
    left: leftLines.join('\n').trim(),
    right: rightLines.join('\n').trim(),
    leftLabel: leftLabel.trim(),
    rightLabel: rightLabel.trim()
  }
}

function applyLayout(
  slide: RenderedSlide,
  theme: PresentationTheme,
  pptxSlide: PptxGenJS.Slide
): void {
  const layout = getLayoutDef(slide.layoutHint)

  // Background
  pptxSlide.background = {
    color: layout.accentBackground ? hexToRgb6(theme.accent) : hexToRgb6(theme.background)
  }

  // Parse special body content
  const quote = slide.layoutHint === 'quote' ? parseQuoteBody(slide.body) : null
  const cols = (slide.layoutHint === 'comparison' || slide.layoutHint === 'two-column')
    ? splitColumns(slide.body)
    : null

  for (const el of layout.pptxElements) {
    const color = resolveColor(el.style?.colorKey, theme, layout.accentBackground)
    const { x, y, w, h } = el.rect

    switch (el.kind) {
      case 'title':
        pptxSlide.addText(slide.title, {
          x, y, w, h,
          fontSize: el.style?.fontSize ?? 26,
          fontFace: theme.fontFamily,
          color,
          bold: el.style?.bold ?? true,
          align: el.style?.align ?? 'left',
          valign: el.style?.valign ?? 'bottom'
        })
        break

      case 'number':
        // big-number: title field holds the number
        pptxSlide.addText(slide.title, {
          x, y, w, h,
          fontSize: el.style?.fontSize ?? 72,
          fontFace: theme.fontFamily,
          color,
          bold: true,
          align: el.style?.align ?? 'center',
          valign: el.style?.valign ?? 'bottom'
        })
        break

      case 'body':
        if (!slide.body) break
        if (quote) {
          // For quote layout, body element shows the quote text
          pptxSlide.addText(quote.text, {
            x, y, w, h,
            fontSize: el.style?.fontSize ?? 22,
            fontFace: theme.fontFamily,
            color,
            italic: el.style?.italic ?? false,
            align: el.style?.align ?? 'center',
            valign: el.style?.valign ?? 'middle'
          })
        } else {
          pptxSlide.addText(bodyMdToPptxRuns(slide.body) as unknown as PptxGenJS.TextProps[], {
            x, y, w, h,
            fontSize: el.style?.fontSize ?? 16,
            fontFace: theme.fontFamily,
            color,
            italic: el.style?.italic ?? false,
            align: el.style?.align ?? 'left',
            valign: el.style?.valign ?? 'top',
            paraSpaceAfter: el.style?.paraSpaceAfter ?? 6
          })
        }
        break

      case 'quote-mark':
        pptxSlide.addText('\u201C', {
          x, y, w, h,
          fontSize: el.style?.fontSize ?? 96,
          fontFace: theme.fontFamily,
          color,
          bold: true,
          align: el.style?.align ?? 'left',
          valign: el.style?.valign ?? 'top'
        })
        break

      case 'attribution':
        if (quote?.attribution) {
          pptxSlide.addText(`\u2014 ${quote.attribution}`, {
            x, y, w, h,
            fontSize: el.style?.fontSize ?? 14,
            fontFace: theme.fontFamily,
            color,
            align: el.style?.align ?? 'right',
            valign: el.style?.valign ?? 'top'
          })
        }
        break

      case 'col-left':
        if (cols) {
          pptxSlide.addText(cols.left, {
            x, y, w, h,
            fontSize: el.style?.fontSize ?? 15,
            fontFace: theme.fontFamily,
            color,
            valign: el.style?.valign ?? 'top',
            paraSpaceAfter: el.style?.paraSpaceAfter ?? 8
          })
        }
        break

      case 'col-right':
        if (cols) {
          pptxSlide.addText(cols.right, {
            x, y, w, h,
            fontSize: el.style?.fontSize ?? 15,
            fontFace: theme.fontFamily,
            color,
            valign: el.style?.valign ?? 'top',
            paraSpaceAfter: el.style?.paraSpaceAfter ?? 8
          })
        }
        break

      case 'col-left-label':
        if (cols?.leftLabel) {
          pptxSlide.addShape('rect' as unknown as PptxGenJS.ShapeType, {
            x, y, w, h,
            fill: { color: hexToRgb6(theme.accent) },
            rectRadius: 0.05
          })
          pptxSlide.addText(cols.leftLabel, {
            x, y, w, h,
            fontSize: el.style?.fontSize ?? 16,
            fontFace: theme.fontFamily,
            color: hexToRgb6(theme.textOnAccent),
            bold: true,
            align: el.style?.align ?? 'center',
            valign: el.style?.valign ?? 'middle'
          })
        }
        break

      case 'col-right-label':
        if (cols?.rightLabel) {
          pptxSlide.addShape('rect' as unknown as PptxGenJS.ShapeType, {
            x, y, w, h,
            fill: { color: hexToRgb6(theme.accent) },
            rectRadius: 0.05
          })
          pptxSlide.addText(cols.rightLabel, {
            x, y, w, h,
            fontSize: el.style?.fontSize ?? 16,
            fontFace: theme.fontFamily,
            color: hexToRgb6(theme.textOnAccent),
            bold: true,
            align: el.style?.align ?? 'center',
            valign: el.style?.valign ?? 'middle'
          })
        }
        break

      case 'image':
        if (slide.imagePath) {
          try {
            pptxSlide.addImage({
              path: slide.imagePath,
              x, y, w, h,
              altText: slide.imageAltText || slide.title
            })
          } catch {
            // Image might not be accessible; skip
          }
        }
        break

      case 'accent-bar':
        pptxSlide.addShape('rect' as unknown as PptxGenJS.ShapeType, {
          x, y, w, h,
          fill: { color: hexToRgb6(theme.accent) }
        })
        break
    }
  }

  // Speaker notes (always, regardless of layout)
  if (slide.speakerNotes) {
    pptxSlide.addNotes(slide.speakerNotes)
  }
}

const CHART_PALETTE = ['a23b84', '3a2b95', '6f2fa6', '2e7d4f', 'ed6c02', '0277bd']

/** Title + bottom accent bar shared by chart/table slides. */
function addTitleAndAccent(
  slide: RenderedSlide,
  theme: PresentationTheme,
  pptxSlide: PptxGenJS.Slide
): void {
  pptxSlide.background = { color: hexToRgb6(theme.background) }
  if (slide.title) {
    pptxSlide.addText(slide.title, {
      x: 0.7, y: 0.3, w: 11.9, h: 0.9, fontSize: 26, bold: true,
      color: hexToRgb6(theme.textPrimary), fontFace: theme.fontFamily, valign: 'bottom'
    })
  }
  pptxSlide.addShape('rect', { x: 0, y: 7.0, w: 13.33, h: 0.5, fill: { color: hexToRgb6(theme.accent) } })
  if (slide.speakerNotes) pptxSlide.addNotes(slide.speakerNotes)
}

function addChartSlide(spec: ChartSpec, slide: RenderedSlide, theme: PresentationTheme, pptxSlide: PptxGenJS.Slide): void {
  addTitleAndAccent(slide, theme, pptxSlide)
  const data = spec.series.map((s) => ({ name: s.label, labels: spec.labels, values: s.data }))
  pptxSlide.addChart(spec.kind as PptxGenJS.CHART_NAME, data, {
    x: 0.7, y: 1.4, w: 11.9, h: 5.3,
    chartColors: CHART_PALETTE,
    showLegend: spec.series.length > 1 || spec.kind === 'pie',
    legendPos: 'b',
    showTitle: !!spec.title,
    title: spec.title
  })
  // Text alternative for accessibility travels in the notes.
  if (spec.summary) pptxSlide.addNotes(`\nChart summary: ${spec.summary}`)
}

function addTableSlide(spec: TableSpec, slide: RenderedSlide, theme: PresentationTheme, pptxSlide: PptxGenJS.Slide): void {
  addTitleAndAccent(slide, theme, pptxSlide)
  const headerRow = spec.headers.map((h) => ({
    text: h,
    options: { bold: true, color: hexToRgb6(theme.textOnAccent), fill: { color: hexToRgb6(theme.accent) } }
  }))
  const bodyRows = spec.rows.map((r) => r.map((c) => ({ text: c, options: { color: hexToRgb6(theme.textPrimary) } })))
  pptxSlide.addTable([headerRow, ...bodyRows], {
    x: 0.7, y: 1.5, w: 11.9,
    border: { type: 'solid', pt: 1, color: hexToRgb6(theme.surface) },
    fontSize: 12, fontFace: theme.fontFamily, valign: 'middle'
  })
  if (spec.summary) pptxSlide.addNotes(`\nTable summary: ${spec.summary}`)
}

export async function exportDeckToPptx(deck: DeckObject): Promise<Blob> {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 inches (16:9)

  for (const slide of deck.slides) {
    const pptxSlide = pptx.addSlide()
    if (slide.layoutHint === 'chart' && slide.chart) {
      addChartSlide(slide.chart, slide, deck.theme, pptxSlide)
    } else if (slide.layoutHint === 'table' && slide.table) {
      addTableSlide(slide.table, slide, deck.theme, pptxSlide)
    } else {
      applyLayout(slide, deck.theme, pptxSlide)
    }
  }

  const output = await pptx.write({ outputType: 'blob' })
  return output as Blob
}
