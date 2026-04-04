import { Eye, Volume2, MonitorSmartphone, Type } from 'lucide-react'
import type { AccessibilityReportSummary } from '@/types/analytics'
import { MetricCard } from './MetricCard'
import { AccommodationUsageTable } from './AccommodationUsageTable'
import { SimpleBarChart } from './SimpleBarChart'
import { DataTableToggle } from './DataTableToggle'

interface AccessibilityReportProps {
  summary: AccessibilityReportSummary | null
}

export function AccessibilityReport({ summary }: AccessibilityReportProps): JSX.Element {
  if (!summary) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Eye size={32} className="text-[var(--text-tertiary)] mb-3" />
        <p className="text-sm text-[var(--text-secondary)] mb-2">No accessibility data yet</p>
        <p className="text-xs text-[var(--text-tertiary)] max-w-[280px]">
          Accessibility preferences and accommodation usage will be tracked when learners interact with exported courses.
        </p>
      </div>
    )
  }

  const hasAnyAccommodation = summary.accommodationUsage.some((a) => a.learnerCount > 0)

  if (!hasAnyAccommodation) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Eye size={32} className="text-[var(--text-tertiary)] mb-3" />
        <p className="text-sm text-[var(--text-secondary)] mb-2">No accommodation usage detected</p>
        <p className="text-xs text-[var(--text-tertiary)] max-w-[280px]">
          When learners use accessibility features like captions, screen readers, or reduced motion, data will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Framing note */}
      <div className="px-3 py-2 rounded-md bg-[var(--bg-muted)] border border-[var(--border-default)]">
        <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
          This report reflects how the learning environment is being accessed. High accommodation usage indicates the course is meeting diverse learner needs — not that learners have deficits.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={MonitorSmartphone} label="Reduced Motion" value={`${summary.reducedMotionRate}%`} />
        <MetricCard icon={Volume2} label="Screen Reader" value={`${summary.screenReaderRate}%`} />
        <MetricCard icon={Type} label="Captions" value={`${summary.captionsEnabledRate}%`} />
        <MetricCard icon={Eye} label="High Contrast" value={`${summary.highContrastRate}%`} />
      </div>

      {/* Extended Time */}
      <div className="space-y-2">
        <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          Extended Time Usage
        </h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-4 bg-[var(--bg-muted)] rounded overflow-hidden">
            <div
              className="h-full bg-[var(--brand-magenta)] rounded transition-all"
              style={{ width: `${Math.min(summary.extendedTimeUsageRate, 100)}%` }}
              role="meter"
              aria-label="Extended time usage rate"
              aria-valuenow={summary.extendedTimeUsageRate}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="text-xs text-[var(--text-primary)] w-10 text-right">
            {summary.extendedTimeUsageRate}%
          </span>
        </div>
      </div>

      {/* Audio Alt Score Correlation */}
      {(summary.audioAltScoreCorrelation.usedAudioAlt > 0 || summary.audioAltScoreCorrelation.didNotUse > 0) && (
        <div className="space-y-2">
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Audio Alternative — Score Correlation
          </h3>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            Average assessment scores for learners who used audio alternatives vs. those who did not.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] text-center">
              <div className="text-xl font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {summary.audioAltScoreCorrelation.usedAudioAlt}%
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Used Audio Alt</div>
            </div>
            <div className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] text-center">
              <div className="text-xl font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {summary.audioAltScoreCorrelation.didNotUse}%
              </div>
              <div className="text-[10px] text-[var(--text-tertiary)]">Did Not Use</div>
            </div>
          </div>
        </div>
      )}

      {/* Text Alt Preferred Blocks */}
      {summary.textAltPreferredBlocks.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Text Alternative Preferred Blocks
          </h3>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            Blocks where text alternatives were accessed more than primary content — may indicate content that benefits from additional formats.
          </p>
          <DataTableToggle
            caption="Blocks where text alternative was preferred"
            headers={['Block', 'Text Alt Rate', 'Primary Rate']}
            rows={summary.textAltPreferredBlocks.map((b) => [b.blockName, `${b.textAltRate}%`, `${b.primaryRate}%`])}
            chart={
              <SimpleBarChart
                data={summary.textAltPreferredBlocks.map((b) => ({ label: b.blockName, value: b.textAltRate }))}
                maxValue={100}
                valueLabel="%"
              />
            }
          />
        </div>
      )}

      {/* Accommodation Usage Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          Accommodation Usage
        </h3>
        <AccommodationUsageTable data={summary.accommodationUsage} totalLearners={summary.totalLearners} />
      </div>
    </div>
  )
}
