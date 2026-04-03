import { Upload, AlertTriangle } from 'lucide-react'
import type { PDFViewerBlock } from '@/types/course'

interface PDFViewerBlockEditorProps {
  block: PDFViewerBlock
  onUpdate: (partial: Partial<PDFViewerBlock>) => void
}

export function PDFViewerBlockEditor({ block, onUpdate }: PDFViewerBlockEditorProps): JSX.Element {

  async function handleFileUpload() {
    try {
      const result = await (window as any).electronAPI.showOpenDialog({
        filters: [{ name: 'PDF', extensions: ['pdf'] }],
        properties: ['openFile']
      })
      if (!result || result.canceled || !result.filePaths?.length) return
      onUpdate({ filePath: result.filePaths[0] })
    } catch { /* dialog canceled */ }
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="PDF viewer block editor">
      <div className="p-3 space-y-3">
        {/* File upload */}
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">PDF File</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFileUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              <Upload size={12} /> Choose PDF
            </button>
            <span className="text-xs text-[var(--text-tertiary)] truncate flex-1">
              {block.filePath ? block.filePath.split('/').pop() : 'No file selected'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={block.showControls} onChange={(e) => onUpdate({ showControls: e.target.checked })} className="rounded" />
            Show page navigation controls
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={block.allowDownload} onChange={(e) => onUpdate({ allowDownload: e.target.checked })} className="rounded" />
            Allow download
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={block.hasAccessibilityTags} onChange={(e) => onUpdate({ hasAccessibilityTags: e.target.checked })} className="rounded" />
            PDF has accessibility tags (Tagged PDF)
          </label>
        </div>

        {/* Accessibility warning */}
        {!block.hasAccessibilityTags && block.filePath && (
          <div className="flex items-start gap-2 p-2 rounded-md bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800">
            <AlertTriangle size={14} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              This PDF does not have accessibility tags. Screen readers may not be able to read the content properly. Consider providing a converted document version.
            </p>
          </div>
        )}

        {/* Preview */}
        {block.filePath && (
          <div className="rounded-lg border border-[var(--border-default)] overflow-hidden bg-[var(--bg-muted)] p-4 text-center">
            <p className="text-sm text-[var(--text-secondary)]">PDF: {block.filePath.split('/').pop()}</p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">Preview available in exported course</p>
          </div>
        )}
      </div>
    </div>
  )
}
