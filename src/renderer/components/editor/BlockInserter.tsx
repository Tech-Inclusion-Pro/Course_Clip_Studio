import { useState, useRef, useEffect } from 'react'
import {
  Plus,
  Type,
  Image,
  Video,
  AudioLines,
  HelpCircle,
  GripVertical,
  Link2,
  ChevronsUpDown,
  Layers,
  FlipVertical,
  GitBranch,
  Code2,
  Minus,
  AlertTriangle,
  Box,
  FileCode,
  ClipboardList,
  Puzzle,
  X
} from 'lucide-react'
import { BLOCK_TYPES, BLOCK_TYPE_LABELS } from '@/types/course'
import type { BlockType } from '@/types/course'

const BLOCK_ICONS: Record<BlockType, typeof Type> = {
  'text': Type,
  'media': Image,
  'video': Video,
  'audio': AudioLines,
  'quiz': HelpCircle,
  'drag-drop': GripVertical,
  'matching': Link2,
  'accordion': ChevronsUpDown,
  'tabs': Layers,
  'flashcard': FlipVertical,
  'branching': GitBranch,
  'embed': Box,
  'code': Code2,
  'divider': Minus,
  'callout': AlertTriangle,
  'h5p': Box,
  'custom-html': FileCode,
  'plugin': Puzzle,
  'feedback-form': ClipboardList
}

interface BlockInserterProps {
  onInsert: (type: BlockType) => void
}

export function BlockInserterButton({ onInsert }: BlockInserterProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function handleSelect(type: BlockType) {
    onInsert(type)
    setOpen(false)
  }

  return (
    <div className="relative flex justify-center">
      <button
        ref={buttonRef}
        onClick={() => setOpen(!open)}
        className="
          group flex items-center justify-center
          w-7 h-7 rounded-full
          border border-dashed border-[var(--border-default)]
          text-[var(--text-tertiary)]
          hover:border-[var(--brand-magenta)] hover:text-[var(--brand-magenta)]
          hover:bg-[var(--bg-hover)]
          transition-all duration-[var(--duration-fast)]
          cursor-pointer
          focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
        "
        aria-label="Insert block"
        aria-haspopup="true"
        aria-expanded={open}
        title="Add a content block"
      >
        {open ? <X size={14} /> : <Plus size={14} />}
      </button>

      {open && (
        <div
          ref={menuRef}
          className="
            absolute top-full mt-2 z-50
            w-80 p-3 rounded-xl
            bg-[var(--bg-surface)] border border-[var(--border-default)]
            shadow-[var(--shadow-xl)]
          "
          role="menu"
          aria-label="Block type picker"
        >
          <p className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-1">
            Add Block
          </p>
          <div className="grid grid-cols-3 gap-1">
            {BLOCK_TYPES.map((type) => {
              const Icon = BLOCK_ICONS[type]
              return (
                <button
                  key={type}
                  role="menuitem"
                  onClick={() => handleSelect(type)}
                  className="
                    flex flex-col items-center gap-1 p-2 rounded-lg
                    text-[var(--text-secondary)]
                    hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
                    transition-colors duration-[var(--duration-fast)]
                    cursor-pointer
                    focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
                  "
                >
                  <Icon size={18} />
                  <span className="text-[10px] font-[var(--font-weight-medium)] leading-tight text-center">
                    {BLOCK_TYPE_LABELS[type]}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
