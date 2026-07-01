import { useState, useRef, useEffect } from 'react'
import type { LayoutHint } from '@/types/presentation'
import { SLIDE_LAYOUTS, getLayoutDef } from '@/lib/presentation/slide-layouts'
import { LayoutThumbnail } from './LayoutThumbnail'

interface LayoutPickerProps {
  currentLayout: LayoutHint
  onSelect: (layout: LayoutHint) => void
}

export function LayoutPicker({ currentLayout, onSelect }: LayoutPickerProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const current = getLayoutDef(currentLayout)

  useEffect(() => {
    if (!open) return
    function handleClickOutside(e: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-1.5 py-1 rounded border border-[var(--border-default)] hover:border-[var(--border-accent)] transition-colors"
        title={current.name}
      >
        <LayoutThumbnail regions={current.thumbnailRegions} width={48} />
        <span className="text-[10px] text-[var(--text-secondary)] max-w-[60px] truncate">
          {current.name}
        </span>
      </button>

      {/* Popover */}
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg shadow-lg p-3 w-[340px]">
          <div className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
            Slide Layout
          </div>
          <div className="grid grid-cols-3 gap-2">
            {SLIDE_LAYOUTS.map((layout) => (
              <button
                key={layout.id}
                type="button"
                onClick={() => { onSelect(layout.id); setOpen(false) }}
                className={`flex flex-col items-center gap-1 p-1.5 rounded hover:bg-[var(--bg-muted)] transition-colors ${
                  layout.id === currentLayout ? 'bg-[var(--bg-muted)]' : ''
                }`}
                title={layout.description}
              >
                <LayoutThumbnail
                  regions={layout.thumbnailRegions}
                  selected={layout.id === currentLayout}
                  width={88}
                />
                <span className="text-[10px] text-[var(--text-tertiary)] leading-tight text-center">
                  {layout.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
