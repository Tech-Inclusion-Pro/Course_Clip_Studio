import { useState } from 'react'
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ClipboardList
} from 'lucide-react'
import { uid } from '@/lib/uid'
import type { FeedbackFormBlock, FeedbackQuestion, FeedbackQuestionType } from '@/types/course'

interface FeedbackFormBlockEditorProps {
  block: FeedbackFormBlock
  onUpdate: (partial: Partial<FeedbackFormBlock>) => void
}

const QUESTION_TYPE_LABELS: Record<FeedbackQuestionType, string> = {
  'likert': 'Likert Scale',
  'free-text': 'Free Text',
  'rating': 'Rating',
  'multiple-choice': 'Multiple Choice'
}

export function FeedbackFormBlockEditor({ block, onUpdate }: FeedbackFormBlockEditorProps): JSX.Element {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function addQuestion() {
    const q: FeedbackQuestion = {
      id: uid('fbq'),
      type: 'likert',
      prompt: '',
      required: false,
      scale: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    }
    onUpdate({ questions: [...block.questions, q] })
    setExpandedId(q.id)
  }

  function removeQuestion(id: string) {
    onUpdate({ questions: block.questions.filter((q) => q.id !== id) })
    if (expandedId === id) setExpandedId(null)
  }

  function updateQuestion(id: string, partial: Partial<FeedbackQuestion>) {
    onUpdate({
      questions: block.questions.map((q) => (q.id === id ? { ...q, ...partial } : q))
    })
  }

  function handleTypeChange(id: string, newType: FeedbackQuestionType) {
    const defaults: Partial<FeedbackQuestion> = { type: newType }
    if (newType === 'likert') {
      defaults.scale = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree']
    } else if (newType === 'rating') {
      defaults.maxRating = 5
    } else if (newType === 'multiple-choice') {
      defaults.options = ['Option 1', 'Option 2', 'Option 3']
    }
    updateQuestion(id, defaults)
  }

  function moveQuestion(fromIdx: number, direction: 'up' | 'down') {
    const toIdx = direction === 'up' ? fromIdx - 1 : fromIdx + 1
    if (toIdx < 0 || toIdx >= block.questions.length) return
    const newQuestions = [...block.questions]
    const [moved] = newQuestions.splice(fromIdx, 1)
    newQuestions.splice(toIdx, 0, moved)
    onUpdate({ questions: newQuestions })
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Feedback form block editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <ClipboardList size={18} className="text-[var(--brand-magenta)]" />
          <div>
            <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              Feedback Form
            </h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {block.questions.length} question{block.questions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Form settings */}
      <div className="px-4 py-3 border-b border-[var(--border-default)] space-y-3">
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Submit Button Label
          </label>
          <input
            type="text"
            value={block.submitLabel}
            onChange={(e) => onUpdate({ submitLabel: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="Submit Feedback"
          />
        </div>
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Thank You Message
          </label>
          <textarea
            value={block.thankYouMessage}
            onChange={(e) => onUpdate({ thankYouMessage: e.target.value })}
            rows={2}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            placeholder="Thank you for your feedback!"
          />
        </div>
      </div>

      {/* Questions */}
      <div className="p-4 space-y-3">
        {block.questions.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <ClipboardList size={32} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">No questions yet</p>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">Add feedback questions to collect learner responses.</p>
          </div>
        ) : (
          block.questions.map((q, idx) => (
            <div key={q.id} className="rounded-lg border border-[var(--border-default)] overflow-hidden">
              {/* Question header */}
              <div
                className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-muted)] cursor-pointer"
                onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
              >
                <GripVertical size={12} className="text-[var(--text-tertiary)]" />
                <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)] flex-1 truncate">
                  {q.prompt || `Question ${idx + 1}`}
                </span>
                <span className="text-[9px] text-[var(--text-tertiary)] px-1.5 py-0.5 rounded bg-[var(--bg-surface)]">
                  {QUESTION_TYPE_LABELS[q.type]}
                </span>
                {q.required && (
                  <span className="text-[9px] text-red-500 font-[var(--font-weight-medium)]">Required</span>
                )}
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => { e.stopPropagation(); moveQuestion(idx, 'up') }}
                    disabled={idx === 0}
                    className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                    aria-label="Move up"
                  >
                    <ChevronUp size={10} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); moveQuestion(idx, 'down') }}
                    disabled={idx === block.questions.length - 1}
                    className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer"
                    aria-label="Move down"
                  >
                    <ChevronDown size={10} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeQuestion(q.id) }}
                    className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                    aria-label="Delete question"
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>

              {/* Question editor (expanded) */}
              {expandedId === q.id && (
                <div className="px-3 py-3 space-y-3">
                  <div>
                    <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                      Prompt
                    </label>
                    <input
                      type="text"
                      value={q.prompt}
                      onChange={(e) => updateQuestion(q.id, { prompt: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                      placeholder="Enter question prompt..."
                      autoFocus
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Type
                      </label>
                      <select
                        value={q.type}
                        onChange={(e) => handleTypeChange(q.id, e.target.value as FeedbackQuestionType)}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                      >
                        <option value="likert">Likert Scale</option>
                        <option value="free-text">Free Text</option>
                        <option value="rating">Rating</option>
                        <option value="multiple-choice">Multiple Choice</option>
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(q.id, { required: e.target.checked })}
                          className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
                        />
                        <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">Required</span>
                      </label>
                    </div>
                  </div>

                  {/* Type-specific options */}
                  {q.type === 'rating' && (
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Max Rating
                      </label>
                      <input
                        type="number"
                        min={3}
                        max={10}
                        value={q.maxRating ?? 5}
                        onChange={(e) => updateQuestion(q.id, { maxRating: Math.max(3, Math.min(10, Number(e.target.value))) })}
                        className="w-20 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                      />
                    </div>
                  )}

                  {q.type === 'multiple-choice' && (
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Options
                      </label>
                      <div className="space-y-1">
                        {(q.options ?? []).map((opt, oi) => (
                          <div key={oi} className="flex items-center gap-1">
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => {
                                const newOpts = [...(q.options ?? [])]
                                newOpts[oi] = e.target.value
                                updateQuestion(q.id, { options: newOpts })
                              }}
                              className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                            />
                            <button
                              onClick={() => {
                                const newOpts = (q.options ?? []).filter((_, i) => i !== oi)
                                updateQuestion(q.id, { options: newOpts })
                              }}
                              className="p-0.5 text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => updateQuestion(q.id, { options: [...(q.options ?? []), `Option ${(q.options ?? []).length + 1}`] })}
                          className="flex items-center gap-1 text-[10px] text-[var(--brand-magenta)] cursor-pointer"
                        >
                          <Plus size={10} /> Add option
                        </button>
                      </div>
                    </div>
                  )}

                  {q.type === 'likert' && (
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Scale Labels
                      </label>
                      <div className="space-y-1">
                        {(q.scale ?? []).map((s, si) => (
                          <div key={si} className="flex items-center gap-1">
                            <span className="text-[9px] text-[var(--text-tertiary)] w-4 text-right">{si + 1}</span>
                            <input
                              type="text"
                              value={s}
                              onChange={(e) => {
                                const newScale = [...(q.scale ?? [])]
                                newScale[si] = e.target.value
                                updateQuestion(q.id, { scale: newScale })
                              }}
                              className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}

        {/* Add question button */}
        <div className="pt-2 border-t border-[var(--border-default)]">
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            aria-label="Add feedback question"
          >
            <Plus size={12} />
            Add Question
          </button>
        </div>
      </div>
    </div>
  )
}
