import { usePresentationStore } from '@/stores/usePresentationStore'
import { BRAND_THEMES } from '@/lib/presentation/themes'

export function ThemePicker(): JSX.Element {
  const themeId = usePresentationStore((s) => s.activeDraft?.themeId ?? 'lumina-light')
  const setThemeId = usePresentationStore((s) => s.setThemeId)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Theme:</span>
      <div className="flex gap-1.5">
        {BRAND_THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => setThemeId(theme.id)}
            className={`w-7 h-7 rounded-md border-2 cursor-pointer transition-all ${
              themeId === theme.id
                ? 'border-[var(--brand-magenta)] scale-110'
                : 'border-transparent hover:border-[var(--border-default)]'
            }`}
            style={{ background: theme.accent }}
            title={theme.name}
            aria-label={`Select ${theme.name} theme`}
          />
        ))}
      </div>
    </div>
  )
}
