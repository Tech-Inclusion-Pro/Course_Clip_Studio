interface CompletionDonutProps {
  percentage: number
  size?: number
  label?: string
}

export function CompletionDonut({ percentage, size = 120, label = 'Completion' }: CompletionDonutProps): JSX.Element {
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percentage / 100) * circumference
  const center = size / 2

  return (
    <div className="flex flex-col items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${label}: ${percentage}%`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--border-default)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--brand-magenta)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className="text-lg font-[var(--font-weight-semibold)]"
          fill="var(--text-primary)"
        >
          {percentage}%
        </text>
      </svg>
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
    </div>
  )
}
