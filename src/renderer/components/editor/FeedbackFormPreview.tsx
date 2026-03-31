import { ClipboardList } from 'lucide-react'
import type { FeedbackFormBlock } from '@/types/course'

interface FeedbackFormPreviewProps {
  block: FeedbackFormBlock
}

export function FeedbackFormPreview({ block }: FeedbackFormPreviewProps): JSX.Element {
  return (
    <div className="p-3 rounded-lg bg-[var(--bg-muted)]">
      <div className="flex items-center gap-2 mb-2">
        <ClipboardList size={16} className="text-[var(--text-tertiary)]" />
        <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
          Feedback Form
        </span>
        <span className="text-[10px] text-[var(--text-tertiary)]">
          ({block.questions.length} question{block.questions.length !== 1 ? 's' : ''})
        </span>
      </div>

      {block.questions.length > 0 ? (
        <div className="space-y-1.5">
          {block.questions.slice(0, 3).map((q, i) => (
            <div key={q.id} className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
              <span className="text-[var(--text-tertiary)] w-4 text-right shrink-0">{i + 1}.</span>
              <span className="truncate flex-1">{q.prompt || 'Untitled question'}</span>
              <span className="text-[9px] text-[var(--text-tertiary)] px-1 py-0.5 rounded bg-[var(--bg-surface)] shrink-0">
                {q.type}
              </span>
              {q.required && (
                <span className="text-[9px] text-red-500 shrink-0">*</span>
              )}
            </div>
          ))}
          {block.questions.length > 3 && (
            <p className="text-[10px] text-[var(--text-tertiary)] pl-6">
              +{block.questions.length - 3} more question{block.questions.length - 3 !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-[var(--text-tertiary)] italic">No questions configured</p>
      )}

      {block.submitLabel && (
        <div className="mt-2 pt-2 border-t border-[var(--border-default)]">
          <span className="text-[10px] text-[var(--text-tertiary)]">
            Button: &ldquo;{block.submitLabel}&rdquo;
          </span>
        </div>
      )}
    </div>
  )
}
