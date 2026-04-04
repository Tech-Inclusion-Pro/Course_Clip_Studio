// ─── Tippy Walkthrough Runner ───
// Phase 3: Generalized walkthrough system that supports the basic app tour
// and all 15 feature-specific walkthroughs. Narrates each step in the chat
// panel and renders the highlight overlay with speech bubble.

import { useCallback, useEffect, useRef } from 'react'
import { useTippyStore } from '@/stores/useTippyStore'
import { TOUR_STEPS } from '@/lib/tippy/tippyTourSteps'
import { getWalkthroughById } from '@/lib/tippy/walkthrough-library'
import { injectHighlightStyles } from '@/lib/tippy/walkthrough-engine'
import { TippyHighlight } from './TippyHighlight'
import { useT } from '@/hooks/useT'

export function TippyTour(): JSX.Element | null {
  const tourActive = useTippyStore((s) => s.tourActive)
  const tourStepIndex = useTippyStore((s) => s.tourStepIndex)
  const activeWalkthroughId = useTippyStore((s) => s.activeWalkthroughId)
  const nextTourStep = useTippyStore((s) => s.nextTourStep)
  const prevTourStep = useTippyStore((s) => s.prevTourStep)
  const endTour = useTippyStore((s) => s.endTour)
  const addMessage = useTippyStore((s) => s.addMessage)
  const open = useTippyStore((s) => s.open)
  const t = useT()

  // Track which step we last narrated so we don't duplicate messages
  const lastNarratedStep = useRef(-1)
  const lastWalkthroughId = useRef<string | null>(null)

  // Inject highlight CSS on first walkthrough
  useEffect(() => {
    if (tourActive) {
      injectHighlightStyles()
    }
  }, [tourActive])

  // Determine if we're running a basic tour or a feature walkthrough
  const walkthrough = activeWalkthroughId ? getWalkthroughById(activeWalkthroughId) : null
  const isFeatureWalkthrough = !!walkthrough

  // Get current step data
  let stepInstruction = ''
  let stepTargetSelector = ''
  let stepHighlightStyle: 'border' | 'spotlight' | 'pulse' = 'border'
  let totalSteps = 0
  let currentStepTitle = ''

  if (isFeatureWalkthrough && walkthrough) {
    totalSteps = walkthrough.steps.length
    const step = walkthrough.steps[tourStepIndex]
    if (step) {
      stepInstruction = step.instruction
      stepTargetSelector = step.targetSelector
      stepHighlightStyle = step.highlightStyle
      currentStepTitle = walkthrough.title
    }
  } else {
    // Basic app tour (legacy 10-step tour)
    totalSteps = TOUR_STEPS.length
    const step = TOUR_STEPS[tourStepIndex]
    if (step) {
      stepInstruction = t(step.tippyMessage, t(step.description, ''))
      stepTargetSelector = step.targetSelector
      stepHighlightStyle = 'border'
      currentStepTitle = t(step.title, step.id)
    }
  }

  const isLast = tourStepIndex >= totalSteps - 1
  const isFirst = tourStepIndex === 0

  // Narrate the current step whenever it changes
  useEffect(() => {
    if (!tourActive) return
    if (lastNarratedStep.current === tourStepIndex && lastWalkthroughId.current === activeWalkthroughId) return

    lastNarratedStep.current = tourStepIndex
    lastWalkthroughId.current = activeWalkthroughId

    // Ensure panel is open so user can read Tippy's narration
    open()

    const label = isFeatureWalkthrough
      ? `**${currentStepTitle} — Step ${tourStepIndex + 1} of ${totalSteps}**`
      : `**Step ${tourStepIndex + 1} of ${totalSteps}: ${currentStepTitle}**`

    addMessage({
      role: 'assistant',
      content: `${label}\n\n${stepInstruction}`
    })
  }, [tourActive, tourStepIndex, activeWalkthroughId, stepInstruction, currentStepTitle, totalSteps, isFeatureWalkthrough, addMessage, open])

  // Reset narration tracker when tour ends
  useEffect(() => {
    if (!tourActive) {
      lastNarratedStep.current = -1
      lastWalkthroughId.current = null
    }
  }, [tourActive])

  const handleNext = useCallback(() => {
    if (isLast) {
      endTour()
      const completionMsg = isFeatureWalkthrough
        ? `That covers the **${currentStepTitle}** walkthrough. If you have more questions, just ask!`
        : t('tippy.tourComplete', "That's the tour! You now know your way around Course Clip Studio. Feel free to ask me anything as you explore.")
      addMessage({ role: 'assistant', content: completionMsg })
    } else {
      nextTourStep()
    }
  }, [isLast, endTour, addMessage, nextTourStep, isFeatureWalkthrough, currentStepTitle, t])

  const handlePrev = useCallback(() => {
    if (!isFirst) prevTourStep()
  }, [isFirst, prevTourStep])

  const handleStop = useCallback(() => {
    endTour()
    addMessage({
      role: 'assistant',
      content: isFeatureWalkthrough
        ? `Walkthrough stopped. You can restart it anytime by asking about **${currentStepTitle}**.`
        : t('tippy.tourSkipped', 'No problem! The tour is always here if you want to pick it up later. Just ask me "Give me a tour" anytime.')
    })
  }, [endTour, addMessage, isFeatureWalkthrough, currentStepTitle, t])

  if (!tourActive || !stepTargetSelector) return null

  return (
    <TippyHighlight
      targetSelector={stepTargetSelector}
      instruction={stepInstruction}
      highlightStyle={stepHighlightStyle}
      stepNumber={tourStepIndex + 1}
      totalSteps={totalSteps}
      onNext={handleNext}
      onPrev={handlePrev}
      onStop={handleStop}
      hasPrev={!isFirst}
      hasNext={!isLast}
    />
  )
}
