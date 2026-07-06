import { useState, useRef } from 'react'
import { GripVertical, Trash2, Scissors, ChevronsDown, ChevronDown, ChevronUp, Flag, Wand2, Loader2, Copy, Bold, Italic, List } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { emptyChart, emptyTable } from '@/lib/presentation/chart-data'
import { refineSlidePrompt, type RefineAction } from '@/lib/presentation/outline-prompts'
import type { SlideDraft } from '@/types/presentation'
import { LayoutPicker } from './LayoutPicker'
import { ChartTableEditor } from './ChartTableEditor'

interface SlideDraftCardProps {
  slide: SlideDraft
  index: number
  isLast: boolean
}

const REFINE_ACTIONS: { value: RefineAction; label: string }[] = [
  { value: 'rewrite', label: 'Rewrite' },
  { value: 'expand', label: 'Expand' },
  { value: 'shorten', label: 'Shorten' },
  { value: 'formal', label: 'More formal' },
  { value: 'simplify', label: 'Simplify language' }
]

export function SlideDraftCard({ slide, index, isLast }: SlideDraftCardProps): JSX.Element {
  const updateSlide = usePresentationStore((s) => s.updateSlide)
  const removeSlide = usePresentationStore((s) => s.removeSlide)
  const splitSlide = usePresentationStore((s) => s.splitSlide)
  const mergeSlides = usePresentationStore((s) => s.mergeSlides)
  const duplicateSlide = usePresentationStore((s) => s.duplicateSlide)
  const { generate } = useAIGenerate()

  const [notesOpen, setNotesOpen] = useState(false)
  const [refining, setRefining] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  // Wrap the current textarea selection with Markdown markers (bold/italic) or
  // prefix the line with a bullet.
  function applyFormat(kind: 'bold' | 'italic' | 'bullet') {
    const el = bodyRef.current
    if (!el) return
    const { selectionStart: a, selectionEnd: b, value } = el
    if (kind === 'bullet') {
      const lineStart = value.lastIndexOf('\n', a - 1) + 1
      const next = `${value.slice(0, lineStart)}- ${value.slice(lineStart)}`
      updateSlide(slide.id, { body: next })
      return
    }
    const marker = kind === 'bold' ? '**' : '*'
    const selected = value.slice(a, b) || (kind === 'bold' ? 'bold text' : 'italic text')
    const next = `${value.slice(0, a)}${marker}${selected}${marker}${value.slice(b)}`
    updateSlide(slide.id, { body: next })
  }

  async function handleRefine(action: RefineAction) {
    setMenuOpen(false)
    setRefining(true)
    try {
      const slides = usePresentationStore.getState().activeDraft?.slides ?? []
      const i = slides.findIndex((s) => s.id === slide.id)
      const neighbors = [slides[i - 1]?.title, slides[i + 1]?.title].filter(Boolean) as string[]
      const prompt = refineSlidePrompt(slide, action, neighbors)
      const result = await generate(
        prompt,
        'You are an expert presentation designer. Respond with a single valid JSON object only.'
      )
      if (!result) return
      let jsonStr = result.trim()
      const fence = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (fence) jsonStr = fence[1].trim()
      const obj = JSON.parse(jsonStr) as Record<string, unknown>
      updateSlide(slide.id, {
        title: String(obj.title ?? slide.title),
        body: String(obj.body ?? slide.body),
        speakerNotes: String(obj.speakerNotes ?? slide.speakerNotes),
        imagePrompt: String(obj.imagePrompt ?? slide.imagePrompt),
        layoutHint: (obj.layoutHint as SlideDraft['layoutHint']) ?? slide.layoutHint
      })
    } catch {
      // Ignore parse failures — leave the slide unchanged.
    } finally {
      setRefining(false)
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: slide.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 mb-3"
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>

        <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-tertiary)] w-6">
          {index + 1}
        </span>

        {/* Title */}
        <input
          type="text"
          value={slide.title}
          onChange={(e) => updateSlide(slide.id, { title: e.target.value })}
          placeholder="Slide title"
          className="flex-1 px-2 py-1 text-sm font-[var(--font-weight-semibold)] rounded border border-transparent hover:border-[var(--border-default)] focus:border-[var(--ring-brand)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
        />

        {/* Layout hint */}
        <LayoutPicker
          currentLayout={slide.layoutHint}
          onSelect={(layout) => {
            const patch: Partial<SlideDraft> = { layoutHint: layout }
            if (layout === 'chart' && !slide.chart) patch.chart = emptyChart()
            if (layout === 'table' && !slide.table) patch.table = emptyTable()
            updateSlide(slide.id, patch)
          }}
        />

        {/* Flags indicator */}
        {slide.flags.length > 0 && (
          <span
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-700"
            title={slide.flags.map((f) => `${f.kind}: ${f.detail}`).join('\n')}
          >
            <Flag size={10} />
            {slide.flags.length}
          </span>
        )}

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          {/* Refine with AI */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen((o) => !o)}
              disabled={refining}
              className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] cursor-pointer disabled:opacity-50"
              title="Refine this slide with AI"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              {refining ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            </button>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full mt-1 z-20 min-w-[140px] py-1 rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] shadow-[var(--shadow-lg)]"
              >
                {REFINE_ACTIONS.map((a) => (
                  <button
                    key={a.value}
                    role="menuitem"
                    onClick={() => handleRefine(a.value)}
                    className="block w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => duplicateSlide(slide.id)}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            title="Duplicate slide"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={() => splitSlide(slide.id)}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            title="Split slide"
            disabled={!slide.body.includes('\n')}
          >
            <Scissors size={14} />
          </button>
          {!isLast && (
            <button
              onClick={() => mergeSlides(slide.id)}
              className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
              title="Merge with next slide"
            >
              <ChevronsDown size={14} />
            </button>
          )}
          <button
            onClick={() => removeSlide(slide.id)}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--bg-hover)] cursor-pointer"
            title="Delete slide"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Body — or chart/table editor for data layouts */}
      {slide.layoutHint === 'chart' || slide.layoutHint === 'table' ? (
        <ChartTableEditor slide={slide} />
      ) : (
        <div className="mb-2">
          <div className="flex items-center gap-0.5 mb-1">
            {([
              { k: 'bold' as const, Icon: Bold, label: 'Bold' },
              { k: 'italic' as const, Icon: Italic, label: 'Italic' },
              { k: 'bullet' as const, Icon: List, label: 'Bullet' }
            ]).map(({ k, Icon, label }) => (
              <button
                key={k}
                type="button"
                onClick={() => applyFormat(k)}
                className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
                title={label}
                aria-label={label}
              >
                <Icon size={13} />
              </button>
            ))}
            <span className="text-[10px] text-[var(--text-tertiary)] ml-1">Markdown: **bold**, *italic*, - bullet</span>
          </div>
          <textarea
            ref={bodyRef}
            value={slide.body}
            onChange={(e) => updateSlide(slide.id, { body: e.target.value })}
            rows={3}
            placeholder="Slide content..."
            className="w-full px-2 py-1.5 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-y"
          />
        </div>
      )}

      {/* Image search term */}
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={slide.imagePrompt}
          onChange={(e) => updateSlide(slide.id, { imagePrompt: e.target.value })}
          placeholder="Image search term (e.g. classroom collaboration)"
          className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
        />
      </div>

      {/* Speaker notes toggle */}
      <button
        onClick={() => setNotesOpen(!notesOpen)}
        className="flex items-center gap-1 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer"
      >
        {notesOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        Speaker Notes
      </button>
      {notesOpen && (
        <textarea
          value={slide.speakerNotes}
          onChange={(e) => updateSlide(slide.id, { speakerNotes: e.target.value })}
          rows={2}
          placeholder="Notes for the presenter..."
          className="w-full mt-1 px-2 py-1.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-y"
        />
      )}
    </div>
  )
}
