import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { COURSE_TEMPLATES } from '@/lib/constants'
import { useCourseStore } from '@/stores/useCourseStore'
import { createCourse } from '@/lib/mock-data'
import { TemplateCard } from './TemplateCard'
import type { CourseTemplate } from '@/types/course'

interface NewCourseDialogProps {
  open: boolean
  onClose: () => void
}

export function NewCourseDialog({ open, onClose }: NewCourseDialogProps): JSX.Element | null {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const addCourse = useCourseStore((s) => s.addCourse)
  const titleRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Focus title input on open
  useEffect(() => {
    if (open) {
      setTitle('')
      setDescription('')
      setSelectedTemplateId(null)
      // Delay focus to after render
      requestAnimationFrame(() => titleRef.current?.focus())
    }
  }, [open])

  // Trap focus and handle Escape
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  function handleCreate() {
    const template = selectedTemplateId
      ? COURSE_TEMPLATES.find((t) => t.id === selectedTemplateId)
      : null

    let course
    if (template) {
      const base = template.factory()
      course = createCourse({
        ...base,
        meta: {
          ...base.meta,
          title: title.trim() || template.name,
          description: description.trim() || base.meta.description
        }
      })
    } else {
      course = createCourse({
        meta: {
          title: title.trim() || 'Untitled Course',
          description: description.trim(),
          author: 'Course Author',
          language: 'en',
          estimatedDuration: 0,
          tags: [],
          thumbnail: null,
          version: '1.0.0'
        }
      })
    }

    addCourse(course)
    onClose()
  }

  function handleTemplateSelect(template: CourseTemplate) {
    setSelectedTemplateId(selectedTemplateId === template.id ? null : template.id)
    if (!title.trim()) {
      setTitle(template.name)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Create new course"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="
          relative w-full max-w-xl max-h-[85vh] overflow-y-auto
          mx-4 p-6 rounded-xl
          bg-[var(--bg-surface)] border border-[var(--border-default)]
          shadow-[var(--shadow-xl)]
        "
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 p-1.5 rounded-md cursor-pointer
            text-[var(--text-tertiary)] hover:text-[var(--text-primary)]
            hover:bg-[var(--bg-hover)]
            transition-colors duration-[var(--duration-fast)]
          "
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-4">
          Create New Course
        </h2>

        {/* Title */}
        <div className="mb-3">
          <label
            htmlFor="course-title"
            className="block text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] mb-1"
          >
            Course Title
          </label>
          <input
            ref={titleRef}
            id="course-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter course title..."
            className="
              w-full px-3 py-2 text-sm
              rounded-lg border border-[var(--border-default)]
              bg-[var(--bg-surface)] text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)]
              focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
            "
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label
            htmlFor="course-description"
            className="block text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] mb-1"
          >
            Description
          </label>
          <textarea
            id="course-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief course description..."
            rows={2}
            className="
              w-full px-3 py-2 text-sm
              rounded-lg border border-[var(--border-default)]
              bg-[var(--bg-surface)] text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)]
              focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
              resize-none
            "
          />
        </div>

        {/* Template picker */}
        <div className="mb-5">
          <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] mb-2">
            Start from a template (optional)
          </p>
          <div className="grid grid-cols-3 gap-2">
            {COURSE_TEMPLATES.map((template) => (
              <div
                key={template.id}
                className={`rounded-xl ${selectedTemplateId === template.id ? 'ring-2 ring-[var(--ring-brand)]' : ''}`}
              >
                <TemplateCard template={template} onSelect={handleTemplateSelect} />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="md" onClick={handleCreate}>
            Create Course
          </Button>
        </div>
      </div>
    </div>
  )
}
