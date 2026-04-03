import { Search, Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/lib/constants'
import { Button } from '@/components/ui/Button'

export function SearchOnlineTab(): JSX.Element {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-muted)] flex items-center justify-center mb-1">
        <Search size={24} className="text-[var(--text-tertiary)]" />
      </div>
      <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
        Search Online Assets
      </h3>
      <p className="text-xs text-[var(--text-secondary)] max-w-xs">
        Configure API providers (Pexels, Unsplash, Pixabay) in Settings to search for royalty-free images, videos, and audio.
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(ROUTES.SETTINGS)}
      >
        <Settings size={14} />
        Open Settings
      </Button>
      <p className="text-[10px] text-[var(--text-tertiary)] mt-2">
        Coming in Phase 2
      </p>
    </div>
  )
}
