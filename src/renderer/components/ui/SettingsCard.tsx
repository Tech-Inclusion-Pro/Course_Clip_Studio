import type { LucideIcon } from 'lucide-react'

export function SettingsCard({
  title,
  icon: Icon,
  children
}: {
  title: string
  icon: LucideIcon
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-muted)]">
        <Icon size={16} className="text-[var(--text-tertiary)]" />
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}
