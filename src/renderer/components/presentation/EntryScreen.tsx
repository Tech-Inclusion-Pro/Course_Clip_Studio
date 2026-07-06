import { useState } from 'react'
import { Sparkles, FileText, MessageSquare, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { promptModeOutlinePrompt, notesModeOutlinePrompt } from '@/lib/presentation/outline-prompts'
import { uid } from '@/lib/uid'
import type { SlideDraft, EntryMode, SlideFlag } from '@/types/presentation'

const DENSITY_OPTIONS = [
  { value: 'light' as const, label: 'Light', desc: '2-3 bullets per slide' },
  { value: 'medium' as const, label: 'Medium', desc: '3-5 bullets per slide' },
  { value: 'dense' as const, label: 'Dense', desc: '5-8 bullets per slide' }
]

export function EntryScreen(): JSX.Element {
  const { generate, isGenerating, isConfigured } = useAIGenerate()
  const draft = usePresentationStore((s) => s.activeDraft)
  const setDraftTitle = usePresentationStore((s) => s.setDraftTitle)
  const setEntryMode = usePresentationStore((s) => s.setEntryMode)
  const setPrompt = usePresentationStore((s) => s.setPrompt)
  const setIntake = usePresentationStore((s) => s.setIntake)
  const setSlides = usePresentationStore((s) => s.setSlides)
  const setStep = usePresentationStore((s) => s.setStep)
  const startGeneration = usePresentationStore((s) => s.startGeneration)
  const finishGeneration = usePresentationStore((s) => s.finishGeneration)
  const failGeneration = usePresentationStore((s) => s.failGeneration)
  const generationError = usePresentationStore((s) => s.generationError)

  const [parseError, setParseError] = useState<string | null>(null)

  if (!draft) return <></>

  async function handleGenerate() {
    if (!draft) return
    setParseError(null)
    startGeneration()

    const prompt = draft.entryMode === 'prompt'
      ? promptModeOutlinePrompt(draft.prompt, draft.intake)
      : notesModeOutlinePrompt(draft.prompt, draft.intake)

    const systemPrompt = 'You are an expert presentation designer. You create clear, professional slide outlines. Always respond with valid JSON only.'

    const result = await generate(prompt, systemPrompt)
    if (!result) {
      failGeneration('AI generation failed. Check your AI provider settings.')
      return
    }

    try {
      // Try to extract JSON from the response
      let jsonStr = result.trim()
      // Strip markdown fencing if present
      const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) jsonStr = fenceMatch[1].trim()

      const parsed = JSON.parse(jsonStr)
      if (!Array.isArray(parsed)) throw new Error('Expected a JSON array of slides')

      const slides: SlideDraft[] = parsed.map((item: Record<string, unknown>) => ({
        id: uid('slide'),
        title: String(item.title ?? ''),
        body: String(item.body ?? ''),
        speakerNotes: String(item.speakerNotes ?? ''),
        imagePrompt: String(item.imagePrompt ?? ''),
        layoutHint: item.layoutHint ?? 'bullets',
        flags: Array.isArray(item.flags) ? item.flags as SlideFlag[] : []
      }))

      // Auto-set title from first slide if not already set
      if (!draft.title && slides.length > 0 && slides[0].title) {
        setDraftTitle(slides[0].title)
      }

      setSlides(slides)
      finishGeneration()
      setStep('outline')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to parse AI response'
      setParseError(msg)
      failGeneration(`Could not parse slide outline: ${msg}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          Presentation Title (optional)
        </label>
        <input
          type="text"
          value={draft.title}
          onChange={(e) => setDraftTitle(e.target.value)}
          placeholder="My Presentation"
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      </div>

      {/* Mode toggle */}
      <div>
        <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
          Input Mode
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => setEntryMode('prompt')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-[var(--font-weight-medium)] cursor-pointer transition-colors ${
              draft.entryMode === 'prompt'
                ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <MessageSquare size={16} />
            Prompt
          </button>
          <button
            onClick={() => setEntryMode('notes')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-[var(--font-weight-medium)] cursor-pointer transition-colors ${
              draft.entryMode === 'notes'
                ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
          >
            <FileText size={16} />
            Paste Notes
          </button>
        </div>
      </div>

      {/* Intake bar */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Audience
          </label>
          <input
            type="text"
            value={draft.intake.audience}
            onChange={(e) => setIntake({ audience: e.target.value })}
            placeholder="e.g. students, families, staff"
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Slide Count
          </label>
          <input
            type="number"
            min={3}
            max={30}
            value={draft.intake.slideCount}
            onChange={(e) => setIntake({ slideCount: Math.max(3, Math.min(30, Number(e.target.value))) })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Density
          </label>
          <select
            value={draft.intake.density}
            onChange={(e) => setIntake({ density: e.target.value as 'light' | 'medium' | 'dense' })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            {DENSITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label} — {opt.desc}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bilingual toggle — shown when audience includes 'families' */}
      {draft.intake.audience.toLowerCase().includes('families') && (
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={draft.intake.language === 'es'}
              onChange={(e) => setIntake({ language: e.target.checked ? 'es' : undefined })}
              className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
            />
            <span className="text-sm text-[var(--text-secondary)]">Bilingual (English / Spanish)</span>
          </label>
        </div>
      )}

      {/* Text input */}
      <div>
        <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          {draft.entryMode === 'prompt' ? 'Describe your presentation topic' : 'Paste your notes'}
        </label>
        <textarea
          value={draft.prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={8}
          placeholder={
            draft.entryMode === 'prompt'
              ? 'e.g. A presentation about differentiated instruction strategies for elementary math classrooms...'
              : 'Paste your lecture notes, meeting notes, or any content you want to turn into slides...'
          }
          className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
        />
      </div>

      {/* Error display */}
      {(generationError || parseError) && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{generationError || parseError}</span>
        </div>
      )}

      {/* Generate button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="lg"
          onClick={handleGenerate}
          disabled={isGenerating || !draft.prompt.trim() || !isConfigured}
        >
          {isGenerating ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles size={18} />
              Generate Outline
            </>
          )}
        </Button>
      </div>

      {!isConfigured && (
        <p className="text-xs text-[var(--text-tertiary)] text-center">
          Configure an AI provider in Settings to generate presentations.
        </p>
      )}
    </div>
  )
}
