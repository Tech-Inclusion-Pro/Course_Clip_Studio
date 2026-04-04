// ─── TIPPY Author Profile Store ───
// Manages the Get to Know You onboarding data and author profile.
// Persisted to localStorage. Profile markdown is generated for
// injection into TIPPY's Layer 3 system prompt.

import { create } from 'zustand'
import type {
  AuthorProfile,
  OnboardingSectionId,
  OnboardingSectionData,
  OnboardingSectionMeta
} from '@/types/analytics'
import { generateProfileMarkdown, buildProfileFromSections } from '@/lib/tippy/profile-generator'

// ─── Section Definitions ───

export const ONBOARDING_SECTIONS: OnboardingSectionMeta[] = [
  {
    id: 'about-you',
    title: 'About You',
    icon: 'user',
    questions: [
      "What's your name? What do you prefer I call you?",
      'What is your professional role? (For example: instructional designer, classroom teacher, behavior analyst, university faculty, training coordinator, accessibility consultant)',
      "What institution or organization are you designing for, if you'd like to share that?",
      'Do you have any credentials or frameworks you work within regularly? For example: CPACC, BCBA, UDL certification, WCAG specialist, or others.'
    ]
  },
  {
    id: 'your-audience',
    title: 'Your Audience',
    icon: 'users',
    questions: [
      'Who are the learners you design for most often? Tell me about them — their age ranges, learning contexts, any specific needs or characteristics you keep in mind.',
      'Do you design for learners with disabilities? If so, which communities are most relevant to your work?',
      'Do you design for multilingual learners or communities where English is not the primary language?',
      'Is there anything about your audience that you wish more course authoring tools understood?'
    ]
  },
  {
    id: 'design-philosophy',
    title: 'Your Design Philosophy',
    icon: 'lightbulb',
    questions: [
      'How would you describe your approach to instructional design? What matters most to you when you build a course?',
      'What accessibility principles guide your work? Do you lead with WCAG, UDL, both, or something else?',
      'What does inclusion mean to you in the context of the courses you build?',
      'Is there a framework, theory, or set of values that shows up consistently in your work?'
    ]
  },
  {
    id: 'brand-visual',
    title: 'Your Brand and Visual Style',
    icon: 'palette',
    questions: [
      'Do you have brand colors you use consistently? If so, I can keep these in mind when making design suggestions.',
      'What is your preferred typography? Is legibility a primary concern, or do you have brand fonts you use?',
      'How would you describe your visual design style — clean and minimal, rich and layered, bold and high-contrast, something else?',
      'Are there visual choices you actively avoid? For example: stock photo clichés, decorative clutter, low-contrast palettes.'
    ]
  },
  {
    id: 'workflow',
    title: 'Your Workflow',
    icon: 'workflow',
    questions: [
      'How do you typically start building a course — from an outline, from existing materials, from learning objectives, or something else?',
      'Do you usually work alone or with a team? If you work with others, are they subject matter experts, other designers, or learners?',
      'What is your biggest pain point when building accessible courses right now?',
      'Is there anything you wish an AI assistant understood about how you work before it starts making suggestions?'
    ]
  },
  {
    id: 'ai-preferences',
    title: 'AI Preferences',
    icon: 'brain',
    questions: [
      'How do you prefer AI to support your work? For example: mostly for generating first drafts that I then edit heavily; or mostly for checking my work and flagging issues; or a mix of both.',
      'How much do you want me to explain my reasoning? I can be brief and direct, or I can walk through the accessibility and pedagogical logic behind each suggestion.',
      "Are there topics or types of suggestions where you'd like me to be more cautious or ask before acting?",
      'Do you have preferences about AI privacy? For example, I can default to running on local Ollama for anything involving learner data.'
    ]
  }
]

// ─── Persistence ───

const STORAGE_KEY = 'tippy_author_profile'

interface PersistedData {
  sections: OnboardingSectionData[]
  createdAt: string | null
  updatedAt: string | null
}

function loadPersistedData(): PersistedData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  return {
    sections: ONBOARDING_SECTIONS.map((s) => ({
      id: s.id,
      completed: false,
      responses: s.questions.map(() => ''),
      summary: '',
      updatedAt: null
    })),
    createdAt: null,
    updatedAt: null
  }
}

function persistData(data: PersistedData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {
    // Storage full
  }
}

// ─── Store Interface ───

interface AuthorProfileState {
  sections: OnboardingSectionData[]
  profile: AuthorProfile | null
  profileMarkdown: string
  createdAt: string | null
  updatedAt: string | null

  // Active onboarding state
  activeSection: OnboardingSectionId | null
  activeQuestionIndex: number

  // Computed
  completedCount: number
  isProfileComplete: boolean

  // Actions
  startSection: (id: OnboardingSectionId) => void
  setResponse: (sectionId: OnboardingSectionId, questionIndex: number, value: string) => void
  completeSection: (sectionId: OnboardingSectionId, summary: string) => void
  skipSection: (sectionId: OnboardingSectionId) => void
  nextQuestion: () => void
  prevQuestion: () => void

  // Profile management
  regenerateProfile: () => void
  resetProfile: () => void
  exportProfileMarkdown: () => string

  // Pre-populate brand section
  preFillBrand: (colors: string, typography: string) => void
}

export const useAuthorProfileStore = create<AuthorProfileState>((set, get) => {
  const persisted = loadPersistedData()
  const profile = buildProfileFromSections(persisted.sections)
  const profileMarkdown = profile ? generateProfileMarkdown(profile) : ''

  return {
    sections: persisted.sections,
    profile,
    profileMarkdown,
    createdAt: persisted.createdAt,
    updatedAt: persisted.updatedAt,
    activeSection: null,
    activeQuestionIndex: 0,

    get completedCount() {
      return get().sections.filter((s) => s.completed).length
    },

    get isProfileComplete() {
      return get().sections.every((s) => s.completed)
    },

    startSection: (id) => {
      set({ activeSection: id, activeQuestionIndex: 0 })
    },

    setResponse: (sectionId, questionIndex, value) => {
      set((state) => {
        const sections = state.sections.map((s) => {
          if (s.id !== sectionId) return s
          const responses = [...s.responses]
          responses[questionIndex] = value
          return { ...s, responses }
        })
        return { sections }
      })
    },

    completeSection: (sectionId, summary) => {
      const now = new Date().toISOString()
      set((state) => {
        const sections = state.sections.map((s) => {
          if (s.id !== sectionId) return s
          return { ...s, completed: true, summary, updatedAt: now }
        })

        const createdAt = state.createdAt || now
        const data: PersistedData = { sections, createdAt, updatedAt: now }
        persistData(data)

        // Rebuild profile
        const profile = buildProfileFromSections(sections)
        const profileMarkdown = profile ? generateProfileMarkdown(profile) : ''

        return {
          sections,
          profile,
          profileMarkdown,
          createdAt,
          updatedAt: now,
          activeSection: null,
          activeQuestionIndex: 0
        }
      })
    },

    skipSection: (sectionId) => {
      set((state) => {
        const sectionIds = ONBOARDING_SECTIONS.map((s) => s.id)
        const currentIdx = sectionIds.indexOf(sectionId)
        const nextId = currentIdx < sectionIds.length - 1 ? sectionIds[currentIdx + 1] : null

        return {
          activeSection: nextId,
          activeQuestionIndex: 0
        }
      })
    },

    nextQuestion: () => {
      const { activeSection, activeQuestionIndex } = get()
      if (!activeSection) return
      const meta = ONBOARDING_SECTIONS.find((s) => s.id === activeSection)
      if (!meta) return
      if (activeQuestionIndex < meta.questions.length - 1) {
        set({ activeQuestionIndex: activeQuestionIndex + 1 })
      }
    },

    prevQuestion: () => {
      const { activeQuestionIndex } = get()
      if (activeQuestionIndex > 0) {
        set({ activeQuestionIndex: activeQuestionIndex - 1 })
      }
    },

    regenerateProfile: () => {
      const { sections } = get()
      const profile = buildProfileFromSections(sections)
      const profileMarkdown = profile ? generateProfileMarkdown(profile) : ''
      set({ profile, profileMarkdown })
    },

    resetProfile: () => {
      const sections = ONBOARDING_SECTIONS.map((s) => ({
        id: s.id,
        completed: false,
        responses: s.questions.map(() => ''),
        summary: '',
        updatedAt: null
      }))
      const data: PersistedData = { sections, createdAt: null, updatedAt: null }
      persistData(data)
      set({
        sections,
        profile: null,
        profileMarkdown: '',
        createdAt: null,
        updatedAt: null,
        activeSection: null,
        activeQuestionIndex: 0
      })
    },

    exportProfileMarkdown: () => {
      return get().profileMarkdown
    },

    preFillBrand: (colors, typography) => {
      set((state) => {
        const sections = state.sections.map((s) => {
          if (s.id !== 'brand-visual') return s
          const responses = [...s.responses]
          if (!responses[0]) responses[0] = colors
          if (!responses[1]) responses[1] = typography
          return { ...s, responses }
        })
        return { sections }
      })
    }
  }
})
