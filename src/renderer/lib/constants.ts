export const APP_NAME = 'Course Clip Studio'
export const APP_VERSION = '0.1.0'

export const ROUTES = {
  DASHBOARD: '/',
  EDITOR: '/editor',
  PREVIEW: '/preview',
  SETTINGS: '/settings',
  PUBLISH: '/publish'
} as const

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.EDITOR, label: 'Editor', icon: 'PenTool' },
  { path: ROUTES.PREVIEW, label: 'Preview', icon: 'Eye' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
  { path: ROUTES.PUBLISH, label: 'Publish', icon: 'Upload' }
] as const

// ─── Publish Status Config ───

import type { PublishStatus, CourseTemplate } from '@/types/course'
import { createCourse, createModule, createLesson } from '@/lib/mock-data'

export const PUBLISH_STATUS_CONFIG: Record<
  PublishStatus,
  { label: string; color: string; bgColor: string }
> = {
  draft: { label: 'Draft', color: 'var(--text-secondary)', bgColor: 'var(--bg-muted)' },
  review: { label: 'In Review', color: 'var(--color-warning-600, #d97706)', bgColor: 'var(--color-warning-100, #fef3c7)' },
  published: { label: 'Published', color: 'var(--color-success-600, #059669)', bgColor: 'var(--color-success-100, #d1fae5)' },
  archived: { label: 'Archived', color: 'var(--text-tertiary)', bgColor: 'var(--bg-muted)' }
}

export const STATUS_FILTER_OPTIONS: Array<{ value: PublishStatus | 'all'; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In Review' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' }
]

// ─── Course Templates ───

export const COURSE_TEMPLATES: CourseTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Course',
    description: 'Start from scratch with an empty course.',
    icon: 'FileText',
    tags: [],
    factory: () => {
      const c = createCourse()
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = c
      return rest
    }
  },
  {
    id: 'corporate',
    name: 'Corporate Training',
    description: 'Professional development with quizzes and certificates.',
    icon: 'Briefcase',
    tags: ['corporate', 'professional'],
    factory: () => {
      const c = createCourse({
        meta: {
          title: 'Corporate Training',
          description: 'Professional development course',
          author: 'Training Team',
          language: 'en',
          estimatedDuration: 60,
          tags: ['corporate'],
          thumbnail: null,
          version: '1.0.0'
        },
        modules: [
          createModule({ title: 'Introduction', lessons: [createLesson({ title: 'Welcome' })] }),
          createModule({ title: 'Core Content', lessons: [createLesson({ title: 'Lesson 1' })] }),
          createModule({ title: 'Assessment', lessons: [createLesson({ title: 'Final Quiz' })] })
        ]
      })
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = c
      return rest
    }
  },
  {
    id: 'onboarding',
    name: 'Employee Onboarding',
    description: 'Welcome new hires with culture, policies, and tools.',
    icon: 'Users',
    tags: ['onboarding', 'HR'],
    factory: () => {
      const c = createCourse({
        meta: {
          title: 'Employee Onboarding',
          description: 'New hire orientation program',
          author: 'HR Team',
          language: 'en',
          estimatedDuration: 90,
          tags: ['onboarding', 'HR'],
          thumbnail: null,
          version: '1.0.0'
        },
        modules: [
          createModule({ title: 'Welcome & Culture', lessons: [createLesson({ title: 'Welcome' }), createLesson({ title: 'Our Values' })] }),
          createModule({ title: 'Policies', lessons: [createLesson({ title: 'Code of Conduct' })] }),
          createModule({ title: 'Tools & Systems', lessons: [createLesson({ title: 'Getting Started' })] })
        ]
      })
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = c
      return rest
    }
  },
  {
    id: 'compliance',
    name: 'Compliance Training',
    description: 'Mandatory regulatory and policy compliance modules.',
    icon: 'ShieldCheck',
    tags: ['compliance', 'regulatory'],
    factory: () => {
      const c = createCourse({
        meta: {
          title: 'Compliance Training',
          description: 'Mandatory compliance course',
          author: 'Legal & Compliance',
          language: 'en',
          estimatedDuration: 45,
          tags: ['compliance'],
          thumbnail: null,
          version: '1.0.0'
        },
        modules: [
          createModule({ title: 'Regulations Overview', lessons: [createLesson({ title: 'Key Regulations' })] }),
          createModule({ title: 'Certification', lessons: [createLesson({ title: 'Final Assessment' })] })
        ]
      })
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = c
      return rest
    }
  },
  {
    id: 'higher-ed',
    name: 'Higher Education',
    description: 'Academic course structure with readings and assignments.',
    icon: 'GraduationCap',
    tags: ['education', 'academic'],
    factory: () => {
      const c = createCourse({
        meta: {
          title: 'Higher Education Course',
          description: 'Academic course with structured modules',
          author: 'Instructor',
          language: 'en',
          estimatedDuration: 150,
          tags: ['education', 'academic'],
          thumbnail: null,
          version: '1.0.0'
        },
        modules: [
          createModule({ title: 'Week 1: Introduction', lessons: [createLesson({ title: 'Syllabus & Overview' }), createLesson({ title: 'Reading 1' })] }),
          createModule({ title: 'Week 2: Foundations', lessons: [createLesson({ title: 'Lecture' }), createLesson({ title: 'Discussion' })] }),
          createModule({ title: 'Week 3: Application', lessons: [createLesson({ title: 'Assignment' })] })
        ]
      })
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = c
      return rest
    }
  },
  {
    id: 'udl-demo',
    name: 'UDL Showcase',
    description: 'Demonstrates Universal Design for Learning principles.',
    icon: 'PersonStanding',
    tags: ['UDL', 'accessibility', 'inclusive'],
    factory: () => {
      const c = createCourse({
        meta: {
          title: 'UDL Showcase',
          description: 'Demonstrating UDL principles in practice',
          author: 'UDL Team',
          language: 'en',
          estimatedDuration: 60,
          tags: ['UDL', 'accessibility'],
          thumbnail: null,
          version: '1.0.0'
        },
        modules: [
          createModule({ title: 'Representation', lessons: [createLesson({ title: 'Multiple Formats' }), createLesson({ title: 'Alt Text & Captions' })] }),
          createModule({ title: 'Action & Expression', lessons: [createLesson({ title: 'Flexible Interaction' })] }),
          createModule({ title: 'Engagement', lessons: [createLesson({ title: 'Choice & Relevance' })] })
        ]
      })
      const { id: _id, createdAt: _ca, updatedAt: _ua, ...rest } = c
      return rest
    }
  }
]
