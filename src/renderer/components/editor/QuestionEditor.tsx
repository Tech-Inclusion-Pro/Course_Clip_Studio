import { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  MessageSquare,
  GripVertical
} from 'lucide-react'
import { createQuizChoice } from '@/lib/block-factories'
import type { QuizQuestion, QuizChoice } from '@/types/course'

interface QuestionEditorProps {
  question: QuizQuestion
  index: number
  onUpdate: (updated: QuizQuestion) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}

export function QuestionEditor({
  question,
  index,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: QuestionEditorProps): JSX.Element {
  const [expanded, setExpanded] = useState(true)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  function updateChoice(choiceId: string, partial: Partial<QuizChoice>) {
    const choices = question.choices.map((c) =>
      c.id === choiceId ? { ...c, ...partial } : c
    )
    onUpdate({ ...question, choices })
  }

  function setCorrectAnswer(choiceId: string) {
    const choices = question.choices.map((c) => ({
      ...c,
      isCorrect: c.id === choiceId
    }))
    onUpdate({ ...question, choices, correctId: choiceId })
  }

  function addChoice() {
    const newChoice = createQuizChoice({
      label: `Option ${String.fromCharCode(65 + question.choices.length)}`
    })
    onUpdate({
      ...question,
      choices: [...question.choices, newChoice]
    })
  }

  function removeChoice(choiceId: string) {
    const choices = question.choices.filter((c) => c.id !== choiceId)
    // If removed choice was correct, set first choice as correct
    let correctId = question.correctId
    if (correctId === choiceId && choices.length > 0) {
      choices[0].isCorrect = true
      correctId = choices[0].id
    }
    onUpdate({ ...question, choices, correctId })
  }

  function changeType(newType: QuizQuestion['type']) {
    // When changing type, rebuild choices appropriately
    if (newType === 'true-false') {
      const t = createQuizChoice({ label: 'True', isCorrect: true })
      const f = createQuizChoice({ label: 'False' })
      onUpdate({
        ...question,
        type: newType,
        choices: [t, f],
        correctId: t.id
      })
    } else if (newType === 'short-answer') {
      onUpdate({
        ...question,
        type: newType,
        choices: [],
        correctId: ''
      })
    } else if (newType === 'likert') {
      const choices = [
        createQuizChoice({ label: 'Strongly Disagree' }),
        createQuizChoice({ label: 'Disagree' }),
        createQuizChoice({ label: 'Neutral' }),
        createQuizChoice({ label: 'Agree' }),
        createQuizChoice({ label: 'Strongly Agree' })
      ]
      onUpdate({
        ...question,
        type: newType,
        choices,
        correctId: ''
      })
    } else {
      // multiple-choice: keep existing choices or create defaults
      if (question.choices.length === 0 || question.type === 'short-answer') {
        const a = createQuizChoice({ label: 'Option A', isCorrect: true })
        const b = createQuizChoice({ label: 'Option B' })
        onUpdate({
          ...question,
          type: newType,
          choices: [a, b],
          correctId: a.id
        })
      } else {
        onUpdate({ ...question, type: newType })
      }
    }
  }

  const questionLabel = `Question ${index + 1}`
  const hasPrompt = question.prompt.trim().length > 0

  return (
    <div
      className="border border-[var(--border-default)] rounded-lg overflow-hidden bg-[var(--bg-surface)]"
      role="region"
      aria-label={questionLabel}
    >
      {/* Question header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <button
          className="p-0.5 rounded cursor-grab text-[var(--text-tertiary)] hover:text-[var(--text-primary)] active:cursor-grabbing"
          aria-label="Drag to reorder question"
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 flex items-center gap-2 text-left cursor-pointer"
          aria-expanded={expanded}
          aria-controls={`question-body-${question.id}`}
        >
          <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] shrink-0">
            Q{index + 1}
          </span>
          <span className="text-sm text-[var(--text-primary)] truncate">
            {hasPrompt ? question.prompt : 'Untitled question'}
          </span>
          <span className="text-[10px] text-[var(--text-tertiary)] shrink-0 uppercase">
            {question.type.replace('-', '/')}
          </span>
          {expanded ? <ChevronUp size={14} className="ml-auto shrink-0 text-[var(--text-tertiary)]" /> : <ChevronDown size={14} className="ml-auto shrink-0 text-[var(--text-tertiary)]" />}
        </button>

        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move question up"
            title="Move up"
          >
            <ChevronUp size={13} />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Move question down"
            title="Move down"
          >
            <ChevronDown size={13} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded cursor-pointer text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
            aria-label="Delete question"
            title="Delete question"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Question body */}
      {expanded && (
        <div id={`question-body-${question.id}`} className="p-3 space-y-3">
          {/* Question type selector */}
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Question Type
            </label>
            <select
              value={question.type}
              onChange={(e) => changeType(e.target.value as QuizQuestion['type'])}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              aria-label="Question type"
            >
              <option value="multiple-choice">Multiple Choice</option>
              <option value="true-false">True / False</option>
              <option value="short-answer">Short Answer</option>
              <option value="likert">Likert Scale</option>
            </select>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Question Prompt
            </label>
            <textarea
              value={question.prompt}
              onChange={(e) => onUpdate({ ...question, prompt: e.target.value })}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
              placeholder="Enter your question..."
              aria-label="Question prompt"
            />
          </div>

          {/* Choices (not for short-answer) */}
          {question.type !== 'short-answer' && (
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1.5">
                {question.type === 'likert' ? 'Scale Options' : 'Answer Choices'}
                {question.type !== 'likert' && (
                  <span className="text-[var(--text-tertiary)] ml-1">(click circle to mark correct)</span>
                )}
              </label>
              <div className="space-y-1.5" role="group" aria-label="Answer choices">
                {question.choices.map((choice, ci) => (
                  <div key={choice.id} className="flex items-center gap-2">
                    {/* Correct answer indicator (not for likert) */}
                    {question.type !== 'likert' && (
                      <button
                        onClick={() => setCorrectAnswer(choice.id)}
                        className={`p-0.5 rounded-full cursor-pointer transition-colors ${
                          choice.isCorrect
                            ? 'text-emerald-600'
                            : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
                        }`}
                        aria-label={choice.isCorrect ? `${choice.label} is the correct answer` : `Mark ${choice.label || `choice ${ci + 1}`} as correct`}
                        aria-pressed={choice.isCorrect}
                        title={choice.isCorrect ? 'Correct answer' : 'Click to set as correct'}
                      >
                        {choice.isCorrect ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                      </button>
                    )}

                    {/* Choice label */}
                    <input
                      type="text"
                      value={choice.label}
                      onChange={(e) => updateChoice(choice.id, { label: e.target.value })}
                      disabled={question.type === 'true-false'}
                      className="flex-1 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder={`Choice ${ci + 1}`}
                      aria-label={`Choice ${ci + 1} label`}
                    />

                    {/* Remove choice (only for MC, min 2 choices) */}
                    {question.type === 'multiple-choice' && question.choices.length > 2 && (
                      <button
                        onClick={() => removeChoice(choice.id)}
                        className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                        aria-label={`Remove choice ${ci + 1}`}
                        title="Remove choice"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Add choice button (only for MC) */}
              {question.type === 'multiple-choice' && (
                <button
                  onClick={addChoice}
                  className="mt-2 flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors cursor-pointer"
                  aria-label="Add another choice"
                >
                  <Plus size={13} />
                  Add Choice
                </button>
              )}
            </div>
          )}

          {/* Short answer hint */}
          {question.type === 'short-answer' && (
            <div className="p-2 rounded-md bg-[var(--bg-muted)] text-xs text-[var(--text-tertiary)]">
              Short answer questions are graded manually or by keyword matching. Learners type a free-text response.
            </div>
          )}

          {/* Feedback section */}
          <div>
            <button
              onClick={() => setFeedbackOpen(!feedbackOpen)}
              className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              aria-expanded={feedbackOpen}
            >
              <MessageSquare size={13} />
              Feedback
              {feedbackOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {feedbackOpen && (
              <div className="mt-2 space-y-2">
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-emerald-600 mb-1">
                    Correct Answer Feedback
                  </label>
                  <textarea
                    value={question.feedbackCorrect}
                    onChange={(e) => onUpdate({ ...question, feedbackCorrect: e.target.value })}
                    rows={2}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                    placeholder="Great job! That's correct because..."
                    aria-label="Feedback for correct answer"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--color-danger-600)] mb-1">
                    Incorrect Answer Feedback
                  </label>
                  <textarea
                    value={question.feedbackIncorrect}
                    onChange={(e) => onUpdate({ ...question, feedbackIncorrect: e.target.value })}
                    rows={2}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                    placeholder="Not quite. The correct answer is..."
                    aria-label="Feedback for incorrect answer"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
