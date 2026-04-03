import { useState } from 'react'
import { Video, Upload, AlertTriangle, Globe, HardDrive, FileText, Type, Search } from 'lucide-react'
import { useAssetUpload } from '@/hooks/useAssetUpload'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { transcriptPrompt } from '@/lib/ai/prompts'
import { AIGenerateButton } from '@/components/ui/AIGenerateButton'
import { StockSearchDialog } from '@/components/ui/StockSearchDialog'
import type { VideoBlock } from '@/types/course'

interface VideoBlockEditorProps {
  block: VideoBlock
  onUpdate: (partial: Partial<VideoBlock>) => void
}

/**
 * Parse SRT/VTT file content to plain text, re-wrapping to N words per line.
 */
function parseSrtToPlainText(content: string, wordsPerLine: number): string {
  // Remove VTT header
  let text = content.replace(/^WEBVTT[\s\S]*?\n\n/, '')
  // Remove cue indices (standalone numbers on their own line)
  text = text.replace(/^\d+\s*$/gm, '')
  // Remove timestamps (00:00:00,000 --> 00:00:00,000 or 00:00.000 --> 00:00.000)
  text = text.replace(/[\d:.,-]+\s*-->\s*[\d:.,-]+/g, '')
  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, '')
  // Collapse whitespace
  const words = text.split(/\s+/).filter(Boolean)
  if (wordsPerLine <= 0) return words.join(' ')
  const lines: string[] = []
  for (let i = 0; i < words.length; i += wordsPerLine) {
    lines.push(words.slice(i, i + wordsPerLine).join(' '))
  }
  return lines.join('\n')
}

export function VideoBlockEditor({ block, onUpdate }: VideoBlockEditorProps): JSX.Element {
  const [dragOver, setDragOver] = useState(false)
  const [transcriptMode, setTranscriptMode] = useState<'text' | 'srt'>(block.srtFileName ? 'srt' : 'text')
  const [srtDragOver, setSrtDragOver] = useState(false)
  const [stockOpen, setStockOpen] = useState(false)
  const copyAsset = useAssetUpload()
  const { generate: generateAI, isGenerating: isGeneratingTranscript, isConfigured: aiConfigured } = useAIGenerate()
  const missingTranscript = !block.transcript

  async function handleGenerateTranscript() {
    const filename = block.url?.split('/').pop() || 'video'
    const result = await generateAI(transcriptPrompt(`Video file: ${filename}. Source: ${block.source}.`))
    if (result) onUpdate({ transcript: result.trim() })
  }

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    if (files.length > 0 && files[0].type.startsWith('video/')) {
      const filePath = window.electronAPI.webUtils.getPathForFile(files[0]) || files[0].path
      const copied = await copyAsset(filePath)
      onUpdate({ url: copied, source: 'upload' })
    }
  }

  function handleFileSelect() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'video/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        const copied = await copyAsset(file.path)
        onUpdate({ url: copied, source: 'upload' })
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
    // Re-parse if we have an SRT file
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
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setStockOpen(true) }}
                className="flex items-center gap-1 px-3 py-1.5 mt-1 text-xs font-medium text-[var(--brand-magenta)] border border-[var(--brand-magenta)] rounded-md hover:bg-[var(--brand-magenta)]/10 cursor-pointer"
              >
                <Search size={12} /> Search Stock Video
              </button>
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
        {/* Transcript mode toggle */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
              Transcript <span className="text-[var(--color-danger-600)]">*</span>
            </label>
            <AIGenerateButton
              onClick={handleGenerateTranscript}
              isGenerating={isGeneratingTranscript}
              disabled={!aiConfigured || !block.url}
              size="xs"
              title={aiConfigured ? 'Generate transcript with AI' : 'Configure AI provider in Settings'}
            />
          </div>
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
          <>
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
          </>
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

      <StockSearchDialog
        open={stockOpen}
        onClose={() => setStockOpen(false)}
        onSelect={(localPath) => onUpdate({ url: localPath, source: 'upload' })}
        mediaType="video"
        title="Search Stock Videos"
      />
    </div>
  )
}
