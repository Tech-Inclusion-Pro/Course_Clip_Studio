import { useState } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, ChevronsUpDown, Rows3, Columns3 } from 'lucide-react'
import type { AccordionBlock } from '@/types/course'

interface AccordionBlockEditorProps {
  block: AccordionBlock
  onUpdate: (partial: Partial<AccordionBlock>) => void
}

export function AccordionBlockEditor({ block, onUpdate }: AccordionBlockEditorProps): JSX.Element {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  function addItem() {
    onUpdate({
      items: [...block.items, { title: '', content: '' }]
    })
    setExpandedIndex(block.items.length)
  }

  function updateItem(index: number, partial: Partial<{ title: string; content: string }>) {
    const updated = block.items.map((item, i) => (i === index ? { ...item, ...partial } : item))
    onUpdate({ items: updated })
  }

  function removeItem(index: number) {
    const updated = block.items.filter((_, i) => i !== index)
    onUpdate({ items: updated })
    if (expandedIndex === index) setExpandedIndex(null)
    else if (expandedIndex !== null && expandedIndex > index) setExpandedIndex(expandedIndex - 1)
  }

  function moveItem(fromIndex: number, direction: 'up' | 'down') {
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= block.items.length) return
    const updated = [...block.items]
    const [removed] = updated.splice(fromIndex, 1)
    updated.splice(toIndex, 0, removed)
    onUpdate({ items: updated })
    setExpandedIndex(toIndex)
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Accordion block editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <ChevronsUpDown size={16} className="text-[var(--brand-magenta)]" />
          <div>
            <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Accordion</h3>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              {block.items.length} section{block.items.length !== 1 ? 's' : ''} &middot; {block.layout === 'horizontal' ? `${block.columns ?? 2} columns` : 'stacked'}
            </p>
          </div>
        </div>
        <button
          onClick={addItem}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          aria-label="Add accordion section"
        >
          <Plus size={12} /> Add Section
        </button>
      </div>

      {/* Layout Options */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
        <span className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider">Layout</span>
        <div className="flex gap-1">
          <button
            onClick={() => onUpdate({ layout: 'stacked' })}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded border cursor-pointer transition-colors ${
              block.layout !== 'horizontal'
                ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5 text-[var(--text-brand)]'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
            aria-pressed={block.layout !== 'horizontal'}
          >
            <Rows3 size={10} /> Stacked
          </button>
          <button
            onClick={() => onUpdate({ layout: 'horizontal', columns: block.columns ?? 2 })}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] rounded border cursor-pointer transition-colors ${
              block.layout === 'horizontal'
                ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5 text-[var(--text-brand)]'
                : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
            }`}
            aria-pressed={block.layout === 'horizontal'}
          >
            <Columns3 size={10} /> Side by Side
          </button>
        </div>
        {block.layout === 'horizontal' && (
          <div className="flex items-center gap-1 ml-2">
            <span className="text-[10px] text-[var(--text-tertiary)]">Columns:</span>
            {([2, 3] as const).map((n) => (
              <button
                key={n}
                onClick={() => onUpdate({ columns: n })}
                className={`px-2 py-0.5 text-[10px] rounded border cursor-pointer ${
                  (block.columns ?? 2) === n
                    ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5 text-[var(--text-brand)]'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
                aria-pressed={(block.columns ?? 2) === n}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="divide-y divide-[var(--border-default)]">
        {block.items.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <ChevronsUpDown size={32} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">No sections yet</p>
            <p className="text-xs text-[var(--text-tertiary)]">Add a section to get started.</p>
          </div>
        ) : (
          block.items.map((item, index) => {
            const isExpanded = expandedIndex === index
            return (
              <div key={index}>
                <div className="flex items-center gap-2 px-4 py-2">
                  <button
                    onClick={() => setExpandedIndex(isExpanded ? null : index)}
                    className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
                    aria-expanded={isExpanded}
                    aria-label={`Toggle section ${index + 1}`}
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateItem(index, { title: e.target.value })}
                    className="flex-1 px-2 py-1 text-sm font-[var(--font-weight-medium)] rounded-md border border-transparent hover:border-[var(--border-default)] focus:border-[var(--border-default)] bg-transparent text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder={`Section ${index + 1} title...`}
                    aria-label={`Section ${index + 1} title`}
                  />
                  <button
                    onClick={() => moveItem(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Move up"
                  >
                    <ChevronDown size={12} className="rotate-180" />
                  </button>
                  <button
                    onClick={() => moveItem(index, 'down')}
                    disabled={index === block.items.length - 1}
                    className="p-1 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                    aria-label="Move down"
                  >
                    <ChevronDown size={12} />
                  </button>
                  <button
                    onClick={() => removeItem(index)}
                    className="p-1 rounded text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
                    aria-label={`Remove section ${item.title || index + 1}`}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
                {isExpanded && (
                  <div className="px-4 pb-3 pl-10">
                    <textarea
                      value={item.content}
                      onChange={(e) => updateItem(index, { content: e.target.value })}
                      rows={3}
                      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                      placeholder="Section content..."
                      aria-label={`Content for section ${item.title || index + 1}`}
                    />
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
