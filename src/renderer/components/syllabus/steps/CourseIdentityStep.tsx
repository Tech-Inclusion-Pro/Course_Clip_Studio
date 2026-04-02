import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { CONTENT_AREAS } from '@/lib/syllabus-constants'
import { Button } from '@/components/ui/Button'

export function CourseIdentityStep(): JSX.Element {
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)!
  const setName = useSyllabusStore((s) => s.setName)
  const setCourseGoal = useSyllabusStore((s) => s.setCourseGoal)
  const toggleContentArea = useSyllabusStore((s) => s.toggleContentArea)
  const addCustomContentArea = useSyllabusStore((s) => s.addCustomContentArea)
  const removeCustomContentArea = useSyllabusStore((s) => s.removeCustomContentArea)

  const [customInput, setCustomInput] = useState('')

  function handleAddCustom(): void {
    const trimmed = customInput.trim()
    if (trimmed) {
      addCustomContentArea(trimmed)
      setCustomInput('')
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Course Identity
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Name your course and select the content areas it covers.
        </p>
      </div>

      {/* Course Name */}
      <div>
        <label htmlFor="syl-name" className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          Course Name
        </label>
        <input
          id="syl-name"
          type="text"
          value={activeSyllabus.name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Introduction to Universal Design for Learning"
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      </div>

      {/* Course Goal */}
      <div>
        <label htmlFor="syl-goal" className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          Course Goal
        </label>
        <textarea
          id="syl-goal"
          value={activeSyllabus.courseGoal}
          onChange={(e) => setCourseGoal(e.target.value)}
          rows={3}
          placeholder="Describe the overarching goal of this course..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
        />
      </div>

      {/* Content Area Tiles */}
      <div>
        <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
          Content Areas (select all that apply)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {CONTENT_AREAS.map((area) => {
            const isSelected = activeSyllabus.contentAreas.includes(area.id)
            const LucideIcon = (Icons as Record<string, React.ComponentType<{ size?: number }>>)[area.icon]
            return (
              <button
                key={area.id}
                onClick={() => toggleContentArea(area.id)}
                aria-pressed={isSelected}
                className={`
                  flex items-center gap-2 p-2.5 rounded-lg text-left text-xs cursor-pointer
                  font-[var(--font-weight-medium)] border transition-all
                  focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
                  ${isSelected
                    ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
                    : 'border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:border-[var(--brand-magenta)] hover:bg-[var(--bg-hover)]'}
                `}
              >
                {LucideIcon && <LucideIcon size={16} />}
                <span className="truncate">{area.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Custom Content Areas */}
      <div>
        <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
          Custom Content Areas
        </p>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
            placeholder="Add a custom content area..."
            className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            aria-label="Custom content area name"
          />
          <Button variant="secondary" size="sm" onClick={handleAddCustom}>
            <Plus size={14} />
            Add
          </Button>
        </div>
        {activeSyllabus.customContentAreas.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {activeSyllabus.customContentAreas.map((area) => (
              <span
                key={area}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-[var(--bg-muted)] text-[var(--text-secondary)]"
              >
                {area}
                <button
                  onClick={() => removeCustomContentArea(area)}
                  className="p-0.5 rounded hover:text-[var(--color-danger-500)] cursor-pointer"
                  aria-label={`Remove ${area}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
