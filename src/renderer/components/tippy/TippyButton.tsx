// ─── Tippy Draggable Floating Button ───

import { useRef, useCallback, useState, useEffect } from 'react'
import { useTippyStore } from '@/stores/useTippyStore'
import { useAppStore } from '@/stores/useAppStore'
import { useT } from '@/hooks/useT'
import TippyIcon from '@/assets/tippy/Tippy_Icon.png'

const DRAG_THRESHOLD = 5

export function TippyButton(): JSX.Element {
  const isOpen = useTippyStore((s) => s.isOpen)
  const position = useTippyStore((s) => s.position)
  const toggle = useTippyStore((s) => s.toggle)
  const setPosition = useTippyStore((s) => s.setPosition)
  const error = useTippyStore((s) => s.error)
  const reducedMotion = useAppStore((s) => s.accessibility.reducedMotion)
  const t = useT()

  const fabRef = useRef<HTMLButtonElement>(null)
  const isDragging = useRef(false)
  const hasMoved = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const posStart = useRef({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)

  // Pulse animation on first launch (no messages yet)
  const messages = useTippyStore((s) => s.messages)
  const showPulse = (messages.length === 0 || !!error) && !reducedMotion

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
      setPosition({ x: newX, y: newY })
    },
    [dragging, setPosition]
  )

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
      if (!hasMoved.current) {
        toggle()
      }
      isDragging.current = false
      hasMoved.current = false
      setDragging(false)
    },
    [toggle]
  )

  // Ensure position is within viewport on resize
  useEffect(() => {
    const handleResize = (): void => {
      const { x, y } = useTippyStore.getState().position
      const clampedX = Math.max(0, Math.min(window.innerWidth - 52, x))
      const clampedY = Math.max(0, Math.min(window.innerHeight - 52, y))
      if (clampedX !== x || clampedY !== y) {
        setPosition({ x: clampedX, y: clampedY })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [setPosition])

  return (
    <button
      ref={fabRef}
      id="tippy-fab"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      className="fixed z-[10001] flex items-center justify-center rounded-full shadow-lg transition-transform cursor-pointer select-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '3.25rem',
        height: '3.25rem',
        touchAction: 'none',
        transform: dragging ? 'scale(1.1)' : 'scale(1)',
        outline: 'none'
      }}
      aria-label={t('tippy.ariaLabel', 'Tippy AI Assistant')}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-controls="tippy-panel"
    >
      <img
        src={TippyIcon}
        alt=""
        className="w-full h-full rounded-full object-cover"
        draggable={false}
      />

      {/* Pulse ring */}
      {showPulse && (
        <span
          className="absolute inset-0 rounded-full"
          style={{
            border: '2px solid var(--brand-indigo)',
            animation: 'tippyPulse 2s ease-in-out infinite',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Error indicator */}
      {error && (
        <span
          className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full"
          style={{ backgroundColor: 'var(--color-danger-500)' }}
        />
      )}

      <style>{`
        @keyframes tippyPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.3); opacity: 0; }
        }
      `}</style>
    </button>
  )
}
