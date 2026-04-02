// ─── Tippy Tour Highlight Overlay ───

import { useState, useEffect } from 'react'
import type { TourStep } from '@/lib/tippy/tippyTourSteps'
import { useT } from '@/hooks/useT'

interface TippyHighlightProps {
  step: TourStep
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export function TippyHighlight({ step }: TippyHighlightProps): JSX.Element | null {
  const [rect, setRect] = useState<Rect | null>(null)
  const t = useT()

  useEffect(() => {
    const el = document.querySelector(step.targetSelector)
    if (!el) {
      setRect(null)
      return
    }

    const update = (): void => {
      const r = el.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }

    update()

    // Update position on scroll/resize
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [step.targetSelector])

  if (!rect) return null

  const padding = 8
  const tooltipWidth = 260

  // Tooltip position
  let tooltipStyle: React.CSSProperties = {}
  switch (step.position) {
    case 'top':
      tooltipStyle = {
        bottom: `${window.innerHeight - rect.top + padding + 8}px`,
        left: `${rect.left + rect.width / 2 - tooltipWidth / 2}px`
      }
      break
    case 'bottom':
      tooltipStyle = {
        top: `${rect.top + rect.height + padding + 8}px`,
        left: `${rect.left + rect.width / 2 - tooltipWidth / 2}px`
      }
      break
    case 'left':
      tooltipStyle = {
        top: `${rect.top + rect.height / 2 - 30}px`,
        right: `${window.innerWidth - rect.left + padding + 8}px`
      }
      break
    case 'right':
      tooltipStyle = {
        top: `${rect.top + rect.height / 2 - 30}px`,
        left: `${rect.left + rect.width + padding + 8}px`
      }
      break
  }

  return (
    <>
      {/* Semi-transparent overlay — click-through */}
      <div
        className="fixed inset-0 z-[10000]"
        style={{
          pointerEvents: 'none',
          background: 'rgba(0, 0, 0, 0.4)'
        }}
      />

      {/* Cutout ring around target */}
      <div
        className="fixed z-[10001]"
        style={{
          top: `${rect.top - padding}px`,
          left: `${rect.left - padding}px`,
          width: `${rect.width + padding * 2}px`,
          height: `${rect.height + padding * 2}px`,
          borderRadius: '8px',
          border: '3px solid var(--brand-indigo)',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none',
          animation: 'tippyHighlightPulse 2s ease-in-out infinite'
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10002] p-3 rounded-lg"
        style={{
          ...tooltipStyle,
          width: `${tooltipWidth}px`,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)',
          pointerEvents: 'auto'
        }}
      >
        <h3
          className="text-sm font-semibold mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {t(step.title, step.id)}
        </h3>
        <p
          className="text-xs leading-relaxed"
          style={{ color: 'var(--text-secondary)' }}
        >
          {t(step.description, '')}
        </p>
      </div>

      <style>{`
        @keyframes tippyHighlightPulse {
          0%, 100% { border-color: var(--brand-indigo); }
          50% { border-color: var(--brand-magenta); }
        }
      `}</style>
    </>
  )
}
