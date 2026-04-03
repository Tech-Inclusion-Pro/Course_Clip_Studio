import { Plus, Trash2, GripVertical, Target } from 'lucide-react'
import { uid } from '@/lib/uid'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { dragDropPrompt } from '@/lib/ai'
import { AIGenerateButton } from '@/components/ui/AIGenerateButton'
import type { DragDropBlock, DragItem, DropZone } from '@/types/course'

interface DragDropBlockEditorProps {
  block: DragDropBlock
  onUpdate: (partial: Partial<DragDropBlock>) => void
}

export function DragDropBlockEditor({ block, onUpdate }: DragDropBlockEditorProps): JSX.Element {
  const { generate, isGenerating, isConfigured } = useAIGenerate()

  async function handleAIGenerate() {
    const existing = block.zones.filter((z) => z.label.trim()).map((z) => z.label).join(', ')
    const topic = existing || block.instruction || 'educational categorization activity'
    const text = await generate(dragDropPrompt(topic))
    if (!text) return
    try {
      const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim())
      if (parsed.instruction) onUpdate({ instruction: parsed.instruction })
      const zones: DropZone[] = (parsed.zones ?? []).map((label: string) => ({ id: uid('zone'), label }))
      const items: DragItem[] = (parsed.items ?? []).map((it: { label: string; correctZone: number }) => ({
        id: uid('item'),
        label: it.label,
        correctZoneId: zones[it.correctZone]?.id ?? ''
      }))
      if (zones.length > 0) {
        onUpdate({
          zones: [...block.zones, ...zones],
          items: [...block.items, ...items]
        })
      }
    } catch { /* ignore parse errors */ }
  }

  function addZone() {
    const zone: DropZone = { id: uid('zone'), label: '' }
    onUpdate({ zones: [...block.zones, zone] })
  }

  function updateZone(zoneId: string, label: string) {
    onUpdate({ zones: block.zones.map((z) => (z.id === zoneId ? { ...z, label } : z)) })
  }

  function removeZone(zoneId: string) {
    onUpdate({
      zones: block.zones.filter((z) => z.id !== zoneId),
      items: block.items.map((it) => (it.correctZoneId === zoneId ? { ...it, correctZoneId: '' } : it))
    })
  }

  function addItem() {
    const item: DragItem = { id: uid('item'), label: '', correctZoneId: '' }
    onUpdate({ items: [...block.items, item] })
  }

  function updateItem(itemId: string, partial: Partial<DragItem>) {
    onUpdate({ items: block.items.map((it) => (it.id === itemId ? { ...it, ...partial } : it)) })
  }

  function removeItem(itemId: string) {
    onUpdate({ items: block.items.filter((it) => it.id !== itemId) })
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Drag and drop block editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <GripVertical size={16} className="text-[var(--brand-magenta)]" />
          <div>
            <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Drag & Drop</h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {block.items.length} item{block.items.length !== 1 ? 's' : ''}, {block.zones.length} zone{block.zones.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isConfigured && (
          <AIGenerateButton
            label="Generate Items"
            onClick={handleAIGenerate}
            isGenerating={isGenerating}
            size="sm"
          />
        )}
      </div>

      <div className="p-4 space-y-4">
        {/* Instruction */}
        <div>
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Instruction
          </label>
          <input
            type="text"
            value={block.instruction}
            onChange={(e) => onUpdate({ instruction: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="Drag each item to the correct zone."
          />
        </div>

        {/* Drop Zones */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider">
              Drop Zones
            </span>
            <button
              onClick={addZone}
              className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              aria-label="Add drop zone"
            >
              <Plus size={12} /> Add Zone
            </button>
          </div>
          {block.zones.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] italic py-2">No zones yet. Add a zone first.</p>
          ) : (
            <div className="space-y-1.5">
              {block.zones.map((zone) => (
                <div key={zone.id} className="flex items-center gap-2">
                  <Target size={14} className="text-[var(--text-tertiary)] shrink-0" />
                  <input
                    type="text"
                    value={zone.label}
                    onChange={(e) => updateZone(zone.id, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Zone label..."
                    aria-label={`Zone label for ${zone.label || 'unnamed zone'}`}
                  />
                  <button
                    onClick={() => removeZone(zone.id)}
                    className="p-1 rounded text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
                    aria-label={`Remove zone ${zone.label}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Drag Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider">
              Drag Items
            </span>
            <button
              onClick={addItem}
              className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              aria-label="Add drag item"
            >
              <Plus size={12} /> Add Item
            </button>
          </div>
          {block.items.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] italic py-2">No items yet. Add an item to get started.</p>
          ) : (
            <div className="space-y-2">
              {block.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-md bg-[var(--bg-muted)]">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateItem(item.id, { label: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Item label..."
                    aria-label={`Drag item label for ${item.label || 'unnamed item'}`}
                  />
                  <select
                    value={item.correctZoneId}
                    onChange={(e) => updateItem(item.id, { correctZoneId: e.target.value })}
                    className="w-36 px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    aria-label={`Correct zone for ${item.label || 'item'}`}
                  >
                    <option value="">Select zone...</option>
                    {block.zones.map((z) => (
                      <option key={z.id} value={z.id}>{z.label || 'Untitled zone'}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
                    aria-label={`Remove item ${item.label}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
