import { Copy, Trash2, Edit3, Send } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Syllabus } from '@/types/syllabus'

interface SyllabusCardProps {
  syllabus: Syllabus
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
  onSendToAI?: () => void
}

export function SyllabusCard({ syllabus, onOpen, onDuplicate, onDelete, onSendToAI }: SyllabusCardProps): JSX.Element {
  const objCount = syllabus.objectives.length
  const asnCount = syllabus.assignments.length
  const rubCount = syllabus.rubrics.length
  const updated = new Date(syllabus.updatedAt).toLocaleDateString()

  return (
    <div
      role="listitem"
      className="
        rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]
        p-4 flex flex-col gap-3
        hover:border-[var(--brand-magenta)] hover:shadow-sm
        transition-all duration-[var(--duration-fast)]
      "
    >
      <div className="flex-1">
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] truncate">
          {syllabus.name || 'Untitled Syllabus'}
        </h3>
        <p className="text-xs text-[var(--text-tertiary)] mt-1 line-clamp-2">
          {syllabus.courseGoal || 'No course goal set'}
        </p>
      </div>

      <div className="flex gap-3 text-xs text-[var(--text-secondary)]">
        <span>{objCount} objective{objCount !== 1 ? 's' : ''}</span>
        <span>{asnCount} assignment{asnCount !== 1 ? 's' : ''}</span>
        <span>{rubCount} rubric{rubCount !== 1 ? 's' : ''}</span>
      </div>

      <p className="text-xs text-[var(--text-tertiary)]">Updated {updated}</p>

      <div className="flex items-center gap-1.5 pt-1 border-t border-[var(--border-default)]">
        <Button variant="ghost" size="sm" onClick={onOpen} title="Open & edit">
          <Edit3 size={14} />
          Open
        </Button>
        <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate">
          <Copy size={14} />
        </Button>
        {onSendToAI && (
          <Button variant="ghost" size="sm" onClick={onSendToAI} title="Send to AI Assistant">
            <Send size={14} />
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={onDelete} title="Delete" className="ml-auto text-[var(--color-danger-500)]">
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  )
}
