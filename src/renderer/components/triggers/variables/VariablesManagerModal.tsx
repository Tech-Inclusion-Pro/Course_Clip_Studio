import { useState, useEffect, useRef } from 'react'
import { X, Search } from 'lucide-react'
import { useEditorStore } from '@/stores/useEditorStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useTriggersStore } from '@/stores/triggers-store'
import { SYSTEM_VARIABLES } from '@/lib/triggers/defaults'
import { VariableForm } from './VariableForm'
import { VariableRow } from './VariableRow'
import type { Variable } from '@/types/trigger-model'

export function VariablesManagerModal(): JSX.Element {
  const closeVariablesModal = useEditorStore((s) => s.closeVariablesModal)
  const activeCourseId = useCourseStore((s) => s.activeCourseId)

  const [activeTab, setActiveTab] = useState<'project' | 'system'>('project')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const panelRef = useRef<HTMLDivElement>(null)

  const projectVars = activeCourseId
    ? useTriggersStore.getState().getVariables(activeCourseId)
    : []

  const filteredProjectVars = projectVars.filter(
    (v) => !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredSystemVars = SYSTEM_VARIABLES.filter(
    (v) => !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Focus trap
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  // Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeVariablesModal()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [closeVariablesModal])

  function handleCreate(data: Omit<Variable, 'id' | 'createdAt' | 'updatedAt'>) {
    if (!activeCourseId) return
    useTriggersStore.getState().addVariable(activeCourseId, data)
    setShowCreateForm(false)
  }

  function handleDelete(variableId: string) {
    if (!activeCourseId) return
    useTriggersStore.getState().removeVariable(activeCourseId, variableId)
  }

  function handleUpdate(variableId: string, partial: Partial<Variable>) {
    if (!activeCourseId) return
    useTriggersStore.getState().updateVariable(activeCourseId, variableId, partial)
  }

  return (
    <div
      className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) closeVariablesModal() }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="variables-modal-title"
        tabIndex={-1}
        className="w-full max-w-[640px] max-h-[80vh] mx-4 rounded-xl shadow-xl bg-[var(--bg-surface)] flex flex-col focus:outline-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-default)]">
          <h2 id="variables-modal-title" className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Variables Manager
          </h2>
          <button
            onClick={closeVariablesModal}
            className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border-default)]" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'project'}
            onClick={() => setActiveTab('project')}
            className={`flex-1 px-4 py-2.5 text-xs font-[var(--font-weight-medium)] cursor-pointer transition-colors ${
              activeTab === 'project'
                ? 'text-[var(--brand-magenta)] border-b-2 border-[var(--brand-magenta)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Project Variables
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'system'}
            onClick={() => setActiveTab('system')}
            className={`flex-1 px-4 py-2.5 text-xs font-[var(--font-weight-medium)] cursor-pointer transition-colors ${
              activeTab === 'system'
                ? 'text-[var(--brand-magenta)] border-b-2 border-[var(--brand-magenta)]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            System Variables
          </button>
        </div>

        {/* Search */}
        <div className="px-6 pt-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search variables..."
              aria-label="Search variables"
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-3">
          {activeTab === 'project' && (
            <div className="space-y-2">
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full px-3 py-2 text-xs font-[var(--font-weight-medium)] rounded-lg border-2 border-dashed border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--brand-indigo)] hover:text-[var(--brand-indigo)] cursor-pointer transition-colors"
                >
                  + Create Variable
                </button>
              )}

              {showCreateForm && (
                <VariableForm
                  onSave={handleCreate}
                  onCancel={() => setShowCreateForm(false)}
                  existingNames={projectVars.map((v) => v.name)}
                />
              )}

              {filteredProjectVars.length === 0 && !showCreateForm && (
                <p className="text-xs text-[var(--text-tertiary)] text-center py-4">
                  No project variables yet. Create one to use in triggers.
                </p>
              )}

              {filteredProjectVars.map((v) => (
                <VariableRow
                  key={v.id}
                  variable={v}
                  onUpdate={(partial) => handleUpdate(v.id, partial)}
                  onDelete={() => handleDelete(v.id)}
                />
              ))}
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-1">
              {filteredSystemVars.map((v) => (
                <div key={v.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[var(--bg-muted)]">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)] font-mono">
                      {v.name}
                    </p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{v.description}</p>
                  </div>
                  <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-surface)] text-[var(--text-secondary)] border border-[var(--border-default)]">
                    {v.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3 border-t border-[var(--border-default)]">
          <button
            onClick={closeVariablesModal}
            className="px-4 py-2 text-sm font-[var(--font-weight-medium)] rounded-lg bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-default)] hover:bg-[var(--bg-hover)] cursor-pointer min-tap-target"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
