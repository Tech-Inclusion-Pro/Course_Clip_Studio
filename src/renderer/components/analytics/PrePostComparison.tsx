import type { PrePostComparisonEntry } from '@/types/analytics'
import { DataTableToggle } from './DataTableToggle'

interface PrePostComparisonProps {
  data: PrePostComparisonEntry[]
}

export function PrePostComparison({ data }: PrePostComparisonProps): JSX.Element {
  if (data.length === 0) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
        No pre/post comparison data. Requires Knowledge Check blocks with both pre and post phases.
      </p>
    )
  }

  const maxScore = 100

  const tableRows = data.map((d) => [
    d.objective,
    `${d.preScore}%`,
    `${d.postScore}%`,
    `${d.delta > 0 ? '+' : ''}${d.delta}%`,
    d.learnerCount
  ])

  const chart = (
    <div className="space-y-3" role="list" aria-label="Pre/post score comparison">
      {data.map((entry) => (
        <div key={entry.objective} className="space-y-1" role="listitem">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-[60%]" title={entry.objective}>
              {entry.objective}
            </span>
            <span className={`text-[10px] font-[var(--font-weight-semibold)] ${
              entry.delta > 0 ? 'text-green-600' : entry.delta < 0 ? 'text-red-600' : 'text-[var(--text-tertiary)]'
            }`}>
              {entry.delta > 0 ? '+' : ''}{entry.delta}%
            </span>
          </div>
          <div className="flex gap-1 items-center">
            {/* Pre bar */}
            <div className="flex-1 h-3 bg-[var(--bg-muted)] rounded overflow-hidden" title={`Pre: ${entry.preScore}%`}>
              <div
                className="h-full rounded bg-[var(--brand-magenta)] opacity-40"
                style={{ width: `${(entry.preScore / maxScore) * 100}%`, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)' }}
                role="meter"
                aria-label={`Pre score: ${entry.preScore}%`}
                aria-valuenow={entry.preScore}
                aria-valuemin={0}
                aria-valuemax={maxScore}
              />
            </div>
            <span className="text-[9px] text-[var(--text-tertiary)] w-8 text-right shrink-0">{entry.preScore}%</span>
          </div>
          <div className="flex gap-1 items-center">
            {/* Post bar */}
            <div className="flex-1 h-3 bg-[var(--bg-muted)] rounded overflow-hidden" title={`Post: ${entry.postScore}%`}>
              <div
                className="h-full rounded bg-[var(--brand-magenta)]"
                style={{ width: `${(entry.postScore / maxScore) * 100}%` }}
                role="meter"
                aria-label={`Post score: ${entry.postScore}%`}
                aria-valuenow={entry.postScore}
                aria-valuemin={0}
                aria-valuemax={maxScore}
              />
            </div>
            <span className="text-[9px] text-[var(--text-tertiary)] w-8 text-right shrink-0">{entry.postScore}%</span>
          </div>
          <div className="flex gap-3 text-[9px] text-[var(--text-tertiary)]">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[var(--brand-magenta)] opacity-40" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 1px, rgba(255,255,255,0.3) 1px, rgba(255,255,255,0.3) 2px)' }} />
              Pre
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[var(--brand-magenta)]" />
              Post
            </span>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <DataTableToggle
      caption="Pre/post assessment comparison"
      headers={['Objective', 'Pre Score', 'Post Score', 'Delta', 'Learners']}
      rows={tableRows}
      chart={chart}
    />
  )
}
