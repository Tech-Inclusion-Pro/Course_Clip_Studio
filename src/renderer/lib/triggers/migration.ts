import type { Course } from '@/types/course'
import type { InteractivityConfig } from '@/types/trigger-model'
import { INTERACTIVITY_SCHEMA_VERSION } from '@/types/trigger-model'
import { DEFAULT_PROGRESSION_SETTINGS } from './defaults'

export function migrateInteractivity(course: Course): Course {
  // No interactivity field → create default
  if (!course.interactivity) {
    const defaultConfig: InteractivityConfig = {
      schemaVersion: INTERACTIVITY_SCHEMA_VERSION,
      variables: [],
      triggers: [],
      progression: { ...DEFAULT_PROGRESSION_SETTINGS }
    }
    return { ...course, interactivity: defaultConfig }
  }

  // Current version → no-op
  if (course.interactivity.schemaVersion === INTERACTIVITY_SCHEMA_VERSION) {
    return course
  }

  // Future: add version migration transforms here
  return {
    ...course,
    interactivity: {
      ...course.interactivity,
      schemaVersion: INTERACTIVITY_SCHEMA_VERSION
    }
  }
}
