import { useMemo } from 'react'
import { useMediaLibraryStore } from '@/stores/useMediaLibraryStore'
import { AssetGrid } from './AssetGrid'
import type { MediaAsset } from '@/types/media'

interface AllAssetsTabProps {
  onInsert?: (asset: MediaAsset) => void
}

export function AllAssetsTab({ onInsert }: AllAssetsTabProps): JSX.Element {
  const builtInAssets = useMediaLibraryStore((s) => s.builtInAssets)
  const projectAssets = useMediaLibraryStore((s) => s.projectAssets)
  const globalAssets = useMediaLibraryStore((s) => s.globalAssets)
  const filters = useMediaLibraryStore((s) => s.filters)
  const selectedAssetId = useMediaLibraryStore((s) => s.selectedAssetId)
  const selectAsset = useMediaLibraryStore((s) => s.selectAsset)
  const isLoading = useMediaLibraryStore((s) => s.isLoading)

  const allAssets = useMemo(() => {
    const merged = [...builtInAssets, ...projectAssets, ...globalAssets]

    // Deduplicate by ID
    const seen = new Set<string>()
    const deduped: MediaAsset[] = []
    for (const a of merged) {
      if (!seen.has(a.metadata.id)) {
        seen.add(a.metadata.id)
        deduped.push(a)
      }
    }

    return deduped.filter((a) => {
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchTitle = a.metadata.title.toLowerCase().includes(q)
        const matchTags = a.metadata.tags.some((t) => t.toLowerCase().includes(q))
        const matchCategory = a.category.toLowerCase().includes(q)
        if (!matchTitle && !matchTags && !matchCategory) return false
      }
      if (filters.assetType !== 'all' && a.type !== filters.assetType) return false
      if (filters.tier !== 'all' && a.tier !== filters.tier) return false
      if (filters.wcagStatus !== 'all' && a.metadata.wcagStatus !== filters.wcagStatus) return false
      if (filters.udlTag !== 'all' && a.metadata.udlTag !== filters.udlTag) return false
      if (filters.category !== 'all' && a.category !== filters.category) return false
      return true
    })
  }, [builtInAssets, projectAssets, globalAssets, filters])

  return (
    <AssetGrid
      assets={allAssets}
      selectedId={selectedAssetId}
      onSelect={selectAsset}
      onDoubleClick={onInsert}
      loading={isLoading}
      emptyMessage="No assets match your filters"
    />
  )
}
