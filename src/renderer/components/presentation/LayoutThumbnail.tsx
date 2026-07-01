import type { ThumbnailRegion } from '@/types/presentation'

interface LayoutThumbnailProps {
  regions: ThumbnailRegion[]
  selected?: boolean
  width?: number
}

const REGION_FILLS: Record<ThumbnailRegion['kind'], string> = {
  text: '#94a3b8',
  image: '#7dd3fc',
  accent: 'var(--color-accent, #d946ef)'
}

export function LayoutThumbnail({ regions, selected, width = 96 }: LayoutThumbnailProps): JSX.Element {
  const height = width * (9 / 16)

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 160 90"
      className={`rounded border ${selected ? 'border-[var(--border-accent)] ring-2 ring-[var(--border-accent)]' : 'border-[var(--border-default)]'}`}
      style={{ background: 'var(--bg-surface, #fff)' }}
    >
      {regions.map((r, i) => (
        <rect
          key={i}
          x={(r.x / 100) * 160}
          y={(r.y / 100) * 90}
          width={(r.w / 100) * 160}
          height={(r.h / 100) * 90}
          rx={2}
          fill={REGION_FILLS[r.kind]}
          opacity={r.kind === 'accent' ? 0.7 : 0.35}
        />
      ))}
    </svg>
  )
}
