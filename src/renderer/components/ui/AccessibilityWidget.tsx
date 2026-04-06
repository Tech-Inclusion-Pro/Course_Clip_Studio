import { useState, useRef, useEffect, useCallback } from 'react'
import { PersonStanding, X, Minus, Plus, RotateCcw } from 'lucide-react'
import { useAppStore, type ThemeMode } from '@/stores/useAppStore'
import type { ColorBlindMode, CursorStyle } from '@/types/course'

/* ─── Sub-components ─── */

function WidgetSection({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-[var(--font-weight-semibold)] uppercase tracking-wider text-[var(--text-tertiary)]">
        {title}
      </h3>
      {children}
    </div>
  )
}

function WidgetToggle({
  label,
  checked,
  onChange,
  description
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  description?: string
}): JSX.Element {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex-1 min-w-0">
        <span className="text-sm text-[var(--text-primary)]">{label}</span>
        {description && (
          <p className="text-xs text-[var(--text-tertiary)] mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={() => onChange(!checked)}
        className="relative shrink-0 w-10 h-5 rounded-full transition-colors cursor-pointer"
        style={{ backgroundColor: checked ? 'var(--brand-magenta)' : 'var(--border-default)' }}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <span
          className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform"
          style={{ transform: checked ? 'translateX(20px)' : 'translateX(0)' }}
        />
      </button>
    </div>
  )
}

function GridButton({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="px-2 py-1.5 rounded text-xs transition-all truncate cursor-pointer"
      style={{
        border: active ? '2px solid var(--brand-magenta)' : '1px solid var(--border-default)',
        backgroundColor: active ? 'var(--bg-active)' : 'transparent',
        color: 'var(--text-primary)'
      }}
      aria-pressed={active}
    >
      {label}
    </button>
  )
}

/* ─── Color Blind Modes ─── */
const COLOR_BLIND_OPTIONS: { value: ColorBlindMode; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'protanopia', label: 'Protanopia' },
  { value: 'deuteranopia', label: 'Deuteranopia' },
  { value: 'tritanopia', label: 'Tritanopia' },
  { value: 'achromatopsia', label: 'Monochrome' }
]

const CURSOR_OPTIONS: { value: CursorStyle; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'large', label: 'Large' },
  { value: 'crosshair', label: 'Crosshair' },
  { value: 'high-contrast', label: 'Hi Contrast' }
]

const BUILT_IN_THEMES: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'sepia', label: 'Sepia' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'forest', label: 'Forest' },
  { value: 'ocean', label: 'Ocean' }
]

/* ─── Position Persistence ─── */
const A11Y_POSITION_KEY = 'a11y_widget_position'
const DRAG_THRESHOLD = 5

function loadA11yPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(A11Y_POSITION_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return { x: window.innerWidth - 76, y: window.innerHeight - 76 }
}

function persistA11yPosition(pos: { x: number; y: number }): void {
  try {
    localStorage.setItem(A11Y_POSITION_KEY, JSON.stringify(pos))
  } catch {
    // ignore
  }
}

/* ─── Main Widget ─── */

export function AccessibilityWidget(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState(loadA11yPosition)
  const [dragging, setDragging] = useState(false)
  const fabRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)
  const hasMoved = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })

  const a11y = useAppStore((s) => s.accessibility)
  const update = useAppStore((s) => s.updateAccessibilitySettings)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const brandKits = useAppStore((s) => s.brandKits)

  // Count active (non-default) features
  const activeCount = [
    a11y.highContrastMode,
    a11y.baseFontSize !== 16,
    a11y.reducedMotion,
    a11y.colorBlindMode !== 'none',
    a11y.cursorStyle !== 'default',
    a11y.cursorTrail,
    a11y.openDyslexic,
    a11y.bionicReading,
    a11y.enhancedTextSpacing,
    a11y.enhancedFocusIndicators
  ].filter(Boolean).length

  // Drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      isDragging.current = true
      hasMoved.current = false
      dragStart.current = { x: e.clientX, y: e.clientY }
      posStart.current = { ...position }
      ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    },
    [position]
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return
      const dx = e.clientX - dragStart.current.x
      const dy = e.clientY - dragStart.current.y
      if (!hasMoved.current && Math.abs(dx) + Math.abs(dy) < DRAG_THRESHOLD) return
      hasMoved.current = true
      if (!dragging) setDragging(true)
      const newX = Math.max(0, Math.min(window.innerWidth - 52, posStart.current.x + dx))
      const newY = Math.max(0, Math.min(window.innerHeight - 52, posStart.current.y + dy))
      const newPos = { x: newX, y: newY }
      setPosition(newPos)
      persistA11yPosition(newPos)
    },
    [dragging]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      if (!hasMoved.current) {
        setIsOpen((prev) => !prev)
      }
      isDragging.current = false
      hasMoved.current = false
      setDragging(false)
    },
    []
  )

  // Escape closes
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        fabRef.current?.focus()
      }
    },
    [isOpen]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Click outside closes
  useEffect(() => {
    if (!isOpen) return
    const handle = (e: MouseEvent): void => {
      const t = e.target as Node
      if (panelRef.current && !panelRef.current.contains(t) && fabRef.current && !fabRef.current.contains(t)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen])

  // Keep within viewport on resize
  useEffect(() => {
    const handleResize = (): void => {
      setPosition((prev) => {
        const clampedX = Math.max(0, Math.min(window.innerWidth - 52, prev.x))
        const clampedY = Math.max(0, Math.min(window.innerHeight - 52, prev.y))
        if (clampedX !== prev.x || clampedY !== prev.y) {
          const newPos = { x: clampedX, y: clampedY }
          persistA11yPosition(newPos)
          return newPos
        }
        return prev
      })
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function handleReset(): void {
    update({
      highContrastMode: false,
      baseFontSize: 16,
      reducedMotion: false,
      colorBlindMode: 'none',
      cursorStyle: 'default',
      cursorTrail: false,
      openDyslexic: false,
      bionicReading: false,
      enhancedTextSpacing: false,
      enhancedFocusIndicators: false
    })
    setTheme('system')
  }

  // Compute panel position relative to button
  const vw = typeof window !== 'undefined' ? window.innerWidth : 1280
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800
  const openRight = position.x < vw / 2
  const openUp = position.y > vh / 2

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9998,
    width: '20rem',
    maxHeight: '70vh',
    ...(openRight
      ? { left: `${position.x}px` }
      : { right: `${vw - position.x - 52}px` }),
    ...(openUp
      ? { bottom: `${vh - position.y + 12}px` }
      : { top: `${position.y + 64}px` }),
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    boxShadow: 'var(--shadow-xl)',
    borderRadius: '0.75rem',
    animation: 'slideUp 200ms ease-out'
  }

  return (
    <>
      {/* FAB */}
      <button
        ref={fabRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="fixed z-[9999] flex items-center justify-center rounded-full shadow-lg transition-transform cursor-pointer select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '3.25rem',
          height: '3.25rem',
          backgroundColor: 'var(--brand-indigo)',
          color: '#ffffff',
          touchAction: 'none',
          transform: dragging ? 'scale(1.1)' : 'scale(1)',
          outline: 'none'
        }}
        aria-label={`Accessibility${activeCount > 0 ? ` (${activeCount} active)` : ''}`}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls="a11y-widget-panel"
      >
        <PersonStanding size={22} />
        {activeCount > 0 && (
          <span
            className="absolute -top-1 -right-1 flex items-center justify-center rounded-full text-xs font-bold"
            style={{
              width: '1.25rem',
              height: '1.25rem',
              backgroundColor: 'var(--color-danger-500)',
              color: '#fff',
              fontSize: '0.65rem'
            }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div
          ref={panelRef}
          id="a11y-widget-panel"
          role="dialog"
          aria-label="Accessibility Settings"
          className="fixed overflow-y-auto"
          style={panelStyle}
        >
          <div className="p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Accessibility</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                aria-label="Close accessibility panel"
              >
                <X size={16} />
              </button>
            </div>

            {/* Font Size */}
            <WidgetSection title="Font Size">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update({ baseFontSize: Math.max(12, a11y.baseFontSize - 2) })}
                  className="w-8 h-8 rounded flex items-center justify-center cursor-pointer border border-[var(--border-default)] text-[var(--text-primary)]"
                  aria-label="Decrease font size"
                >
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center text-sm font-mono text-[var(--text-primary)]">
                  {a11y.baseFontSize}px
                </span>
                <button
                  onClick={() => update({ baseFontSize: Math.min(28, a11y.baseFontSize + 2) })}
                  className="w-8 h-8 rounded flex items-center justify-center cursor-pointer border border-[var(--border-default)] text-[var(--text-primary)]"
                  aria-label="Increase font size"
                >
                  <Plus size={14} />
                </button>
                <button
                  onClick={() => update({ baseFontSize: 16 })}
                  className="px-2 h-8 rounded text-xs cursor-pointer border border-[var(--border-default)] text-[var(--text-tertiary)]"
                  aria-label="Reset font size"
                >
                  Reset
                </button>
              </div>
            </WidgetSection>

            {/* Color Theme */}
            <WidgetSection title="Color Theme">
              <div className="grid grid-cols-4 gap-1.5">
                {BUILT_IN_THEMES.map((opt) => (
                  <GridButton
                    key={opt.value}
                    label={opt.label}
                    active={theme === opt.value}
                    onClick={() => setTheme(opt.value)}
                  />
                ))}
              </div>
              {brandKits.length > 0 && (
                <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                  {brandKits.map((kit) => (
                    <button
                      key={kit.id}
                      onClick={() => setTheme(`brand-${kit.id}`)}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded text-xs transition-all truncate cursor-pointer"
                      style={{
                        border: theme === `brand-${kit.id}` ? '2px solid var(--brand-magenta)' : '1px solid var(--border-default)',
                        backgroundColor: theme === `brand-${kit.id}` ? 'var(--bg-active)' : 'transparent',
                        color: 'var(--text-primary)'
                      }}
                      aria-pressed={theme === `brand-${kit.id}`}
                    >
                      <span className="flex gap-0.5 shrink-0">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: kit.primaryColor }} />
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: kit.secondaryColor }} />
                      </span>
                      <span className="truncate">{kit.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </WidgetSection>

            {/* Toggles */}
            <WidgetSection title="Display">
              <WidgetToggle
                label="High Contrast"
                checked={a11y.highContrastMode}
                onChange={(v) => update({ highContrastMode: v })}
              />
              <WidgetToggle
                label="Reduced Motion"
                description="WCAG 2.3.3"
                checked={a11y.reducedMotion}
                onChange={(v) => update({ reducedMotion: v })}
              />
              <WidgetToggle
                label="Enhanced Text Spacing"
                description="WCAG 1.4.12"
                checked={a11y.enhancedTextSpacing}
                onChange={(v) => update({ enhancedTextSpacing: v })}
              />
              <WidgetToggle
                label="Enhanced Focus Indicators"
                description="WCAG 2.4.7"
                checked={a11y.enhancedFocusIndicators}
                onChange={(v) => update({ enhancedFocusIndicators: v })}
              />
            </WidgetSection>

            {/* Color Blind Mode */}
            <WidgetSection title="Color Blind Mode">
              <div className="grid grid-cols-3 gap-1.5">
                {COLOR_BLIND_OPTIONS.map((opt) => (
                  <GridButton
                    key={opt.value}
                    label={opt.label}
                    active={a11y.colorBlindMode === opt.value}
                    onClick={() => update({ colorBlindMode: opt.value })}
                  />
                ))}
              </div>
            </WidgetSection>

            {/* Cursor */}
            <WidgetSection title="Cursor">
              <div className="grid grid-cols-4 gap-1.5">
                {CURSOR_OPTIONS.map((opt) => (
                  <GridButton
                    key={opt.value}
                    label={opt.label}
                    active={a11y.cursorStyle === opt.value}
                    onClick={() => update({ cursorStyle: opt.value })}
                  />
                ))}
              </div>
              <WidgetToggle
                label="Cursor Trail"
                checked={a11y.cursorTrail}
                onChange={(v) => update({ cursorTrail: v })}
              />
            </WidgetSection>

            {/* Reading */}
            <WidgetSection title="Reading">
              <WidgetToggle
                label="OpenDyslexic Font"
                description="Dyslexia-friendly typeface"
                checked={a11y.openDyslexic}
                onChange={(v) => update({ openDyslexic: v })}
              />
              <WidgetToggle
                label="Bionic Reading"
                description="Bold first half of words"
                checked={a11y.bionicReading}
                onChange={(v) => update({ bionicReading: v })}
              />
            </WidgetSection>

            {/* Reset All */}
            <button
              onClick={handleReset}
              className="w-full py-2 rounded-lg text-sm font-[var(--font-weight-medium)] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--color-danger-500)',
                color: 'var(--color-danger-500)'
              }}
            >
              <RotateCcw size={14} />
              Reset All
            </button>
          </div>
        </div>
      )}
    </>
  )
}
