import { create } from 'zustand'
import { uid } from '@/lib/uid'
import type {
  DeckDraft, DeckObject, SlideDraft, RenderedSlide,
  PresentationTheme, PresentationWizardStep, EntryMode,
  IntakeConfig, ImageStyle, LayoutHint
} from '@/types/presentation'

interface PresentationState {
  // ─── State ───
  activeDraft: DeckDraft | null
  activeDeck: DeckObject | null
  decks: DeckObject[]
  step: PresentationWizardStep
  isGenerating: boolean
  generationError: string | null

  // ─── Init ───
  setDecks: (decks: DeckObject[]) => void

  // ─── Wizard navigation ───
  setStep: (step: PresentationWizardStep) => void

  // ─── Draft CRUD ───
  createNewDraft: () => void
  setDraftTitle: (title: string) => void
  setEntryMode: (mode: EntryMode) => void
  setPrompt: (prompt: string) => void
  setIntake: (intake: Partial<IntakeConfig>) => void
  setThemeId: (themeId: string) => void
  setImageStyle: (style: ImageStyle) => void
  closeDraft: () => void

  // ─── Slide operations ───
  setSlides: (slides: SlideDraft[]) => void
  updateSlide: (id: string, updates: Partial<SlideDraft>) => void
  addSlide: (afterId?: string) => void
  removeSlide: (id: string) => void
  reorderSlides: (fromIndex: number, toIndex: number) => void
  splitSlide: (id: string) => void
  mergeSlides: (id: string) => void

  // ─── Rendering ───
  setRenderedSlides: (slides: RenderedSlide[]) => void
  updateRenderedSlide: (id: string, updates: Partial<RenderedSlide>) => void

  // ─── Deck finalization ───
  finalizeDeck: (theme: PresentationTheme) => void
  openDeck: (id: string) => void
  deleteDeck: (id: string) => void
  attachCourse: (deckId: string, courseId: string | null) => void

  // ─── AI state ───
  startGeneration: () => void
  finishGeneration: () => void
  failGeneration: (error: string) => void
}

function defaultIntake(): IntakeConfig {
  return { audience: '', slideCount: 10, density: 'medium' }
}

function defaultSlide(): SlideDraft {
  return {
    id: uid('slide'),
    title: '',
    body: '',
    speakerNotes: '',
    imagePrompt: '',
    layoutHint: 'bullets',
    flags: []
  }
}

function reorder<T>(list: T[], from: number, to: number): T[] {
  const result = [...list]
  const [removed] = result.splice(from, 1)
  result.splice(to, 0, removed)
  return result
}

function mapDraft(state: PresentationState, fn: (d: DeckDraft) => DeckDraft): Partial<PresentationState> {
  if (!state.activeDraft) return {}
  return { activeDraft: fn(state.activeDraft) }
}

export const usePresentationStore = create<PresentationState>((set, get) => ({
  // ─── Defaults ───
  activeDraft: null,
  activeDeck: null,
  decks: [],
  step: 'entry',
  isGenerating: false,
  generationError: null,

  // ─── Init ───
  setDecks: (decks) => set({ decks }),

  // ─── Wizard navigation ───
  setStep: (step) => set({ step }),

  // ─── Draft CRUD ───
  createNewDraft: () => {
    const now = new Date().toISOString()
    set({
      activeDraft: {
        id: uid('deck'),
        title: '',
        entryMode: 'prompt',
        intake: defaultIntake(),
        prompt: '',
        slides: [],
        themeId: 'lumina-light',
        imageStyle: 'flat_vector',
        createdAt: now,
        updatedAt: now
      },
      activeDeck: null,
      step: 'entry'
    })
  },

  setDraftTitle: (title) => set((s) => mapDraft(s, (d) => ({ ...d, title }))),
  setEntryMode: (mode) => set((s) => mapDraft(s, (d) => ({ ...d, entryMode: mode }))),
  setPrompt: (prompt) => set((s) => mapDraft(s, (d) => ({ ...d, prompt }))),
  setIntake: (intake) => set((s) => mapDraft(s, (d) => ({ ...d, intake: { ...d.intake, ...intake } }))),
  setThemeId: (themeId) => set((s) => mapDraft(s, (d) => ({ ...d, themeId }))),
  setImageStyle: (style) => set((s) => mapDraft(s, (d) => ({ ...d, imageStyle: style }))),

  closeDraft: () => set({ activeDraft: null, activeDeck: null, step: 'entry' }),

  // ─── Slide operations ───
  setSlides: (slides) => set((s) => mapDraft(s, (d) => ({ ...d, slides }))),

  updateSlide: (id, updates) => set((s) => mapDraft(s, (d) => ({
    ...d,
    slides: d.slides.map((sl) => (sl.id === id ? { ...sl, ...updates } : sl))
  }))),

  addSlide: (afterId) => set((s) => mapDraft(s, (d) => {
    const newSlide = defaultSlide()
    if (!afterId) return { ...d, slides: [...d.slides, newSlide] }
    const idx = d.slides.findIndex((sl) => sl.id === afterId)
    const slides = [...d.slides]
    slides.splice(idx + 1, 0, newSlide)
    return { ...d, slides }
  })),

  removeSlide: (id) => set((s) => mapDraft(s, (d) => ({
    ...d,
    slides: d.slides.filter((sl) => sl.id !== id)
  }))),

  reorderSlides: (fromIndex, toIndex) => set((s) => mapDraft(s, (d) => ({
    ...d,
    slides: reorder(d.slides, fromIndex, toIndex)
  }))),

  splitSlide: (id) => set((s) => mapDraft(s, (d) => {
    const idx = d.slides.findIndex((sl) => sl.id === id)
    if (idx < 0) return d
    const slide = d.slides[idx]
    const lines = slide.body.split('\n')
    const mid = Math.ceil(lines.length / 2)
    const firstBody = lines.slice(0, mid).join('\n')
    const secondBody = lines.slice(mid).join('\n')

    const newSlide: SlideDraft = {
      id: uid('slide'),
      title: `${slide.title} (continued)`,
      body: secondBody,
      speakerNotes: '',
      imagePrompt: slide.imagePrompt,
      layoutHint: slide.layoutHint,
      flags: []
    }

    const slides = [...d.slides]
    slides[idx] = { ...slide, body: firstBody }
    slides.splice(idx + 1, 0, newSlide)
    return { ...d, slides }
  })),

  mergeSlides: (id) => set((s) => mapDraft(s, (d) => {
    const idx = d.slides.findIndex((sl) => sl.id === id)
    if (idx < 0 || idx >= d.slides.length - 1) return d
    const current = d.slides[idx]
    const next = d.slides[idx + 1]

    const merged: SlideDraft = {
      ...current,
      body: [current.body, next.body].filter(Boolean).join('\n\n'),
      speakerNotes: [current.speakerNotes, next.speakerNotes].filter(Boolean).join('\n\n'),
      layoutHint: 'bullets'
    }

    const slides = d.slides.filter((_, i) => i !== idx + 1)
    slides[idx] = merged
    return { ...d, slides }
  })),

  // ─── Rendering ───
  setRenderedSlides: (slides) => {
    const draft = get().activeDraft
    if (!draft) return
    set({
      activeDeck: {
        id: draft.id,
        title: draft.title || 'Untitled Presentation',
        slides,
        theme: { id: '', name: '', background: '', surface: '', textPrimary: '', textOnAccent: '', accent: '', accentSecondary: '', fontFamily: '' },
        imageStyle: draft.imageStyle,
        courseId: null,
        createdAt: draft.createdAt,
        updatedAt: new Date().toISOString()
      }
    })
  },

  updateRenderedSlide: (id, updates) => {
    const deck = get().activeDeck
    if (!deck) return
    set({
      activeDeck: {
        ...deck,
        slides: deck.slides.map((sl) => (sl.id === id ? { ...sl, ...updates } : sl))
      }
    })
  },

  // ─── Deck finalization ───
  finalizeDeck: (theme) => {
    const draft = get().activeDraft
    const deck = get().activeDeck
    if (!draft || !deck) return
    const finalized: DeckObject = {
      ...deck,
      theme,
      updatedAt: new Date().toISOString()
    }
    const existing = get().decks
    const idx = existing.findIndex((d) => d.id === finalized.id)
    const updated = idx >= 0
      ? existing.map((d) => (d.id === finalized.id ? finalized : d))
      : [...existing, finalized]
    set({ decks: updated, activeDeck: finalized })
  },

  openDeck: (id) => {
    const found = get().decks.find((d) => d.id === id)
    if (!found) return
    set({
      activeDeck: { ...found },
      activeDraft: {
        id: found.id,
        title: found.title,
        entryMode: 'prompt',
        intake: defaultIntake(),
        prompt: '',
        slides: found.slides,
        themeId: found.theme.id,
        imageStyle: found.imageStyle,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt
      },
      step: 'preview'
    })
  },

  deleteDeck: (id) => {
    set({ decks: get().decks.filter((d) => d.id !== id) })
  },

  attachCourse: (deckId, courseId) => {
    const updated = get().decks.map((d) =>
      d.id === deckId ? { ...d, courseId } : d
    )
    set({ decks: updated })
    const deck = get().activeDeck
    if (deck?.id === deckId) {
      set({ activeDeck: { ...deck, courseId } })
    }
  },

  // ─── AI state ───
  startGeneration: () => set({ isGenerating: true, generationError: null }),
  finishGeneration: () => set({ isGenerating: false }),
  failGeneration: (error) => set({ isGenerating: false, generationError: error })
}))
