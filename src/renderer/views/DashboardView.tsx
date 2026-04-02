import { useState, useMemo } from 'react'
import { Plus, Upload, BookOpen, Search as SearchIcon, FolderOpen, Trash2, X, Save } from 'lucide-react'
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
import { SyllabusBuilderSection } from '@/components/syllabus/SyllabusBuilderSection'
import { WorkspacePickerDialog } from '@/components/dashboard/WorkspacePickerDialog'
import { createCourse } from '@/lib/mock-data'
import { saveCourseToWorkspace } from '@/lib/workspace'
import { uid } from '@/lib/uid'
import type { CourseTemplate, UserTemplate } from '@/types/course'

const ICON_OPTIONS = [
  'FileText',
  'Briefcase',
  'Users',
  'ShieldCheck',
  'GraduationCap',
  'Accessibility'
]

export function DashboardView(): JSX.Element {
  const workspacePath = useAppStore((s) => s.workspacePath)
  const workspaceLoaded = useAppStore((s) => s.workspaceLoaded)

  const courses = useCourseStore((s) => s.courses)
  const addCourse = useCourseStore((s) => s.addCourse)
  const searchQuery = useDashboardStore((s) => s.searchQuery)
  const statusFilter = useDashboardStore((s) => s.statusFilter)
  const tagFilter = useDashboardStore((s) => s.tagFilter)
  const activeSection = useDashboardStore((s) => s.activeSection)
  const userTemplates = useAppStore((s) => s.userTemplates)
  const removeUserTemplate = useAppStore((s) => s.removeUserTemplate)

  const addUserTemplate = useAppStore((s) => s.addUserTemplate)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false)

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

  function handleUserTemplateCreate(template: UserTemplate) {
    try {
      const parsed = JSON.parse(template.courseJson)
      // Generate fresh IDs
      const now = new Date().toISOString()
      const newCourse = {
        ...parsed,
        id: uid('course'),
        createdAt: now,
        updatedAt: now
      }
      // Regenerate module/lesson IDs
      for (const mod of newCourse.modules ?? []) {
        mod.id = uid('mod')
        for (const lesson of mod.lessons ?? []) {
          lesson.id = uid('les')
          for (const block of lesson.blocks ?? []) {
            block.id = uid('blk')
          }
        }
      }
      addCourse(newCourse)
      if (workspacePath) {
        saveCourseToWorkspace(workspacePath, newCourse).catch((err) =>
          console.error('Failed to save new course:', err)
        )
      }
    } catch (err) {
      console.error('Failed to create course from template:', err)
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
        ) : activeSection === 'syllabus' ? (
          <SyllabusBuilderSection />
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

            {/* User Templates */}
            <div className="mb-8">
              <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider mb-3">
                My Templates
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Create New Template card */}
                <button
                  onClick={() => setCreateTemplateOpen(true)}
                  className="
                    flex flex-col items-center justify-center gap-2 p-4
                    rounded-xl border-2 border-dashed border-[var(--border-default)]
                    bg-[var(--bg-surface)]
                    hover:bg-[var(--bg-hover)] hover:border-[var(--brand-magenta)]
                    transition-all duration-[var(--duration-fast)]
                    cursor-pointer text-center
                    focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
                  "
                >
                  <div className="w-10 h-10 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center">
                    <Plus size={20} className="text-[var(--brand-magenta)]" />
                  </div>
                  <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                    Create Template
                  </span>
                  <span className="text-xs text-[var(--text-tertiary)] line-clamp-2">
                    Build a custom template from scratch
                  </span>
                </button>

                {userTemplates.map((tpl) => (
                  <div key={tpl.id} className="relative group">
                    <TemplateCard
                      template={{
                        id: tpl.id,
                        name: tpl.name,
                        description: tpl.description,
                        icon: tpl.icon,
                        tags: tpl.tags,
                        factory: () => JSON.parse(tpl.courseJson)
                      }}
                      onSelect={() => handleUserTemplateCreate(tpl)}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        removeUserTemplate(tpl.id)
                      }}
                      className="absolute top-2 right-2 p-1 rounded-md bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-tertiary)] hover:text-red-500 hover:border-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      aria-label={`Delete ${tpl.name}`}
                      title="Delete template"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Built-in Templates */}
            <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Built-in Templates
            </h3>
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
        <CreateTemplateDialog
          open={createTemplateOpen}
          onClose={() => setCreateTemplateOpen(false)}
          onSave={(tpl) => {
            addUserTemplate(tpl)
            setCreateTemplateOpen(false)
          }}
        />

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

// ─── Create Template Dialog ───

function CreateTemplateDialog({
  open,
  onClose,
  onSave
}: {
  open: boolean
  onClose: () => void
  onSave: (tpl: UserTemplate) => void
}): JSX.Element | null {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('FileText')
  const [moduleCount, setModuleCount] = useState(3)
  const [lessonsPerModule, setLessonsPerModule] = useState(2)

  if (!open) return null

  function handleSave() {
    const modules = Array.from({ length: moduleCount }, (_, mi) => ({
      id: uid('mod'),
      title: `Module ${mi + 1}`,
      description: '',
      lessons: Array.from({ length: lessonsPerModule }, (_, li) => ({
        id: uid('les'),
        title: `Lesson ${li + 1}`,
        description: '',
        blocks: []
      }))
    }))

    const courseData = {
      meta: {
        title: name.trim() || 'Untitled Template',
        description: description.trim(),
        author: 'Course Author',
        language: 'en',
        estimatedDuration: 0,
        tags: [],
        thumbnail: null,
        version: '1.0.0'
      },
      modules,
      publishStatus: 'draft'
    }

    const template: UserTemplate = {
      id: uid('tpl'),
      name: name.trim() || 'Untitled Template',
      description: description.trim(),
      icon,
      tags: [],
      courseJson: JSON.stringify(courseData),
      createdAt: new Date().toISOString()
    }

    onSave(template)
    setName('')
    setDescription('')
    setIcon('FileText')
    setModuleCount(3)
    setLessonsPerModule(2)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Create Template
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="My Template"
            />
          </div>

          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
              placeholder="Brief description of this template..."
            />
          </div>

          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Icon
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Modules
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={moduleCount}
                onChange={(e) => setModuleCount(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              />
            </div>
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Lessons per Module
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={lessonsPerModule}
                onChange={(e) => setLessonsPerModule(Math.max(1, Math.min(10, Number(e.target.value))))}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--border-default)]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save size={14} />
            Create Template
          </Button>
        </div>
      </div>
    </div>
  )
}
