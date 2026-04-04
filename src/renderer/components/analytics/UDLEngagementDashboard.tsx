import { Layers, Users, TrendingUp } from 'lucide-react'
import type { UDLEngagementSummary } from '@/types/analytics'
import { MetricCard } from './MetricCard'
import { UDLPrincipleBreakdown } from './UDLPrincipleBreakdown'
import { SimpleBarChart } from './SimpleBarChart'
import { DataTableToggle } from './DataTableToggle'

interface UDLEngagementDashboardProps {
  summary: UDLEngagementSummary | null
}

export function UDLEngagementDashboard({ summary }: UDLEngagementDashboardProps): JSX.Element {
  if (!summary || summary.totalUDLInteractions === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Layers size={32} className="text-[var(--text-tertiary)] mb-3" />
        <p className="text-sm text-[var(--text-secondary)] mb-2">No UDL interactions yet</p>
        <p className="text-xs text-[var(--text-tertiary)] max-w-[280px]">
          When learners use alternative representations, expression tools, or engagement features, UDL analytics will appear here.
        </p>
      </div>
    )
  }

  const topPrinciple = summary.byPrinciple.reduce(
    (top, p) => (p.statementCount > top.statementCount ? p : top),
    summary.byPrinciple[0]
  )
  const multiPrincipleRate = summary.byPrinciple.filter((p) => p.uniqueLearners > 0).length > 1
    ? Math.round(
        (summary.byPrinciple.reduce((min, p) => Math.min(min, p.uniqueLearners), Infinity) /
          summary.totalLearners) *
          100
      )
    : 0

  const principleLabels: Record<string, string> = {
    representation: 'Representation',
    'action-expression': 'Action & Expression',
    engagement: 'Engagement',
  }

  return (
    <div className="space-y-5">
      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard icon={Layers} label="UDL Interactions" value={summary.totalUDLInteractions} />
        <MetricCard icon={Users} label="Multi-Principle %" value={`${multiPrincipleRate}%`} subtitle="Learners using 2+ principles" />
        <MetricCard
          icon={TrendingUp}
          label="Top Principle"
          value={principleLabels[topPrinciple.principle] || topPrinciple.principle}
          subtitle={`${topPrinciple.statementCount} interactions`}
        />
        <MetricCard icon={Users} label="Learners" value={summary.totalLearners} />
      </div>

      {/* Principle breakdown */}
      <div className="space-y-4">
        <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          By UDL Principle
        </h3>

        <UDLPrincipleBreakdown
          principle="Representation"
          totalRate={summary.byPrinciple.find((p) => p.principle === 'representation')?.rate ?? 0}
          metrics={[
            { label: 'Audio Alternative', value: summary.representation.audioAlternativeRate },
            { label: 'Captions', value: summary.representation.captionUsageRate },
            { label: 'Transcripts', value: summary.representation.transcriptAccessRate },
            { label: 'Language Toggle', value: summary.representation.languageToggleRate },
            { label: 'Text to Speech', value: summary.representation.ttsActivationRate },
          ]}
        />

        <UDLPrincipleBreakdown
          principle="Action & Expression"
          totalRate={summary.byPrinciple.find((p) => p.principle === 'action-expression')?.rate ?? 0}
          metrics={[
            { label: 'Extended Time', value: summary.actionExpression.extendedTimeRate },
            ...summary.actionExpression.responseTypeDistribution.map((r) => ({
              label: r.type,
              value: r.percentage,
            })),
          ]}
        />

        <UDLPrincipleBreakdown
          principle="Engagement"
          totalRate={summary.byPrinciple.find((p) => p.principle === 'engagement')?.rate ?? 0}
          metrics={[
            { label: 'Bookmark Rate', value: summary.engagement.bookmarkRate },
            ...summary.engagement.replayRateByBlock.slice(0, 3).map((b) => ({
              label: `Replay: ${b.blockName}`,
              value: Math.round((b.viewCount / summary.totalLearners) * 100),
            })),
          ]}
        />
      </div>

      {/* Pathway choices */}
      {summary.actionExpression.pathwayChoiceDistribution.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Pathway Choices
          </h3>
          <DataTableToggle
            caption="Pathway choice distribution"
            headers={['Choice', 'Count', 'Percentage']}
            rows={summary.actionExpression.pathwayChoiceDistribution.map((p) => [p.choice, p.count, `${p.percentage}%`])}
            chart={
              <SimpleBarChart
                data={summary.actionExpression.pathwayChoiceDistribution.map((p) => ({ label: p.choice, value: p.percentage }))}
                maxValue={100}
                valueLabel="%"
              />
            }
          />
        </div>
      )}

      {/* Replay hotspots */}
      {summary.engagement.replayRateByBlock.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Most Replayed Blocks
          </h3>
          <DataTableToggle
            caption="Most replayed content blocks"
            headers={['Block', 'Replays', 'Unique Learners']}
            rows={summary.engagement.replayRateByBlock.map((b) => [b.blockName, b.viewCount, b.uniqueActors])}
            chart={
              <SimpleBarChart
                data={summary.engagement.replayRateByBlock.map((b) => ({ label: b.blockName, value: b.viewCount }))}
                valueLabel=" replays"
              />
            }
          />
        </div>
      )}
    </div>
  )
}
