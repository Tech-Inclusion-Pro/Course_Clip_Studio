import { Settings, Palette, Keyboard, Info } from 'lucide-react'

interface SettingsSectionProps {
  icon: typeof Settings
  title: string
  description: string
}

function SettingsSection({ icon: Icon, title, description }: SettingsSectionProps): JSX.Element {
  return (
    <div
      className="
        p-4 rounded-[var(--radius-lg)]
        bg-[var(--bg-surface)] border border-[var(--border-default)]
      "
    >
      <div className="flex items-center gap-3 mb-2">
        <Icon size={20} className="text-[var(--icon-default)]" />
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {title}
        </h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] pl-8">{description}</p>
    </div>
  )
}

export function SettingsView(): JSX.Element {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-6">
        Settings
      </h2>
      <div className="flex flex-col gap-3">
        <SettingsSection
          icon={Palette}
          title="Appearance"
          description="Theme, colors, and display preferences"
        />
        <SettingsSection
          icon={Keyboard}
          title="Keyboard Shortcuts"
          description="Customize keyboard shortcuts for common actions"
        />
        <SettingsSection
          icon={Settings}
          title="Editor"
          description="Default editor behavior and content settings"
        />
        <SettingsSection
          icon={Info}
          title="About"
          description="Application version and license information"
        />
      </div>
    </div>
  )
}
