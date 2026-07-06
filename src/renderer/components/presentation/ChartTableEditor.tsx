/**
 * Compact CSV-based editor for chart and table slides. A required text summary
 * doubles as the accessibility alternative (enforced at the render step).
 */

import { usePresentationStore } from '@/stores/usePresentationStore'
import {
  csvToChart,
  csvToTable,
  chartToCsv,
  tableToCsv,
  emptyChart,
  emptyTable
} from '@/lib/presentation/chart-data'
import type { SlideDraft, ChartKind } from '@/types/presentation'

const CHART_KINDS: { value: ChartKind; label: string }[] = [
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'pie', label: 'Pie' }
]

export function ChartTableEditor({ slide }: { slide: SlideDraft }): JSX.Element | null {
  const updateSlide = usePresentationStore((s) => s.updateSlide)

  if (slide.layoutHint === 'chart') {
    const chart = slide.chart ?? emptyChart()
    return (
      <div className="space-y-2 mb-2">
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--text-secondary)]">Chart type</label>
          <select
            value={chart.kind}
            onChange={(e) =>
              updateSlide(slide.id, { chart: { ...chart, kind: e.target.value as ChartKind } })
            }
            className="px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            {CHART_KINDS.map((k) => (
              <option key={k.value} value={k.value}>{k.label}</option>
            ))}
          </select>
        </div>
        <textarea
          value={chartToCsv(chart)}
          onChange={(e) =>
            updateSlide(slide.id, { chart: csvToChart(e.target.value, chart.kind, chart.summary) })
          }
          rows={4}
          placeholder={'Label,Series 1,Series 2\nQ1,100,60\nQ2,120,70'}
          className="w-full px-2 py-1.5 text-xs font-mono rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-y"
        />
        <input
          type="text"
          value={chart.summary}
          onChange={(e) => updateSlide(slide.id, { chart: { ...chart, summary: e.target.value } })}
          placeholder="Text summary of the chart (required for accessibility)"
          className={`w-full px-2 py-1 text-xs rounded border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] ${
            chart.summary.trim() ? 'border-[var(--border-default)]' : 'border-red-400'
          }`}
        />
      </div>
    )
  }

  if (slide.layoutHint === 'table') {
    const table = slide.table ?? emptyTable()
    return (
      <div className="space-y-2 mb-2">
        <textarea
          value={tableToCsv(table)}
          onChange={(e) => updateSlide(slide.id, { table: csvToTable(e.target.value, table.summary) })}
          rows={4}
          placeholder={'Header 1,Header 2\nCell,Cell\nCell,Cell'}
          className="w-full px-2 py-1.5 text-xs font-mono rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-y"
        />
        <input
          type="text"
          value={table.summary}
          onChange={(e) => updateSlide(slide.id, { table: { ...table, summary: e.target.value } })}
          placeholder="Text summary of the table (required for accessibility)"
          className={`w-full px-2 py-1 text-xs rounded border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] ${
            table.summary.trim() ? 'border-[var(--border-default)]' : 'border-red-400'
          }`}
        />
      </div>
    )
  }

  return null
}
