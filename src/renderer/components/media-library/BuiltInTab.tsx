import { useState, useMemo } from 'react'
import { useMediaLibraryStore } from '@/stores/useMediaLibraryStore'
import { BUILT_IN_CATEGORIES } from '@/lib/built-in-assets'
import { AssetGrid } from './AssetGrid'
import type { MediaAsset } from '@/types/media'

const TYPE_GROUPS = [
  { key: 'icon' as const, label: 'Icons' },
  { key: 'shape' as const, label: 'Shapes' },
  { key: 'text-shape' as const, label: 'Text Shapes' }
]

interface BuiltInTabProps {
  onInsert?: (asset: MediaAsset) => void
}

export function BuiltInTab({ onInsert }: BuiltInTabProps): JSX.Element {
  const builtInAssets = useMediaLibraryStore((s) => s.builtInAssets)
  const filters = useMediaLibraryStore((s) => s.filters)
  const selectedAssetId = useMediaLibraryStore((s) => s.selectedAssetId)
  const selectAsset = useMediaLibraryStore((s) => s.selectAsset)

  const [activeType, setActiveType] = useState<'icon' | 'shape' | 'text-shape'>('icon')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const categories = useMemo(
    () => BUILT_IN_CATEGORIES.filter((c) => c.parentType === activeType),
    [activeType]
  )

  const filteredAssets = useMemo(() => {
    return builtInAssets.filter((a) => {
      if (a.type !== activeType) return false
      if (activeCategory && a.category !== activeCategory) return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchTitle = a.metadata.title.toLowerCase().includes(q)
        const matchTags = a.metadata.tags.some((t) => t.toLowerCase().includes(q))
        if (!matchTitle && !matchTags) return false
      }
      return true
    })
  }, [builtInAssets, activeType, activeCategory, filters.search])

  return (
    <div className="flex flex-col h-full">
      {/* Type tabs */}
      <div className="flex border-b border-[var(--border-default)] shrink-0">
        {TYPE_GROUPS.map((g) => (
          <button
            key={g.key}
            onClick={() => { setActiveType(g.key); setActiveCategory(null) }}
            className={`
              flex-1 px-2 py-1.5 text-xs font-[var(--font-weight-medium)] cursor-pointer
              transition-colors duration-[var(--duration-fast)]
              ${activeType === g.key
                ? 'text-[var(--text-brand)] border-b-2 border-[var(--text-brand)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Category sidebar */}
        <div className="w-28 shrink-0 border-r border-[var(--border-default)] overflow-y-auto py-1">
          <button
            onClick={() => setActiveCategory(null)}
            className={`
              w-full text-left px-2 py-1 text-[10px] rounded cursor-pointer
              ${!activeCategory
                ? 'text-[var(--text-brand)] bg-[var(--bg-active)]'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
              }
            `}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`
                w-full text-left px-2 py-1 text-[10px] rounded cursor-pointer
                ${activeCategory === cat.id
                  ? 'text-[var(--text-brand)] bg-[var(--bg-active)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }
              `}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Asset grid */}
        <div className="flex-1 overflow-y-auto">
          <AssetGrid
            assets={filteredAssets}
            selectedId={selectedAssetId}
            onSelect={selectAsset}
            onDoubleClick={onInsert}
            emptyMessage="No built-in assets in this category"
          />
        </div>
      </div>
    </div>
  )
}
