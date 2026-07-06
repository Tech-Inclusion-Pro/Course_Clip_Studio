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
  }
]

export function getThemeById(id: string): PresentationTheme {
  return BRAND_THEMES.find((t) => t.id === id) ?? BRAND_THEMES[0]
}
