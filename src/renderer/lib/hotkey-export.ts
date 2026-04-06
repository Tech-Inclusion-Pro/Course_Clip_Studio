import type { HotkeyCategory, HotkeyDefinition } from '@/types/hotkeys'
import { formatKeyForDisplay } from './hotkey-utils'

const CATEGORY_LABELS: Record<HotkeyCategory, string> = {
  global: 'Global Shortcuts',
  recording: 'Recording Panel',
  'slide-editor': 'Slide Editor',
  timeline: 'Timeline Editor',
  text: 'Text Formatting',
  media: 'Media Library',
  syllabus: 'Syllabus Builder',
  export: 'Export',
  accessibility: 'Accessibility'
}

const CATEGORY_ORDER: HotkeyCategory[] = [
  'global', 'recording', 'slide-editor', 'timeline',
  'text', 'media', 'syllabus', 'export', 'accessibility'
]

function groupByCategory(hotkeys: HotkeyDefinition[]): Record<string, HotkeyDefinition[]> {
  const grouped: Record<string, HotkeyDefinition[]> = {}
  for (const cat of CATEGORY_ORDER) {
    const items = hotkeys.filter((h) => h.category === cat)
    if (items.length > 0) grouped[cat] = items
  }
  return grouped
}

// ─── Markdown Export ───
export function generateMarkdown(hotkeys: HotkeyDefinition[]): string {
  const grouped = groupByCategory(hotkeys)
  const lines: string[] = [
    '# Course Clip Studio — Keyboard Shortcuts',
    '',
    `*Exported: ${new Date().toLocaleDateString()}*`,
    ''
  ]

  for (const [cat, items] of Object.entries(grouped)) {
    lines.push(`## ${CATEGORY_LABELS[cat as HotkeyCategory] ?? cat}`)
    lines.push('')
    lines.push('| Action | Mac | Windows / Linux |')
    lines.push('|---|---|---|')
    for (const h of items) {
      const mac = h.current.mac || '—'
      const win = h.current.windows || '—'
      lines.push(`| ${h.label} | \`${mac}\` | \`${win}\` |`)
    }
    lines.push('')
  }

  return lines.join('\n')
}

// ─── HTML Export ───
export function generateHTML(hotkeys: HotkeyDefinition[]): string {
  const grouped = groupByCategory(hotkeys)
  const date = new Date().toLocaleDateString()

  let tableRows = ''
  for (const [cat, items] of Object.entries(grouped)) {
    const label = CATEGORY_LABELS[cat as HotkeyCategory] ?? cat
    tableRows += `<tr class="category-header"><td colspan="3">${label}</td></tr>\n`
    for (const h of items) {
      const mac = h.current.mac ? `<kbd>${formatKeyForDisplay(h.current.mac, 'mac')}</kbd>` : '<span class="unassigned">—</span>'
      const win = h.current.windows ? `<kbd>${h.current.windows}</kbd>` : '<span class="unassigned">—</span>'
      tableRows += `<tr><td>${h.label}</td><td>${mac}</td><td>${win}</td></tr>\n`
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Course Clip Studio — Keyboard Shortcuts</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; max-width: 900px; margin: 0 auto; padding: 40px 24px; }
  h1 { font-size: 24px; margin-bottom: 4px; }
  .subtitle { color: #666; font-size: 13px; margin-bottom: 32px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; padding: 8px 12px; border-bottom: 2px solid #333; font-weight: 600; }
  td { padding: 6px 12px; border-bottom: 1px solid #e5e5e5; }
  tr.category-header td { font-weight: 700; font-size: 15px; padding: 16px 12px 8px; border-bottom: 2px solid #a23b84; color: #a23b84; background: #fdf2f8; }
  kbd { display: inline-block; padding: 2px 6px; font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; font-size: 12px; border: 1px solid #d1d5db; border-radius: 4px; background: #f9fafb; box-shadow: 0 1px 0 #d1d5db; }
  .unassigned { color: #9ca3af; font-style: italic; }
  @media print { body { padding: 20px; } .no-print { display: none; } }
</style>
</head>
<body>
<h1>Course Clip Studio — Keyboard Shortcuts</h1>
<p class="subtitle">Exported: ${date}</p>
<table>
<thead><tr><th>Action</th><th>Mac</th><th>Windows / Linux</th></tr></thead>
<tbody>
${tableRows}
</tbody>
</table>
</body>
</html>`
}

// ─── PDF Export (via HTML print) ───
export function generatePDF(hotkeys: HotkeyDefinition[]): void {
  const html = generateHTML(hotkeys)
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.onload = () => {
    printWindow.print()
  }
}

// ─── Download helper ───
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
