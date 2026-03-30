import { useState } from 'react'
import { AudioLines, Upload, AlertTriangle } from 'lucide-react'
import type { AudioBlock } from '@/types/course'

interface AudioBlockEditorProps {
  block: AudioBlock
  onUpdate: (partial: Partial<AudioBlock>) => void
}

export function AudioBlockEditor({ block, onUpdate }: AudioBlockEditorProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false)
  const hasAudio = !!block.assetPath
  const missingTranscript = !block.transcript

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('audio/')) {
      onUpdate({ assetPath: files[0].path })
    }
  }

  function handleFileSelect() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
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
      aria-label="Audio block editor"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <AudioLines size={16} className="text-[var(--brand-magenta)]" />
        <span className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Audio</span>
      </div>

      {/* Audio upload area */}
      <div
        className={`relative min-h-[100px] flex flex-col items-center justify-center transition-colors ${
          dragOver ? 'bg-[var(--brand-magenta)]/10' : 'bg-[var(--bg-muted)]'
        } ${!hasAudio ? 'cursor-pointer' : ''}`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onClick={!hasAudio ? handleFileSelect : undefined}
        role="button"
        tabIndex={hasAudio ? -1 : 0}
        aria-label={hasAudio ? 'Audio file loaded' : 'Click or drag to add audio'}
        onKeyDown={(e) => {
          if (!hasAudio && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault()
            handleFileSelect()
          }
        }}
      >
        {hasAudio ? (
          <div className="w-full p-3">
            {/* Waveform visualizer placeholder */}
            <div className="flex items-center gap-3 mb-2">
              <AudioLines size={20} className="text-[var(--brand-magenta)]" />
              <div className="flex-1 h-8 bg-[var(--bg-surface)] rounded-md flex items-center px-2 gap-[2px]">
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-[var(--brand-magenta)] rounded-full opacity-60"
                    style={{ height: `${Math.max(4, Math.random() * 24)}px` }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)] truncate flex-1">{block.assetPath}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleFileSelect() }}
                className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
                aria-label="Change audio file"
              >
                <Upload size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <AudioLines size={32} className="text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">Click or drag an audio file here</p>
            <p className="text-xs text-[var(--text-tertiary)]">Supports MP3, WAV, OGG</p>
          </div>
        )}
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
          placeholder="Full transcript of the audio..."
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
