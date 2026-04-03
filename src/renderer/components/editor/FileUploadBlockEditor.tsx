import { FileUp } from 'lucide-react'
import type { FileUploadBlock } from '@/types/course'

interface FileUploadBlockEditorProps {
  block: FileUploadBlock
  onUpdate: (partial: Partial<FileUploadBlock>) => void
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const size = bytes / Math.pow(1024, i)
  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

export function FileUploadBlockEditor({ block, onUpdate }: FileUploadBlockEditorProps): JSX.Element {
  async function handleUpload() {
    if (!window.electronAPI?.dialog?.openFile) return
    try {
      const result = await window.electronAPI.dialog.openFile({
        filters: [{ name: 'All Files', extensions: ['*'] }]
      })
      if (result?.filePath) {
        const fileName = result.filePath.split('/').pop() || result.filePath.split('\\').pop() || 'file'
        const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
        const mimeMap: Record<string, string> = {
          pdf: 'application/pdf',
          html: 'text/html',
          htm: 'text/html',
          doc: 'application/msword',
          docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          xls: 'application/vnd.ms-excel',
          xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          ppt: 'application/vnd.ms-powerpoint',
          pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          zip: 'application/zip',
          txt: 'text/plain',
          csv: 'text/csv',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          svg: 'image/svg+xml'
        }
        const mimeType = mimeMap[ext] || 'application/octet-stream'
        onUpdate({
          filePath: result.filePath,
          fileName,
          mimeType,
          fileSize: result.size ?? 0
        })
      }
    } catch {
      // Dialog cancelled or error
    }
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="File upload block editor"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <FileUp size={16} className="text-[var(--brand-magenta)]" />
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">File Upload</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* File Path */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            File Path
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={block.filePath}
              onChange={(e) => onUpdate({ filePath: e.target.value })}
              className="flex-1 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Path to file..."
            />
            <button
              onClick={handleUpload}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              aria-label="Upload file"
            >
              <FileUp size={12} /> Upload
            </button>
          </div>
        </div>

        {/* File Name */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            File Name
          </label>
          <input
            type="text"
            value={block.fileName}
            onChange={(e) => onUpdate({ fileName: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="Display name for the file..."
          />
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
            Auto-populated from upload. You can edit this to change the display name.
          </p>
        </div>

        {/* Allow Download */}
        <div className="flex items-center justify-between">
          <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
            Allow Download
          </label>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={block.allowDownload}
              onChange={(e) => onUpdate({ allowDownload: e.target.checked })}
              className="sr-only peer"
              aria-label="Allow download"
            />
            <div className="w-8 h-4.5 bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-full peer peer-checked:bg-[var(--brand-magenta)] peer-focus:ring-2 peer-focus:ring-[var(--ring-brand)] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-[14px]" />
          </label>
        </div>

        {/* Inline Viewer */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
              Inline Viewer
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={block.inlineViewer}
                onChange={(e) => onUpdate({ inlineViewer: e.target.checked })}
                className="sr-only peer"
                aria-label="Inline viewer"
              />
              <div className="w-8 h-4.5 bg-[var(--bg-muted)] border border-[var(--border-default)] rounded-full peer peer-checked:bg-[var(--brand-magenta)] peer-focus:ring-2 peer-focus:ring-[var(--ring-brand)] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-[14px]" />
            </label>
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
            PDF and HTML files can be previewed inline in the learner view.
          </p>
        </div>

        {/* Preview */}
        {block.filePath ? (
          <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
              Preview
            </div>
            <div className="flex items-center gap-3 p-4">
              <FileUp size={24} className="text-[var(--brand-magenta)] shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-[var(--text-primary)] font-[var(--font-weight-medium)] truncate">
                  {block.fileName || 'Untitled file'}
                </p>
                {block.fileSize > 0 && (
                  <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                    {formatFileSize(block.fileSize)} &middot; {block.mimeType || 'Unknown type'}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <FileUp size={32} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs text-[var(--text-tertiary)]">Upload a file to preview.</p>
          </div>
        )}
      </div>
    </div>
  )
}
