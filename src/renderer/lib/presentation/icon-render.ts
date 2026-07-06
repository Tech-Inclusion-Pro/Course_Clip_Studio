// ─── Icon rendering for slides ───
// Rasterizes a lucide icon to a themed PNG and saves it into the deck's assets dir,
// so a picked icon flows through the exact same imagePath pipeline as a photo
// (preview, PPTX, and PDF all already handle imagePath).

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { LucideIcon } from 'lucide-react'

function decodeDataUrlPng(dataUrl: string): ArrayBuffer {
  const b64 = dataUrl.split(',')[1] ?? ''
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

/** Render a lucide icon to a PNG data URL in the given stroke color. */
export async function iconToPngDataUrl(
  Icon: LucideIcon,
  color: string,
  size = 512
): Promise<string> {
  const svg = renderToStaticMarkup(
    createElement(Icon, { color, size, strokeWidth: 1.75, absoluteStrokeWidth: true })
  )
  const svgUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
  const img = new Image()
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve()
    img.onerror = () => reject(new Error('icon render failed'))
    img.src = svgUrl
  })
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const pad = size * 0.14 // breathing room around the glyph
  ctx.drawImage(img, pad, pad, size - pad * 2, size - pad * 2)
  return canvas.toDataURL('image/png')
}

/** Render + save a lucide icon PNG under assetsDir, returning the local file path. */
export async function saveIconPng(opts: {
  Icon: LucideIcon
  color: string
  assetsDir: string
  slideId: string
  name: string
}): Promise<string> {
  const dataUrl = await iconToPngDataUrl(opts.Icon, opts.color)
  await window.electronAPI.fs.mkdir(opts.assetsDir)
  const path = `${opts.assetsDir}/icon-${opts.name}-${opts.slideId}.png`
  await window.electronAPI.fs.writeFileBuffer(path, decodeDataUrlPng(dataUrl))
  return path
}
