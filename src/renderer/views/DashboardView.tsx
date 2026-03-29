import { Plus, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourseStore } from '@/stores/useCourseStore'

export function DashboardView(): JSX.Element {
  const courses = useCourseStore((s) => s.courses)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">
            My Courses
          </h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create and manage your course content
          </p>
        </div>
        <Button variant="primary" size="md">
          <Plus size={18} />
          New Course
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div
            className="
              w-16 h-16 mb-4 rounded-[var(--radius-xl)]
              bg-[var(--bg-muted)] flex items-center justify-center
            "
          >
            <BookOpen size={32} className="text-[var(--text-tertiary)]" />
          </div>
          <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            No courses yet
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">
            Get started by creating your first course. You can add modules, lessons, and interactive
            content blocks.
          </p>
          <Button variant="primary" size="lg">
            <Plus size={18} />
            Create Your First Course
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="
                p-4 rounded-[var(--radius-lg)]
                bg-[var(--bg-surface)] border border-[var(--border-default)]
                shadow-[var(--shadow-sm)] hover:shadow-[var(--shadow-md)]
                transition-shadow duration-[var(--duration-fast)]
                cursor-pointer
              "
            >
              <h3 className="font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {course.meta.title}
              </h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)] line-clamp-2">
                {course.meta.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
