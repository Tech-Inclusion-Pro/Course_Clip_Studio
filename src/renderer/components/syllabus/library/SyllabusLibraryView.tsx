import { Plus, Target, FileCheck, Table2, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSyllabusStore, type LibraryView } from '@/stores/useSyllabusStore'
import { SyllabusCard } from './SyllabusCard'
import { useAppStore } from '@/stores/useAppStore'
import { useAIStore } from '@/stores/useAIStore'
import { BLOOMS_LEVELS } from '@/lib/syllabus-constants'
import type { PoolObjective, PoolAssignment, PoolRubric } from '@/types/syllabus'

const TABS: Array<{ id: LibraryView; label: string; icon: typeof BookOpen }> = [
  { id: 'syllabi', label: 'My Syllabi', icon: BookOpen },
  { id: 'objectives', label: 'Objective Pool', icon: Target },
  { id: 'assignments', label: 'Assignment Pool', icon: FileCheck },
  { id: 'rubrics', label: 'Rubric Pool', icon: Table2 }
]

export function SyllabusLibraryView(): JSX.Element {
  const syllabi = useSyllabusStore((s) => s.syllabi)
  const libraryView = useSyllabusStore((s) => s.libraryView)
  const setLibraryView = useSyllabusStore((s) => s.setLibraryView)
  const createNewSyllabus = useSyllabusStore((s) => s.createNewSyllabus)
  const openSyllabus = useSyllabusStore((s) => s.openSyllabus)
  const duplicateSyllabus = useSyllabusStore((s) => s.duplicateSyllabus)
  const deleteSyllabus = useSyllabusStore((s) => s.deleteSyllabus)
  const objectivePool = useSyllabusStore((s) => s.objectivePool)
  const assignmentPool = useSyllabusStore((s) => s.assignmentPool)
  const rubricPool = useSyllabusStore((s) => s.rubricPool)
  const removeObjectiveFromPool = useSyllabusStore((s) => s.removeObjectiveFromPool)
  const removeAssignmentFromPool = useSyllabusStore((s) => s.removeAssignmentFromPool)
  const removeRubricFromPool = useSyllabusStore((s) => s.removeRubricFromPool)

  function handleSendToAI(syllabusId: string): void {
    const syl = syllabi.find((s) => s.id === syllabusId)
    if (!syl) return
    const context = [
      `Course: ${syl.name}`,
      `Goal: ${syl.courseGoal}`,
      `Audience: ${syl.audience.level} — ${syl.audience.context}`,
      `Objectives:\n${syl.objectives.map((o) => `- [${o.bloomsLevel}] ${o.text}`).join('\n')}`,
      `Assignments:\n${syl.assignments.map((a) => `- ${a.title} (${a.type})`).join('\n')}`
    ].join('\n\n')

    useAIStore.getState().updateInterviewAnswer('audience', syl.audience.level)
    useAIStore.getState().updateInterviewAnswer('objectives', syl.objectives.map((o) => o.text).join('\n'))
    useAIStore.getState().addMessage({ role: 'system', content: `Syllabus loaded as context:\n\n${context}` })
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">
            Syllabus Builder
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create WCAG-compliant course syllabi with AI assistance
          </p>
        </div>
        <Button variant="primary" size="md" onClick={createNewSyllabus}>
          <Plus size={18} />
          New Syllabus
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-default)]" role="tablist" aria-label="Syllabus library tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={libraryView === tab.id}
            onClick={() => setLibraryView(tab.id)}
            className={`
              flex items-center gap-1.5 px-3 py-2 text-sm cursor-pointer
              font-[var(--font-weight-medium)] border-b-2 -mb-px
              transition-colors duration-[var(--duration-fast)]
              ${libraryView === tab.id
                ? 'border-[var(--brand-magenta)] text-[var(--text-brand)]'
                : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}
            `}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div role="tabpanel">
        {libraryView === 'syllabi' && (
          syllabi.length === 0 ? (
            <EmptyState
              message="No syllabi yet"
              detail="Click 'New Syllabus' to create your first course syllabus."
            />
          ) : (
            <div role="list" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {syllabi.map((syl) => (
                <SyllabusCard
                  key={syl.id}
                  syllabus={syl}
                  onOpen={() => openSyllabus(syl.id)}
                  onDuplicate={() => duplicateSyllabus(syl.id)}
                  onDelete={() => deleteSyllabus(syl.id)}
                  onSendToAI={() => handleSendToAI(syl.id)}
                />
              ))}
            </div>
          )
        )}

        {libraryView === 'objectives' && (
          <PoolList
            items={objectivePool}
            emptyMessage="No saved objectives"
            renderItem={(obj: PoolObjective) => (
              <PoolItemCard
                key={obj.id}
                title={obj.text}
                subtitle={`${BLOOMS_LEVELS.find((b) => b.id === obj.bloomsLevel)?.label ?? obj.bloomsLevel}${obj.syllabusName ? ` — from ${obj.syllabusName}` : ''}`}
                onRemove={() => removeObjectiveFromPool(obj.id)}
              />
            )}
          />
        )}

        {libraryView === 'assignments' && (
          <PoolList
            items={assignmentPool}
            emptyMessage="No saved assignments"
            renderItem={(asn: PoolAssignment) => (
              <PoolItemCard
                key={asn.id}
                title={asn.title}
                subtitle={`${asn.type}${asn.syllabusName ? ` — from ${asn.syllabusName}` : ''}`}
                onRemove={() => removeAssignmentFromPool(asn.id)}
              />
            )}
          />
        )}

        {libraryView === 'rubrics' && (
          <PoolList
            items={rubricPool}
            emptyMessage="No saved rubrics"
            renderItem={(rub: PoolRubric) => (
              <PoolItemCard
                key={rub.id}
                title={rub.assignmentName ?? `Rubric (${rub.type})`}
                subtitle={`${rub.rows.length} criteria, ${rub.columns.length} levels${rub.syllabusName ? ` — from ${rub.syllabusName}` : ''}`}
                onRemove={() => removeRubricFromPool(rub.id)}
              />
            )}
          />
        )}
      </div>
    </div>
  )
}

// ─── Helper Components ───

function EmptyState({ message, detail }: { message: string; detail: string }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <BookOpen size={40} className="text-[var(--text-tertiary)] mb-3" />
      <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">{message}</h3>
      <p className="text-sm text-[var(--text-secondary)] max-w-sm">{detail}</p>
    </div>
  )
}

function PoolList<T extends { id: string }>({ items, emptyMessage, renderItem }: {
  items: T[]
  emptyMessage: string
  renderItem: (item: T) => JSX.Element
}): JSX.Element {
  if (items.length === 0) {
    return <EmptyState message={emptyMessage} detail="Items you save to pool from your syllabi will appear here." />
  }
  return <div className="space-y-2">{items.map(renderItem)}</div>
}

function PoolItemCard({ title, subtitle, onRemove }: {
  title: string
  subtitle: string
  onRemove: () => void
}): JSX.Element {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] truncate">{title || 'Untitled'}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{subtitle}</p>
      </div>
      <button
        onClick={onRemove}
        className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-500)] cursor-pointer transition-colors"
        aria-label={`Remove ${title} from pool`}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
      </button>
    </div>
  )
}
