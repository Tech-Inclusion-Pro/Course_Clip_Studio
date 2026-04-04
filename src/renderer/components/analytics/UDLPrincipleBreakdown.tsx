import { SimpleBarChart } from './SimpleBarChart'
import { DataTableToggle } from './DataTableToggle'

interface SubMetric {
  label: string
  value: number
}

interface UDLPrincipleBreakdownProps {
  principle: string
  totalRate: number
  metrics: SubMetric[]
}

export function UDLPrincipleBreakdown({ principle, totalRate, metrics }: UDLPrincipleBreakdownProps): JSX.Element {
  const barData = metrics.map((m) => ({ label: m.label, value: m.value }))
  const tableRows = metrics.map((m) => [m.label, `${m.value}%`])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {principle}
        </h4>
        <span className="text-[10px] text-[var(--text-tertiary)]">
          {totalRate}% of learners
        </span>
      </div>
      {metrics.length > 0 ? (
        <DataTableToggle
          caption={`${principle} metrics`}
          headers={['Metric', 'Rate']}
          rows={tableRows}
          chart={<SimpleBarChart data={barData} maxValue={100} valueLabel="%" />}
        />
      ) : (
        <p className="text-[10px] text-[var(--text-tertiary)]">No data for this principle yet.</p>
      )}
    </div>
  )
}
