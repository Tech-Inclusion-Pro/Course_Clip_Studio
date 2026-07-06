import { describe, it, expect } from 'vitest'
import { verifyThemeContrast } from '@/lib/presentation/wcag-verifier'
import { BRAND_THEMES } from '@/lib/presentation/themes'
import type { PresentationTheme } from '@/types/presentation'

describe('verifyThemeContrast', () => {
  it('all brand presets pass WCAG AA', () => {
    for (const theme of BRAND_THEMES) {
      const report = verifyThemeContrast(theme)
      expect(report.allPass).toBe(true)
    }
  })

  it('returns correct number of contrast pairs', () => {
    const report = verifyThemeContrast(BRAND_THEMES[0])
    expect(report.pairs).toHaveLength(4)
  })

  it('detects failing contrast (white on white)', () => {
    const badTheme: PresentationTheme = {
      id: 'bad',
      name: 'Bad Theme',
      background: '#FFFFFF',
      surface: '#FFFFFF',
      textPrimary: '#EEEEEE',
      textOnAccent: '#FFFFFF',
      accent: '#FFCCCC',
      accentSecondary: '#CCCCFF',
      fontFamily: 'Arial'
    }
    const report = verifyThemeContrast(badTheme)
    expect(report.allPass).toBe(false)
    expect(report.pairs.some((p) => !p.passAA)).toBe(true)
  })

  it('high-contrast theme passes all checks', () => {
    const goodTheme: PresentationTheme = {
      id: 'high-contrast',
      name: 'High Contrast',
      background: '#FFFFFF',
      surface: '#F0F0F0',
      textPrimary: '#000000',
      textOnAccent: '#FFFFFF',
      accent: '#000000',
      accentSecondary: '#333333',
      fontFamily: 'Arial'
    }
    const report = verifyThemeContrast(goodTheme)
    expect(report.allPass).toBe(true)
  })

  it('overrideReason is null by default', () => {
    const report = verifyThemeContrast(BRAND_THEMES[0])
    expect(report.overrideReason).toBeNull()
  })
})
