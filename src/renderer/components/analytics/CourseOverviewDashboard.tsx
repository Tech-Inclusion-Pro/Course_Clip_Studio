import { Users, CheckCircle, Award, Clock, Download } from 'lucide-react'
import type { CourseAnalyticsSummary } from '@/types/analytics'
import { MetricCard } from './MetricCard'
import { CompletionDonut } from './CompletionDonut'
import { SimpleBarChart } from './SimpleBarChart'
import { DataTableToggle } from './DataTableToggle'

interface CourseOverviewDashboardProps {
  summary: CourseAnalyticsSummary
  onExportCsv: () => void
  onExportJson: () => void
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m < 60) return `${m}m ${s}s`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

export function CourseOverviewDashboard({
  summary,
  onExportCsv,
  onExportJson
}: CourseOverviewDashboardProps): JSX.Element {
  const dropOffData = summary.dropOffByLesson.map((d) => ({
    label: d.lessonTitle,
    value: d.exitRate
  }))

  const dropOffTableRows = summary.dropOffByLesson.map((d) => [
    d.lessonTitle,
    d.startedCount,
    d.completedCount,
    `${d.exitRate}%`
  ])

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={Users} label="Enrollments" value={summary.enrollments} />
        <MetricCard icon={CheckCircle} label="Completions" value={summary.completions} />
        <MetricCard icon={Award} label="Avg Score" value={`${summary.averageScore}%`} />
        <MetricCard icon={Clock} label="Avg Time" value={formatTime(summary.averageTimeSeconds)} />
      </div>

      {/* Completion donut */}
      <div className="flex justify-center py-2">
        <CompletionDonut percentage={summary.completionRate} label="Completion Rate" />
      </div>

      {/* Drop-off by lesson */}
      {dropOffData.length > 0 && (
        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            Drop-off by Lesson
          </h3>
          <DataTableToggle
            caption="Drop-off rate by lesson"
            headers={['Lesson', 'Started', 'Completed', 'Exit Rate']}
            rows={dropOffTableRows}
            chart={<SimpleBarChart data={dropOffData} maxValue={100} valueLabel="%" />}
          />
        </div>
      )}

      {/* Assessment summaries */}
      {summary.assessmentSummaries.length > 0 && (
        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            Assessment Summary
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr>
                  <th scope="col" className="text-left py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)]">Block</th>
                  <th scope="col" className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)]">Avg Score</th>
                  <th scope="col" className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)]">Pass Rate</th>
                  <th scope="col" className="text-right py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-secondary)]">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {summary.assessmentSummaries.map((a) => (
                  <tr key={a.blockId}>
                    <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] truncate max-w-[120px]">{a.blockName}</td>
                    <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] text-right">{a.averageScore}%</td>
                    <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] text-right">{a.passRate}%</td>
                    <td className="py-1.5 px-2 border-b border-[var(--border-default)] text-[var(--text-primary)] text-right">{a.attemptCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Most replayed blocks */}
      {summary.mostReplayedBlocks.length > 0 && (
        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            Most Viewed Blocks
          </h3>
          <div className="space-y-1">
            {summary.mostReplayedBlocks.map((b, i) => (
              <div key={b.blockId} className="flex items-center gap-2 text-xs">
                <span className="text-[var(--text-tertiary)] w-4 text-right">{i + 1}.</span>
                <span className="text-[var(--text-primary)] flex-1 truncate">{b.blockName}</span>
                <span className="text-[var(--text-secondary)] shrink-0">{b.viewCount} views</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Export buttons */}
      <div className="flex gap-2 pt-2 border-t border-[var(--border-default)]">
        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        >
          <Download size={12} />
          Export CSV
        </button>
        <button
          onClick={onExportJson}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        >
          <Download size={12} />
          Export JSON
        </button>
      </div>
    </div>
  )
}
