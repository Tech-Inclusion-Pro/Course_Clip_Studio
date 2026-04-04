import { useState } from 'react'
import { Table, BarChart3 } from 'lucide-react'

interface DataTableToggleProps {
  chart: React.ReactNode
  headers: string[]
  rows: (string | number)[][]
  caption: string
}

export function DataTableToggle({ chart, headers, rows, caption }: DataTableToggleProps): JSX.Element {
  const [showTable, setShowTable] = useState(false)

  return (
    <div>
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setShowTable(!showTable)}
          className="flex items-center gap-1 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          aria-label={showTable ? 'View as chart' : 'View as table'}
        >
          {showTable ? <BarChart3 size={12} /> : <Table size={12} />}
          {showTable ? 'View as Chart' : 'View as Table'}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                {headers.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="text-left py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td
                      key={j}
                      className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)]"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        chart
      )}
    </div>
  )
}
