import { CheckCircle } from 'lucide-react'
import type { AnswerDistributionEntry } from '@/types/analytics'

interface AnswerDistributionChartProps {
  data: AnswerDistributionEntry[]
}

export function AnswerDistributionChart({ data }: AnswerDistributionChartProps): JSX.Element {
  if (data.length === 0) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] py-2 text-center">
        No choice data available.
      </p>
    )
  }

  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="space-y-1.5" role="list" aria-label="Answer distribution">
      {data.map((item) => {
        const width = max > 0 ? Math.round((item.count / max) * 100) : 0
        return (
          <div
            key={item.choiceId}
            className="flex items-center gap-2"
            role="listitem"
          >
            <span className="text-[10px] text-[var(--text-secondary)] w-16 truncate shrink-0 flex items-center gap-1" title={item.choiceLabel}>
              {item.isCorrect && <CheckCircle size={10} className="text-green-600 shrink-0" />}
              {item.choiceLabel}
            </span>
            <div className="flex-1 h-4 bg-[var(--bg-muted)] rounded overflow-hidden">
              <div
                className={`h-full rounded transition-all ${
                  item.isCorrect
                    ? 'bg-green-500 border-r-2 border-green-700'
                    : 'bg-[var(--brand-magenta)]'
                }`}
                style={{ width: `${width}%` }}
                role="meter"
                aria-label={`${item.choiceLabel}: ${item.count} (${item.percentage}%)`}
                aria-valuenow={item.count}
                aria-valuemin={0}
                aria-valuemax={max}
              />
            </div>
            <span className="text-[10px] text-[var(--text-primary)] w-14 text-right shrink-0">
              {item.count} ({item.percentage}%)
            </span>
          </div>
        )
      })}
    </div>
  )
}
