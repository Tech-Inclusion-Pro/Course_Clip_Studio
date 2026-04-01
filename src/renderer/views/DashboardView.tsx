import { useState, useMemo } from 'react'
import { Plus, Upload, BookOpen, Search as SearchIcon, FolderOpen } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourseStore } from '@/stores/useCourseStore'
import { useDashboardStore } from '@/stores/useDashboardStore'
import { useAppStore } from '@/stores/useAppStore'
import { COURSE_TEMPLATES } from '@/lib/constants'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { SearchBar } from '@/components/dashboard/SearchBar'
import { FilterBar } from '@/components/dashboard/FilterBar'
import { CourseCard } from '@/components/dashboard/CourseCard'
import { TemplateCard } from '@/components/dashboard/TemplateCard'
import { NewCourseDialog } from '@/components/dashboard/NewCourseDialog'
import { ImportDialog } from '@/components/dashboard/ImportDialog'
import { ContentAreasSection } from '@/components/dashboard/ContentAreasSection'
import { WorkspacePickerDialog } from '@/components/dashboard/WorkspacePickerDialog'
import { createCourse } from '@/lib/mock-data'
import { saveCourseToWorkspace } from '@/lib/workspace'
import type { CourseTemplate } from '@/types/course'

export function DashboardView(): JSX.Element {
  const workspacePath = useAppStore((s) => s.workspacePath)
  const workspaceLoaded = useAppStore((s) => s.workspaceLoaded)

  const courses = useCourseStore((s) => s.courses)
  const addCourse = useCourseStore((s) => s.addCourse)
  const searchQuery = useDashboardStore((s) => s.searchQuery)
  const statusFilter = useDashboardStore((s) => s.statusFilter)
  const tagFilter = useDashboardStore((s) => s.tagFilter)
  const activeSection = useDashboardStore((s) => s.activeSection)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set<string>()
    courses.forEach((c) => c.meta.tags.forEach((t) => tags.add(t)))
    return Array.from(tags).sort()
  }, [courses])

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = c.meta.title.toLowerCase().includes(q)
        const matchesDesc = c.meta.description.toLowerCase().includes(q)
        if (!matchesTitle && !matchesDesc) return false
      }
      // Status
      if (statusFilter !== 'all' && c.publishStatus !== statusFilter) return false
      // Tag
      if (tagFilter && !c.meta.tags.includes(tagFilter)) return false
      return true
    })
  }, [courses, searchQuery, statusFilter, tagFilter])

  function handleTemplateCreate(template: CourseTemplate) {
    const base = template.factory()
    const course = createCourse(base)
    addCourse(course)
    if (workspacePath) {
      saveCourseToWorkspace(workspacePath, course).catch((err) =>
        console.error('Failed to save new course:', err)
      )
    }
  }

  // Show loading state while workspace initializes
  if (!workspaceLoaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-sm text-[var(--text-tertiary)]">Loading workspace...</p>
      </div>
    )
  }

  // Show workspace picker if no workspace set
  if (!workspacePath) {
    return <WorkspacePickerDialog />
  }

  return (
    <div className="flex h-full -m-6">
      <DashboardSidebar />

      <div className="flex-1 overflow-y-auto p-6">
        {activeSection === 'courses' ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">
                  My Courses
                </h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  Create and manage your course content
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="md" onClick={() => setImportOpen(true)}>
                  <Upload size={18} />
                  Import
                </Button>
                <Button variant="primary" size="md" onClick={() => setDialogOpen(true)}>
                  <Plus size={18} />
                  New Course
                </Button>
              </div>
            </div>

            {/* Search + Filter */}
            <div className="mb-4 max-w-sm">
              <SearchBar />
            </div>
            <div className="mb-6">
              <FilterBar allTags={allTags} />
            </div>

            {/* Result count (live region) */}
            <div aria-live="polite" className="sr-only">
              {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found
            </div>

            {/* Course grid */}
            {filteredCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-16 h-16 mb-4 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center">
                  {searchQuery || statusFilter !== 'all' || tagFilter ? (
                    <SearchIcon size={32} className="text-[var(--text-tertiary)]" />
                  ) : (
                    <BookOpen size={32} className="text-[var(--text-tertiary)]" />
                  )}
                </div>
                <h3 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
                  {searchQuery || statusFilter !== 'all' || tagFilter
                    ? 'No matching courses'
                    : 'No courses yet'}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] max-w-md mb-6">
                  {searchQuery || statusFilter !== 'all' || tagFilter
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Get started by creating your first course. You can add modules, lessons, and interactive content blocks.'}
                </p>
                {!searchQuery && statusFilter === 'all' && !tagFilter && (
                  <Button variant="primary" size="lg" onClick={() => setDialogOpen(true)}>
                    <Plus size={18} />
                    Create Your First Course
                  </Button>
                )}
              </div>
            ) : (
              <div
                role="list"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </>
        ) : activeSection === 'content-areas' ? (
          <ContentAreasSection />
        ) : (
          /* Templates Section */
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">
                Templates
              </h2>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Start with a pre-built course structure
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {COURSE_TEMPLATES.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={handleTemplateCreate}
                />
              ))}
            </div>
          </>
        )}

        <NewCourseDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
        <ImportDialog open={importOpen} onClose={() => setImportOpen(false)} />

        {/* Workspace path indicator */}
        <div className="mt-8 pt-4 border-t border-[var(--border-default)]">
          <p className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
            <FolderOpen size={12} />
            {workspacePath}
          </p>
        </div>
      </div>
    </div>
  )
}
