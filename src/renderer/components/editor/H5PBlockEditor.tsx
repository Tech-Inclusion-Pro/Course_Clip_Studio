import { Box } from 'lucide-react'
import type { H5PBlock } from '@/types/course'

interface H5PBlockEditorProps {
  block: H5PBlock
  onUpdate: (partial: Partial<H5PBlock>) => void
}

export function H5PBlockEditor({ block, onUpdate }: H5PBlockEditorProps): JSX.Element {
  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="H5P block editor"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <Box size={16} className="text-[var(--brand-magenta)]" />
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">H5P Interactive Content</h3>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            H5P Embed URL
          </label>
          <input
            type="text"
            value={block.embedUrl}
            onChange={(e) => onUpdate({ embedUrl: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="https://h5p.org/h5p/embed/..."
          />
          <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
            Paste the embed URL from your H5P hosting platform.
          </p>
        </div>

        {/* Preview */}
        {block.embedUrl ? (
          <div className="rounded-md border border-[var(--border-default)] overflow-hidden">
            <div className="px-3 py-1.5 text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
              Preview
            </div>
            <div className="bg-white min-h-[120px] flex items-center justify-center">
              <div className="text-center p-4">
                <Box size={24} className="text-[var(--text-tertiary)] mx-auto mb-2" />
                <p className="text-xs text-[var(--text-secondary)]">H5P content will render in learner view</p>
                <p className="text-[10px] text-[var(--text-tertiary)] mt-1 truncate max-w-[250px]">{block.embedUrl}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <Box size={32} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-xs text-[var(--text-tertiary)]">Enter an H5P URL to preview.</p>
          </div>
        )}

        <div className="p-2 rounded-md bg-[var(--bg-muted)] text-xs text-[var(--text-secondary)]">
          H5P content renders via sandboxed iframe. Provide meaningful fallback text via the ARIA Label field in properties.
        </div>
      </div>
    </div>
  )
}
