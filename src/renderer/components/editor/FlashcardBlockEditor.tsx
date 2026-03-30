import { useState } from 'react'
import { Plus, Trash2, FlipVertical, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import type { FlashcardBlock } from '@/types/course'

interface FlashcardBlockEditorProps {
  block: FlashcardBlock
  onUpdate: (partial: Partial<FlashcardBlock>) => void
}

export function FlashcardBlockEditor({ block, onUpdate }: FlashcardBlockEditorProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)

  function addCard() {
    onUpdate({ cards: [...block.cards, { front: '', back: '' }] })
    setCurrentIndex(block.cards.length)
    setFlipped(false)
  }

  function updateCard(index: number, partial: Partial<{ front: string; back: string }>) {
    const updated = block.cards.map((card, i) => (i === index ? { ...card, ...partial } : card))
    onUpdate({ cards: updated })
  }

  function removeCard(index: number) {
    if (block.cards.length <= 1) return
    const updated = block.cards.filter((_, i) => i !== index)
    onUpdate({ cards: updated })
    if (currentIndex >= updated.length) setCurrentIndex(Math.max(0, updated.length - 1))
    setFlipped(false)
  }

  function goNext() {
    if (currentIndex < block.cards.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setFlipped(false)
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setFlipped(false)
    }
  }

  const card = block.cards[currentIndex]

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Flashcard block editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <FlipVertical size={16} className="text-[var(--brand-magenta)]" />
          <div>
            <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Flashcards</h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              Card {currentIndex + 1} of {block.cards.length}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {block.cards.length > 1 && (
            <button
              onClick={() => removeCard(currentIndex)}
              className="p-1.5 rounded text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
              aria-label="Remove current card"
              title="Remove card"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={addCard}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            aria-label="Add flashcard"
          >
            <Plus size={12} /> Add Card
          </button>
        </div>
      </div>

      {/* Card preview with flip */}
      {card && (
        <div className="p-4">
          <div
            className="relative min-h-[120px] rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] p-4 cursor-pointer select-none"
            onClick={() => setFlipped(!flipped)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFlipped(!flipped) } }}
            tabIndex={0}
            role="button"
            aria-label={flipped ? 'Showing back. Press to flip to front.' : 'Showing front. Press to flip to back.'}
          >
            <div className="flex items-center justify-between mb-2">
              <span className={`text-[10px] uppercase tracking-wider font-[var(--font-weight-semibold)] px-1.5 py-0.5 rounded ${
                flipped
                  ? 'bg-[var(--brand-magenta)]/10 text-[var(--brand-magenta)]'
                  : 'bg-[var(--brand-indigo)]/10 text-[var(--brand-indigo)]'
              }`}>
                {flipped ? 'Back' : 'Front'}
              </span>
              <RotateCcw size={12} className="text-[var(--text-tertiary)]" />
            </div>
            <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap">
              {flipped
                ? (card.back || <span className="text-[var(--text-tertiary)] italic">Empty back...</span>)
                : (card.front || <span className="text-[var(--text-tertiary)] italic">Empty front...</span>)
              }
            </p>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-3 mt-3">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              aria-label="Previous card"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-[var(--text-tertiary)]">
              {currentIndex + 1} / {block.cards.length}
            </span>
            <button
              onClick={goNext}
              disabled={currentIndex >= block.cards.length - 1}
              className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              aria-label="Next card"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Edit fields */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Front
              </label>
              <textarea
                value={card.front}
                onChange={(e) => updateCard(currentIndex, { front: e.target.value })}
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                placeholder="Question or term..."
              />
            </div>
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Back
              </label>
              <textarea
                value={card.back}
                onChange={(e) => updateCard(currentIndex, { back: e.target.value })}
                rows={2}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                placeholder="Answer or definition..."
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
