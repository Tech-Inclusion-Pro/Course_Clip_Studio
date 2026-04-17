import { describe, it, expect, vi } from 'vitest'
import { TriggerEventBus } from '@/lib/triggers/events'

describe('TriggerEventBus', () => {
  it('delivers events to subscribers', () => {
    const bus = new TriggerEventBus()
    const listener = vi.fn()

    bus.subscribe('on_click', listener)
    bus.publish('on_click', { blockId: 'b1' }, { blockId: 'b1', courseId: 'c1' })

    expect(listener).toHaveBeenCalledOnce()
    expect(listener).toHaveBeenCalledWith('on_click', { blockId: 'b1' }, { blockId: 'b1', courseId: 'c1' })
  })

  it('does not deliver events to unsubscribed listeners', () => {
    const bus = new TriggerEventBus()
    const listener = vi.fn()

    const unsub = bus.subscribe('on_click', listener)
    unsub()
    bus.publish('on_click', {}, {})

    expect(listener).not.toHaveBeenCalled()
  })

  it('delivers events only for the subscribed event type', () => {
    const bus = new TriggerEventBus()
    const clickListener = vi.fn()
    const loadListener = vi.fn()

    bus.subscribe('on_click', clickListener)
    bus.subscribe('on_block_load', loadListener)

    bus.publish('on_click', {}, {})

    expect(clickListener).toHaveBeenCalledOnce()
    expect(loadListener).not.toHaveBeenCalled()
  })

  it('supports multiple listeners for the same event', () => {
    const bus = new TriggerEventBus()
    const listener1 = vi.fn()
    const listener2 = vi.fn()

    bus.subscribe('on_click', listener1)
    bus.subscribe('on_click', listener2)
    bus.publish('on_click', {}, {})

    expect(listener1).toHaveBeenCalledOnce()
    expect(listener2).toHaveBeenCalledOnce()
  })

  it('clear removes all listeners', () => {
    const bus = new TriggerEventBus()
    const listener = vi.fn()

    bus.subscribe('on_click', listener)
    bus.subscribe('on_block_load', listener)
    bus.clear()
    bus.publish('on_click', {}, {})
    bus.publish('on_block_load', {}, {})

    expect(listener).not.toHaveBeenCalled()
  })

  it('does not throw if listener throws', () => {
    const bus = new TriggerEventBus()
    const badListener = vi.fn(() => { throw new Error('boom') })
    const goodListener = vi.fn()

    bus.subscribe('on_click', badListener)
    bus.subscribe('on_click', goodListener)

    expect(() => bus.publish('on_click', {}, {})).not.toThrow()
    expect(goodListener).toHaveBeenCalledOnce()
  })
})
