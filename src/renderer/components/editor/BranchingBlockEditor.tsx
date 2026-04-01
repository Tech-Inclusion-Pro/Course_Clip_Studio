import { useState } from 'react'
import { Plus, Trash2, GitBranch, ChevronDown, ChevronUp, Target } from 'lucide-react'
import { uid } from '@/lib/uid'
import { useCourseStore } from '@/stores/useCourseStore'
import type { BranchingBlock, BranchChoice, BranchCriteria } from '@/types/course'

interface BranchingBlockEditorProps {
  block: BranchingBlock
  onUpdate: (partial: Partial<BranchingBlock>) => void
}

export function BranchingBlockEditor({ block, onUpdate }: BranchingBlockEditorProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const modules = course?.modules ?? []
  const [expandedChoiceId, setExpandedChoiceId] = useState<string | null>(null)

  const mode = block.mode ?? 'user-choice'

  function addChoice() {
    if (block.choices.length >= 6) return
    const choice: BranchChoice = {
      id: uid('branch'),
      label: '',
      consequence: '',
      nextLessonId: null,
      criteria: mode === 'criteria-based' ? { type: 'quiz-score', operator: 'gte', value: 70 } : null
    }
    onUpdate({ choices: [...block.choices, choice] })
    setExpandedChoiceId(choice.id)
  }

  function updateChoice(choiceId: string, partial: Partial<BranchChoice>) {
    onUpdate({
      choices: block.choices.map((c) => (c.id === choiceId ? { ...c, ...partial } : c))
    })
  }

  function removeChoice(choiceId: string) {
    onUpdate({ choices: block.choices.filter((c) => c.id !== choiceId) })
    if (expandedChoiceId === choiceId) setExpandedChoiceId(null)
  }

  function updateCriteria(choiceId: string, partial: Partial<BranchCriteria>) {
    const choice = block.choices.find((c) => c.id === choiceId)
    if (!choice) return
    const current: BranchCriteria = choice.criteria ?? { type: 'quiz-score', operator: 'gte', value: 70 }
    updateChoice(choiceId, { criteria: { ...current, ...partial } })
  }

  function toggleMode() {
    const newMode = mode === 'user-choice' ? 'criteria-based' : 'user-choice'
    // When switching to criteria-based, add default criteria to all choices
    if (newMode === 'criteria-based') {
      const updatedChoices = block.choices.map((c) => ({
        ...c,
        criteria: c.criteria ?? { type: 'quiz-score' as const, operator: 'gte' as const, value: 70 }
      }))
      onUpdate({ mode: newMode, choices: updatedChoices })
    } else {
      onUpdate({ mode: newMode })
    }
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Branching scenario block editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <GitBranch size={16} className="text-[var(--brand-magenta)]" />
          <div>
            <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Branching Scenario</h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {block.choices.length} branch{block.choices.length !== 1 ? 'es' : ''} · {mode === 'criteria-based' ? 'Criteria-based' : 'User choice'}
            </p>
          </div>
        </div>
        {block.choices.length < 6 && (
          <button
            onClick={addChoice}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            aria-label="Add branch"
          >
            <Plus size={12} /> Add Branch
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Mode toggle */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-muted)] border border-[var(--border-default)]">
          <div>
            <div className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Branching Mode</div>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {mode === 'user-choice'
                ? 'Learner clicks a choice to navigate'
                : 'System routes based on criteria (quiz score, completion, time)'}
            </p>
          </div>
          <button
            onClick={toggleMode}
            role="switch"
            aria-checked={mode === 'criteria-based'}
            className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
              mode === 'criteria-based'
                ? 'bg-[var(--brand-magenta)]'
                : 'bg-[var(--border-default)]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                mode === 'criteria-based' ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {/* Scenario text */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Scenario
          </label>
          <textarea
            value={block.scenario}
            onChange={(e) => onUpdate({ scenario: e.target.value })}
            rows={3}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            placeholder="Describe the scenario the learner faces..."
          />
        </div>

        {/* Choices / Branches */}
        {block.choices.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <GitBranch size={24} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs text-[var(--text-tertiary)]">Add branches to create paths.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {block.choices.map((choice, idx) => {
              const isExpanded = expandedChoiceId === choice.id

              return (
                <div key={choice.id} className="rounded-lg bg-[var(--bg-muted)] border border-[var(--border-default)]">
                  {/* Choice header */}
                  <div
                    className="flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-[var(--bg-hover)] rounded-t-lg"
                    onClick={() => setExpandedChoiceId(isExpanded ? null : choice.id)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider shrink-0">
                        {mode === 'criteria-based' ? 'Branch' : 'Choice'} {idx + 1}
                      </span>
                      {choice.label && (
                        <span className="text-xs text-[var(--text-primary)] truncate">
                          — {choice.label}
                        </span>
                      )}
                      {choice.nextLessonId && (
                        <Target size={10} className="text-[var(--brand-magenta)] shrink-0" title="Has destination" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => { e.stopPropagation(); removeChoice(choice.id) }}
                        className="p-1 rounded text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
                        aria-label={`Remove branch ${idx + 1}`}
                      >
                        <Trash2 size={12} />
                      </button>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="px-3 pb-3 space-y-2 border-t border-[var(--border-default)]">
                      <div className="pt-2">
                        <label className="block text-[10px] font-[var(--font-weight-medium)] text-[var(--text-tertiary)] mb-0.5">
                          {mode === 'criteria-based' ? 'Branch Label' : 'Choice Label'}
                        </label>
                        <input
                          type="text"
                          value={choice.label}
                          onChange={(e) => updateChoice(choice.id, { label: e.target.value })}
                          className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                          placeholder={mode === 'criteria-based' ? 'e.g. High performer path' : 'What the learner sees...'}
                          aria-label={`Choice ${idx + 1} label`}
                        />
                      </div>

                      {/* Criteria (criteria-based mode) */}
                      {mode === 'criteria-based' && (
                        <div className="p-2.5 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] space-y-2">
                          <p className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
                            Criteria
                          </p>
                          <div className="flex gap-1.5">
                            <select
                              value={choice.criteria?.type ?? 'quiz-score'}
                              onChange={(e) => updateCriteria(choice.id, { type: e.target.value as BranchCriteria['type'] })}
                              className="flex-1 px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                            >
                              <option value="quiz-score">Quiz Score</option>
                              <option value="lesson-completed">Lesson Completed</option>
                              <option value="time-spent">Time Spent (sec)</option>
                            </select>
                            <select
                              value={choice.criteria?.operator ?? 'gte'}
                              onChange={(e) => updateCriteria(choice.id, { operator: e.target.value as BranchCriteria['operator'] })}
                              className="w-16 px-1 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                            >
                              <option value="gte">&ge;</option>
                              <option value="lte">&le;</option>
                              <option value="eq">=</option>
                            </select>
                            <input
                              type="number"
                              value={choice.criteria?.value ?? 70}
                              onChange={(e) => updateCriteria(choice.id, { value: parseInt(e.target.value) || 0 })}
                              className="w-16 px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                            />
                          </div>
                          {choice.criteria?.type === 'lesson-completed' && (
                            <select
                              value={choice.criteria?.lessonId ?? ''}
                              onChange={(e) => updateCriteria(choice.id, { lessonId: e.target.value || undefined })}
                              className="w-full px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                            >
                              <option value="">Select a lesson...</option>
                              {modules.map((m) => (
                                <optgroup key={m.id} label={m.title}>
                                  {m.lessons.map((l) => (
                                    <option key={l.id} value={l.id}>{l.title}</option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          )}
                          <p className="text-[9px] text-[var(--text-tertiary)]">
                            {choice.criteria?.type === 'quiz-score' && 'Learner routes here if their quiz score meets this threshold.'}
                            {choice.criteria?.type === 'lesson-completed' && 'Learner routes here if the selected lesson is completed.'}
                            {choice.criteria?.type === 'time-spent' && 'Learner routes here based on time spent on the current lesson.'}
                          </p>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-[var(--font-weight-medium)] text-[var(--text-tertiary)] mb-0.5">
                          Consequence / Feedback
                        </label>
                        <textarea
                          value={choice.consequence}
                          onChange={(e) => updateChoice(choice.id, { consequence: e.target.value })}
                          rows={2}
                          className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                          placeholder="Feedback shown after this branch is taken..."
                          aria-label={`Choice ${idx + 1} consequence`}
                        />
                      </div>

                      {/* Action */}
                      <div>
                        <label className="block text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] mb-0.5">
                          Action
                        </label>
                        <select
                          value={choice.action ?? 'navigate'}
                          onChange={(e) => updateChoice(choice.id, { action: e.target.value as 'navigate' | 'restart' })}
                          className="w-full px-2 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        >
                          <option value="navigate">Navigate to lesson</option>
                          <option value="restart">Restart &amp; wipe progress</option>
                        </select>
                      </div>

                      {/* Destination — grouped by module (only for navigate action) */}
                      {(choice.action ?? 'navigate') === 'navigate' && (
                        <div>
                          <label className="block text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] mb-0.5">
                            Navigate to
                          </label>
                          <select
                            value={choice.nextLessonId ?? ''}
                            onChange={(e) => updateChoice(choice.id, { nextLessonId: e.target.value || null })}
                            className="w-full px-2 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                            aria-label={`Destination for branch ${idx + 1}`}
                          >
                            <option value="">Stay in current lesson</option>
                            {modules.map((m) => (
                              <optgroup key={m.id} label={m.title}>
                                {m.lessons.map((l) => (
                                  <option key={l.id} value={l.id}>{l.title}</option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                          <p className="text-[9px] text-[var(--text-tertiary)] mt-0.5">
                            Where the learner navigates after selecting this branch.
                          </p>
                        </div>
                      )}
                      {(choice.action ?? 'navigate') === 'restart' && (
                        <p className="text-[10px] text-[var(--color-danger-600)] bg-[var(--color-danger-100,#fee2e2)] px-2 py-1.5 rounded">
                          This will wipe the learner&apos;s progress and restart the course from the beginning.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
