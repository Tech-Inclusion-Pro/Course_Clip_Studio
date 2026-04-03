import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Bar, Line, Pie, Doughnut, Radar, PolarArea } from 'react-chartjs-2'
import type { ChartBlock, ChartDataset } from '@/types/course'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, RadialLinearScale, Tooltip, Legend, Filler)

const CHART_TYPES: ChartBlock['chartType'][] = ['bar', 'line', 'pie', 'doughnut', 'radar', 'polarArea']
const DEFAULT_COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899']

interface ChartBlockEditorProps {
  block: ChartBlock
  onUpdate: (partial: Partial<ChartBlock>) => void
}

export function ChartBlockEditor({ block, onUpdate }: ChartBlockEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<'data' | 'settings'>('data')

  function updateLabel(index: number, value: string) {
    const labels = [...block.labels]
    labels[index] = value
    onUpdate({ labels })
  }

  function addLabel() {
    onUpdate({ labels: [...block.labels, `Label ${block.labels.length + 1}`] })
    // Extend all datasets
    const datasets = block.datasets.map((ds) => ({ ...ds, data: [...ds.data, 0] }))
    onUpdate({ labels: [...block.labels, `Label ${block.labels.length + 1}`], datasets })
  }

  function removeLabel(index: number) {
    const labels = block.labels.filter((_, i) => i !== index)
    const datasets = block.datasets.map((ds) => ({ ...ds, data: ds.data.filter((_, i) => i !== index) }))
    onUpdate({ labels, datasets })
  }

  function updateDataPoint(dsIndex: number, pointIndex: number, value: string) {
    const datasets = block.datasets.map((ds, i) => {
      if (i !== dsIndex) return ds
      const data = [...ds.data]
      data[pointIndex] = parseFloat(value) || 0
      return { ...ds, data }
    })
    onUpdate({ datasets })
  }

  function updateDatasetLabel(dsIndex: number, label: string) {
    const datasets = block.datasets.map((ds, i) => (i === dsIndex ? { ...ds, label } : ds))
    onUpdate({ datasets })
  }

  function addDataset() {
    const ds: ChartDataset = {
      label: `Series ${block.datasets.length + 1}`,
      data: block.labels.map(() => 0),
      backgroundColor: DEFAULT_COLORS[block.datasets.length % DEFAULT_COLORS.length],
      borderColor: DEFAULT_COLORS[block.datasets.length % DEFAULT_COLORS.length]
    }
    onUpdate({ datasets: [...block.datasets, ds] })
  }

  function removeDataset(index: number) {
    onUpdate({ datasets: block.datasets.filter((_, i) => i !== index) })
  }

  const chartData = {
    labels: block.labels,
    datasets: block.datasets.map((ds, i) => ({
      label: ds.label,
      data: ds.data,
      backgroundColor: ds.backgroundColor || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      borderColor: ds.borderColor || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      borderWidth: 2,
      fill: block.chartType === 'radar'
    }))
  }

  const ChartComponent = { bar: Bar, line: Line, pie: Pie, doughnut: Doughnut, radar: Radar, polarArea: PolarArea }[block.chartType]

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Chart block editor">
      {/* Chart type selector */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        {CHART_TYPES.map((ct) => (
          <button
            key={ct}
            onClick={() => onUpdate({ chartType: ct })}
            className={`px-2 py-1 text-xs rounded cursor-pointer ${block.chartType === ct ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-[var(--font-weight-medium)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
          >
            {ct}
          </button>
        ))}
      </div>

      {/* Tabs: Data / Settings */}
      <div className="flex border-b border-[var(--border-default)]">
        {(['data', 'settings'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-xs font-[var(--font-weight-medium)] border-b-2 cursor-pointer ${activeTab === tab ? 'border-[var(--brand-magenta)] text-[var(--text-primary)]' : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'}`}
          >
            {tab === 'data' ? 'Data' : 'Settings'}
          </button>
        ))}
      </div>

      {activeTab === 'data' && (
        <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
          {/* Data grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-1 text-[var(--text-tertiary)]">Label</th>
                  {block.datasets.map((ds, i) => (
                    <th key={i} className="p-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={ds.label}
                          onChange={(e) => updateDatasetLabel(i, e.target.value)}
                          className="w-20 px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                        />
                        {block.datasets.length > 1 && (
                          <button onClick={() => removeDataset(i)} className="text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer">
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="p-1">
                    <button onClick={addDataset} className="text-[var(--brand-magenta)] cursor-pointer"><Plus size={12} /></button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {block.labels.map((label, li) => (
                  <tr key={li}>
                    <td className="p-1">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={label}
                          onChange={(e) => updateLabel(li, e.target.value)}
                          className="w-20 px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                        />
                        <button onClick={() => removeLabel(li)} className="text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer">
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </td>
                    {block.datasets.map((ds, di) => (
                      <td key={di} className="p-1">
                        <input
                          type="number"
                          value={ds.data[li] ?? 0}
                          onChange={(e) => updateDataPoint(di, li, e.target.value)}
                          className="w-16 px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] text-right"
                        />
                      </td>
                    ))}
                    <td />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={addLabel} className="flex items-center gap-1 text-xs text-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] px-2 py-1 rounded cursor-pointer">
            <Plus size={12} /> Add Row
          </button>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="p-3 space-y-3">
          <label className="block text-xs text-[var(--text-secondary)]">
            Accessible Summary
            <textarea
              value={block.accessibleSummary}
              onChange={(e) => onUpdate({ accessibleSummary: e.target.value })}
              rows={2}
              className="mt-1 w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
              placeholder="Describe what this chart shows for screen readers..."
            />
          </label>
          <div className="flex gap-3">
            <label className="block text-xs text-[var(--text-secondary)] flex-1">
              X-Axis Label
              <input
                type="text"
                value={block.xAxisLabel || ''}
                onChange={(e) => onUpdate({ xAxisLabel: e.target.value })}
                className="mt-1 w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </label>
            <label className="block text-xs text-[var(--text-secondary)] flex-1">
              Y-Axis Label
              <input
                type="text"
                value={block.yAxisLabel || ''}
                onChange={(e) => onUpdate({ yAxisLabel: e.target.value })}
                className="mt-1 w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </label>
          </div>
          {!block.accessibleSummary && (
            <p className="text-xs text-[var(--color-danger-600)]">Accessible summary is required for screen readers</p>
          )}
        </div>
      )}

      {/* Chart preview */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Preview</p>
        <div className="p-3 rounded-lg border border-[var(--border-default)] bg-white dark:bg-[#1e1e2e]" style={{ maxHeight: 300 }}>
          <ChartComponent data={chartData} options={{ responsive: true, maintainAspectRatio: true, plugins: { legend: { display: block.datasets.length > 1 } } }} />
        </div>
      </div>
    </div>
  )
}
