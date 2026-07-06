import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { useAppStore } from '@/stores/useAppStore'
import { BRAND_THEMES, resolveTheme } from '@/lib/presentation/themes'
import { ThemeBuilder } from './ThemeBuilder'

export function ThemePicker(): JSX.Element {
  const themeId = usePresentationStore((s) => s.activeDraft?.themeId ?? 'lumina-light')
  const setThemeId = usePresentationStore((s) => s.setThemeId)
  const customThemes = useAppStore((s) => s.customPresentationThemes)

  const [builder, setBuilder] = useState<{ editingId?: string } | null>(null)

  const allThemes = [...BRAND_THEMES, ...customThemes]
  const selected = resolveTheme(themeId, customThemes)
  const isCustomSelected = customThemes.some((t) => t.id === themeId)

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Theme:</span>
      <div className="flex items-center gap-1.5">
        {allThemes.map((theme) => (
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
        {isCustomSelected && (
          <button
            onClick={() => setBuilder({ editingId: themeId })}
            className="w-7 h-7 rounded-md border border-[var(--border-default)] flex items-center justify-center cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
            title="Edit this custom theme"
            aria-label="Edit custom theme"
          >
            <Pencil size={13} />
          </button>
        )}
        <button
          onClick={() => setBuilder({})}
          className="w-7 h-7 rounded-md border border-dashed border-[var(--border-default)] flex items-center justify-center cursor-pointer text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]"
          title="New custom theme"
          aria-label="New custom theme"
        >
          <Plus size={14} />
        </button>
      </div>

      {builder && (
        <ThemeBuilder
          base={builder.editingId ? selected : BRAND_THEMES[0]}
          editingId={builder.editingId}
          onClose={() => setBuilder(null)}
        />
      )}
    </div>
  )
}
