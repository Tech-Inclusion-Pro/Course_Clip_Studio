import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { serializeCourse } from '@/lib/course-helpers'
import { ROUTES } from '@/lib/constants'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { CourseTreePanel } from '@/components/editor/CourseTreePanel'
import { EditorCanvas } from '@/components/editor/EditorCanvas'
import { PropertiesPanel } from '@/components/editor/PropertiesPanel'
import { ThemeEditor } from '@/components/editor/ThemeEditor'
import { AIPanel } from '@/components/editor/AIPanel'
import { AccessibilityAuditPanel } from '@/components/editor/AccessibilityAuditPanel'
import { CertificateDesigner } from '@/components/editor/CertificateDesigner'

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
  const pushSnapshot = useHistoryStore((s) => s.pushSnapshot)
  const shouldAutoSnapshot = useHistoryStore((s) => s.shouldAutoSnapshot)
  const markAutoSnapshot = useHistoryStore((s) => s.markAutoSnapshot)

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

  if (!course) return <div />

  return (
    <div className="flex flex-col h-full -m-6">
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

        {/* Center: Canvas */}
        <EditorCanvas />

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
