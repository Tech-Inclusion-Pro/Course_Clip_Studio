import type { Variable, ProgressionSettings } from '@/types/trigger-model'

export const SYSTEM_VARIABLES: Variable[] = [
  {
    id: 'sys.course.score_pct',
    name: 'course.score_pct',
    type: 'number',
    scope: 'course',
    defaultValue: 0,
    description: 'Overall course score as a percentage (0-100)',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sys.course.completion_pct',
    name: 'course.completion_pct',
    type: 'number',
    scope: 'course',
    defaultValue: 0,
    description: 'Overall course completion percentage (0-100)',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sys.course.time_spent_sec',
    name: 'course.time_spent_sec',
    type: 'number',
    scope: 'course',
    defaultValue: 0,
    description: 'Total time spent in course in seconds',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sys.course.lessons_completed',
    name: 'course.lessons_completed',
    type: 'number',
    scope: 'course',
    defaultValue: 0,
    description: 'Number of lessons the learner has completed',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sys.course.total_lessons',
    name: 'course.total_lessons',
    type: 'number',
    scope: 'course',
    defaultValue: 0,
    description: 'Total number of lessons in the course',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sys.course.attempts',
    name: 'course.attempts',
    type: 'number',
    scope: 'course',
    defaultValue: 0,
    description: 'Number of course attempts',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sys.learner.prefers_reduced_motion',
    name: 'learner.prefers_reduced_motion',
    type: 'boolean',
    scope: 'course',
    defaultValue: false,
    description: 'Whether the learner prefers reduced motion',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sys.learner.prefers_high_contrast',
    name: 'learner.prefers_high_contrast',
    type: 'boolean',
    scope: 'course',
    defaultValue: false,
    description: 'Whether the learner prefers high contrast mode',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'sys.learner.screen_reader_active',
    name: 'learner.screen_reader_active',
    type: 'boolean',
    scope: 'course',
    defaultValue: false,
    description: 'Whether a screen reader is detected',
    system: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z'
  }
]

export const DEFAULT_PROGRESSION_SETTINGS: ProgressionSettings = {
  policy: 'fail_open',
  whatsNextOptions: {
    retry: true,
    pickAnother: true,
    reviewProgress: true,
    startOver: true,
    continueAnyway: false
  }
}
