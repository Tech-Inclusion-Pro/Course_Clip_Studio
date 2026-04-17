import type { Trigger, TriggerEvent, EventParams } from '@/types/trigger-model'
import type { ScopeContext } from './events'
import type { ActionDeps } from './actions/types'
import { TriggerEventBus } from './events'
import { evaluateConditions } from './evaluator'
import type { EvaluationContext } from './evaluator'
import { executeAction } from './actions'

const MAX_RECURSION_DEPTH = 10

export class TriggerRuntime {
  private triggers: Trigger[]
  private bus: TriggerEventBus
  private getVariableValue: (id: string) => boolean | number | string | undefined
  private deps: ActionDeps
  private unsubscribers: (() => void)[] = []
  private recursionDepth = 0

  constructor(
    triggers: Trigger[],
    bus: TriggerEventBus,
    getVariableValue: (id: string) => boolean | number | string | undefined,
    deps: ActionDeps
  ) {
    this.triggers = triggers
    this.bus = bus
    this.getVariableValue = getVariableValue
    this.deps = deps
  }

  start(): void {
    const eventTypes: TriggerEvent[] = [
      'on_block_load',
      'on_block_complete',
      'on_click',
      'on_answer_submit',
      'on_lesson_start',
      'on_lesson_complete',
      'on_course_start',
      'on_course_complete',
      'on_variable_change',
      'on_timer'
    ]

    for (const eventType of eventTypes) {
      const unsub = this.bus.subscribe(eventType, (event, params, scope) => {
        this.handleEvent(event, params, scope)
      })
      this.unsubscribers.push(unsub)
    }
  }

  stop(): void {
    for (const unsub of this.unsubscribers) {
      unsub()
    }
    this.unsubscribers = []
  }

  private handleEvent(event: TriggerEvent, _params: EventParams, scope: ScopeContext): void {
    if (this.recursionDepth >= MAX_RECURSION_DEPTH) {
      console.error(`[TriggerRuntime] Max recursion depth (${MAX_RECURSION_DEPTH}) reached. Skipping.`)
      return
    }

    // Find matching triggers
    const matching = this.triggers
      .filter((t) => t.enabled && t.event === event)
      .filter((t) => this.matchesScope(t, scope))
      .sort((a, b) => {
        // Scope priority: block > lesson > module > course
        const scopeOrder: Record<string, number> = { block: 0, lesson: 1, module: 2, course: 3 }
        const scopeDiff = (scopeOrder[a.scope] ?? 3) - (scopeOrder[b.scope] ?? 3)
        if (scopeDiff !== 0) return scopeDiff
        // Then by executionOrder asc
        const orderDiff = a.executionOrder - b.executionOrder
        if (orderDiff !== 0) return orderDiff
        // Then by createdAt asc
        return a.createdAt.localeCompare(b.createdAt)
      })

    const context: EvaluationContext = {
      getValue: this.getVariableValue
    }

    this.recursionDepth++
    try {
      for (const trigger of matching) {
        const { result } = evaluateConditions(trigger.conditions, context)
        if (!result) continue

        for (const action of trigger.actions) {
          try {
            executeAction(action.type, action.params, this.deps)
          } catch (err) {
            console.error(`[TriggerRuntime] Action "${action.type}" on trigger "${trigger.id}" failed:`, err)
          }
        }
      }
    } finally {
      this.recursionDepth--
    }
  }

  private matchesScope(trigger: Trigger, scope: ScopeContext): boolean {
    switch (trigger.scope) {
      case 'block':
        return trigger.scopeId === scope.blockId
      case 'lesson':
        return trigger.scopeId === scope.lessonId
      case 'module':
        return trigger.scopeId === scope.moduleId
      case 'course':
        return trigger.scopeId === scope.courseId
      default:
        return false
    }
  }
}
