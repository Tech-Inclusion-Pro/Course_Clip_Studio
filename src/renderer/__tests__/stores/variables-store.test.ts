import { describe, it, expect, beforeEach } from 'vitest'
import { useVariablesStore } from '@/stores/variables-store'
import type { Variable } from '@/types/trigger-model'

function makeVar(overrides: Partial<Variable> = {}): Variable {
  return {
    id: 'var-1',
    name: 'score',
    type: 'number',
    scope: 'course',
    defaultValue: 0,
    description: '',
    system: false,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides
  }
}

describe('useVariablesStore', () => {
  beforeEach(() => {
    useVariablesStore.getState().resetAll()
    useVariablesStore.setState({ values: {}, lastChangedAt: {}, definitions: [] })
  })

  describe('initFromCourse', () => {
    it('initializes values from variable definitions', () => {
      const vars = [
        makeVar({ id: 'v1', defaultValue: 10 }),
        makeVar({ id: 'v2', type: 'boolean', defaultValue: true }),
        makeVar({ id: 'v3', type: 'text', defaultValue: 'hello' })
      ]
      useVariablesStore.getState().initFromCourse(vars)

      expect(useVariablesStore.getState().getValue('v1')).toBe(10)
      expect(useVariablesStore.getState().getValue('v2')).toBe(true)
      expect(useVariablesStore.getState().getValue('v3')).toBe('hello')
    })

    it('clears lastChangedAt on init', () => {
      useVariablesStore.getState().initFromCourse([makeVar({ id: 'v1', defaultValue: 0 })])
      useVariablesStore.getState().setValue('v1', 5)
      expect(useVariablesStore.getState().lastChangedAt['v1']).toBeDefined()

      useVariablesStore.getState().initFromCourse([makeVar({ id: 'v1', defaultValue: 0 })])
      expect(useVariablesStore.getState().lastChangedAt['v1']).toBeUndefined()
    })
  })

  describe('getValue', () => {
    it('returns undefined for unknown variable', () => {
      expect(useVariablesStore.getState().getValue('nonexistent')).toBeUndefined()
    })
  })

  describe('setValue', () => {
    it('sets a variable value and records timestamp', () => {
      useVariablesStore.getState().initFromCourse([makeVar({ id: 'v1', defaultValue: 0 })])
      useVariablesStore.getState().setValue('v1', 42)

      expect(useVariablesStore.getState().getValue('v1')).toBe(42)
      expect(useVariablesStore.getState().lastChangedAt['v1']).toBeDefined()
    })
  })

  describe('adjustValue', () => {
    it('increments a number variable', () => {
      useVariablesStore.getState().initFromCourse([makeVar({ id: 'v1', defaultValue: 10 })])
      useVariablesStore.getState().adjustValue('v1', 'increment', 5)
      expect(useVariablesStore.getState().getValue('v1')).toBe(15)
    })

    it('decrements a number variable', () => {
      useVariablesStore.getState().initFromCourse([makeVar({ id: 'v1', defaultValue: 10 })])
      useVariablesStore.getState().adjustValue('v1', 'decrement', 3)
      expect(useVariablesStore.getState().getValue('v1')).toBe(7)
    })

    it('appends to a string variable', () => {
      useVariablesStore.getState().initFromCourse([makeVar({ id: 'v1', type: 'text', defaultValue: 'hello' })])
      useVariablesStore.getState().adjustValue('v1', 'append', ' world')
      expect(useVariablesStore.getState().getValue('v1')).toBe('hello world')
    })

    it('does nothing for unknown variable', () => {
      useVariablesStore.getState().adjustValue('unknown', 'increment', 1)
      expect(useVariablesStore.getState().getValue('unknown')).toBeUndefined()
    })
  })

  describe('resetAll', () => {
    it('resets all values to defaults', () => {
      useVariablesStore.getState().initFromCourse([
        makeVar({ id: 'v1', defaultValue: 0 }),
        makeVar({ id: 'v2', type: 'text', defaultValue: '' })
      ])
      useVariablesStore.getState().setValue('v1', 99)
      useVariablesStore.getState().setValue('v2', 'changed')

      useVariablesStore.getState().resetAll()
      expect(useVariablesStore.getState().getValue('v1')).toBe(0)
      expect(useVariablesStore.getState().getValue('v2')).toBe('')
    })
  })

  describe('resetForLesson', () => {
    it('resets only lesson-scoped variables for the given lesson', () => {
      useVariablesStore.getState().initFromCourse([
        makeVar({ id: 'v1', scope: 'course', defaultValue: 0 }),
        makeVar({ id: 'v2', scope: 'lesson', scopeId: 'les-1', defaultValue: 0 }),
        makeVar({ id: 'v3', scope: 'lesson', scopeId: 'les-2', defaultValue: 0 })
      ])
      useVariablesStore.getState().setValue('v1', 10)
      useVariablesStore.getState().setValue('v2', 20)
      useVariablesStore.getState().setValue('v3', 30)

      useVariablesStore.getState().resetForLesson('les-1')

      expect(useVariablesStore.getState().getValue('v1')).toBe(10)
      expect(useVariablesStore.getState().getValue('v2')).toBe(0)
      expect(useVariablesStore.getState().getValue('v3')).toBe(30)
    })
  })
})
