import type { DeckObject, RenderedSlide, PresentationTheme } from '@/types/presentation'
import { getLayoutDef } from '@/lib/presentation/slide-layouts'

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function accentBar(theme: PresentationTheme): string {
  return `<div style="position: absolute; bottom: 0; left: 0; right: 0; height: 7%; background: ${theme.accent};"></div>`
}

function renderSlideHtml(slide: RenderedSlide, theme: PresentationTheme): string {
  const layout = getLayoutDef(slide.layoutHint)
  const bg = layout.accentBackground ? theme.accent : theme.background
  const titleColor = layout.accentBackground ? theme.textOnAccent : theme.textPrimary
  const bodyColor = theme.textPrimary

  const hasImage = !!slide.imagePath
  const imageHtml = hasImage && slide.imagePath
    ? `<img src="file://${encodeURI(slide.imagePath)}" alt="${escapeHtml(slide.imageAltText || slide.title)}" style="max-width: 100%; max-height: 280px; border-radius: 4px; object-fit: cover;" />`
    : ''

  // Title / Section
  if (layout.accentBackground) {
    return `
      <div class="slide" style="background: ${bg}; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px;">
        <h1 style="font-size: 36px; color: ${titleColor}; margin: 0 0 16px 0;">${escapeHtml(slide.title)}</h1>
        ${slide.body ? `<div style="font-size: 18px; color: ${titleColor}; opacity: 0.9;">${escapeHtml(slide.body)}</div>` : ''}
      </div>
    `
  }

  // Big Number
  if (slide.layoutHint === 'big-number') {
    return `
      <div class="slide" style="background: ${bg}; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 40px;">
        <div style="font-size: 72px; font-weight: 700; color: ${theme.accent}; line-height: 1;">${escapeHtml(slide.title)}</div>
        ${slide.body ? `<div style="font-size: 18px; color: ${bodyColor}; margin-top: 16px; opacity: 0.85;">${escapeHtml(slide.body)}</div>` : ''}
        ${accentBar(theme)}
      </div>
    `
  }

  // Quote
  if (slide.layoutHint === 'quote') {
    const lines = slide.body.split('\n')
    const attrIdx = lines.findIndex((l) => l.trim().startsWith('--'))
    const quoteText = attrIdx >= 0 ? lines.slice(0, attrIdx).join('\n').trim() : slide.body
    const attribution = attrIdx >= 0 ? lines[attrIdx].replace(/^--\s*/, '').trim() : ''
    return `
      <div class="slide" style="background: ${bg}; position: relative; display: flex; flex-direction: column; justify-content: center; padding: 60px 80px;">
        <div style="font-size: 96px; color: ${theme.accent}; font-weight: 700; line-height: 0.8;">\u201C</div>
        <div style="font-size: 22px; font-style: italic; color: ${bodyColor}; text-align: center; margin: 16px 0; line-height: 1.5;">${escapeHtml(quoteText)}</div>
        ${attribution ? `<div style="font-size: 14px; color: ${bodyColor}; text-align: right; opacity: 0.7;">\u2014 ${escapeHtml(attribution)}</div>` : ''}
        ${accentBar(theme)}
      </div>
    `
  }

  // Comparison / Two Column
  if (slide.layoutHint === 'comparison' || slide.layoutHint === 'two-column') {
    const parts = slide.body.split('---')
    const left = escapeHtml((parts[0] || '').trim())
    const right = escapeHtml((parts[1] || '').trim())
    return `
      <div class="slide" style="background: ${bg}; position: relative; padding: 32px 40px;">
        <h2 style="font-size: 24px; color: ${titleColor}; margin: 0 0 16px 0;">${escapeHtml(slide.title)}</h2>
        <div style="display: flex; gap: 24px;">
          <div style="flex: 1; font-size: 14px; color: ${bodyColor}; white-space: pre-wrap; line-height: 1.6;">${left}</div>
          <div style="flex: 1; font-size: 14px; color: ${bodyColor}; white-space: pre-wrap; line-height: 1.6;">${right}</div>
        </div>
        ${accentBar(theme)}
      </div>
    `
  }

  // Blank
  if (slide.layoutHint === 'blank') {
    return `
      <div class="slide" style="background: ${bg}; position: relative; padding: 32px 40px;">
        <h2 style="font-size: 24px; color: ${titleColor}; margin: 0;">${escapeHtml(slide.title)}</h2>
        ${accentBar(theme)}
      </div>
    `
  }

  // Standard content layouts: bullets, image-left, image-right, full-image
  const showImageLeft = slide.layoutHint === 'image-left'
  const showImageRight = slide.layoutHint === 'image-right'

  const bodyHtml = slide.body
    ? `<div style="font-size: 14px; color: ${bodyColor}; white-space: pre-wrap; line-height: 1.6; opacity: 0.9;">${escapeHtml(slide.body)}</div>`
    : ''

  const content = showImageLeft
    ? `<div style="display: flex; gap: 24px;"><div style="flex: 2;">${imageHtml}</div><div style="flex: 3;"><h2 style="font-size: 24px; color: ${titleColor}; margin: 0 0 12px 0;">${escapeHtml(slide.title)}</h2>${bodyHtml}</div></div>`
    : showImageRight
      ? `<div style="display: flex; gap: 24px;"><div style="flex: 3;"><h2 style="font-size: 24px; color: ${titleColor}; margin: 0 0 12px 0;">${escapeHtml(slide.title)}</h2>${bodyHtml}</div><div style="flex: 2;">${imageHtml}</div></div>`
      : `<h2 style="font-size: 24px; color: ${titleColor}; margin: 0 0 12px 0;">${escapeHtml(slide.title)}</h2>${bodyHtml}${imageHtml ? `<div style="margin-top: 12px;">${imageHtml}</div>` : ''}`

  return `
    <div class="slide" style="background: ${bg}; position: relative; padding: 32px 40px;">
      ${content}
      ${accentBar(theme)}
    </div>
  `
}

export async function buildDeckPdf(deck: DeckObject): Promise<Blob> {
  const slidesHtml = deck.slides
    .map((slide) => renderSlideHtml(slide, deck.theme))
    .join('\n')

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: landscape; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; font-family: ${deck.theme.fontFamily}, sans-serif; }
    .slide {
      width: 100vw;
      height: 100vh;
      page-break-after: always;
      overflow: hidden;
    }
    .slide:last-child { page-break-after: auto; }
  </style>
</head>
<body>
  ${slidesHtml}
</body>
</html>`

  const pdfBuffer = await window.electronAPI.pdf.generate(html, {
    landscape: true,
    printBackground: true
  })

  return new Blob([pdfBuffer], { type: 'application/pdf' })
}
