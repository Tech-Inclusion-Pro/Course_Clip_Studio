import { Clock, Layout, Palette, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/stores/useCourseStore'
import { useDashboardStore, type DashboardSection } from '@/stores/useDashboardStore'
import { ROUTES } from '@/lib/constants'

export function DashboardSidebar(): JSX.Element {
  const navigate = useNavigate()
  const courses = useCourseStore((s) => s.courses)
  const setActiveCourse = useCourseStore((s) => s.setActiveCourse)
  const activeSection = useDashboardStore((s) => s.activeSection)
  const setActiveSection = useDashboardStore((s) => s.setActiveSection)

  // Last 5 courses sorted by updatedAt
  const recentCourses = [...courses]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  function handleOpenCourse(courseId: string) {
    setActiveCourse(courseId)
    navigate(ROUTES.EDITOR)
  }

  const sections: Array<{ id: DashboardSection; label: string; icon: typeof Layout }> = [
    { id: 'courses', label: 'My Courses', icon: Layout },
    { id: 'templates', label: 'Templates', icon: Layout },
    { id: 'content-areas', label: 'Content Areas', icon: BookOpen }
  ]

  return (
    <aside
      className="
        w-60 shrink-0 border-r border-[var(--border-default)]
        bg-[var(--bg-surface)] overflow-y-auto p-4
      "
      aria-label="Dashboard navigation"
    >
      {/* Section navigation */}
      <nav className="mb-6">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`
              w-full flex items-center gap-2 px-3 py-2 mb-1
              rounded-md text-sm cursor-pointer
              font-[var(--font-weight-medium)]
              transition-colors duration-[var(--duration-fast)]
              ${
                activeSection === section.id
                  ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }
            `}
            aria-current={activeSection === section.id ? 'page' : undefined}
          >
            <section.icon size={16} />
            {section.label}
          </button>
        ))}

        <button
          onClick={() => navigate(ROUTES.SETTINGS)}
          className="
            w-full flex items-center gap-2 px-3 py-2 mb-1
            rounded-md text-sm cursor-pointer
            font-[var(--font-weight-medium)]
            text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]
            transition-colors duration-[var(--duration-fast)]
          "
        >
          <Palette size={16} />
          Brand Kit
        </button>
      </nav>

      {/* Recent courses */}
      <div>
        <h3 className="flex items-center gap-1.5 text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-1">
          <Clock size={12} aria-hidden="true" />
          Recent
        </h3>
        {recentCourses.length === 0 ? (
          <p className="text-xs text-[var(--text-tertiary)] px-1">No recent courses</p>
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
    </aside>
  )
}
