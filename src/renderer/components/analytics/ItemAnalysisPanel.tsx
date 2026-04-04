import { useState } from 'react'
import { AlertCircle, CheckCircle2, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react'
import type { ItemAnalysisSummary, ItemAnalysisEntry } from '@/types/analytics'
import { DistractorAnalysisTable } from './DistractorAnalysisTable'
import { DataTableToggle } from './DataTableToggle'

interface ItemAnalysisPanelProps {
  summary: ItemAnalysisSummary
}

const FLAG_CONFIG = {
  good: { icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50', label: 'Good' },
  review: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50', label: 'Needs Review' },
  poor: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', label: 'Poor' }
} as const

export function ItemAnalysisPanel({ summary }: ItemAnalysisPanelProps): JSX.Element {
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  return (
    <div className="space-y-4">
      {/* Summary metrics */}
      <div className="grid grid-cols-4 gap-3">
        <MetricBox label="Items Analyzed" value={String(summary.items.length)} />
        <MetricBox label="Avg Difficulty" value={`${Math.round(summary.averageDifficulty * 100)}%`} />
        <MetricBox label="Avg Discrimination" value={summary.averageDiscrimination.toFixed(2)} />
        <MetricBox
          label="Items Flagged"
          value={String(summary.flaggedItemCount)}
          highlight={summary.flaggedItemCount > 0}
        />
      </div>

      {summary.overallReliability > 0 && (
        <div className="text-xs text-[var(--text-tertiary)]">
          Estimated reliability (KR-20): {summary.overallReliability.toFixed(2)}
        </div>
      )}

      {/* Item list */}
      <div className="border border-[var(--border-default)] rounded-lg overflow-hidden">
        <table className="w-full text-sm" aria-label="Item analysis results">
          <thead>
            <tr className="bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
              <th scope="col" className="px-3 py-2 text-left font-[var(--font-weight-medium)] text-[var(--text-primary)]">Question</th>
              <th scope="col" className="px-3 py-2 text-center font-[var(--font-weight-medium)] text-[var(--text-primary)]">Difficulty</th>
              <th scope="col" className="px-3 py-2 text-center font-[var(--font-weight-medium)] text-[var(--text-primary)]">Discrimination</th>
              <th scope="col" className="px-3 py-2 text-center font-[var(--font-weight-medium)] text-[var(--text-primary)]">Attempts</th>
              <th scope="col" className="px-3 py-2 text-center font-[var(--font-weight-medium)] text-[var(--text-primary)]">Status</th>
            </tr>
          </thead>
          <tbody>
            {summary.items.map((item) => {
              const isExpanded = expandedItem === item.questionId
              const cfg = FLAG_CONFIG[item.flag]
              const FlagIcon = cfg.icon

              return (
                <Fragment key={item.questionId}>
                  <tr
                    className="border-b border-[var(--border-default)] hover:bg-[var(--bg-muted)]/50 cursor-pointer"
                    onClick={() => setExpandedItem(isExpanded ? null : item.questionId)}
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <span className="text-[var(--text-primary)] truncate max-w-[240px]" title={item.questionPrompt}>
                          {item.questionPrompt}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <DifficultyBadge value={item.difficultyIndex} />
                    </td>
                    <td className="px-3 py-2 text-center text-[var(--text-secondary)]">
                      {item.discriminationIndex.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center text-[var(--text-secondary)]">
                      {item.totalAttempts}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${cfg.bg} ${cfg.color}`}>
                        <FlagIcon size={12} />
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr>
                      <td colSpan={5} className="px-4 py-3 bg-[var(--bg-muted)]/30">
                        <ItemDetail item={item} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Sub-components ───

import { Fragment } from 'react'

function MetricBox({ label, value, highlight }: { label: string; value: string; highlight?: boolean }): JSX.Element {
  return (
    <div className="bg-[var(--bg-muted)] rounded-lg p-3 text-center">
      <div className={`text-lg font-[var(--font-weight-bold)] ${highlight ? 'text-amber-600' : 'text-[var(--text-primary)]'}`}>
        {value}
      </div>
      <div className="text-xs text-[var(--text-tertiary)]">{label}</div>
    </div>
  )
}

function DifficultyBadge({ value }: { value: number }): JSX.Element {
  const pct = Math.round(value * 100)
  let color = 'text-green-600'
  if (value < 0.2) color = 'text-red-600'
  else if (value > 0.8) color = 'text-amber-600'
  else if (value < 0.4) color = 'text-amber-600'

  return <span className={`font-[var(--font-weight-medium)] ${color}`}>{pct}%</span>
}

function ItemDetail({ item }: { item: ItemAnalysisEntry }): JSX.Element {
  return (
    <div className="space-y-3">
      {item.flagReason && (
        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
          <AlertTriangle size={12} className="shrink-0 mt-0.5" />
          {item.flagReason}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-[var(--text-tertiary)]">Point-Biserial (correct):</span>{' '}
          <span className="font-[var(--font-weight-medium)]">{item.pointBiserialCorrect.toFixed(2)}</span>
        </div>
        <div>
          <span className="text-[var(--text-tertiary)]">Correct:</span>{' '}
          <span className="font-[var(--font-weight-medium)]">{item.correctCount} of {item.totalAttempts}</span>
        </div>
        <div>
          <span className="text-[var(--text-tertiary)]">Block:</span>{' '}
          <span className="font-[var(--font-weight-medium)]">{item.blockName}</span>
        </div>
      </div>

      <DistractorAnalysisTable distractors={item.distractors} totalAttempts={item.totalAttempts} />
    </div>
  )
}
