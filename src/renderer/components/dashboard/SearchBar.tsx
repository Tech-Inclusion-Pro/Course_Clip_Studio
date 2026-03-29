import { Search } from 'lucide-react'
import { useDashboardStore } from '@/stores/useDashboardStore'

export function SearchBar(): JSX.Element {
  const searchQuery = useDashboardStore((s) => s.searchQuery)
  const setSearchQuery = useDashboardStore((s) => s.setSearchQuery)

  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
        aria-hidden="true"
      />
      <input
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search courses..."
        aria-label="Search courses"
        className="
          w-full pl-9 pr-3 py-2 text-sm
          rounded-lg border border-[var(--border-default)]
          bg-[var(--bg-surface)] text-[var(--text-primary)]
          placeholder:text-[var(--text-tertiary)]
          focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
          transition-colors duration-[var(--duration-fast)]
        "
      />
    </div>
  )
}
