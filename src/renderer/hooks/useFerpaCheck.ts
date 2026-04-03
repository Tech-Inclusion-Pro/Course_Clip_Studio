import { useState, useCallback } from 'react'
import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import type { FerpaFeature } from '@/types/course'

/**
 * Returns true when the current AI provider is a cloud service
 * that sends data externally (Anthropic or OpenAI).
 * Ollama runs locally and is FERPA-safe.
 */
export function isCloudProvider(provider: string | null): provider is 'anthropic' | 'openai' {
  return provider === 'anthropic' || provider === 'openai'
}

interface UseFerpaCheckReturn {
  /** Call before performing an AI action. Returns true if the action can proceed. */
  checkFerpa: () => boolean
  /** Whether the FERPA modal should be shown right now */
  showModal: boolean
  /** The cloud provider name (for display in modal) */
  cloudProvider: 'anthropic' | 'openai'
  /** Call when user clicks "I Acknowledge" */
  acknowledge: () => void
  /** Call when user clicks "Cancel" */
  cancel: () => void
}

/**
 * Hook to gate AI actions behind FERPA acknowledgment.
 *
 * Usage:
 *   const ferpa = useFerpaCheck('quiz-ai-generate')
 *   function handleAI() {
 *     if (!ferpa.checkFerpa()) return  // shows modal if needed
 *     doAIThing()
 *   }
 *   // Render <FerpaWarningModal ... onAcknowledge={ferpa.acknowledge} />
 *
 * When acknowledged, stores the acknowledgment in course settings.
 * Re-prompts if the provider changes to a different cloud service.
 */
export function useFerpaCheck(
  feature: FerpaFeature,
  onProceed?: () => void
): UseFerpaCheckReturn {
  const [showModal, setShowModal] = useState(false)

  const provider = useAppStore((s) => s.ai.provider)
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const courses = useCourseStore((s) => s.courses)
  const updateCourseSettings = useCourseStore((s) => s.updateCourseSettings)

  const course = courses.find((c) => c.id === activeCourseId)
  const acks = course?.settings?.ferpaAcknowledgments

  const cloudProvider = isCloudProvider(provider) ? provider : 'anthropic'

  const needsAcknowledgment = useCallback((): boolean => {
    if (!isCloudProvider(provider)) return false
    if (!acks?.[feature]) return true
    // Re-prompt if provider changed since last acknowledgment
    if (acks[feature]!.provider !== provider) return true
    return false
  }, [provider, acks, feature])

  const checkFerpa = useCallback((): boolean => {
    if (!needsAcknowledgment()) return true
    setShowModal(true)
    return false
  }, [needsAcknowledgment])

  const acknowledge = useCallback(() => {
    if (!activeCourseId || !isCloudProvider(provider)) return
    const existing = course?.settings?.ferpaAcknowledgments ?? {}
    updateCourseSettings(activeCourseId, {
      ferpaAcknowledgments: {
        ...existing,
        [feature]: {
          acknowledgedAt: new Date().toISOString(),
          provider
        }
      }
    })
    setShowModal(false)
    onProceed?.()
  }, [activeCourseId, provider, course, feature, updateCourseSettings, onProceed])

  const cancel = useCallback(() => {
    setShowModal(false)
  }, [])

  return {
    checkFerpa,
    showModal,
    cloudProvider,
    acknowledge,
    cancel
  }
}
