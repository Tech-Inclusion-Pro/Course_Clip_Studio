import { Sun, Moon, Monitor } from 'lucide-react'
import { useAppStore, type ThemeMode } from '@/stores/useAppStore'

const themeOrder: ThemeMode[] = ['light', 'dark', 'system']

const themeLabels: Partial<Record<ThemeMode, string>> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme',
  sepia: 'Sepia theme',
  midnight: 'Midnight theme',
  forest: 'Forest theme',
  ocean: 'Ocean theme'
}

const themeIcons: Partial<Record<ThemeMode, typeof Sun>> = {
  light: Sun,
  dark: Moon,
  system: Monitor
}

export function ThemeToggle(): JSX.Element {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  const idx = themeOrder.indexOf(theme)
  const nextTheme = themeOrder[(idx >= 0 ? idx + 1 : 0) % themeOrder.length]
  const Icon = themeIcons[theme] ?? Sun
  const label = themeLabels[theme] ?? theme
  const nextLabel = themeLabels[nextTheme] ?? nextTheme

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      className="
        min-tap-target inline-flex items-center justify-center
        rounded-[var(--radius-md)] p-2
        text-[var(--icon-default)] hover:text-[var(--text-primary)]
        hover:bg-[var(--bg-hover)]
        transition-colors duration-[var(--duration-fast)]
        cursor-pointer
      "
      aria-label={`Current: ${label}. Switch to ${nextLabel}`}
      title={String(label)}
    >
      <Icon size={20} />
    </button>
  )
}
