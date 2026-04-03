import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Eye,
  Upload,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone,
  SplitSquareHorizontal,
  Palette,
  ShieldCheck,
  Award,
  Image,
  Save,
  History,
  MessageSquare,
  LayoutGrid,
  GitBranch,
  Database,
  Columns,
  Grid3x3,
  Magnet,
  BookmarkPlus
} from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore, type PreviewDevice } from '@/stores/useEditorStore'
import { useT } from '@/hooks/useT'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { serializeCourse, deserializeCourse } from '@/lib/course-helpers'
import { ROUTES } from '@/lib/constants'
import { SaveAsTemplateDialog } from './SaveAsTemplateDialog'

const DEVICE_ICONS: Record<PreviewDevice, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone
}

const DEVICE_LABELS: Record<PreviewDevice, string> = {
  desktop: 'Desktop',
  tablet: 'Tablet',
  mobile: 'Mobile'
}

export function EditorToolbar(): JSX.Element {
  const navigate = useNavigate()
  const t = useT()

  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateCourseMeta = useCourseStore((s) => s.updateCourseMeta)
  const updateCourse = useCourseStore((s) => s.updateCourse)

  const leftPanelOpen = useEditorStore((s) => s.leftPanelOpen)
  const rightPanelOpen = useEditorStore((s) => s.rightPanelOpen)
  const aiPanelOpen = useEditorStore((s) => s.aiPanelOpen)
  const themeEditorOpen = useEditorStore((s) => s.themeEditorOpen)
  const auditPanelOpen = useEditorStore((s) => s.auditPanelOpen)
  const mediaLibraryOpen = useEditorStore((s) => s.mediaLibraryOpen)
  const toggleMediaLibrary = useEditorStore((s) => s.toggleMediaLibrary)
  const certificateDesignerOpen = useEditorStore((s) => s.certificateDesignerOpen)
  const splitPreviewOpen = useEditorStore((s) => s.splitPreviewOpen)
  const previewDevice = useEditorStore((s) => s.previewDevice)
  const toggleLeftPanel = useEditorStore((s) => s.toggleLeftPanel)
  const toggleRightPanel = useEditorStore((s) => s.toggleRightPanel)
  const toggleAIPanel = useEditorStore((s) => s.toggleAIPanel)
  const toggleThemeEditor = useEditorStore((s) => s.toggleThemeEditor)
  const toggleAuditPanel = useEditorStore((s) => s.toggleAuditPanel)
  const toggleCertificateDesigner = useEditorStore((s) => s.toggleCertificateDesigner)
  const versionHistoryOpen = useEditorStore((s) => s.versionHistoryOpen)
  const toggleVersionHistory = useEditorStore((s) => s.toggleVersionHistory)
  const notesPanelOpen = useEditorStore((s) => s.notesPanelOpen)
  const toggleNotesPanel = useEditorStore((s) => s.toggleNotesPanel)
  const toggleSplitPreview = useEditorStore((s) => s.toggleSplitPreview)
  const setPreviewDevice = useEditorStore((s) => s.setPreviewDevice)
  const canvasMode = useEditorStore((s) => s.canvasMode)
  const setCanvasMode = useEditorStore((s) => s.setCanvasMode)
  const branchingGraphOpen = useEditorStore((s) => s.branchingGraphOpen)
  const toggleBranchingGraph = useEditorStore((s) => s.toggleBranchingGraph)
  const questionBankOpen = useEditorStore((s) => s.questionBankOpen)
  const toggleQuestionBank = useEditorStore((s) => s.toggleQuestionBank)
  const showGrid = useEditorStore((s) => s.showGrid)
  const toggleGrid = useEditorStore((s) => s.toggleGrid)
  const showSmartGuides = useEditorStore((s) => s.showSmartGuides)
  const toggleSmartGuides = useEditorStore((s) => s.toggleSmartGuides)

  const canUndo = useHistoryStore((s) => s.canUndo())
  const canRedo = useHistoryStore((s) => s.canRedo())
  const pushSnapshot = useHistoryStore((s) => s.pushSnapshot)
  const undo = useHistoryStore((s) => s.undo)
  const redo = useHistoryStore((s) => s.redo)

  const [editingTitle, setEditingTitle] = useState(false)
  const [titleValue, setTitleValue] = useState('')
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false)
  const [saveFlash, setSaveFlash] = useState(false)

  function handleUndo() {
    if (!course) return
    // Save current state to redo stack
    pushSnapshot(serializeCourse(course))
    const snapshot = undo()
    if (snapshot && activeCourseId) {
      const restored = deserializeCourse(snapshot.courseJson)
      updateCourse(activeCourseId, restored)
    }
  }

  function handleRedo() {
    if (!course) return
    const snapshot = redo()
    if (snapshot && activeCourseId) {
      const restored = deserializeCourse(snapshot.courseJson)
      updateCourse(activeCourseId, restored)
    }
  }

  function startEditTitle() {
    if (course) {
      setTitleValue(course.meta.title)
      setEditingTitle(true)
    }
  }

  function commitTitle() {
    if (activeCourseId && titleValue.trim()) {
      updateCourseMeta(activeCourseId, { title: titleValue.trim() })
    }
    setEditingTitle(false)
  }

  function handleManualSave() {
    if (!course) return
    pushSnapshot(serializeCourse(course), 'Manual save')
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1200)
  }

  const DeviceIcon = DEVICE_ICONS[previewDevice]

  return (
    <div className="flex items-center justify-between h-10 px-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)] shrink-0">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="p-1.5 rounded-md cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label={t('toolbar.backToDashboard', 'Back to dashboard')}
          title={t('toolbar.backToDashboard', 'Back to dashboard')}
        >
          <ArrowLeft size={16} />
        </button>

        {editingTitle ? (
          <input
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => { if (e.key === 'Enter') commitTitle(); if (e.key === 'Escape') setEditingTitle(false) }}
            autoFocus
            className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] bg-transparent border-b border-[var(--border-default)] focus:border-[var(--brand-magenta)] focus:outline-none px-1 min-w-0"
          />
        ) : (
          <button
            onClick={startEditTitle}
            className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] truncate hover:text-[var(--brand-magenta)] transition-colors cursor-pointer"
            title={t('toolbar.clickToRename', 'Click to rename course')}
          >
            {course?.meta.title ?? t('toolbar.untitledCourse', 'Untitled Course')}
          </button>
        )}
      </div>

      {/* Center: Core actions */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={Undo2}
          label={t('toolbar.undo', 'Undo')}
          shortcut="Ctrl+Z"
          disabled={!canUndo}
          onClick={handleUndo}
        />
        <ToolbarButton
          icon={Redo2}
          label={t('toolbar.redo', 'Redo')}
          shortcut="Ctrl+Shift+Z"
          disabled={!canRedo}
          onClick={handleRedo}
        />

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" aria-hidden="true" />

        <ToolbarButton
          icon={SplitSquareHorizontal}
          label={t('toolbar.splitPreview', 'Split preview')}
          active={splitPreviewOpen}
          onClick={toggleSplitPreview}
        />

        {/* Device switcher */}
        <ToolbarButton
          icon={DeviceIcon}
          label={`${t('toolbar.preview', 'Preview')}: ${DEVICE_LABELS[previewDevice]}`}
          onClick={() => {
            const devices: PreviewDevice[] = ['desktop', 'tablet', 'mobile']
            const idx = devices.indexOf(previewDevice)
            setPreviewDevice(devices[(idx + 1) % devices.length])
          }}
        />

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" aria-hidden="true" />

        {/* Canvas mode toggle */}
        <ToolbarButton
          icon={canvasMode === 'block' ? LayoutGrid : Columns}
          label={canvasMode === 'block' ? t('toolbar.switchToSlide', 'Switch to Slide view') : t('toolbar.switchToBlock', 'Switch to Block view')}
          active={canvasMode === 'slide'}
          onClick={() => setCanvasMode(canvasMode === 'block' ? 'slide' : 'block')}
        />
        <ToolbarButton
          icon={Grid3x3}
          label={t('toolbar.toggleGrid', 'Toggle Grid')}
          active={showGrid}
          onClick={toggleGrid}
        />
        <ToolbarButton
          icon={Magnet}
          label={t('toolbar.smartGuides', 'Smart Guides')}
          active={showSmartGuides}
          onClick={toggleSmartGuides}
        />

        {/* Branching graph toggle */}
        <ToolbarButton
          icon={GitBranch}
          label={t('toolbar.branchingGraph', 'Branching Graph')}
          active={branchingGraphOpen}
          onClick={toggleBranchingGraph}
        />

        {/* Question bank toggle */}
        <ToolbarButton
          icon={Database}
          label={t('toolbar.questionBank', 'Question Bank')}
          active={questionBankOpen}
          onClick={toggleQuestionBank}
        />

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" aria-hidden="true" />

        <ToolbarButton
          icon={Eye}
          label={t('toolbar.preview', 'Preview')}
          onClick={() => navigate(ROUTES.PREVIEW)}
        />
        <ToolbarButton
          icon={Upload}
          label={t('toolbar.publish', 'Publish')}
          onClick={() => navigate(ROUTES.PUBLISH)}
        />
        <ToolbarButton
          icon={BookmarkPlus}
          label={t('toolbar.saveAsTemplate', 'Save as Template')}
          onClick={() => setSaveTemplateOpen(true)}
        />
      </div>

      {/* Right: Panel toggles */}
      <div className="flex items-center gap-1">
        <ToolbarButton
          icon={Image}
          label={t('toolbar.mediaLibrary', 'Media Library')}
          active={mediaLibraryOpen}
          onClick={toggleMediaLibrary}
        />
        <ToolbarButton
          icon={Palette}
          label={t('toolbar.themeEditor', 'Theme Editor')}
          active={themeEditorOpen}
          onClick={toggleThemeEditor}
        />
        <ToolbarButton
          icon={Award}
          label={t('toolbar.certificateDesigner', 'Certificate Designer')}
          active={certificateDesignerOpen}
          onClick={toggleCertificateDesigner}
        />
        <ToolbarButton
          icon={ShieldCheck}
          label={t('toolbar.accessibilityAudit', 'Accessibility Audit')}
          active={auditPanelOpen}
          onClick={toggleAuditPanel}
        />
        <ToolbarButton
          icon={Sparkles}
          label={t('toolbar.aiAssistant', 'AI Assistant')}
          active={aiPanelOpen}
          onClick={toggleAIPanel}
        />

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" aria-hidden="true" />

        <ToolbarButton
          icon={Save}
          label={saveFlash ? t('toolbar.saved', 'Saved!') : t('toolbar.save', 'Save')}
          onClick={handleManualSave}
        />
        <ToolbarButton
          icon={History}
          label={t('toolbar.versionHistory', 'Version History')}
          active={versionHistoryOpen}
          onClick={toggleVersionHistory}
        />
        <ToolbarButton
          icon={MessageSquare}
          label={t('toolbar.notes', 'Notes')}
          active={notesPanelOpen}
          onClick={toggleNotesPanel}
        />

        <div className="w-px h-5 bg-[var(--border-default)] mx-1" aria-hidden="true" />

        <ToolbarButton
          icon={leftPanelOpen ? PanelLeftClose : PanelLeftOpen}
          label={leftPanelOpen ? t('toolbar.hideOutline', 'Hide outline') : t('toolbar.showOutline', 'Show outline')}
          onClick={toggleLeftPanel}
        />
        <ToolbarButton
          icon={rightPanelOpen ? PanelRightClose : PanelRightOpen}
          label={rightPanelOpen ? t('toolbar.hideProperties', 'Hide properties') : t('toolbar.showProperties', 'Show properties')}
          onClick={toggleRightPanel}
        />
      </div>

      {course && (
        <SaveAsTemplateDialog
          course={course}
          open={saveTemplateOpen}
          onClose={() => setSaveTemplateOpen(false)}
        />
      )}
    </div>
  )
}

// ─── Toolbar Button ───

function ToolbarButton({
  icon: Icon,
  label,
  shortcut,
  active,
  disabled,
  onClick
}: {
  icon: typeof Undo2
  label: string
  shortcut?: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        p-1.5 rounded-md cursor-pointer
        transition-colors duration-[var(--duration-fast)]
        disabled:opacity-30 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]
        ${active
          ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
        }
      `}
      aria-label={label}
      title={shortcut ? `${label} (${shortcut})` : label}
    >
      <Icon size={16} />
    </button>
  )
}
