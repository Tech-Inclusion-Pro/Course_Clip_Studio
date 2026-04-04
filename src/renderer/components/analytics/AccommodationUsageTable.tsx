interface AccommodationRow {
  accommodation: string
  learnerCount: number
  rate: number
}

interface AccommodationUsageTableProps {
  data: AccommodationRow[]
  totalLearners: number
}

export function AccommodationUsageTable({ data, totalLearners }: AccommodationUsageTableProps): JSX.Element {
  if (data.length === 0) {
    return (
      <p className="text-[10px] text-[var(--text-tertiary)]">No accommodation data available.</p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <caption className="sr-only">Accommodation usage by learners ({totalLearners} total)</caption>
        <thead>
          <tr>
            <th scope="col" className="text-left py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]">
              Accommodation
            </th>
            <th scope="col" className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]">
              Learners
            </th>
            <th scope="col" className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)] w-32">
              Usage Rate
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row.accommodation}>
              <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)]">
                {row.accommodation}
              </td>
              <td className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)]">
                {row.learnerCount}
              </td>
              <td className="py-1.5 px-2 border-b border-[var(--border-default)]">
                <div className="flex items-center gap-2 justify-end">
                  <div className="w-16 h-3 bg-[var(--bg-muted)] rounded overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-magenta)] rounded transition-all"
                      style={{ width: `${Math.min(row.rate, 100)}%` }}
                      role="meter"
                      aria-label={`${row.accommodation} usage rate`}
                      aria-valuenow={row.rate}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--text-primary)] w-8 text-right">
                    {row.rate}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
