import { Sun, Moon, Monitor } from 'lucide-react'
import { useAppStore, type ThemeMode } from '@/stores/useAppStore'

const themeOrder: ThemeMode[] = ['light', 'dark', 'system']
const themeLabels: Record<ThemeMode, string> = {
  light: 'Light mode',
  dark: 'Dark mode',
  system: 'System theme'
}

const themeIcons: Record<ThemeMode, typeof Sun> = {
  light: Sun,
  dark: Moon,
  system: Monitor
}

export function ThemeToggle(): JSX.Element {
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
  const Icon = themeIcons[theme]

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
      aria-label={`Current: ${themeLabels[theme]}. Switch to ${themeLabels[nextTheme]}`}
      title={themeLabels[theme]}
    >
      <Icon size={20} />
    </button>
  )
}
