import type { Course, Module, Lesson, UDLChecklist, CourseTheme, CourseSettings } from '@/types/course'
import { uid } from '@/lib/uid'

// ─── Default Factories ───

function defaultUDLChecklist(): UDLChecklist {
  return {
    representation: {
      multipleFormats: false,
      altTextPresent: false,
      transcriptsPresent: false,
      captionsPresent: false,
      readingLevelAppropriate: false
    },
    action: {
      keyboardNavigable: false,
      multipleResponseModes: false,
      sufficientTime: false
    },
    engagement: {
      choiceAndAutonomy: false,
      relevantContext: false,
      feedbackPresent: false,
      progressVisible: false
    }
  }
}

function defaultTheme(): CourseTheme {
  return {
    id: uid('theme'),
    name: 'Default',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    accentColor: '#ec4899',
    backgroundColor: '#ffffff',
    surfaceColor: '#f8fafc',
    textColor: '#1e293b',
    fontFamily: 'Inter, sans-serif',
    fontFamilyHeading: 'Inter, sans-serif',
    googleFontUrl: null,
    logoPath: null,
    customCSS: '',
    darkMode: false,
    playerShell: {
      headerColor: '#6366f1',
      buttonStyle: 'rounded',
      progressBarColor: '#6366f1',
      backgroundColor: '#ffffff',
      showLogo: true
    },
    loadingScreen: {
      logoPath: null,
      backgroundColor: '#ffffff',
      showProgressRing: true,
      message: 'Loading course...'
    }
  }
}

function defaultSettings(): CourseSettings {
  return {
    requireLinearNavigation: false,
    allowSkip: true,
    showProgressBar: true,
    showEstimatedTime: true,
    learnerNotesEnabled: true,
    learnerBookmarksEnabled: true,
    feedbackFormsEnabled: false,
    accessibilityModeToggle: true,
    completionCriteria: 'visit-all',
    enrollmentPage: false,
    xapi: null,
    scorm: null
  }
}

// ─── Public Factories ───

export function createLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: uid('lesson'),
    title: 'Untitled Lesson',
    blocks: [],
    notes: [],
    accessibilityScore: null,
    readingLevel: null,
    ...overrides
  }
}

export function createModule(overrides: Partial<Module> = {}): Module {
  return {
    id: uid('module'),
    title: 'Untitled Module',
    description: '',
    lessons: [],
    udlChecklist: defaultUDLChecklist(),
    completionRequired: true,
    ...overrides
  }
}

export function createCourse(overrides: Partial<Course> = {}): Course {
  const now = new Date().toISOString()
  const defaultMeta = {
    title: 'Untitled Course',
    description: '',
    author: 'Course Author',
    language: 'en',
    estimatedDuration: 0,
    tags: [] as string[],
    thumbnail: null as string | null,
    version: '1.0.0'
  }
  const { meta: metaOverrides, ...restOverrides } = overrides
  return {
    id: uid('course'),
    meta: { ...defaultMeta, ...metaOverrides },
    theme: defaultTheme(),
    modules: [],
    certificate: null,
    settings: defaultSettings(),
    history: [],
    publishStatus: 'draft',
    createdAt: now,
    updatedAt: now,
    ...restOverrides
  }
}

// ─── Pre-built Mock Courses ───

export function createMockCourses(): Course[] {
  const now = new Date()

  return [
    createCourse({
      meta: {
        title: 'UDL Foundations for Educators',
        description: 'A comprehensive introduction to Universal Design for Learning principles, with practical strategies for creating inclusive learning experiences.',
        author: 'Dr. Sarah Chen',
        language: 'en',
        estimatedDuration: 120,
        tags: ['UDL', 'accessibility', 'education'],
        thumbnail: null,
        version: '2.1.0'
      },
      publishStatus: 'published',
      modules: [
        createModule({
          title: 'Understanding UDL',
          description: 'Core principles and framework',
          lessons: [
            createLesson({ title: 'What is UDL?', accessibilityScore: 92 }),
            createLesson({ title: 'The Three Principles', accessibilityScore: 88 }),
            createLesson({ title: 'UDL in Practice', accessibilityScore: 85 })
          ]
        }),
        createModule({
          title: 'Representation',
          description: 'Multiple means of representation',
          lessons: [
            createLesson({ title: 'Perception Guidelines' }),
            createLesson({ title: 'Language & Symbols' }),
            createLesson({ title: 'Comprehension Strategies' })
          ]
        }),
        createModule({
          title: 'Action & Expression',
          description: 'Multiple means of action and expression',
          lessons: [
            createLesson({ title: 'Physical Action' }),
            createLesson({ title: 'Expression & Communication' })
          ]
        })
      ],
      createdAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }),

    createCourse({
      meta: {
        title: 'New Employee Onboarding',
        description: 'Complete onboarding program covering company culture, policies, tools, and team introductions.',
        author: 'HR Team',
        language: 'en',
        estimatedDuration: 90,
        tags: ['onboarding', 'corporate', 'HR'],
        thumbnail: null,
        version: '1.3.0'
      },
      publishStatus: 'review',
      modules: [
        createModule({
          title: 'Welcome & Culture',
          description: 'Company overview and values',
          lessons: [
            createLesson({ title: 'Welcome Message' }),
            createLesson({ title: 'Our Mission & Values' }),
            createLesson({ title: 'Team Structure' })
          ]
        }),
        createModule({
          title: 'Policies & Compliance',
          description: 'Key policies every employee needs to know',
          lessons: [
            createLesson({ title: 'Code of Conduct' }),
            createLesson({ title: 'IT Security Basics' })
          ]
        })
      ],
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }),

    createCourse({
      meta: {
        title: 'Data Privacy & GDPR Compliance',
        description: 'Mandatory training on data protection regulations, privacy best practices, and GDPR compliance requirements.',
        author: 'Legal & Compliance',
        language: 'en',
        estimatedDuration: 45,
        tags: ['compliance', 'GDPR', 'privacy'],
        thumbnail: null,
        version: '1.0.0'
      },
      publishStatus: 'draft',
      modules: [
        createModule({
          title: 'GDPR Overview',
          description: 'Understanding the regulation',
          lessons: [
            createLesson({ title: 'What is GDPR?' }),
            createLesson({ title: 'Key Principles' })
          ]
        })
      ],
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString()
    }),

    createCourse({
      meta: {
        title: 'Intro to Instructional Design',
        description: 'Archived course covering classic instructional design models including ADDIE and SAM frameworks.',
        author: 'Prof. James Wright',
        language: 'en',
        estimatedDuration: 180,
        tags: ['instructional design', 'education', 'archived'],
        thumbnail: null,
        version: '3.0.0'
      },
      publishStatus: 'archived',
      modules: [
        createModule({
          title: 'ADDIE Model',
          description: 'The classic five-phase model',
          lessons: [
            createLesson({ title: 'Analysis Phase' }),
            createLesson({ title: 'Design Phase' }),
            createLesson({ title: 'Development Phase' }),
            createLesson({ title: 'Implementation Phase' }),
            createLesson({ title: 'Evaluation Phase' })
          ]
        }),
        createModule({
          title: 'SAM Framework',
          description: 'Successive Approximation Model',
          lessons: [
            createLesson({ title: 'Iterative Design' }),
            createLesson({ title: 'Prototyping' })
          ]
        }),
        createModule({
          title: 'Assessment Design',
          description: 'Creating effective assessments',
          lessons: [
            createLesson({ title: 'Formative vs Summative' }),
            createLesson({ title: 'Rubric Design' }),
            createLesson({ title: 'Authentic Assessment' })
          ]
        })
      ],
      createdAt: new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
    })
  ]
}
