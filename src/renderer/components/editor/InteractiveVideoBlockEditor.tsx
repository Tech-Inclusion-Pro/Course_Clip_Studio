import { Plus, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { uid } from '@/lib/uid'
import { createQuizQuestion } from '@/lib/block-factories'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { useFerpaCheck } from '@/hooks/useFerpaCheck'
import { transcriptPrompt } from '@/lib/ai/prompts'
import { AIGenerateButton } from '@/components/ui/AIGenerateButton'
import { FerpaWarningModal } from '@/components/ui/FerpaWarningModal'
import type { InteractiveVideoBlock, VideoTimedQuestion } from '@/types/course'

interface InteractiveVideoBlockEditorProps {
  block: InteractiveVideoBlock
  onUpdate: (partial: Partial<InteractiveVideoBlock>) => void
}

function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function InteractiveVideoBlockEditor({ block, onUpdate }: InteractiveVideoBlockEditorProps): JSX.Element {
  const { generate, isGenerating, isConfigured } = useAIGenerate()

  const doAITranscript = useCallback(async () => {
    const context = block.url ? `Video source: ${block.url}` : 'interactive video'
    const text = await generate(transcriptPrompt(context))
    if (text) onUpdate({ transcript: text.trim() })
  }, [block.url, generate, onUpdate])

  const ferpa = useFerpaCheck('interactive-video-ai', doAITranscript)

  function handleAITranscript() {
    if (!ferpa.checkFerpa()) return
    doAITranscript()
  }

  async function handleVideoUpload() {
    try {
      const result = await (window as any).electronAPI.showOpenDialog({
        filters: [{ name: 'Video', extensions: ['mp4', 'webm', 'mov'] }],
        properties: ['openFile']
      })
      if (!result || result.canceled || !result.filePaths?.length) return
      onUpdate({ url: result.filePaths[0] })
    } catch { /* dialog canceled */ }
  }

  function addQuestion() {
    const q: VideoTimedQuestion = {
      id: uid('vtq'),
      timestamp: 0,
      question: createQuizQuestion('multiple-choice')
    }
    onUpdate({ questions: [...block.questions, q] })
  }

  function updateQuestion(index: number, partial: Partial<VideoTimedQuestion>) {
    const questions = block.questions.map((q, i) => (i === index ? { ...q, ...partial } : q))
    onUpdate({ questions })
  }

  function removeQuestion(index: number) {
    onUpdate({ questions: block.questions.filter((_, i) => i !== index) })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Interactive video block editor">
      {/* Video source */}
      <div className="p-3 space-y-3">
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Video Source</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={block.url}
              onChange={(e) => onUpdate({ url: e.target.value })}
              className="flex-1 px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Video URL or embed link..."
            />
            <button
              onClick={handleVideoUpload}
              className="px-3 py-1 text-xs font-[var(--font-weight-medium)] rounded border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              Upload
            </button>
          </div>
        </div>

        {/* Pause behavior */}
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          On question:
          <select
            value={block.pauseBehavior}
            onChange={(e) => onUpdate({ pauseBehavior: e.target.value as InteractiveVideoBlock['pauseBehavior'] })}
            className="px-1.5 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            <option value="pause">Pause video</option>
            <option value="overlay">Show overlay</option>
            <option value="none">No pause</option>
          </select>
        </label>

        {/* Transcript */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Transcript</p>
            {isConfigured && (
              <AIGenerateButton
                label="Generate"
                onClick={handleAITranscript}
                isGenerating={isGenerating}
                size="xs"
                title="Generate transcript with AI"
              />
            )}
          </div>
          <textarea
            value={block.transcript}
            onChange={(e) => onUpdate({ transcript: e.target.value })}
            rows={2}
            className="w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            placeholder="Video transcript..."
          />
          {!block.transcript && (
            <p className="text-xs text-[var(--color-danger-600)] mt-0.5">Transcript required for accessibility</p>
          )}
        </div>

        {/* Timed questions */}
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
            Timed Questions ({block.questions.length})
          </p>
          <div className="space-y-2">
            {block.questions.map((tq, i) => (
              <div key={tq.id} className="p-2 rounded border border-[var(--border-default)] bg-[var(--bg-muted)]">
                <div className="flex items-center gap-2 mb-2">
                  <label className="text-xs text-[var(--text-secondary)]">
                    @
                    <input
                      type="number"
                      value={tq.timestamp}
                      onChange={(e) => updateQuestion(i, { timestamp: parseFloat(e.target.value) || 0 })}
                      min={0}
                      step={1}
                      className="w-16 ml-1 px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                    <span className="ml-1 text-[var(--text-tertiary)]">s ({formatTimestamp(tq.timestamp)})</span>
                  </label>
                  <button onClick={() => removeQuestion(i)} className="ml-auto p-0.5 text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>
                <input
                  type="text"
                  value={tq.question.prompt}
                  onChange={(e) => {
                    const question = { ...tq.question, prompt: e.target.value }
                    updateQuestion(i, { question })
                  }}
                  className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  placeholder="Question prompt..."
                />
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1">{tq.question.type} · {tq.question.choices.length} choices</p>
              </div>
            ))}
          </div>
          <button
            onClick={addQuestion}
            className="flex items-center gap-1 mt-2 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] rounded-md cursor-pointer"
          >
            <Plus size={12} /> Add Timed Question
          </button>
        </div>
      </div>

      <FerpaWarningModal
        open={ferpa.showModal}
        provider={ferpa.cloudProvider}
        featureLabel="AI Transcript Generation"
        onAcknowledge={ferpa.acknowledge}
        onCancel={ferpa.cancel}
      />
    </div>
  )
}
