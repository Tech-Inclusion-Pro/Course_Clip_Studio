import { useState } from 'react'
import type { QuestionDifficultyEntry } from '@/types/analytics'
import { DataTableToggle } from './DataTableToggle'
import { AnswerDistributionChart } from './AnswerDistributionChart'

interface QuestionDifficultyHeatmapProps {
  data: QuestionDifficultyEntry[]
}

function getDifficultyColor(index: number): string {
  if (index >= 0.7) return 'rgba(34, 197, 94, 0.3)'   // green
  if (index >= 0.4) return 'rgba(234, 179, 8, 0.3)'    // yellow
  return 'rgba(239, 68, 68, 0.3)'                       // red
}

function getDifficultyBorder(index: number): string {
  if (index >= 0.7) return 'rgb(34, 197, 94)'
  if (index >= 0.4) return 'rgb(234, 179, 8)'
  return 'rgb(239, 68, 68)'
}

export function QuestionDifficultyHeatmap({ data }: QuestionDifficultyHeatmapProps): JSX.Element {
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionDifficultyEntry | null>(null)

  if (data.length === 0) {
    return (
      <p className="text-xs text-[var(--text-tertiary)] py-4 text-center">
        No question-level data available yet.
      </p>
    )
  }

  const tableRows = data.map((d) => [
    d.questionPrompt.slice(0, 40) + (d.questionPrompt.length > 40 ? '...' : ''),
    `${Math.round(d.difficultyIndex * 100)}%`,
    `${d.discriminationIndex.toFixed(2)}`,
    d.totalAttempts,
    d.correctCount
  ])

  const heatmapChart = (
    <div>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(data.length, 6)}, 1fr)` }}
        role="grid"
        aria-label="Question difficulty heatmap"
      >
        {data.map((q) => {
          const pct = Math.round(q.difficultyIndex * 100)
          return (
            <button
              key={q.questionId}
              onClick={() => setSelectedQuestion(selectedQuestion?.questionId === q.questionId ? null : q)}
              className="flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm"
              style={{
                backgroundColor: getDifficultyColor(q.difficultyIndex),
                borderColor: getDifficultyBorder(q.difficultyIndex)
              }}
              aria-label={`${q.questionPrompt}: ${pct}% correct`}
              title={q.questionPrompt}
            >
              <span className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {pct}%
              </span>
              <span className="text-[10px] text-[var(--text-secondary)] truncate max-w-full">
                Q{data.indexOf(q) + 1}
              </span>
            </button>
          )
        })}
      </div>

      {/* Detail popup */}
      {selectedQuestion && (
        <div className="mt-3 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {selectedQuestion.questionPrompt}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                {selectedQuestion.totalAttempts} attempts &middot; Discrimination: {selectedQuestion.discriminationIndex.toFixed(2)}
              </p>
            </div>
            <button
              onClick={() => setSelectedQuestion(null)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer text-sm"
              aria-label="Close detail"
            >
              &times;
            </button>
          </div>
          {selectedQuestion.answerDistribution.length > 0 && (
            <AnswerDistributionChart data={selectedQuestion.answerDistribution} />
          )}
        </div>
      )}
    </div>
  )

  return (
    <DataTableToggle
      caption="Question difficulty breakdown"
      headers={['Question', 'Difficulty', 'Discrimination', 'Attempts', 'Correct']}
      rows={tableRows}
      chart={heatmapChart}
    />
  )
}
