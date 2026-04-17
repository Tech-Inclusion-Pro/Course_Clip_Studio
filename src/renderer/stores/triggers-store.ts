import { create } from 'zustand'
import { uid } from '@/lib/uid'
import { useCourseStore } from './useCourseStore'
import type { Variable, Trigger, ProgressionSettings, InteractivityConfig } from '@/types/trigger-model'
import { INTERACTIVITY_SCHEMA_VERSION } from '@/types/trigger-model'
import { DEFAULT_PROGRESSION_SETTINGS } from '@/lib/triggers/defaults'

interface TriggersStoreState {
  // Variable CRUD
  addVariable: (courseId: string, variable: Omit<Variable, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateVariable: (courseId: string, variableId: string, partial: Partial<Variable>) => void
  removeVariable: (courseId: string, variableId: string) => void

  // Trigger CRUD
  addTrigger: (courseId: string, trigger: Omit<Trigger, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateTrigger: (courseId: string, triggerId: string, partial: Partial<Trigger>) => void
  removeTrigger: (courseId: string, triggerId: string) => void
  duplicateTrigger: (courseId: string, triggerId: string) => string | null
  toggleTrigger: (courseId: string, triggerId: string) => void

  // Progression
  updateProgression: (courseId: string, settings: Partial<ProgressionSettings>) => void

  // Queries
  getTriggersForBlock: (courseId: string, blockId: string) => Trigger[]
  getVariables: (courseId: string) => Variable[]
  getTriggersForScope: (courseId: string, scope: string, scopeId: string) => Trigger[]
  getInteractivity: (courseId: string) => InteractivityConfig
}

function getConfig(courseId: string): InteractivityConfig {
  const course = useCourseStore.getState().courses.find((c) => c.id === courseId)
  return course?.interactivity ?? {
    schemaVersion: INTERACTIVITY_SCHEMA_VERSION,
    variables: [],
    triggers: [],
    progression: { ...DEFAULT_PROGRESSION_SETTINGS }
  }
}

function updateConfig(courseId: string, config: InteractivityConfig): void {
  useCourseStore.getState().updateCourse(courseId, { interactivity: config })
}

export const useTriggersStore = create<TriggersStoreState>(() => ({
  // ─── Variable CRUD ───

  addVariable: (courseId, variable) => {
    const config = getConfig(courseId)
    const now = new Date().toISOString()
    const id = uid('var')
    const newVar: Variable = {
      ...variable,
      id,
      createdAt: now,
      updatedAt: now
    }
    updateConfig(courseId, {
      ...config,
      variables: [...config.variables, newVar]
    })
    return id
  },

  updateVariable: (courseId, variableId, partial) => {
    const config = getConfig(courseId)
    updateConfig(courseId, {
      ...config,
      variables: config.variables.map((v) =>
        v.id === variableId ? { ...v, ...partial, updatedAt: new Date().toISOString() } : v
      )
    })
  },

  removeVariable: (courseId, variableId) => {
    const config = getConfig(courseId)
    // Remove the variable
    const updatedVariables = config.variables.filter((v) => v.id !== variableId)
    // Cascading cleanup: remove conditions and actions referencing this variable
    const updatedTriggers = config.triggers.map((t) => {
      // Clean up conditions that reference this variable
      const cleanedConditions = t.conditions
        ? {
            ...t.conditions,
            conditions: t.conditions.conditions.filter(
              (c) => !(c.sourceType === 'variable' && c.sourceId === variableId)
            )
          }
        : undefined
      // Clean up actions that reference this variable
      const cleanedActions = t.actions.filter(
        (a) =>
          !((a.type === 'set_variable' || a.type === 'adjust_variable') && a.params.variableId === variableId)
      )
      return { ...t, conditions: cleanedConditions, actions: cleanedActions, updatedAt: new Date().toISOString() }
    })
    updateConfig(courseId, {
      ...config,
      variables: updatedVariables,
      triggers: updatedTriggers
    })
  },

  // ─── Trigger CRUD ───

  addTrigger: (courseId, trigger) => {
    const config = getConfig(courseId)
    const now = new Date().toISOString()
    const id = uid('trigger')
    const newTrigger: Trigger = {
      ...trigger,
      id,
      createdAt: now,
      updatedAt: now
    }
    updateConfig(courseId, {
      ...config,
      triggers: [...config.triggers, newTrigger]
    })
    return id
  },

  updateTrigger: (courseId, triggerId, partial) => {
    const config = getConfig(courseId)
    updateConfig(courseId, {
      ...config,
      triggers: config.triggers.map((t) =>
        t.id === triggerId ? { ...t, ...partial, updatedAt: new Date().toISOString() } : t
      )
    })
  },

  removeTrigger: (courseId, triggerId) => {
    const config = getConfig(courseId)
    updateConfig(courseId, {
      ...config,
      triggers: config.triggers.filter((t) => t.id !== triggerId)
    })
  },

  duplicateTrigger: (courseId, triggerId) => {
    const config = getConfig(courseId)
    const source = config.triggers.find((t) => t.id === triggerId)
    if (!source) return null

    const now = new Date().toISOString()
    const id = uid('trigger')
    const clone: Trigger = {
      ...source,
      id,
      name: source.name ? `${source.name} (copy)` : '',
      actions: source.actions.map((a) => ({ ...a, id: uid('action') })),
      conditions: source.conditions
        ? {
            ...source.conditions,
            conditions: source.conditions.conditions.map((c) => ({ ...c, id: uid('cond') }))
          }
        : undefined,
      createdAt: now,
      updatedAt: now
    }
    updateConfig(courseId, {
      ...config,
      triggers: [...config.triggers, clone]
    })
    return id
  },

  toggleTrigger: (courseId, triggerId) => {
    const config = getConfig(courseId)
    updateConfig(courseId, {
      ...config,
      triggers: config.triggers.map((t) =>
        t.id === triggerId ? { ...t, enabled: !t.enabled, updatedAt: new Date().toISOString() } : t
      )
    })
  },

  // ─── Progression ───

  updateProgression: (courseId, settings) => {
    const config = getConfig(courseId)
    updateConfig(courseId, {
      ...config,
      progression: { ...config.progression, ...settings }
    })
  },

  // ─── Queries ───

  getTriggersForBlock: (courseId, blockId) => {
    const config = getConfig(courseId)
    return config.triggers.filter((t) => t.scope === 'block' && t.scopeId === blockId)
  },

  getVariables: (courseId) => {
    return getConfig(courseId).variables
  },

  getTriggersForScope: (courseId, scope, scopeId) => {
    const config = getConfig(courseId)
    return config.triggers.filter((t) => t.scope === scope && t.scopeId === scopeId)
  },

  getInteractivity: (courseId) => {
    return getConfig(courseId)
  }
}))
