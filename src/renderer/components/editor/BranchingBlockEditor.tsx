import { Plus, Trash2, GitBranch } from 'lucide-react'
import { uid } from '@/lib/uid'
import { useCourseStore } from '@/stores/useCourseStore'
import { getAllLessons } from '@/lib/course-helpers'
import type { BranchingBlock, BranchChoice } from '@/types/course'

interface BranchingBlockEditorProps {
  block: BranchingBlock
  onUpdate: (partial: Partial<BranchingBlock>) => void
}

export function BranchingBlockEditor({ block, onUpdate }: BranchingBlockEditorProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const lessons = course ? getAllLessons(course) : []

  function addChoice() {
    if (block.choices.length >= 4) return
    const choice: BranchChoice = {
      id: uid('branch'),
      label: '',
      consequence: '',
      nextLessonId: null
    }
    onUpdate({ choices: [...block.choices, choice] })
  }

  function updateChoice(choiceId: string, partial: Partial<BranchChoice>) {
    onUpdate({
      choices: block.choices.map((c) => (c.id === choiceId ? { ...c, ...partial } : c))
    })
  }

  function removeChoice(choiceId: string) {
    onUpdate({ choices: block.choices.filter((c) => c.id !== choiceId) })
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
              {block.choices.length} choice{block.choices.length !== 1 ? 's' : ''} (max 4)
            </p>
          </div>
        </div>
        {block.choices.length < 4 && (
          <button
            onClick={addChoice}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            aria-label="Add choice"
          >
            <Plus size={12} /> Add Choice
          </button>
        )}
      </div>

      <div className="p-4 space-y-4">
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

        {/* Choices */}
        {block.choices.length === 0 ? (
          <div className="flex flex-col items-center py-6 text-center">
            <GitBranch size={24} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs text-[var(--text-tertiary)]">Add choices to create branching paths.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {block.choices.map((choice, idx) => (
              <div key={choice.id} className="p-3 rounded-lg bg-[var(--bg-muted)] border border-[var(--border-default)] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider">
                    Choice {idx + 1}
                  </span>
                  <button
                    onClick={() => removeChoice(choice.id)}
                    className="p-1 rounded text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
                    aria-label={`Remove choice ${idx + 1}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  value={choice.label}
                  onChange={(e) => updateChoice(choice.id, { label: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  placeholder="Choice label (what the learner sees)..."
                  aria-label={`Choice ${idx + 1} label`}
                />
                <textarea
                  value={choice.consequence}
                  onChange={(e) => updateChoice(choice.id, { consequence: e.target.value })}
                  rows={2}
                  className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                  placeholder="Consequence text (feedback shown after choosing)..."
                  aria-label={`Choice ${idx + 1} consequence`}
                />
                <div>
                  <label className="block text-[10px] font-[var(--font-weight-medium)] text-[var(--text-tertiary)] mb-0.5">
                    Navigate to Lesson
                  </label>
                  <select
                    value={choice.nextLessonId ?? ''}
                    onChange={(e) => updateChoice(choice.id, { nextLessonId: e.target.value || null })}
                    className="w-full px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    aria-label={`Next lesson for choice ${idx + 1}`}
                  >
                    <option value="">None (stay in current lesson)</option>
                    {lessons.map((l) => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
