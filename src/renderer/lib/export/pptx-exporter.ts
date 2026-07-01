import PptxGenJS from 'pptxgenjs'
import type { DeckObject, RenderedSlide, PresentationTheme, PptxElement } from '@/types/presentation'
import { getLayoutDef } from '@/lib/presentation/slide-layouts'

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
          pptxSlide.addText(slide.body, {
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

export async function exportDeckToPptx(deck: DeckObject): Promise<Blob> {
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE' // 13.33 x 7.5 inches (16:9)

  for (const slide of deck.slides) {
    const pptxSlide = pptx.addSlide()
    applyLayout(slide, deck.theme, pptxSlide)
  }

  const output = await pptx.write({ outputType: 'blob' })
  return output as Blob
}
