/**
 * ADL + Lumina verb IRI constants for xAPI statements.
 */

export interface VerbDefinition {
  id: string
  display: string
}

const ADL_BASE = 'http://adlnet.gov/expapi/verbs'
const ACTIVITY_STREAMS = 'http://activitystrea.ms/schema/1.0'
const LUMINA_BASE = 'https://luminaudl.app/verbs'

export const VERBS: Record<string, VerbDefinition> = {
  // ADL standard verbs
  LAUNCHED: { id: `${ADL_BASE}/launched`, display: 'launched' },
  INITIALIZED: { id: `${ADL_BASE}/initialized`, display: 'initialized' },
  EXPERIENCED: { id: `${ADL_BASE}/experienced`, display: 'experienced' },
  ATTEMPTED: { id: `${ADL_BASE}/attempted`, display: 'attempted' },
  ANSWERED: { id: `${ADL_BASE}/answered`, display: 'answered' },
  PASSED: { id: `${ADL_BASE}/passed`, display: 'passed' },
  FAILED: { id: `${ADL_BASE}/failed`, display: 'failed' },
  COMPLETED: { id: `${ADL_BASE}/completed`, display: 'completed' },
  PROGRESSED: { id: `${ADL_BASE}/progressed`, display: 'progressed' },
  SUSPENDED: { id: `${ADL_BASE}/suspended`, display: 'suspended' },
  RESUMED: { id: `${ADL_BASE}/resumed`, display: 'resumed' },
  INTERACTED: { id: `${ADL_BASE}/interacted`, display: 'interacted' },
  COMMENTED: { id: `${ACTIVITY_STREAMS}/commented`, display: 'commented' },

  // LuminaUDL custom verbs — Representation
  ACCESSED_AUDIO_ALTERNATIVE: { id: `${LUMINA_BASE}/accessed-audio-alternative`, display: 'accessed audio alternative' },
  ACCESSED_TEXT_ALTERNATIVE: { id: `${LUMINA_BASE}/accessed-text-alternative`, display: 'accessed text alternative' },
  ACCESSED_VISUAL_ALTERNATIVE: { id: `${LUMINA_BASE}/accessed-visual-alternative`, display: 'accessed visual alternative' },
  ACCESSED_CAPTION_TRACK: { id: `${LUMINA_BASE}/accessed-caption-track`, display: 'accessed caption track' },
  SWITCHED_LANGUAGE: { id: `${LUMINA_BASE}/switched-language`, display: 'switched language' },
  EXPANDED_DEFINITION: { id: `${LUMINA_BASE}/expanded-definition`, display: 'expanded definition' },

  // LuminaUDL custom verbs — Action and Expression
  USED_EXTENDED_TIME: { id: `${LUMINA_BASE}/used-extended-time`, display: 'used extended time' },
  USED_TEXT_TO_SPEECH: { id: `${LUMINA_BASE}/used-text-to-speech`, display: 'used text to speech' },
  SUBMITTED_DRAWING: { id: `${LUMINA_BASE}/submitted-drawing`, display: 'submitted drawing' },
  SUBMITTED_AUDIO_RESPONSE: { id: `${LUMINA_BASE}/submitted-audio-response`, display: 'submitted audio response' },

  // LuminaUDL custom verbs — Engagement
  CHOSE_PATHWAY: { id: `${LUMINA_BASE}/chose-pathway`, display: 'chose pathway' },
  REPLAYED_CONTENT: { id: `${LUMINA_BASE}/replayed-content`, display: 'replayed content' },
  BOOKMARKED: { id: `${LUMINA_BASE}/bookmarked`, display: 'bookmarked' },
  RATED_DIFFICULTY: { id: `${LUMINA_BASE}/rated-difficulty`, display: 'rated difficulty' },
} as const

export type UDLPrinciple = 'representation' | 'action-expression' | 'engagement'

/** Maps each LuminaUDL verb IRI to its UDL principle. */
export const UDL_VERB_PRINCIPLES: Record<string, UDLPrinciple> = {
  [`${LUMINA_BASE}/accessed-audio-alternative`]: 'representation',
  [`${LUMINA_BASE}/accessed-text-alternative`]: 'representation',
  [`${LUMINA_BASE}/accessed-visual-alternative`]: 'representation',
  [`${LUMINA_BASE}/accessed-caption-track`]: 'representation',
  [`${LUMINA_BASE}/switched-language`]: 'representation',
  [`${LUMINA_BASE}/expanded-definition`]: 'representation',
  [`${LUMINA_BASE}/used-extended-time`]: 'action-expression',
  [`${LUMINA_BASE}/used-text-to-speech`]: 'action-expression',
  [`${LUMINA_BASE}/submitted-drawing`]: 'action-expression',
  [`${LUMINA_BASE}/submitted-audio-response`]: 'action-expression',
  [`${LUMINA_BASE}/chose-pathway`]: 'engagement',
  [`${LUMINA_BASE}/replayed-content`]: 'engagement',
  [`${LUMINA_BASE}/bookmarked`]: 'engagement',
  [`${LUMINA_BASE}/rated-difficulty`]: 'engagement',
}

export function getVerbDisplay(verbIri: string): string {
  for (const key of Object.keys(VERBS)) {
    if (VERBS[key].id === verbIri) return VERBS[key].display
  }
  return verbIri.split('/').pop() || verbIri
}
