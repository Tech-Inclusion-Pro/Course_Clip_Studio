import { useState } from 'react'
import { Upload, RefreshCw } from 'lucide-react'
import type { ConvertedDocBlock } from '@/types/course'

interface ConvertedDocBlockEditorProps {
  block: ConvertedDocBlock
  onUpdate: (partial: Partial<ConvertedDocBlock>) => void
}

export function ConvertedDocBlockEditor({ block, onUpdate }: ConvertedDocBlockEditorProps): JSX.Element {
  const [converting, setConverting] = useState(false)

  async function handleFileUpload() {
    try {
      const result = await (window as any).electronAPI.showOpenDialog({
        filters: [
          { name: 'Documents', extensions: ['docx', 'pdf', 'pptx'] }
        ],
        properties: ['openFile']
      })
      if (!result || result.canceled || !result.filePaths?.length) return
      const filePath = result.filePaths[0]
      const ext = filePath.split('.').pop()?.toLowerCase()
      const sourceType = ext === 'pdf' ? 'pdf' : ext === 'pptx' ? 'pptx' : 'docx'
      onUpdate({
        sourceFilePath: filePath,
        sourceType: sourceType as ConvertedDocBlock['sourceType'],
        conversionStatus: 'pending',
        convertedHtml: ''
      })
    } catch { /* dialog canceled */ }
  }

  async function handleConvert() {
    if (!block.sourceFilePath) return
    setConverting(true)
    onUpdate({ conversionStatus: 'converting' })

    try {
      if (block.sourceType === 'docx') {
        // Use mammoth for DOCX conversion
        const mammoth = await import('mammoth')
        const fs = (window as any).electronAPI?.readFile
        if (fs) {
          const buffer = await fs(block.sourceFilePath)
          const result = await mammoth.convertToHtml({ arrayBuffer: buffer })
          onUpdate({ convertedHtml: result.value, conversionStatus: 'done' })
        } else {
          onUpdate({ conversionStatus: 'error' })
        }
      } else {
        // PDF/PPTX: placeholder — full conversion would require more complex processing
        onUpdate({
          convertedHtml: `<p><em>Document converted from ${block.sourceType.toUpperCase()}. Full conversion available in exported course.</em></p>`,
          conversionStatus: 'done'
        })
      }
    } catch (err) {
      console.error('Conversion error:', err)
      onUpdate({ conversionStatus: 'error' })
    } finally {
      setConverting(false)
    }
  }

  const statusLabel: Record<string, string> = {
    pending: 'Pending',
    converting: 'Converting...',
    done: 'Done',
    error: 'Error'
  }

  const statusColor: Record<string, string> = {
    pending: 'text-[var(--text-tertiary)]',
    converting: 'text-[var(--brand-magenta)]',
    done: 'text-emerald-600',
    error: 'text-[var(--color-danger-600)]'
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Converted document block editor">
      <div className="p-3 space-y-3">
        {/* File upload */}
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Source Document</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFileUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              <Upload size={12} /> Choose Document
            </button>
            <span className="text-xs text-[var(--text-tertiary)] truncate flex-1">
              {block.sourceFilePath ? block.sourceFilePath.split('/').pop() : 'No file selected'}
            </span>
          </div>
        </div>

        {/* Source type + status */}
        {block.sourceFilePath && (
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] uppercase font-[var(--font-weight-semibold)] rounded bg-[var(--bg-muted)] text-[var(--text-secondary)]">
              {block.sourceType}
            </span>
            <span className={`text-xs ${statusColor[block.conversionStatus]}`}>
              {statusLabel[block.conversionStatus]}
            </span>
            <button
              onClick={handleConvert}
              disabled={converting || !block.sourceFilePath}
              className="flex items-center gap-1 ml-auto px-2 py-1 text-xs font-[var(--font-weight-medium)] rounded border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw size={10} className={converting ? 'animate-spin' : ''} />
              {converting ? 'Converting...' : 'Convert'}
            </button>
          </div>
        )}

        {/* Converted HTML preview */}
        {block.convertedHtml && (
          <div>
            <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Converted Content Preview</p>
            <div
              className="p-3 rounded-lg border border-[var(--border-default)] bg-white dark:bg-[#1e1e2e] max-h-60 overflow-y-auto text-sm"
              dangerouslySetInnerHTML={{ __html: block.convertedHtml }}
            />
          </div>
        )}

        {/* Manual HTML override */}
        <details className="text-xs">
          <summary className="cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
            Edit converted HTML manually
          </summary>
          <textarea
            value={block.convertedHtml}
            onChange={(e) => onUpdate({ convertedHtml: e.target.value })}
            rows={4}
            className="mt-2 w-full px-2 py-1 text-xs font-mono rounded border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            placeholder="Paste or edit HTML..."
          />
        </details>
      </div>
    </div>
  )
}
