import { useState, useMemo } from 'react'
import {
  X,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  BookOpen,
  BarChart3,
  ClipboardCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import {
  runAccessibilityAudit,
  severityColor,
  severityLabel,
  scoreColor,
  scoreLabel,
  type AuditReport,
  type AuditIssue,
  type AuditSeverity
} from '@/lib/accessibility'
import { udlChecklistScore, udlPillarScores } from '@/lib/course-helpers'
import type { UDLChecklist } from '@/types/course'

interface AccessibilityAuditPanelProps {
  onClose: () => void
}

type AuditTab = 'issues' | 'udl' | 'reading'

export function AccessibilityAuditPanel({ onClose }: AccessibilityAuditPanelProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const [activeTab, setActiveTab] = useState<AuditTab>('issues')
  const [report, setReport] = useState<AuditReport | null>(null)

  function handleRunAudit() {
    if (!course) return
    const result = runAccessibilityAudit(course)
    setReport(result)
  }

  if (!course) {
    return (
      <div className="p-4">
        <p className="text-sm text-[var(--text-tertiary)]">No course loaded.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-default)] shrink-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-[var(--brand-indigo)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Accessibility Audit
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Close audit panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Score + Run button */}
      <div className="px-3 py-3 border-b border-[var(--border-default)] shrink-0">
        {report ? (
          <div className="flex items-center gap-3">
            <ScoreBadge score={report.score} />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[var(--text-secondary)]">
                {report.summary.total} issue{report.summary.total !== 1 ? 's' : ''} found
              </div>
              <div className="flex gap-2 mt-1">
                {report.summary.critical > 0 && (
                  <SeverityChip severity="critical" count={report.summary.critical} />
                )}
                {report.summary.serious > 0 && (
                  <SeverityChip severity="serious" count={report.summary.serious} />
                )}
                {report.summary.moderate > 0 && (
                  <SeverityChip severity="moderate" count={report.summary.moderate} />
                )}
                {report.summary.minor > 0 && (
                  <SeverityChip severity="minor" count={report.summary.minor} />
                )}
              </div>
            </div>
            <button
              onClick={handleRunAudit}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              aria-label="Re-run audit"
              title="Re-run audit"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={handleRunAudit}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <ShieldCheck size={14} />
            Run Accessibility Audit
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-default)] shrink-0" role="tablist">
        <TabButton
          active={activeTab === 'issues'}
          label="Issues"
          icon={AlertTriangle}
          count={report?.summary.total}
          onClick={() => setActiveTab('issues')}
        />
        <TabButton
          active={activeTab === 'udl'}
          label="UDL"
          icon={ClipboardCheck}
          onClick={() => setActiveTab('udl')}
        />
        <TabButton
          active={activeTab === 'reading'}
          label="Reading"
          icon={BookOpen}
          onClick={() => setActiveTab('reading')}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'issues' ? (
          <IssuesTab report={report} />
        ) : activeTab === 'udl' ? (
          <UDLTab />
        ) : (
          <ReadingTab report={report} />
        )}
      </div>
    </div>
  )
}

// ─── Score Badge ───

function ScoreBadge({ score }: { score: number }): JSX.Element {
  const color = scoreColor(score)
  const label = scoreLabel(score)

  return (
    <div className="flex flex-col items-center shrink-0">
      <div
        className="flex items-center justify-center w-12 h-12 rounded-full border-3 text-lg font-bold"
        style={{ borderColor: color, color }}
        role="img"
        aria-label={`Accessibility score: ${score} out of 100 (${label})`}
      >
        {score}
      </div>
      <span className="text-[9px] mt-0.5" style={{ color }}>{label}</span>
    </div>
  )
}

// ─── Severity Chip ───

function SeverityChip({ severity, count }: { severity: AuditSeverity; count: number }): JSX.Element {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-[var(--font-weight-semibold)]"
      style={{ backgroundColor: `${severityColor(severity)}15`, color: severityColor(severity) }}
    >
      {count} {severityLabel(severity).toLowerCase()}
    </span>
  )
}

// ─── Tab Button ───

function TabButton({
  active,
  label,
  icon: Icon,
  count,
  onClick
}: {
  active: boolean
  label: string
  icon: typeof AlertTriangle
  count?: number
  onClick: () => void
}): JSX.Element {
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-[11px] font-[var(--font-weight-medium)] cursor-pointer transition-colors border-b-2 ${
        active
          ? 'border-[var(--brand-indigo)] text-[var(--brand-indigo)]'
          : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
      }`}
    >
      <Icon size={12} />
      {label}
      {count !== undefined && count > 0 && (
        <span className="px-1 rounded-full bg-[var(--bg-panel)] text-[9px]">{count}</span>
      )}
    </button>
  )
}

// ─── Issues Tab ───

function IssuesTab({ report }: { report: AuditReport | null }): JSX.Element {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!report) {
    return (
      <div className="p-4 text-center">
        <ShieldCheck size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-sm text-[var(--text-secondary)]">Run an audit to check for accessibility issues.</p>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
          Checks WCAG 2.1 AA criteria including alt text, transcripts, contrast, heading structure, and reading level.
        </p>
      </div>
    )
  }

  if (report.issues.length === 0) {
    return (
      <div className="p-4 text-center">
        <CheckCircle2 size={32} className="mx-auto text-green-500 mb-2" />
        <p className="text-sm font-[var(--font-weight-semibold)] text-green-600">No Issues Found</p>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
          Your course passes all automated accessibility checks.
        </p>
      </div>
    )
  }

  // Group by severity
  const groups: [AuditSeverity, AuditIssue[]][] = [
    ['critical', report.issues.filter((i) => i.severity === 'critical')],
    ['serious', report.issues.filter((i) => i.severity === 'serious')],
    ['moderate', report.issues.filter((i) => i.severity === 'moderate')],
    ['minor', report.issues.filter((i) => i.severity === 'minor')]
  ].filter(([, issues]) => issues.length > 0) as [AuditSeverity, AuditIssue[]][]

  return (
    <div className="p-2 space-y-2">
      {groups.map(([severity, issues]) => (
        <div key={severity}>
          <div className="flex items-center gap-1.5 px-2 py-1">
            <SeverityIcon severity={severity} />
            <span
              className="text-[10px] font-[var(--font-weight-semibold)] uppercase tracking-wide"
              style={{ color: severityColor(severity) }}
            >
              {severityLabel(severity)} ({issues.length})
            </span>
          </div>
          <div className="space-y-1">
            {issues.map((issue) => (
              <IssueCard
                key={issue.id}
                issue={issue}
                expanded={expandedId === issue.id}
                onToggle={() => setExpandedId(expandedId === issue.id ? null : issue.id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function SeverityIcon({ severity }: { severity: AuditSeverity }): JSX.Element {
  const color = severityColor(severity)
  switch (severity) {
    case 'critical':
      return <AlertCircle size={12} style={{ color }} />
    case 'serious':
      return <AlertTriangle size={12} style={{ color }} />
    case 'moderate':
      return <AlertTriangle size={12} style={{ color }} />
    case 'minor':
      return <Info size={12} style={{ color }} />
  }
}

function IssueCard({
  issue,
  expanded,
  onToggle
}: {
  issue: AuditIssue
  expanded: boolean
  onToggle: () => void
}): JSX.Element {
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock)

  return (
    <div className="rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-2 px-2.5 py-2 text-left cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
        aria-expanded={expanded}
      >
        <SeverityIcon severity={issue.severity} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-[var(--font-weight-medium)] text-[var(--text-primary)] leading-tight">
            {issue.title}
          </div>
          <div className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
            {issue.criterion} · {issue.lessonTitle}
          </div>
        </div>
        {expanded ? <ChevronUp size={12} className="text-[var(--text-tertiary)] shrink-0 mt-0.5" /> : <ChevronDown size={12} className="text-[var(--text-tertiary)] shrink-0 mt-0.5" />}
      </button>

      {expanded && (
        <div className="px-2.5 pb-2.5 space-y-2 border-t border-[var(--border-default)]">
          <p className="text-[10px] text-[var(--text-secondary)] mt-2 leading-relaxed">
            {issue.description}
          </p>
          <div className="flex items-start gap-1.5 p-2 rounded bg-[var(--bg-panel)]">
            <Sparkles size={10} className="text-[var(--brand-magenta)] shrink-0 mt-0.5" />
            <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
              {issue.suggestion}
            </p>
          </div>
          {issue.blockId && (
            <button
              onClick={() => setSelectedBlock(issue.blockId)}
              className="text-[10px] text-[var(--brand-magenta)] hover:underline cursor-pointer"
            >
              Go to block →
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── UDL Tab ───

function UDLTab(): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const activeModuleId = useEditorStore((s) => s.activeModuleId)
  const updateUDLChecklist = useCourseStore((s) => s.updateUDLChecklist)

  const activeModule = useMemo(() => {
    if (!course || !activeModuleId) return null
    return course.modules.find((m) => m.id === activeModuleId) ?? null
  }, [course, activeModuleId])

  if (!course || !activeCourseId) {
    return <div className="p-4 text-sm text-[var(--text-tertiary)]">No course loaded.</div>
  }

  if (!activeModule) {
    return (
      <div className="p-4 text-center">
        <ClipboardCheck size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-sm text-[var(--text-secondary)]">Select a module to view its UDL checklist.</p>
        <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
          Each module has its own UDL compliance checklist covering all three pillars.
        </p>
      </div>
    )
  }

  const checklist = activeModule.udlChecklist
  const score = udlChecklistScore(checklist)
  const pillars = udlPillarScores(checklist)

  function toggle(pillar: keyof UDLChecklist, field: string) {
    if (!activeCourseId || !activeModuleId) return
    const current = checklist[pillar] as Record<string, boolean>
    updateUDLChecklist(activeCourseId, activeModuleId, {
      [pillar]: { [field]: !current[field] }
    } as Partial<UDLChecklist>)
  }

  return (
    <div className="p-3 space-y-4">
      {/* Module header + overall score */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {activeModule.title}
          </h3>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            {score.checked}/{score.total} items checked
          </p>
        </div>
        <UDLProgressRing representation={pillars.representation} action={pillars.action} engagement={pillars.engagement} />
      </div>

      {/* Representation */}
      <UDLPillarSection
        title="Representation"
        description="Multiple means of presenting information"
        color="#3b82f6"
        percentage={pillars.representation}
        items={[
          { key: 'multipleFormats', label: 'Multiple content formats', description: 'Text, audio, video, and visual content' },
          { key: 'altTextPresent', label: 'Alt text on all images', description: 'WCAG 1.1.1 compliance' },
          { key: 'transcriptsPresent', label: 'Transcripts on audio/video', description: 'WCAG 1.2.1 compliance' },
          { key: 'captionsPresent', label: 'Captions on video', description: 'WCAG 1.2.2 compliance' },
          { key: 'readingLevelAppropriate', label: 'Appropriate reading level', description: 'Grade 8 or below recommended' }
        ]}
        checked={checklist.representation}
        onToggle={(field) => toggle('representation', field)}
      />

      {/* Action & Expression */}
      <UDLPillarSection
        title="Action & Expression"
        description="Multiple ways for learners to demonstrate knowledge"
        color="#8b5cf6"
        percentage={pillars.action}
        items={[
          { key: 'keyboardNavigable', label: 'Fully keyboard navigable', description: 'WCAG 2.1.1 compliance' },
          { key: 'multipleResponseModes', label: 'Multiple response modes', description: 'Quiz, drag-drop, short answer, etc.' },
          { key: 'sufficientTime', label: 'Sufficient time for tasks', description: 'No restrictive time limits' }
        ]}
        checked={checklist.action}
        onToggle={(field) => toggle('action', field)}
      />

      {/* Engagement */}
      <UDLPillarSection
        title="Engagement"
        description="Multiple ways to motivate learners"
        color="#f59e0b"
        percentage={pillars.engagement}
        items={[
          { key: 'choiceAndAutonomy', label: 'Learner choice and autonomy', description: 'Options for navigation and pacing' },
          { key: 'relevantContext', label: 'Relevant, meaningful context', description: 'Real-world examples and scenarios' },
          { key: 'feedbackPresent', label: 'Feedback on assessments', description: 'Correct and incorrect feedback' },
          { key: 'progressVisible', label: 'Progress tracking visible', description: 'Progress bar and completion status' }
        ]}
        checked={checklist.engagement}
        onToggle={(field) => toggle('engagement', field)}
      />
    </div>
  )
}

// ─── UDL Progress Ring ───

function UDLProgressRing({ representation, action, engagement }: { representation: number; action: number; engagement: number }): JSX.Element {
  const avg = Math.round((representation + action + engagement) / 3)
  const color = avg >= 75 ? '#16a34a' : avg >= 40 ? '#d97706' : '#dc2626'

  return (
    <div className="flex flex-col items-center">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-bold"
        style={{ borderColor: color, color }}
        role="img"
        aria-label={`UDL score: ${avg}%`}
      >
        {avg}%
      </div>
    </div>
  )
}

// ─── UDL Pillar Section ───

function UDLPillarSection({
  title,
  description,
  color,
  percentage,
  items,
  checked,
  onToggle
}: {
  title: string
  description: string
  color: string
  percentage: number
  items: Array<{ key: string; label: string; description: string }>
  checked: Record<string, boolean>
  onToggle: (field: string) => void
}): JSX.Element {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-[11px] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {title}
          </h4>
          <p className="text-[9px] text-[var(--text-tertiary)]">{description}</p>
        </div>
        <span className="text-[10px] font-[var(--font-weight-semibold)]" style={{ color }}>
          {percentage}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1 rounded-full bg-[var(--bg-panel)]">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>

      {/* Checklist items */}
      <div className="space-y-0.5">
        {items.map((item) => (
          <label
            key={item.key}
            className="flex items-start gap-2 px-2 py-1.5 rounded-md hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              checked={checked[item.key] ?? false}
              onChange={() => onToggle(item.key)}
              className="mt-0.5 w-3.5 h-3.5 rounded border-[var(--border-default)] accent-[var(--brand-indigo)] cursor-pointer"
            />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--text-primary)] leading-tight">{item.label}</div>
              <div className="text-[9px] text-[var(--text-tertiary)]">{item.description}</div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )
}

// ─── Reading Tab ───

function ReadingTab({ report }: { report: AuditReport | null }): JSX.Element {
  if (!report) {
    return (
      <div className="p-4 text-center">
        <BarChart3 size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-sm text-[var(--text-secondary)]">Run an audit to see reading level analysis.</p>
      </div>
    )
  }

  const levels = report.readingLevels.filter((r) => r.wordCount > 0)

  if (levels.length === 0) {
    return (
      <div className="p-4 text-center">
        <BookOpen size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
        <p className="text-sm text-[var(--text-secondary)]">No text content to analyze.</p>
      </div>
    )
  }

  // Overall stats
  const totalWords = levels.reduce((s, r) => s + r.wordCount, 0)
  const totalSentences = levels.reduce((s, r) => s + r.sentenceCount, 0)
  const avgGrade = levels.filter((r) => r.gradeLevel !== null).reduce((s, r) => s + (r.gradeLevel ?? 0), 0) / Math.max(1, levels.filter((r) => r.gradeLevel !== null).length)

  return (
    <div className="p-3 space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Words" value={totalWords.toLocaleString()} />
        <StatCard label="Sentences" value={totalSentences.toLocaleString()} />
        <StatCard
          label="Avg Grade"
          value={avgGrade > 0 ? avgGrade.toFixed(1) : '—'}
          color={gradeLevelColor(Math.round(avgGrade))}
        />
      </div>

      {/* Per-lesson breakdown */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wide">
          Per Lesson
        </h4>
        {levels.map((r) => (
          <div
            key={r.lessonId}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)]"
          >
            <ReadingLevelBadge grade={r.gradeLevel} />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-[var(--font-weight-medium)] text-[var(--text-primary)] truncate">
                {r.lessonTitle}
              </div>
              <div className="text-[9px] text-[var(--text-tertiary)]">
                {r.wordCount} words · {r.sentenceCount} sentences · {r.avgWordsPerSentence} words/sentence
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="space-y-1 pt-2 border-t border-[var(--border-default)]">
        <h4 className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wide">
          Grade Level Guide
        </h4>
        <div className="flex gap-3 text-[9px] text-[var(--text-tertiary)]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" /> ≤ Grade 8
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-yellow-500" /> Grade 9-12
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" /> &gt; Grade 12
          </span>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center p-2 rounded-md bg-[var(--bg-panel)] border border-[var(--border-default)]">
      <span className="text-sm font-bold" style={color ? { color } : undefined}>
        {value}
      </span>
      <span className="text-[9px] text-[var(--text-tertiary)]">{label}</span>
    </div>
  )
}

function ReadingLevelBadge({ grade }: { grade: number | null }): JSX.Element {
  if (grade === null) {
    return (
      <span className="flex items-center justify-center w-7 h-7 rounded text-[9px] font-bold bg-[var(--bg-panel)] text-[var(--text-tertiary)] shrink-0">
        —
      </span>
    )
  }

  const color = gradeLevelColor(grade)
  return (
    <span
      className="flex items-center justify-center w-7 h-7 rounded text-[10px] font-bold text-white shrink-0"
      style={{ backgroundColor: color }}
      title={`Grade level ${grade}`}
    >
      {grade}
    </span>
  )
}

function gradeLevelColor(grade: number | null): string {
  if (grade === null) return '#6b7280'
  if (grade <= 8) return '#16a34a'
  if (grade <= 12) return '#d97706'
  return '#dc2626'
}
