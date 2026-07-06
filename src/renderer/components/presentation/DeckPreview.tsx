import { useState } from 'react'
import { Download, FileText, Link2, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { SlidePreviewCard } from './SlidePreviewCard'
import { AttachToCourseDialog } from './AttachToCourseDialog'
import { PresentModal } from './PresentModal'

export function DeckPreview(): JSX.Element {
  const deck = usePresentationStore((s) => s.activeDeck)
  const setStep = usePresentationStore((s) => s.setStep)
  const courses = useCourseStore((s) => s.courses)

  const [attachOpen, setAttachOpen] = useState(false)
  const [presenting, setPresenting] = useState(false)

  if (!deck) {
    return (
      <div className="text-center py-12 text-sm text-[var(--text-tertiary)]">
        No deck to preview. Go back to render your slides.
      </div>
    )
  }

  const linkedCourse = deck.courseId
    ? courses.find((c) => c.id === deck.courseId)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--text-primary)]">
            {deck.title}
          </h2>
          <p className="text-xs text-[var(--text-tertiary)]">
            {deck.slides.length} slides &middot; {deck.theme.name}
            {linkedCourse && ` &middot; Linked to ${linkedCourse.meta.title}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setPresenting(true)}>
            <Maximize2 size={14} />
            Full screen
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setAttachOpen(true)}>
            <Link2 size={14} />
            {deck.courseId ? 'Change Course' : 'Attach to Course'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setStep('render')}>
            Edit
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              const { exportDeckToPptx } = await import('@/lib/export/pptx-exporter')
              const { downloadBlob } = await import('@/lib/export/syllabus-docx')
              const blob = await exportDeckToPptx(deck)
              downloadBlob(blob, `${deck.title || 'presentation'}.pptx`)
            }}
          >
            <Download size={14} />
            PPTX
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={async () => {
              const { buildDeckPdf } = await import('@/lib/export/deck-pdf-renderer')
              const { downloadBlob } = await import('@/lib/export/syllabus-docx')
              const blob = await buildDeckPdf(deck)
              downloadBlob(blob, `${deck.title || 'presentation'}.pdf`)
            }}
          >
            <FileText size={14} />
            PDF
          </Button>
        </div>
      </div>

      {/* Slide grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {deck.slides.map((slide, index) => (
          <SlidePreviewCard
            key={slide.id}
            slide={slide}
            theme={deck.theme}
            index={index}
          />
        ))}
      </div>

      {/* Attach to Course dialog */}
      <AttachToCourseDialog
        open={attachOpen}
        onClose={() => setAttachOpen(false)}
        deckId={deck.id}
        currentCourseId={deck.courseId}
      />

      {/* Full-screen viewer */}
      {presenting && <PresentModal onClose={() => setPresenting(false)} />}
    </div>
  )
}
