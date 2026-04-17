import { useState, useMemo } from 'react'
import { Zap, X, Plus, Search, Settings2 } from 'lucide-react'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useTriggersStore } from '@/stores/triggers-store'
import { TriggerList } from './TriggerList'

export function TriggersPanel({ onClose }: { onClose: () => void }): JSX.Element {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const openTriggerEditor = useEditorStore((s) => s.openTriggerEditor)
  const openVariablesModal = useEditorStore((s) => s.openVariablesModal)
  const activeCourseId = useCourseStore((s) => s.activeCourseId)

  const [activeTab, setActiveTab] = useState<'block' | 'lesson' | 'course'>('block')
  const [searchQuery, setSearchQuery] = useState('')

  const triggers = useMemo(() => {
    if (!activeCourseId || !selectedBlockId) return []
    return useTriggersStore.getState().getTriggersForBlock(activeCourseId, selectedBlockId)
  }, [activeCourseId, selectedBlockId])

  const filteredTriggers = useMemo(() => {
    if (!searchQuery) return triggers
    const q = searchQuery.toLowerCase()
    return triggers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.event.toLowerCase().includes(q) ||
        t.actions.some((a) => a.type.toLowerCase().includes(q))
    )
  }, [triggers, searchQuery])

  const tabs = [
    { id: 'block' as const, label: 'This Block', disabled: false },
    { id: 'lesson' as const, label: 'This Lesson', disabled: true },
    { id: 'course' as const, label: 'Course-Wide', disabled: true }
  ]

  return (
    <section
      role="complementary"
      aria-label="Triggers"
      className="flex flex-col h-full"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-[var(--brand-magenta)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Triggers
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
          aria-label="Close triggers panel"
        >
          <X size={16} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--border-default)]" role="tablist" aria-label="Trigger scope">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            className={`
              flex-1 px-3 py-2 text-xs font-[var(--font-weight-medium)] transition-colors cursor-pointer
              ${activeTab === tab.id
                ? 'text-[var(--brand-magenta)] border-b-2 border-[var(--brand-magenta)]'
                : tab.disabled
                  ? 'text-[var(--text-tertiary)] opacity-50 cursor-not-allowed'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedBlockId ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <Zap size={24} className="text-[var(--text-tertiary)] mb-2" />
            <p className="text-sm text-[var(--text-secondary)]">
              Select a block to see its triggers
            </p>
          </div>
        ) : (
          <div className="p-3 space-y-3">
            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search triggers..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              />
            </div>

            {/* New Trigger button */}
            <button
              onClick={() => openTriggerEditor(null)}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-[var(--font-weight-medium)] rounded-lg bg-[var(--brand-indigo)] text-white hover:opacity-90 transition-colors cursor-pointer min-tap-target"
            >
              <Plus size={14} />
              New Trigger
            </button>

            {/* Trigger list */}
            <TriggerList triggers={filteredTriggers} />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-[var(--border-default)]">
        <button
          onClick={openVariablesModal}
          className="flex items-center gap-1.5 text-xs text-[var(--brand-magenta)] hover:underline cursor-pointer"
        >
          <Settings2 size={12} />
          Manage Variables
        </button>
      </div>
    </section>
  )
}
