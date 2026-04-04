// ─── TIPPY Assesses Report Display ───
// Phase 4: Full assessment report with scorecard, WCAG/UDL/Inclusion findings,
// recommendations, and methodology appendix.

import { useState } from 'react'
import type {
  AssessesReport,
  WCAGFinding,
  WCAGFindingImpact,
  UDLPrincipleFindings,
  InclusionFinding,
  AssessesRecommendation,
  AssessesMethodology
} from '@/types/analytics'

// ─── Impact colors ───

function impactColor(impact: WCAGFindingImpact): string {
  switch (impact) {
    case 'critical': return '#dc2626'
    case 'serious': return '#ea580c'
    case 'moderate': return '#d97706'
    case 'minor': return '#6b7280'
  }
}

function impactLabel(impact: WCAGFindingImpact): string {
  return impact.charAt(0).toUpperCase() + impact.slice(1)
}

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#16a34a'
    case 'B': return '#65a30d'
    case 'C': return '#d97706'
    case 'D': return '#ea580c'
    case 'F': return '#dc2626'
    default: return '#6b7280'
  }
}

function scoreBarColor(score: number): string {
  if (score >= 85) return '#16a34a'
  if (score >= 65) return '#d97706'
  return '#dc2626'
}

function inclusionColor(rating: string): string {
  switch (rating) {
    case 'exemplary': return '#16a34a'
    case 'proficient': return '#65a30d'
    case 'developing': return '#d97706'
    case 'needs-review': return '#dc2626'
    default: return '#6b7280'
  }
}

function inclusionLabel(rating: string): string {
  return rating
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

// ─── Sub-components ───

function ScoreBar({ label, score, max = 100 }: { label: string; score: number; max?: number }): JSX.Element {
  const pct = Math.min(100, Math.round((score / max) * 100))
  return (
    <div className="mb-2">
      <div className="flex justify-between text-xs mb-0.5">
        <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{score}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--bg-muted)' }}>
        <div
          className="h-2 rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: scoreBarColor(score) }}
        />
      </div>
    </div>
  )
}

function SectionHeader({ title, count }: { title: string; count?: number }): JSX.Element {
  return (
    <h3
      className="text-sm font-semibold mt-4 mb-2 pb-1 border-b flex items-center gap-2"
      style={{ color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}
    >
      {title}
      {count !== undefined && (
        <span
          className="text-[10px] px-1.5 py-0.5 rounded-full font-normal"
          style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-tertiary)' }}
        >
          {count}
        </span>
      )}
    </h3>
  )
}

// ─── Scorecard ───

function Scorecard({ report }: { report: AssessesReport }): JSX.Element {
  const { scorecard } = report
  return (
    <div
      className="rounded-xl p-4 mb-4"
      style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Summary Scorecard
        </h2>
        <div
          className="text-2xl font-bold px-3 py-1 rounded-lg"
          style={{
            color: '#fff',
            backgroundColor: gradeColor(scorecard.overallGrade)
          }}
        >
          {scorecard.overallGrade}
        </div>
      </div>

      <ScoreBar label={`WCAG 2.1 AA — ${scorecard.wcagPass ? 'Pass' : 'Fail'}`} score={scorecard.wcagScore} />
      <ScoreBar label={`UDL — ${scorecard.udlLabel}`} score={scorecard.udlScore} />
      <div className="ml-3">
        <ScoreBar label="Representation" score={scorecard.udlRepresentation} />
        <ScoreBar label="Action & Expression" score={scorecard.udlActionExpression} />
        <ScoreBar label="Engagement" score={scorecard.udlEngagement} />
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>Inclusion:</span>
        <span
          className="text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            color: '#fff',
            backgroundColor: inclusionColor(scorecard.inclusionRating)
          }}
        >
          {inclusionLabel(scorecard.inclusionRating)}
        </span>
      </div>

      <p className="text-[10px] mt-2" style={{ color: 'var(--text-tertiary)' }}>
        Grade is a weighted composite: WCAG 50%, UDL 30%, Inclusion 20%
      </p>
    </div>
  )
}

// ─── WCAG Findings ───

function WCAGSection({ findings, passingCriteria }: { findings: WCAGFinding[]; passingCriteria: string[] }): JSX.Element {
  const groups: Record<WCAGFindingImpact, WCAGFinding[]> = {
    critical: findings.filter((f) => f.impact === 'critical'),
    serious: findings.filter((f) => f.impact === 'serious'),
    moderate: findings.filter((f) => f.impact === 'moderate'),
    minor: findings.filter((f) => f.impact === 'minor')
  }

  return (
    <div>
      <SectionHeader title="WCAG Findings" count={findings.length} />

      {(['critical', 'serious', 'moderate', 'minor'] as WCAGFindingImpact[]).map((impact) => {
        const items = groups[impact]
        if (items.length === 0) return null
        return (
          <div key={impact} className="mb-3">
            <h4
              className="text-xs font-medium mb-1 flex items-center gap-1.5"
              style={{ color: impactColor(impact) }}
            >
              <span
                className="w-2 h-2 rounded-full inline-block"
                style={{ backgroundColor: impactColor(impact) }}
              />
              {impactLabel(impact)} Issues ({items.length})
            </h4>
            {items.map((finding) => (
              <WCAGFindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        )
      })}

      {passingCriteria.length > 0 && (
        <details className="mt-2">
          <summary
            className="text-xs cursor-pointer"
            style={{ color: '#16a34a' }}
          >
            Passing Criteria ({passingCriteria.length})
          </summary>
          <ul className="mt-1 text-xs space-y-0.5 pl-4" style={{ color: 'var(--text-secondary)' }}>
            {passingCriteria.map((c) => (
              <li key={c} className="list-disc">{c}</li>
            ))}
          </ul>
        </details>
      )}
    </div>
  )
}

function WCAGFindingCard({ finding }: { finding: WCAGFinding }): JSX.Element {
  return (
    <div
      className="rounded-lg p-2.5 mb-1.5 text-xs"
      style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-default)',
        borderLeft: `3px solid ${impactColor(finding.impact)}`
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
            {finding.criterionTitle}
          </p>
          <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {finding.description}
          </p>
          <p className="mt-1 italic" style={{ color: 'var(--text-tertiary)' }}>
            {finding.suggestion}
          </p>
        </div>
        <div className="shrink-0 flex flex-col items-end gap-1">
          <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
            ~{finding.estimatedMinutes}min
          </span>
          {finding.canAutoFix && (
            <span
              className="text-[10px] px-1.5 py-0.5 rounded font-medium"
              style={{ backgroundColor: '#16a34a', color: '#fff' }}
            >
              Fix It
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── UDL Findings ───

function UDLSection({ findings }: { findings: UDLPrincipleFindings[] }): JSX.Element {
  const principleLabels: Record<string, string> = {
    'representation': 'Representation',
    'action-expression': 'Action & Expression',
    'engagement': 'Engagement'
  }

  return (
    <div>
      <SectionHeader title="UDL Findings" />

      {findings.map((pf) => (
        <div key={pf.principle} className="mb-3">
          <h4 className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {principleLabels[pf.principle] || pf.principle} — {pf.score}%
          </h4>

          {pf.strengths.length > 0 && (
            <div className="mb-1">
              <span className="text-[10px] font-medium" style={{ color: '#16a34a' }}>Strengths:</span>
              <ul className="text-xs pl-4 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {pf.strengths.map((s, i) => (
                  <li key={i} className="list-disc">{s}</li>
                ))}
              </ul>
            </div>
          )}

          {pf.gaps.length > 0 && (
            <div>
              <span className="text-[10px] font-medium" style={{ color: '#d97706' }}>Gaps:</span>
              <ul className="text-xs pl-4 mt-0.5 space-y-1" style={{ color: 'var(--text-secondary)' }}>
                {pf.gaps.map((gap) => (
                  <li key={gap.checkpointId} className="list-disc">
                    <strong>{gap.checkpointTitle}:</strong> {gap.explanation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── Inclusion Findings ───

function InclusionSection({
  strengths,
  findings
}: {
  strengths: string[]
  findings: InclusionFinding[]
}): JSX.Element {
  return (
    <div>
      <SectionHeader title="Inclusion Findings" count={findings.length} />

      {strengths.length > 0 && (
        <div className="mb-2">
          <span className="text-[10px] font-medium" style={{ color: '#16a34a' }}>
            What this course does well:
          </span>
          <ul className="text-xs pl-4 mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {strengths.map((s, i) => (
              <li key={i} className="list-disc">{s}</li>
            ))}
          </ul>
        </div>
      )}

      {findings.length > 0 && (
        <div>
          <span className="text-[10px] font-medium" style={{ color: '#d97706' }}>
            What to review:
          </span>
          {findings.map((finding) => (
            <div
              key={finding.id}
              className="rounded-lg p-2 mb-1.5 text-xs"
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderLeft: '3px solid #d97706'
              }}
            >
              <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                {finding.criterionTitle}
              </p>
              <p className="mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                {finding.description}
              </p>
              <p className="mt-1 italic" style={{ color: 'var(--text-tertiary)' }}>
                {finding.suggestion}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Recommendations ───

function RecommendationsSection({ recommendations }: { recommendations: AssessesRecommendation[] }): JSX.Element {
  const actionLabels: Record<string, string> = {
    'fix-it': 'Fix It',
    'show-me': 'Show Me',
    'learn-more': 'Learn More'
  }
  const actionColors: Record<string, string> = {
    'fix-it': '#16a34a',
    'show-me': '#8B0000',
    'learn-more': '#3a2b95'
  }

  return (
    <div>
      <SectionHeader title="Top Recommendations" count={recommendations.length} />

      {recommendations.map((rec) => (
        <div
          key={rec.rank}
          className="flex items-start gap-2 mb-2 text-xs"
        >
          <span
            className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-primary)' }}
          >
            {rec.rank}
          </span>
          <div className="flex-1">
            <p style={{ color: 'var(--text-primary)' }}>{rec.description}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                ~{rec.estimatedMinutes}min
              </span>
              <span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                {rec.frameworks.join(', ').toUpperCase()}
              </span>
              <span
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  color: '#fff',
                  backgroundColor: actionColors[rec.actionType] || '#6b7280'
                }}
              >
                {actionLabels[rec.actionType] || rec.actionType}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Methodology Appendix ───

function MethodologySection({ methodology }: { methodology: AssessesMethodology }): JSX.Element {
  return (
    <details className="mt-4">
      <summary
        className="text-xs font-medium cursor-pointer"
        style={{ color: 'var(--text-secondary)' }}
      >
        Appendix A — Assessment Methodology and Confidence Notes
      </summary>
      <div
        className="mt-2 p-3 rounded-lg text-xs space-y-2"
        style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-secondary)' }}
      >
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>AI Provider:</strong>{' '}
          {methodology.aiProvider} ({methodology.aiModel})
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Audit Engine:</strong>{' '}
          v{methodology.auditEngineVersion}
        </div>
        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Standards Referenced:</strong>{' '}
          {methodology.wcagVersion}, {methodology.udlGuidelinesVersion}
        </div>

        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Confidence Notes:</strong>
          <ul className="pl-4 mt-0.5 space-y-0.5">
            {methodology.confidenceNotes.map((note, i) => (
              <li key={i} className="list-disc">{note}</li>
            ))}
          </ul>
        </div>

        <div>
          <strong style={{ color: 'var(--text-primary)' }}>Limitations:</strong>
          <ul className="pl-4 mt-0.5 space-y-0.5">
            {methodology.limitations.map((lim, i) => (
              <li key={i} className="list-disc">{lim}</li>
            ))}
          </ul>
        </div>

        <div
          className="p-2 rounded border mt-2 text-[11px] leading-relaxed italic"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}
        >
          {methodology.humanReviewStatement}
        </div>
      </div>
    </details>
  )
}

// ─── Main Report Component ───

export function TippyAssessesReport({ report }: { report: AssessesReport }): JSX.Element {
  const [activeTab, setActiveTab] = useState<'scorecard' | 'wcag' | 'udl' | 'inclusion' | 'recs'>('scorecard')

  const tabs = [
    { id: 'scorecard' as const, label: 'Scorecard' },
    { id: 'wcag' as const, label: `WCAG (${report.wcagFindings.length})` },
    { id: 'udl' as const, label: 'UDL' },
    { id: 'inclusion' as const, label: `Inclusion (${report.inclusionFindings.length})` },
    { id: 'recs' as const, label: `Recs (${report.recommendations.length})` }
  ]

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--border-default)', backgroundColor: 'var(--bg-surface)' }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-muted)' }}
      >
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {report.title}
        </h2>
        <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-tertiary)' }}>
          Assessed on {new Date(report.assessedAt).toLocaleDateString()} at{' '}
          {new Date(report.assessedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {' '}&middot; Scope: {report.scope} &middot; {report.scopeTitle}
        </p>
      </div>

      {/* Tab bar */}
      <div
        className="flex border-b overflow-x-auto"
        style={{ borderColor: 'var(--border-default)' }}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="px-3 py-2 text-xs font-medium whitespace-nowrap cursor-pointer transition-colors"
            style={{
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
              borderBottom: activeTab === tab.id ? '2px solid #8B0000' : '2px solid transparent',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottomWidth: '2px',
              borderBottomStyle: 'solid',
              borderBottomColor: activeTab === tab.id ? '#8B0000' : 'transparent'
            }}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-4 py-3 max-h-[400px] overflow-y-auto">
        {activeTab === 'scorecard' && <Scorecard report={report} />}
        {activeTab === 'wcag' && (
          <WCAGSection
            findings={report.wcagFindings}
            passingCriteria={report.wcagPassingCriteria}
          />
        )}
        {activeTab === 'udl' && <UDLSection findings={report.udlFindings} />}
        {activeTab === 'inclusion' && (
          <InclusionSection
            strengths={report.inclusionStrengths}
            findings={report.inclusionFindings}
          />
        )}
        {activeTab === 'recs' && <RecommendationsSection recommendations={report.recommendations} />}
      </div>

      {/* Methodology appendix */}
      <div className="px-4 pb-3">
        <MethodologySection methodology={report.methodology} />
      </div>

      {/* Progress indicator for module-by-module assessment */}
      {report.modulesTotal && report.modulesAssessed !== undefined && report.modulesAssessed < report.modulesTotal && (
        <div
          className="px-4 py-2 border-t text-xs"
          style={{ borderColor: 'var(--border-default)', color: 'var(--text-tertiary)' }}
        >
          Assessing module {report.modulesAssessed + 1} of {report.modulesTotal}...
        </div>
      )}
    </div>
  )
}
