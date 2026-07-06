import { describe, it, expect, beforeEach } from 'vitest'
import { usePresentationStore } from '@/stores/usePresentationStore'

function resetStore() {
  usePresentationStore.setState({
    activeDraft: null,
    activeDeck: null,
    decks: [],
    step: 'entry',
    isGenerating: false,
    generationError: null
  })
}

describe('usePresentationStore', () => {
  beforeEach(resetStore)

  describe('draft lifecycle', () => {
    it('createNewDraft creates a draft with defaults', () => {
      usePresentationStore.getState().createNewDraft()
      const draft = usePresentationStore.getState().activeDraft
      expect(draft).not.toBeNull()
      expect(draft!.id).toMatch(/^deck-/)
      expect(draft!.slides).toEqual([])
      expect(draft!.entryMode).toBe('prompt')
      expect(draft!.intake.slideCount).toBe(10)
      expect(draft!.intake.density).toBe('medium')
      expect(draft!.themeId).toBe('lumina-light')
    })

    it('closeDraft clears active state', () => {
      usePresentationStore.getState().createNewDraft()
      usePresentationStore.getState().closeDraft()
      expect(usePresentationStore.getState().activeDraft).toBeNull()
      expect(usePresentationStore.getState().step).toBe('entry')
    })

    it('setDraftTitle updates title', () => {
      usePresentationStore.getState().createNewDraft()
      usePresentationStore.getState().setDraftTitle('Test Deck')
      expect(usePresentationStore.getState().activeDraft!.title).toBe('Test Deck')
    })
  })

  describe('slide operations', () => {
    beforeEach(() => {
      usePresentationStore.getState().createNewDraft()
      usePresentationStore.getState().setSlides([
        { id: 's1', title: 'Slide 1', body: 'Line 1\nLine 2\nLine 3\nLine 4', speakerNotes: 'Note 1', imagePrompt: '', layoutHint: 'title', flags: [] },
        { id: 's2', title: 'Slide 2', body: 'Body 2', speakerNotes: 'Note 2', imagePrompt: '', layoutHint: 'bullets', flags: [] },
        { id: 's3', title: 'Slide 3', body: 'Body 3', speakerNotes: '', imagePrompt: '', layoutHint: 'bullets', flags: [] }
      ])
    })

    it('updateSlide modifies a specific slide', () => {
      usePresentationStore.getState().updateSlide('s2', { title: 'Updated' })
      const slides = usePresentationStore.getState().activeDraft!.slides
      expect(slides[1].title).toBe('Updated')
      expect(slides[0].title).toBe('Slide 1') // unchanged
    })

    it('addSlide appends when no afterId', () => {
      usePresentationStore.getState().addSlide()
      const slides = usePresentationStore.getState().activeDraft!.slides
      expect(slides).toHaveLength(4)
      expect(slides[3].id).toMatch(/^slide-/)
    })

    it('addSlide inserts after specified id', () => {
      usePresentationStore.getState().addSlide('s1')
      const slides = usePresentationStore.getState().activeDraft!.slides
      expect(slides).toHaveLength(4)
      expect(slides[0].id).toBe('s1')
      expect(slides[1].id).toMatch(/^slide-/) // new slide
      expect(slides[2].id).toBe('s2')
    })

    it('removeSlide removes a slide', () => {
      usePresentationStore.getState().removeSlide('s2')
      const slides = usePresentationStore.getState().activeDraft!.slides
      expect(slides).toHaveLength(2)
      expect(slides.find((s) => s.id === 's2')).toBeUndefined()
    })

    it('reorderSlides moves a slide', () => {
      usePresentationStore.getState().reorderSlides(0, 2)
      const slides = usePresentationStore.getState().activeDraft!.slides
      expect(slides[0].id).toBe('s2')
      expect(slides[1].id).toBe('s3')
      expect(slides[2].id).toBe('s1')
    })

    it('splitSlide splits body at midpoint', () => {
      usePresentationStore.getState().splitSlide('s1')
      const slides = usePresentationStore.getState().activeDraft!.slides
      expect(slides).toHaveLength(4)
      expect(slides[0].body).toBe('Line 1\nLine 2')
      expect(slides[1].body).toBe('Line 3\nLine 4')
      expect(slides[1].title).toBe('Slide 1 (continued)')
    })

    it('mergeSlides combines two adjacent slides', () => {
      usePresentationStore.getState().mergeSlides('s1')
      const slides = usePresentationStore.getState().activeDraft!.slides
      expect(slides).toHaveLength(2)
      expect(slides[0].title).toBe('Slide 1') // first title wins
      expect(slides[0].body).toContain('Body 2') // bodies concatenated
      expect(slides[0].speakerNotes).toContain('Note 2') // notes concatenated
      expect(slides[0].layoutHint).toBe('bullets') // merged → bullets
    })

    it('mergeSlides does nothing for last slide', () => {
      usePresentationStore.getState().mergeSlides('s3')
      const slides = usePresentationStore.getState().activeDraft!.slides
      expect(slides).toHaveLength(3)
    })
  })

  describe('deck operations', () => {
    it('deleteDeck removes from decks list', () => {
      usePresentationStore.setState({
        decks: [
          { id: 'd1', title: 'Deck 1', slides: [], theme: {} as never, imageStyle: 'flat_vector', courseId: null, createdAt: '', updatedAt: '' },
          { id: 'd2', title: 'Deck 2', slides: [], theme: {} as never, imageStyle: 'flat_vector', courseId: null, createdAt: '', updatedAt: '' }
        ]
      })
      usePresentationStore.getState().deleteDeck('d1')
      expect(usePresentationStore.getState().decks).toHaveLength(1)
      expect(usePresentationStore.getState().decks[0].id).toBe('d2')
    })

    it('attachCourse sets courseId on deck', () => {
      usePresentationStore.setState({
        decks: [
          { id: 'd1', title: 'Deck 1', slides: [], theme: {} as never, imageStyle: 'flat_vector', courseId: null, createdAt: '', updatedAt: '' }
        ]
      })
      usePresentationStore.getState().attachCourse('d1', 'course-123')
      expect(usePresentationStore.getState().decks[0].courseId).toBe('course-123')
    })

    it('attachCourse with null detaches', () => {
      usePresentationStore.setState({
        decks: [
          { id: 'd1', title: 'Deck 1', slides: [], theme: {} as never, imageStyle: 'flat_vector', courseId: 'course-123', createdAt: '', updatedAt: '' }
        ]
      })
      usePresentationStore.getState().attachCourse('d1', null)
      expect(usePresentationStore.getState().decks[0].courseId).toBeNull()
    })
  })

  describe('AI state', () => {
    it('tracks generation state', () => {
      usePresentationStore.getState().startGeneration()
      expect(usePresentationStore.getState().isGenerating).toBe(true)
      expect(usePresentationStore.getState().generationError).toBeNull()

      usePresentationStore.getState().finishGeneration()
      expect(usePresentationStore.getState().isGenerating).toBe(false)
    })

    it('tracks generation errors', () => {
      usePresentationStore.getState().startGeneration()
      usePresentationStore.getState().failGeneration('Something went wrong')
      expect(usePresentationStore.getState().isGenerating).toBe(false)
      expect(usePresentationStore.getState().generationError).toBe('Something went wrong')
    })
  })
})
