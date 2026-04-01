import { useState, useRef } from 'react'
import { X, Plus, Search, Trash2, Edit3, Check, Download, Upload } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { createQuizQuestion } from '@/lib/block-factories'
import {
  generateQuestionBankTemplate,
  parseQuestionBankCsv,
  exportQuestionsToCsv
} from '@/lib/question-bank-csv'
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
  const [importStatus, setImportStatus] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  function handleDownloadTemplate() {
    const csv = generateQuestionBankTemplate()
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'question_bank_template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleExportQuestions() {
    if (bank.length === 0) return
    const csv = exportQuestionsToCsv(bank)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${course!.meta.title.replace(/[^a-zA-Z0-9]/g, '_')}_questions.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string
      const imported = parseQuestionBankCsv(text)
      if (imported.length === 0) {
        setImportStatus('No valid questions found in file.')
        setTimeout(() => setImportStatus(null), 3000)
        return
      }
      const newBank = [...bank, ...imported]
      updateCourse(activeCourseId!, { questionBank: newBank } as any)
      setImportStatus(`Imported ${imported.length} question${imported.length !== 1 ? 's' : ''}.`)
      setTimeout(() => setImportStatus(null), 3000)
    }
    reader.readAsText(file)
    // Reset file input so the same file can be re-selected
    e.target.value = ''
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

      {/* Template Download / Upload */}
      <div className="px-3 py-2 border-b border-[var(--border-default)] shrink-0 space-y-1.5">
        <p className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
          Import / Export
        </p>
        <div className="flex gap-1.5">
          <button
            onClick={handleDownloadTemplate}
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded hover:bg-[var(--bg-hover)] cursor-pointer"
            title="Download a blank CSV template to fill out in Excel or Google Sheets"
          >
            <Download size={10} /> Template
          </button>
          <label
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded hover:bg-[var(--bg-hover)] cursor-pointer"
            title="Upload a filled CSV template to import questions"
          >
            <Upload size={10} /> Import CSV
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
        {bank.length > 0 && (
          <button
            onClick={handleExportQuestions}
            className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <Download size={10} /> Export All ({bank.length})
          </button>
        )}
        {importStatus && (
          <p className="text-[10px] text-[var(--brand-magenta)] font-[var(--font-weight-medium)]">
            {importStatus}
          </p>
        )}
        <p className="text-[9px] text-[var(--text-tertiary)]">
          CSV template works in Excel, Google Sheets, and Numbers.
        </p>
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
