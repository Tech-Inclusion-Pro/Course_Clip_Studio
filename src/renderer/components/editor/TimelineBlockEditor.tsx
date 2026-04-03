import { Plus, Trash2, GripVertical } from 'lucide-react'
import { uid } from '@/lib/uid'
import type { TimelineBlock, TimelineNode } from '@/types/course'

interface TimelineBlockEditorProps {
  block: TimelineBlock
  onUpdate: (partial: Partial<TimelineBlock>) => void
}

export function TimelineBlockEditor({ block, onUpdate }: TimelineBlockEditorProps): JSX.Element {
  function addNode() {
    const node: TimelineNode = { id: uid('tnode'), title: '', date: '', content: '' }
    onUpdate({ nodes: [...block.nodes, node] })
  }

  function updateNode(index: number, partial: Partial<TimelineNode>) {
    const nodes = block.nodes.map((n, i) => (i === index ? { ...n, ...partial } : n))
    onUpdate({ nodes })
  }

  function removeNode(index: number) {
    onUpdate({ nodes: block.nodes.filter((_, i) => i !== index) })
  }

  function moveNode(from: number, direction: 'up' | 'down') {
    const to = direction === 'up' ? from - 1 : from + 1
    if (to < 0 || to >= block.nodes.length) return
    const nodes = [...block.nodes]
    ;[nodes[from], nodes[to]] = [nodes[to], nodes[from]]
    onUpdate({ nodes })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Timeline block editor">
      {/* Settings bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)] flex-wrap">
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          Orientation:
          <select
            value={block.orientation}
            onChange={(e) => onUpdate({ orientation: e.target.value as TimelineBlock['orientation'] })}
            className="px-1.5 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            <option value="vertical">Vertical</option>
            <option value="horizontal">Horizontal</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          Expand:
          <select
            value={block.expandBehavior}
            onChange={(e) => onUpdate({ expandBehavior: e.target.value as TimelineBlock['expandBehavior'] })}
            className="px-1.5 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            <option value="all-open">All Open</option>
            <option value="one-at-a-time">One at a Time</option>
            <option value="click-to-expand">Click to Expand</option>
          </select>
        </label>
        <label className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
          Line:
          <select
            value={block.lineStyle}
            onChange={(e) => onUpdate({ lineStyle: e.target.value as TimelineBlock['lineStyle'] })}
            className="px-1.5 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
          </select>
        </label>
      </div>

      {/* Nodes */}
      <div className="p-3 space-y-3">
        {block.nodes.map((node, i) => (
          <div key={node.id} className="flex gap-2 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)]">
            <div className="flex flex-col items-center gap-1 pt-1">
              <button onClick={() => moveNode(i, 'up')} disabled={i === 0} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer" aria-label="Move up">
                <GripVertical size={12} />
              </button>
              <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{i + 1}</span>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={node.title}
                  onChange={(e) => updateNode(i, { title: e.target.value })}
                  className="flex-1 px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  placeholder="Event title"
                />
                <input
                  type="text"
                  value={node.date}
                  onChange={(e) => updateNode(i, { date: e.target.value })}
                  className="w-32 px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  placeholder="Date / label"
                />
              </div>
              <textarea
                value={node.content}
                onChange={(e) => updateNode(i, { content: e.target.value })}
                rows={2}
                className="w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                placeholder="Description..."
              />
            </div>
            <button onClick={() => removeNode(i)} className="p-1 text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer" aria-label="Remove node">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        <button
          onClick={addNode}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] rounded-md cursor-pointer"
        >
          <Plus size={12} /> Add Event
        </button>
      </div>
    </div>
  )
}
