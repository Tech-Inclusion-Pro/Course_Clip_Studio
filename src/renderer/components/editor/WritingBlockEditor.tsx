import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { uid } from '@/lib/uid'
import type { WritingBlock, WritingPromptSection } from '@/types/course'

interface WritingBlockEditorProps {
  block: WritingBlock
  onUpdate: (partial: Partial<WritingBlock>) => void
}

const VARIANTS: { value: WritingBlock['variant']; label: string }[] = [
  { value: 'essay', label: 'Essay' },
  { value: 'reflection', label: 'Reflection' },
  { value: 'journal', label: 'Journal' },
  { value: 'short-response', label: 'Short Response' }
]

export function WritingBlockEditor({ block, onUpdate }: WritingBlockEditorProps): JSX.Element {
  function addSection() {
    const section: WritingPromptSection = {
      id: uid('section'),
      label: `Section ${block.promptSections.length + 1}`,
      placeholder: 'Write here...',
      minWords: 0,
      maxWords: 0
    }
    onUpdate({ promptSections: [...block.promptSections, section] })
  }

  function updateSection(index: number, partial: Partial<WritingPromptSection>) {
    const sections = block.promptSections.map((s, i) => (i === index ? { ...s, ...partial } : s))
    onUpdate({ promptSections: sections })
  }

  function removeSection(index: number) {
    onUpdate({ promptSections: block.promptSections.filter((_, i) => i !== index) })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Writing block editor">
      {/* Variant selector */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        {VARIANTS.map((v) => (
          <button
            key={v.value}
            onClick={() => onUpdate({ variant: v.value })}
            className={`px-2 py-1 text-xs rounded cursor-pointer ${block.variant === v.value ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-[var(--font-weight-medium)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="p-3 space-y-3">
        {/* Instruction */}
        <label className="block text-xs text-[var(--text-secondary)]">
          Instruction
          <textarea
            value={block.instruction}
            onChange={(e) => onUpdate({ instruction: e.target.value })}
            rows={2}
            className="mt-1 w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            placeholder="Write your prompt/instructions for the learner..."
          />
        </label>

        {/* Prompt sections */}
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
            Response Sections ({block.promptSections.length})
          </p>
          <div className="space-y-2">
            {block.promptSections.map((section, i) => (
              <div key={section.id} className="p-2 rounded border border-[var(--border-default)] bg-[var(--bg-muted)]">
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={section.label}
                    onChange={(e) => updateSection(i, { label: e.target.value })}
                    className="flex-1 px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Section label"
                  />
                  <button onClick={() => removeSection(i)} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  value={section.placeholder}
                  onChange={(e) => updateSection(i, { placeholder: e.target.value })}
                  className="w-full px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-tertiary)] mb-1"
                  placeholder="Placeholder text..."
                />
                <div className="flex gap-2">
                  <label className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                    Min words:
                    <input
                      type="number"
                      value={section.minWords || 0}
                      onChange={(e) => updateSection(i, { minWords: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="w-12 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                  </label>
                  <label className="flex items-center gap-1 text-[10px] text-[var(--text-tertiary)]">
                    Max words:
                    <input
                      type="number"
                      value={section.maxWords || 0}
                      onChange={(e) => updateSection(i, { maxWords: parseInt(e.target.value) || 0 })}
                      min={0}
                      className="w-12 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={addSection}
            className="flex items-center gap-1 mt-2 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] rounded-md cursor-pointer"
          >
            <Plus size={12} /> Add Section
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={block.rubricEnabled} onChange={(e) => onUpdate({ rubricEnabled: e.target.checked })} className="rounded" />
            Enable rubric
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={block.aiScoringEnabled} onChange={(e) => onUpdate({ aiScoringEnabled: e.target.checked })} className="rounded" />
            Enable AI scoring (Phase 4)
          </label>
        </div>

        {/* FERPA warning */}
        {block.aiScoringEnabled && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle size={14} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              FERPA Notice: AI scoring sends learner responses to an external AI service. Ensure compliance with your institution&apos;s data policies.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
