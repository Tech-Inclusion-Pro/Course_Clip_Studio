import { useState } from 'react'
import { Download, Save, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { SyllabusPreview } from '../SyllabusPreview'
import { exportSyllabusDocx, downloadBlob } from '@/lib/export/syllabus-docx'

export function ReviewExportStep(): JSX.Element {
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)!
  const saveSyllabus = useSyllabusStore((s) => s.saveSyllabus)

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(true)

  async function handleExport(): Promise<void> {
    setExporting(true)
    setExportError(null)
    try {
      const blob = await exportSyllabusDocx(activeSyllabus)
      const filename = `${activeSyllabus.name || 'Syllabus'}.docx`.replace(/[^a-zA-Z0-9.\-_() ]/g, '_')
      downloadBlob(blob, filename)
    } catch (err) {
      setExportError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  function handleSave(): void {
    saveSyllabus()
  }

  // Summary stats
  const stats = {
    objectives: activeSyllabus.objectives.length,
    assignments: activeSyllabus.assignments.length,
    rubrics: activeSyllabus.rubrics.length,
    udlComplete: activeSyllabus.assignments.filter(
      (a) => a.udl.representation && a.udl.actionExpression && a.udl.engagement
    ).length
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Review & Export
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Review your syllabus, save it, and export as a Word document.
        </p>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Objectives" value={stats.objectives} />
        <StatCard label="Assignments" value={stats.assignments} />
        <StatCard label="Rubrics" value={stats.rubrics} />
        <StatCard label="UDL Complete" value={`${stats.udlComplete}/${stats.assignments}`} />
      </div>

      {/* Warnings */}
      {stats.objectives === 0 && (
        <p className="text-sm text-[var(--color-warning-500)] bg-[var(--color-warning-500)]/10 rounded-lg p-3">
          No learning objectives defined. Consider going back to add objectives.
        </p>
      )}
      {stats.assignments === 0 && (
        <p className="text-sm text-[var(--color-warning-500)] bg-[var(--color-warning-500)]/10 rounded-lg p-3">
          No assignments defined. Consider going back to add assignments.
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="primary" size="md" onClick={handleSave}>
          <Save size={16} />
          Save to My Syllabi
        </Button>
        <Button variant="secondary" size="md" onClick={handleExport} disabled={exporting}>
          <Download size={16} />
          {exporting ? 'Exporting...' : 'Download as Word Document'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
          {showPreview ? 'Hide Preview' : 'Show Preview'}
        </Button>
      </div>

      {exportError && (
        <p className="text-sm text-[var(--color-danger-500)]">Export error: {exportError}</p>
      )}

      {/* Preview */}
      {showPreview && (
        <div className="rounded-xl border border-[var(--border-default)] bg-white p-6 shadow-sm">
          <SyllabusPreview syllabus={activeSyllabus} />
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number | string }): JSX.Element {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-3 text-center">
      <p className="text-lg font-[var(--font-weight-bold)] text-[var(--text-primary)]">{value}</p>
      <p className="text-xs text-[var(--text-tertiary)]">{label}</p>
    </div>
  )
}
