import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { useHotkeyStore } from '@/stores/useHotkeyStore'
import { formatKeyForDisplay, getPlatform } from '@/lib/hotkey-utils'
import type { HotkeyCategory, HotkeyDefinition } from '@/types/hotkeys'

const CATEGORY_LABELS: Record<HotkeyCategory, string> = {
  global: 'Global',
  recording: 'Recording',
  'slide-editor': 'Slide Editor',
  timeline: 'Timeline Editor',
  text: 'Text Formatting',
  media: 'Media Library',
  syllabus: 'Syllabus Builder',
  export: 'Export',
  accessibility: 'Accessibility'
}

const CATEGORIES: Array<{ id: HotkeyCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'global', label: 'Global' },
  { id: 'recording', label: 'Recording' },
  { id: 'slide-editor', label: 'Slide Editor' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'text', label: 'Text' },
  { id: 'media', label: 'Media' },
  { id: 'syllabus', label: 'Syllabus' },
  { id: 'export', label: 'Export' },
  { id: 'accessibility', label: 'Accessibility' }
]

function KeyCombo({ binding }: { binding: string }): JSX.Element {
  const platform = getPlatform()
  const display = formatKeyForDisplay(binding, platform)

  // Split by + for non-mac, or render as-is for mac (already formatted)
  const keys = platform === 'mac' ? [display] : display.split('+')

  return (
    <span className="inline-flex items-center gap-0.5">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center min-w-[24px] h-6 px-1.5
            rounded border border-[var(--border-default)] bg-[var(--bg-muted)]
            text-xs font-mono text-[var(--text-secondary)]
            shadow-[0_1px_0_var(--border-default)]"
        >
          {key.trim()}
        </kbd>
      ))}
    </span>
  )
}

function HotkeyRow({ hotkey }: { hotkey: HotkeyDefinition }): JSX.Element {
  const platform = getPlatform()
  const binding = hotkey.current[platform]

  return (
    <div className="flex items-center justify-between py-2 px-3 rounded hover:bg-[var(--bg-hover)] transition-colors">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-[var(--text-primary)]">{hotkey.label}</span>
        {hotkey.description && (
          <span className="ml-2 text-xs text-[var(--text-tertiary)]">{hotkey.description}</span>
        )}
      </div>
      <div className="flex-shrink-0 ml-4">
        <KeyCombo binding={binding} />
      </div>
    </div>
  )
}

export function HotkeyReferencePanel(): JSX.Element | null {
  const referenceOpen = useHotkeyStore((s) => s.referenceOpen)
  const setReferenceOpen = useHotkeyStore((s) => s.setReferenceOpen)
  const searchQuery = useHotkeyStore((s) => s.referenceSearchQuery)
  const setReferenceSearch = useHotkeyStore((s) => s.setReferenceSearch)
  const categoryFilter = useHotkeyStore((s) => s.referenceCategoryFilter)
  const setReferenceCategoryFilter = useHotkeyStore((s) => s.setReferenceCategoryFilter)
  const getFilteredHotkeys = useHotkeyStore((s) => s.getFilteredHotkeys)

  const panelRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (referenceOpen) {
      requestAnimationFrame(() => searchRef.current?.focus())
    } else {
      setReferenceSearch('')
      setReferenceCategoryFilter('all')
    }
  }, [referenceOpen, setReferenceSearch, setReferenceCategoryFilter])

  useEffect(() => {
    if (!referenceOpen) return

    function onKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        setReferenceOpen(false)
      }
    }

    function onClick(e: MouseEvent): void {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setReferenceOpen(false)
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('mousedown', onClick)
    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('mousedown', onClick)
    }
  }, [referenceOpen, setReferenceOpen])

  if (!referenceOpen) return null

  const filtered = getFilteredHotkeys()

  // Group by category
  const grouped: Record<string, HotkeyDefinition[]> = {}
  for (const h of filtered) {
    const cat = h.category
    if (!grouped[cat]) grouped[cat] = []
    grouped[cat].push(h)
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ zIndex: 10003 }}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard Shortcuts Reference"
    >
      <div
        ref={panelRef}
        className="w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl border border-[var(--border-default)]
          bg-[var(--bg-surface)] shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Keyboard Shortcuts</h2>
          <button
            onClick={() => setReferenceOpen(false)}
            className="p-1.5 rounded-md hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search + Filters */}
        <div className="px-5 py-3 border-b border-[var(--border-default)] space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setReferenceSearch(e.target.value)}
              placeholder="Search shortcuts..."
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-default)]
                bg-[var(--bg-app)] text-sm text-[var(--text-primary)]
                placeholder:text-[var(--text-tertiary)]
                focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)]"
            />
          </div>

          <div className="flex gap-1.5" role="tablist" aria-label="Filter by category">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setReferenceCategoryFilter(cat.id)}
                role="tab"
                aria-selected={categoryFilter === cat.id}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer
                  ${categoryFilter === cat.id
                    ? 'bg-[var(--brand-magenta)] text-white'
                    : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hotkey List */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
              No shortcuts found matching &ldquo;{searchQuery}&rdquo;
            </p>
          ) : (
            Object.entries(grouped).map(([category, hotkeys]) => (
              <div key={category} className="mb-4 last:mb-0">
                <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-3">
                  {CATEGORY_LABELS[category as HotkeyCategory] ?? category}
                </h3>
                <div className="space-y-0.5">
                  {hotkeys.map((h) => (
                    <HotkeyRow key={h.id} hotkey={h} />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border-default)] text-xs text-[var(--text-tertiary)] text-center">
          Press <KeyCombo binding={getPlatform() === 'mac' ? 'Cmd+/' : 'Ctrl+/'} /> to toggle this panel
        </div>
      </div>
    </div>
  )
}
