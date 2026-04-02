// ─── Noto Font Loader ───

import { getFontUrl } from './languages'

const loadedFonts = new Set<string>()

/**
 * Load the appropriate Noto font for a given language code.
 * No-ops if font already loaded or language uses system fonts.
 */
export function loadFontForLanguage(code: string): void {
  const url = getFontUrl(code)
  if (!url || loadedFonts.has(code)) return

  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = url
  link.crossOrigin = 'anonymous'
  document.head.appendChild(link)

  loadedFonts.add(code)
}
