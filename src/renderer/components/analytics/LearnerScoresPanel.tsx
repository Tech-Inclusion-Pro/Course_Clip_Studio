import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { LearnerScoreEntry } from '@/types/analytics'

interface LearnerScoresPanelProps {
  data: LearnerScoreEntry[]
}

type SortKey = 'learner' | 'overallScore' | 'completionPercent'
type SortDir = 'asc' | 'desc'

function anonymize(_actorId: string, index: number): string {
  return `Learner ${String(index + 1).padStart(3, '0')}`
}

export function LearnerScoresPanel({ data }: LearnerScoresPanelProps): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('overallScore')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  if (data.length === 0) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
        No learner score data available.
      </p>
    )
  }

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...data].sort((a, b) => {
    let cmp = 0
    switch (sortKey) {
      case 'overallScore':
        cmp = a.overallScore - b.overallScore
        break
      case 'completionPercent':
        cmp = a.completionPercent - b.completionPercent
        break
      default:
        cmp = a.actorId.localeCompare(b.actorId)
    }
    return sortDir === 'asc' ? cmp : -cmp
  })

  const sortIndicator = (key: SortKey) =>
    sortKey === key ? (sortDir === 'asc' ? ' \u2191' : ' \u2193') : ''

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] cursor-pointer hover:text-[var(--brand-magenta)] transition-colors"
        aria-expanded={expanded}
      >
        {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        Learner Scores ({data.length} learner{data.length !== 1 ? 's' : ''})
      </button>

      {expanded && (
        <div className="mt-2 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <caption className="sr-only">Per-learner score breakdown</caption>
            <thead>
              <tr>
                <th scope="col" className="text-left py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)]" />
                <th
                  scope="col"
                  className="text-left py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)] cursor-pointer hover:text-[var(--text-primary)]"
                  onClick={() => handleSort('learner')}
                >
                  Learner{sortIndicator('learner')}
                </th>
                <th
                  scope="col"
                  className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)] cursor-pointer hover:text-[var(--text-primary)]"
                  onClick={() => handleSort('overallScore')}
                >
                  Overall Score{sortIndicator('overallScore')}
                </th>
                <th
                  scope="col"
                  className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)] cursor-pointer hover:text-[var(--text-primary)]"
                  onClick={() => handleSort('completionPercent')}
                >
                  Completion{sortIndicator('completionPercent')}
                </th>
                {/* Dynamic assessment columns from first learner */}
                {sorted[0]?.assessmentScores.map((a) => (
                  <th
                    key={a.blockId}
                    scope="col"
                    className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)] font-[var(--font-weight-medium)] max-w-[80px] truncate"
                    title={a.blockName}
                  >
                    {a.blockName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((learner, idx) => {
                const isExpanded = expandedRow === learner.actorId
                return (
                  <LearnerRow
                    key={learner.actorId}
                    learner={learner}
                    label={anonymize(learner.actorId, idx)}
                    isExpanded={isExpanded}
                    onToggle={() => setExpandedRow(isExpanded ? null : learner.actorId)}
                  />
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function LearnerRow({
  learner,
  label,
  isExpanded,
  onToggle
}: {
  learner: LearnerScoreEntry
  label: string
  isExpanded: boolean
  onToggle: () => void
}): JSX.Element {
  return (
    <>
      <tr className="hover:bg-[var(--bg-hover)] transition-colors">
        <td className="py-1.5 px-2 border-b border-[var(--border-default)]">
          <button
            onClick={onToggle}
            className="cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        </td>
        <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] font-[var(--font-weight-medium)]">
          {label}
        </td>
        <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] text-right">
          {learner.overallScore}%
        </td>
        <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] text-right">
          {learner.completionPercent}%
        </td>
        {learner.assessmentScores.map((a) => (
          <td
            key={a.blockId}
            className={`py-1.5 px-2 border-b border-[var(--border-default)] text-right ${
              a.passed ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {a.score}%
          </td>
        ))}
      </tr>

      {isExpanded && (
        <tr>
          <td colSpan={4 + learner.assessmentScores.length} className="py-2 px-4 border-b border-[var(--border-default)] bg-[var(--bg-muted)]">
            <div className="space-y-2">
              {/* Assessment details */}
              {learner.assessmentScores.length > 0 && (
                <div>
                  <p className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] mb-1">
                    Assessment Details
                  </p>
                  <div className="space-y-0.5">
                    {learner.assessmentScores.map((a) => (
                      <div key={a.blockId} className="flex justify-between text-[10px]">
                        <span className="text-[var(--text-secondary)]">{a.blockName}</span>
                        <span className={a.passed ? 'text-green-600' : 'text-red-600'}>
                          {a.score}% &middot; {a.passed ? 'Passed' : 'Failed'} &middot; {a.attempts} attempt{a.attempts !== 1 ? 's' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Phase scores */}
              {learner.phaseScores.length > 0 && (
                <div>
                  <p className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] mb-1">
                    Pre/Post by Objective
                  </p>
                  <div className="space-y-0.5">
                    {learner.phaseScores.map((ps) => (
                      <div key={ps.objective} className="flex justify-between text-[10px]">
                        <span className="text-[var(--text-secondary)]">{ps.objective}</span>
                        <span className="text-[var(--text-primary)]">
                          Pre: {ps.preScore != null ? `${ps.preScore}%` : 'N/A'} &rarr; Post: {ps.postScore != null ? `${ps.postScore}%` : 'N/A'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}
