import { CheckCircle2, XCircle } from 'lucide-react'
import { formatRatio } from '@/lib/contrast'
import type { ContrastReport } from '@/types/presentation'

interface ContrastReportPanelProps {
  report: ContrastReport
}

export function ContrastReportPanel({ report }: ContrastReportPanelProps): JSX.Element {
  return (
    <div className="rounded-lg border border-[var(--border-default)] overflow-hidden">
      <div className={`px-3 py-2 text-xs font-[var(--font-weight-semibold)] ${
        report.allPass
          ? 'bg-green-50 text-green-700 border-b border-green-200'
          : 'bg-red-50 text-red-700 border-b border-red-200'
      }`}>
        {report.allPass ? 'All contrast checks pass (WCAG AA)' : 'Some contrast checks fail'}
      </div>
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[var(--border-default)] bg-[var(--bg-muted)]">
            <th className="text-left px-3 py-1.5 font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Pair</th>
            <th className="text-left px-3 py-1.5 font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Colors</th>
            <th className="text-right px-3 py-1.5 font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Ratio</th>
            <th className="text-center px-3 py-1.5 font-[var(--font-weight-medium)] text-[var(--text-secondary)]">AA</th>
            <th className="text-center px-3 py-1.5 font-[var(--font-weight-medium)] text-[var(--text-secondary)]">AA Large</th>
          </tr>
        </thead>
        <tbody>
          {report.pairs.map((pair) => (
            <tr key={pair.label} className="border-b border-[var(--border-default)] last:border-0">
              <td className="px-3 py-1.5 text-[var(--text-primary)]">{pair.label}</td>
              <td className="px-3 py-1.5">
                <div className="flex items-center gap-1">
                  <span className="inline-block w-4 h-4 rounded border border-[var(--border-default)]" style={{ backgroundColor: pair.foreground }} />
                  <span className="text-[var(--text-tertiary)]">on</span>
                  <span className="inline-block w-4 h-4 rounded border border-[var(--border-default)]" style={{ backgroundColor: pair.background }} />
                </div>
              </td>
              <td className="px-3 py-1.5 text-right font-mono text-[var(--text-primary)]">{formatRatio(pair.ratio)}</td>
              <td className="px-3 py-1.5 text-center">
                {pair.passAA
                  ? <CheckCircle2 size={14} className="inline text-green-600" />
                  : <XCircle size={14} className="inline text-red-500" />
                }
              </td>
              <td className="px-3 py-1.5 text-center">
                {pair.passAALarge
                  ? <CheckCircle2 size={14} className="inline text-green-600" />
                  : <XCircle size={14} className="inline text-red-500" />
                }
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
