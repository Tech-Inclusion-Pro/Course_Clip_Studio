import { useState, useRef, useEffect, useCallback } from 'react'
import { MoreHorizontal, FolderOpen, Copy, Download, Trash2 } from 'lucide-react'

interface CardActionsMenuProps {
  onOpen: () => void
  onDuplicate: () => void
  onExport: () => void
  onDelete: () => void
}

const ACTIONS = [
  { id: 'open', label: 'Open', icon: FolderOpen },
  { id: 'duplicate', label: 'Duplicate', icon: Copy },
  { id: 'export', label: 'Export', icon: Download },
  { id: 'delete', label: 'Delete', icon: Trash2, danger: true }
] as const

export function CardActionsMenu({ onOpen, onDuplicate, onExport, onDelete }: CardActionsMenuProps): JSX.Element {
  const [open, setOpen] = useState(false)
  const [focusIndex, setFocusIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const handlers: Record<string, () => void> = {
    open: onOpen,
    duplicate: onDuplicate,
    export: onExport,
    delete: onDelete
  }

  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        close()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open, close])

  // Focus first item when menu opens
  useEffect(() => {
    if (open) {
      setFocusIndex(0)
      itemRefs.current[0]?.focus()
    }
  }, [open])

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = (focusIndex + 1) % ACTIONS.length
      setFocusIndex(next)
      itemRefs.current[next]?.focus()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const prev = (focusIndex - 1 + ACTIONS.length) % ACTIONS.length
      setFocusIndex(prev)
      itemRefs.current[prev]?.focus()
    }
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        className="
          p-1.5 rounded-md cursor-pointer
          text-[var(--text-tertiary)] hover:text-[var(--text-primary)]
          hover:bg-[var(--bg-hover)]
          transition-colors duration-[var(--duration-fast)]
        "
        aria-label="Course actions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Course actions"
          onKeyDown={handleKeyDown}
          className="
            absolute right-0 top-full mt-1 z-50
            w-40 py-1 rounded-lg
            bg-[var(--bg-surface)] border border-[var(--border-default)]
            shadow-[var(--shadow-lg)]
          "
        >
          {ACTIONS.map((action, i) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                ref={(el) => { itemRefs.current[i] = el }}
                role="menuitem"
                tabIndex={focusIndex === i ? 0 : -1}
                onClick={(e) => {
                  e.stopPropagation()
                  handlers[action.id]()
                  close()
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm cursor-pointer
                  transition-colors duration-[var(--duration-fast)]
                  ${'danger' in action && action.danger
                    ? 'text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]'
                    : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                <Icon size={14} />
                {action.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
