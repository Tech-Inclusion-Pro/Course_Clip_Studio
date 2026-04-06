import { Keyboard } from 'lucide-react'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { useHotkeyStore } from '@/stores/useHotkeyStore'
import { formatKeyForDisplay, getPlatform } from '@/lib/hotkey-utils'
import type { HotkeyCategory, HotkeyDefinition } from '@/types/hotkeys'

const CATEGORY_LABELS: Record<HotkeyCategory, string> = {
  global: 'Global Shortcuts',
  recording: 'Recording Panel',
  'slide-editor': 'Slide Editor',
  timeline: 'Timeline Editor',
  text: 'Text Formatting',
  media: 'Media Library',
  syllabus: 'Syllabus Builder',
  export: 'Export',
  accessibility: 'Accessibility'
}

const CATEGORY_ORDER: HotkeyCategory[] = [
  'global', 'recording', 'slide-editor', 'timeline',
  'text', 'media', 'syllabus', 'export', 'accessibility'
]

function ShortcutKbd({ binding }: { binding: string }): JSX.Element {
  const platform = getPlatform()
  const display = formatKeyForDisplay(binding, platform)
  const keys = platform === 'mac' ? [display] : display.split('+')

  return (
    <span className="inline-flex items-center gap-0.5">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center min-w-[22px] h-5 px-1
            rounded border border-[var(--border-default)] bg-[var(--bg-app)]
            text-[11px] font-mono text-[var(--text-secondary)]
            shadow-[0_1px_0_var(--border-default)]"
        >
          {key.trim()}
        </kbd>
      ))}
    </span>
  )
}

function ShortcutRow({ hotkey }: { hotkey: HotkeyDefinition }): JSX.Element {
  const platform = getPlatform()
  const binding = hotkey.current[platform]

  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border-default)] last:border-b-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm text-[var(--text-primary)]">{hotkey.label}</div>
        <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{hotkey.description}</div>
      </div>
      <div className="flex-shrink-0 ml-4">
        <ShortcutKbd binding={binding} />
      </div>
    </div>
  )
}

export function KeyboardShortcutsSettingsPanel(): JSX.Element {
  const getHotkeysForCategory = useHotkeyStore((s) => s.getHotkeysForCategory)

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--text-secondary)]">
        View all keyboard shortcuts available in Course Clip Studio.
        Press <ShortcutKbd binding={getPlatform() === 'mac' ? 'Cmd+/' : 'Ctrl+/'} /> anywhere to open the quick reference panel.
      </p>

      {CATEGORY_ORDER.map((category) => {
        const hotkeys = getHotkeysForCategory(category)
        if (hotkeys.length === 0) return null

        return (
          <SettingsCard key={category} title={CATEGORY_LABELS[category]} icon={Keyboard}>
            <div className="space-y-0">
              {hotkeys.map((h) => (
                <ShortcutRow key={h.id} hotkey={h} />
              ))}
            </div>
          </SettingsCard>
        )
      })}
    </div>
  )
}
