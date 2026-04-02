import { useState } from 'react'
import { useSyllabusStore } from '@/stores/useSyllabusStore'
import { GRADE_LEVELS } from '@/lib/syllabus-constants'

export function AudienceLevelStep(): JSX.Element {
  const activeSyllabus = useSyllabusStore((s) => s.activeSyllabus)!
  const setAudienceLevel = useSyllabusStore((s) => s.setAudienceLevel)
  const setAudienceContext = useSyllabusStore((s) => s.setAudienceContext)

  const [customLevel, setCustomLevel] = useState('')
  const isOther = activeSyllabus.audience.level === 'other'

  function handleLevelChange(value: string): void {
    setAudienceLevel(value)
    if (value !== 'other') setCustomLevel('')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Audience & Level
        </h3>
        <p className="text-sm text-[var(--text-secondary)]">
          Define who this course is for and any additional context.
        </p>
      </div>

      {/* Grade / Audience Level */}
      <div>
        <label htmlFor="syl-level" className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          Audience Level
        </label>
        <select
          id="syl-level"
          value={activeSyllabus.audience.level}
          onChange={(e) => handleLevelChange(e.target.value)}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        >
          <option value="">Select audience level...</option>
          {GRADE_LEVELS.map((gl) => (
            <option key={gl.id} value={gl.id}>{gl.label}</option>
          ))}
        </select>

        {isOther && (
          <div className="mt-2">
            <label htmlFor="syl-custom-level" className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Specify audience level
            </label>
            <input
              id="syl-custom-level"
              type="text"
              value={customLevel}
              onChange={(e) => setCustomLevel(e.target.value)}
              onBlur={() => {
                if (customLevel.trim()) setAudienceLevel(`other:${customLevel.trim()}`)
              }}
              placeholder="Describe your audience..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </div>
        )}
      </div>

      {/* Audience Context */}
      <div>
        <label htmlFor="syl-context" className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          Additional Context
        </label>
        <textarea
          id="syl-context"
          value={activeSyllabus.audience.context}
          onChange={(e) => setAudienceContext(e.target.value)}
          rows={4}
          placeholder="Describe any additional context about your learners (e.g., prior knowledge, learning environment, special considerations)..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
        />
      </div>
    </div>
  )
}
