import { Plus, Trash2, Link2 } from 'lucide-react'
import { uid } from '@/lib/uid'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { matchingPairsPrompt } from '@/lib/ai'
import { AIGenerateButton } from '@/components/ui/AIGenerateButton'
import type { MatchingBlock, MatchItem } from '@/types/course'

interface MatchingBlockEditorProps {
  block: MatchingBlock
  onUpdate: (partial: Partial<MatchingBlock>) => void
}

export function MatchingBlockEditor({ block, onUpdate }: MatchingBlockEditorProps): JSX.Element {
  const { generate, isGenerating, isConfigured } = useAIGenerate()

  async function handleAIGenerate() {
    const existing = block.leftItems.filter((i) => i.label.trim()).map((i) => i.label).join(', ')
    const topic = existing || block.instruction || 'educational matching activity'
    const text = await generate(matchingPairsPrompt(topic, 4))
    if (!text) return
    try {
      const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim())
      if (parsed.instruction) onUpdate({ instruction: parsed.instruction })
      const leftItems: MatchItem[] = (parsed.leftItems ?? []).map((label: string) => ({ id: uid('match'), label }))
      const rightItems: MatchItem[] = (parsed.rightItems ?? []).map((label: string) => ({ id: uid('match'), label }))
      const correctPairs = (parsed.pairs ?? []).map((p: number[]) => ({
        leftId: leftItems[p[0]]?.id,
        rightId: rightItems[p[1]]?.id
      })).filter((p: { leftId?: string; rightId?: string }) => p.leftId && p.rightId)
      if (leftItems.length > 0) {
        onUpdate({
          leftItems: [...block.leftItems, ...leftItems],
          rightItems: [...block.rightItems, ...rightItems],
          correctPairs: [...block.correctPairs, ...correctPairs]
        })
      }
    } catch { /* ignore parse errors */ }
  }

  function addLeftItem() {
    const item: MatchItem = { id: uid('match'), label: '' }
    onUpdate({ leftItems: [...block.leftItems, item] })
  }

  function addRightItem() {
    const item: MatchItem = { id: uid('match'), label: '' }
    onUpdate({ rightItems: [...block.rightItems, item] })
  }

  function updateLeftItem(itemId: string, label: string) {
    onUpdate({ leftItems: block.leftItems.map((it) => (it.id === itemId ? { ...it, label } : it)) })
  }

  function updateRightItem(itemId: string, label: string) {
    onUpdate({ rightItems: block.rightItems.map((it) => (it.id === itemId ? { ...it, label } : it)) })
  }

  function removeLeftItem(itemId: string) {
    onUpdate({
      leftItems: block.leftItems.filter((it) => it.id !== itemId),
      correctPairs: block.correctPairs.filter((p) => p.leftId !== itemId)
    })
  }

  function removeRightItem(itemId: string) {
    onUpdate({
      rightItems: block.rightItems.filter((it) => it.id !== itemId),
      correctPairs: block.correctPairs.filter((p) => p.rightId !== itemId)
    })
  }

  function updatePairRight(leftId: string, rightId: string) {
    const existing = block.correctPairs.filter((p) => p.leftId !== leftId)
    if (rightId) {
      existing.push({ leftId, rightId })
    }
    onUpdate({ correctPairs: existing })
  }

  function getPairedRightId(leftId: string): string {
    return block.correctPairs.find((p) => p.leftId === leftId)?.rightId ?? ''
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Matching block editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <Link2 size={16} className="text-[var(--brand-magenta)]" />
          <div>
            <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Matching Activity</h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {block.leftItems.length} left, {block.rightItems.length} right, {block.correctPairs.length} pair{block.correctPairs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        {isConfigured && (
          <AIGenerateButton
            label="Generate Pairs"
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
            placeholder="Match each item on the left with the correct item on the right."
          />
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-4">
          {/* Left column */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider">
                Left Items
              </span>
              <button
                onClick={addLeftItem}
                className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                aria-label="Add left item"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="space-y-1.5">
              {block.leftItems.map((item) => (
                <div key={item.id} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateLeftItem(item.id, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Left item..."
                  />
                  <button
                    onClick={() => removeLeftItem(item.id)}
                    className="p-1 rounded text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
                    aria-label={`Remove ${item.label}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider">
                Right Items
              </span>
              <button
                onClick={addRightItem}
                className="flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                aria-label="Add right item"
              >
                <Plus size={12} />
              </button>
            </div>
            <div className="space-y-1.5">
              {block.rightItems.map((item) => (
                <div key={item.id} className="flex items-center gap-1">
                  <input
                    type="text"
                    value={item.label}
                    onChange={(e) => updateRightItem(item.id, e.target.value)}
                    className="flex-1 px-2 py-1 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Right item..."
                  />
                  <button
                    onClick={() => removeRightItem(item.id)}
                    className="p-1 rounded text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
                    aria-label={`Remove ${item.label}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Correct Pairs Mapping */}
        {block.leftItems.length > 0 && block.rightItems.length > 0 && (
          <div>
            <span className="block text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Correct Pairs
            </span>
            <div className="space-y-1.5">
              {block.leftItems.map((leftItem) => (
                <div key={leftItem.id} className="flex items-center gap-2 p-2 rounded-md bg-[var(--bg-muted)]">
                  <span className="text-xs text-[var(--text-primary)] flex-1 truncate">
                    {leftItem.label || 'Untitled'}
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)]">&rarr;</span>
                  <select
                    value={getPairedRightId(leftItem.id)}
                    onChange={(e) => updatePairRight(leftItem.id, e.target.value)}
                    className="w-32 px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    aria-label={`Match for ${leftItem.label || 'left item'}`}
                  >
                    <option value="">No match</option>
                    {block.rightItems.map((r) => (
                      <option key={r.id} value={r.id}>{r.label || 'Untitled'}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
