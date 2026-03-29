import {
  Plus,
  HelpCircle,
  Settings2,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { useState } from 'react'
import { createQuizQuestion } from '@/lib/block-factories'
import { reorder } from '@/lib/course-helpers'
import { QuestionEditor } from './QuestionEditor'
import type { QuizBlock, QuizQuestion } from '@/types/course'

interface QuizBlockEditorProps {
  block: QuizBlock
  onUpdate: (partial: Partial<QuizBlock>) => void
}

export function QuizBlockEditor({ block, onUpdate }: QuizBlockEditorProps): JSX.Element {
  const [settingsOpen, setSettingsOpen] = useState(false)

  function handleAddQuestion(type: QuizQuestion['type'] = 'multiple-choice') {
    const newQ = createQuizQuestion(type)
    onUpdate({ questions: [...block.questions, newQ] })
  }

  function handleUpdateQuestion(questionId: string, updated: QuizQuestion) {
    onUpdate({
      questions: block.questions.map((q) => (q.id === questionId ? updated : q))
    })
  }

  function handleDeleteQuestion(questionId: string) {
    onUpdate({
      questions: block.questions.filter((q) => q.id !== questionId)
    })
  }

  function handleMoveQuestion(fromIndex: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    onUpdate({ questions: reorder(block.questions, fromIndex, toIndex) })
  }

  const totalQuestions = block.questions.length
  const questionsWithPrompt = block.questions.filter((q) => q.prompt.trim()).length

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Quiz block editor"
    >
      {/* Quiz header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <HelpCircle size={18} className="text-[var(--brand-magenta)]" />
          <div>
            <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              Quiz
            </h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
              {totalQuestions > 0 && ` (${questionsWithPrompt} with prompts)`}
            </p>
          </div>
        </div>

        <button
          onClick={() => setSettingsOpen(!settingsOpen)}
          className={`
            p-1.5 rounded-md cursor-pointer transition-colors
            ${settingsOpen
              ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
              : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            }
          `}
          aria-label="Quiz settings"
          aria-expanded={settingsOpen}
          title="Quiz settings"
        >
          <Settings2 size={16} />
        </button>
      </div>

      {/* Quiz settings panel */}
      {settingsOpen && (
        <div className="px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-muted)]/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Pass Threshold
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={block.passThreshold}
                  onChange={(e) => onUpdate({ passThreshold: Math.max(0, Math.min(100, Number(e.target.value))) })}
                  className="w-20 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  aria-label="Pass threshold percentage"
                />
                <span className="text-xs text-[var(--text-tertiary)]">%</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <ToggleOption
              label="Show Feedback"
              description="Display feedback after each question"
              checked={block.showFeedback}
              onChange={(v) => onUpdate({ showFeedback: v })}
            />
            <ToggleOption
              label="Allow Retry"
              description="Let learners retake the quiz"
              checked={block.allowRetry}
              onChange={(v) => onUpdate({ allowRetry: v })}
            />
            <ToggleOption
              label="Shuffle Questions"
              description="Randomize question order each attempt"
              checked={block.shuffleQuestions}
              onChange={(v) => onUpdate({ shuffleQuestions: v })}
            />
            <ToggleOption
              label="Shuffle Answers"
              description="Randomize choice order within questions"
              checked={block.shuffleAnswers}
              onChange={(v) => onUpdate({ shuffleAnswers: v })}
            />
          </div>
        </div>
      )}

      {/* Questions list */}
      <div className="p-4 space-y-3">
        {block.questions.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <HelpCircle size={32} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)] mb-1">
              No questions yet
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mb-4">
              Add your first question to get started.
            </p>
          </div>
        ) : (
          block.questions.map((question, idx) => (
            <QuestionEditor
              key={question.id}
              question={question}
              index={idx}
              onUpdate={(updated) => handleUpdateQuestion(question.id, updated)}
              onDelete={() => handleDeleteQuestion(question.id)}
              onMoveUp={() => handleMoveQuestion(idx, 'up')}
              onMoveDown={() => handleMoveQuestion(idx, 'down')}
              isFirst={idx === 0}
              isLast={idx === block.questions.length - 1}
            />
          ))
        )}

        {/* Add question buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-default)]">
          <span className="text-xs text-[var(--text-tertiary)] mr-1">Add:</span>
          <AddQuestionButton label="Multiple Choice" onClick={() => handleAddQuestion('multiple-choice')} />
          <AddQuestionButton label="True / False" onClick={() => handleAddQuestion('true-false')} />
          <AddQuestionButton label="Short Answer" onClick={() => handleAddQuestion('short-answer')} />
          <AddQuestionButton label="Likert Scale" onClick={() => handleAddQuestion('likert')} />
        </div>
      </div>

      {/* Quiz summary footer */}
      {totalQuestions > 0 && (
        <div className="px-4 py-2 border-t border-[var(--border-default)] bg-[var(--bg-muted)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">
            Pass: {block.passThreshold}% | Retry: {block.allowRetry ? 'Yes' : 'No'} | Feedback: {block.showFeedback ? 'On' : 'Off'}
          </span>
          <span className="text-xs text-[var(--text-tertiary)]">
            {totalQuestions} question{totalQuestions !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Helper Components ───

function AddQuestionButton({ label, onClick }: { label: string; onClick: () => void }): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
      aria-label={`Add ${label} question`}
    >
      <Plus size={12} />
      {label}
    </button>
  )
}

function ToggleOption({
  label,
  description,
  checked,
  onChange
}: {
  label: string
  description: string
  checked: boolean
  onChange: (value: boolean) => void
}): JSX.Element {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
      />
      <div>
        <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">{label}</span>
        <p className="text-[10px] text-[var(--text-tertiary)]">{description}</p>
      </div>
    </label>
  )
}
