interface Guide {
  type: 'vertical' | 'horizontal'
  position: number
  start: number
  end: number
}

interface SmartGuidesProps {
  guides: Guide[]
}

export function SmartGuides({ guides }: SmartGuidesProps): JSX.Element {
  return (
    <svg className="absolute inset-0 pointer-events-none z-50" aria-hidden="true">
      {guides.map((guide, i) => (
        <line
          key={i}
          x1={guide.type === 'vertical' ? guide.position : guide.start}
          y1={guide.type === 'horizontal' ? guide.position : guide.start}
          x2={guide.type === 'vertical' ? guide.position : guide.end}
          y2={guide.type === 'horizontal' ? guide.position : guide.end}
          stroke="#e11d48"
          strokeWidth="1"
          strokeDasharray="4 2"
        />
      ))}
    </svg>
  )
}

export type { Guide }
