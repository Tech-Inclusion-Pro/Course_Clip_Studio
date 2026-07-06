/**
 * Searchable grid of lucide icons for adding an icon to a slide. Offline — no API
 * keys needed. Picking an icon hands back its name + component so the caller can
 * rasterize it to a themed PNG.
 */

import { useState } from 'react'
import { X, Search, icons as LucideIcons, type LucideIcon } from 'lucide-react'

interface Props {
  onSelect: (name: string, Icon: LucideIcon) => void
  onClose: () => void
  busy?: boolean
}

// A friendly starter set shown before searching.
const CURATED = [
  'Rocket', 'Lightbulb', 'Target', 'TrendingUp', 'Users', 'BookOpen',
  'GraduationCap', 'CircleCheck', 'TriangleAlert', 'Star', 'Heart', 'Globe',
  'Zap', 'Award', 'Calendar', 'Clock', 'MessageCircle', 'Brain',
  'Accessibility', 'Search', 'Settings', 'ChartBar', 'ChartPie', 'ChartLine',
  'Handshake', 'Puzzle', 'Flag', 'MapPin', 'Mail', 'Phone',
  'ShieldCheck', 'Sparkles', 'ThumbsUp', 'Eye', 'Compass', 'Layers'
]

const allNames = Object.keys(LucideIcons)

export function IconPicker({ onSelect, onClose, busy }: Props): JSX.Element {
  const [query, setQuery] = useState('')

  const names = query.trim()
    ? allNames.filter((n) => n.toLowerCase().includes(query.toLowerCase().replace(/\s+/g, ''))).slice(0, 72)
    : CURATED.filter((n) => n in LucideIcons)

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Choose an icon"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg max-h-[80vh] overflow-hidden flex flex-col mx-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-xl)]">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Choose an icon
          </h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-[var(--bg-hover)] cursor-pointer" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="relative mb-3">
          <Search size={14} className="absolute left-2.5 top-2.5 text-[var(--text-tertiary)]" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 1,500+ icons (e.g. rocket, chart, book)…"
            className="w-full pl-8 pr-2.5 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>

        <div className="overflow-y-auto grid grid-cols-6 gap-2 pr-1" style={{ opacity: busy ? 0.5 : 1, pointerEvents: busy ? 'none' : 'auto' }}>
          {names.map((name) => {
            const Icon = LucideIcons[name as keyof typeof LucideIcons]
            return (
              <button
                key={name}
                onClick={() => onSelect(name, Icon)}
                className="flex items-center justify-center aspect-square rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--brand-magenta)] cursor-pointer"
                title={name}
              >
                <Icon size={22} />
              </button>
            )
          })}
          {names.length === 0 && (
            <p className="col-span-6 text-center text-xs text-[var(--text-tertiary)] py-6">
              No icons match "{query}".
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
