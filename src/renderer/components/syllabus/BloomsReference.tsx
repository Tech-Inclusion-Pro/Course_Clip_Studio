import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { BLOOMS_LEVELS } from '@/lib/syllabus-constants'

export function BloomsReference(): JSX.Element {
  // Expanded by default per accessibility requirement
  const [expandedLevels, setExpandedLevels] = useState<Set<string>>(
    new Set(BLOOMS_LEVELS.map((l) => l.id))
  )

  function toggleLevel(id: string): void {
    setExpandedLevels((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      <h4 className="px-3 py-2 text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider bg-[var(--bg-muted)]">
        Bloom's Taxonomy Reference
      </h4>
      <div className="divide-y divide-[var(--border-default)]">
        {BLOOMS_LEVELS.map((level) => {
          const isOpen = expandedLevels.has(level.id)
          return (
            <div key={level.id}>
              <button
                onClick={() => toggleLevel(level.id)}
                aria-expanded={isOpen}
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm cursor-pointer hover:bg-[var(--bg-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[var(--ring-brand)]"
              >
                {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: level.color }}
                  aria-hidden="true"
                />
                <span className="font-[var(--font-weight-medium)] text-[var(--text-primary)]">{level.label}</span>
                <span className="text-xs text-[var(--text-tertiary)] ml-1">— {level.description}</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-2 pl-9">
                  <p className="text-xs text-[var(--text-secondary)]">
                    <span className="font-[var(--font-weight-medium)]">Action verbs: </span>
                    {level.verbs.join(', ')}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
