import { contrastRatio, contrastLevel, formatRatio } from '@/lib/contrast'
import type { PresentationTheme, ContrastPair, ContrastReport } from '@/types/presentation'

export function verifyThemeContrast(theme: PresentationTheme): ContrastReport {
  const checks: Array<{ label: string; foreground: string; background: string }> = [
    { label: 'Text on background', foreground: theme.textPrimary, background: theme.background },
    { label: 'Text on surface', foreground: theme.textPrimary, background: theme.surface },
    { label: 'Text on accent', foreground: theme.textOnAccent, background: theme.accent },
    { label: 'Text on accent secondary', foreground: theme.textOnAccent, background: theme.accentSecondary }
  ]

  const pairs: ContrastPair[] = checks.map((check) => {
    const ratio = contrastRatio(check.foreground, check.background) ?? 1
    const level = contrastLevel(ratio)
    return {
      label: check.label,
      foreground: check.foreground,
      background: check.background,
      ratio,
      passAA: level.aa,
      passAALarge: level.aaLarge
    }
  })

  const allPass = pairs.every((p) => p.passAA)

  return { pairs, allPass, overrideReason: null }
}
