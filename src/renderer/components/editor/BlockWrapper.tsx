import {
  GripVertical,
  Settings,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  MessageSquare
} from 'lucide-react'
import { useEditorStore } from '@/stores/useEditorStore'
import { BLOCK_TYPE_LABELS } from '@/types/course'
import type { ContentBlock } from '@/types/course'

interface BlockWrapperProps {
  block: ContentBlock
  index: number
  totalBlocks: number
  onSelect: () => void
  onDuplicate: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  children: React.ReactNode
}

export function BlockWrapper({
  block,
  index,
  totalBlocks,
  onSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  children
}: BlockWrapperProps): JSX.Element {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock)
  const toggleBlockSelection = useEditorStore((s) => s.toggleBlockSelection)
  const isSelected = selectedBlockId === block.id
  const hasNotes = block.notes.length > 0

  function handleClick(e: React.MouseEvent) {
    if (e.shiftKey) {
      toggleBlockSelection(block.id)
    } else {
      setSelectedBlock(block.id)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowUp' && e.altKey && index > 0) {
      e.preventDefault()
      onMoveUp()
    } else if (e.key === 'ArrowDown' && e.altKey && index < totalBlocks - 1) {
      e.preventDefault()
      onMoveDown()
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        onDelete()
      }
    }
  }

  return (
    <div
      className={`
        group relative flex items-start gap-0
        rounded-lg border transition-all duration-[var(--duration-fast)]
        ${isSelected
          ? 'border-[var(--brand-magenta)] shadow-[0_0_0_1px_var(--brand-magenta)]'
          : 'border-transparent hover:border-[var(--border-default)]'
        }
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="listitem"
      aria-label={`${BLOCK_TYPE_LABELS[block.type]} block`}
    >
      {/* Left gutter: drag handle + type badge */}
      <div className="flex flex-col items-center gap-1 py-2 px-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <button
          className="p-0.5 rounded cursor-grab text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:cursor-grabbing"
          aria-label="Drag to reorder"
          title="Drag to reorder (Alt+Arrow to move)"
          tabIndex={-1}
        >
          <GripVertical size={14} />
        </button>

        <span className="text-[9px] font-[var(--font-weight-medium)] text-[var(--text-tertiary)] uppercase tracking-wider whitespace-nowrap">
          {block.type}
        </span>
      </div>

      {/* Block content */}
      <div className="flex-1 min-w-0 py-2 pr-2">
        {children}
      </div>

      {/* Right gutter: actions */}
      <div className="flex flex-col items-center gap-0.5 py-2 pr-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onSelect() }}
          className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          aria-label="Block settings"
          title="Open properties"
        >
          <Settings size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveUp() }}
          disabled={index === 0}
          className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move block up"
          title="Move up"
        >
          <ChevronUp size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onMoveDown() }}
          disabled={index === totalBlocks - 1}
          className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label="Move block down"
          title="Move down"
        >
          <ChevronDown size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDuplicate() }}
          className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          aria-label="Duplicate block"
          title="Duplicate"
        >
          <Copy size={13} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete() }}
          className="p-1 rounded cursor-pointer text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
          aria-label="Delete block"
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Note badge */}
      {hasNotes && (
        <div
          className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-[var(--brand-magenta)] text-white flex items-center justify-center"
          title="Has collaborator notes"
          aria-label="Block has notes"
        >
          <MessageSquare size={10} />
        </div>
      )}
    </div>
  )
}
