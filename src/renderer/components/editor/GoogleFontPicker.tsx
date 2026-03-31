import { useState, useMemo, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { GOOGLE_FONTS, getFontCssUrl, getFontFamily, type GoogleFont } from '@/lib/google-fonts'

interface GoogleFontPickerProps {
  value: string
  onChange: (fontFamily: string, fontCssUrl: string | null) => void
  label?: string
}

type Category = 'all' | GoogleFont['category']

const CATEGORY_LABELS: Record<Category, string> = {
  all: 'All',
  'sans-serif': 'Sans Serif',
  serif: 'Serif',
  display: 'Display',
  handwriting: 'Handwriting',
  monospace: 'Monospace'
}

// System fonts that don't need Google Fonts loading
const SYSTEM_FONTS = [
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: "'Helvetica Neue', Helvetica, sans-serif" },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: "'Times New Roman', serif" },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
  { label: 'System UI', value: 'system-ui, sans-serif' },
]

export function GoogleFontPicker({ value, onChange, label }: GoogleFontPickerProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    return GOOGLE_FONTS.filter((font) => {
      const matchesSearch = font.family.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'all' || font.category === category
      return matchesSearch && matchesCategory
    })
  }, [search, category])

  // Load font preview stylesheets
  useEffect(() => {
    if (!open) return
    const toLoad = filtered.slice(0, 20).filter((f) => !loadedFonts.has(f.family))
    for (const font of toLoad) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = getFontCssUrl(font.family, ['400'])
      document.head.appendChild(link)
      setLoadedFonts((prev) => new Set(prev).add(font.family))
    }
  }, [open, filtered, loadedFonts])

  // Find current font label
  const currentLabel = useMemo(() => {
    const systemFont = SYSTEM_FONTS.find((f) => f.value === value)
    if (systemFont) return systemFont.label
    const googleFont = GOOGLE_FONTS.find((f) => getFontFamily(f.family, f.category) === value)
    if (googleFont) return googleFont.family
    // Try to extract the font name from the value
    const match = value.match(/^'([^']+)'/)
    return match ? match[1] : value.split(',')[0].trim()
  }, [value])

  function selectFont(font: GoogleFont) {
    const fontFamily = getFontFamily(font.family, font.category)
    const cssUrl = getFontCssUrl(font.family)
    onChange(fontFamily, cssUrl)
    setOpen(false)
  }

  function selectSystemFont(systemFont: typeof SYSTEM_FONTS[0]) {
    onChange(systemFont.value, null)
    setOpen(false)
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          {label}
        </label>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer hover:border-[var(--brand-magenta)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        style={{ fontFamily: value }}
      >
        <span className="truncate">{currentLabel}</span>
        <ChevronDown size={14} className="text-[var(--text-tertiary)] shrink-0" />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-lg overflow-hidden" style={{ maxHeight: 360 }}>
          {/* Search */}
          <div className="p-2 border-b border-[var(--border-default)]">
            <div className="relative">
              <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search fonts..."
                className="w-full pl-6 pr-6 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] cursor-pointer">
                  <X size={10} />
                </button>
              )}
            </div>
          </div>

          {/* Category filter */}
          <div className="flex gap-0.5 px-2 py-1.5 border-b border-[var(--border-default)] overflow-x-auto">
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-2 py-0.5 text-[9px] rounded-full whitespace-nowrap cursor-pointer transition-colors ${
                  category === cat
                    ? 'bg-[var(--brand-magenta)] text-white'
                    : 'bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Font list */}
          <div className="overflow-y-auto" style={{ maxHeight: 240 }}>
            {/* System fonts section */}
            <div className="px-2 py-1">
              <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1">System Fonts</p>
              {SYSTEM_FONTS.map((sf) => (
                <button
                  key={sf.value}
                  onClick={() => selectSystemFont(sf)}
                  className={`w-full text-left px-2 py-1.5 rounded text-sm cursor-pointer transition-colors ${
                    value === sf.value
                      ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                      : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                  }`}
                  style={{ fontFamily: sf.value }}
                >
                  {sf.label}
                </button>
              ))}
            </div>

            {/* Google Fonts */}
            <div className="px-2 py-1 border-t border-[var(--border-default)]">
              <p className="text-[9px] text-[var(--text-tertiary)] uppercase tracking-wider px-1 mb-1">Google Fonts</p>
              {filtered.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-3">No fonts found</p>
              ) : (
                filtered.slice(0, 40).map((font) => {
                  const fontFamily = getFontFamily(font.family, font.category)
                  return (
                    <button
                      key={font.family}
                      onClick={() => selectFont(font)}
                      className={`w-full text-left px-2 py-1.5 rounded cursor-pointer transition-colors flex items-center justify-between ${
                        value === fontFamily
                          ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                          : 'hover:bg-[var(--bg-hover)] text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="text-sm truncate" style={{ fontFamily: `'${font.family}', ${font.category}` }}>
                        {font.family}
                      </span>
                      <span className="text-[9px] text-[var(--text-tertiary)] shrink-0 ml-2">{font.category}</span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
