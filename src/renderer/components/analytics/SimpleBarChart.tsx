interface BarData {
  label: string
  value: number
}

interface SimpleBarChartProps {
  data: BarData[]
  maxValue?: number
  valueLabel?: string
}

export function SimpleBarChart({ data, maxValue, valueLabel = '' }: SimpleBarChartProps): JSX.Element {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1)

  return (
    <div className="space-y-2">
      {data.map((item) => {
        const width = max > 0 ? Math.round((item.value / max) * 100) : 0
        return (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--text-secondary)] w-24 truncate shrink-0" title={item.label}>
              {item.label}
            </span>
            <div className="flex-1 h-4 bg-[var(--bg-muted)] rounded overflow-hidden">
              <div
                className="h-full bg-[var(--brand-magenta)] rounded transition-all"
                style={{ width: `${width}%` }}
                role="meter"
                aria-label={`${item.label}: ${item.value}${valueLabel}`}
                aria-valuenow={item.value}
                aria-valuemin={0}
                aria-valuemax={max}
              />
            </div>
            <span className="text-[10px] text-[var(--text-primary)] w-10 text-right shrink-0">
              {item.value}{valueLabel}
            </span>
          </div>
        )
      })}
    </div>
  )
}
