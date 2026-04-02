import { useState } from 'react'
import { AudioLines, Upload, AlertTriangle, FileText, Type } from 'lucide-react'
import { useAssetUpload } from '@/hooks/useAssetUpload'
import type { AudioBlock } from '@/types/course'

interface AudioBlockEditorProps {
  block: AudioBlock
  onUpdate: (partial: Partial<AudioBlock>) => void
}

function parseSrtToPlainText(content: string, wordsPerLine: number): string {
  let text = content.replace(/^WEBVTT[\s\S]*?\n\n/, '')
  text = text.replace(/^\d+\s*$/gm, '')
  text = text.replace(/[\d:.,-]+\s*-->\s*[\d:.,-]+/g, '')
  text = text.replace(/<[^>]+>/g, '')
  const words = text.split(/\s+/).filter(Boolean)
  if (wordsPerLine <= 0) return words.join(' ')
  const lines: string[] = []
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '))
  }
  return lines.join('\n')
}

export function AudioBlockEditor({ block, onUpdate }: AudioBlockEditorProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false)
  const [transcriptMode, setTranscriptMode] = useState<'text' | 'srt'>(block.srtFileName ? 'srt' : 'text')
  const [srtDragOver, setSrtDragOver] = useState(false)
  const copyAsset = useAssetUpload()
  const hasAudio = !!block.assetPath
  const missingTranscript = !block.transcript

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('audio/')) {
      const filePath = window.electronAPI.webUtils.getPathForFile(files[0]) || files[0].path
      const copied = await copyAsset(filePath)
      onUpdate({ assetPath: copied })
    }
  }

  function handleFileSelect() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'audio/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        const copied = await copyAsset(file.path)
        onUpdate({ assetPath: copied })
      }
    }
    input.click()
  }

  async function handleSrtFile(filePath: string, fileName: string) {
    try {
      const copied = await copyAsset(filePath)
      const content = await window.electronAPI.fs.readFile(copied, 'utf-8')
      const plainText = parseSrtToPlainText(content, block.wordsPerLine || 10)
      onUpdate({
        srtFilePath: copied,
        srtFileName: fileName,
        transcript: plainText
      })
    } catch {
      // Failed to read file
    }
  }

  function handleSrtDrop(e: React.DragEvent) {
    e.preventDefault()
    setSrtDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const filePath = window.electronAPI.webUtils.getPathForFile(file) || file.path
      handleSrtFile(filePath, file.name)
    }
  }

  function handleSrtFileSelect() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.srt,.vtt'
    input.onchange = () => {
      const file = input.files?.[0]
      if (file) {
        handleSrtFile(file.path, file.name)
      }
    }
    input.click()
  }

  async function handleWordsPerLineChange(value: number) {
    onUpdate({ wordsPerLine: value })
    if (block.srtFilePath) {
      try {
        const content = await window.electronAPI.fs.readFile(block.srtFilePath, 'utf-8')
        const plainText = parseSrtToPlainText(content, value)
        onUpdate({ wordsPerLine: value, transcript: plainText })
      } catch {
        // File may no longer exist
      }
    }
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
            <div className="flex items-center gap-1.5 mb-2 text-xs text-[var(--text-secondary)]">
              <AudioLines size={12} className="shrink-0 text-[var(--text-tertiary)]" />
              <span className="truncate" title={block.assetPath}>{block.assetPath.split('/').pop()}</span>
            </div>
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
              <span className="text-xs text-[var(--text-secondary)] truncate flex-1" title={block.assetPath}>{block.assetPath.split('/').pop()}</span>
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
        {/* Transcript mode toggle */}
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
            Transcript <span className="text-[var(--color-danger-600)]">*</span>
          </label>
          <div className="flex items-center gap-1 bg-[var(--bg-muted)] rounded-md border border-[var(--border-default)] p-0.5">
            <button
              type="button"
              onClick={() => setTranscriptMode('text')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                transcriptMode === 'text'
                  ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={transcriptMode === 'text'}
            >
              <Type size={10} /> Text
            </button>
            <button
              type="button"
              onClick={() => setTranscriptMode('srt')}
              className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded cursor-pointer transition-colors ${
                transcriptMode === 'srt'
                  ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={transcriptMode === 'srt'}
            >
              <FileText size={10} /> SRT/VTT
            </button>
          </div>
        </div>

        {transcriptMode === 'srt' ? (
          <div className="space-y-2">
            {/* SRT file upload zone */}
            <div
              className={`min-h-[60px] flex flex-col items-center justify-center border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
                srtDragOver
                  ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/10'
                  : 'border-[var(--border-default)] hover:border-[var(--brand-magenta)]'
              }`}
              onDrop={handleSrtDrop}
              onDragOver={(e) => { e.preventDefault(); setSrtDragOver(true) }}
              onDragLeave={() => setSrtDragOver(false)}
              onClick={handleSrtFileSelect}
              role="button"
              tabIndex={0}
              aria-label="Upload SRT or VTT file"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleSrtFileSelect()
                }
              }}
            >
              {block.srtFileName ? (
                <div className="flex items-center gap-2 p-2">
                  <FileText size={14} className="text-[var(--brand-magenta)]" />
                  <span className="text-xs text-[var(--text-primary)]">{block.srtFileName}</span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">(click to replace)</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1 p-3">
                  <FileText size={20} className="text-[var(--text-tertiary)]" />
                  <p className="text-xs text-[var(--text-secondary)]">Drop .srt or .vtt file here</p>
                </div>
              )}
            </div>

            {/* Words per line */}
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--text-secondary)] whitespace-nowrap">Words per line:</label>
              <input
                type="number"
                min={1}
                max={50}
                value={block.wordsPerLine || 10}
                onChange={(e) => handleWordsPerLineChange(Number(e.target.value) || 10)}
                className="w-16 px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              />
            </div>

            {/* Parsed transcript preview */}
            {block.transcript && (
              <textarea
                value={block.transcript}
                onChange={(e) => onUpdate({ transcript: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                placeholder="Parsed transcript will appear here..."
              />
            )}
          </div>
        ) : (
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
        )}

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
