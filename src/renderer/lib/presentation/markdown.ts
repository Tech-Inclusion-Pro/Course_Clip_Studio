// ─── Lightweight inline Markdown for slide bodies ───
// Supports **bold**, *italic*/_italic_, and "- "/"• " bullet lines. Kept minimal so
// the same source renders faithfully in the live preview, PDF (HTML), and PPTX (runs).

export function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/** Inline **bold** / *italic* → HTML (input is escaped first). */
export function inlineMdToHtml(s: string): string {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*(?!\*)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
}

/** Body → HTML: bullet lines become a <ul>, other lines <div>s. */
export function bodyMdToHtml(body: string): string {
  const lines = body.split('\n')
  const out: string[] = []
  let inList = false
  for (const raw of lines) {
    const line = raw.trimEnd()
    const bullet = /^\s*[-•]\s+/.test(line)
    if (bullet) {
      if (!inList) { out.push('<ul style="margin:0;padding-left:1.2em;">'); inList = true }
      out.push(`<li>${inlineMdToHtml(line.replace(/^\s*[-•]\s+/, ''))}</li>`)
    } else {
      if (inList) { out.push('</ul>'); inList = false }
      if (line.trim()) out.push(`<div>${inlineMdToHtml(line)}</div>`)
    }
  }
  if (inList) out.push('</ul>')
  return out.join('')
}

export interface MdRun {
  text: string
  options: { bold?: boolean; italic?: boolean; breakLine?: boolean; bullet?: boolean }
}

/** Body → PptxGenJS rich-text runs (inline bold/italic, per-line breaks + bullets). */
export function bodyMdToPptxRuns(body: string): MdRun[] {
  const runs: MdRun[] = []
  const lines = body.split('\n')
  lines.forEach((raw, li) => {
    const bullet = /^\s*[-•]\s+/.test(raw)
    const line = raw.replace(/^\s*[-•]\s+/, '')
    const segments = parseInline(line)
    segments.forEach((seg, si) => {
      runs.push({
        text: seg.text,
        options: {
          bold: seg.bold,
          italic: seg.italic,
          bullet: bullet && si === 0 ? true : undefined,
          breakLine: si === segments.length - 1 && li < lines.length - 1
        }
      })
    })
    if (segments.length === 0) runs.push({ text: '', options: { breakLine: li < lines.length - 1 } })
  })
  return runs
}

function parseInline(s: string): { text: string; bold?: boolean; italic?: boolean }[] {
  const out: { text: string; bold?: boolean; italic?: boolean }[] = []
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_/g
  let last = 0
  let m: RegExpExecArray | null
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) out.push({ text: s.slice(last, m.index) })
    if (m[1] != null) out.push({ text: m[1], bold: true })
    else out.push({ text: m[2] ?? m[3] ?? '', italic: true })
    last = re.lastIndex
  }
  if (last < s.length) out.push({ text: s.slice(last) })
  return out
}
