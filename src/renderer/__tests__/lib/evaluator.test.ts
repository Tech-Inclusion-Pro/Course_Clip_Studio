import { describe, it, expect } from 'vitest'
import { evaluateCondition, evaluateConditions } from '@/lib/triggers/evaluator'
import type { EvaluationContext } from '@/lib/triggers/evaluator'
import type { Condition, ConditionGroup } from '@/types/trigger-model'

function makeCond(overrides: Partial<Condition> = {}): Condition {
  return {
    id: 'cond-1',
    sourceType: 'variable',
    sourceId: 'v1',
    operator: 'eq',
    value: 0,
    ...overrides
  }
}

function makeContext(values: Record<string, boolean | number | string>): EvaluationContext {
  return {
    getValue: (id) => values[id]
  }
}

describe('evaluateCondition', () => {
  // ─── Number Comparisons ───
  describe('number comparisons', () => {
    it('eq: true when equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'eq', value: 10 }), makeContext({ v1: 10 }))
      expect(result).toBe(true)
    })

    it('eq: false when not equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'eq', value: 10 }), makeContext({ v1: 5 }))
      expect(result).toBe(false)
    })

    it('neq: true when not equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'neq', value: 10 }), makeContext({ v1: 5 }))
      expect(result).toBe(true)
    })

    it('gt: true when greater', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'gt', value: 5 }), makeContext({ v1: 10 }))
      expect(result).toBe(true)
    })

    it('gt: false when equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'gt', value: 5 }), makeContext({ v1: 5 }))
      expect(result).toBe(false)
    })

    it('gte: true when equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'gte', value: 5 }), makeContext({ v1: 5 }))
      expect(result).toBe(true)
    })

    it('lt: true when less', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'lt', value: 10 }), makeContext({ v1: 5 }))
      expect(result).toBe(true)
    })

    it('lte: true when equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'lte', value: 5 }), makeContext({ v1: 5 }))
      expect(result).toBe(true)
    })
  })

  // ─── String Comparisons ───
  describe('string comparisons', () => {
    it('eq: true when equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'eq', value: 'hello' }), makeContext({ v1: 'hello' }))
      expect(result).toBe(true)
    })

    it('neq: true when not equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'neq', value: 'hello' }), makeContext({ v1: 'world' }))
      expect(result).toBe(true)
    })

    it('contains: true when substring found', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'contains', value: 'ell' }), makeContext({ v1: 'hello' }))
      expect(result).toBe(true)
    })

    it('contains: false when not found', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'contains', value: 'xyz' }), makeContext({ v1: 'hello' }))
      expect(result).toBe(false)
    })

    it('starts_with: true', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'starts_with', value: 'he' }), makeContext({ v1: 'hello' }))
      expect(result).toBe(true)
    })

    it('ends_with: true', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'ends_with', value: 'lo' }), makeContext({ v1: 'hello' }))
      expect(result).toBe(true)
    })

    it('is_empty: true for empty string', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'is_empty', value: '' }), makeContext({ v1: '' }))
      expect(result).toBe(true)
    })

    it('is_empty: false for non-empty string', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'is_empty', value: '' }), makeContext({ v1: 'hi' }))
      expect(result).toBe(false)
    })

    it('is_not_empty: true for non-empty string', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'is_not_empty', value: '' }), makeContext({ v1: 'hi' }))
      expect(result).toBe(true)
    })
  })

  // ─── Boolean Comparisons ───
  describe('boolean comparisons', () => {
    it('eq: true when equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'eq', value: true }), makeContext({ v1: true }))
      expect(result).toBe(true)
    })

    it('neq: true when not equal', () => {
      const { result } = evaluateCondition(makeCond({ operator: 'neq', value: true }), makeContext({ v1: false }))
      expect(result).toBe(true)
    })
  })

  // ─── Missing Variable ───
  describe('missing variable', () => {
    it('returns false with warning when variable not found', () => {
      const { result, trace } = evaluateCondition(makeCond({ sourceId: 'missing' }), makeContext({}))
      expect(result).toBe(false)
      expect(trace.warning).toContain('not found')
    })
  })

  // ─── Type Mismatch ───
  describe('type mismatch', () => {
    it('returns false with warning when types differ', () => {
      const { result, trace } = evaluateCondition(makeCond({ operator: 'eq', value: 'text' }), makeContext({ v1: 42 }))
      expect(result).toBe(false)
      expect(trace.warning).toContain('Type mismatch')
    })
  })

  // ─── Non-variable source ───
  describe('non-variable source', () => {
    it('returns false with warning for block_state source', () => {
      const { result, trace } = evaluateCondition(
        makeCond({ sourceType: 'block_state' }),
        makeContext({})
      )
      expect(result).toBe(false)
      expect(trace.warning).toContain('not implemented')
    })
  })
})

describe('evaluateConditions', () => {
  it('returns true for undefined group', () => {
    const { result } = evaluateConditions(undefined, makeContext({}))
    expect(result).toBe(true)
  })

  it('returns true for empty conditions array', () => {
    const group: ConditionGroup = { logic: 'and', conditions: [] }
    const { result } = evaluateConditions(group, makeContext({}))
    expect(result).toBe(true)
  })

  describe('AND logic', () => {
    it('returns true when all conditions pass', () => {
      const group: ConditionGroup = {
        logic: 'and',
        conditions: [
          makeCond({ id: 'c1', sourceId: 'v1', operator: 'gt', value: 0 }),
          makeCond({ id: 'c2', sourceId: 'v2', operator: 'eq', value: true })
        ]
      }
      const { result } = evaluateConditions(group, makeContext({ v1: 5, v2: true }))
      expect(result).toBe(true)
    })

    it('returns false and short-circuits on first false', () => {
      const group: ConditionGroup = {
        logic: 'and',
        conditions: [
          makeCond({ id: 'c1', sourceId: 'v1', operator: 'gt', value: 100 }),
          makeCond({ id: 'c2', sourceId: 'v2', operator: 'eq', value: true })
        ]
      }
      const { result, trace } = evaluateConditions(group, makeContext({ v1: 5, v2: true }))
      expect(result).toBe(false)
      expect(trace.conditions).toHaveLength(1) // short-circuited
    })
  })

  describe('OR logic', () => {
    it('returns true and short-circuits on first true', () => {
      const group: ConditionGroup = {
        logic: 'or',
        conditions: [
          makeCond({ id: 'c1', sourceId: 'v1', operator: 'eq', value: 5 }),
          makeCond({ id: 'c2', sourceId: 'v2', operator: 'eq', value: true })
        ]
      }
      const { result, trace } = evaluateConditions(group, makeContext({ v1: 5, v2: false }))
      expect(result).toBe(true)
      expect(trace.conditions).toHaveLength(1) // short-circuited
    })

    it('returns false when all conditions fail', () => {
      const group: ConditionGroup = {
        logic: 'or',
        conditions: [
          makeCond({ id: 'c1', sourceId: 'v1', operator: 'eq', value: 99 }),
          makeCond({ id: 'c2', sourceId: 'v2', operator: 'eq', value: true })
        ]
      }
      const { result } = evaluateConditions(group, makeContext({ v1: 5, v2: false }))
      expect(result).toBe(false)
    })
  })
})
