import { useState } from 'react'
import {
  X,
  StickyNote,
  Bookmark,
  Plus,
  Trash2,
  Edit3,
  Check,
  ExternalLink
} from 'lucide-react'
import { usePreviewStore } from '@/stores/usePreviewStore'
import { uid } from '@/lib/uid'

interface LearnerNotesSidebarProps {
  currentLessonId: string
  currentLessonTitle: string
  onNavigateToLesson?: (lessonId: string) => void
  onClose: () => void
}

type Tab = 'notes' | 'bookmarks'

export function LearnerNotesSidebar({
  currentLessonId,
  currentLessonTitle,
  onNavigateToLesson,
  onClose
}: LearnerNotesSidebarProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<Tab>('notes')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)

  const notes = usePreviewStore((s) => s.notes)
  const bookmarks = usePreviewStore((s) => s.bookmarks)
  const addNote = usePreviewStore((s) => s.addNote)
  const removeNote = usePreviewStore((s) => s.removeNote)
  const updateNote = usePreviewStore((s) => s.updateNote)
  const addBookmark = usePreviewStore((s) => s.addBookmark)
  const removeBookmark = usePreviewStore((s) => s.removeBookmark)

  const lessonNotes = notes.filter((n) => n.lessonId === currentLessonId)
  const allNotes = notes

  function handleAddNote() {
    if (!newNoteContent.trim()) return
    addNote({
      id: uid('note'),
      lessonId: currentLessonId,
      content: newNoteContent.trim(),
      timestamp: new Date().toISOString()
    })
    setNewNoteContent('')
    setIsAddingNote(false)
  }

  function handleToggleBookmark() {
    const existing = bookmarks.find((b) => b.lessonId === currentLessonId)
    if (existing) {
      removeBookmark(existing.id)
    } else {
      addBookmark({
        id: uid('bookmark'),
        lessonId: currentLessonId,
        title: currentLessonTitle,
        timestamp: new Date().toISOString()
      })
    }
  }

  const isBookmarked = bookmarks.some((b) => b.lessonId === currentLessonId)

  return (
    <aside className="w-72 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-default)] shrink-0">
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          Learner Tools
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
          aria-label="Close sidebar"
        >
          <X size={14} />
        </button>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-[var(--border-default)] shrink-0">
        <button
          onClick={() => setActiveTab('notes')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-[var(--font-weight-medium)] cursor-pointer transition-colors ${
            activeTab === 'notes'
              ? 'text-[var(--text-brand)] border-b-2 border-[var(--brand-magenta)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <StickyNote size={12} />
          Notes ({allNotes.length})
        </button>
        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-[var(--font-weight-medium)] cursor-pointer transition-colors ${
            activeTab === 'bookmarks'
              ? 'text-[var(--text-brand)] border-b-2 border-[var(--brand-magenta)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Bookmark size={12} />
          Bookmarks ({bookmarks.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeTab === 'notes' && (
          <div className="space-y-3">
            {/* Bookmark toggle for current lesson */}
            <button
              onClick={handleToggleBookmark}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs rounded-md border cursor-pointer transition-colors ${
                isBookmarked
                  ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/10 text-[var(--brand-magenta)]'
                  : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Bookmark size={12} fill={isBookmarked ? 'currentColor' : 'none'} />
              {isBookmarked ? 'Bookmarked' : 'Bookmark this lesson'}
            </button>

            {/* Add note section */}
            {isAddingNote ? (
              <div className="space-y-2">
                <textarea
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                  className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                  placeholder="Write your note..."
                  autoFocus
                />
                <div className="flex gap-1">
                  <button
                    onClick={handleAddNote}
                    disabled={!newNoteContent.trim()}
                    className="flex items-center gap-1 px-2.5 py-1 text-[10px] text-white bg-[var(--brand-magenta)] rounded hover:opacity-90 cursor-pointer disabled:opacity-40"
                  >
                    <Check size={10} /> Save
                  </button>
                  <button
                    onClick={() => { setIsAddingNote(false); setNewNoteContent('') }}
                    className="px-2.5 py-1 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingNote(true)}
                className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-dashed border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
              >
                <Plus size={12} /> Add Note
              </button>
            )}

            {/* Notes for current lesson */}
            {lessonNotes.length > 0 && (
              <div>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  This Lesson ({lessonNotes.length})
                </p>
                <div className="space-y-2">
                  {lessonNotes.map((note) => (
                    <div key={note.id} className="p-2 rounded border border-[var(--border-default)] bg-[var(--bg-primary)]">
                      {editingNoteId === note.id ? (
                        <div className="space-y-1">
                          <textarea
                            value={note.content}
                            onChange={(e) => updateNote(note.id, e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] resize-none"
                            autoFocus
                          />
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="text-[10px] text-[var(--brand-magenta)] cursor-pointer"
                          >
                            <Check size={10} className="inline mr-0.5" /> Done
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap mb-1">{note.content}</p>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] text-[var(--text-tertiary)]">
                              {new Date(note.timestamp).toLocaleString()}
                            </span>
                            <div className="flex gap-0.5">
                              <button
                                onClick={() => setEditingNoteId(note.id)}
                                className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                                aria-label="Edit note"
                              >
                                <Edit3 size={10} />
                              </button>
                              <button
                                onClick={() => removeNote(note.id)}
                                className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                                aria-label="Delete note"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All notes from other lessons */}
            {allNotes.filter((n) => n.lessonId !== currentLessonId).length > 0 && (
              <div>
                <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                  Other Lessons
                </p>
                <div className="space-y-2">
                  {allNotes
                    .filter((n) => n.lessonId !== currentLessonId)
                    .map((note) => (
                      <div key={note.id} className="p-2 rounded border border-[var(--border-default)] bg-[var(--bg-primary)] opacity-70">
                        <p className="text-xs text-[var(--text-primary)] whitespace-pre-wrap mb-1 line-clamp-2">{note.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] text-[var(--text-tertiary)]">
                            {new Date(note.timestamp).toLocaleString()}
                          </span>
                          <button
                            onClick={() => removeNote(note.id)}
                            className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                            aria-label="Delete note"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {allNotes.length === 0 && !isAddingNote && (
              <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
                No notes yet. Click &ldquo;Add Note&rdquo; to get started.
              </p>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="space-y-2">
            {bookmarks.length === 0 ? (
              <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
                No bookmarks yet. Bookmark lessons to quickly return to them.
              </p>
            ) : (
              bookmarks.map((bm) => (
                <div
                  key={bm.id}
                  className="flex items-center gap-2 p-2 rounded border border-[var(--border-default)] bg-[var(--bg-primary)]"
                >
                  <Bookmark size={12} className="text-[var(--brand-magenta)] shrink-0" fill="currentColor" />
                  <div className="flex-1 min-w-0">
                    <button
                      onClick={() => onNavigateToLesson?.(bm.lessonId)}
                      className="text-xs text-[var(--text-primary)] hover:text-[var(--brand-magenta)] truncate block w-full text-left cursor-pointer"
                    >
                      {bm.title}
                    </button>
                    <span className="text-[9px] text-[var(--text-tertiary)]">
                      {new Date(bm.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {onNavigateToLesson && (
                      <button
                        onClick={() => onNavigateToLesson(bm.lessonId)}
                        className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                        aria-label="Go to lesson"
                      >
                        <ExternalLink size={10} />
                      </button>
                    )}
                    <button
                      onClick={() => removeBookmark(bm.id)}
                      className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                      aria-label="Remove bookmark"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
