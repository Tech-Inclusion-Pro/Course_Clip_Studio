import type { ObjectiveMasteryEntry } from '@/types/analytics'

interface ObjectiveMasteryTableProps {
  data: ObjectiveMasteryEntry[]
}

function getMasteryStatus(rate: number): { label: string; className: string } {
  if (rate >= 80) return { label: 'Mastered', className: 'text-green-600' }
  if (rate >= 50) return { label: 'Approaching', className: 'text-yellow-600' }
  return { label: 'Not Yet', className: 'text-red-600' }
}

export function ObjectiveMasteryTable({ data }: ObjectiveMasteryTableProps): JSX.Element {
  if (data.length === 0) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
        No objective mastery data. Requires Knowledge Check blocks with objectives assigned.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs border-collapse">
        <caption className="sr-only">Objective mastery breakdown</caption>
        <thead>
          <tr>
            <th scope="col" className="text-left py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]">
              Objective
            </th>
            <th scope="col" className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]">
              Mastery Rate
            </th>
            <th scope="col" className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]">
              Questions
            </th>
            <th scope="col" className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]">
              Avg Score
            </th>
            <th scope="col" className="text-left py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((entry) => {
            const status = getMasteryStatus(entry.masteryRate)
            return (
              <tr key={entry.objective}>
                <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] max-w-[160px] truncate" title={entry.objective}>
                  {entry.objective}
                </td>
                <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <div className="w-16 h-2 bg-[var(--bg-muted)] rounded overflow-hidden">
                      <div
                        className="h-full rounded bg-[var(--brand-magenta)]"
                        style={{ width: `${entry.masteryRate}%` }}
                      />
                    </div>
                    <span>{entry.masteryRate}%</span>
                  </div>
                </td>
                <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] text-right">
                  {entry.questionCount}
                </td>
                <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] text-right">
                  {entry.avgScore}%
                </td>
                <td className={`py-1.5 px-2 border-b border-[var(--border-default)] font-[var(--font-weight-medium)] ${status.className}`}>
                  {status.label}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
