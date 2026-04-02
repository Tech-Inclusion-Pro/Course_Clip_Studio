// ─── Tippy Context Gatherer ───
// Snapshots current app state for AI context injection

import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useDashboardStore } from '@/stores/useDashboardStore'
import { useAIStore } from '@/stores/useAIStore'
import { useLocaleStore } from '@/stores/useLocaleStore'

export interface TippyContext {
  currentView: string
  activeCourse: { id: string; title: string; moduleCount: number; lessonCount: number } | null
  activeModule: { id: string; title: string } | null
  activeLesson: { id: string; title: string; blockCount: number } | null
  selectedBlock: { id: string; type: string } | null
  editorState: {
    canvasMode: string
    splitPreview: boolean
    panelsOpen: string[]
  } | null
  dashboardState: {
    section: string
    courseCount: number
    searchActive: boolean
  } | null
  aiConfigured: boolean
  language: string
  accessibility: { highContrast: boolean; reducedMotion: boolean; fontSize: number }
  recentErrors: string[]
}

export function getAppContext(): TippyContext {
  const app = useAppStore.getState()
  const courses = useCourseStore.getState()
  const editor = useEditorStore.getState()
  const dashboard = useDashboardStore.getState()
  const ai = useAIStore.getState()
  const locale = useLocaleStore.getState()

  // Detect current view from URL
  const path = window.location.hash.replace('#', '') || '/'
  let currentView = 'dashboard'
  if (path.startsWith('/editor')) currentView = 'editor'
  else if (path.startsWith('/preview')) currentView = 'preview'
  else if (path.startsWith('/settings')) currentView = 'settings'
  else if (path.startsWith('/publish')) currentView = 'publish'

  // Active course
  const course = courses.activeCourseId
    ? courses.courses.find((c) => c.id === courses.activeCourseId) ?? null
    : null

  let activeCourse: TippyContext['activeCourse'] = null
  if (course) {
    const lessonCount = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
    activeCourse = {
      id: course.id,
      title: course.meta.title,
      moduleCount: course.modules.length,
      lessonCount
    }
  }

  // Active module
  let activeModule: TippyContext['activeModule'] = null
  if (course && editor.activeModuleId) {
    const mod = course.modules.find((m) => m.id === editor.activeModuleId)
    if (mod) activeModule = { id: mod.id, title: mod.title }
  }

  // Active lesson
  let activeLesson: TippyContext['activeLesson'] = null
  if (course && editor.activeModuleId && editor.activeLessonId) {
    const mod = course.modules.find((m) => m.id === editor.activeModuleId)
    const lesson = mod?.lessons.find((l) => l.id === editor.activeLessonId)
    if (lesson) {
      activeLesson = { id: lesson.id, title: lesson.title, blockCount: lesson.blocks.length }
    }
  }

  // Selected block
  let selectedBlock: TippyContext['selectedBlock'] = null
  if (course && editor.selectedBlockId && editor.activeModuleId && editor.activeLessonId) {
    const mod = course.modules.find((m) => m.id === editor.activeModuleId)
    const lesson = mod?.lessons.find((l) => l.id === editor.activeLessonId)
    const block = lesson?.blocks.find((b) => b.id === editor.selectedBlockId)
    if (block) selectedBlock = { id: block.id, type: block.type }
  }

  // Editor state
  let editorState: TippyContext['editorState'] = null
  if (currentView === 'editor') {
    const panelsOpen: string[] = []
    if (editor.leftPanelOpen) panelsOpen.push('outline')
    if (editor.rightPanelOpen) panelsOpen.push('properties')
    if (editor.aiPanelOpen) panelsOpen.push('ai')
    if (editor.themeEditorOpen) panelsOpen.push('themeEditor')
    if (editor.auditPanelOpen) panelsOpen.push('audit')
    if (editor.notesPanelOpen) panelsOpen.push('notes')
    editorState = {
      canvasMode: editor.canvasMode,
      splitPreview: editor.splitPreviewOpen,
      panelsOpen
    }
  }

  // Dashboard state
  let dashboardState: TippyContext['dashboardState'] = null
  if (currentView === 'dashboard') {
    dashboardState = {
      section: dashboard.activeSection,
      courseCount: courses.courses.length,
      searchActive: dashboard.searchQuery.length > 0
    }
  }

  // Recent errors
  const recentErrors: string[] = []
  if (ai.lastError) recentErrors.push(ai.lastError)
  if (locale.error) recentErrors.push(locale.error)

  return {
    currentView,
    activeCourse,
    activeModule,
    activeLesson,
    selectedBlock,
    editorState,
    dashboardState,
    aiConfigured: !!app.ai.provider,
    language: locale.activeLanguage,
    accessibility: {
      highContrast: app.accessibility.highContrastMode,
      reducedMotion: app.accessibility.reducedMotion,
      fontSize: app.accessibility.baseFontSize
    },
    recentErrors
  }
}
