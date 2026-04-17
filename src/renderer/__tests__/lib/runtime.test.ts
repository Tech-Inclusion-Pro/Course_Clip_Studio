import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TriggerRuntime } from '@/lib/triggers/runtime'
import { TriggerEventBus } from '@/lib/triggers/events'
import type { Trigger } from '@/types/trigger-model'
import type { ActionDeps } from '@/lib/triggers/actions/types'

// Import to register executors
import '@/lib/triggers/actions'

function makeTrigger(overrides: Partial<Trigger> = {}): Trigger {
  return {
    id: 'trig-1',
    name: 'Test Trigger',
    description: '',
    event: 'on_click',
    eventParams: { blockId: 'b1' },
    actions: [{ id: 'act-1', type: 'set_variable', params: { variableId: 'v1', value: true } }],
    scope: 'block',
    scopeId: 'b1',
    enabled: true,
    executionOrder: 0,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides
  }
}

function makeDeps(): ActionDeps {
  return {
    navigateToLesson: vi.fn(),
    setVariable: vi.fn(),
    adjustVariable: vi.fn(),
    setBlockVisibility: vi.fn(),
    announcePolite: vi.fn(),
    announceAssertive: vi.fn()
  }
}

describe('TriggerRuntime', () => {
  let bus: TriggerEventBus
  let deps: ActionDeps
  let values: Record<string, boolean | number | string>

  beforeEach(() => {
    bus = new TriggerEventBus()
    deps = makeDeps()
    values = { v1: false, v2: 0 }
  })

  it('fires actions when event matches and conditions pass', () => {
    const trigger = makeTrigger()
    const runtime = new TriggerRuntime([trigger], bus, (id) => values[id], deps)
    runtime.start()

    bus.publish('on_click', { blockId: 'b1' }, { blockId: 'b1', courseId: 'c1' })

    expect(deps.setVariable).toHaveBeenCalledWith('v1', true)
    runtime.stop()
  })

  it('skips trigger when conditions fail', () => {
    const trigger = makeTrigger({
      conditions: {
        logic: 'and',
        conditions: [
          { id: 'c1', sourceType: 'variable', sourceId: 'v2', operator: 'gt', value: 100 }
        ]
      }
    })
    const runtime = new TriggerRuntime([trigger], bus, (id) => values[id], deps)
    runtime.start()

    bus.publish('on_click', { blockId: 'b1' }, { blockId: 'b1', courseId: 'c1' })

    expect(deps.setVariable).not.toHaveBeenCalled()
    runtime.stop()
  })

  it('skips disabled triggers', () => {
    const trigger = makeTrigger({ enabled: false })
    const runtime = new TriggerRuntime([trigger], bus, (id) => values[id], deps)
    runtime.start()

    bus.publish('on_click', { blockId: 'b1' }, { blockId: 'b1', courseId: 'c1' })

    expect(deps.setVariable).not.toHaveBeenCalled()
    runtime.stop()
  })

  it('skips triggers that do not match scope', () => {
    const trigger = makeTrigger({ scope: 'block', scopeId: 'other-block' })
    const runtime = new TriggerRuntime([trigger], bus, (id) => values[id], deps)
    runtime.start()

    bus.publish('on_click', { blockId: 'b1' }, { blockId: 'b1', courseId: 'c1' })

    expect(deps.setVariable).not.toHaveBeenCalled()
    runtime.stop()
  })

  it('executes multiple matching triggers', () => {
    const trigger1 = makeTrigger({ id: 'trig-1', executionOrder: 0 })
    const trigger2 = makeTrigger({
      id: 'trig-2',
      executionOrder: 1,
      actions: [{ id: 'act-2', type: 'announce', params: { message: 'hello' } }]
    })
    const runtime = new TriggerRuntime([trigger1, trigger2], bus, (id) => values[id], deps)
    runtime.start()

    bus.publish('on_click', { blockId: 'b1' }, { blockId: 'b1', courseId: 'c1' })

    expect(deps.setVariable).toHaveBeenCalledOnce()
    expect(deps.announcePolite).toHaveBeenCalledWith('hello')
    runtime.stop()
  })

  it('does not fire after stop()', () => {
    const trigger = makeTrigger()
    const runtime = new TriggerRuntime([trigger], bus, (id) => values[id], deps)
    runtime.start()
    runtime.stop()

    bus.publish('on_click', { blockId: 'b1' }, { blockId: 'b1', courseId: 'c1' })

    expect(deps.setVariable).not.toHaveBeenCalled()
  })

  it('caps recursion depth', () => {
    // Create a trigger that fires on_variable_change and sets a variable (causing re-entry)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    let callCount = 0

    const reentrantDeps: ActionDeps = {
      ...deps,
      setVariable: vi.fn((_id, _val) => {
        callCount++
        // Simulate re-entry by publishing on_variable_change
        if (callCount < 20) {
          bus.publish('on_variable_change', { variableId: 'v1' }, { courseId: 'c1' })
        }
      })
    }

    const trigger = makeTrigger({
      event: 'on_variable_change',
      eventParams: { variableId: 'v1' },
      scope: 'course',
      scopeId: 'c1'
    })

    const runtime = new TriggerRuntime([trigger], bus, (id) => values[id], reentrantDeps)
    runtime.start()

    bus.publish('on_variable_change', { variableId: 'v1' }, { courseId: 'c1' })

    // Should have been called some number of times but capped at ~10 depth
    expect(callCount).toBeLessThanOrEqual(11)
    expect(consoleSpy).toHaveBeenCalled()

    consoleSpy.mockRestore()
    runtime.stop()
  })
})
