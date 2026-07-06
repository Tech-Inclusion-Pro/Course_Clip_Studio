// ─── References slide from citation-flagged sources ───
// When grounded generation preserves citations as SlideFlag{kind:'citation'},
// this collects them into a de-duplicated works-cited slide.

import type { SlideDraft } from '@/types/presentation'
import { uid } from '@/lib/uid'

/** De-duplicated citation details across all slides, in first-seen order. */
export function collectCitations(slides: SlideDraft[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const s of slides) {
    for (const f of s.flags) {
      const detail = f.detail.trim()
      if (f.kind === 'citation' && detail && !seen.has(detail)) {
        seen.add(detail)
        out.push(detail)
      }
    }
  }
  return out
}

export function hasReferencesSlide(slides: SlideDraft[]): boolean {
  return slides.some((s) => /^references$/i.test(s.title.trim()))
}

export function buildReferencesSlide(citations: string[]): SlideDraft {
  return {
    id: uid('slide'),
    title: 'References',
    body: citations.join('\n'),
    speakerNotes: '',
    imagePrompt: '',
    layoutHint: 'bullets',
    flags: citations.map((c) => ({ kind: 'citation' as const, detail: c }))
  }
}
