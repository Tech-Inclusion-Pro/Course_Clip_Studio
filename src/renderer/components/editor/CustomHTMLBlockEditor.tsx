import { useState } from 'react'
import { AlertTriangle, Eye, Code2 } from 'lucide-react'
import { MonacoHTMLEditor } from './MonacoHTMLEditor'
import type { CustomHTMLBlock } from '@/types/course'

interface CustomHTMLBlockEditorProps {
  block: CustomHTMLBlock
  onUpdate: (partial: Partial<CustomHTMLBlock>) => void
}

export function CustomHTMLBlockEditor({ block, onUpdate }: CustomHTMLBlockEditorProps): JSX.Element {
  const [showPreview, setShowPreview] = useState(false)

  const previewHtml = `<!DOCTYPE html><html><head><style>body{font-family:system-ui,sans-serif;padding:12px;margin:0;}${block.css}</style></head><body>${block.html}<script>${block.js}<\/script></body></html>`

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="HTML / Rich Text block editor"
    >
      {/* Header with toggle */}
      <div className="flex items-center justify-between px-3 py-2 bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-900/50">
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
          <p className="text-xs text-yellow-800 dark:text-yellow-300">
            HTML / Rich Text — add any content you want
          </p>
        </div>
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1 px-2 py-1 text-[10px] font-medium rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          {showPreview ? <><Code2 size={10} /> Editor</> : <><Eye size={10} /> Preview</>}
        </button>
      </div>

      {showPreview ? (
        <div className="p-1" style={{ height: 340 }}>
          <iframe
            srcDoc={previewHtml}
            title="HTML preview"
            className="w-full h-full border-0 rounded bg-white"
            sandbox="allow-scripts"
          />
        </div>
      ) : (
        <MonacoHTMLEditor
          html={block.html}
          css={block.css}
          js={block.js}
          onUpdate={(field, value) => onUpdate({ [field]: value })}
        />
      )}
    </div>
  )
}
