import { useState } from 'react'
import { Video, Upload, AlertTriangle, Globe, HardDrive } from 'lucide-react'
import type { VideoBlock } from '@/types/course'

interface VideoBlockEditorProps {
  block: VideoBlock
  onUpdate: (partial: Partial<VideoBlock>) => void
}

export function VideoBlockEditor({ block, onUpdate }: VideoBlockEditorProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false)
  const missingTranscript = !block.transcript

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      onUpdate({ url: files[0].path, source: 'upload' })
    }
  }

  function handleFileSelect() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        onUpdate({ url: file.path, source: 'upload' })
      }
    }
    input.click()
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Video block editor"
    >
      {/* Source toggle */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <Video size={16} className="text-[var(--brand-magenta)]" />
        <span className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Video</span>
        <div className="ml-auto flex items-center gap-1 bg-[var(--bg-surface)] rounded-md border border-[var(--border-default)] p-0.5">
          <button
            type="button"
            onClick={() => onUpdate({ source: 'upload' })}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
              block.source === 'upload'
                ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            aria-pressed={block.source === 'upload'}
          >
            <HardDrive size={12} /> Upload
          </button>
          <button
            type="button"
            onClick={() => onUpdate({ source: 'embed' })}
            className={`flex items-center gap-1 px-2 py-1 text-xs rounded cursor-pointer transition-colors ${
              block.source === 'embed'
                ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
            aria-pressed={block.source === 'embed'}
          >
            <Globe size={12} /> Embed
          </button>
        </div>
      </div>

      {/* Video area */}
      {block.source === 'upload' ? (
        <div
          className={`relative min-h-[140px] flex flex-col items-center justify-center transition-colors ${
            dragOver ? 'bg-[var(--brand-magenta)]/10' : 'bg-[var(--bg-muted)]'
          } ${!block.url ? 'cursor-pointer' : ''}`}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onClick={!block.url ? handleFileSelect : undefined}
          role="button"
          tabIndex={block.url ? -1 : 0}
          aria-label={block.url ? 'Video preview' : 'Click or drag to add video'}
          onKeyDown={(e) => {
            if (!block.url && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              handleFileSelect()
            }
          }}
        >
          {block.url ? (
            <div className="w-full">
              <div className="flex items-center gap-2 p-3">
                <Video size={20} className="text-[var(--text-tertiary)]" />
                <span className="text-sm text-[var(--text-primary)] truncate flex-1">{block.url}</span>
                <button
                  onClick={(e) => { e.stopPropagation(); handleFileSelect() }}
                  className="p-1.5 rounded-md bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
                  aria-label="Change video"
                >
                  <Upload size={14} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 p-6 text-center">
              <Video size={32} className="text-[var(--text-tertiary)]" />
              <p className="text-sm text-[var(--text-secondary)]">Click or drag a video file here</p>
              <p className="text-xs text-[var(--text-tertiary)]">Supports MP4, WebM, OGG</p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-3">
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Embed URL
          </label>
          <input
            type="text"
            value={block.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="YouTube, Vimeo, or Loom URL..."
          />
        </div>
      )}

      {/* Poster */}
      <div className="p-3 border-t border-[var(--border-default)]">
        <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          Poster Image (optional)
        </label>
        <input
          type="text"
          value={block.poster}
          onChange={(e) => onUpdate({ poster: e.target.value })}
          className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          placeholder="Path to poster image..."
        />
      </div>

      {/* Transcript */}
      <div className="p-3 border-t border-[var(--border-default)]">
        <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          Transcript <span className="text-[var(--color-danger-600)]">*</span>
        </label>
        <textarea
          value={block.transcript}
          onChange={(e) => onUpdate({ transcript: e.target.value })}
          rows={3}
          className={`w-full px-2.5 py-1.5 text-sm rounded-md border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y ${
            missingTranscript ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]'
          }`}
          placeholder="Full transcript of the video..."
          aria-required="true"
          aria-invalid={missingTranscript}
        />
        {missingTranscript && (
          <div className="flex items-center gap-1 mt-1">
            <AlertTriangle size={12} className="text-[var(--color-danger-600)]" />
            <p className="text-xs text-[var(--color-danger-600)]">
              Transcript is required before publishing (WCAG 1.2.3)
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
