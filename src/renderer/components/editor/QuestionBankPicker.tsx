import { useState } from 'react'
import { Plus, X, Search } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import type { QuizQuestion } from '@/types/course'

interface QuestionBankPickerProps {
  onSelect: (question: QuizQuestion) => void
  onClose: () => void
}

export function QuestionBankPicker({ onSelect, onClose }: QuestionBankPickerProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const [search, setSearch] = useState('')

  const bank = course?.questionBank ?? []
  const filtered = bank.filter((q) => q.prompt.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="border border-[var(--border-default)] rounded-lg bg-[var(--bg-surface)] shadow-lg p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Add from Bank</span>
        <button onClick={onClose} className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
          <X size={12} />
        </button>
      </div>

      <div className="relative">
        <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-6 pr-2 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)]"
        />
      </div>

      <div className="max-h-32 overflow-y-auto space-y-1">
        {filtered.length === 0 ? (
          <p className="text-[10px] text-[var(--text-tertiary)] text-center py-2">
            {bank.length === 0 ? 'No questions in bank.' : 'No matches.'}
          </p>
        ) : (
          filtered.map((q) => (
            <button
              key={q.id}
              onClick={() => { onSelect({ ...q, id: q.id }); onClose() }}
              className="w-full text-left px-2 py-1.5 rounded text-[10px] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer flex items-center gap-1"
            >
              <Plus size={10} className="shrink-0 text-[var(--text-tertiary)]" />
              <span className="truncate">{q.prompt || 'Untitled'}</span>
              <span className="shrink-0 text-[9px] text-[var(--text-tertiary)]">{q.type}</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
