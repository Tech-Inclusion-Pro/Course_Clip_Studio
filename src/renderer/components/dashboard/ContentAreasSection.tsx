import { useState, useRef, useCallback } from 'react'
import { Plus, Pencil, Trash2, X, Check, FileUp, File, GripVertical, MessageSquarePlus } from 'lucide-react'
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
  accessibilityNeeds: '',
  files: []
}

/**
 * Copy a list of source file paths into the workspace under
 * content-areas/{contentAreaId}/files/ and return ContentAreaFile[] with
 * the new destination paths.
 */
async function copyFilesToWorkspace(
  sourcePaths: string[],
  contentAreaId: string,
  existingFiles: ContentAreaFile[]
): Promise<ContentAreaFile[]> {
  const workspacePath = useAppStore.getState().workspacePath
  if (!workspacePath || sourcePaths.length === 0) return []

  const destDir = `${workspacePath}/content-areas/${contentAreaId}/files`

  // Ensure directory tree exists
  const caDir = `${workspacePath}/content-areas`
  if (!(await window.electronAPI.fs.exists(caDir))) {
    await window.electronAPI.fs.mkdir(caDir)
  }
  const idDir = `${workspacePath}/content-areas/${contentAreaId}`
  if (!(await window.electronAPI.fs.exists(idDir))) {
    await window.electronAPI.fs.mkdir(idDir)
  }
  if (!(await window.electronAPI.fs.exists(destDir))) {
    await window.electronAPI.fs.mkdir(destDir)
  }

  const results: ContentAreaFile[] = []

  for (const srcPath of sourcePaths) {
    const fileName = srcPath.split(/[\\/]/).pop() || 'file'

    // Deduplicate: if name already taken, add timestamp suffix
    let destName = fileName
    const allNames = [...existingFiles.map((f) => f.name), ...results.map((f) => f.name)]
    if (allNames.includes(destName)) {
      const ext = destName.includes('.') ? '.' + destName.split('.').pop() : ''
      const base = ext ? destName.slice(0, -ext.length) : destName
      destName = `${base}-${Date.now().toString(36)}${ext}`
    }

    const destPath = `${destDir}/${destName}`

    try {
      await window.electronAPI.fs.copyFile(srcPath, destPath)
      results.push({
        id: `caf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: destName,
        path: destPath,
        priority: 2
      })
    } catch (err) {
      console.error(`Failed to copy file ${srcPath}:`, err)
    }
  }

  return results
}

export function ContentAreasSection(): JSX.Element {
  const contentAreas = useAppStore((s) => s.contentAreas)
  const addContentArea = useAppStore((s) => s.addContentArea)
  const updateContentArea = useAppStore((s) => s.updateContentArea)
  const removeContentArea = useAppStore((s) => s.removeContentArea)
  const addContentAreaFile = useAppStore((s) => s.addContentAreaFile)
  const updateContentAreaFilePriority = useAppStore((s) => s.updateContentAreaFilePriority)
  const updateContentAreaFileContext = useAppStore((s) => s.updateContentAreaFileContext)
  const reorderContentAreaFiles = useAppStore((s) => s.reorderContentAreaFiles)
  const removeContentAreaFile = useAppStore((s) => s.removeContentAreaFile)

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ContentAreaFormData>({ ...EMPTY_FORM })
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  // Pending files chosen during "New" form — source paths that need to be copied on save
  const [pendingSourcePaths, setPendingSourcePaths] = useState<string[]>([])
  const [pendingFileNames, setPendingFileNames] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  // Drag-drop upload visual state
  const [isDragOver, setIsDragOver] = useState(false)
  // Context editing — which file's context textarea is open
  const [contextEditFileId, setContextEditFileId] = useState<string | null>(null)
  const [contextEditCardFileId, setContextEditCardFileId] = useState<string | null>(null)
  // Drag-to-reorder state (for form files)
  const [dragReorderIndex, setDragReorderIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)
  // Drag-to-reorder state (for card files)
  const [cardDragFileId, setCardDragFileId] = useState<string | null>(null)
  const [cardDragOverFileId, setCardDragOverFileId] = useState<string | null>(null)
  const [cardDragContentAreaId, setCardDragContentAreaId] = useState<string | null>(null)

  // Card-level drag-drop upload state
  const [cardDragOverId, setCardDragOverId] = useState<string | null>(null)

  function handleAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setPendingSourcePaths([])
    setPendingFileNames([])
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
      accessibilityNeeds: ca.accessibilityNeeds,
      files: ca.files
    })
    setPendingSourcePaths([])
    setPendingFileNames([])
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim() || isSaving) return
    setIsSaving(true)

    try {
      if (editingId) {
        // Editing existing content area — copy any new pending files
        if (pendingSourcePaths.length > 0) {
          const existingFiles = form.files ?? []
          const newFiles = await copyFilesToWorkspace(pendingSourcePaths, editingId, existingFiles)
          const allFiles = [...existingFiles, ...newFiles]
          updateContentArea(editingId, { ...form, files: allFiles })
        } else {
          updateContentArea(editingId, form)
        }
      } else {
        // Creating new content area
        const newId = addContentArea({ ...form, files: [] })

        // Copy pending files to workspace and attach to the new content area
        if (pendingSourcePaths.length > 0) {
          const copiedFiles = await copyFilesToWorkspace(pendingSourcePaths, newId, [])
          if (copiedFiles.length > 0) {
            updateContentArea(newId, { files: copiedFiles })
          }
        }
      }
    } catch (err) {
      console.error('Failed to save content area:', err)
    }

    setShowForm(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setPendingSourcePaths([])
    setPendingFileNames([])
    setIsSaving(false)
  }

  function handleCancel() {
    setShowForm(false)
    setEditingId(null)
    setForm({ ...EMPTY_FORM })
    setPendingSourcePaths([])
    setPendingFileNames([])
  }

  function handleDelete(id: string) {
    removeContentArea(id)
    setConfirmDeleteId(null)
  }

  /** Open native file picker for the create/edit form — adds to pending list */
  async function handleFormFileSelect() {
    try {
      const result = await window.electronAPI.dialog.openFile({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'All Files', extensions: ['*'] }]
      })
      if (result.canceled || !result.filePaths?.length) return

      const newPaths: string[] = []
      const newNames: string[] = []
      for (const fp of result.filePaths) {
        if (pendingSourcePaths.includes(fp)) continue
        newPaths.push(fp)
        newNames.push(fp.split(/[\\/]/).pop() || 'file')
      }
      setPendingSourcePaths((prev) => [...prev, ...newPaths])
      setPendingFileNames((prev) => [...prev, ...newNames])
    } catch (err) {
      console.error('File selection failed:', err)
    }
  }

  /** Handle native drag-and-drop of files onto the form upload zone */
  const handleFormDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const newPaths: string[] = []
    const newNames: string[] = []
    for (let i = 0; i < files.length; i++) {
      const filePath = (files[i] as unknown as { path?: string }).path
      if (!filePath) continue
      if (pendingSourcePaths.includes(filePath)) continue
      newPaths.push(filePath)
      newNames.push(files[i].name)
    }
    if (newPaths.length > 0) {
      setPendingSourcePaths((prev) => [...prev, ...newPaths])
      setPendingFileNames((prev) => [...prev, ...newNames])
    }
  }, [pendingSourcePaths])

  const handleFormDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(true)
  }, [])

  const handleFormDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
  }, [])

  /** Handle drag-and-drop of files directly onto a card */
  const handleCardDrop = useCallback(async (e: React.DragEvent, contentAreaId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setCardDragOverId(null)

    const files = e.dataTransfer.files
    if (!files || files.length === 0) return

    const paths: string[] = []
    for (let i = 0; i < files.length; i++) {
      const filePath = (files[i] as unknown as { path?: string }).path
      if (filePath) paths.push(filePath)
    }
    if (paths.length === 0) return

    const ca = contentAreas.find((c) => c.id === contentAreaId)
    const existingFiles = ca?.files ?? []
    const copiedFiles = await copyFilesToWorkspace(paths, contentAreaId, existingFiles)
    for (const file of copiedFiles) {
      addContentAreaFile(contentAreaId, file)
    }
  }, [contentAreas, addContentAreaFile])

  /** Remove a pending file from the form (not yet saved) */
  function removePendingFile(index: number) {
    setPendingSourcePaths((prev) => prev.filter((_, i) => i !== index))
    setPendingFileNames((prev) => prev.filter((_, i) => i !== index))
  }

  /** Remove an already-saved file from a form being edited */
  function removeExistingFileFromForm(fileId: string) {
    setForm((prev) => ({
      ...prev,
      files: (prev.files ?? []).filter((f) => f.id !== fileId)
    }))
  }

  /** Add files to an existing (already-saved) content area card directly */
  async function handleCardFileUpload(contentAreaId: string) {
    try {
      const result = await window.electronAPI.dialog.openFile({
        properties: ['openFile', 'multiSelections'],
        filters: [{ name: 'All Files', extensions: ['*'] }]
      })
      if (result.canceled || !result.filePaths?.length) return

      const ca = contentAreas.find((c) => c.id === contentAreaId)
      const existingFiles = ca?.files ?? []
      const copiedFiles = await copyFilesToWorkspace(result.filePaths, contentAreaId, existingFiles)

      for (const file of copiedFiles) {
        addContentAreaFile(contentAreaId, file)
      }
    } catch (err) {
      console.error('File upload failed:', err)
    }
  }

  // ── Drag-to-reorder handlers for form saved files ──

  function handleFileReorderDragStart(index: number) {
    setDragReorderIndex(index)
  }

  function handleFileReorderDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleFileReorderDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault()
    if (dragReorderIndex === null || dragReorderIndex === dropIndex) {
      setDragReorderIndex(null)
      setDragOverIndex(null)
      return
    }

    const files = [...(form.files ?? [])]
    const [moved] = files.splice(dragReorderIndex, 1)
    files.splice(dropIndex, 0, moved)
    setForm((prev) => ({ ...prev, files }))
    setDragReorderIndex(null)
    setDragOverIndex(null)
  }

  function handleFileReorderDragEnd() {
    setDragReorderIndex(null)
    setDragOverIndex(null)
  }

  // ── Drag-to-reorder handlers for card files ──

  function handleCardFileReorderDragStart(contentAreaId: string, fileId: string) {
    setCardDragContentAreaId(contentAreaId)
    setCardDragFileId(fileId)
  }

  function handleCardFileReorderDragOver(e: React.DragEvent, fileId: string) {
    e.preventDefault()
    setCardDragOverFileId(fileId)
  }

  function handleCardFileReorderDrop(e: React.DragEvent, contentAreaId: string, dropFileId: string) {
    e.preventDefault()
    if (!cardDragFileId || cardDragContentAreaId !== contentAreaId || cardDragFileId === dropFileId) {
      setCardDragFileId(null)
      setCardDragOverFileId(null)
      setCardDragContentAreaId(null)
      return
    }

    const ca = contentAreas.find((c) => c.id === contentAreaId)
    const files = [...(ca?.files ?? [])]
    const fromIndex = files.findIndex((f) => f.id === cardDragFileId)
    const toIndex = files.findIndex((f) => f.id === dropFileId)
    if (fromIndex === -1 || toIndex === -1) return

    const [moved] = files.splice(fromIndex, 1)
    files.splice(toIndex, 0, moved)
    reorderContentAreaFiles(contentAreaId, files.map((f) => f.id))

    setCardDragFileId(null)
    setCardDragOverFileId(null)
    setCardDragContentAreaId(null)
  }

  function handleCardFileReorderDragEnd() {
    setCardDragFileId(null)
    setCardDragOverFileId(null)
    setCardDragContentAreaId(null)
  }

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

  const PRIORITY_LABELS: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' }

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

          {/* ── File Upload Section ── */}
          <div className="space-y-2 pt-1 border-t border-[var(--border-default)]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
                Reference Files
              </label>
              <button
                type="button"
                onClick={handleFormFileSelect}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] rounded-md border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
              >
                <FileUp size={12} />
                Choose Files
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              Upload reference documents, syllabi, rubrics, or any supporting files. They will be copied into the app workspace.
            </p>

            {/* Upload drop zone — real HTML5 drag-and-drop */}
            <div
              className={`flex flex-col items-center justify-center py-4 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                isDragOver
                  ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/10'
                  : 'border-[var(--border-default)] bg-[var(--bg-muted)] hover:border-[var(--brand-magenta)]'
              }`}
              onClick={handleFormFileSelect}
              onDrop={handleFormDrop}
              onDragOver={handleFormDragOver}
              onDragLeave={handleFormDragLeave}
            >
              <FileUp size={20} className={`mb-1 ${isDragOver ? 'text-[var(--brand-magenta)]' : 'text-[var(--text-tertiary)]'}`} />
              <p className="text-xs text-[var(--text-tertiary)]">
                {isDragOver ? 'Drop files here' : 'Click to browse or drag files here'}
              </p>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">Multiple files supported</p>
            </div>

            {/* Already-saved files (when editing) — draggable for reordering */}
            {editingId && (form.files ?? []).length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-[var(--font-weight-medium)] text-[var(--text-tertiary)]">
                  Saved files ({(form.files ?? []).length}) — drag to reorder
                </p>
                {(form.files ?? []).map((f, i) => (
                  <div
                    key={f.id}
                    draggable
                    onDragStart={() => handleFileReorderDragStart(i)}
                    onDragOver={(e) => handleFileReorderDragOver(e, i)}
                    onDrop={(e) => handleFileReorderDrop(e, i)}
                    onDragEnd={handleFileReorderDragEnd}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md bg-[var(--bg-muted)] border transition-colors ${
                      dragOverIndex === i && dragReorderIndex !== null && dragReorderIndex !== i
                        ? 'border-[var(--brand-indigo)] bg-[var(--brand-indigo)]/5'
                        : 'border-[var(--border-default)]'
                    }`}
                  >
                    <GripVertical size={12} className="text-[var(--text-tertiary)] shrink-0 cursor-grab" />
                    <File size={12} className="text-[var(--text-tertiary)] shrink-0" />
                    <span className="text-xs text-[var(--text-primary)] truncate flex-1" title={f.path}>{f.name}</span>
                    {f.context && (
                      <span className="text-[10px] text-[var(--brand-indigo)] truncate max-w-[120px]" title={f.context}>
                        {f.context.slice(0, 30)}{f.context.length > 30 ? '...' : ''}
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setContextEditFileId(contextEditFileId === f.id ? null : f.id) }}
                      className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--brand-indigo)] cursor-pointer"
                      title="Give context for when/why to use this file"
                    >
                      <MessageSquarePlus size={12} />
                    </button>
                    <select
                      value={f.priority}
                      onChange={(e) => {
                        const newPriority = Number(e.target.value) as 1 | 2 | 3
                        setForm((prev) => ({
                          ...prev,
                          files: (prev.files ?? []).map((ff) =>
                            ff.id === f.id ? { ...ff, priority: newPriority } : ff
                          )
                        }))
                      }}
                      className="px-1.5 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-secondary)] cursor-pointer"
                    >
                      <option value={1}>Low</option>
                      <option value={2}>Medium</option>
                      <option value={3}>High</option>
                    </select>
                    <button
                      onClick={() => removeExistingFileFromForm(f.id)}
                      className="p-0.5 text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                      title="Remove file"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {/* Context edit textarea for form files */}
                {contextEditFileId && (form.files ?? []).find((f) => f.id === contextEditFileId) && (
                  <div className="mt-1 p-2 rounded-md border border-[var(--brand-indigo)] bg-[var(--bg-muted)]">
                    <label className="text-[10px] font-[var(--font-weight-medium)] text-[var(--brand-indigo)] block mb-1">
                      Context: When should AI use this file and why is it important?
                    </label>
                    <textarea
                      value={(form.files ?? []).find((f) => f.id === contextEditFileId)?.context ?? ''}
                      onChange={(e) => {
                        const val = e.target.value
                        setForm((prev) => ({
                          ...prev,
                          files: (prev.files ?? []).map((ff) =>
                            ff.id === contextEditFileId ? { ...ff, context: val } : ff
                          )
                        }))
                      }}
                      placeholder="e.g., Use this rubric template when generating assessment criteria for written essays..."
                      rows={2}
                      className="w-full px-2 py-1.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-indigo)] resize-none"
                    />
                    <button
                      onClick={() => setContextEditFileId(null)}
                      className="mt-1 px-2 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-[var(--brand-indigo)] rounded border border-[var(--brand-indigo)] hover:bg-[var(--brand-indigo)]/10 cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Pending new files (not yet copied) */}
            {pendingFileNames.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] font-[var(--font-weight-medium)] text-[var(--text-tertiary)]">
                  New files to upload ({pendingFileNames.length})
                </p>
                {pendingFileNames.map((name, i) => (
                  <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-[var(--bg-muted)] border border-dashed border-[var(--brand-magenta)]">
                    <FileUp size={12} className="text-[var(--brand-magenta)] shrink-0" />
                    <span className="text-xs text-[var(--text-primary)] truncate flex-1">{name}</span>
                    <span className="text-[10px] text-[var(--text-tertiary)]">will be copied</span>
                    <button
                      onClick={() => removePendingFile(i)}
                      className="p-0.5 text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                      title="Remove"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleSave}
              disabled={!form.name.trim() || isSaving}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Check size={14} />
              {isSaving ? 'Saving...' : editingId ? 'Save Changes' : 'Create'}
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
              className={`p-4 rounded-lg border bg-[var(--bg-surface)] space-y-2 transition-colors ${
                cardDragOverId === ca.id
                  ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5'
                  : 'border-[var(--border-default)]'
              }`}
              onDrop={(e) => handleCardDrop(e, ca.id)}
              onDragOver={(e) => { e.preventDefault(); setCardDragOverId(ca.id) }}
              onDragLeave={() => setCardDragOverId(null)}
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

              {/* Files on card — draggable for reordering, droppable for uploads */}
              <div className="pt-1 border-t border-[var(--border-default)]">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-[var(--font-weight-medium)] text-[var(--text-tertiary)]">
                    Files ({ca.files?.length ?? 0}) {(ca.files?.length ?? 0) > 1 ? '— drag to reorder' : ''}
                  </span>
                  <button
                    onClick={() => handleCardFileUpload(ca.id)}
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
                      <div key={f.id}>
                        <div
                          draggable
                          onDragStart={() => handleCardFileReorderDragStart(ca.id, f.id)}
                          onDragOver={(e) => handleCardFileReorderDragOver(e, f.id)}
                          onDrop={(e) => handleCardFileReorderDrop(e, ca.id, f.id)}
                          onDragEnd={handleCardFileReorderDragEnd}
                          className={`flex items-center gap-1.5 text-[10px] px-1 py-0.5 rounded transition-colors ${
                            cardDragOverFileId === f.id && cardDragFileId !== f.id
                              ? 'bg-[var(--brand-indigo)]/10 border border-[var(--brand-indigo)]'
                              : ''
                          }`}
                        >
                          <GripVertical size={10} className="text-[var(--text-tertiary)] shrink-0 cursor-grab" />
                          <File size={10} className="text-[var(--text-tertiary)] shrink-0" />
                          <span className="text-[var(--text-secondary)] truncate flex-1" title={f.path}>{f.name}</span>
                          <button
                            onClick={() => setContextEditCardFileId(contextEditCardFileId === f.id ? null : f.id)}
                            className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--brand-indigo)] cursor-pointer"
                            title="Give context"
                          >
                            <MessageSquarePlus size={10} />
                          </button>
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
                        {/* Context snippet display */}
                        {f.context && contextEditCardFileId !== f.id && (
                          <p className="ml-6 text-[10px] text-[var(--brand-indigo)] italic truncate" title={f.context}>
                            {f.context}
                          </p>
                        )}
                        {/* Context edit textarea on card */}
                        {contextEditCardFileId === f.id && (
                          <div className="ml-6 mt-1 p-1.5 rounded border border-[var(--brand-indigo)] bg-[var(--bg-muted)]">
                            <label className="text-[10px] font-[var(--font-weight-medium)] text-[var(--brand-indigo)] block mb-0.5">
                              When should AI use this file?
                            </label>
                            <textarea
                              value={f.context ?? ''}
                              onChange={(e) => updateContentAreaFileContext(ca.id, f.id, e.target.value)}
                              placeholder="e.g., Reference this document when creating quizzes about safety protocols..."
                              rows={2}
                              className="w-full px-2 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-1 focus:ring-[var(--brand-indigo)] resize-none"
                            />
                            <button
                              onClick={() => setContextEditCardFileId(null)}
                              className="mt-0.5 px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-[var(--brand-indigo)] rounded border border-[var(--brand-indigo)] hover:bg-[var(--brand-indigo)]/10 cursor-pointer"
                            >
                              Done
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {(ca.files ?? []).length === 0 && (
                  <p className="text-[10px] text-[var(--text-tertiary)] italic">Drop files here or click Add</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
