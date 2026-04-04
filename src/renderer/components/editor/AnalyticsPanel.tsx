import { useState, useRef } from 'react'
import { BarChart3, X, Upload, Trash2, FolderOpen } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useAnalyticsStore } from '@/stores/useAnalyticsStore'
import { useAppStore } from '@/stores/useAppStore'
import { CourseOverviewDashboard } from '@/components/analytics/CourseOverviewDashboard'
import { AssessmentDashboard } from '@/components/analytics/AssessmentDashboard'
import { UDLEngagementDashboard } from '@/components/analytics/UDLEngagementDashboard'
import { AccessibilityReport } from '@/components/analytics/AccessibilityReport'

interface AnalyticsPanelProps {
  onClose: () => void
}

export function AnalyticsPanel({ onClose }: AnalyticsPanelProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const workspacePath = useAppStore((s) => s.workspacePath)
  const summary = useAnalyticsStore((s) => s.summary)
  const assessmentSummary = useAnalyticsStore((s) => s.assessmentSummary)
  const udlSummary = useAnalyticsStore((s) => s.udlSummary)
  const accessibilitySummary = useAnalyticsStore((s) => s.accessibilitySummary)
  const statements = useAnalyticsStore((s) => s.statements)
  const isLoading = useAnalyticsStore((s) => s.isLoading)
  const loadStatements = useAnalyticsStore((s) => s.loadStatements)
  const clearData = useAnalyticsStore((s) => s.clearData)
  const importData = useAnalyticsStore((s) => s.importData)
  const [confirmClear, setConfirmClear] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'assessment' | 'udl' | 'accessibility'>('overview')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleLoad() {
    if (!workspacePath || !course) return
    await loadStatements(workspacePath, course)
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !workspacePath || !course) return
    const text = await file.text()
    await importData(text, workspacePath, course)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleClear() {
    if (!workspacePath || !course) return
    await clearData(workspacePath, course)
    setConfirmClear(false)
  }

  function exportCsv() {
    if (statements.length === 0) return
    const headers = ['timestamp', 'actorId', 'verb', 'objectName', 'objectType', 'blockType', 'scoreRaw', 'scoreMax', 'success', 'completion']
    const rows = statements.map((s) =>
      [s.timestamp, s.actorId, s.verbDisplay, s.objectName, s.objectType, s.blockType ?? '', s.scoreRaw ?? '', s.scoreMax ?? '', s.success ?? '', s.completion ?? ''].join(',')
    )
    const csv = [headers.join(','), ...rows].join('\n')
    downloadFile(csv, `analytics-${course?.id?.slice(-8) ?? 'course'}.csv`, 'text/csv')
  }

  function exportJson() {
    if (statements.length === 0) return
    const json = JSON.stringify({ statements }, null, 2)
    downloadFile(json, `analytics-${course?.id?.slice(-8) ?? 'course'}.json`, 'application/json')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <BarChart3 size={16} className="text-[var(--brand-magenta)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Course Analytics
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Close analytics panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex gap-2 px-4 py-3 border-b border-[var(--border-default)]">
        <button
          onClick={handleLoad}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md bg-[var(--brand-magenta)] text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
        >
          <FolderOpen size={12} />
          Load Data
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-50"
        >
          <Upload size={12} />
          Import JSON
        </button>
        {statements.length > 0 && (
          confirmClear ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleClear}
                className="px-2 py-1.5 text-[10px] rounded-md bg-red-600 text-white cursor-pointer"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="px-2 py-1.5 text-[10px] rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-1 px-2 py-1.5 text-xs rounded-md text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
              title="Clear analytics data"
            >
              <Trash2 size={12} />
            </button>
          )
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </div>

      {/* Tab bar */}
      {statements.length > 0 && (
        <div className="flex border-b border-[var(--border-default)]" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 text-xs font-[var(--font-weight-medium)] transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'text-[var(--brand-magenta)] border-b-2 border-[var(--brand-magenta)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Overview
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'assessment'}
            onClick={() => setActiveTab('assessment')}
            className={`px-4 py-2 text-xs font-[var(--font-weight-medium)] transition-colors cursor-pointer ${
              activeTab === 'assessment'
                ? 'text-[var(--brand-magenta)] border-b-2 border-[var(--brand-magenta)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Assessment
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'udl'}
            onClick={() => setActiveTab('udl')}
            className={`px-4 py-2 text-xs font-[var(--font-weight-medium)] transition-colors cursor-pointer ${
              activeTab === 'udl'
                ? 'text-[var(--brand-magenta)] border-b-2 border-[var(--brand-magenta)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            UDL Engagement
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'accessibility'}
            onClick={() => setActiveTab('accessibility')}
            className={`px-4 py-2 text-xs font-[var(--font-weight-medium)] transition-colors cursor-pointer ${
              activeTab === 'accessibility'
                ? 'text-[var(--brand-magenta)] border-b-2 border-[var(--brand-magenta)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Accessibility
          </button>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-sm text-[var(--text-tertiary)]">Loading...</div>
          </div>
        ) : summary && statements.length > 0 ? (
          activeTab === 'overview' ? (
            <CourseOverviewDashboard
              summary={summary}
              onExportCsv={exportCsv}
              onExportJson={exportJson}
            />
          ) : activeTab === 'assessment' ? (
            <AssessmentDashboard summary={assessmentSummary} />
          ) : activeTab === 'udl' ? (
            <UDLEngagementDashboard summary={udlSummary} />
          ) : (
            <AccessibilityReport summary={accessibilitySummary} />
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 size={32} className="text-[var(--text-tertiary)] mb-3" />
            <p className="text-sm text-[var(--text-secondary)] mb-2">No analytics data yet</p>
            <p className="text-xs text-[var(--text-tertiary)] max-w-[280px]">
              Export and use your course to generate learner data, then import statement logs here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
