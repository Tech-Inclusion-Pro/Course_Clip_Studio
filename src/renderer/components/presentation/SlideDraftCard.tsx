import { useState } from 'react'
import { GripVertical, Trash2, Scissors, ChevronsDown, ChevronDown, ChevronUp, Flag } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { emptyChart, emptyTable } from '@/lib/presentation/chart-data'
import type { SlideDraft, LayoutHint } from '@/types/presentation'
import { LayoutPicker } from './LayoutPicker'
import { ChartTableEditor } from './ChartTableEditor'

interface SlideDraftCardProps {
  slide: SlideDraft
  index: number
  isLast: boolean
}

export function SlideDraftCard({ slide, index, isLast }: SlideDraftCardProps): JSX.Element {
  const updateSlide = usePresentationStore((s) => s.updateSlide)
  const removeSlide = usePresentationStore((s) => s.removeSlide)
  const splitSlide = usePresentationStore((s) => s.splitSlide)
  const mergeSlides = usePresentationStore((s) => s.mergeSlides)

  const [notesOpen, setNotesOpen] = useState(false)

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
        <textarea
          value={slide.body}
          onChange={(e) => updateSlide(slide.id, { body: e.target.value })}
          rows={3}
          placeholder="Slide content..."
          className="w-full px-2 py-1.5 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-y mb-2"
        />
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
