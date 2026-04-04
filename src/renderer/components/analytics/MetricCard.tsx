import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  subtitle?: string
}

export function MetricCard({ icon: Icon, label, value, subtitle }: MetricCardProps): JSX.Element {
  return (
    <div className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)]">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-[var(--brand-magenta)]" />
        <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-xl font-[var(--font-weight-semibold)] text-[var(--text-primary)]">{value}</div>
      {subtitle && (
        <div className="text-[10px] text-[var(--text-tertiary)] mt-0.5">{subtitle}</div>
      )}
    </div>
  )
}
