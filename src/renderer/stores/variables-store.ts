import { create } from 'zustand'
import type { Variable } from '@/types/trigger-model'

interface VariablesState {
  values: Record<string, boolean | number | string>
  lastChangedAt: Record<string, string>
  definitions: Variable[]

  // Actions
  initFromCourse: (variables: Variable[]) => void
  getValue: (id: string) => boolean | number | string | undefined
  setValue: (id: string, value: boolean | number | string) => void
  adjustValue: (id: string, op: 'increment' | 'decrement' | 'append', amount: number | string) => void
  resetAll: () => void
  resetForLesson: (lessonId: string) => void
}

const initialState = {
  values: {} as Record<string, boolean | number | string>,
  lastChangedAt: {} as Record<string, string>,
  definitions: [] as Variable[]
}

export const useVariablesStore = create<VariablesState>((set, get) => ({
  ...initialState,

  initFromCourse: (variables) => {
    const values: Record<string, boolean | number | string> = {}
    for (const v of variables) {
      values[v.id] = v.defaultValue
    }
    set({ values, definitions: variables, lastChangedAt: {} })
  },

  getValue: (id) => {
    return get().values[id]
  },

  setValue: (id, value) => {
    const now = new Date().toISOString()
    set((s) => ({
      values: { ...s.values, [id]: value },
      lastChangedAt: { ...s.lastChangedAt, [id]: now }
    }))
  },

  adjustValue: (id, op, amount) => {
    const current = get().values[id]
    if (current === undefined) return

    let newValue: boolean | number | string = current
    if (op === 'increment' && typeof current === 'number' && typeof amount === 'number') {
      newValue = current + amount
    } else if (op === 'decrement' && typeof current === 'number' && typeof amount === 'number') {
      newValue = current - amount
    } else if (op === 'append' && typeof current === 'string' && typeof amount === 'string') {
      newValue = current + amount
    }

    const now = new Date().toISOString()
    set((s) => ({
      values: { ...s.values, [id]: newValue },
      lastChangedAt: { ...s.lastChangedAt, [id]: now }
    }))
  },

  resetAll: () => {
    const { definitions } = get()
    const values: Record<string, boolean | number | string> = {}
    for (const v of definitions) {
      values[v.id] = v.defaultValue
    }
    set({ values, lastChangedAt: {} })
  },

  resetForLesson: (lessonId) => {
    const { definitions, values } = get()
    const lessonVars = definitions.filter(
      (v) => v.scope === 'lesson' && v.scopeId === lessonId
    )
    if (lessonVars.length === 0) return

    const updated = { ...values }
    for (const v of lessonVars) {
      updated[v.id] = v.defaultValue
    }
    set({ values: updated })
  }
}))
