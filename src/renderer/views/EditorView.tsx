import { List, Layers, SlidersHorizontal } from 'lucide-react'

export function EditorView(): JSX.Element {
  return (
    <div className="flex h-full gap-0 -m-6">
      {/* Outline Panel */}
      <aside
        className="
          w-60 shrink-0 border-r border-[var(--border-default)]
          bg-[var(--bg-surface)] overflow-y-auto p-4
        "
        aria-label="Course outline"
      >
        <div className="flex items-center gap-2 mb-4">
          <List size={18} className="text-[var(--icon-default)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Outline
          </h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">No course loaded</p>
      </aside>

      {/* Canvas */}
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-app)] overflow-y-auto">
        <div className="flex flex-col items-center text-center p-8">
          <Layers size={40} className="text-[var(--text-tertiary)] mb-3" />
          <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
            Canvas
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Select a lesson from the outline to start editing
          </p>
        </div>
      </div>

      {/* Properties Panel */}
      <aside
        className="
          w-72 shrink-0 border-l border-[var(--border-default)]
          bg-[var(--bg-surface)] overflow-y-auto p-4
        "
        aria-label="Block properties"
      >
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal size={18} className="text-[var(--icon-default)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Properties
          </h2>
        </div>
        <p className="text-sm text-[var(--text-tertiary)]">No block selected</p>
      </aside>
    </div>
  )
}
