import { useLocation } from 'react-router-dom'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { NAV_ITEMS } from '@/lib/constants'

export function TopBar(): JSX.Element {
  const location = useLocation()
  const currentItem = NAV_ITEMS.find((item) => item.path === location.pathname)
  const title = currentItem?.label ?? 'LuminaUDL'

  return (
    <header
      className="
        drag-region flex items-center justify-between
        h-[var(--topbar-height)] px-4
        bg-[var(--bg-topbar)] border-b border-[var(--border-default)]
      "
      role="banner"
    >
      <h1 className="no-drag text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
        {title}
      </h1>
      <div className="no-drag flex items-center gap-1">
        <ThemeToggle />
      </div>
    </header>
  )
}
