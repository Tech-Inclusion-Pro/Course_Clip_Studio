// ─── Translation Loading Banner ───

import { Loader2 } from 'lucide-react'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { getLanguage } from '@/lib/i18n/languages'

export function TranslationBanner(): JSX.Element | null {
  const isTranslating = useLocaleStore((s) => s.isTranslating)
  const translationProgress = useLocaleStore((s) => s.translationProgress)
  const activeLanguage = useLocaleStore((s) => s.activeLanguage)
  const error = useLocaleStore((s) => s.error)

  if (!isTranslating && !error) return null

  const lang = getLanguage(activeLanguage)
  const nativeName = lang?.nativeName ?? activeLanguage

  if (error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-xs bg-red-500/10 text-red-400 border-b border-red-500/20">
        <span>Translation failed: {error}. Using English fallbacks.</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-xs bg-[var(--brand-magenta)]/10 text-[var(--text-secondary)] border-b border-[var(--border-default)]">
      <Loader2 size={12} className="animate-spin" />
      <span>Translating to {nativeName}...</span>
      <div className="flex-1 max-w-48 h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
        <div
          className="h-full rounded-full bg-[var(--brand-magenta)] transition-[width] duration-300"
          style={{ width: `${translationProgress}%` }}
        />
      </div>
      <span>{translationProgress}%</span>
    </div>
  )
}
