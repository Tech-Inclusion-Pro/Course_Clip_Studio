import { useState } from 'react'
import { Image, Upload, AlertTriangle } from 'lucide-react'
import type { MediaBlock } from '@/types/course'

interface MediaBlockEditorProps {
  block: MediaBlock
  onUpdate: (partial: Partial<MediaBlock>) => void
}

export function MediaBlockEditor({ block, onUpdate }: MediaBlockEditorProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false)
  const hasImage = !!block.assetPath
  const missingAlt = !block.altText

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('image/')) {
      const filePath = window.electronAPI.webUtils.getPathForFile(files[0]) || files[0].path
      onUpdate({ assetPath: filePath })
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(true)
  }

  function handleDragLeave() {
    setDragOver(false)
  }

  function handleFileSelect() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        onUpdate({ assetPath: file.path })
      }
    }
    input.click()
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Media block editor"
    >
      {/* Image area */}
      <div
        className={`
          relative min-h-[160px] flex flex-col items-center justify-center
          transition-colors duration-[var(--duration-fast)]
          ${dragOver ? 'bg-[var(--brand-magenta)]/10 border-[var(--brand-magenta)]' : 'bg-[var(--bg-muted)]'}
          ${!hasImage ? 'cursor-pointer' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!hasImage ? handleFileSelect : undefined}
        role="button"
        tabIndex={hasImage ? -1 : 0}
        aria-label={hasImage ? 'Image preview' : 'Click or drag to add image'}
        onKeyDown={(e) => {
          if (!hasImage && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            handleFileSelect()
          }
        }}
      >
        {hasImage ? (
          <div className="relative w-full">
            <img
              src={`file://${block.assetPath}`}
              alt={block.altText || 'Image preview'}
              className="w-full max-h-[300px] object-contain"
              onError={(e) => {
                // Show path as text if image can't be loaded
                (e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleFileSelect()
              }}
              className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
              aria-label="Change image"
              title="Change image"
            >
              <Upload size={14} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <Image size={32} className="text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              Click or drag an image here
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Supports JPG, PNG, GIF, SVG, WebP
            </p>
          </div>
        )}
      </div>

      {/* Filename bar */}
      {hasImage && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-muted)] border-t border-[var(--border-default)] text-xs text-[var(--text-secondary)]">
          <Image size={12} className="shrink-0 text-[var(--text-tertiary)]" />
          <span className="truncate" title={block.assetPath}>{block.assetPath.split('/').pop()}</span>
        </div>
      )}

      {/* Fields */}
      <div className="p-3 space-y-3 border-t border-[var(--border-default)]">
        {/* Asset path */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Image Path
          </label>
          <input
            type="text"
            value={block.assetPath}
            onChange={(e) => onUpdate({ assetPath: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="Path to image file..."
          />
        </div>

        {/* Alt text (required) */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Alt Text <span className="text-[var(--color-danger-600)]">*</span>
          </label>
          <input
            type="text"
            value={block.altText}
            onChange={(e) => onUpdate({ altText: e.target.value })}
            className={`w-full px-2.5 py-1.5 text-sm rounded-md border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] ${
              missingAlt ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]'
            }`}
            placeholder="Describe this image for screen readers..."
            aria-required="true"
            aria-invalid={missingAlt}
          />
          {missingAlt && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle size={12} className="text-[var(--color-danger-600)]" />
              <p className="text-xs text-[var(--color-danger-600)]">
                Alt text is required before publishing (WCAG 1.1.1)
              </p>
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Caption
          </label>
          <input
            type="text"
            value={block.caption}
            onChange={(e) => onUpdate({ caption: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="Optional visible caption..."
          />
        </div>
      </div>
    </div>
  )
}
