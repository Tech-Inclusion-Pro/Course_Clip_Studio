// ─── Tippy Tour Manager ───

import { useCallback, useEffect } from 'react'
import { useTippyStore } from '@/stores/useTippyStore'
import { TOUR_STEPS } from '@/lib/tippy/tippyTourSteps'
import { TippyHighlight } from './TippyHighlight'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useT } from '@/hooks/useT'

export function TippyTour(): JSX.Element | null {
  const tourActive = useTippyStore((s) => s.tourActive)
  const tourStepIndex = useTippyStore((s) => s.tourStepIndex)
  const nextTourStep = useTippyStore((s) => s.nextTourStep)
  const prevTourStep = useTippyStore((s) => s.prevTourStep)
  const endTour = useTippyStore((s) => s.endTour)
  const addMessage = useTippyStore((s) => s.addMessage)
  const t = useT()

  const currentStep = TOUR_STEPS[tourStepIndex]
  const isLast = tourStepIndex >= TOUR_STEPS.length - 1
  const isFirst = tourStepIndex === 0

  const handleNext = useCallback(() => {
    if (isLast) {
      endTour()
      addMessage({
        role: 'system',
        content: t('tippy.tourComplete', 'Tour complete! Feel free to ask me anything as you explore.')
      })
    } else {
      nextTourStep()
    }
  }, [isLast, endTour, addMessage, nextTourStep, t])

  const handlePrev = useCallback(() => {
    if (!isFirst) prevTourStep()
  }, [isFirst, prevTourStep])

  const handleSkip = useCallback(() => {
    endTour()
    addMessage({
      role: 'system',
      content: t('tippy.tourSkipped', 'Tour skipped. Ask me anytime if you want to continue!')
    })
  }, [endTour, addMessage, t])

  // Keyboard navigation
  useEffect(() => {
    if (!tourActive) return
    const handle = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') handleSkip()
      else if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext()
      else if (e.key === 'ArrowLeft') handlePrev()
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [tourActive, handleSkip, handleNext, handlePrev])

  if (!tourActive || !currentStep) return null

  return (
    <>
      <TippyHighlight step={currentStep} />

      {/* Tour controls */}
      <div
        className="fixed z-[10003] flex items-center gap-3 px-4 py-2.5 rounded-full"
        style={{
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        <button
          onClick={handlePrev}
          disabled={isFirst}
          className="p-1 rounded cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ color: 'var(--text-primary)' }}
          aria-label="Previous step"
        >
          <ChevronLeft size={18} />
        </button>

        <span
          className="text-xs font-medium tabular-nums"
          style={{ color: 'var(--text-secondary)' }}
        >
          {tourStepIndex + 1} / {TOUR_STEPS.length}
        </span>

        <button
          onClick={handleNext}
          className="p-1 rounded cursor-pointer"
          style={{ color: 'var(--text-primary)' }}
          aria-label={isLast ? 'Finish tour' : 'Next step'}
        >
          <ChevronRight size={18} />
        </button>

        <div
          className="w-px h-5"
          style={{ backgroundColor: 'var(--border-default)' }}
        />

        <button
          onClick={handleSkip}
          className="p-1 rounded cursor-pointer"
          style={{ color: 'var(--text-tertiary)' }}
          aria-label="Skip tour"
        >
          <X size={16} />
        </button>
      </div>
    </>
  )
}
