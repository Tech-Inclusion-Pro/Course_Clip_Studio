import { describe, it, expect, beforeEach } from 'vitest'
import { useTriggersStore } from '@/stores/triggers-store'
import { useCourseStore } from '@/stores/useCourseStore'
import type { Course } from '@/types/course'
import { INTERACTIVITY_SCHEMA_VERSION } from '@/types/trigger-model'
import { DEFAULT_PROGRESSION_SETTINGS } from '@/lib/triggers/defaults'

function makeCourse(): Course {
  return {
    id: 'course-1',
    meta: { title: 'Test', description: '', author: '', language: 'en', estimatedDuration: 0, tags: [], thumbnail: null, version: '1.0' },
    theme: { id: 't1', name: 'Default', primaryColor: '#000', secondaryColor: '#fff', accentColor: '#f00', backgroundColor: '#fff', surfaceColor: '#fff', textColor: '#000', fontFamily: 'Arial', fontFamilyHeading: 'Arial', googleFontUrl: null, logoPath: null, customCSS: '', darkMode: false, playerShell: { headerColor: '#000', buttonStyle: 'rounded', progressBarColor: '#0f0', backgroundColor: '#fff', showLogo: false }, loadingScreen: { logoPath: null, backgroundColor: '#fff', showProgressRing: true, message: '' } },
    modules: [],
    certificate: null,
    settings: { requireLinearNavigation: false, allowSkip: true, showProgressBar: true, showEstimatedTime: true, learnerNotesEnabled: true, learnerBookmarksEnabled: true, feedbackFormsEnabled: false, accessibilityModeToggle: true, completionCriteria: 'visit-all', enrollmentPage: false, xapi: null, scorm: null },
    history: [],
    publishStatus: 'draft',
    interactivity: {
      schemaVersion: INTERACTIVITY_SCHEMA_VERSION,
      variables: [],
      triggers: [],
      progression: { ...DEFAULT_PROGRESSION_SETTINGS }
    },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
}

describe('useTriggersStore', () => {
  beforeEach(() => {
    useCourseStore.getState().setCourses([makeCourse()])
    useCourseStore.getState().setActiveCourse('course-1')
  })

  describe('variables', () => {
    it('addVariable adds a variable to the course', () => {
      const id = useTriggersStore.getState().addVariable('course-1', {
        name: 'score',
        type: 'number',
        scope: 'course',
        defaultValue: 0,
        description: 'Player score',
        system: false
      })
      expect(id).toBeTruthy()
      const vars = useTriggersStore.getState().getVariables('course-1')
      expect(vars).toHaveLength(1)
      expect(vars[0].name).toBe('score')
    })

    it('updateVariable updates a variable', () => {
      const id = useTriggersStore.getState().addVariable('course-1', {
        name: 'score',
        type: 'number',
        scope: 'course',
        defaultValue: 0,
        description: '',
        system: false
      })
      useTriggersStore.getState().updateVariable('course-1', id, { name: 'total_score' })
      const vars = useTriggersStore.getState().getVariables('course-1')
      expect(vars[0].name).toBe('total_score')
    })

    it('removeVariable removes a variable', () => {
      const id = useTriggersStore.getState().addVariable('course-1', {
        name: 'score',
        type: 'number',
        scope: 'course',
        defaultValue: 0,
        description: '',
        system: false
      })
      useTriggersStore.getState().removeVariable('course-1', id)
      expect(useTriggersStore.getState().getVariables('course-1')).toHaveLength(0)
    })
  })

  describe('triggers', () => {
    it('addTrigger adds a trigger', () => {
      const id = useTriggersStore.getState().addTrigger('course-1', {
        name: 'Test Trigger',
        description: '',
        event: 'on_click',
        eventParams: { blockId: 'b1' },
        actions: [{ id: 'a1', type: 'announce', params: { message: 'hello' } }],
        scope: 'block',
        scopeId: 'b1',
        enabled: true,
        executionOrder: 0
      })
      expect(id).toBeTruthy()
      const triggers = useTriggersStore.getState().getTriggersForBlock('course-1', 'b1')
      expect(triggers).toHaveLength(1)
    })

    it('removeTrigger removes a trigger', () => {
      const id = useTriggersStore.getState().addTrigger('course-1', {
        name: 'Test',
        description: '',
        event: 'on_click',
        eventParams: {},
        actions: [],
        scope: 'block',
        scopeId: 'b1',
        enabled: true,
        executionOrder: 0
      })
      useTriggersStore.getState().removeTrigger('course-1', id)
      expect(useTriggersStore.getState().getTriggersForBlock('course-1', 'b1')).toHaveLength(0)
    })

    it('toggleTrigger flips enabled state', () => {
      const id = useTriggersStore.getState().addTrigger('course-1', {
        name: 'Test',
        description: '',
        event: 'on_click',
        eventParams: {},
        actions: [],
        scope: 'block',
        scopeId: 'b1',
        enabled: true,
        executionOrder: 0
      })
      useTriggersStore.getState().toggleTrigger('course-1', id)
      const triggers = useTriggersStore.getState().getTriggersForBlock('course-1', 'b1')
      expect(triggers[0].enabled).toBe(false)
    })

    it('duplicateTrigger creates a copy', () => {
      const id = useTriggersStore.getState().addTrigger('course-1', {
        name: 'Original',
        description: '',
        event: 'on_click',
        eventParams: {},
        actions: [{ id: 'a1', type: 'announce', params: { message: 'hi' } }],
        scope: 'block',
        scopeId: 'b1',
        enabled: true,
        executionOrder: 0
      })
      const cloneId = useTriggersStore.getState().duplicateTrigger('course-1', id)
      expect(cloneId).toBeTruthy()
      const triggers = useTriggersStore.getState().getTriggersForBlock('course-1', 'b1')
      expect(triggers).toHaveLength(2)
      expect(triggers[1].name).toBe('Original (copy)')
      expect(triggers[1].id).not.toBe(id)
    })
  })

  describe('progression', () => {
    it('updateProgression updates progression settings', () => {
      useTriggersStore.getState().updateProgression('course-1', { policy: 'linear_strict' })
      const config = useTriggersStore.getState().getInteractivity('course-1')
      expect(config.progression.policy).toBe('linear_strict')
    })
  })
})
