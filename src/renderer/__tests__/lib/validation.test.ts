import { describe, it, expect } from 'vitest'
import { validateInteractivity } from '@/lib/triggers/validation'
import type { InteractivityConfig } from '@/types/trigger-model'
import type { Course } from '@/types/course'
import { DEFAULT_PROGRESSION_SETTINGS } from '@/lib/triggers/defaults'

function makeConfig(overrides: Partial<InteractivityConfig> = {}): InteractivityConfig {
  return {
    schemaVersion: 1,
    variables: [],
    triggers: [],
    progression: { ...DEFAULT_PROGRESSION_SETTINGS },
    ...overrides
  }
}

function makeMinimalCourse(): Course {
  return {
    id: 'c1',
    meta: { title: 'T', description: '', author: '', language: 'en', estimatedDuration: 0, tags: [], thumbnail: null, version: '1.0' },
    theme: { id: 't1', name: 'D', primaryColor: '#000', secondaryColor: '#fff', accentColor: '#f00', backgroundColor: '#fff', surfaceColor: '#fff', textColor: '#000', fontFamily: 'Arial', fontFamilyHeading: 'Arial', googleFontUrl: null, logoPath: null, customCSS: '', darkMode: false, playerShell: { headerColor: '#000', buttonStyle: 'rounded', progressBarColor: '#0f0', backgroundColor: '#fff', showLogo: false }, loadingScreen: { logoPath: null, backgroundColor: '#fff', showProgressRing: true, message: '' } },
    modules: [{ id: 'm1', title: 'Mod', description: '', lessons: [{ id: 'l1', title: 'Les', blocks: [{ id: 'b1', type: 'text', ariaLabel: '', notes: '', content: '' }], notes: [], accessibilityScore: null, readingLevel: null }], udlChecklist: { representation: { multipleFormats: false, altTextPresent: false, transcriptsPresent: false, captionsPresent: false, readingLevelAppropriate: false }, action: { keyboardNavigable: false, multipleResponseModes: false, sufficientTime: false }, engagement: { choiceAndAutonomy: false, relevantContext: false, feedbackPresent: false, progressVisible: false } }, completionRequired: false }],
    certificate: null,
    settings: { requireLinearNavigation: false, allowSkip: true, showProgressBar: true, showEstimatedTime: true, learnerNotesEnabled: true, learnerBookmarksEnabled: true, feedbackFormsEnabled: false, accessibilityModeToggle: true, completionCriteria: 'visit-all', enrollmentPage: false, xapi: null, scorm: null },
    history: [],
    publishStatus: 'draft',
    createdAt: '',
    updatedAt: ''
  }
}

describe('validateInteractivity', () => {
  it('returns no issues for valid empty config', () => {
    const issues = validateInteractivity(makeConfig(), makeMinimalCourse())
    expect(issues).toHaveLength(0)
  })

  it('flags duplicate variable names', () => {
    const config = makeConfig({
      variables: [
        { id: 'v1', name: 'score', type: 'number', scope: 'course', defaultValue: 0, description: '', system: false, createdAt: '', updatedAt: '' },
        { id: 'v2', name: 'score', type: 'number', scope: 'course', defaultValue: 0, description: '', system: false, createdAt: '', updatedAt: '' }
      ]
    })
    const issues = validateInteractivity(config, makeMinimalCourse())
    expect(issues.some((i) => i.type === 'error' && i.message.includes('Duplicate'))).toBe(true)
  })

  it('flags trigger referencing unknown variable', () => {
    const config = makeConfig({
      triggers: [{
        id: 't1', name: 'T', description: '', event: 'on_click', eventParams: {},
        actions: [{ id: 'a1', type: 'set_variable', params: { variableId: 'missing', value: true } }],
        scope: 'block', scopeId: 'b1', enabled: true, executionOrder: 0, createdAt: '', updatedAt: ''
      }]
    })
    const issues = validateInteractivity(config, makeMinimalCourse())
    expect(issues.some((i) => i.type === 'error' && i.message.includes('unknown variable'))).toBe(true)
  })

  it('flags trigger navigating to unknown lesson', () => {
    const config = makeConfig({
      triggers: [{
        id: 't1', name: 'T', description: '', event: 'on_click', eventParams: {},
        actions: [{ id: 'a1', type: 'navigate', params: { lessonId: 'missing' } }],
        scope: 'block', scopeId: 'b1', enabled: true, executionOrder: 0, createdAt: '', updatedAt: ''
      }]
    })
    const issues = validateInteractivity(config, makeMinimalCourse())
    expect(issues.some((i) => i.type === 'error' && i.message.includes('unknown lesson'))).toBe(true)
  })

  it('warns about conditions referencing unknown variable', () => {
    const config = makeConfig({
      triggers: [{
        id: 't1', name: 'T', description: '', event: 'on_click', eventParams: {},
        actions: [{ id: 'a1', type: 'announce', params: { message: 'hi' } }],
        conditions: { logic: 'and', conditions: [{ id: 'c1', sourceType: 'variable', sourceId: 'missing', operator: 'eq', value: true }] },
        scope: 'block', scopeId: 'b1', enabled: true, executionOrder: 0, createdAt: '', updatedAt: ''
      }]
    })
    const issues = validateInteractivity(config, makeMinimalCourse())
    expect(issues.some((i) => i.type === 'warning' && i.message.includes('unknown variable'))).toBe(true)
  })
})
