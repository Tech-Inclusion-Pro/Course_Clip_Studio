export function FieldRow({
  label,
  description,
  children
}: {
  label: string
  description: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}
