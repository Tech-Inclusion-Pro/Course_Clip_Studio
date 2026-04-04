import { useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { serializeCourse, findLesson } from '@/lib/course-helpers'
import { ROUTES } from '@/lib/constants'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { CourseTreePanel } from '@/components/editor/CourseTreePanel'
import { EditorCanvas } from '@/components/editor/EditorCanvas'
import { PropertiesPanel } from '@/components/editor/PropertiesPanel'
import { ThemeEditor } from '@/components/editor/ThemeEditor'
import { AIPanel } from '@/components/editor/AIPanel'
import { AccessibilityAuditPanel } from '@/components/editor/AccessibilityAuditPanel'
import { CertificateDesigner } from '@/components/editor/CertificateDesigner'
import { VersionHistoryPanel } from '@/components/editor/VersionHistoryPanel'
import { CollaboratorNotesPanel } from '@/components/editor/CollaboratorNotesPanel'
import { QuestionBankPanel } from '@/components/editor/QuestionBankPanel'
import { SplitPreviewPane } from '@/components/editor/SplitPreviewPane'
import { BranchingGraphView } from '@/components/editor/BranchingGraphView'
import { MediaLibraryPanel } from '@/components/media-library/MediaLibraryPanel'
import { AnalyticsPanel } from '@/components/editor/AnalyticsPanel'
import { useScrollSync } from '@/hooks/useScrollSync'

export function EditorView(): JSX.Element {
  const navigate = useNavigate()
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const leftPanelOpen = useEditorStore((s) => s.leftPanelOpen)
  const rightPanelOpen = useEditorStore((s) => s.rightPanelOpen)
  const themeEditorOpen = useEditorStore((s) => s.themeEditorOpen)
  const aiPanelOpen = useEditorStore((s) => s.aiPanelOpen)
  const auditPanelOpen = useEditorStore((s) => s.auditPanelOpen)
  const toggleThemeEditor = useEditorStore((s) => s.toggleThemeEditor)
  const toggleAIPanel = useEditorStore((s) => s.toggleAIPanel)
  const toggleAuditPanel = useEditorStore((s) => s.toggleAuditPanel)
  const certificateDesignerOpen = useEditorStore((s) => s.certificateDesignerOpen)
  const toggleCertificateDesigner = useEditorStore((s) => s.toggleCertificateDesigner)
  const versionHistoryOpen = useEditorStore((s) => s.versionHistoryOpen)
  const toggleVersionHistory = useEditorStore((s) => s.toggleVersionHistory)
  const notesPanelOpen = useEditorStore((s) => s.notesPanelOpen)
  const toggleNotesPanel = useEditorStore((s) => s.toggleNotesPanel)
  const questionBankOpen = useEditorStore((s) => s.questionBankOpen)
  const toggleQuestionBank = useEditorStore((s) => s.toggleQuestionBank)
  const mediaLibraryOpen = useEditorStore((s) => s.mediaLibraryOpen)
  const toggleMediaLibrary = useEditorStore((s) => s.toggleMediaLibrary)
  const analyticsOpen = useEditorStore((s) => s.analyticsOpen)
  const toggleAnalytics = useEditorStore((s) => s.toggleAnalytics)
  const splitPreviewOpen = useEditorStore((s) => s.splitPreviewOpen)
  const activeLessonId = useEditorStore((s) => s.activeLessonId)
  const branchingGraphOpen = useEditorStore((s) => s.branchingGraphOpen)
  const scrollSyncEnabled = useEditorStore((s) => s.scrollSyncEnabled)
  const editorScrollRef = useRef<HTMLDivElement>(null)
  const previewIframeRef = useRef<HTMLIFrameElement>(null)
  const pushSnapshot = useHistoryStore((s) => s.pushSnapshot)
  const shouldAutoSnapshot = useHistoryStore((s) => s.shouldAutoSnapshot)
  const markAutoSnapshot = useHistoryStore((s) => s.markAutoSnapshot)

  useScrollSync({
    editorRef: editorScrollRef,
    iframeRef: previewIframeRef,
    enabled: scrollSyncEnabled && splitPreviewOpen,
    activeLessonId
  })

  // Redirect to dashboard if no course is loaded
  useEffect(() => {
    if (!course) {
      navigate(ROUTES.DASHBOARD)
    }
  }, [course, navigate])

  // Auto-snapshot every 5 minutes
  useEffect(() => {
    if (!course) return
    const interval = setInterval(() => {
      if (shouldAutoSnapshot(5 * 60 * 1000)) {
        pushSnapshot(serializeCourse(course), 'Auto-save')
        markAutoSnapshot()
      }
    }, 30_000) // Check every 30s
    return () => clearInterval(interval)
  }, [course, pushSnapshot, shouldAutoSnapshot, markAutoSnapshot])

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const isMod = e.metaKey || e.ctrlKey

      // Undo: Cmd/Ctrl+Z
      if (isMod && e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        // Handled by toolbar store subscription
      }
      // Redo: Cmd/Ctrl+Shift+Z
      if (isMod && e.key === 'z' && e.shiftKey) {
        e.preventDefault()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Compute lesson data for split preview
  const splitPreviewData = useMemo(() => {
    if (!course || !activeLessonId || !splitPreviewOpen) return null
    const result = findLesson(course, activeLessonId)
    if (!result) return null
    const allLessons = course.modules.flatMap((m) => m.lessons)
    const lessonIndex = allLessons.findIndex((l) => l.id === activeLessonId)
    return {
      lesson: result.lesson,
      moduleTitle: result.module.title,
      lessonIndex,
      totalLessons: allLessons.length
    }
  }, [course, activeLessonId, splitPreviewOpen])

  if (!course) return <div />

  return (
    <div className="flex flex-col h-full -m-6 overflow-hidden">
      {/* Toolbar */}
      <EditorToolbar />

      {/* Main 3-panel layout */}
      <div className="flex flex-1 min-h-0">
        {/* Left Panel: Course Tree */}
        {leftPanelOpen && (
          <aside
            className="w-60 shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Course outline"
          >
            <CourseTreePanel />
          </aside>
        )}

        {/* Center: Canvas or Branching Graph */}
        {branchingGraphOpen ? (
          <BranchingGraphView />
        ) : (
          <div className="flex flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              <EditorCanvas scrollContainerRef={editorScrollRef} />
            </div>
            {splitPreviewOpen && splitPreviewData && (
              <div className="w-[40%] shrink-0">
                <SplitPreviewPane
                  course={course}
                  lesson={splitPreviewData.lesson}
                  moduleTitle={splitPreviewData.moduleTitle}
                  lessonIndex={splitPreviewData.lessonIndex}
                  totalLessons={splitPreviewData.totalLessons}
                  iframeExternalRef={previewIframeRef}
                />
              </div>
            )}
          </div>
        )}

        {/* Right Panel: Properties */}
        {rightPanelOpen && (
          <aside
            className="w-72 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Block properties"
          >
            <PropertiesPanel />
          </aside>
        )}

        {/* Theme Editor Panel */}
        {themeEditorOpen && (
          <aside
            className="w-80 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Theme editor"
          >
            <ThemeEditor onClose={toggleThemeEditor} />
          </aside>
        )}

        {/* Accessibility Audit Panel */}
        {auditPanelOpen && (
          <aside
            className="w-80 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Accessibility audit"
          >
            <AccessibilityAuditPanel onClose={toggleAuditPanel} />
          </aside>
        )}

        {/* Certificate Designer Panel */}
        {certificateDesignerOpen && (
          <aside
            className="w-80 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Certificate designer"
          >
            <CertificateDesigner onClose={toggleCertificateDesigner} />
          </aside>
        )}

        {/* AI Assistant Panel */}
        {aiPanelOpen && (
          <aside
            className="w-80 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="AI assistant"
          >
            <AIPanel onClose={toggleAIPanel} />
          </aside>
        )}

        {/* Version History Panel */}
        {versionHistoryOpen && (
          <aside
            className="w-80 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Version history"
          >
            <VersionHistoryPanel onClose={toggleVersionHistory} />
          </aside>
        )}

        {/* Collaborator Notes Panel */}
        {notesPanelOpen && (
          <aside
            className="w-80 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Collaborator notes"
          >
            <CollaboratorNotesPanel onClose={toggleNotesPanel} />
          </aside>
        )}

        {/* Question Bank Panel */}
        {questionBankOpen && (
          <aside
            className="w-80 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Question bank"
          >
            <QuestionBankPanel onClose={toggleQuestionBank} />
          </aside>
        )}

        {/* Analytics Panel */}
        {analyticsOpen && (
          <aside
            className="w-96 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Analytics"
          >
            <AnalyticsPanel onClose={toggleAnalytics} />
          </aside>
        )}

        {/* Media Library Panel */}
        {mediaLibraryOpen && (
          <aside
            className="w-96 shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto"
            aria-label="Media library"
          >
            <MediaLibraryPanel onClose={toggleMediaLibrary} />
          </aside>
        )}
      </div>

      {/* Status bar */}
      <div
        className="flex items-center justify-between h-6 px-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)] text-[10px] text-[var(--text-tertiary)] shrink-0"
        role="status"
      >
        <span>
          {course.modules.length} module{course.modules.length !== 1 ? 's' : ''}
          {' / '}
          {course.modules.reduce((s, m) => s + m.lessons.length, 0)} lesson{course.modules.reduce((s, m) => s + m.lessons.length, 0) !== 1 ? 's' : ''}
        </span>
        <span>v{course.meta.version}</span>
      </div>
    </div>
  )
}
