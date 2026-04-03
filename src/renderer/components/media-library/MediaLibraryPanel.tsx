import { useEffect, useMemo } from 'react'
import { X, Search, Palette } from 'lucide-react'
import { useMediaLibraryStore } from '@/stores/useMediaLibraryStore'
import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { AllAssetsTab } from './AllAssetsTab'
import { BuiltInTab } from './BuiltInTab'
import { SearchOnlineTab } from './SearchOnlineTab'
import { MyUploadsTab } from './MyUploadsTab'
import { GeneratedTab } from './GeneratedTab'
import { AssetMetadataEditor } from './AssetMetadataEditor'
import { ColorPaletteManager } from './ColorPaletteManager'
import type { MediaLibraryTab, MediaAsset, AssetMetadata } from '@/types/media'

const TABS: Array<{ id: MediaLibraryTab; label: string }> = [
  { id: 'all', label: 'All Assets' },
  { id: 'built-in', label: 'Built-In' },
  { id: 'search-online', label: 'Search Online' },
  { id: 'my-uploads', label: 'My Uploads' },
  { id: 'generated', label: 'Generated' }
]

interface MediaLibraryPanelProps {
  onClose?: () => void
  onInsertAsset?: (asset: MediaAsset) => void
}

export function MediaLibraryPanel({ onClose, onInsertAsset }: MediaLibraryPanelProps): JSX.Element {
  const activeTab = useMediaLibraryStore((s) => s.activeTab)
  const setTab = useMediaLibraryStore((s) => s.setTab)
  const filters = useMediaLibraryStore((s) => s.filters)
  const setFilter = useMediaLibraryStore((s) => s.setFilter)
  const builtInAssets = useMediaLibraryStore((s) => s.builtInAssets)
  const projectAssets = useMediaLibraryStore((s) => s.projectAssets)
  const globalAssets = useMediaLibraryStore((s) => s.globalAssets)
  const loadManifests = useMediaLibraryStore((s) => s.loadManifests)
  const metadataEditorOpen = useMediaLibraryStore((s) => s.metadataEditorOpen)
  const metadataEditorAssetId = useMediaLibraryStore((s) => s.metadataEditorAssetId)
  const closeMetadataEditor = useMediaLibraryStore((s) => s.closeMetadataEditor)
  const updateAssetMetadata = useMediaLibraryStore((s) => s.updateAssetMetadata)
  const colorPaletteManagerOpen = useMediaLibraryStore((s) => s.colorPaletteManagerOpen)
  const toggleColorPaletteManager = useMediaLibraryStore((s) => s.toggleColorPaletteManager)

  const workspacePath = useAppStore((s) => s.workspacePath)
  const course = useCourseStore((s) => s.getActiveCourse())

  // Load manifests on mount
  useEffect(() => {
    if (workspacePath && course) {
      loadManifests(workspacePath, course)
    }
  }, [workspacePath, course, loadManifests])

  // Total asset count
  const totalCount = useMemo(() => {
    const ids = new Set<string>()
    for (const a of builtInAssets) ids.add(a.metadata.id)
    for (const a of projectAssets) ids.add(a.metadata.id)
    for (const a of globalAssets) ids.add(a.metadata.id)
    return ids.size
  }, [builtInAssets, projectAssets, globalAssets])

  // Find asset being edited
  const editingAsset = useMemo(() => {
    if (!metadataEditorAssetId) return null
    return (
      projectAssets.find((a) => a.metadata.id === metadataEditorAssetId) ??
      globalAssets.find((a) => a.metadata.id === metadataEditorAssetId) ??
      null
    )
  }, [metadataEditorAssetId, projectAssets, globalAssets])

  function handleMetadataSave(updates: Partial<AssetMetadata>) {
    if (!metadataEditorAssetId || !workspacePath || !course) return
    updateAssetMetadata(metadataEditorAssetId, updates, workspacePath, course)
    closeMetadataEditor()
  }

  function handleInsert(asset: MediaAsset) {
    onInsertAsset?.(asset)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-default)] shrink-0">
        <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          Media Library
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={toggleColorPaletteManager}
            className="p-1.5 rounded-md cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-brand)] hover:bg-[var(--bg-hover)] transition-colors"
            aria-label="Color Palette Manager"
            title="Color Palette Manager"
          >
            <Palette size={14} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
              aria-label="Close media library"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Tab strip */}
      <div className="flex border-b border-[var(--border-default)] shrink-0 overflow-x-auto">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`
              px-2.5 py-1.5 text-[11px] font-[var(--font-weight-medium)] whitespace-nowrap cursor-pointer
              transition-colors duration-[var(--duration-fast)]
              ${activeTab === tab.id
                ? 'text-[var(--text-brand)] border-b-2 border-[var(--text-brand)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="px-3 py-2 shrink-0">
        <div className="relative">
          <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="search"
            value={filters.search}
            onChange={(e) => setFilter('search', e.target.value)}
            placeholder="Search assets..."
            className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            aria-label="Search assets"
          />
        </div>
      </div>

      {/* Filter row */}
      <div className="flex items-center gap-1.5 px-3 pb-2 shrink-0 flex-wrap">
        <MiniSelect
          label="Type"
          value={filters.assetType}
          onChange={(v) => setFilter('assetType', v)}
          options={[
            { value: 'all', label: 'All Types' },
            { value: 'icon', label: 'Icons' },
            { value: 'shape', label: 'Shapes' },
            { value: 'text-shape', label: 'Text Shapes' },
            { value: 'image', label: 'Images' },
            { value: 'video', label: 'Video' },
            { value: 'audio', label: 'Audio' },
            { value: 'document', label: 'Documents' }
          ]}
        />
        <MiniSelect
          label="UDL"
          value={filters.udlTag}
          onChange={(v) => setFilter('udlTag', v)}
          options={[
            { value: 'all', label: 'All UDL' },
            { value: 'representation', label: 'Representation' },
            { value: 'action-expression', label: 'Action & Expr.' },
            { value: 'engagement', label: 'Engagement' },
            { value: 'multiple', label: 'Multiple' }
          ]}
        />
        <MiniSelect
          label="A11y"
          value={filters.wcagStatus}
          onChange={(v) => setFilter('wcagStatus', v)}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'complete', label: 'Complete' },
            { value: 'incomplete', label: 'Incomplete' },
            { value: 'flagged', label: 'Flagged' }
          ]}
        />
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'all' && <AllAssetsTab onInsert={handleInsert} />}
        {activeTab === 'built-in' && <BuiltInTab onInsert={handleInsert} />}
        {activeTab === 'search-online' && <SearchOnlineTab />}
        {activeTab === 'my-uploads' && <MyUploadsTab onInsert={handleInsert} />}
        {activeTab === 'generated' && <GeneratedTab onInsert={handleInsert} />}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-[var(--border-default)] text-[10px] text-[var(--text-tertiary)] shrink-0">
        <span>{totalCount} assets available</span>
        <span>{projectAssets.length} in project</span>
      </div>

      {/* Metadata editor modal */}
      <AssetMetadataEditor
        open={metadataEditorOpen}
        initialData={editingAsset?.metadata ?? null}
        onSave={handleMetadataSave}
        onClose={closeMetadataEditor}
      />

      {/* Color Palette Manager modal */}
      {colorPaletteManagerOpen && (
        <ColorPaletteManager onClose={toggleColorPaletteManager} />
      )}
    </div>
  )
}

// ─── Mini Filter Select ───

function MiniSelect({
  label,
  value,
  onChange,
  options
}: {
  label: string
  value: string
  onChange: (v: string) => void
  options: Array<{ value: string; label: string }>
}): JSX.Element {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-1.5 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] cursor-pointer"
      aria-label={`Filter by ${label}`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
