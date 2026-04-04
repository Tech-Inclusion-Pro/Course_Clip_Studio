import { useState } from 'react'
import { Award, Target, Users, BarChart3 } from 'lucide-react'
import type { AssessmentAnalyticsSummary } from '@/types/analytics'
import { MetricCard } from './MetricCard'
import { QuestionDifficultyHeatmap } from './QuestionDifficultyHeatmap'
import { PrePostComparison } from './PrePostComparison'
import { ObjectiveMasteryTable } from './ObjectiveMasteryTable'
import { LearnerScoresPanel } from './LearnerScoresPanel'

interface AssessmentDashboardProps {
  summary: AssessmentAnalyticsSummary | null
}

export function AssessmentDashboard({ summary }: AssessmentDashboardProps): JSX.Element {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)

  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart3 size={32} className="text-[var(--text-tertiary)] mb-3" />
        <p className="text-sm text-[var(--text-secondary)] mb-2">No assessment data</p>
        <p className="text-xs text-[var(--text-tertiary)] max-w-[280px]">
          Load analytics data that includes quiz or knowledge check interactions to see assessment details.
        </p>
      </div>
    )
  }

  const { assessments, questionDifficulty, prePostComparisons, objectiveMastery, learnerScores } = summary

  // Filter by selected assessment
  const filteredDifficulty = selectedBlockId
    ? questionDifficulty.filter((q) => q.blockId === selectedBlockId)
    : questionDifficulty

  const selectedAssessment = selectedBlockId
    ? assessments.find((a) => a.blockId === selectedBlockId)
    : null

  // Compute aggregate metrics
  const totalAttempts = selectedAssessment
    ? selectedAssessment.attemptCount
    : assessments.reduce((a, b) => a + b.attemptCount, 0)
  const avgScore = selectedAssessment
    ? selectedAssessment.averageScore
    : assessments.length > 0
      ? Math.round(assessments.reduce((a, b) => a + b.averageScore, 0) / assessments.length)
      : 0
  const passRate = selectedAssessment
    ? selectedAssessment.passRate
    : assessments.length > 0
      ? Math.round(assessments.reduce((a, b) => a + b.passRate, 0) / assessments.length)
      : 0
  const avgAttempts = selectedAssessment
    ? selectedAssessment.averageAttempts
    : assessments.length > 0
      ? Math.round(assessments.reduce((a, b) => a + b.averageAttempts, 0) / assessments.length * 10) / 10
      : 0

  return (
    <div className="space-y-5">
      {/* Assessment selector */}
      {assessments.length > 0 && (
        <div>
          <label htmlFor="assessment-select" className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider block mb-1">
            Assessment
          </label>
          <select
            id="assessment-select"
            value={selectedBlockId || ''}
            onChange={(e) => setSelectedBlockId(e.target.value || null)}
            className="w-full px-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] cursor-pointer"
          >
            <option value="">All Assessments</option>
            {assessments.map((a) => (
              <option key={a.blockId} value={a.blockId}>
                {a.blockName} ({a.blockType === 'knowledge-check' ? `KC - ${a.phase}` : 'Quiz'})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={Award} label="Avg Score" value={`${avgScore}%`} />
        <MetricCard icon={Target} label="Pass Rate" value={`${passRate}%`} />
        <MetricCard icon={BarChart3} label="Total Attempts" value={totalAttempts} />
        <MetricCard icon={Users} label="Avg Attempts" value={avgAttempts} subtitle="per learner" />
      </div>

      {/* Question Difficulty Heatmap */}
      {filteredDifficulty.length > 0 && (
        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            Question Difficulty
          </h3>
          <QuestionDifficultyHeatmap data={filteredDifficulty} />
        </div>
      )}

      {/* Pre/Post Comparison */}
      {prePostComparisons.length > 0 && (
        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            Pre/Post Comparison
          </h3>
          <PrePostComparison data={prePostComparisons} />
        </div>
      )}

      {/* Objective Mastery */}
      {objectiveMastery.length > 0 && (
        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            Objective Mastery
          </h3>
          <ObjectiveMasteryTable data={objectiveMastery} />
        </div>
      )}

      {/* Learner Scores */}
      {learnerScores.length > 0 && (
        <div className="pt-2 border-t border-[var(--border-default)]">
          <LearnerScoresPanel data={learnerScores} />
        </div>
      )}

      {/* Empty state for no assessments */}
      {assessments.length === 0 && filteredDifficulty.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <BarChart3 size={24} className="text-[var(--text-tertiary)] mb-2" />
          <p className="text-xs text-[var(--text-secondary)]">
            No assessment interactions found in the loaded data.
          </p>
        </div>
      )}
    </div>
  )
}
