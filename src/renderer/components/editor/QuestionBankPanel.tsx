import { useState } from 'react'
import { X, Plus, Search, Trash2, Edit3, Check } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { createQuizQuestion } from '@/lib/block-factories'
import type { QuizQuestion } from '@/types/course'

interface QuestionBankPanelProps {
  onClose: () => void
}

export function QuestionBankPanel({ onClose }: QuestionBankPanelProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateCourse = useCourseStore((s) => s.updateCourse)
  const [search, setSearch] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!course || !activeCourseId) {
    return <div className="p-4 text-sm text-[var(--text-tertiary)]">No course loaded.</div>
  }

  const bank = course.questionBank ?? []
  const filtered = bank.filter((q) =>
    q.prompt.toLowerCase().includes(search.toLowerCase())
  )

  function addQuestion() {
    const q = createQuizQuestion('multiple-choice')
    const newBank = [...bank, q]
    updateCourse(activeCourseId!, { questionBank: newBank } as any)
    setEditingId(q.id)
  }

  function removeQuestion(id: string) {
    const newBank = bank.filter((q) => q.id !== id)
    updateCourse(activeCourseId!, { questionBank: newBank } as any)
  }

  function updateQuestion(id: string, partial: Partial<QuizQuestion>) {
    const newBank = bank.map((q) => (q.id === id ? { ...q, ...partial } : q))
    updateCourse(activeCourseId!, { questionBank: newBank } as any)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-default)] shrink-0">
        <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          Question Bank
        </h2>
        <button onClick={onClose} className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer" aria-label="Close">
          <X size={14} />
        </button>
      </div>

      {/* Search + Add */}
      <div className="px-3 py-2 border-b border-[var(--border-default)] shrink-0 space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
        <button
          onClick={addQuestion}
          className="w-full flex items-center justify-center gap-1 px-3 py-1.5 text-xs text-white bg-[var(--brand-magenta)] rounded hover:opacity-90 cursor-pointer"
        >
          <Plus size={12} /> Add Question
        </button>
      </div>

      {/* Question list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
            {bank.length === 0 ? 'No questions in bank yet.' : 'No matching questions.'}
          </p>
        ) : (
          filtered.map((q) => (
            <div key={q.id} className="p-2 rounded border border-[var(--border-default)] bg-[var(--bg-primary)]">
              {editingId === q.id ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={q.prompt}
                    onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                    className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Question prompt..."
                    autoFocus
                  />
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-[var(--text-tertiary)]">{q.type}</span>
                    <span className="text-[9px] text-[var(--text-tertiary)]">· {q.choices.length} choices</span>
                  </div>
                  <button onClick={() => setEditingId(null)} className="text-[10px] text-[var(--brand-magenta)] cursor-pointer">
                    <Check size={10} className="inline mr-0.5" /> Done
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] text-[var(--text-primary)] truncate">{q.prompt || 'Untitled question'}</p>
                    <p className="text-[9px] text-[var(--text-tertiary)]">{q.type} · {q.choices.length} choices</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <button onClick={() => setEditingId(q.id)} className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                      <Edit3 size={10} />
                    </button>
                    <button onClick={() => removeQuestion(q.id)} className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer">
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-2 border-t border-[var(--border-default)] shrink-0">
        <p className="text-[9px] text-[var(--text-tertiary)]">{bank.length} question{bank.length !== 1 ? 's' : ''} in bank</p>
      </div>
    </div>
  )
}
