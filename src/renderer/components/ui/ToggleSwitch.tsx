export function ToggleSwitch({
  checked,
  onChange,
  label
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}): JSX.Element {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors
        focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] focus:ring-offset-2
        ${checked ? 'bg-[var(--brand-magenta)]' : 'bg-[var(--border-default)]'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}
