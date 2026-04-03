import { useMemo } from 'react'
import { BarChart3, GitBranch, Mic } from 'lucide-react'
import { useMediaLibraryStore } from '@/stores/useMediaLibraryStore'
import { AssetGrid } from './AssetGrid'
import type { MediaAsset } from '@/types/media'

interface GeneratedTabProps {
  onInsert?: (asset: MediaAsset) => void
}

export function GeneratedTab({ onInsert }: GeneratedTabProps): JSX.Element {
  const projectAssets = useMediaLibraryStore((s) => s.projectAssets)
  const selectedAssetId = useMediaLibraryStore((s) => s.selectedAssetId)
  const selectAsset = useMediaLibraryStore((s) => s.selectAsset)
  const filters = useMediaLibraryStore((s) => s.filters)

  const generatedAssets = useMemo(() => {
    return projectAssets.filter((a) => {
      if (a.tier !== 'generated') return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchTitle = a.metadata.title.toLowerCase().includes(q)
        const matchTags = a.metadata.tags.some((t) => t.toLowerCase().includes(q))
        if (!matchTitle && !matchTags) return false
      }
      return true
    })
  }, [projectAssets, filters.search])

  const tools = [
    { icon: BarChart3, label: 'Chart Builder', desc: 'Create accessible charts and graphs' },
    { icon: GitBranch, label: 'Diagram Builder', desc: 'Build flowcharts and process diagrams' },
    { icon: Mic, label: 'Narration Studio', desc: 'Record and edit audio narration' }
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Generator tools (Phase 2 stubs) */}
      <div className="p-3 space-y-2 shrink-0 border-b border-[var(--border-default)]">
        <p className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider">
          Create New
        </p>
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.label}
              disabled
              className="flex flex-col items-center gap-1 p-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] opacity-50 cursor-not-allowed"
              title="Coming in Phase 2"
            >
              <tool.icon size={16} className="text-[var(--text-tertiary)]" />
              <span className="text-[9px] text-[var(--text-tertiary)] text-center leading-tight">
                {tool.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)] text-center">
          Generation tools coming in Phase 2
        </p>
      </div>

      {/* Existing generated assets */}
      <div className="flex-1 overflow-y-auto">
        <AssetGrid
          assets={generatedAssets}
          selectedId={selectedAssetId}
          onSelect={selectAsset}
          onDoubleClick={onInsert}
          emptyMessage="No generated assets yet"
        />
      </div>
    </div>
  )
}
