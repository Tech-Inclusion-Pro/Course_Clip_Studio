import { Plus, Presentation, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { useCourseStore } from '@/stores/useCourseStore'

export function PresentationLibraryView(): JSX.Element {
  const decks = usePresentationStore((s) => s.decks)
  const createNewDraft = usePresentationStore((s) => s.createNewDraft)
  const openDeck = usePresentationStore((s) => s.openDeck)
  const deleteDeck = usePresentationStore((s) => s.deleteDeck)
  const courses = useCourseStore((s) => s.courses)

  function getCourseName(courseId: string | null): string | null {
    if (!courseId) return null
    return courses.find((c) => c.id === courseId)?.meta.title ?? null
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">
            Presentations
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create AI-powered slide decks from prompts or notes
          </p>
        </div>
        <Button variant="primary" size="md" onClick={createNewDraft}>
          <Plus size={18} />
          New Presentation
        </Button>
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center">
            <Presentation size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            No presentations yet
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">
            Get started by creating your first AI-powered presentation. Enter a prompt or paste your notes to generate a slide deck.
          </p>
          <Button variant="primary" size="lg" onClick={createNewDraft}>
            <Plus size={18} />
            Create Your First Presentation
          </Button>
        </div>
      ) : (
        <div role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => {
            const courseName = getCourseName(deck.courseId)
            return (
              <div
                key={deck.id}
                role="listitem"
                className="group relative rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] p-4 hover:border-[var(--brand-magenta)] transition-colors cursor-pointer"
                onClick={() => openDeck(deck.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-8 h-5 rounded"
                    style={{ backgroundColor: deck.theme.accent }}
                    title={deck.theme.name}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDeck(deck.id)
                    }}
                    className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    aria-label={`Delete ${deck.title}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] truncate mb-1">
                  {deck.title || 'Untitled'}
                </h3>
                <p className="text-xs text-[var(--text-tertiary)]">
                  {deck.slides.length} slide{deck.slides.length !== 1 ? 's' : ''}
                </p>
                {courseName && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1 truncate">
                    Linked to: {courseName}
                  </p>
                )}
                <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
                  {new Date(deck.updatedAt).toLocaleDateString()}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
