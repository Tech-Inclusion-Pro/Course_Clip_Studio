import { useRef, useCallback } from 'react'
import { AssetTile } from './AssetTile'
import type { MediaAsset } from '@/types/media'

interface AssetGridProps {
  assets: MediaAsset[]
  selectedId: string | null
  onSelect: (id: string) => void
  onDoubleClick?: (asset: MediaAsset) => void
  loading?: boolean
  emptyMessage?: string
}

export function AssetGrid({
  assets,
  selectedId,
  onSelect,
  onDoubleClick,
  loading,
  emptyMessage = 'No assets found'
}: AssetGridProps): JSX.Element {
  const gridRef = useRef<HTMLDivElement>(null)

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!assets.length) return
      const currentIndex = assets.findIndex((a) => a.metadata.id === selectedId)

      // Approximate 4 columns
      const cols = 4
      let nextIndex = currentIndex

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault()
          nextIndex = Math.min(currentIndex + 1, assets.length - 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          nextIndex = Math.max(currentIndex - 1, 0)
          break
        case 'ArrowDown':
          e.preventDefault()
          nextIndex = Math.min(currentIndex + cols, assets.length - 1)
          break
        case 'ArrowUp':
          e.preventDefault()
          nextIndex = Math.max(currentIndex - cols, 0)
          break
        case 'Enter':
        case ' ':
          e.preventDefault()
          if (currentIndex >= 0 && onDoubleClick) {
            onDoubleClick(assets[currentIndex])
          }
          return
        default:
          return
      }

      if (nextIndex !== currentIndex && nextIndex >= 0) {
        onSelect(assets[nextIndex].metadata.id)
        // Scroll tile into view
        const tile = gridRef.current?.children[nextIndex] as HTMLElement | undefined
        tile?.scrollIntoView({ block: 'nearest' })
      }
    },
    [assets, selectedId, onSelect, onDoubleClick]
  )

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="aspect-square rounded-lg bg-[var(--bg-muted)] animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (assets.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-[var(--text-tertiary)]">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div
      ref={gridRef}
      role="grid"
      aria-label="Asset grid"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 p-2 focus:outline-none"
    >
      {assets.map((asset) => (
        <AssetTile
          key={asset.metadata.id}
          asset={asset}
          selected={asset.metadata.id === selectedId}
          onSelect={() => onSelect(asset.metadata.id)}
          onDoubleClick={() => onDoubleClick?.(asset)}
        />
      ))}
    </div>
  )
}
