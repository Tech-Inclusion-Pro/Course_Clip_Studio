import { Box, AlertTriangle, ExternalLink } from 'lucide-react'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { embedTitlePrompt } from '@/lib/ai'
import { AIGenerateButton } from '@/components/ui/AIGenerateButton'
import type { EmbedBlock } from '@/types/course'

interface EmbedBlockEditorProps {
  block: EmbedBlock
  onUpdate: (partial: Partial<EmbedBlock>) => void
}

export function EmbedBlockEditor({ block, onUpdate }: EmbedBlockEditorProps): JSX.Element {
  const missingTitle = !block.title
  const { generate, isGenerating, isConfigured } = useAIGenerate()

  async function handleGenerateTitle() {
    if (!block.url) return
    const text = await generate(embedTitlePrompt(block.url))
    if (text) onUpdate({ title: text.replace(/^["']|["']$/g, '').trim() })
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Embed block editor"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <Box size={16} className="text-[var(--brand-magenta)]" />
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">URL / Embed</h3>
      </div>

      <div className="p-4 space-y-3">
        {/* URL */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Embed URL
          </label>
          <input
            type="text"
            value={block.url}
            onChange={(e) => onUpdate({ url: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="Google Maps, Typeform, Padlet, etc..."
          />
        </div>

        {/* Title (required for accessibility) */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
              Title <span className="text-[var(--color-danger-600)]">*</span>
            </label>
            {isConfigured && block.url && (
              <AIGenerateButton
                onClick={handleGenerateTitle}
                isGenerating={isGenerating}
                disabled={!block.url}
                size="xs"
                title="Generate title from URL"
              />
            )}
          </div>
          <input
            type="text"
            value={block.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            className={`w-full px-2.5 py-1.5 text-sm rounded-md border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] ${
              missingTitle ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]'
            }`}
            placeholder="Accessible title for this embed..."
            aria-required="true"
            aria-invalid={missingTitle}
          />
          {missingTitle && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle size={12} className="text-[var(--color-danger-600)]" />
              <p className="text-xs text-[var(--color-danger-600)]">
                Title is required for iframe accessibility
              </p>
            </div>
          )}
        </div>

        {/* Display mode */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Display Mode
          </label>
          <div className="flex items-center gap-1 bg-[var(--bg-muted)] rounded-md border border-[var(--border-default)] p-0.5 w-fit">
            <button
              type="button"
              onClick={() => onUpdate({ display: 'inline' })}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded cursor-pointer transition-colors ${
                (block.display || 'inline') === 'inline'
                  ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={(block.display || 'inline') === 'inline'}
            >
              <Box size={12} /> Show in Course
            </button>
            <button
              type="button"
              onClick={() => onUpdate({ display: 'new-tab' })}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded cursor-pointer transition-colors ${
                block.display === 'new-tab'
                  ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
              aria-pressed={block.display === 'new-tab'}
            >
              <ExternalLink size={12} /> Open External
            </button>
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Width (px)
            </label>
            <input
              type="number"
              value={block.width ?? ''}
              onChange={(e) => onUpdate({ width: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Auto"
            />
          </div>
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Height (px)
            </label>
            <input
              type="number"
              value={block.height ?? ''}
              onChange={(e) => onUpdate({ height: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Auto"
            />
          </div>
        </div>

        {/* Preview */}
        {block.url && (
          <div className="rounded-md border border-[var(--border-default)] overflow-hidden bg-[var(--bg-muted)]">
            <div className="px-3 py-1.5 text-[10px] text-[var(--text-tertiary)] border-b border-[var(--border-default)]">
              Preview
            </div>
            <div className="p-2 flex items-center justify-center min-h-[80px]">
              <p className="text-xs text-[var(--text-secondary)] text-center">
                Embed preview available in learner preview mode
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
