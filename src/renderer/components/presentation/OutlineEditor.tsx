import { Plus, Sparkles, Play, Loader2, Quote } from 'lucide-react'
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { Button } from '@/components/ui/Button'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { promptModeOutlinePrompt, notesModeOutlinePrompt } from '@/lib/presentation/outline-prompts'
import { uid } from '@/lib/uid'
import { collectCitations, hasReferencesSlide, buildReferencesSlide } from '@/lib/presentation/references'
import { SlideDraftCard } from './SlideDraftCard'
import { ImageStylePicker } from './ImageStylePicker'
import { ThemePicker } from './ThemePicker'
import type { SlideDraft, SlideFlag } from '@/types/presentation'

export function OutlineEditor(): JSX.Element {
  const draft = usePresentationStore((s) => s.activeDraft)
  const slides = draft?.slides ?? []
  const addSlide = usePresentationStore((s) => s.addSlide)
  const reorderSlides = usePresentationStore((s) => s.reorderSlides)
  const setSlides = usePresentationStore((s) => s.setSlides)
  const setStep = usePresentationStore((s) => s.setStep)
  const isGenerating = usePresentationStore((s) => s.isGenerating)
  const startGeneration = usePresentationStore((s) => s.startGeneration)
  const finishGeneration = usePresentationStore((s) => s.finishGeneration)
  const failGeneration = usePresentationStore((s) => s.failGeneration)
  const { generate } = useAIGenerate()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const fromIndex = slides.findIndex((s) => s.id === active.id)
    const toIndex = slides.findIndex((s) => s.id === over.id)
    if (fromIndex >= 0 && toIndex >= 0) {
      reorderSlides(fromIndex, toIndex)
    }
  }

  async function handleRegenerate() {
    if (!draft || !draft.prompt.trim()) return
    startGeneration()

    const prompt = draft.entryMode === 'prompt'
      ? promptModeOutlinePrompt(draft.prompt, draft.intake)
      : notesModeOutlinePrompt(draft.prompt, draft.intake)

    const systemPrompt = 'You are an expert presentation designer. You create clear, professional slide outlines. Always respond with valid JSON only.'

    const result = await generate(prompt, systemPrompt)
    if (!result) {
      failGeneration('Regeneration failed')
      return
    }

    try {
      let jsonStr = result.trim()
      const fenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fenceMatch) jsonStr = fenceMatch[1].trim()

      const parsed = JSON.parse(jsonStr)
      if (!Array.isArray(parsed)) throw new Error('Expected array')

      const newSlides: SlideDraft[] = parsed.map((item: Record<string, unknown>) => ({
        id: uid('slide'),
        title: String(item.title ?? ''),
        body: String(item.body ?? ''),
        speakerNotes: String(item.speakerNotes ?? ''),
        imagePrompt: String(item.imagePrompt ?? ''),
        layoutHint: (item.layoutHint as SlideDraft['layoutHint']) ?? 'bullets',
        flags: Array.isArray(item.flags) ? item.flags as SlideFlag[] : []
      }))

      setSlides(newSlides)
      finishGeneration()
    } catch {
      failGeneration('Failed to parse regenerated outline')
    }
  }

  const slideIds = slides.map((s) => s.id)
  const citations = collectCitations(slides)
  const canAddReferences = citations.length > 0 && !hasReferencesSlide(slides)

  function handleAddReferences() {
    setSlides([...slides, buildReferencesSlide(citations)])
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <ThemePicker />
          <ImageStylePicker />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => addSlide()}>
            <Plus size={14} />
            Add Slide
          </Button>
          {canAddReferences && (
            <Button variant="ghost" size="sm" onClick={handleAddReferences}>
              <Quote size={14} />
              Add References ({citations.length})
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={handleRegenerate} disabled={isGenerating || !draft?.prompt.trim()}>
            {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            Regenerate
          </Button>
          <Button variant="primary" size="sm" onClick={() => setStep('render')} disabled={slides.length === 0}>
            <Play size={14} />
            Render
          </Button>
        </div>
      </div>

      {/* Slide count */}
      <p className="text-xs text-[var(--text-tertiary)]">
        {slides.length} slide{slides.length !== 1 ? 's' : ''}
      </p>

      {/* Sortable slide list */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
          {slides.map((slide, index) => (
            <SlideDraftCard
              key={slide.id}
              slide={slide}
              index={index}
              isLast={index === slides.length - 1}
            />
          ))}
        </SortableContext>
      </DndContext>

      {slides.length === 0 && (
        <div className="text-center py-12 text-sm text-[var(--text-tertiary)]">
          No slides yet. Go back to generate an outline or add slides manually.
        </div>
      )}
    </div>
  )
}
