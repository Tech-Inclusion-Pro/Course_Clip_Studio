import type { MediaAsset } from '@/types/media'
import { getBuiltInSvg } from '@/lib/built-in-assets'

interface AssetTileProps {
  asset: MediaAsset
  selected: boolean
  onSelect: () => void
  onDoubleClick?: () => void
}

const WCAG_DOT: Record<string, string> = {
  complete: '#16a34a',
  incomplete: '#d97706',
  flagged: '#dc2626'
}

const TYPE_LABELS: Record<string, string> = {
  icon: 'Icon',
  shape: 'Shape',
  'text-shape': 'Text',
  image: 'Image',
  video: 'Video',
  audio: 'Audio',
  document: 'Doc',
  chart: 'Chart',
  diagram: 'Diagram',
  'animated-block': 'Anim',
  animation: 'Anim'
}

export function AssetTile({ asset, selected, onSelect, onDoubleClick }: AssetTileProps): JSX.Element {
  const isBuiltIn = asset.filePath.startsWith('built-in://')
  const svg = isBuiltIn ? getBuiltInSvg(asset.metadata.id) : null

  return (
    <button
      role="gridcell"
      aria-selected={selected}
      aria-label={asset.metadata.altText || asset.metadata.title}
      onClick={onSelect}
      onDoubleClick={onDoubleClick}
      className={`
        relative flex flex-col items-center gap-1 p-2 rounded-lg
        cursor-pointer transition-all duration-[var(--duration-fast)]
        focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
        ${selected
          ? 'bg-[var(--bg-active)] ring-2 ring-[var(--ring-brand)]'
          : 'bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)]'
        }
      `}
    >
      {/* Thumbnail */}
      <div className="w-full aspect-square flex items-center justify-center rounded-md bg-[var(--bg-muted)] overflow-hidden">
        {svg ? (
          <div
            className="w-3/4 h-3/4"
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : asset.type === 'image' ? (
          <img
            src={`file://${asset.filePath}`}
            alt={asset.metadata.altText || asset.metadata.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-xs text-[var(--text-tertiary)]">
            {TYPE_LABELS[asset.type] ?? asset.type}
          </span>
        )}
      </div>

      {/* Type badge */}
      <span className="absolute top-1 left-1 px-1 py-0.5 text-[9px] font-[var(--font-weight-semibold)] uppercase rounded bg-black/40 text-white leading-none">
        {TYPE_LABELS[asset.type] ?? asset.type}
      </span>

      {/* WCAG status dot */}
      <span
        className="absolute top-1 right-1 w-2 h-2 rounded-full"
        style={{ backgroundColor: WCAG_DOT[asset.metadata.wcagStatus] ?? '#d97706' }}
        title={`Accessibility: ${asset.metadata.wcagStatus}`}
      />

      {/* Title */}
      <span className="w-full text-[10px] text-[var(--text-primary)] truncate text-center leading-tight">
        {asset.metadata.title}
      </span>
    </button>
  )
}
