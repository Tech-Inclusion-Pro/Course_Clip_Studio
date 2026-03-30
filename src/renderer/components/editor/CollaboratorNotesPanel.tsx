import { useState } from 'react'
import {
  X,
  MessageSquare,
  Plus,
  Check,
  Undo2,
  Trash2,
  Filter
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useAppStore } from '@/stores/useAppStore'
import { uid } from '@/lib/uid'
import { findLesson } from '@/lib/course-helpers'
import { BLOCK_TYPE_LABELS } from '@/types/course'
import type { CollaboratorNote, ContentBlock } from '@/types/course'

interface CollaboratorNotesPanelProps {
  onClose: () => void
}

export function CollaboratorNotesPanel({ onClose }: CollaboratorNotesPanelProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const addNote = useCourseStore((s) => s.addNote)
  const resolveNote = useCourseStore((s) => s.resolveNote)
  const unresolveNote = useCourseStore((s) => s.unresolveNote)
  const deleteNote = useCourseStore((s) => s.deleteNote)

  const activeModuleId = useEditorStore((s) => s.activeModuleId)
  const activeLessonId = useEditorStore((s) => s.activeLessonId)
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock)

  const authorName = useAppStore((s) => s.authorName)

  const [showResolved, setShowResolved] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const [noteBlockId, setNoteBlockId] = useState('')
  const [noteContent, setNoteContent] = useState('')

  // Find current lesson data
  const lessonData = course && activeModuleId && activeLessonId
    ? findLesson(course, activeLessonId)
    : null
  const lesson = lessonData?.lesson ?? null
  const moduleId = lessonData?.module.id ?? activeModuleId

  const allNotes = lesson?.notes ?? []
  const filteredNotes = showResolved ? allNotes : allNotes.filter((n) => !n.resolved)
  const unresolvedCount = allNotes.filter((n) => !n.resolved).length
  const blocks = lesson?.blocks ?? []

  // Group notes by block
  const blockMap = new Map<string, ContentBlock>()
  for (const b of blocks) blockMap.set(b.id, b)

  // Sort notes newest first
  const sortedNotes = [...filteredNotes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )

  function handleAddNote() {
    if (!activeCourseId || !moduleId || !activeLessonId || !noteContent.trim()) return
    const note: CollaboratorNote = {
      id: uid('note'),
      blockId: noteBlockId || '',
      author: authorName,
      content: noteContent.trim(),
      timestamp: new Date().toISOString(),
      resolved: false
    }
    addNote(activeCourseId, moduleId, activeLessonId, note)
    setNoteContent('')
    setNoteBlockId('')
    setAddingNote(false)
  }

  function handleResolve(noteId: string) {
    if (!activeCourseId || !moduleId || !activeLessonId) return
    resolveNote(activeCourseId, moduleId, activeLessonId, noteId)
  }

  function handleUnresolve(noteId: string) {
    if (!activeCourseId || !moduleId || !activeLessonId) return
    unresolveNote(activeCourseId, moduleId, activeLessonId, noteId)
  }

  function handleDelete(noteId: string) {
    if (!activeCourseId || !moduleId || !activeLessonId) return
    deleteNote(activeCourseId, moduleId, activeLessonId, noteId)
  }

  function handleNavigateToBlock(blockId: string) {
    if (blockId) setSelectedBlock(blockId)
  }

  function formatTimestamp(iso: string): string {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <MessageSquare size={16} className="text-[var(--brand-purple)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Notes
          </h2>
          {unresolvedCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-semibold)] rounded-full bg-[var(--brand-magenta)] text-white">
              {unresolvedCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Close notes panel"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {/* No lesson selected */}
        {!lesson && (
          <div className="text-center py-8">
            <MessageSquare size={24} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
            <p className="text-xs text-[var(--text-tertiary)]">
              Select a lesson to view and add notes.
            </p>
          </div>
        )}

        {lesson && (
          <>
            {/* Controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowResolved(!showResolved)}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-[var(--font-weight-semibold)] cursor-pointer transition-colors ${
                  showResolved
                    ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
                aria-pressed={showResolved}
              >
                <Filter size={10} />
                {showResolved ? 'Showing all' : 'Hiding resolved'}
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setAddingNote(true)}
              >
                <Plus size={14} />
                Add Note
              </Button>
            </div>

            {/* Add note form */}
            {addingNote && (
              <div className="p-2.5 rounded-lg border border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5 space-y-2">
                <div>
                  <label className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] block mb-1">
                    Attach to block (optional)
                  </label>
                  <select
                    value={noteBlockId}
                    onChange={(e) => setNoteBlockId(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  >
                    <option value="">General (no block)</option>
                    {blocks.map((b, i) => (
                      <option key={b.id} value={b.id}>
                        #{i + 1} — {BLOCK_TYPE_LABELS[b.type]}
                        {b.ariaLabel && b.ariaLabel !== BLOCK_TYPE_LABELS[b.type] ? ` (${b.ariaLabel})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] block mb-1">
                    Note
                  </label>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    placeholder="Write a note..."
                    rows={3}
                    autoFocus
                    className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                  />
                </div>
                <div className="flex justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setAddingNote(false); setNoteContent(''); setNoteBlockId('') }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAddNote}
                    disabled={!noteContent.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            )}

            {/* Notes list */}
            {sortedNotes.length === 0 && !addingNote && (
              <div className="text-center py-6">
                <MessageSquare size={20} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
                <p className="text-xs text-[var(--text-tertiary)]">
                  {allNotes.length > 0 ? 'All notes resolved.' : 'No notes on this lesson yet.'}
                </p>
              </div>
            )}

            {sortedNotes.map((note) => {
              const block = note.blockId ? blockMap.get(note.blockId) : null
              return (
                <NoteCard
                  key={note.id}
                  note={note}
                  block={block}
                  onResolve={() => handleResolve(note.id)}
                  onUnresolve={() => handleUnresolve(note.id)}
                  onDelete={() => handleDelete(note.id)}
                  onNavigate={() => handleNavigateToBlock(note.blockId)}
                />
              )
            })}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Note Card ───

function NoteCard({
  note,
  block,
  onResolve,
  onUnresolve,
  onDelete,
  onNavigate
}: {
  note: CollaboratorNote
  block: ContentBlock | null | undefined
  onResolve: () => void
  onUnresolve: () => void
  onDelete: () => void
  onNavigate: () => void
}): JSX.Element {
  const formatTimestamp = (iso: string): string => {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div
      className={`p-2.5 rounded-lg border transition-colors ${
        note.resolved
          ? 'border-[var(--border-default)] opacity-60'
          : 'border-[var(--border-default)] hover:border-[var(--brand-purple)]/50'
      }`}
    >
      {/* Author & timestamp */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-[var(--brand-purple)] text-white flex items-center justify-center text-[9px] font-[var(--font-weight-semibold)]">
            {note.author.charAt(0).toUpperCase()}
          </div>
          <span className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {note.author}
          </span>
        </div>
        <span className="text-[9px] text-[var(--text-tertiary)]">
          {formatTimestamp(note.timestamp)}
        </span>
      </div>

      {/* Block reference */}
      {block && (
        <button
          onClick={onNavigate}
          className="mb-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-[var(--bg-hover)] text-[9px] font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--brand-magenta)] cursor-pointer transition-colors"
          title="Click to select block"
        >
          {BLOCK_TYPE_LABELS[block.type]} block
        </button>
      )}

      {/* Content */}
      <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap mb-2">
        {note.content}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-1">
        {note.resolved ? (
          <button
            onClick={onUnresolve}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-[var(--font-weight-semibold)] cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Reopen note"
            title="Reopen"
          >
            <Undo2 size={10} />
            Reopen
          </button>
        ) : (
          <button
            onClick={onResolve}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-[var(--font-weight-semibold)] cursor-pointer text-green-600 hover:bg-green-50 transition-colors"
            aria-label="Resolve note"
            title="Resolve"
          >
            <Check size={10} />
            Resolve
          </button>
        )}
        <button
          onClick={onDelete}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-[var(--font-weight-semibold)] cursor-pointer text-[var(--color-danger-600,#dc2626)] hover:bg-[var(--color-danger-100,#fee2e2)] transition-colors"
          aria-label="Delete note"
          title="Delete"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  )
}
