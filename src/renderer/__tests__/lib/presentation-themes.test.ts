import { describe, it, expect } from 'vitest'
import { BRAND_THEMES, getThemeById } from '@/lib/presentation/themes'

describe('presentation themes', () => {
  it('has at least 3 brand presets', () => {
    expect(BRAND_THEMES.length).toBeGreaterThanOrEqual(3)
  })

  it('each theme has a unique id', () => {
    const ids = BRAND_THEMES.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('each theme has required fields', () => {
    for (const theme of BRAND_THEMES) {
      expect(theme.id).toBeTruthy()
      expect(theme.name).toBeTruthy()
      expect(theme.background).toMatch(/^#/)
      expect(theme.surface).toMatch(/^#/)
      expect(theme.textPrimary).toMatch(/^#/)
      expect(theme.textOnAccent).toMatch(/^#/)
      expect(theme.accent).toMatch(/^#/)
      expect(theme.accentSecondary).toMatch(/^#/)
      expect(theme.fontFamily).toBeTruthy()
    }
  })

  it('all themes use Arial font family', () => {
    for (const theme of BRAND_THEMES) {
      expect(theme.fontFamily).toBe('Arial')
    }
  })

  it('getThemeById returns correct theme', () => {
    expect(getThemeById('lumina-light').name).toBe('Lumina Light')
    expect(getThemeById('lumina-dark').name).toBe('Lumina Dark')
    expect(getThemeById('brand-gradient').name).toBe('Brand Gradient')
  })

  it('getThemeById returns fallback for unknown id', () => {
    const fallback = getThemeById('nonexistent')
    expect(fallback.id).toBe(BRAND_THEMES[0].id)
  })
})
