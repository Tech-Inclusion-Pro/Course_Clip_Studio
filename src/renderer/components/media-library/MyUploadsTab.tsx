import { useState, useCallback, useMemo } from 'react'
import { Upload, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useMediaLibraryStore } from '@/stores/useMediaLibraryStore'
import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { copyAssetToCourse } from '@/lib/asset-manager'
import { AssetGrid } from './AssetGrid'
import { AssetMetadataEditor } from './AssetMetadataEditor'
import { uid } from '@/lib/uid'
import type { MediaAsset, AssetType, AssetMetadata } from '@/types/media'

const FILE_TYPE_MAP: Record<string, AssetType> = {
  png: 'image', jpg: 'image', jpeg: 'image', gif: 'image', svg: 'image', webp: 'image',
  mp4: 'video', webm: 'video', mov: 'video',
  mp3: 'audio', wav: 'audio', ogg: 'audio', m4a: 'audio',
  pdf: 'document', docx: 'document', pptx: 'document'
}

const MIME_MAP: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif',
  svg: 'image/svg+xml', webp: 'image/webp',
  mp4: 'video/mp4', webm: 'video/webm', mov: 'video/quicktime',
  mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4',
  pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation'
}

// Max sizes in bytes
const MAX_SIZE: Partial<Record<AssetType, number>> = {
  image: 10 * 1024 * 1024,       // 10MB
  video: 500 * 1024 * 1024,      // 500MB
  audio: 50 * 1024 * 1024,       // 50MB
  document: 50 * 1024 * 1024     // 50MB
}

interface MyUploadsTabProps {
  onInsert?: (asset: MediaAsset) => void
}

export function MyUploadsTab({ onInsert }: MyUploadsTabProps): JSX.Element {
  const workspacePath = useAppStore((s) => s.workspacePath)
  const course = useCourseStore((s) => s.getActiveCourse())
  const projectAssets = useMediaLibraryStore((s) => s.projectAssets)
  const filters = useMediaLibraryStore((s) => s.filters)
  const selectedAssetId = useMediaLibraryStore((s) => s.selectedAssetId)
  const selectAsset = useMediaLibraryStore((s) => s.selectAsset)
  const addAsset = useMediaLibraryStore((s) => s.addAsset)

  const [metadataOpen, setMetadataOpen] = useState(false)
  const [pendingFile, setPendingFile] = useState<{ path: string; name: string; ext: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadedAssets = useMemo(() => {
    return projectAssets.filter((a) => {
      if (a.tier !== 'uploaded') return false
      if (filters.search) {
        const q = filters.search.toLowerCase()
        const matchTitle = a.metadata.title.toLowerCase().includes(q)
        const matchTags = a.metadata.tags.some((t) => t.toLowerCase().includes(q))
        if (!matchTitle && !matchTags) return false
      }
      return true
    })
  }, [projectAssets, filters.search])

  const handleFileSelect = useCallback(async () => {
    setError(null)
    try {
      const result = await window.electronAPI.dialog.openFile({
        filters: [
          { name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'] },
          { name: 'Video', extensions: ['mp4', 'webm', 'mov'] },
          { name: 'Audio', extensions: ['mp3', 'wav', 'ogg', 'm4a'] },
          { name: 'Documents', extensions: ['pdf', 'docx', 'pptx'] }
        ]
      })
      if (result.canceled || !result.filePaths.length) return

      const filePath = result.filePaths[0]
      const fileName = filePath.split(/[/\\]/).pop() ?? 'file'
      const ext = fileName.split('.').pop()?.toLowerCase() ?? ''

      // Validate type
      if (!FILE_TYPE_MAP[ext]) {
        setError(`Unsupported file type: .${ext}`)
        return
      }

      setPendingFile({ path: filePath, name: fileName, ext })
      setMetadataOpen(true)
    } catch (err) {
      console.error('File select failed:', err)
      setError('Failed to open file dialog')
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    setError(null)

    const files = e.dataTransfer.files
    if (!files.length) return

    const file = files[0]
    const filePath = window.electronAPI.webUtils.getPathForFile(file)
    const fileName = file.name
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''

    if (!FILE_TYPE_MAP[ext]) {
      setError(`Unsupported file type: .${ext}`)
      return
    }

    setPendingFile({ path: filePath, name: fileName, ext })
    setMetadataOpen(true)
  }, [])

  const handleMetadataSave = useCallback(async (metadata: Partial<AssetMetadata>) => {
    if (!pendingFile || !workspacePath || !course) return

    const ext = pendingFile.ext
    const assetType = FILE_TYPE_MAP[ext] ?? 'document'
    const maxSize = MAX_SIZE[assetType]

    // Copy to course assets
    let destPath: string
    try {
      destPath = await copyAssetToCourse(workspacePath, course, pendingFile.path)
    } catch {
      setError('Failed to copy file to project assets')
      setMetadataOpen(false)
      setPendingFile(null)
      return
    }

    const asset: MediaAsset = {
      metadata: {
        id: uid('asset'),
        title: metadata.title ?? pendingFile.name,
        altText: metadata.altText ?? '',
        longDescription: metadata.longDescription,
        ariaLabel: metadata.ariaLabel,
        source: metadata.source,
        license: metadata.license ?? 'CC0 (Public Domain)',
        udlTag: metadata.udlTag ?? 'representation',
        wcagStatus: metadata.altText ? (metadata.wcagStatus ?? 'incomplete') : 'incomplete',
        language: metadata.language ?? 'en',
        tags: metadata.tags ?? [],
        dateAdded: new Date().toISOString(),
        projectScope: metadata.projectScope ?? 'project'
      },
      type: assetType,
      tier: 'uploaded',
      filePath: destPath,
      category: assetType,
      mimeType: MIME_MAP[ext] ?? 'application/octet-stream',
      fileSize: maxSize // approximate; we don't have real size from dialog
    }

    await addAsset(asset, workspacePath, course)
    setMetadataOpen(false)
    setPendingFile(null)
  }, [pendingFile, workspacePath, course, addAsset])

  return (
    <div className="flex flex-col h-full">
      {/* Upload area */}
      <div className="p-3 shrink-0">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`
            flex flex-col items-center justify-center gap-2 p-4
            rounded-lg border-2 border-dashed transition-colors
            ${dragOver
              ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)]'
              : 'border-[var(--border-default)] bg-[var(--bg-muted)]'
            }
          `}
        >
          <Upload size={24} className="text-[var(--text-tertiary)]" />
          <p className="text-xs text-[var(--text-secondary)] text-center">
            Drag & drop files here
          </p>
          <Button variant="primary" size="sm" onClick={handleFileSelect}>
            <FolderOpen size={14} />
            Browse Files
          </Button>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            Images (10MB) · Video (500MB) · Audio (50MB) · Docs (50MB)
          </p>
        </div>

        {error && (
          <p className="mt-2 text-xs text-red-500">{error}</p>
        )}
      </div>

      {/* Uploaded assets grid */}
      <div className="flex-1 overflow-y-auto">
        <AssetGrid
          assets={uploadedAssets}
          selectedId={selectedAssetId}
          onSelect={selectAsset}
          onDoubleClick={onInsert}
          emptyMessage="No uploaded assets yet"
        />
      </div>

      {/* Metadata editor modal */}
      <AssetMetadataEditor
        open={metadataOpen}
        initialData={pendingFile ? { title: pendingFile.name.replace(/\.[^.]+$/, '') } : null}
        onSave={handleMetadataSave}
        onClose={() => { setMetadataOpen(false); setPendingFile(null) }}
        isNewAsset
      />
    </div>
  )
}
