/**
 * WCAG 2.1 contrast ratio utilities.
 * No external dependencies — implements the math directly.
 */

/**
 * Parse a hex color string to RGB components (0–255).
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.replace('#', '')
  let r: number, g: number, b: number

  if (cleaned.length === 3) {
    r = parseInt(cleaned[0] + cleaned[0], 16)
    g = parseInt(cleaned[1] + cleaned[1], 16)
    b = parseInt(cleaned[2] + cleaned[2], 16)
  } else if (cleaned.length === 6) {
    r = parseInt(cleaned.slice(0, 2), 16)
    g = parseInt(cleaned.slice(2, 4), 16)
    b = parseInt(cleaned.slice(4, 6), 16)
  } else {
    return null
  }

  if (isNaN(r) || isNaN(g) || isNaN(b)) return null
  return { r, g, b }
}

/**
 * Convert sRGB component (0–255) to linear value per WCAG spec.
 */
function sRGBtoLinear(value: number): number {
  const v = value / 255
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

/**
 * Compute relative luminance per WCAG 2.1 definition.
 * Returns a value between 0 (darkest) and 1 (lightest).
 */
export function relativeLuminance(hex: string): number | null {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return 0.2126 * sRGBtoLinear(rgb.r) + 0.7152 * sRGBtoLinear(rgb.g) + 0.0722 * sRGBtoLinear(rgb.b)
}

/**
 * Compute WCAG 2.1 contrast ratio between two colors.
 * Returns a value between 1 and 21.
 */
export function contrastRatio(hex1: string, hex2: string): number | null {
  const l1 = relativeLuminance(hex1)
  const l2 = relativeLuminance(hex2)
  if (l1 === null || l2 === null) return null

  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if a contrast ratio passes WCAG 2.1 criteria.
 */
export function contrastLevel(ratio: number): {
  aa: boolean
  aaLarge: boolean
  aaa: boolean
  aaaLarge: boolean
} {
  return {
    aa: ratio >= 4.5,        // Normal text AA
    aaLarge: ratio >= 3,     // Large text AA
    aaa: ratio >= 7,         // Normal text AAA
    aaaLarge: ratio >= 4.5   // Large text AAA
  }
}

/**
 * Format a contrast ratio for display (e.g. "4.5:1").
 */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`
}

/**
 * Get a human-readable label for a contrast ratio.
 */
export function contrastLabel(ratio: number): {
  label: string
  color: string
} {
  if (ratio >= 7) return { label: 'AAA', color: '#16a34a' }
  if (ratio >= 4.5) return { label: 'AA', color: '#16a34a' }
  if (ratio >= 3) return { label: 'AA Large', color: '#d97706' }
  return { label: 'Fail', color: '#dc2626' }
}
