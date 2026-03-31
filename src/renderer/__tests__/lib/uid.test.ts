import { describe, it, expect } from 'vitest'
import { uid } from '@/lib/uid'

describe('uid', () => {
  it('returns a string', () => {
    const id = uid()
    expect(typeof id).toBe('string')
  })

  it('starts with the default "id" prefix', () => {
    const id = uid()
    expect(id).toMatch(/^id-/)
  })

  it('starts with a custom prefix when provided', () => {
    const id = uid('block')
    expect(id).toMatch(/^block-/)
  })

  it('generates unique values on successive calls', () => {
    const id1 = uid()
    const id2 = uid()
    const id3 = uid()
    expect(id1).not.toBe(id2)
    expect(id2).not.toBe(id3)
    expect(id1).not.toBe(id3)
  })

  it('includes a timestamp component', () => {
    const id = uid('test')
    // Format: prefix-timestamp-counter-random
    const parts = id.split('-')
    expect(parts.length).toBeGreaterThanOrEqual(4)
    const timestamp = parseInt(parts[1], 10)
    expect(timestamp).toBeGreaterThan(0)
    expect(timestamp).toBeLessThanOrEqual(Date.now())
  })

  it('generates many unique values without collisions', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 1000; i++) {
      ids.add(uid('item'))
    }
    expect(ids.size).toBe(1000)
  })
})
