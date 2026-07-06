import { describe, it, expect } from 'vitest'
import { SLIDE_LAYOUTS, getLayoutDef } from '@/lib/presentation/slide-layouts'
import type { LayoutHint } from '@/types/presentation'

const ALL_LAYOUT_IDS: LayoutHint[] = [
  'title', 'section', 'bullets', 'image-left', 'image-right',
  'two-column', 'full-image', 'big-number', 'quote', 'comparison', 'blank'
]

const CANVAS_W = 13.33
const CANVAS_H = 7.5

describe('SLIDE_LAYOUTS', () => {
  it('has exactly 13 layout definitions', () => {
    expect(SLIDE_LAYOUTS).toHaveLength(13)
  })

  it('every LayoutHint value has a definition', () => {
    for (const id of ALL_LAYOUT_IDS) {
      const def = SLIDE_LAYOUTS.find((l) => l.id === id)
      expect(def, `missing definition for "${id}"`).toBeDefined()
    }
  })

  it('all IDs are unique', () => {
    const ids = SLIDE_LAYOUTS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('all names are non-empty strings', () => {
    for (const layout of SLIDE_LAYOUTS) {
      expect(layout.name.length).toBeGreaterThan(0)
    }
  })

  it('all descriptions are non-empty strings', () => {
    for (const layout of SLIDE_LAYOUTS) {
      expect(layout.description.length).toBeGreaterThan(0)
    }
  })
})

describe('PPTX element rects', () => {
  it('all rects are within the 13.33 x 7.5 canvas bounds', () => {
    for (const layout of SLIDE_LAYOUTS) {
      for (const el of layout.pptxElements) {
        const { x, y, w, h } = el.rect
        expect(x, `${layout.id}/${el.kind} x`).toBeGreaterThanOrEqual(0)
        expect(y, `${layout.id}/${el.kind} y`).toBeGreaterThanOrEqual(0)
        expect(x + w, `${layout.id}/${el.kind} x+w exceeds canvas width`).toBeLessThanOrEqual(CANVAS_W + 0.01)
        expect(y + h, `${layout.id}/${el.kind} y+h exceeds canvas height`).toBeLessThanOrEqual(CANVAS_H + 0.01)
      }
    }
  })

  it('all rects have positive width and height', () => {
    for (const layout of SLIDE_LAYOUTS) {
      for (const el of layout.pptxElements) {
        expect(el.rect.w, `${layout.id}/${el.kind} width`).toBeGreaterThan(0)
        expect(el.rect.h, `${layout.id}/${el.kind} height`).toBeGreaterThan(0)
      }
    }
  })
})

describe('thumbnail regions', () => {
  it('all percentage values are within 0-100', () => {
    for (const layout of SLIDE_LAYOUTS) {
      for (const region of layout.thumbnailRegions) {
        expect(region.x, `${layout.id} region x`).toBeGreaterThanOrEqual(0)
        expect(region.x, `${layout.id} region x`).toBeLessThanOrEqual(100)
        expect(region.y, `${layout.id} region y`).toBeGreaterThanOrEqual(0)
        expect(region.y, `${layout.id} region y`).toBeLessThanOrEqual(100)
        expect(region.w, `${layout.id} region w`).toBeGreaterThan(0)
        expect(region.w, `${layout.id} region w`).toBeLessThanOrEqual(100)
        expect(region.h, `${layout.id} region h`).toBeGreaterThan(0)
        expect(region.h, `${layout.id} region h`).toBeLessThanOrEqual(100)
      }
    }
  })

  it('every layout has at least one thumbnail region', () => {
    for (const layout of SLIDE_LAYOUTS) {
      expect(layout.thumbnailRegions.length, `${layout.id} has no regions`).toBeGreaterThan(0)
    }
  })
})

describe('getLayoutDef', () => {
  it('returns the correct definition for each known ID', () => {
    for (const id of ALL_LAYOUT_IDS) {
      const def = getLayoutDef(id)
      expect(def.id).toBe(id)
    }
  })

  it('falls back to bullets for unknown layout IDs', () => {
    const def = getLayoutDef('nonexistent' as LayoutHint)
    expect(def.id).toBe('bullets')
  })
})

describe('layout metadata consistency', () => {
  it('title and section have accentBackground=true', () => {
    expect(getLayoutDef('title').accentBackground).toBe(true)
    expect(getLayoutDef('section').accentBackground).toBe(true)
  })

  it('image layouts have usesImage=true', () => {
    expect(getLayoutDef('image-left').usesImage).toBe(true)
    expect(getLayoutDef('image-right').usesImage).toBe(true)
    expect(getLayoutDef('full-image').usesImage).toBe(true)
  })

  it('blank has usesBody=false', () => {
    expect(getLayoutDef('blank').usesBody).toBe(false)
  })

  it('content layouts have an accent-bar element', () => {
    const contentLayouts: LayoutHint[] = ['bullets', 'image-left', 'image-right', 'big-number', 'quote', 'comparison', 'blank']
    for (const id of contentLayouts) {
      const def = getLayoutDef(id)
      const hasBar = def.pptxElements.some((el) => el.kind === 'accent-bar')
      expect(hasBar, `${id} missing accent-bar`).toBe(true)
    }
  })
})
