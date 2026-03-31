import { useState, useEffect, useRef, useCallback } from 'react'
import {
  X,
  FileText,
  Presentation,
  Archive,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ChevronDown,
  ChevronRight,
  FileCode2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourseStore } from '@/stores/useCourseStore'
import { createCourse, createModule, createLesson } from '@/lib/mock-data'
import { parseMarkdown, parsePptx, parseScormPackage } from '@/lib/import'
import { loadLuminaFile } from '@/lib/lumina-format'
import type { ImportResult, ImportProgress, ParsedModule } from '@/lib/import'
import type { Course } from '@/types/course'

interface ImportDialogProps {
  open: boolean
  onClose: () => void
}

type Step = 'select' | 'parsing' | 'preview' | 'error'

export function ImportDialog({ open, onClose }: ImportDialogProps): JSX.Element | null {
  const [step, setStep] = useState<Step>('select')
  const [progress, setProgress] = useState<ImportProgress | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [courseTitle, setCourseTitle] = useState('')
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set())

  const addCourse = useCourseStore((s) => s.addCourse)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Reset on open
  useEffect(() => {
    if (open) {
      setStep('select')
      setProgress(null)
      setResult(null)
      setError(null)
      setCourseTitle('')
      setExpandedModules(new Set())
    }
  }, [open])

  // Handle Escape
  useEffect(() => {
    if (!open) return
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const handleProgressUpdate = useCallback((p: ImportProgress) => {
    setProgress(p)
  }, [])

  async function handleFileSelect(format: 'markdown' | 'pptx' | 'scorm' | 'lumina') {
    try {
      const filters =
        format === 'markdown'
          ? [{ name: 'Markdown', extensions: ['md', 'markdown'] }]
          : format === 'pptx'
            ? [{ name: 'PowerPoint', extensions: ['pptx'] }]
            : format === 'lumina'
              ? [{ name: 'Lumina Course', extensions: ['lumina', 'zip', 'json'] }]
              : [{ name: 'SCORM Package', extensions: ['zip'] }]

      const formatLabel = format === 'markdown' ? 'Markdown' : format === 'pptx' ? 'PowerPoint' : format === 'lumina' ? 'Lumina' : 'SCORM'

      const dialogResult = await window.electronAPI.dialog.openFile({
        title: `Import ${formatLabel} File`,
        filters,
        properties: ['openFile']
      })

      if (dialogResult.canceled || dialogResult.filePaths.length === 0) return

      const filePath = dialogResult.filePaths[0]
      const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || 'Untitled'

      setStep('parsing')
      setError(null)

      // Lumina files contain a complete course — import directly
      if (format === 'lumina') {
        const buffer = await window.electronAPI.fs.readFileBuffer(filePath)
        const { course } = await loadLuminaFile(buffer)
        addCourse(course)
        onClose()
        return
      }

      let importResult: ImportResult

      if (format === 'markdown') {
        const content = await window.electronAPI.fs.readFile(filePath)
        importResult = await parseMarkdown(content, fileName, handleProgressUpdate)
      } else if (format === 'scorm') {
        const buffer = await window.electronAPI.fs.readFileBuffer(filePath)
        importResult = await parseScormPackage(buffer)
      } else {
        const buffer = await window.electronAPI.fs.readFileBuffer(filePath)
        importResult = await parsePptx(buffer, fileName, handleProgressUpdate)
      }

      setResult(importResult)
      setCourseTitle(importResult.suggestedTitle)
      setExpandedModules(new Set(importResult.modules.map((_, i) => i)))
      setStep('preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      setStep('error')
    }
  }

  function handleImportConfirm() {
    if (!result) return

    // Build the course from the import result
    const modules = result.modules.map((pm) =>
      createModule({
        title: pm.title,
        description: pm.description,
        lessons: pm.lessons.map((pl) =>
          createLesson({
            title: pl.title,
            blocks: pl.blocks
          })
        )
      })
    )

    const course: Course = createCourse({
      meta: {
        title: courseTitle.trim() || result.suggestedTitle,
        description: `Imported from ${result.format === 'markdown' ? 'Markdown' : result.format === 'scorm' ? 'SCORM' : result.format === 'lumina' ? 'Lumina' : 'PowerPoint'} file`,
        author: 'Course Author',
        language: 'en',
        estimatedDuration: 0,
        tags: ['imported'],
        thumbnail: null,
        version: '1.0.0'
      },
      modules
    })

    addCourse(course)
    onClose()
  }

  function toggleModule(index: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev)
      if (next.has(index)) next.delete(index)
      else next.add(index)
      return next
    })
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Import course"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4 p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-xl)]"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Close dialog"
        >
          <X size={18} />
        </button>

        {/* Step: File Selection */}
        {step === 'select' && (
          <>
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-1">
              Import Course
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6">
              Import content from a Markdown, PowerPoint, or SCORM file to create a new course.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ImportFormatCard
                icon={FileText}
                title="Markdown"
                description="Import .md files. Headings become modules and lessons, paragraphs become text blocks."
                extensions=".md, .markdown"
                onClick={() => handleFileSelect('markdown')}
              />
              <ImportFormatCard
                icon={Presentation}
                title="PowerPoint"
                description="Import .pptx files. Each slide becomes a lesson with extracted text and images."
                extensions=".pptx"
                onClick={() => handleFileSelect('pptx')}
              />
              <ImportFormatCard
                icon={Archive}
                title="SCORM"
                description="Import SCORM .zip packages. Organization structure maps to modules and lessons."
                extensions=".zip"
                onClick={() => handleFileSelect('scorm')}
              />
              <ImportFormatCard
                icon={FileCode2}
                title="Lumina"
                description="Import .lumina course packages with all content, settings, and media included."
                extensions=".lumina"
                onClick={() => handleFileSelect('lumina')}
              />
            </div>
          </>
        )}

        {/* Step: Parsing */}
        {step === 'parsing' && (
          <div className="flex flex-col items-center py-12 text-center">
            <Loader2 size={40} className="text-[var(--brand-magenta)] animate-spin mb-4" />
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-2">
              Importing...
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              {progress?.message || 'Processing file...'}
            </p>
            {progress && (
              <div className="w-64 h-2 bg-[var(--bg-muted)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--brand-magenta)] rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            )}
          </div>
        )}

        {/* Step: Error */}
        {step === 'error' && (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mb-4">
              <AlertTriangle size={32} className="text-[var(--color-danger-600)]" />
            </div>
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-2">
              Import Failed
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-md">
              {error || 'An unexpected error occurred while importing the file.'}
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="primary" size="md" onClick={() => setStep('select')}>
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Step: Preview */}
        {step === 'preview' && result && (
          <>
            <h2 className="text-lg font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-1">
              Review Import
            </h2>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Review the imported structure before creating the course.
            </p>

            {/* Course title */}
            <div className="mb-4">
              <label
                htmlFor="import-title"
                className="block text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] mb-1"
              >
                Course Title
              </label>
              <input
                id="import-title"
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                placeholder="Enter course title..."
              />
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 mb-4 p-3 rounded-lg bg-[var(--bg-muted)]">
              <div className="flex items-center gap-1.5">
                <FileCode2 size={14} className="text-[var(--text-tertiary)]" />
                <span className="text-xs text-[var(--text-secondary)]">
                  {result.format === 'markdown' ? 'Markdown' : result.format === 'scorm' ? 'SCORM' : 'PowerPoint'}
                </span>
              </div>
              <span className="text-xs text-[var(--text-tertiary)]">|</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {result.modules.length} module{result.modules.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">|</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {result.totalLessons} lesson{result.totalLessons !== 1 ? 's' : ''}
              </span>
              <span className="text-xs text-[var(--text-tertiary)]">|</span>
              <span className="text-xs text-[var(--text-secondary)]">
                {result.totalBlocks} block{result.totalBlocks !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-900/50">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400" />
                  <span className="text-xs font-[var(--font-weight-semibold)] text-yellow-800 dark:text-yellow-300">
                    {result.warnings.length} warning{result.warnings.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <ul className="space-y-0.5">
                  {result.warnings.slice(0, 5).map((w, i) => (
                    <li key={i} className="text-xs text-yellow-700 dark:text-yellow-400">
                      {w}
                    </li>
                  ))}
                  {result.warnings.length > 5 && (
                    <li className="text-xs text-yellow-600 dark:text-yellow-500">
                      +{result.warnings.length - 5} more warnings
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Module/Lesson tree preview */}
            <div className="mb-5 max-h-[280px] overflow-y-auto rounded-lg border border-[var(--border-default)]">
              {result.modules.map((mod, modIdx) => (
                <ModulePreview
                  key={modIdx}
                  module={mod}
                  index={modIdx}
                  expanded={expandedModules.has(modIdx)}
                  onToggle={() => toggleModule(modIdx)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="md" onClick={() => setStep('select')}>
                Back
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" onClick={handleImportConfirm}>
                  <CheckCircle2 size={16} />
                  Import Course
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───

function ImportFormatCard({
  icon: Icon,
  title,
  description,
  extensions,
  onClick
}: {
  icon: typeof FileText
  title: string
  description: string
  extensions: string
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-6 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] hover:border-[var(--brand-magenta)] transition-all cursor-pointer text-center group focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
      aria-label={`Import from ${title}`}
    >
      <div className="w-12 h-12 rounded-xl bg-[var(--bg-muted)] group-hover:bg-[var(--brand-magenta)]/10 flex items-center justify-center transition-colors">
        <Icon size={24} className="text-[var(--text-tertiary)] group-hover:text-[var(--brand-magenta)] transition-colors" />
      </div>
      <div>
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          {title}
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-2">{description}</p>
        <span className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
          {extensions}
        </span>
      </div>
    </button>
  )
}

function ModulePreview({
  module,
  index,
  expanded,
  onToggle
}: {
  module: ParsedModule
  index: number
  expanded: boolean
  onToggle: () => void
}): JSX.Element {
  return (
    <div className={index > 0 ? 'border-t border-[var(--border-default)]' : ''}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left"
        aria-expanded={expanded}
      >
        {expanded ? (
          <ChevronDown size={14} className="text-[var(--text-tertiary)] shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-[var(--text-tertiary)] shrink-0" />
        )}
        <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] flex-1 truncate">
          {module.title}
        </span>
        <span className="text-[10px] text-[var(--text-tertiary)]">
          {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
        </span>
      </button>
      {expanded && (
        <div className="pb-1">
          {module.lessons.map((lesson, lIdx) => (
            <div
              key={lIdx}
              className="flex items-center gap-2 px-3 py-1 pl-8"
            >
              <FileText size={12} className="text-[var(--text-tertiary)] shrink-0" />
              <span className="text-xs text-[var(--text-secondary)] truncate flex-1">
                {lesson.title}
              </span>
              <span className="text-[10px] text-[var(--text-tertiary)]">
                {lesson.blocks.length} block{lesson.blocks.length !== 1 ? 's' : ''}
              </span>
            </div>
          ))}
          {module.lessons.length === 0 && (
            <p className="text-xs text-[var(--text-tertiary)] italic px-3 pl-8 py-1">
              No lessons
            </p>
          )}
        </div>
      )}
    </div>
  )
}
