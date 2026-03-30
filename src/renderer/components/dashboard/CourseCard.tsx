import { useNavigate } from 'react-router-dom'
import { BookOpen, Layers, Calendar } from 'lucide-react'
import type { Course } from '@/types/course'
import { PUBLISH_STATUS_CONFIG, ROUTES } from '@/lib/constants'
import { useCourseStore } from '@/stores/useCourseStore'
import { useAppStore } from '@/stores/useAppStore'
import { deleteCourseFromWorkspace } from '@/lib/workspace'
import { CardActionsMenu } from './CardActionsMenu'

interface CourseCardProps {
  course: Course
}

const ACCENT_GRADIENTS = [
  'from-indigo-500 to-purple-500',
  'from-pink-500 to-rose-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-cyan-500 to-blue-500',
  'from-violet-500 to-fuchsia-500'
]

function getGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0
  }
  return ACCENT_GRADIENTS[Math.abs(hash) % ACCENT_GRADIENTS.length]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

function countLessons(course: Course): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
}

export function CourseCard({ course }: CourseCardProps): JSX.Element {
  const navigate = useNavigate()
  const setActiveCourse = useCourseStore((s) => s.setActiveCourse)
  const removeCourse = useCourseStore((s) => s.removeCourse)
  const duplicateCourse = useCourseStore((s) => s.duplicateCourse)

  const statusConfig = PUBLISH_STATUS_CONFIG[course.publishStatus]
  const gradient = getGradient(course.id)
  const lessonCount = countLessons(course)

  function handleOpen() {
    setActiveCourse(course.id)
    navigate(ROUTES.EDITOR)
  }

  return (
    <div
      role="listitem"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleOpen() }}
      onClick={handleOpen}
      className="
        group relative flex flex-col
        rounded-xl overflow-hidden
        bg-[var(--bg-surface)] border border-[var(--border-default)]
        shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
        transition-shadow duration-[var(--duration-fast)]
        cursor-pointer
        focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] focus:ring-offset-2
      "
    >
      {/* Gradient accent bar */}
      <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} aria-hidden="true" />

      <div className="flex flex-col flex-1 p-4">
        {/* Header: title + actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] line-clamp-2 flex-1">
            {course.meta.title}
          </h3>
          <div className="shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
            <CardActionsMenu
              onOpen={handleOpen}
              onDuplicate={() => duplicateCourse(course.id)}
              onExport={() => {/* TODO: export */}}
              onDelete={() => {
                const wp = useAppStore.getState().workspacePath
                if (wp) {
                  deleteCourseFromWorkspace(wp, course.id).catch((err) =>
                    console.error('Failed to delete from workspace:', err)
                  )
                }
                removeCourse(course.id)
              }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 mb-3 flex-1">
          {course.meta.description || 'No description'}
        </p>

        {/* Status badge */}
        <div className="mb-3">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-[var(--font-weight-medium)]"
            style={{ color: statusConfig.color, backgroundColor: statusConfig.bgColor }}
          >
            {statusConfig.label}
          </span>
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
          <span className="inline-flex items-center gap-1" title={`${course.modules.length} modules`}>
            <Layers size={12} aria-hidden="true" />
            {course.modules.length}
          </span>
          <span className="inline-flex items-center gap-1" title={`${lessonCount} lessons`}>
            <BookOpen size={12} aria-hidden="true" />
            {lessonCount}
          </span>
          <span className="inline-flex items-center gap-1 ml-auto" title={`Updated ${formatDate(course.updatedAt)}`}>
            <Calendar size={12} aria-hidden="true" />
            {formatDate(course.updatedAt)}
          </span>
        </div>
      </div>
    </div>
  )
}
