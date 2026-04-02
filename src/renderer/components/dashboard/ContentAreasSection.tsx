import { useState } from 'react'
import { Plus, Pencil, Trash2, X, Check, FileUp, File } from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import type { ContentArea, ContentAreaFile } from '@/types/course'

type ContentAreaFormData = Omit<ContentArea, 'id' | 'createdAt' | 'updatedAt'>

const EMPTY_FORM: ContentAreaFormData = {
  name: '',
  audience: '',
  objectives: '',
  priorKnowledge: '',
  tone: '',
  format: '',
  accessibilityNeeds: ''
}

export function ContentAreasSection(): JSX.Element {
  const contentAreas = useAppStore((s) => s.contentAreas)
  const addContentArea = useAppStore((s) => s.addContentArea)
  const updateContentArea = useAppStore((s) => s.updateContentArea)
  const removeContentArea = useAppStore((s) => s.removeContentArea)
  const addContentAreaFile = useAppStore((s) => s.addContentAreaFile)
  const updateContentAreaFilePriority = useAppStore((s) => s.updateContentAreaFilePriority)
  const removeContentAreaFile = useAppStore((s) => s.removeContentAreaFile)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContentAreaFormData>({ ...EMPTY_FORM })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  function handleAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setShowForm(true)
  }

  function handleEdit(ca: ContentArea) {
    setEditingId(ca.id)
    setForm({
      name: ca.name,
      audience: ca.audience,
      objectives: ca.objectives,
      priorKnowledge: ca.priorKnowledge,
      tone: ca.tone,
      format: ca.format,
      accessibilityNeeds: ca.accessibilityNeeds
    })
    setShowForm(true)
  }

  function handleSave() {
    if (!form.name.trim()) return
    if (editingId) {
      updateContentArea(editingId, form)
    } else {
      addContentArea(form)
    }
    setShowForm(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
  }

  function handleDelete(id: string) {
    removeContentArea(id)
    setConfirmDeleteId(null)
  }

  async function handleFileUpload(contentAreaId: string) {
    try {
      const result = await window.electronAPI.dialog.openFile({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'All Files', extensions: ['*'] }]
      })
      if (result && Array.isArray(result)) {
        for (const filePath of result) {
          const name = filePath.split(/[\\/]/).pop() || 'file'
          const file: ContentAreaFile = {
            id: `caf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name,
            path: filePath,
            priority: 2
          }
          addContentAreaFile(contentAreaId, file)
        }
      }
    } catch (err) {
      console.error('File upload failed:', err)
    }
  }

  const PRIORITY_LABELS: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' }

  function filledFieldCount(ca: ContentArea): number {
    let count = 0
    if (ca.audience) count++
    if (ca.objectives) count++
    if (ca.priorKnowledge) count++
    if (ca.tone) count++
    if (ca.format) count++
    if (ca.accessibilityNeeds) count++
    return count
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">
            Content Areas
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create reusable content area profiles to supplement AI generation
          </p>
        </div>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-[var(--font-weight-medium)] text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus size={16} />
            Add Content Area
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-3">
          <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {editingId ? 'Edit Content Area' : 'New Content Area'}
          </h3>

          <div className="space-y-1">
            <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Name *</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g., Workplace Safety Training"
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Target Audience</label>
            <textarea
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              placeholder="Who is this content area for?"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Learning Objectives</label>
            <textarea
              value={form.objectives}
              onChange={(e) => setForm({ ...form, objectives: e.target.value })}
              placeholder="Key learning objectives..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Prior Knowledge</label>
            <textarea
              value={form.priorKnowledge}
              onChange={(e) => setForm({ ...form, priorKnowledge: e.target.value })}
              placeholder="What should learners already know?"
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Tone</label>
              <select
                value={form.tone}
                onChange={(e) => setForm({ ...form, tone: e.target.value as ContentAreaFormData['tone'] })}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] cursor-pointer"
              >
                <option value="">Not specified</option>
                <option value="formal">Formal</option>
                <option value="conversational">Conversational</option>
                <option value="scenario-based">Scenario-Based</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Format</label>
              <select
                value={form.format}
                onChange={(e) => setForm({ ...form, format: e.target.value as ContentAreaFormData['format'] })}
                className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] cursor-pointer"
              >
                <option value="">Not specified</option>
                <option value="linear">Linear</option>
                <option value="branching">Branching</option>
                <option value="mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Accessibility Needs</label>
            <textarea
              value={form.accessibilityNeeds}
              onChange={(e) => setForm({ ...form, accessibilityNeeds: e.target.value })}
              placeholder="Any specific accessibility requirements..."
              rows={2}
              className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={!form.name.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={14} />
              {editingId ? 'Save Changes' : 'Create'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] rounded-md border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <X size={14} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Cards */}
      {contentAreas.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center">
            <Plus size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            No content areas yet
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">
            Content areas let you save audience profiles and learning context that can be reused across projects with AI generation.
          </p>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-[var(--font-weight-medium)] text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer"
          >
            <Plus size={16} />
            Create Your First Content Area
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentAreas.map((ca) => (
            <div
              key={ca.id}
              className="p-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] space-y-2"
            >
              <div className="flex items-start justify-between">
                <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                  {ca.name}
                </h3>
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => handleEdit(ca)}
                    className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    aria-label={`Edit ${ca.name}`}
                  >
                    <Pencil size={12} />
                  </button>
                  {confirmDeleteId === ca.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDelete(ca.id)}
                        className="px-1.5 py-0.5 text-[10px] rounded bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 text-[10px] rounded border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(ca.id)}
                      className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                      aria-label={`Delete ${ca.name}`}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-[10px] text-[var(--text-tertiary)]">
                {filledFieldCount(ca)} of 6 fields filled
              </p>

              {ca.audience && (
                <p className="text-xs text-[var(--text-secondary)] line-clamp-2">
                  <span className="font-[var(--font-weight-medium)]">Audience:</span> {ca.audience}
                </p>
              )}
              {ca.tone && (
                <p className="text-xs text-[var(--text-secondary)]">
                  <span className="font-[var(--font-weight-medium)]">Tone:</span> {ca.tone}
                </p>
              )}
              {ca.format && (
                <p className="text-xs text-[var(--text-secondary)]">
                  <span className="font-[var(--font-weight-medium)]">Format:</span> {ca.format}
                </p>
              )}

              {/* Files */}
              <div className="pt-1 border-t border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-[var(--font-weight-medium)] text-[var(--text-tertiary)]">
                    Files ({ca.files?.length ?? 0})
                  </span>
                  <button
                    onClick={() => handleFileUpload(ca.id)}
                    className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)] rounded hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                    title="Upload files"
                  >
                    <FileUp size={10} />
                    Add
                  </button>
                </div>
                {(ca.files ?? []).length > 0 && (
                  <div className="space-y-1">
                    {(ca.files ?? []).map((f) => (
                      <div key={f.id} className="flex items-center gap-1.5 text-[10px]">
                        <File size={10} className="text-[var(--text-tertiary)] shrink-0" />
                        <span className="text-[var(--text-secondary)] truncate flex-1" title={f.path}>{f.name}</span>
                        <select
                          value={f.priority}
                          onChange={(e) => updateContentAreaFilePriority(ca.id, f.id, Number(e.target.value) as 1 | 2 | 3)}
                          className="px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-secondary)] cursor-pointer"
                          title="Priority"
                        >
                          <option value={1}>Low</option>
                          <option value={2}>Med</option>
                          <option value={3}>High</option>
                        </select>
                        <button
                          onClick={() => removeContentAreaFile(ca.id, f.id)}
                          className="p-0.5 text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                          title="Remove file"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
