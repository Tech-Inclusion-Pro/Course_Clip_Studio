import { useDashboardStore } from '@/stores/useDashboardStore'
import { STATUS_FILTER_OPTIONS } from '@/lib/constants'
import type { PublishStatus } from '@/types/course'

interface FilterBarProps {
  allTags: string[]
}

export function FilterBar({ allTags }: FilterBarProps): JSX.Element {
  const statusFilter = useDashboardStore((s) => s.statusFilter)
  const setStatusFilter = useDashboardStore((s) => s.setStatusFilter)
  const tagFilter = useDashboardStore((s) => s.tagFilter)
  const setTagFilter = useDashboardStore((s) => s.setTagFilter)

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status filters */}
      <div className="flex items-center gap-1" role="group" aria-label="Filter by status">
        {STATUS_FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value as PublishStatus | 'all')}
            aria-pressed={statusFilter === opt.value}
            className={`
              px-3 py-1.5 text-xs font-[var(--font-weight-medium)]
              rounded-full border cursor-pointer
              transition-colors duration-[var(--duration-fast)]
              ${
                statusFilter === opt.value
                  ? 'bg-[var(--brand-magenta)] text-white border-[var(--brand-magenta)]'
                  : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]'
              }
            `}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <>
          <div className="w-px h-5 bg-[var(--border-default)]" aria-hidden="true" />
          <div className="flex items-center gap-1" role="group" aria-label="Filter by tag">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tag)}
                aria-pressed={tagFilter === tag}
                className={`
                  px-2.5 py-1 text-xs rounded-full border cursor-pointer
                  transition-colors duration-[var(--duration-fast)]
                  ${
                    tagFilter === tag
                      ? 'bg-[var(--bg-active)] text-[var(--text-brand)] border-[var(--brand-magenta)]'
                      : 'bg-[var(--bg-surface)] text-[var(--text-tertiary)] border-[var(--border-default)] hover:bg-[var(--bg-hover)]'
                  }
                `}
              >
                {tag}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
