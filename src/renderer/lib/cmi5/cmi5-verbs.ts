/**
 * cmi5-defined verb IRIs alongside LuminaUDL custom verbs.
 * cmi5 mandates specific verbs for session lifecycle events.
 */

export const CMI5_VERBS = {
  // cmi5 defined (mandatory for AU lifecycle)
  INITIALIZED: {
    id: 'http://adlnet.gov/expapi/verbs/initialized',
    display: 'initialized'
  },
  COMPLETED: {
    id: 'http://adlnet.gov/expapi/verbs/completed',
    display: 'completed'
  },
  PASSED: {
    id: 'http://adlnet.gov/expapi/verbs/passed',
    display: 'passed'
  },
  FAILED: {
    id: 'http://adlnet.gov/expapi/verbs/failed',
    display: 'failed'
  },
  TERMINATED: {
    id: 'http://adlnet.gov/expapi/verbs/terminated',
    display: 'terminated'
  },

  // cmi5 allowed (session management)
  ABANDONED: {
    id: 'https://w3id.org/xapi/adl/verbs/abandoned',
    display: 'abandoned'
  },
  WAIVED: {
    id: 'https://w3id.org/xapi/adl/verbs/waived',
    display: 'waived'
  },
  SATISFIED: {
    id: 'https://w3id.org/xapi/adl/verbs/satisfied',
    display: 'satisfied'
  }
} as const

/**
 * cmi5 context extension IRIs
 */
export const CMI5_CONTEXT = {
  SESSION_ID: 'https://w3id.org/xapi/cmi5/context/extensions/sessionid',
  MASTERY_SCORE: 'https://w3id.org/xapi/cmi5/context/extensions/masteryscore',
  LAUNCH_MODE: 'https://w3id.org/xapi/cmi5/context/extensions/launchmode',
  LAUNCH_URL: 'https://w3id.org/xapi/cmi5/context/extensions/launchurl',
  MOVE_ON: 'https://w3id.org/xapi/cmi5/context/extensions/moveon',
  LAUNCH_PARAMETERS: 'https://w3id.org/xapi/cmi5/context/extensions/launchparameters'
} as const

/**
 * cmi5 result extension IRIs
 */
export const CMI5_RESULT = {
  PROGRESS: 'https://w3id.org/xapi/cmi5/result/extensions/progress'
} as const

/**
 * cmi5 category activity IRI — must be included in all cmi5 statements
 */
export const CMI5_CATEGORY_IRI = 'https://w3id.org/xapi/cmi5/context/categories/cmi5'
export const MOVE_ON_CATEGORY_IRI = 'https://w3id.org/xapi/cmi5/context/categories/moveon'
