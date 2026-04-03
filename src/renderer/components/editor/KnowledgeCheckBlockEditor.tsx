import { Plus, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { createQuizQuestion } from '@/lib/block-factories'
import { uid } from '@/lib/uid'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { useFerpaCheck } from '@/hooks/useFerpaCheck'
import { quizPrompt } from '@/lib/ai'
import { AIGenerateButton } from '@/components/ui/AIGenerateButton'
import { FerpaWarningModal } from '@/components/ui/FerpaWarningModal'
import type { KnowledgeCheckBlock, QuizQuestion } from '@/types/course'

interface KnowledgeCheckBlockEditorProps {
  block: KnowledgeCheckBlock
  onUpdate: (partial: Partial<KnowledgeCheckBlock>) => void
}

const PHASES: { value: KnowledgeCheckBlock['phase']; label: string; desc: string }[] = [
  { value: 'pre', label: 'Pre-Assessment', desc: 'Before the lesson' },
  { value: 'formative', label: 'Formative', desc: 'During the lesson' },
  { value: 'post', label: 'Post-Assessment', desc: 'After the lesson' }
]

export function KnowledgeCheckBlockEditor({ block, onUpdate }: KnowledgeCheckBlockEditorProps): JSX.Element {
  const { generate, isGenerating, isConfigured } = useAIGenerate()

  const doAIGenerate = useCallback(async () => {
    const objectives = block.objectives.filter(Boolean).join('; ')
    const prompt = quizPrompt(objectives || 'knowledge check review')
    const text = await generate(prompt)
    if (!text) return
    try {
      const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim())
      const questions: QuizQuestion[] = (parsed.questions ?? []).map((q: Record<string, unknown>) => {
        const base = createQuizQuestion((q.type as QuizQuestion['type']) || 'multiple-choice')
        return {
          ...base,
          prompt: (q.prompt as string) || '',
          choices: Array.isArray(q.choices) ? q.choices.map((c: Record<string, unknown>) => ({
            id: uid('choice'),
            label: (c.label as string) || '',
            isCorrect: !!c.isCorrect
          })) : base.choices,
          feedbackCorrect: (q.feedbackCorrect as string) || '',
          feedbackIncorrect: (q.feedbackIncorrect as string) || ''
        }
      })
      if (questions.length > 0) {
        onUpdate({ questions: [...block.questions, ...questions] })
      }
    } catch { /* ignore parse errors */ }
  }, [block.objectives, block.questions, generate, onUpdate])

  const ferpa = useFerpaCheck('knowledge-check-ai', doAIGenerate)

  function handleAIGenerate() {
    if (!ferpa.checkFerpa()) return
    doAIGenerate()
  }

  function addObjective() {
    onUpdate({ objectives: [...block.objectives, ''] })
  }

  function updateObjective(index: number, value: string) {
    const objectives = block.objectives.map((o, i) => (i === index ? value : o))
    onUpdate({ objectives })
  }

  function removeObjective(index: number) {
    onUpdate({ objectives: block.objectives.filter((_, i) => i !== index) })
  }

  function addQuestion() {
    const q = createQuizQuestion('multiple-choice')
    onUpdate({ questions: [...block.questions, q] })
  }

  function updateQuestion(index: number, partial: Partial<QuizQuestion>) {
    const questions = block.questions.map((q, i) => (i === index ? { ...q, ...partial } : q))
    onUpdate({ questions })
  }

  function removeQuestion(index: number) {
    onUpdate({ questions: block.questions.filter((_, i) => i !== index) })
  }

  function updateChoice(qIndex: number, cIndex: number, label: string) {
    const q = block.questions[qIndex]
    const choices = q.choices.map((c, i) => (i === cIndex ? { ...c, label } : c))
    updateQuestion(qIndex, { choices })
  }

  function setCorrectChoice(qIndex: number, choiceId: string) {
    const q = block.questions[qIndex]
    const choices = q.choices.map((c) => ({ ...c, isCorrect: c.id === choiceId }))
    updateQuestion(qIndex, { choices, correctId: choiceId })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Knowledge check block editor">
      {/* Phase selector */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        {PHASES.map((p) => (
          <button
            key={p.value}
            onClick={() => onUpdate({ phase: p.value })}
            className={`px-2 py-1 text-xs rounded cursor-pointer ${block.phase === p.value ? 'bg-[var(--bg-active)] text-[var(--text-primary)] font-[var(--font-weight-medium)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
            title={p.desc}
          >
            {p.label}
          </button>
        ))}
        <label className="ml-auto flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <input type="checkbox" checked={block.showProgressReport} onChange={(e) => onUpdate({ showProgressReport: e.target.checked })} className="rounded" />
          Show progress
        </label>
      </div>

      <div className="p-3 space-y-4">
        {/* Learning objectives */}
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Learning Objectives</p>
          <div className="space-y-1">
            {block.objectives.map((obj, i) => (
              <div key={i} className="flex items-center gap-1">
                <input
                  type="text"
                  value={obj}
                  onChange={(e) => updateObjective(i, e.target.value)}
                  className="flex-1 px-2 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  placeholder={`Objective ${i + 1}`}
                />
                <button onClick={() => removeObjective(i)} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer">
                  <Trash2 size={10} />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={addObjective}
            className="flex items-center gap-1 mt-1 text-[10px] text-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] px-2 py-0.5 rounded cursor-pointer"
          >
            <Plus size={10} /> Add Objective
          </button>
        </div>

        {/* Questions */}
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
            Questions ({block.questions.length})
          </p>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {block.questions.map((q, qi) => (
              <div key={q.id} className="p-2 rounded border border-[var(--border-default)] bg-[var(--bg-muted)]">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] text-[var(--text-tertiary)] font-mono">Q{qi + 1}</span>
                  <select
                    value={q.type}
                    onChange={(e) => {
                      const newQ = createQuizQuestion(e.target.value as QuizQuestion['type'], { id: q.id, prompt: q.prompt })
                      updateQuestion(qi, newQ)
                    }}
                    className="px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  >
                    <option value="multiple-choice">Multiple Choice</option>
                    <option value="true-false">True/False</option>
                    <option value="short-answer">Short Answer</option>
                  </select>
                  <button onClick={() => removeQuestion(qi)} className="ml-auto p-0.5 text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  value={q.prompt}
                  onChange={(e) => updateQuestion(qi, { prompt: e.target.value })}
                  className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] mb-1"
                  placeholder="Question prompt..."
                />
                {(q.type === 'multiple-choice' || q.type === 'true-false') && (
                  <div className="space-y-0.5 ml-2">
                    {q.choices.map((c, ci) => (
                      <div key={c.id} className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={`kc-${q.id}`}
                          checked={c.isCorrect}
                          onChange={() => setCorrectChoice(qi, c.id)}
                          className="shrink-0"
                        />
                        <input
                          type="text"
                          value={c.label}
                          onChange={(e) => updateChoice(qi, ci, e.target.value)}
                          className="flex-1 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={addQuestion}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] rounded-md cursor-pointer"
            >
              <Plus size={12} /> Add Question
            </button>
            {isConfigured && (
              <AIGenerateButton
                label="Generate Questions"
                onClick={handleAIGenerate}
                isGenerating={isGenerating}
                size="sm"
              />
            )}
          </div>
        </div>
      </div>

      <FerpaWarningModal
        open={ferpa.showModal}
        provider={ferpa.cloudProvider}
        featureLabel="AI Knowledge Check Generation"
        onAcknowledge={ferpa.acknowledge}
        onCancel={ferpa.cancel}
      />
    </div>
  )
}
