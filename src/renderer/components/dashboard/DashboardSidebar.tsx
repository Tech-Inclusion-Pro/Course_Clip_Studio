import { Clock, Layout, Palette, BookOpen, FileText, ClipboardList, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/stores/useCourseStore'
import { useDashboardStore, type DashboardSection } from '@/stores/useDashboardStore'
import { useT } from '@/hooks/useT'
import { ROUTES } from '@/lib/constants'

export function DashboardSidebar(): JSX.Element {
  const navigate = useNavigate()
  const t = useT()
  const courses = useCourseStore((s) => s.courses)
  const setActiveCourse = useCourseStore((s) => s.setActiveCourse)
  const activeSection = useDashboardStore((s) => s.activeSection)
  const setActiveSection = useDashboardStore((s) => s.setActiveSection)
  const collapsed = useDashboardStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useDashboardStore((s) => s.toggleSidebar)

  // Last 5 courses sorted by updatedAt
  const recentCourses = [...courses]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  function handleOpenCourse(courseId: string) {
    setActiveCourse(courseId)
    navigate(ROUTES.EDITOR)
  }

  const sections: Array<{ id: DashboardSection; label: string; icon: typeof Layout }> = [
    { id: 'courses', label: t('sidebar.myCourses', 'My Courses'), icon: Layout },
    { id: 'templates', label: t('sidebar.templates', 'Templates'), icon: FileText },
    { id: 'content-areas', label: t('sidebar.contentAreas', 'Content Areas'), icon: BookOpen },
    { id: 'syllabus', label: t('sidebar.syllabusBuilder', 'Syllabus Builder'), icon: ClipboardList }
  ]

  return (
    <aside
      className={`
        shrink-0 border-r border-[var(--border-default)]
        bg-[var(--bg-surface)] overflow-y-auto
        flex flex-col
        transition-[width] duration-200 ease-in-out
        ${collapsed ? 'w-12' : 'w-60'}
      `}
      style={{ minHeight: '100%' }}
      aria-label="Dashboard navigation"
    >
      {/* Collapse toggle */}
      <div className={`flex items-center ${collapsed ? 'justify-center py-3' : 'justify-end px-3 pt-3 pb-1'}`}>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label={collapsed ? t('sidebar.expandSidebar', 'Expand sidebar') : t('sidebar.collapseSidebar', 'Collapse sidebar')}
          title={collapsed ? t('sidebar.expandSidebar', 'Expand sidebar') : t('sidebar.collapseSidebar', 'Collapse sidebar')}
        >
          {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
        </button>
      </div>

      {/* Section navigation */}
      <nav className={`mb-6 ${collapsed ? 'px-1.5' : 'px-4'}`}>
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              w-full flex items-center gap-2 mb-1
              rounded-md text-sm cursor-pointer
              font-[var(--font-weight-medium)]
              transition-colors duration-[var(--duration-fast)]
              ${collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'}
              ${
                activeSection === section.id
                  ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }
            `}
            aria-current={activeSection === section.id ? 'page' : undefined}
            title={collapsed ? section.label : undefined}
          >
            <section.icon size={16} className="shrink-0" />
            {!collapsed && section.label}
          </button>
        ))}

        <button
          onClick={() => navigate(ROUTES.SETTINGS)}
          className={`
            w-full flex items-center gap-2 mb-1
            rounded-md text-sm cursor-pointer
            font-[var(--font-weight-medium)]
            text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
            transition-colors duration-[var(--duration-fast)]
            ${collapsed ? 'justify-center px-0 py-2' : 'px-3 py-2'}
          `}
          title={collapsed ? t('sidebar.brandKit', 'Brand Kit') : undefined}
        >
          <Palette size={16} className="shrink-0" />
          {!collapsed && t('sidebar.brandKit', 'Brand Kit')}
        </button>
      </nav>

      {/* Recent courses — hidden when collapsed */}
      {!collapsed && (
        <div className="px-4 pb-4">
          <h3 className="flex items-center gap-1.5 text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-1">
            <Clock size={12} aria-hidden="true" />
            {t('sidebar.recent', 'Recent')}
          </h3>
          {recentCourses.length === 0 ? (
            <p className="text-xs text-[var(--text-tertiary)] px-1">{t('sidebar.noRecentCourses', 'No recent courses')}</p>
          ) : (
            <ul className="space-y-0.5">
              {recentCourses.map((course) => (
                <li key={course.id}>
                  <button
                    onClick={() => handleOpenCourse(course.id)}
                    className="
                      w-full text-left px-3 py-1.5 text-sm cursor-pointer
                      rounded-md truncate
                      text-[var(--text-secondary)]
                      hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
                      transition-colors duration-[var(--duration-fast)]
                    "
                    title={course.meta.title}
                  >
                    {course.meta.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </aside>
  )
}
