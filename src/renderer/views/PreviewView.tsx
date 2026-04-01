import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Tablet,
  Smartphone,
  PanelLeftClose,
  PanelLeftOpen,
  Eye,
  Accessibility,
  CheckCircle2,
  Trophy,
  StickyNote
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCourseStore } from '@/stores/useCourseStore'
import { usePreviewStore } from '@/stores/usePreviewStore'
import { renderPreviewHtml } from '@/lib/preview/render-preview-html'
import { LearnerNotesSidebar } from '@/components/preview/LearnerNotesSidebar'
import { uid } from '@/lib/uid'
import { ROUTES } from '@/lib/constants'
import type { Course, Lesson } from '@/types/course'

type DeviceMode = 'desktop' | 'tablet' | 'mobile'

const DEVICE_WIDTHS: Record<DeviceMode, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px'
}

const A11Y_CSS = `
  body { font-size: 20px !important; line-height: 1.8 !important; }
  * { letter-spacing: 0.02em !important; }
  .player-header, .player-footer { font-size: 16px !important; }
  .nav-btn, .quiz-submit, .flip-btn, button { font-size: 16px !important; min-height: 44px !important; }
  img { outline: 2px solid #000 !important; }
`

interface FlatLesson {
  lesson: Lesson
  moduleTitle: string
  moduleIdx: number
  lessonIdx: number
  globalIdx: number
}

function flattenLessons(course: Course): FlatLesson[] {
  const flat: FlatLesson[] = []
  course.modules.forEach((mod, mi) => {
    mod.lessons.forEach((lesson, li) => {
      flat.push({
        lesson,
        moduleTitle: mod.title,
        moduleIdx: mi,
        lessonIdx: li,
        globalIdx: flat.length
      })
    })
  })
  return flat
}

export function PreviewView(): JSX.Element {
  const navigate = useNavigate()
  const course = useCourseStore((s) => s.getActiveCourse())

  const [currentIdx, setCurrentIdx] = useState(0)
  const [visitedLessons, setVisitedLessons] = useState<Set<string>>(new Set())
  const [quizScores, setQuizScores] = useState<Record<string, { score: number; passed: boolean }>>({})
  const [outlineOpen, setOutlineOpen] = useState(true)
  const [notesSidebarOpen, setNotesSidebarOpen] = useState(false)
  const [device, setDevice] = useState<DeviceMode>('desktop')
  const [a11yMode, setA11yMode] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const addNote = usePreviewStore((s) => s.addNote)
  const addBookmark = usePreviewStore((s) => s.addBookmark)

  const flatLessons = useMemo(() => (course ? flattenLessons(course) : []), [course])
  const totalLessons = flatLessons.length
  const current = flatLessons[currentIdx]

  // Mark lesson as visited
  useEffect(() => {
    if (current) {
      setVisitedLessons((prev) => {
        if (prev.has(current.lesson.id)) return prev
        const next = new Set(prev)
        next.add(current.lesson.id)
        return next
      })
    }
  }, [current])

  // Listen for postMessage from iframe
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      const data = event.data
      if (!data || typeof data !== 'object') return

      if (data.type === 'lumina:nav') {
        if (data.direction === 'next' && currentIdx < totalLessons - 1) {
          setCurrentIdx((i) => i + 1)
        } else if (data.direction === 'prev' && currentIdx > 0) {
          setCurrentIdx((i) => i - 1)
        } else if (data.direction === 'finish') {
          // Stay on last lesson, could show completion message
        }
      } else if (data.type === 'lumina:quiz-score' && current) {
        setQuizScores((prev) => ({
          ...prev,
          [current.lesson.id]: { score: data.score, passed: data.passed }
        }))
      } else if (data.type === 'lumina:bookmark' && current) {
        addBookmark({
          id: uid('bookmark'),
          lessonId: current.lesson.id,
          title: current.lesson.title,
          timestamp: new Date().toISOString()
        })
        if (!notesSidebarOpen) setNotesSidebarOpen(true)
      } else if (data.type === 'lumina:note' && current) {
        addNote({
          id: uid('note'),
          lessonId: current.lesson.id,
          blockId: data.blockId,
          content: data.content || '',
          timestamp: new Date().toISOString()
        })
        if (!notesSidebarOpen) setNotesSidebarOpen(true)
      }
    },
    [currentIdx, totalLessons, current, addBookmark, addNote, notesSidebarOpen]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Generate HTML for current lesson
  const lessonHtml = useMemo(() => {
    if (!course || !current) return ''
    return renderPreviewHtml(
      course,
      current.lesson,
      current.moduleTitle,
      current.globalIdx,
      totalLessons,
      a11yMode ? A11Y_CSS : undefined
    )
  }, [course, current, totalLessons, a11yMode])

  // No course selected
  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="w-16 h-16 mb-4 rounded-[var(--radius-xl)] bg-[var(--bg-muted)] flex items-center justify-center">
          <Eye size={32} className="text-[var(--text-tertiary)]" />
        </div>
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
          Course Preview
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md">
          Open a course in the editor first, then switch to Preview.
        </p>
      </div>
    )
  }

  // No lessons
  if (totalLessons === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Eye size={32} className="text-[var(--text-tertiary)] mb-4" />
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
          No Lessons
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Add lessons to your course to preview them.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Top Bar */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-[var(--border-default)] bg-[var(--bg-surface)] shrink-0">
        <button
          onClick={() => navigate(ROUTES.EDITOR)}
          className="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
          aria-label="Back to editor"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="h-4 w-px bg-[var(--border-default)]" />

        <span className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] truncate flex-1">
          {course.meta.title}
        </span>

        <span className="text-xs text-[var(--text-tertiary)]">
          {currentIdx + 1} / {totalLessons} lessons
        </span>

        <div className="h-4 w-px bg-[var(--border-default)]" />

        {/* Device toggles */}
        <div className="flex items-center gap-0.5">
          {([
            { mode: 'desktop' as DeviceMode, icon: Monitor, label: 'Desktop' },
            { mode: 'tablet' as DeviceMode, icon: Tablet, label: 'Tablet' },
            { mode: 'mobile' as DeviceMode, icon: Smartphone, label: 'Mobile' }
          ]).map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setDevice(mode)}
              aria-pressed={device === mode}
              aria-label={label}
              className={`p-1.5 rounded cursor-pointer transition-colors ${
                device === mode
                  ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-[var(--border-default)]" />

        {/* A11y toggle */}
        <button
          onClick={() => setA11yMode(!a11yMode)}
          aria-pressed={a11yMode}
          aria-label="Toggle accessibility mode"
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            a11yMode
              ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <Accessibility size={16} />
        </button>

        {/* Notes sidebar toggle */}
        <button
          onClick={() => setNotesSidebarOpen(!notesSidebarOpen)}
          aria-label={notesSidebarOpen ? 'Close notes' : 'Open notes'}
          aria-pressed={notesSidebarOpen}
          className={`p-1.5 rounded cursor-pointer transition-colors ${
            notesSidebarOpen
              ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
          }`}
        >
          <StickyNote size={16} />
        </button>

        {/* Outline toggle */}
        <button
          onClick={() => setOutlineOpen(!outlineOpen)}
          aria-label={outlineOpen ? 'Close outline' : 'Open outline'}
          className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          {outlineOpen ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
        </button>
      </div>

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Outline sidebar */}
        {outlineOpen && (
          <aside className="w-64 shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto p-3">
            <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider mb-3">
              Course Outline
            </h3>
            {course.modules.map((mod, mi) => (
              <div key={mod.id} className="mb-3">
                <p className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] mb-1 px-1">
                  {mi + 1}. {mod.title}
                </p>
                <ul className="space-y-0.5">
                  {mod.lessons.map((lesson) => {
                    const flat = flatLessons.find((f) => f.lesson.id === lesson.id)
                    if (!flat) return null
                    const isCurrent = flat.globalIdx === currentIdx
                    const visited = visitedLessons.has(lesson.id)
                    const quiz = quizScores[lesson.id]

                    return (
                      <li key={lesson.id}>
                        <button
                          onClick={() => setCurrentIdx(flat.globalIdx)}
                          className={`
                            w-full text-left px-2 py-1.5 rounded text-xs cursor-pointer transition-colors flex items-center gap-1.5
                            ${isCurrent
                              ? 'bg-[var(--bg-active)] text-[var(--text-brand)] font-[var(--font-weight-medium)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            }
                          `}
                        >
                          <span className="flex-1 truncate">{lesson.title}</span>
                          {quiz && (
                            <span
                              className={`shrink-0 text-[10px] font-[var(--font-weight-medium)] px-1 py-0.5 rounded ${
                                quiz.passed
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {quiz.score}%
                            </span>
                          )}
                          {!quiz && visited && (
                            <CheckCircle2 size={12} className="shrink-0 text-emerald-500" />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))}

            {/* Progress summary */}
            <div className="mt-4 pt-3 border-t border-[var(--border-default)]">
              <p className="text-[10px] text-[var(--text-tertiary)]">
                {visitedLessons.size} / {totalLessons} visited
              </p>
              <div className="mt-1 h-1.5 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${Math.round((visitedLessons.size / totalLessons) * 100)}%` }}
                />
              </div>
            </div>
          </aside>
        )}

        {/* iframe container */}
        <div className="flex-1 flex items-start justify-center overflow-auto bg-[var(--bg-muted)] p-4">
          <div
            className="bg-white rounded-lg shadow-lg overflow-hidden transition-all"
            style={{ width: DEVICE_WIDTHS[device], maxWidth: '100%', height: '100%' }}
          >
            <iframe
              ref={iframeRef}
              srcDoc={lessonHtml}
              title={`Preview: ${current.lesson.title}`}
              className="w-full h-full border-0"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>

        {/* Learner Notes Sidebar */}
        {notesSidebarOpen && current && (
          <LearnerNotesSidebar
            currentLessonId={current.lesson.id}
            currentLessonTitle={current.lesson.title}
            onNavigateToLesson={(lessonId) => {
              const target = flatLessons.find((f) => f.lesson.id === lessonId)
              if (target) setCurrentIdx(target.globalIdx)
            }}
            onClose={() => setNotesSidebarOpen(false)}
          />
        )}
      </div>

      {/* Bottom nav bar */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-[var(--border-default)] bg-[var(--bg-surface)] shrink-0">
        <button
          onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
          disabled={currentIdx === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={14} />
          Previous
        </button>

        <span className="text-xs text-[var(--text-tertiary)]">
          {current.moduleTitle} &mdash; {current.lesson.title}
        </span>

        {currentIdx < totalLessons - 1 ? (
          <button
            onClick={() => setCurrentIdx((i) => i + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md bg-[var(--brand-magenta)] text-white hover:opacity-90 cursor-pointer"
          >
            Next
            <ChevronRight size={14} />
          </button>
        ) : (
          <span className="flex items-center gap-1 text-xs text-emerald-600 font-[var(--font-weight-medium)]">
            <Trophy size={14} />
            Course Complete
          </span>
        )}
      </div>
    </div>
  )
}
