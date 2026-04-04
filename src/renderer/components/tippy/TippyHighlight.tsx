// ─── Tippy Walkthrough Highlight Overlay ───
// Updated for Phase 3: dark red dotted border (#8B0000), speech bubble
// with walkthrough controls, reduced motion support.

import { useState, useEffect, useCallback } from 'react'
import TippyIcon from '@/assets/tippy/Tippy_Icon.png'

interface HighlightProps {
  /** CSS selector for the target element */
  targetSelector: string
  /** The instruction text TIPPY says */
  instruction: string
  /** Highlight visual style */
  highlightStyle: 'border' | 'spotlight' | 'pulse'
  /** Step position in walkthrough */
  stepNumber: number
  totalSteps: number
  /** Navigation callbacks */
  onNext: () => void
  onPrev: () => void
  onStop: () => void
  /** Whether there is a previous step */
  hasPrev: boolean
  /** Whether there is a next step */
  hasNext: boolean
}

interface Rect {
  top: number
  left: number
  width: number
  height: number
}

export function TippyHighlight({
  targetSelector,
  instruction,
  highlightStyle,
  stepNumber,
  totalSteps,
  onNext,
  onPrev,
  onStop,
  hasPrev,
  hasNext
}: HighlightProps): JSX.Element | null {
  const [rect, setRect] = useState<Rect | null>(null)

  useEffect(() => {
    // Try each selector (comma-separated fallbacks)
    const selectors = targetSelector.split(',').map((s) => s.trim())
    let el: Element | null = null
    for (const sel of selectors) {
      el = document.querySelector(sel)
      if (el) break
    }

    if (!el) {
      setRect(null)
      return
    }

    const update = (): void => {
      const r = el!.getBoundingClientRect()
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height })
    }

    update()
    // Scroll element into view
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })

    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [targetSelector])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onStop()
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        e.preventDefault()
        if (hasNext) onNext()
        else onStop()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (hasPrev) onPrev()
      }
    },
    [onNext, onPrev, onStop, hasNext, hasPrev]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!rect) return null

  const padding = 8
  const bubbleWidth = 300

  // Calculate bubble position (prefer bottom, then top, then right, then left)
  const spaceBelow = window.innerHeight - (rect.top + rect.height + padding)
  const spaceAbove = rect.top - padding
  const spaceRight = window.innerWidth - (rect.left + rect.width + padding)

  let bubbleStyle: React.CSSProperties = {}
  const bubbleHeight = 180

  if (spaceBelow >= bubbleHeight + 20) {
    bubbleStyle = {
      top: `${rect.top + rect.height + padding + 12}px`,
      left: `${Math.max(8, Math.min(rect.left + rect.width / 2 - bubbleWidth / 2, window.innerWidth - bubbleWidth - 8))}px`
    }
  } else if (spaceAbove >= bubbleHeight + 20) {
    bubbleStyle = {
      bottom: `${window.innerHeight - rect.top + padding + 12}px`,
      left: `${Math.max(8, Math.min(rect.left + rect.width / 2 - bubbleWidth / 2, window.innerWidth - bubbleWidth - 8))}px`
    }
  } else if (spaceRight >= bubbleWidth + 20) {
    bubbleStyle = {
      top: `${Math.max(8, rect.top + rect.height / 2 - bubbleHeight / 2)}px`,
      left: `${rect.left + rect.width + padding + 12}px`
    }
  } else {
    bubbleStyle = {
      top: `${Math.max(8, rect.top + rect.height / 2 - bubbleHeight / 2)}px`,
      right: `${window.innerWidth - rect.left + padding + 12}px`
    }
  }

  // Highlight border style based on highlightStyle prop
  const borderStyle = highlightStyle === 'spotlight' ? 'solid' : 'dotted'
  const boxShadow = highlightStyle === 'spotlight'
    ? '0 0 0 9999px rgba(0, 0, 0, 0.4)'
    : 'none'

  return (
    <>
      {/* Semi-transparent overlay — click-through */}
      <div
        className="fixed inset-0 z-[10000]"
        style={{
          pointerEvents: 'none',
          background: highlightStyle === 'spotlight' ? 'transparent' : 'rgba(0, 0, 0, 0.4)'
        }}
        aria-hidden="true"
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
          border: `3px ${borderStyle} #8B0000`,
          boxShadow,
          outlineOffset: '4px',
          pointerEvents: 'none',
          animation: highlightStyle === 'pulse' ? 'tippyWalkthroughPulse 1.5s ease-in-out infinite' : 'none'
        }}
        aria-hidden="false"
      />

      {/* Speech bubble */}
      <div
        className="fixed z-[10002] rounded-xl"
        role="dialog"
        aria-label={`Walkthrough step ${stepNumber} of ${totalSteps}`}
        aria-live="polite"
        style={{
          ...bubbleStyle,
          width: `${bubbleWidth}px`,
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          pointerEvents: 'auto'
        }}
      >
        {/* Header with TIPPY avatar */}
        <div className="flex items-center gap-2 px-3 pt-3 pb-1">
          <img src={TippyIcon} alt="" className="w-6 h-6 rounded-full shrink-0" />
          <span className="text-xs font-medium" style={{ color: 'var(--text-tertiary)' }}>
            Step {stepNumber} of {totalSteps}
          </span>
        </div>

        {/* Instruction text */}
        <div
          className="px-3 py-2 text-sm leading-relaxed"
          style={{ color: 'var(--text-primary)' }}
          dangerouslySetInnerHTML={{ __html: markdownToHtml(instruction) }}
        />

        {/* Navigation buttons */}
        <div
          className="flex items-center justify-between px-3 py-2 border-t"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <button
            onClick={onStop}
            className="text-xs cursor-pointer px-2 py-1 rounded"
            style={{ color: 'var(--text-tertiary)', backgroundColor: 'transparent', border: 'none' }}
            type="button"
          >
            Stop Walkthrough
          </button>
          <div className="flex gap-1.5">
            {hasPrev && (
              <button
                onClick={onPrev}
                className="text-xs cursor-pointer px-3 py-1 rounded"
                style={{
                  color: 'var(--text-secondary)',
                  backgroundColor: 'var(--bg-muted)',
                  border: '1px solid var(--border-default)'
                }}
                type="button"
              >
                Back
              </button>
            )}
            <button
              onClick={hasNext ? onNext : onStop}
              className="text-xs cursor-pointer px-3 py-1 rounded font-medium"
              style={{
                color: '#fff',
                backgroundColor: '#8B0000',
                border: 'none'
              }}
              type="button"
            >
              {hasNext ? 'Next' : 'Finish'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes tippyWalkthroughPulse {
          0%, 100% {
            border-color: #8B0000;
            outline-offset: 4px;
          }
          50% {
            border-color: #B71C1C;
            outline-offset: 6px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tippy-walkthrough-pulse {
            animation: none !important;
          }
        }
      `}</style>
    </>
  )
}

/** Simple bold markdown to HTML for instruction text */
function markdownToHtml(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code style="background:var(--bg-muted);padding:1px 4px;border-radius:3px;font-size:0.85em">$1</code>')
}
