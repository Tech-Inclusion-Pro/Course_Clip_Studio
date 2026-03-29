import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  PenTool,
  Eye,
  Settings,
  Upload,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { NAV_ITEMS } from '@/lib/constants'
import logoSrc from '@/assets/logo.png'

const iconMap: Record<string, typeof LayoutDashboard> = {
  LayoutDashboard,
  PenTool,
  Eye,
  Settings,
  Upload
}

export function Sidebar(): JSX.Element {
  const collapsed = useAppStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useAppStore((s) => s.toggleSidebar)

  return (
    <aside
      className="
        flex flex-col
        bg-[var(--bg-sidebar)] border-r border-[var(--border-default)]
        transition-[width] duration-[var(--duration-normal)] ease-[var(--ease-default)]
        overflow-hidden shrink-0
      "
      style={{ width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}
      aria-label="Main navigation"
    >
      {/* Logo + brand */}
      <div className="flex items-center gap-2.5 px-3 pt-10 pb-3 shrink-0">
        <img
          src={logoSrc}
          alt="Course Clip Studio logo"
          className="w-8 h-8 rounded-[var(--radius-md)] shrink-0"
        />
        {!collapsed && (
          <span className="text-sm font-[var(--font-weight-bold)] text-[var(--text-primary)] truncate">
            Course Clip Studio
          </span>
        )}
      </div>

      <nav className="flex flex-col gap-1 p-2 flex-1">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon]
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                min-tap-target flex items-center gap-3 px-3 py-2
                rounded-[var(--radius-md)]
                text-sm font-[var(--font-weight-medium)]
                transition-colors duration-[var(--duration-fast)]
                no-underline
                ${
                  isActive
                    ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                }
              `}
              title={item.label}
            >
              <Icon size={20} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-2 border-t border-[var(--border-default)]">
        <button
          onClick={toggleSidebar}
          className="
            min-tap-target flex items-center justify-center gap-3 w-full px-3 py-2
            rounded-[var(--radius-md)]
            text-sm text-[var(--text-secondary)]
            hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
            transition-colors duration-[var(--duration-fast)]
            cursor-pointer
          "
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen size={20} /> : <PanelLeftClose size={20} />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
