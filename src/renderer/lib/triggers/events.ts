import type { TriggerEvent, EventParams } from '@/types/trigger-model'

export interface ScopeContext {
  blockId?: string
  lessonId?: string
  moduleId?: string
  courseId?: string
}

export type EventListener = (
  event: TriggerEvent,
  params: EventParams,
  scope: ScopeContext
) => void

export class TriggerEventBus {
  private listeners = new Map<TriggerEvent, Set<EventListener>>()

  subscribe(event: TriggerEvent, listener: EventListener): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)

    return () => {
      const set = this.listeners.get(event)
      if (set) {
        set.delete(listener)
        if (set.size === 0) this.listeners.delete(event)
      }
    }
  }

  publish(event: TriggerEvent, params: EventParams, scope: ScopeContext): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const listener of set) {
      try {
        listener(event, params, scope)
      } catch (err) {
        console.error(`[TriggerEventBus] Error in listener for "${event}":`, err)
      }
    }
  }

  clear(): void {
    this.listeners.clear()
  }
}
