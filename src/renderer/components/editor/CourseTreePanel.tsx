import { useState, useRef, useEffect, useCallback } from 'react'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FolderOpen,
  Plus,
  MoreHorizontal,
  Pencil,
  Copy,
  Trash2,
  GripVertical
} from 'lucide-react'
import {
  DndContext,
  closestCorners,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  sortableKeyboardCoordinates
} from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { udlStatusColor } from '@/lib/course-helpers'
import { createModule, createLesson } from '@/lib/mock-data'
import type { Module, Lesson } from '@/types/course'

const UDL_DOT_COLORS = {
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  green: 'bg-emerald-500'
} as const

/** Parse a composite sortable ID like "mod1::lesson1" */
function parseSortableId(id: string): { moduleId: string; lessonId: string } {
  const idx = id.indexOf('::')
  return { moduleId: id.slice(0, idx), lessonId: id.slice(idx + 2) }
}

/** Build a composite sortable ID */
function makeSortableId(moduleId: string, lessonId: string): string {
  return `${moduleId}::${lessonId}`
}

export function CourseTreePanel(): JSX.Element {
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const addModule = useCourseStore((s) => s.addModule)
  const removeModule = useCourseStore((s) => s.removeModule)
  const updateModule = useCourseStore((s) => s.updateModule)
  const addLesson = useCourseStore((s) => s.addLesson)
  const removeLesson = useCourseStore((s) => s.removeLesson)
  const updateLesson = useCourseStore((s) => s.updateLesson)
  const reorderLessons = useCourseStore((s) => s.reorderLessons)
  const moveLessonToModule = useCourseStore((s) => s.moveLessonToModule)

  const activeModuleId = useEditorStore((s) => s.activeModuleId)
  const activeLessonId = useEditorStore((s) => s.activeLessonId)
  const setActiveModule = useEditorStore((s) => s.setActiveModule)
  const setActiveLesson = useEditorStore((s) => s.setActiveLesson)

  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    type: 'module' | 'lesson'
    moduleId: string
    lessonId?: string
  } | null>(null)
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)
  const [activeDragLesson, setActiveDragLesson] = useState<Lesson | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  // Auto-expand module containing active lesson
  useEffect(() => {
    if (!course || !activeLessonId) return
    for (const mod of course.modules) {
      if (mod.lessons.some((l) => l.id === activeLessonId)) {
        setExpandedModules((prev) => new Set(prev).add(mod.id))
        break
      }
    }
  }, [activeLessonId, course])

  // Close context menu on outside click
  useEffect(() => {
    if (!contextMenu) return
    function handleClick(e: MouseEvent) {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [contextMenu])

  // Focus rename input
  useEffect(() => {
    if (renamingId) renameInputRef.current?.focus()
  }, [renamingId])

  const toggleModule = useCallback((moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(moduleId)) next.delete(moduleId)
      else next.add(moduleId)
      return next
    })
  }, [])

  function handleSelectLesson(moduleId: string, lessonId: string) {
    setActiveModule(moduleId)
    setActiveLesson(lessonId)
  }

  function handleContextMenu(
    e: React.MouseEvent,
    type: 'module' | 'lesson',
    moduleId: string,
    lessonId?: string
  ) {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY, type, moduleId, lessonId })
  }

  function handleAddModule() {
    if (!activeCourseId) return
    const mod = createModule({ title: 'New Module' })
    addModule(activeCourseId, mod)
    setExpandedModules((prev) => new Set(prev).add(mod.id))
  }

  function handleAddLesson(moduleId: string) {
    if (!activeCourseId) return
    const lesson = createLesson({ title: 'New Lesson' })
    addLesson(activeCourseId, moduleId, lesson)
    setExpandedModules((prev) => new Set(prev).add(moduleId))
    handleSelectLesson(moduleId, lesson.id)
  }

  function handleDelete() {
    if (!contextMenu || !activeCourseId) return
    if (contextMenu.type === 'module') {
      removeModule(activeCourseId, contextMenu.moduleId)
      if (activeModuleId === contextMenu.moduleId) {
        setActiveModule(null)
        setActiveLesson(null)
      }
    } else if (contextMenu.lessonId) {
      removeLesson(activeCourseId, contextMenu.moduleId, contextMenu.lessonId)
      if (activeLessonId === contextMenu.lessonId) {
        setActiveLesson(null)
      }
    }
    setContextMenu(null)
  }

  function handleDuplicate() {
    if (!contextMenu || !activeCourseId || !course) return
    if (contextMenu.type === 'module') {
      const source = course.modules.find((m) => m.id === contextMenu.moduleId)
      if (!source) return
      const copy = createModule({
        ...structuredClone(source),
        title: `${source.title} (Copy)`
      })
      addModule(activeCourseId, copy)
    } else if (contextMenu.lessonId) {
      const mod = course.modules.find((m) => m.id === contextMenu.moduleId)
      const source = mod?.lessons.find((l) => l.id === contextMenu.lessonId)
      if (!source) return
      const copy = createLesson({
        ...structuredClone(source),
        title: `${source.title} (Copy)`
      })
      addLesson(activeCourseId, contextMenu.moduleId, copy)
    }
    setContextMenu(null)
  }

  function startRename() {
    if (!contextMenu || !course) return
    if (contextMenu.type === 'module') {
      const mod = course.modules.find((m) => m.id === contextMenu.moduleId)
      if (mod) { setRenamingId(mod.id); setRenameValue(mod.title) }
    } else if (contextMenu.lessonId) {
      const mod = course.modules.find((m) => m.id === contextMenu.moduleId)
      const les = mod?.lessons.find((l) => l.id === contextMenu.lessonId)
      if (les) { setRenamingId(les.id); setRenameValue(les.title) }
    }
    setContextMenu(null)
  }

  function commitRename() {
    if (!renamingId || !activeCourseId || !course) return
    const trimmed = renameValue.trim()
    if (!trimmed) { setRenamingId(null); return }

    // Check if it's a module
    const mod = course.modules.find((m) => m.id === renamingId)
    if (mod) {
      updateModule(activeCourseId, mod.id, { title: trimmed })
    } else {
      // Find lesson
      for (const m of course.modules) {
        if (m.lessons.some((l) => l.id === renamingId)) {
          updateLesson(activeCourseId, m.id, renamingId, { title: trimmed })
          break
        }
      }
    }
    setRenamingId(null)
  }

  function handleDragStart(event: DragStartEvent) {
    const { moduleId, lessonId } = parseSortableId(event.active.id as string)
    if (!course) return
    const mod = course.modules.find((m) => m.id === moduleId)
    const lesson = mod?.lessons.find((l) => l.id === lessonId)
    if (lesson) setActiveDragLesson(lesson)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragLesson(null)
    const { active, over } = event
    if (!over || !activeCourseId || !course) return

    const activeId = active.id as string
    const overId = over.id as string

    // Check if dropping onto an empty module drop zone (prefixed with "empty::")
    if (overId.startsWith('empty::')) {
      const toModuleId = overId.slice(7)
      const { moduleId: fromModuleId, lessonId } = parseSortableId(activeId)
      if (fromModuleId !== toModuleId) {
        moveLessonToModule(activeCourseId, fromModuleId, toModuleId, lessonId, 0)
        setExpandedModules((prev) => new Set(prev).add(toModuleId))
      }
      return
    }

    const from = parseSortableId(activeId)
    const to = parseSortableId(overId)

    if (activeId === overId) return

    if (from.moduleId === to.moduleId) {
      // Same module reorder
      const mod = course.modules.find((m) => m.id === from.moduleId)
      if (!mod) return
      const fromIndex = mod.lessons.findIndex((l) => l.id === from.lessonId)
      const toIndex = mod.lessons.findIndex((l) => l.id === to.lessonId)
      if (fromIndex !== -1 && toIndex !== -1) {
        reorderLessons(activeCourseId, from.moduleId, fromIndex, toIndex)
      }
    } else {
      // Cross-module move
      const toMod = course.modules.find((m) => m.id === to.moduleId)
      if (!toMod) return
      const toIndex = toMod.lessons.findIndex((l) => l.id === to.lessonId)
      moveLessonToModule(activeCourseId, from.moduleId, to.moduleId, from.lessonId, toIndex !== -1 ? toIndex : toMod.lessons.length)
      setExpandedModules((prev) => new Set(prev).add(to.moduleId))
    }
  }

  if (!course) {
    return (
      <div className="p-4">
        <p className="text-sm text-[var(--text-tertiary)]">No course loaded</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
        <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] truncate">
          Outline
        </h2>
        <button
          onClick={handleAddModule}
          className="p-1 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Add module"
          title="Add module"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Tree */}
      <nav className="flex-1 overflow-y-auto py-2" aria-label="Course outline">
        {course.modules.length === 0 ? (
          <p className="px-4 py-2 text-sm text-[var(--text-tertiary)]">
            No modules yet. Click + to add one.
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <ul role="tree">
              {course.modules.map((mod) => (
                <ModuleNode
                  key={mod.id}
                  mod={mod}
                  courseId={activeCourseId!}
                  expanded={expandedModules.has(mod.id)}
                  activeModuleId={activeModuleId}
                  activeLessonId={activeLessonId}
                  renamingId={renamingId}
                  renameValue={renameValue}
                  renameInputRef={renameInputRef}
                  onToggle={() => toggleModule(mod.id)}
                  onSelectLesson={(lessonId) => handleSelectLesson(mod.id, lessonId)}
                  onContextMenu={handleContextMenu}
                  onAddLesson={() => handleAddLesson(mod.id)}
                  onRenameChange={setRenameValue}
                  onRenameCommit={commitRename}
                />
              ))}
            </ul>

            <DragOverlay>
              {activeDragLesson ? (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[var(--bg-surface)] border border-[var(--brand-magenta)] shadow-lg text-xs text-[var(--text-primary)]">
                  <FileText size={13} className="shrink-0" />
                  <span className="truncate">{activeDragLesson.title}</span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        )}
      </nav>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          style={{ position: 'fixed', left: contextMenu.x, top: contextMenu.y }}
          className="z-50 w-40 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-lg)]"
          role="menu"
        >
          {contextMenu.type === 'module' && (
            <button
              role="menuitem"
              onClick={() => { handleAddLesson(contextMenu.moduleId); setContextMenu(null) }}
              className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              <Plus size={14} /> Add Lesson
            </button>
          )}
          <button
            role="menuitem"
            onClick={startRename}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <Pencil size={14} /> Rename
          </button>
          <button
            role="menuitem"
            onClick={handleDuplicate}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            <Copy size={14} /> Duplicate
          </button>
          <button
            role="menuitem"
            onClick={handleDelete}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)] cursor-pointer"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Sortable Lesson Item ───

interface SortableLessonItemProps {
  lesson: Lesson
  moduleId: string
  isActive: boolean
  isRenaming: boolean
  renameValue: string
  renameInputRef: React.RefObject<HTMLInputElement | null>
  onSelect: () => void
  onContextMenu: (e: React.MouseEvent) => void
  onRenameChange: (value: string) => void
  onRenameCommit: () => void
}

function SortableLessonItem({
  lesson,
  moduleId,
  isActive,
  isRenaming,
  renameValue,
  renameInputRef,
  onSelect,
  onContextMenu,
  onRenameChange,
  onRenameCommit
}: SortableLessonItemProps): JSX.Element {
  const sortableId = makeSortableId(moduleId, lesson.id)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: sortableId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1
  }

  return (
    <li ref={setNodeRef} style={style} role="treeitem" {...attributes}>
      <div
        className={`
          group flex items-center gap-1 px-2 py-1 mx-1 rounded-md cursor-pointer transition-colors
          ${isActive
            ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
          }
        `}
        onClick={onSelect}
        onContextMenu={onContextMenu}
        onKeyDown={(e) => { if (e.key === 'Enter') onSelect() }}
        tabIndex={0}
        aria-label={`Lesson: ${lesson.title}`}
        aria-current={isActive ? 'true' : undefined}
      >
        <button
          className="p-0.5 rounded cursor-grab text-[var(--text-tertiary)] hover:text-[var(--text-primary)] active:cursor-grabbing touch-none opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          tabIndex={-1}
          {...listeners}
        >
          <GripVertical size={12} />
        </button>

        <FileText size={13} className="shrink-0" />

        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenameCommit()
              if (e.key === 'Escape') { onRenameChange(lesson.title); onRenameCommit() }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-xs bg-transparent border border-[var(--border-default)] rounded px-1 py-0.5 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] min-w-0"
          />
        ) : (
          <span className="flex-1 text-xs truncate">{lesson.title}</span>
        )}

        {lesson.accessibilityScore !== null && (
          <span
            className={`text-[10px] font-[var(--font-weight-medium)] shrink-0 ${
              lesson.accessibilityScore >= 80
                ? 'text-emerald-600'
                : lesson.accessibilityScore >= 60
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
            title={`Accessibility score: ${lesson.accessibilityScore}`}
          >
            {lesson.accessibilityScore}
          </span>
        )}

        <button
          onClick={(e) => { e.stopPropagation(); onContextMenu(e as unknown as React.MouseEvent) }}
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-0.5 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-opacity"
          aria-label="Lesson actions"
        >
          <MoreHorizontal size={12} />
        </button>
      </div>
    </li>
  )
}

// ─── Empty Module Drop Zone ───

function EmptyModuleDropZone({ moduleId }: { moduleId: string }): JSX.Element {
  const { setNodeRef, isOver } = useDroppable({ id: `empty::${moduleId}` })

  return (
    <div
      ref={setNodeRef}
      className={`mx-3 my-1 py-2 rounded border border-dashed text-center text-[10px] transition-colors ${
        isOver
          ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5 text-[var(--brand-magenta)]'
          : 'border-[var(--border-default)] text-[var(--text-tertiary)]'
      }`}
    >
      {isOver ? 'Drop lesson here' : 'No lessons'}
    </div>
  )
}

// ─── Module Node ───

interface ModuleNodeProps {
  mod: Module
  courseId: string
  expanded: boolean
  activeModuleId: string | null
  activeLessonId: string | null
  renamingId: string | null
  renameValue: string
  renameInputRef: React.RefObject<HTMLInputElement | null>
  onToggle: () => void
  onSelectLesson: (lessonId: string) => void
  onContextMenu: (e: React.MouseEvent, type: 'module' | 'lesson', moduleId: string, lessonId?: string) => void
  onAddLesson: () => void
  onRenameChange: (value: string) => void
  onRenameCommit: () => void
}

function ModuleNode({
  mod,
  expanded,
  activeLessonId,
  renamingId,
  renameValue,
  renameInputRef,
  onToggle,
  onSelectLesson,
  onContextMenu,
  onAddLesson,
  onRenameChange,
  onRenameCommit
}: ModuleNodeProps): JSX.Element {
  const udlColor = udlStatusColor(mod.udlChecklist)
  const isRenaming = renamingId === mod.id
  const Chevron = expanded ? ChevronDown : ChevronRight

  const sortableIds = mod.lessons.map((l) => makeSortableId(mod.id, l.id))

  return (
    <li role="treeitem" aria-expanded={expanded}>
      <div
        className="group flex items-center gap-1 px-2 py-1 mx-1 rounded-md hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
        onClick={onToggle}
        onContextMenu={(e) => onContextMenu(e, 'module', mod.id)}
        onKeyDown={(e) => { if (e.key === 'Enter') onToggle() }}
        tabIndex={0}
        role="button"
        aria-label={`Module: ${mod.title}`}
      >
        <Chevron size={14} className="shrink-0 text-[var(--text-tertiary)]" />
        <FolderOpen size={14} className="shrink-0 text-[var(--icon-default)]" />

        {isRenaming ? (
          <input
            ref={renameInputRef}
            value={renameValue}
            onChange={(e) => onRenameChange(e.target.value)}
            onBlur={onRenameCommit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onRenameCommit()
              if (e.key === 'Escape') { onRenameChange(mod.title); onRenameCommit() }
            }}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 text-xs bg-transparent border border-[var(--border-default)] rounded px-1 py-0.5 text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] min-w-0"
          />
        ) : (
          <span className="flex-1 text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)] truncate">
            {mod.title}
          </span>
        )}

        {/* UDL dot */}
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${UDL_DOT_COLORS[udlColor]}`}
          title={`UDL: ${udlColor}`}
          aria-label={`UDL status: ${udlColor}`}
        />

        {/* Add lesson button */}
        <button
          onClick={(e) => { e.stopPropagation(); onAddLesson() }}
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-0.5 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-opacity"
          aria-label="Add lesson to this module"
          title="Add lesson"
        >
          <Plus size={12} />
        </button>

        <button
          onClick={(e) => { e.stopPropagation(); onContextMenu(e as unknown as React.MouseEvent, 'module', mod.id) }}
          className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 p-0.5 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-opacity"
          aria-label="Module actions"
        >
          <MoreHorizontal size={12} />
        </button>
      </div>

      {/* Lessons */}
      {expanded && (
        <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
          {mod.lessons.length > 0 ? (
            <ul role="group" className="ml-4">
              {mod.lessons.map((lesson) => (
                <SortableLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  moduleId={mod.id}
                  isActive={activeLessonId === lesson.id}
                  isRenaming={renamingId === lesson.id}
                  renameValue={renameValue}
                  renameInputRef={renameInputRef}
                  onSelect={() => onSelectLesson(lesson.id)}
                  onContextMenu={(e) => onContextMenu(e, 'lesson', mod.id, lesson.id)}
                  onRenameChange={onRenameChange}
                  onRenameCommit={onRenameCommit}
                />
              ))}
            </ul>
          ) : (
            <EmptyModuleDropZone moduleId={mod.id} />
          )}
        </SortableContext>
      )}
    </li>
  )
}
