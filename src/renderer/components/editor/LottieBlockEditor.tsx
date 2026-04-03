import { Upload } from 'lucide-react'
import type { LottieBlock } from '@/types/course'

interface LottieBlockEditorProps {
  block: LottieBlock
  onUpdate: (partial: Partial<LottieBlock>) => void
}

export function LottieBlockEditor({ block, onUpdate }: LottieBlockEditorProps): JSX.Element {

  async function handleFileUpload() {
    try {
      const result = await (window as any).electronAPI.showOpenDialog({
        filters: [{ name: 'Lottie JSON', extensions: ['json'] }],
        properties: ['openFile']
      })
      if (!result || result.canceled || !result.filePaths?.length) return
      const filePath = result.filePaths[0]
      onUpdate({ animationPath: filePath })
      // Animation data loaded via path in export
    } catch { /* dialog canceled */ }
  }

  async function handleFallbackUpload() {
    try {
      const result = await (window as any).electronAPI.showOpenDialog({
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'] }],
        properties: ['openFile']
      })
      if (!result || result.canceled || !result.filePaths?.length) return
      onUpdate({ fallbackImagePath: result.filePaths[0] })
    } catch { /* dialog canceled */ }
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Lottie animation block editor">
      {/* File upload */}
      <div className="p-3 space-y-3">
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Animation File (Lottie JSON)</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFileUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              <Upload size={12} /> Choose File
            </button>
            <span className="text-xs text-[var(--text-tertiary)] truncate flex-1">
              {block.animationPath ? block.animationPath.split('/').pop() : 'No file selected'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-3">
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={block.autoplay} onChange={(e) => onUpdate({ autoplay: e.target.checked })} className="rounded" />
            Autoplay
          </label>
          <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
            <input type="checkbox" checked={block.loop} onChange={(e) => onUpdate({ loop: e.target.checked })} className="rounded" />
            Loop
          </label>
        </div>

        <div className="flex gap-3">
          <label className="block text-xs text-[var(--text-secondary)] flex-1">
            Speed
            <input
              type="number"
              value={block.speed}
              onChange={(e) => onUpdate({ speed: parseFloat(e.target.value) || 1 })}
              step={0.1}
              min={0.1}
              max={5}
              className="mt-1 w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
          </label>
          <label className="block text-xs text-[var(--text-secondary)] flex-1">
            Trigger
            <select
              value={block.trigger}
              onChange={(e) => onUpdate({ trigger: e.target.value as LottieBlock['trigger'] })}
              className="mt-1 w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
            >
              <option value="auto">Auto</option>
              <option value="hover">Hover</option>
              <option value="click">Click</option>
              <option value="scroll">Scroll</option>
            </select>
          </label>
        </div>

        {/* Fallback image */}
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Fallback Image (for no-JS)</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleFallbackUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              <Upload size={12} /> Choose Image
            </button>
            <span className="text-xs text-[var(--text-tertiary)] truncate flex-1">
              {block.fallbackImagePath ? block.fallbackImagePath.split('/').pop() : 'No fallback image'}
            </span>
          </div>
        </div>

        {/* Preview placeholder */}
        <div className="p-6 rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-muted)] text-center">
          {block.animationPath ? (
            <p className="text-xs text-[var(--text-secondary)]">Animation loaded: {block.animationPath.split('/').pop()}</p>
          ) : (
            <p className="text-xs text-[var(--text-tertiary)] italic">Upload a Lottie JSON file to preview</p>
          )}
        </div>
      </div>
    </div>
  )
}
