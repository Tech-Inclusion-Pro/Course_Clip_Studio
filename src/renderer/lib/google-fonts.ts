/**
 * Curated list of popular Google Fonts (no API key needed).
 * Fonts are loaded via the CSS2 API: https://fonts.googleapis.com/css2?family=...
 */

export interface GoogleFont {
  family: string
  category: 'serif' | 'sans-serif' | 'display' | 'handwriting' | 'monospace'
  variants: string[]
}

export const GOOGLE_FONTS: GoogleFont[] = [
  // Sans-Serif
  { family: 'Inter', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Roboto', category: 'sans-serif', variants: ['300', '400', '500', '700'] },
  { family: 'Open Sans', category: 'sans-serif', variants: ['300', '400', '600', '700'] },
  { family: 'Lato', category: 'sans-serif', variants: ['300', '400', '700'] },
  { family: 'Montserrat', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Poppins', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Nunito', category: 'sans-serif', variants: ['300', '400', '600', '700'] },
  { family: 'Raleway', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Work Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Rubik', category: 'sans-serif', variants: ['300', '400', '500', '700'] },
  { family: 'Nunito Sans', category: 'sans-serif', variants: ['300', '400', '600', '700'] },
  { family: 'Quicksand', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Mukta', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Karla', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Cabin', category: 'sans-serif', variants: ['400', '500', '600', '700'] },
  { family: 'Barlow', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'DM Sans', category: 'sans-serif', variants: ['400', '500', '700'] },
  { family: 'Manrope', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Plus Jakarta Sans', category: 'sans-serif', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Source Sans 3', category: 'sans-serif', variants: ['300', '400', '600', '700'] },
  // Serif
  { family: 'Merriweather', category: 'serif', variants: ['300', '400', '700'] },
  { family: 'Playfair Display', category: 'serif', variants: ['400', '500', '600', '700'] },
  { family: 'Lora', category: 'serif', variants: ['400', '500', '600', '700'] },
  { family: 'PT Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'Libre Baskerville', category: 'serif', variants: ['400', '700'] },
  { family: 'Noto Serif', category: 'serif', variants: ['400', '700'] },
  { family: 'Crimson Text', category: 'serif', variants: ['400', '600', '700'] },
  { family: 'Source Serif 4', category: 'serif', variants: ['300', '400', '600', '700'] },
  { family: 'EB Garamond', category: 'serif', variants: ['400', '500', '600', '700'] },
  { family: 'Bitter', category: 'serif', variants: ['300', '400', '500', '600', '700'] },
  // Display
  { family: 'Bebas Neue', category: 'display', variants: ['400'] },
  { family: 'Abril Fatface', category: 'display', variants: ['400'] },
  { family: 'Righteous', category: 'display', variants: ['400'] },
  { family: 'Fredoka', category: 'display', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Lilita One', category: 'display', variants: ['400'] },
  { family: 'Titan One', category: 'display', variants: ['400'] },
  { family: 'Bungee', category: 'display', variants: ['400'] },
  { family: 'Lobster', category: 'display', variants: ['400'] },
  { family: 'Pacifico', category: 'display', variants: ['400'] },
  { family: 'Permanent Marker', category: 'display', variants: ['400'] },
  // Handwriting
  { family: 'Dancing Script', category: 'handwriting', variants: ['400', '500', '600', '700'] },
  { family: 'Caveat', category: 'handwriting', variants: ['400', '500', '600', '700'] },
  { family: 'Indie Flower', category: 'handwriting', variants: ['400'] },
  { family: 'Shadows Into Light', category: 'handwriting', variants: ['400'] },
  { family: 'Kalam', category: 'handwriting', variants: ['300', '400', '700'] },
  // Monospace
  { family: 'Fira Code', category: 'monospace', variants: ['300', '400', '500', '600', '700'] },
  { family: 'JetBrains Mono', category: 'monospace', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Source Code Pro', category: 'monospace', variants: ['300', '400', '500', '600', '700'] },
  { family: 'Roboto Mono', category: 'monospace', variants: ['300', '400', '500', '700'] },
  { family: 'IBM Plex Mono', category: 'monospace', variants: ['300', '400', '500', '600', '700'] },
]

/**
 * Get the Google Fonts CSS URL for a given font family.
 * Uses the CSS2 API which requires no API key.
 */
export function getFontCssUrl(family: string, weights?: string[]): string {
  const encoded = family.replace(/ /g, '+')
  const wghts = weights?.join(';') || '400;700'
  return `https://fonts.googleapis.com/css2?family=${encoded}:wght@${wghts}&display=swap`
}

/**
 * Get the CSS font-family declaration for a Google Font.
 */
export function getFontFamily(family: string, category: string): string {
  return `'${family}', ${category}`
}
