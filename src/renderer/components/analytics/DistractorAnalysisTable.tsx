import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react'
import type { DistractorAnalysis } from '@/types/analytics'

interface DistractorAnalysisTableProps {
  distractors: DistractorAnalysis[]
  totalAttempts: number
}

const FLAG_STYLES = {
  effective: { icon: CheckCircle2, color: 'text-green-600', label: 'Effective' },
  'non-functional': { icon: AlertTriangle, color: 'text-amber-600', label: 'Non-functional' },
  implausible: { icon: XCircle, color: 'text-red-600', label: 'Implausible' }
} as const

export function DistractorAnalysisTable({
  distractors,
  totalAttempts
}: DistractorAnalysisTableProps): JSX.Element {
  // Sort: correct first, then by count descending
  const sorted = [...distractors].sort((a, b) => {
    if (a.isCorrect !== b.isCorrect) return a.isCorrect ? -1 : 1
    return b.selectedCount - a.selectedCount
  })

  return (
    <div>
      <h4 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
        Answer Choice Distribution
      </h4>
      <table className="w-full text-xs" aria-label="Distractor analysis">
        <thead>
          <tr className="border-b border-[var(--border-default)]">
            <th scope="col" className="px-2 py-1.5 text-left text-[var(--text-tertiary)] font-[var(--font-weight-medium)]">Choice</th>
            <th scope="col" className="px-2 py-1.5 text-center text-[var(--text-tertiary)] font-[var(--font-weight-medium)]">Selected</th>
            <th scope="col" className="px-2 py-1.5 text-center text-[var(--text-tertiary)] font-[var(--font-weight-medium)]">Rate</th>
            <th scope="col" className="px-2 py-1.5 text-center text-[var(--text-tertiary)] font-[var(--font-weight-medium)]">Point-Biserial</th>
            <th scope="col" className="px-2 py-1.5 text-center text-[var(--text-tertiary)] font-[var(--font-weight-medium)]">Status</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((d) => {
            const flagCfg = d.isCorrect ? null : FLAG_STYLES[d.flag]
            const FlagIcon = flagCfg?.icon

            return (
              <tr key={d.choiceId} className="border-b border-[var(--border-default)]/50">
                <td className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    {d.isCorrect && <CheckCircle2 size={12} className="text-green-600 shrink-0" />}
                    <span className={d.isCorrect ? 'font-[var(--font-weight-medium)] text-green-700' : 'text-[var(--text-secondary)]'}>
                      {d.choiceLabel}
                    </span>
                    {d.isCorrect && <span className="text-green-600 text-[10px]">(correct)</span>}
                  </div>
                </td>
                <td className="px-2 py-1.5 text-center text-[var(--text-secondary)]">
                  {d.selectedCount}
                </td>
                <td className="px-2 py-1.5 text-center">
                  <div className="flex items-center gap-1.5 justify-center">
                    <span className="text-[var(--text-secondary)]">{Math.round(d.selectedRate * 100)}%</span>
                    <div className="w-12 h-1.5 rounded-full bg-[var(--border-default)] overflow-hidden">
                      <div
                        className={`h-full rounded-full ${d.isCorrect ? 'bg-green-500' : 'bg-slate-400'}`}
                        style={{ width: `${Math.round(d.selectedRate * 100)}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-2 py-1.5 text-center text-[var(--text-secondary)]">
                  {d.pointBiserial.toFixed(2)}
                </td>
                <td className="px-2 py-1.5 text-center">
                  {d.isCorrect ? (
                    <span className="text-green-600 text-[10px] font-[var(--font-weight-medium)]">Correct</span>
                  ) : flagCfg && FlagIcon ? (
                    <span className={`inline-flex items-center gap-0.5 ${flagCfg.color}`}>
                      <FlagIcon size={10} />
                      <span className="text-[10px]">{flagCfg.label}</span>
                    </span>
                  ) : null}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
