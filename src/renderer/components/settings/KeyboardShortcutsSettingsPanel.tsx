import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Keyboard,
  Search,
  Lock,
  RotateCcw,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  ArrowLeftRight,
  X
} from 'lucide-react'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { useHotkeyStore } from '@/stores/useHotkeyStore'
import { formatKeyForDisplay, getPlatform } from '@/lib/hotkey-utils'
import type { HotkeyCategory, HotkeyDefinition, ConflictResult } from '@/types/hotkeys'

const CATEGORY_LABELS: Record<HotkeyCategory, string> = {
  global: 'Global Shortcuts',
  recording: 'Recording Panel',
  'slide-editor': 'Slide Editor',
  timeline: 'Timeline Editor',
  text: 'Text Formatting',
  media: 'Media Library',
  syllabus: 'Syllabus Builder',
  export: 'Export',
  accessibility: 'Accessibility'
}

const CATEGORY_ORDER: HotkeyCategory[] = [
  'global', 'recording', 'slide-editor', 'timeline',
  'text', 'media', 'syllabus', 'export', 'accessibility'
]

// ─── Kbd display component ───
function ShortcutKbd({ binding }: { binding: string }): JSX.Element {
  const platform = getPlatform()

  if (!binding) {
    return <span className="text-xs italic text-[var(--text-tertiary)]">No shortcut</span>
  }

  const display = formatKeyForDisplay(binding, platform)
  const keys = platform === 'mac' ? [display] : display.split('+')

  return (
    <span className="inline-flex items-center gap-0.5">
      {keys.map((key, i) => (
        <kbd
          key={i}
          className="inline-flex items-center justify-center min-w-[22px] h-5 px-1
            rounded border border-[var(--border-default)] bg-[var(--bg-app)]
            text-[11px] font-mono text-[var(--text-secondary)]
            shadow-[0_1px_0_var(--border-default)]"
        >
          {key.trim()}
        </kbd>
      ))}
    </span>
  )
}

// ─── Key capture field ───
function KeyCaptureField({
  hotkey,
  onCapture,
  onClear
}: {
  hotkey: HotkeyDefinition
  onCapture: (binding: string) => void
  onClear: () => void
}): JSX.Element {
  const [capturing, setCapturing] = useState(false)
  const [capturedKey, setCapturedKey] = useState<string | null>(null)
  const fieldRef = useRef<HTMLButtonElement>(null)
  const platform = getPlatform()
  const currentBinding = hotkey.current[platform]

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      e.preventDefault()
      e.stopPropagation()

      // Ignore lone modifier presses
      if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) return

      // Escape cancels capture
      if (e.key === 'Escape' && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        setCapturing(false)
        setCapturedKey(null)
        return
      }

      // Build the binding string
      const parts: string[] = []
      if (platform === 'mac') {
        if (e.ctrlKey) parts.push('Ctrl')
        if (e.metaKey) parts.push('Cmd')
      } else {
        if (e.ctrlKey) parts.push('Ctrl')
      }
      if (e.shiftKey) parts.push('Shift')
      if (e.altKey) parts.push(platform === 'mac' ? 'Option' : 'Alt')

      // Normalize key name
      let keyName = e.key
      if (keyName === ' ') keyName = 'Space'
      else if (keyName.length === 1) keyName = keyName.toUpperCase()
      else if (keyName === 'ArrowUp') keyName = 'Up'
      else if (keyName === 'ArrowDown') keyName = 'Down'
      else if (keyName === 'ArrowLeft') keyName = 'Left Arrow'
      else if (keyName === 'ArrowRight') keyName = 'Right Arrow'

      parts.push(keyName)
      const binding = parts.join('+')
      setCapturedKey(binding)
      onCapture(binding)
      setCapturing(false)
    },
    [platform, onCapture]
  )

  useEffect(() => {
    if (!capturing) return
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [capturing, handleKeyDown])

  if (!hotkey.isRemappable) {
    return (
      <div className="flex items-center gap-2">
        <ShortcutKbd binding={currentBinding} />
        <Lock size={12} className="text-[var(--text-tertiary)]" />
      </div>
    )
  }

  if (capturing) {
    return (
      <button
        ref={fieldRef}
        className="px-3 py-1.5 rounded-md border-2 border-[var(--brand-magenta)] bg-[var(--bg-muted)]
          text-xs text-[var(--brand-magenta)] animate-pulse cursor-pointer min-w-[140px] text-center"
        onBlur={() => { setCapturing(false); setCapturedKey(null) }}
      >
        Press your shortcut...
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        ref={fieldRef}
        onClick={() => { setCapturing(true); setCapturedKey(null) }}
        className="px-2 py-1 rounded-md border border-[var(--border-default)] hover:border-[var(--brand-magenta)]
          bg-[var(--bg-app)] cursor-pointer transition-colors min-w-[100px] text-center"
        aria-label={`Change shortcut for ${hotkey.label}. Current: ${currentBinding || 'none'}`}
      >
        <ShortcutKbd binding={capturedKey ?? currentBinding} />
      </button>
      {currentBinding && (
        <button
          onClick={onClear}
          className="p-1 rounded hover:bg-[var(--bg-hover)] text-[var(--text-tertiary)] cursor-pointer"
          aria-label={`Clear shortcut for ${hotkey.label}`}
        >
          <X size={12} />
        </button>
      )}
    </div>
  )
}

// ─── Conflict notice ───
function ConflictNotice({
  conflict,
  onReassign,
  onSwap,
  onCancel,
  canSwap
}: {
  conflict: ConflictResult
  onReassign: () => void
  onSwap: () => void
  onCancel: () => void
  canSwap: boolean
}): JSX.Element {
  if (conflict.isCrossContext) {
    return (
      <div className="flex items-start gap-2 mt-1 p-2 rounded bg-[var(--bg-muted)] text-xs text-[var(--text-secondary)]">
        <AlertTriangle size={14} className="text-[var(--text-tertiary)] flex-shrink-0 mt-0.5" />
        <span>
          This key is also used for <strong>{conflict.conflictingActionLabel}</strong> in{' '}
          <strong>{conflict.conflictContext}</strong> (no conflict — different context).
        </span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-2 mt-1 p-2 rounded bg-[#fef3c7] dark:bg-[#78350f]/20 text-xs">
      <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-amber-800 dark:text-amber-300">
          Already assigned to <strong>{conflict.conflictingActionLabel}</strong> in{' '}
          <strong>{conflict.conflictContext}</strong>. Saving will reassign it.
        </p>
        <div className="flex gap-2 mt-1.5">
          <button
            onClick={onReassign}
            className="px-2 py-0.5 rounded bg-amber-600 text-white text-xs hover:bg-amber-700 cursor-pointer"
          >
            Reassign
          </button>
          {canSwap && (
            <button
              onClick={onSwap}
              className="px-2 py-0.5 rounded border border-amber-600 text-amber-700 dark:text-amber-300 text-xs hover:bg-amber-50 dark:hover:bg-amber-900/20 cursor-pointer flex items-center gap-1"
            >
              <ArrowLeftRight size={10} />
              Swap
            </button>
          )}
          <button
            onClick={onCancel}
            className="px-2 py-0.5 rounded border border-[var(--border-default)] text-[var(--text-secondary)] text-xs hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Single shortcut row ───
function ShortcutRow({ hotkey }: { hotkey: HotkeyDefinition }): JSX.Element {
  const [pendingConflict, setPendingConflict] = useState<ConflictResult | null>(null)
  const [pendingBinding, setPendingBinding] = useState<string | null>(null)
  const findConflict = useHotkeyStore((s) => s.findConflict)
  const setBinding = useHotkeyStore((s) => s.setBinding)
  const swapBindings = useHotkeyStore((s) => s.swapBindings)
  const clearBinding = useHotkeyStore((s) => s.clearBinding)
  const resetSingle = useHotkeyStore((s) => s.resetSingle)
  const platform = getPlatform()
  const currentBinding = hotkey.current[platform]
  const defaultBinding = hotkey.default[platform]
  const isModified = currentBinding !== defaultBinding

  function handleCapture(binding: string): void {
    const conflict = findConflict(binding, hotkey.context, hotkey.id)
    if (conflict.hasConflict) {
      setPendingConflict(conflict)
      setPendingBinding(binding)
    } else {
      setBinding(hotkey.id, binding)
      setPendingConflict(null)
      setPendingBinding(null)
    }
  }

  function handleReassign(): void {
    if (pendingBinding) setBinding(hotkey.id, pendingBinding)
    setPendingConflict(null)
    setPendingBinding(null)
  }

  function handleSwap(): void {
    if (pendingConflict?.conflictingActionId) {
      swapBindings(hotkey.id, pendingConflict.conflictingActionId)
    }
    setPendingConflict(null)
    setPendingBinding(null)
  }

  function handleCancel(): void {
    setPendingConflict(null)
    setPendingBinding(null)
  }

  const canSwap = !!(pendingConflict?.conflictingActionId && !pendingConflict.isCrossContext)

  return (
    <div className="py-2 border-b border-[var(--border-default)] last:border-b-0">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--text-primary)]">{hotkey.label}</span>
            {isModified && (
              <button
                onClick={() => resetSingle(hotkey.id)}
                className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-tertiary)]
                  hover:text-[var(--text-primary)] cursor-pointer"
                title="Reset to default"
              >
                reset
              </button>
            )}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5">{hotkey.description}</div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <KeyCaptureField
            hotkey={hotkey}
            onCapture={handleCapture}
            onClear={() => clearBinding(hotkey.id)}
          />
        </div>
      </div>
      {pendingConflict && (
        <ConflictNotice
          conflict={pendingConflict}
          onReassign={handleReassign}
          onSwap={handleSwap}
          onCancel={handleCancel}
          canSwap={canSwap}
        />
      )}
    </div>
  )
}

// ─── Collapsible category section ───
function CategorySection({ category }: { category: HotkeyCategory }): JSX.Element {
  const [expanded, setExpanded] = useState(true)
  const getHotkeysForCategory = useHotkeyStore((s) => s.getHotkeysForCategory)
  const resetCategory = useHotkeyStore((s) => s.resetCategory)
  const [confirmReset, setConfirmReset] = useState(false)
  const hotkeys = getHotkeysForCategory(category)

  if (hotkeys.length === 0) return <></>

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-muted)]">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 cursor-pointer text-left flex-1"
        >
          {expanded
            ? <ChevronDown size={14} className="text-[var(--text-tertiary)]" />
            : <ChevronRight size={14} className="text-[var(--text-tertiary)]" />
          }
          <Keyboard size={16} className="text-[var(--text-tertiary)]" />
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            {CATEGORY_LABELS[category]}
          </h3>
          <span className="text-xs text-[var(--text-tertiary)]">({hotkeys.length})</span>
        </button>
        {confirmReset ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--text-tertiary)]">Reset all in this category?</span>
            <button
              onClick={() => { resetCategory(category); setConfirmReset(false) }}
              className="px-2 py-0.5 rounded bg-[var(--color-danger-600)] text-white text-xs cursor-pointer hover:bg-[var(--color-danger-500)]"
            >
              Yes
            </button>
            <button
              onClick={() => setConfirmReset(false)}
              className="px-2 py-0.5 rounded border border-[var(--border-default)] text-xs text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-hover)]"
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1 px-2 py-1 rounded text-xs text-[var(--text-tertiary)]
              hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            title="Reset category to defaults"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
      {expanded && (
        <div className="p-4 space-y-0">
          {hotkeys.map((h) => (
            <ShortcutRow key={h.id} hotkey={h} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main settings panel ───
export function KeyboardShortcutsSettingsPanel(): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('')
  const [confirmResetAll, setConfirmResetAll] = useState(false)
  const [importResult, setImportResult] = useState<string | null>(null)
  const resetAll = useHotkeyStore((s) => s.resetAll)
  const exportKeymap = useHotkeyStore((s) => s.exportKeymap)
  const importKeymap = useHotkeyStore((s) => s.importKeymap)
  const getHotkeysForCategory = useHotkeyStore((s) => s.getHotkeysForCategory)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport(): void {
    const json = exportKeymap()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `course-clip-studio-hotkeys.ccs-keys`
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = importKeymap(reader.result as string)
      if (result.success) {
        setImportResult(`Imported ${result.appliedCount} shortcut(s). ${result.skippedCount} skipped. ${result.conflicts.length} conflict(s) auto-resolved.`)
      } else {
        setImportResult('Import failed. Invalid file format.')
      }
      setTimeout(() => setImportResult(null), 5000)
    }
    reader.readAsText(file)
    // Reset the file input so the same file can be re-imported
    e.target.value = ''
  }

  // Filter categories based on search
  const filteredCategories = CATEGORY_ORDER.filter((cat) => {
    if (!searchQuery.trim()) return true
    const hotkeys = getHotkeysForCategory(cat)
    const q = searchQuery.toLowerCase()
    return hotkeys.some(
      (h) =>
        h.label.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q) ||
        h.id.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="space-y-3">
        <p className="text-sm text-[var(--text-secondary)]">
          Customize keyboard shortcuts. Click any shortcut to change it, or press{' '}
          <ShortcutKbd binding={getPlatform() === 'mac' ? 'Cmd+/' : 'Ctrl+/'} /> anywhere to open the quick reference.
        </p>

        {/* Search bar */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shortcuts..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[var(--border-default)]
              bg-[var(--bg-app)] text-sm text-[var(--text-primary)]
              placeholder:text-[var(--text-tertiary)]
              focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring-color)]"
          />
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {confirmResetAll ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-danger-600)] bg-[var(--color-danger-600)]/5">
              <span className="text-sm text-[var(--text-primary)]">Reset all shortcuts to defaults?</span>
              <button
                onClick={() => { resetAll(); setConfirmResetAll(false) }}
                className="px-3 py-1 rounded bg-[var(--color-danger-600)] text-white text-xs cursor-pointer hover:bg-[var(--color-danger-500)]"
              >
                Reset All
              </button>
              <button
                onClick={() => setConfirmResetAll(false)}
                className="px-3 py-1 rounded border border-[var(--border-default)] text-xs text-[var(--text-secondary)] cursor-pointer hover:bg-[var(--bg-hover)]"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmResetAll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)]
                text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              <RotateCcw size={14} />
              Reset All to Defaults
            </button>
          )}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)]
              text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <Download size={14} />
            Export Hotkeys
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-default)]
              text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <Upload size={14} />
            Import Hotkeys
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".ccs-keys,.json"
            onChange={handleImport}
            className="hidden"
          />
        </div>

        {/* Import result message */}
        {importResult && (
          <div className="p-2.5 rounded-lg bg-[var(--bg-muted)] border border-[var(--border-default)] text-sm text-[var(--text-secondary)]">
            {importResult}
          </div>
        )}
      </div>

      {/* Category sections */}
      {filteredCategories.map((category) => (
        <CategorySection key={category} category={category} />
      ))}

      {filteredCategories.length === 0 && searchQuery && (
        <p className="text-sm text-[var(--text-tertiary)] text-center py-8">
          No shortcuts found matching &ldquo;{searchQuery}&rdquo;
        </p>
      )}
    </div>
  )
}
