export function ColorInput({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}): JSX.Element {
  return (
    <div>
      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-[var(--border-default)] cursor-pointer p-0.5"
        />
        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{value}</span>
      </div>
    </div>
  )
}
