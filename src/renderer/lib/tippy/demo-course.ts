/**
 * TIPPY Demo Course Definition
 *
 * Used by walkthroughs that require sample course content
 * (dummyCourseRequired: true). Provides a minimal but realistic
 * course structure for demonstration purposes.
 */

import type { DemoCourseDefinition } from '@/types/analytics'

export const DEMO_COURSE: DemoCourseDefinition = {
  id: 'demo-tippy-walkthrough',
  title: 'Tippy Demo Course',
  description:
    'A sample course used by TIPPY walkthroughs to demonstrate features with real content.',
  modules: [
    {
      id: 'mod-intro',
      title: 'Introduction to Universal Design',
      lessons: [
        {
          id: 'les-welcome',
          title: 'Welcome & Overview',
          blockTypes: ['text', 'video', 'narration']
        },
        {
          id: 'les-udl-principles',
          title: 'UDL Principles',
          blockTypes: ['text', 'image', 'hotspot', 'knowledge-check']
        }
      ]
    },
    {
      id: 'mod-engagement',
      title: 'Engagement Strategies',
      lessons: [
        {
          id: 'les-motivation',
          title: 'Motivating Learners',
          blockTypes: ['text', 'video', 'writing-prompt', 'chart']
        },
        {
          id: 'les-assessment',
          title: 'Formative Assessment',
          blockTypes: ['text', 'quiz', 'knowledge-check']
        }
      ]
    },
    {
      id: 'mod-representation',
      title: 'Multiple Means of Representation',
      lessons: [
        {
          id: 'les-media',
          title: 'Multimedia Best Practices',
          blockTypes: ['text', 'video', 'audio', 'image', 'narration']
        },
        {
          id: 'les-accessibility',
          title: 'Accessibility Essentials',
          blockTypes: ['text', 'image', 'checklist']
        }
      ]
    }
  ]
}

/**
 * Get the demo course definition.
 */
export function getDemoCourse(): DemoCourseDefinition {
  return DEMO_COURSE
}

/**
 * Get a flat list of all block types used in the demo course.
 */
export function getDemoBlockTypes(): string[] {
  const types = new Set<string>()
  for (const mod of DEMO_COURSE.modules) {
    for (const les of mod.lessons) {
      for (const bt of les.blockTypes) {
        types.add(bt)
      }
    }
  }
  return Array.from(types)
}
