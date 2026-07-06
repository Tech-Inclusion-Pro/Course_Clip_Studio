import type { PresentationTheme } from '@/types/presentation'

export const BRAND_THEMES: PresentationTheme[] = [
  {
    id: 'lumina-light',
    name: 'Lumina Light',
    background: '#FFFFFF',
    surface: '#F7F7F8',
    textPrimary: '#1A1A2E',
    textOnAccent: '#FFFFFF',
    accent: '#9B2480',      // Darker magenta for 4.5:1 on white
    accentSecondary: '#4338CA', // Darker indigo for 4.5:1 on white
    fontFamily: 'Arial'
  },
  {
    id: 'lumina-dark',
    name: 'Lumina Dark',
    background: '#1A1A2E',
    surface: '#252547',
    textPrimary: '#F0F0F5',
    textOnAccent: '#0F0F1A',   // Dark text on light accents
    accent: '#F5A8D5',         // Lighter pink for contrast
    accentSecondary: '#B4B8FC', // Lighter indigo for contrast
    fontFamily: 'Arial'
  },
  {
    id: 'brand-gradient',
    name: 'Brand Gradient',
    background: '#9B2480',     // Darker magenta
    surface: '#3730A3',        // Darker indigo
    textPrimary: '#FFFFFF',    // White text on dark backgrounds
    textOnAccent: '#FFFFFF',
    accent: '#9B2480',
    accentSecondary: '#3730A3',
    fontFamily: 'Arial'
  },
  {
    id: 'high-contrast',
    name: 'High Contrast',
    background: '#FFFFFF',
    surface: '#F2F2F2',
    textPrimary: '#000000',
    textOnAccent: '#FFFFFF',
    accent: '#1A1A1A',
    accentSecondary: '#003366',
    fontFamily: 'Arial'
  },
  {
    id: 'sepia',
    name: 'Sepia',
    background: '#F4ECD8',
    surface: '#EADFC8',
    textPrimary: '#3A2C1A',
    textOnAccent: '#FFFFFF',
    accent: '#6B3F22',
    accentSecondary: '#5C4033',
    fontFamily: 'Arial'
  },
  {
    id: 'ocean',
    name: 'Ocean',
    background: '#0B2545',
    surface: '#13315C',
    textPrimary: '#EAF2FB',
    textOnAccent: '#04121F',
    accent: '#5FB0E5',
    accentSecondary: '#8AD0C9',
    fontFamily: 'Arial'
  },
  {
    id: 'forest',
    name: 'Forest',
    background: '#F3F7F2',
    surface: '#E4EFE1',
    textPrimary: '#17301F',
    textOnAccent: '#FFFFFF',
    accent: '#276B44',
    accentSecondary: '#1B5E3A',
    fontFamily: 'Arial'
  }
]

/** Resolve a theme id against the built-in presets plus any custom themes. */
export function resolveTheme(
  id: string,
  customThemes: PresentationTheme[] = []
): PresentationTheme {
  return (
    BRAND_THEMES.find((t) => t.id === id) ??
    customThemes.find((t) => t.id === id) ??
    BRAND_THEMES[0]
  )
}

export function getThemeById(id: string): PresentationTheme {
  return BRAND_THEMES.find((t) => t.id === id) ?? BRAND_THEMES[0]
}
