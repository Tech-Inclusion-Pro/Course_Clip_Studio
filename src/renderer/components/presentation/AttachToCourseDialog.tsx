import { X, Link2, Unlink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourseStore } from '@/stores/useCourseStore'
import { usePresentationStore } from '@/stores/usePresentationStore'

interface AttachToCourseDialogProps {
  open: boolean
  onClose: () => void
  deckId: string
  currentCourseId: string | null
}

export function AttachToCourseDialog({
  open,
  onClose,
  deckId,
  currentCourseId
}: AttachToCourseDialogProps): JSX.Element | null {
  const courses = useCourseStore((s) => s.courses)
  const attachCourse = usePresentationStore((s) => s.attachCourse)

  if (!open) return null

  function handleAttach(courseId: string) {
    attachCourse(deckId, courseId)
    onClose()
  }

  function handleDetach() {
    attachCourse(deckId, null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Attach to Course
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 max-h-64 overflow-y-auto">
          {courses.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-4">
              No courses available. Create a course first.
            </p>
          ) : (
            <div className="space-y-1">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => handleAttach(course.id)}
                  className={`w-full text-left px-3 py-2 text-sm rounded-md cursor-pointer transition-colors ${
                    currentCourseId === course.id
                      ? 'bg-[var(--bg-active)] text-[var(--text-brand)] font-[var(--font-weight-medium)]'
                      : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Link2 size={14} className="shrink-0 text-[var(--text-tertiary)]" />
                    <span className="truncate">{course.meta.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {currentCourseId && (
          <div className="px-4 py-3 border-t border-[var(--border-default)]">
            <Button variant="ghost" size="sm" onClick={handleDetach}>
              <Unlink size={14} />
              Detach from Course
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
