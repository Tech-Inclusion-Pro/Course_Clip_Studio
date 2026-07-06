/**
 * Full-window slide viewer for the preview step. Shows one slide large (good for a
 * bigger screen), navigates with on-screen buttons or arrow keys, and offers an
 * inline edit panel to tweak the current slide's title / body / notes without
 * leaving the view.
 */

import { useEffect, useState } from 'react'
import { X, ChevronLeft, ChevronRight, Pencil } from 'lucide-react'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { SlidePreviewCard } from './SlidePreviewCard'

export function PresentModal({ onClose }: { onClose: () => void }): JSX.Element | null {
  const deck = usePresentationStore((s) => s.activeDeck)
  const updateRenderedSlide = usePresentationStore((s) => s.updateRenderedSlide)
  const [index, setIndex] = useState(0)
  const [editing, setEditing] = useState(false)

  const count = deck?.slides.length ?? 0
  const go = (d: number) => setIndex((i) => Math.max(0, Math.min(count - 1, i + d)))

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight') go(1)
      else if (e.key === 'ArrowLeft') go(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count])

  if (!deck || count === 0) return null
  const slide = deck.slides[Math.min(index, count - 1)]
  const isData = slide.layoutHint === 'chart' || slide.layoutHint === 'table'

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Presentation viewer"
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 text-white/90">
        <span className="text-sm">
          {deck.title} — Slide {index + 1} of {count}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditing((e) => !e)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm cursor-pointer ${
              editing ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            <Pencil size={15} /> Edit
          </button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-white/10 cursor-pointer"
            aria-label="Close viewer"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Stage */}
      <div className="flex-1 flex items-center justify-center gap-4 px-4 pb-4 min-h-0">
        <button
          onClick={() => go(-1)}
          disabled={index === 0}
          className="shrink-0 p-2 rounded-full text-white/80 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          aria-label="Previous slide"
        >
          <ChevronLeft size={32} />
        </button>

        <div className="flex-1 max-w-[min(90vw,1400px)]">
          <SlidePreviewCard slide={slide} theme={deck.theme} index={index} />
        </div>

        {editing && (
          <div className="shrink-0 w-[320px] max-h-full overflow-y-auto bg-[var(--bg-surface)] rounded-lg p-4 space-y-3">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
              Edit slide {index + 1}
            </p>
            <div>
              <label className="block text-[10px] text-[var(--text-tertiary)] mb-1">Title</label>
              <input
                type="text"
                value={slide.title}
                onChange={(e) => updateRenderedSlide(slide.id, { title: e.target.value })}
                className="w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
              />
            </div>
            {isData ? (
              <p className="text-[10px] text-[var(--text-tertiary)]">
                Edit chart/table data back in the outline step.
              </p>
            ) : (
              <div>
                <label className="block text-[10px] text-[var(--text-tertiary)] mb-1">Body (Markdown)</label>
                <textarea
                  value={slide.body}
                  onChange={(e) => updateRenderedSlide(slide.id, { body: e.target.value })}
                  rows={6}
                  className="w-full px-2 py-1.5 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-y"
                />
              </div>
            )}
            <div>
              <label className="block text-[10px] text-[var(--text-tertiary)] mb-1">Speaker notes</label>
              <textarea
                value={slide.speakerNotes}
                onChange={(e) => updateRenderedSlide(slide.id, { speakerNotes: e.target.value })}
                rows={3}
                className="w-full px-2 py-1.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] resize-y"
              />
            </div>
          </div>
        )}

        <button
          onClick={() => go(1)}
          disabled={index === count - 1}
          className="shrink-0 p-2 rounded-full text-white/80 hover:bg-white/10 disabled:opacity-30 cursor-pointer"
          aria-label="Next slide"
        >
          <ChevronRight size={32} />
        </button>
      </div>

      {/* Filmstrip */}
      <div className="flex items-center gap-1 px-4 pb-3 overflow-x-auto">
        {deck.slides.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            className={`shrink-0 w-2.5 h-2.5 rounded-full cursor-pointer ${
              i === index ? 'bg-white' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
