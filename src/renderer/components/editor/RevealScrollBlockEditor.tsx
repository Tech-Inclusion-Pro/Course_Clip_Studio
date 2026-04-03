import { Plus, Trash2 } from 'lucide-react'
import { uid } from '@/lib/uid'
import type { RevealScrollBlock, RevealItem } from '@/types/course'

interface RevealScrollBlockEditorProps {
  block: RevealScrollBlock
  onUpdate: (partial: Partial<RevealScrollBlock>) => void
}

const ANIMATIONS: RevealItem['animation'][] = ['fade-in', 'slide-up', 'slide-left', 'scale']

export function RevealScrollBlockEditor({ block, onUpdate }: RevealScrollBlockEditorProps): JSX.Element {
  function addItem() {
    const item: RevealItem = { id: uid('reveal'), content: '', animation: 'fade-in' }
    onUpdate({ items: [...block.items, item] })
  }

  function updateItem(index: number, partial: Partial<RevealItem>) {
    const items = block.items.map((item, i) => (i === index ? { ...item, ...partial } : item))
    onUpdate({ items })
  }

  function removeItem(index: number) {
    onUpdate({ items: block.items.filter((_, i) => i !== index) })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Reveal scroll block editor">
      {/* Settings */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)] flex-wrap">
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          Trigger:
          <select
            value={block.trigger}
            onChange={(e) => onUpdate({ trigger: e.target.value as RevealScrollBlock['trigger'] })}
            className="px-1.5 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            <option value="scroll">Scroll</option>
            <option value="click">Click</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          Stagger:
          <input
            type="number"
            value={block.staggerDelay}
            onChange={(e) => onUpdate({ staggerDelay: parseInt(e.target.value) || 0 })}
            min={0}
            step={50}
            className="w-16 px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          />
          ms
        </label>
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          Threshold:
          <input
            type="number"
            value={block.threshold}
            onChange={(e) => onUpdate({ threshold: parseFloat(e.target.value) || 0.3 })}
            min={0}
            max={1}
            step={0.1}
            className="w-14 px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          />
        </label>
      </div>

      {/* Items */}
      <div className="p-3 space-y-2">
        {block.items.map((item, i) => (
          <div key={item.id} className="flex gap-2 p-2 rounded border border-[var(--border-default)] bg-[var(--bg-muted)]">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-tertiary)] font-mono w-4">{i + 1}</span>
                <select
                  value={item.animation}
                  onChange={(e) => updateItem(i, { animation: e.target.value as RevealItem['animation'] })}
                  className="px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                >
                  {ANIMATIONS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
              <textarea
                value={item.content}
                onChange={(e) => updateItem(i, { content: e.target.value })}
                rows={2}
                className="w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                placeholder="Content (HTML supported)..."
              />
            </div>
            <button onClick={() => removeItem(i)} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer self-start" aria-label="Remove item">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={addItem}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] rounded-md cursor-pointer"
        >
          <Plus size={12} /> Add Item
        </button>
      </div>
    </div>
  )
}
