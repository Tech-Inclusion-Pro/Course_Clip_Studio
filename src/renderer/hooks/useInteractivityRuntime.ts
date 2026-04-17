import { useEffect, useRef, useCallback } from 'react'
import type { Course } from '@/types/course'
import type { TriggerEvent, EventParams } from '@/types/trigger-model'
import type { ScopeContext } from '@/lib/triggers/events'
import { TriggerEventBus } from '@/lib/triggers/events'
import { TriggerRuntime } from '@/lib/triggers/runtime'
import { useVariablesStore } from '@/stores/variables-store'

// Ensure all action executors are registered
import '@/lib/triggers/actions'

interface InteractivityRuntimeResult {
  emit: (event: TriggerEvent, params: EventParams, scope: ScopeContext) => void
  politeRegionRef: React.RefObject<HTMLDivElement | null>
  assertiveRegionRef: React.RefObject<HTMLDivElement | null>
}

export function useInteractivityRuntime(course: Course | undefined): InteractivityRuntimeResult {
  const busRef = useRef<TriggerEventBus | null>(null)
  const runtimeRef = useRef<TriggerRuntime | null>(null)

  // Live region refs - returned to caller for DOM attachment
  const politeRegionRef = useRef<HTMLDivElement | null>(null)
  const assertiveRegionRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!course?.interactivity) return

    const { variables, triggers } = course.interactivity

    // Reset before init to prevent stale state from previous course
    useVariablesStore.getState().resetAll()

    // Initialize variables store
    useVariablesStore.getState().initFromCourse(variables)

    // Create event bus
    const bus = new TriggerEventBus()
    busRef.current = bus

    // Create runtime with deps
    const runtime = new TriggerRuntime(
      triggers,
      bus,
      (id) => useVariablesStore.getState().getValue(id),
      {
        navigateToLesson: (lessonId) => {
          // Fire a postMessage to the preview iframe
          window.postMessage({ type: 'lumina:trigger-nav', lessonId }, '*')
        },
        setVariable: (id, value) => {
          useVariablesStore.getState().setValue(id, value)
          // Fire on_variable_change event
          bus.publish('on_variable_change', { variableId: id }, { courseId: course.id })
        },
        adjustVariable: (id, op, amount) => {
          useVariablesStore.getState().adjustValue(id, op, amount)
          bus.publish('on_variable_change', { variableId: id }, { courseId: course.id })
        },
        setBlockVisibility: (blockId, visible) => {
          window.postMessage({ type: 'lumina:block-visibility', blockId, visible }, '*')
        },
        announcePolite: (message) => {
          if (politeRegionRef.current) {
            politeRegionRef.current.textContent = message
          }
        },
        announceAssertive: (message) => {
          if (assertiveRegionRef.current) {
            assertiveRegionRef.current.textContent = message
          }
        }
      }
    )

    runtime.start()
    runtimeRef.current = runtime

    return () => {
      runtime.stop()
      bus.clear()
      useVariablesStore.getState().resetAll()
      busRef.current = null
      runtimeRef.current = null
    }
  }, [course])

  const emit = useCallback(
    (event: TriggerEvent, params: EventParams, scope: ScopeContext) => {
      busRef.current?.publish(event, params, scope)
    },
    []
  )

  return { emit, politeRegionRef, assertiveRegionRef }
}
