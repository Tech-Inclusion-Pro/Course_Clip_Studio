// ─── Chart & table data helpers ───
// Parses CSV/tabular text into ChartSpec/TableSpec, builds chart.js configs for the
// live preview, and renders a chart to a PNG data URL for PPTX/PDF export.

import type {
  ChartSpec,
  TableSpec,
  ChartKind,
  PresentationTheme
} from '@/types/presentation'

/** Split delimited text (comma or tab) into a trimmed 2-D array, skipping blanks. */
export function parseDelimited(text: string): string[][] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/[\t,]/).map((c) => c.trim()))
}

/** First row = header (label-col name + series names); each row = label + numbers. */
export function csvToChart(text: string, kind: ChartKind, summary = ''): ChartSpec {
  const rows = parseDelimited(text)
  if (rows.length < 2) return emptyChart(kind)
  const [header, ...body] = rows
  const seriesNames = header.slice(1)
  const labels = body.map((r) => r[0] ?? '')
  const series = seriesNames.map((name, i) => ({
    label: name,
    data: body.map((r) => Number(r[i + 1] ?? 0) || 0)
  }))
  return { kind, title: '', labels, series, summary }
}

export function csvToTable(text: string, summary = ''): TableSpec {
  const rows = parseDelimited(text)
  if (rows.length === 0) return { headers: [], rows: [], summary }
  return { headers: rows[0], rows: rows.slice(1), summary }
}

/** Serialize a ChartSpec back to CSV for the editor textarea. */
export function chartToCsv(spec: ChartSpec): string {
  const header = ['', ...spec.series.map((s) => s.label)].join(',')
  const lines = spec.labels.map((label, i) =>
    [label, ...spec.series.map((s) => s.data[i] ?? '')].join(',')
  )
  return [header, ...lines].join('\n')
}

export function tableToCsv(spec: TableSpec): string {
  return [spec.headers, ...spec.rows].map((r) => r.join(',')).join('\n')
}

export function emptyChart(kind: ChartKind = 'bar'): ChartSpec {
  return {
    kind,
    title: '',
    labels: ['A', 'B', 'C'],
    series: [{ label: 'Series 1', data: [3, 5, 2] }],
    summary: ''
  }
}

export function emptyTable(): TableSpec {
  return { headers: ['Column 1', 'Column 2'], rows: [['', '']], summary: '' }
}

/** Palette derived from the theme, cycled across series. */
function palette(theme: PresentationTheme): string[] {
  return [theme.accent, theme.accentSecondary, '#6f2fa6', '#2e7d4f', '#ed6c02', '#0277bd']
}

/** Build a chart.js data + options object for preview or offscreen render. */
export function chartToChartJsConfig(spec: ChartSpec, theme: PresentationTheme) {
  const colors = palette(theme)
  const isPie = spec.kind === 'pie'
  const data = {
    labels: spec.labels,
    datasets: spec.series.map((s, i) => ({
      label: s.label,
      data: s.data,
      backgroundColor: isPie ? spec.labels.map((_, j) => colors[j % colors.length]) : colors[i % colors.length],
      borderColor: colors[i % colors.length],
      borderWidth: spec.kind === 'line' ? 2 : 1,
      fill: false
    }))
  }
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: spec.series.length > 1 || isPie, labels: { color: theme.textPrimary } },
      title: { display: !!spec.title, text: spec.title, color: theme.textPrimary }
    },
    scales: isPie
      ? undefined
      : {
          x: { ticks: { color: theme.textPrimary }, grid: { display: false } },
          y: { ticks: { color: theme.textPrimary }, beginAtZero: true }
        }
  }
  return { type: spec.kind, data, options }
}

/** Render a chart off-screen to a PNG data URL (for PPTX/PDF embedding). */
export async function chartToPngDataUrl(
  spec: ChartSpec,
  theme: PresentationTheme,
  width = 900,
  height = 520
): Promise<string> {
  const { Chart } = await import('chart.js/auto')
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  // Paint the theme background so the exported image isn't transparent.
  ctx.fillStyle = theme.background
  ctx.fillRect(0, 0, width, height)
  const cfg = chartToChartJsConfig(spec, theme)
  const chart = new Chart(ctx, { ...cfg, options: { ...cfg.options, animation: false, responsive: false } } as never)
  const url = canvas.toDataURL('image/png')
  chart.destroy()
  return url
}
