import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Package,
  FileDown,
  Loader2,
  X
} from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { ROUTES } from '@/lib/constants'
import { findMissingAltText, findMissingTranscripts, countLessons } from '@/lib/course-helpers'
import { buildScormPackage, downloadBlob, type PackageProgress } from '@/lib/scorm'
import { buildScorm2004Package } from '@/lib/scorm'
import { buildXapiPackage } from '@/lib/xapi'
import { buildHtmlPackage, buildPdf, type PdfOptions } from '@/lib/export'
import { LmsUploadWizard } from '@/components/publish/LmsUploadWizard'
import type { Course, ExportFormat, XAPIConfig } from '@/types/course'

type WizardStep = 'preflight' | 'format' | 'settings' | 'build'

export function PublishView(): JSX.Element {
  const navigate = useNavigate()
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <Upload size={32} className="text-[var(--text-tertiary)] mb-4" />
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
          Publish Course
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-md mb-4">
          Open a course first to configure export options.
        </p>
        <button
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className="px-4 py-2 text-sm text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  return <PublishWizard course={course} />
}

// ─── Wizard ───

function PublishWizard({ course }: { course: Course }): JSX.Element {
  const navigate = useNavigate()
  const [step, setStep] = useState<WizardStep>('preflight')
  const [format, setFormat] = useState<ExportFormat>('scorm-1.2')
  const [acknowledged, setAcknowledged] = useState(false)

  // SCORM settings
  const [masteryScore, setMasteryScore] = useState(
    course.settings.scorm?.masteryScore ?? 70
  )
  const [completionCriteria, setCompletionCriteria] = useState<'launch' | 'complete' | 'passed'>(
    course.settings.scorm?.completionCriteria ?? 'complete'
  )

  // xAPI settings
  const [xapiEndpoint, setXapiEndpoint] = useState(course.settings.xapi?.endpoint ?? '')
  const [xapiUsername, setXapiUsername] = useState(course.settings.xapi?.username ?? '')
  const [xapiPassword, setXapiPassword] = useState(course.settings.xapi?.password ?? '')
  const [xapiActorName, setXapiActorName] = useState(course.settings.xapi?.actorName ?? '')
  const [xapiActorEmail, setXapiActorEmail] = useState(course.settings.xapi?.actorEmail ?? '')

  // PDF settings
  const [pdfPageSize, setPdfPageSize] = useState<'A4' | 'Letter'>('A4')
  const [pdfIncludeAnswers, setPdfIncludeAnswers] = useState(false)
  const [pdfIncludeUdl, setPdfIncludeUdl] = useState(false)

  // Build state
  const [building, setBuilding] = useState(false)
  const [progress, setProgress] = useState<PackageProgress | null>(null)
  const [buildError, setBuildError] = useState<string | null>(null)
  const [buildComplete, setBuildComplete] = useState(false)
  const [builtBlob, setBuiltBlob] = useState<Blob | null>(null)
  const [showLmsWizard, setShowLmsWizard] = useState(false)

  // Pre-flight checks
  const missingAlt = findMissingAltText(course)
  const missingTranscripts = findMissingTranscripts(course)
  const hasBlockingIssues = missingAlt.length > 0 || missingTranscripts.length > 0
  const lessonCount = countLessons(course)

  const handleBuild = useCallback(async () => {
    setBuilding(true)
    setBuildError(null)
    setBuildComplete(false)

    try {
      const safeName = course.meta.title.replace(/[^a-zA-Z0-9]/g, '_')
      setBuiltBlob(null)

      if (format === 'scorm-1.2') {
        const blob = await buildScormPackage(course, setProgress)
        downloadBlob(blob, `${safeName}_SCORM12.zip`)
        setBuiltBlob(blob)
      } else if (format === 'scorm-2004') {
        const blob = await buildScorm2004Package(course, setProgress)
        downloadBlob(blob, `${safeName}_SCORM2004.zip`)
        setBuiltBlob(blob)
      } else if (format === 'xapi') {
        const xapiConfig: XAPIConfig = {
          endpoint: xapiEndpoint,
          authType: 'basic',
          username: xapiUsername,
          password: xapiPassword,
          actorName: xapiActorName || course.meta.author,
          actorEmail: xapiActorEmail || 'learner@example.com'
        }
        const blob = await buildXapiPackage(course, xapiConfig, setProgress)
        downloadBlob(blob, `${safeName}_xAPI.zip`)
      } else if (format === 'html5') {
        const blob = await buildHtmlPackage(course, setProgress)
        downloadBlob(blob, `${safeName}_HTML.zip`)
      } else if (format === 'pdf') {
        const pdfOptions: PdfOptions = {
          pageSize: pdfPageSize,
          includeQuizAnswers: pdfIncludeAnswers,
          includeUdlNotes: pdfIncludeUdl
        }
        const blob = await buildPdf(course, pdfOptions, setProgress)
        const ext = blob.type === 'application/pdf' ? 'pdf' : 'html'
        downloadBlob(blob, `${safeName}.${ext}`)
      }

      setBuildComplete(true)
    } catch (err) {
      setBuildError(err instanceof Error ? err.message : 'Build failed')
    } finally {
      setBuilding(false)
    }
  }, [course, format, xapiEndpoint, xapiUsername, xapiPassword, xapiActorName, xapiActorEmail, pdfPageSize, pdfIncludeAnswers, pdfIncludeUdl])

  const steps: WizardStep[] = ['preflight', 'format', 'settings', 'build']
  const stepIndex = steps.indexOf(step)

  function canAdvance(): boolean {
    if (step === 'preflight') return acknowledged || !hasBlockingIssues
    if (step === 'format') return true
    if (step === 'settings') return true
    return false
  }

  function nextStep() {
    if (stepIndex < steps.length - 1) setStep(steps[stepIndex + 1])
  }

  function prevStep() {
    if (stepIndex > 0) setStep(steps[stepIndex - 1])
  }

  return (
    <div className="flex flex-col h-full -m-6">
      {/* Header */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-[var(--border-default)] bg-[var(--bg-surface)] shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(ROUTES.EDITOR)}
            className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            aria-label="Back to editor"
          >
            <ArrowLeft size={16} />
          </button>
          <h1 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Publish: {course.meta.title}
          </h1>
        </div>
        <button
          onClick={() => navigate(ROUTES.EDITOR)}
          className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-[var(--border-default)] bg-[var(--bg-primary)] shrink-0">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className="flex items-center gap-1.5 flex-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  i < stepIndex
                    ? 'bg-green-500 text-white'
                    : i === stepIndex
                      ? 'bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] text-white'
                      : 'bg-[var(--bg-panel)] text-[var(--text-tertiary)]'
                }`}
              >
                {i < stepIndex ? <CheckCircle2 size={14} /> : i + 1}
              </div>
              <span className={`text-[10px] ${i === stepIndex ? 'text-[var(--text-primary)] font-[var(--font-weight-semibold)]' : 'text-[var(--text-tertiary)]'}`}>
                {s === 'preflight' ? 'Pre-flight' : s === 'format' ? 'Format' : s === 'settings' ? 'Settings' : 'Build'}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i < stepIndex ? 'bg-green-500' : 'bg-[var(--border-default)]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto p-6">
          {step === 'preflight' && (
            <PreflightStep
              course={course}
              missingAlt={missingAlt}
              missingTranscripts={missingTranscripts}
              acknowledged={acknowledged}
              onAcknowledge={setAcknowledged}
            />
          )}
          {step === 'format' && (
            <FormatStep format={format} onFormatChange={setFormat} />
          )}
          {step === 'settings' && (
            <SettingsStep
              format={format}
              masteryScore={masteryScore}
              completionCriteria={completionCriteria}
              onMasteryChange={setMasteryScore}
              onCompletionChange={setCompletionCriteria}
              lessonCount={lessonCount}
              xapiEndpoint={xapiEndpoint}
              xapiUsername={xapiUsername}
              xapiPassword={xapiPassword}
              xapiActorName={xapiActorName}
              xapiActorEmail={xapiActorEmail}
              onXapiEndpointChange={setXapiEndpoint}
              onXapiUsernameChange={setXapiUsername}
              onXapiPasswordChange={setXapiPassword}
              onXapiActorNameChange={setXapiActorName}
              onXapiActorEmailChange={setXapiActorEmail}
              pdfPageSize={pdfPageSize}
              pdfIncludeAnswers={pdfIncludeAnswers}
              pdfIncludeUdl={pdfIncludeUdl}
              onPdfPageSizeChange={setPdfPageSize}
              onPdfIncludeAnswersChange={setPdfIncludeAnswers}
              onPdfIncludeUdlChange={setPdfIncludeUdl}
            />
          )}
          {step === 'build' && (
            <BuildStep
              building={building}
              progress={progress}
              buildError={buildError}
              buildComplete={buildComplete}
              onBuild={handleBuild}
              courseName={course.meta.title}
              format={format}
              canUploadToLms={!!builtBlob && (format === 'scorm-1.2' || format === 'scorm-2004')}
              onUploadToLms={() => setShowLmsWizard(true)}
            />
          )}
        </div>
      </div>

      {/* Footer navigation */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-[var(--border-default)] bg-[var(--bg-surface)] shrink-0">
        <button
          onClick={prevStep}
          disabled={stepIndex === 0}
          className="flex items-center gap-1 px-4 py-2 text-xs text-[var(--text-secondary)] rounded-md hover:bg-[var(--bg-hover)] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft size={12} />
          Back
        </button>

        {step !== 'build' ? (
          <button
            onClick={nextStep}
            disabled={!canAdvance()}
            className="flex items-center gap-1 px-5 py-2 text-xs text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
            <ArrowRight size={12} />
          </button>
        ) : (
          <span />
        )}
      </div>

      {/* LMS Upload Wizard Modal */}
      {showLmsWizard && builtBlob && (
        <LmsUploadWizard
          packageBlob={builtBlob}
          fileName={`${course.meta.title.replace(/[^a-zA-Z0-9]/g, '_')}${FORMAT_EXTENSIONS[format]}`}
          onClose={() => setShowLmsWizard(false)}
        />
      )}
    </div>
  )
}

// ─── Pre-flight Step ───

function PreflightStep({
  course,
  missingAlt,
  missingTranscripts,
  acknowledged,
  onAcknowledge
}: {
  course: Course
  missingAlt: Array<{ block: { id: string; type: string; ariaLabel: string }; lessonTitle: string }>
  missingTranscripts: Array<{ block: { id: string; type: string; ariaLabel: string }; lessonTitle: string }>
  acknowledged: boolean
  onAcknowledge: (v: boolean) => void
}): JSX.Element {
  const hasIssues = missingAlt.length > 0 || missingTranscripts.length > 0

  // Warnings (non-blocking)
  const moduleCount = course.modules.length
  const lessonCount = countLessons(course)
  const hasQuizWithoutThreshold = course.modules.some((m) =>
    m.lessons.some((l) =>
      l.blocks.some((b) => b.type === 'quiz' && b.passThreshold === 0)
    )
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Pre-flight Checklist
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Review your course before export. Blocking issues must be resolved or acknowledged.
        </p>
      </div>

      {/* Course summary */}
      <div className="flex gap-4 p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-default)]">
        <Stat label="Modules" value={moduleCount} />
        <Stat label="Lessons" value={lessonCount} />
        <Stat label="Duration" value={`${course.meta.estimatedDuration}m`} />
        <Stat label="Version" value={course.meta.version} />
      </div>

      {/* Blocking issues */}
      {missingAlt.length > 0 && (
        <IssueGroup
          severity="error"
          title={`${missingAlt.length} image${missingAlt.length > 1 ? 's' : ''} missing alt text`}
          items={missingAlt.map((i) => `${i.block.ariaLabel} in "${i.lessonTitle}"`)}
        />
      )}

      {missingTranscripts.length > 0 && (
        <IssueGroup
          severity="error"
          title={`${missingTranscripts.length} media block${missingTranscripts.length > 1 ? 's' : ''} missing transcript`}
          items={missingTranscripts.map((i) => `${i.block.type} in "${i.lessonTitle}"`)}
        />
      )}

      {/* Warnings */}
      {hasQuizWithoutThreshold && (
        <IssueGroup
          severity="warning"
          title="Quiz without pass threshold"
          items={['One or more quizzes have a 0% pass threshold.']}
        />
      )}

      {/* No issues */}
      {!hasIssues && !hasQuizWithoutThreshold && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
          <CheckCircle2 size={20} className="text-green-500 shrink-0" />
          <div>
            <div className="text-sm font-[var(--font-weight-semibold)] text-green-600">All checks passed</div>
            <div className="text-xs text-green-600/70">Your course is ready to export.</div>
          </div>
        </div>
      )}

      {/* Acknowledge checkbox */}
      {hasIssues && (
        <label className="flex items-start gap-2 p-3 rounded-lg border border-[var(--border-default)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => onAcknowledge(e.target.checked)}
            className="mt-0.5 accent-[var(--brand-magenta)] cursor-pointer"
          />
          <div>
            <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              I acknowledge these issues and want to proceed anyway
            </span>
            <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
              Missing alt text and transcripts may cause WCAG compliance failures.
            </p>
          </div>
        </label>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }): JSX.Element {
  return (
    <div className="text-center">
      <div className="text-sm font-bold text-[var(--text-primary)]">{value}</div>
      <div className="text-[10px] text-[var(--text-tertiary)]">{label}</div>
    </div>
  )
}

function IssueGroup({
  severity,
  title,
  items
}: {
  severity: 'error' | 'warning'
  title: string
  items: string[]
}): JSX.Element {
  const isError = severity === 'error'
  return (
    <div className={`p-3 rounded-lg border ${isError ? 'bg-red-500/5 border-red-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
      <div className="flex items-center gap-2 mb-2">
        {isError ? (
          <AlertCircle size={14} className="text-red-500 shrink-0" />
        ) : (
          <AlertTriangle size={14} className="text-yellow-600 shrink-0" />
        )}
        <span className={`text-xs font-[var(--font-weight-semibold)] ${isError ? 'text-red-600' : 'text-yellow-700'}`}>
          {title}
        </span>
      </div>
      <ul className="space-y-0.5 ml-6">
        {items.map((item, i) => (
          <li key={i} className={`text-[10px] ${isError ? 'text-red-500/80' : 'text-yellow-600/80'}`}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── Format Step ───

const FORMAT_OPTIONS: Array<{
  id: ExportFormat
  label: string
  description: string
}> = [
  { id: 'scorm-1.2', label: 'SCORM 1.2', description: 'Most widely supported LMS format' },
  { id: 'scorm-2004', label: 'SCORM 2004', description: 'Advanced sequencing and navigation' },
  { id: 'xapi', label: 'xAPI / Tin Can', description: 'Modern learning analytics standard' },
  { id: 'html5', label: 'Standalone HTML', description: 'Self-contained, no LMS required' },
  { id: 'pdf', label: 'PDF Document', description: 'Printable course document' }
]

function FormatStep({
  format,
  onFormatChange
}: {
  format: ExportFormat
  onFormatChange: (f: ExportFormat) => void
}): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Export Format
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Choose how you want to package your course.
        </p>
      </div>

      <div className="grid gap-3">
        {FORMAT_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => onFormatChange(opt.id)}
            className={`flex items-center gap-3 p-4 rounded-lg border text-left transition-colors cursor-pointer ${
              format === opt.id
                ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5'
                : 'border-[var(--border-default)] hover:border-[var(--brand-magenta)]/50'
            }`}
            role="radio"
            aria-checked={format === opt.id}
          >
            <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
              format === opt.id ? 'border-[var(--brand-magenta)]' : 'border-[var(--border-default)]'
            }`}>
              {format === opt.id && <div className="w-2 h-2 rounded-full bg-[var(--brand-magenta)]" />}
            </div>
            <div className="flex-1">
              <span className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {opt.label}
              </span>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">{opt.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Settings Step ───

function SettingsStep({
  format,
  masteryScore,
  completionCriteria,
  onMasteryChange,
  onCompletionChange,
  lessonCount,
  xapiEndpoint,
  xapiUsername,
  xapiPassword,
  xapiActorName,
  xapiActorEmail,
  onXapiEndpointChange,
  onXapiUsernameChange,
  onXapiPasswordChange,
  onXapiActorNameChange,
  onXapiActorEmailChange,
  pdfPageSize,
  pdfIncludeAnswers,
  pdfIncludeUdl,
  onPdfPageSizeChange,
  onPdfIncludeAnswersChange,
  onPdfIncludeUdlChange
}: {
  format: ExportFormat
  masteryScore: number
  completionCriteria: 'launch' | 'complete' | 'passed'
  onMasteryChange: (v: number) => void
  onCompletionChange: (v: 'launch' | 'complete' | 'passed') => void
  lessonCount: number
  xapiEndpoint: string
  xapiUsername: string
  xapiPassword: string
  xapiActorName: string
  xapiActorEmail: string
  onXapiEndpointChange: (v: string) => void
  onXapiUsernameChange: (v: string) => void
  onXapiPasswordChange: (v: string) => void
  onXapiActorNameChange: (v: string) => void
  onXapiActorEmailChange: (v: string) => void
  pdfPageSize: 'A4' | 'Letter'
  pdfIncludeAnswers: boolean
  pdfIncludeUdl: boolean
  onPdfPageSizeChange: (v: 'A4' | 'Letter') => void
  onPdfIncludeAnswersChange: (v: boolean) => void
  onPdfIncludeUdlChange: (v: boolean) => void
}): JSX.Element {
  if (format === 'scorm-1.2' || format === 'scorm-2004') {
    return (
      <ScormSettings
        format={format}
        masteryScore={masteryScore}
        completionCriteria={completionCriteria}
        onMasteryChange={onMasteryChange}
        onCompletionChange={onCompletionChange}
        lessonCount={lessonCount}
      />
    )
  }

  if (format === 'xapi') {
    return (
      <XapiSettings
        endpoint={xapiEndpoint}
        username={xapiUsername}
        password={xapiPassword}
        actorName={xapiActorName}
        actorEmail={xapiActorEmail}
        onEndpointChange={onXapiEndpointChange}
        onUsernameChange={onXapiUsernameChange}
        onPasswordChange={onXapiPasswordChange}
        onActorNameChange={onXapiActorNameChange}
        onActorEmailChange={onXapiActorEmailChange}
        lessonCount={lessonCount}
      />
    )
  }

  if (format === 'pdf') {
    return (
      <PdfSettings
        pageSize={pdfPageSize}
        includeAnswers={pdfIncludeAnswers}
        includeUdl={pdfIncludeUdl}
        onPageSizeChange={onPdfPageSizeChange}
        onIncludeAnswersChange={onPdfIncludeAnswersChange}
        onIncludeUdlChange={onPdfIncludeUdlChange}
      />
    )
  }

  // HTML5 — minimal settings
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Standalone HTML Settings
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Your course will be packaged as a self-contained website.
        </p>
      </div>

      <div className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 mb-2">
          <Package size={14} className="text-[var(--brand-indigo)]" />
          <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Package Summary
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
          <div>Format: <strong>Standalone HTML</strong></div>
          <div>Pages: <strong>{lessonCount}</strong> (one per lesson)</div>
          <div>Server required: <strong>No</strong></div>
          <div>Progress tracking: <strong>localStorage</strong></div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <AlertCircle size={14} className="shrink-0" />
          <span>Open <strong>index.html</strong> in any modern browser to view the course. No internet connection or server required.</span>
        </div>
      </div>
    </div>
  )
}

function ScormSettings({
  format,
  masteryScore,
  completionCriteria,
  onMasteryChange,
  onCompletionChange,
  lessonCount
}: {
  format: ExportFormat
  masteryScore: number
  completionCriteria: 'launch' | 'complete' | 'passed'
  onMasteryChange: (v: number) => void
  onCompletionChange: (v: 'launch' | 'complete' | 'passed') => void
  lessonCount: number
}): JSX.Element {
  const label = format === 'scorm-2004' ? 'SCORM 2004' : 'SCORM 1.2'

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          {label} Settings
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Configure how the LMS tracks completion and scoring.
        </p>
      </div>

      {/* Package info */}
      <div className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 mb-2">
          <Package size={14} className="text-[var(--brand-indigo)]" />
          <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Package Summary
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
          <div>Format: <strong>{label}</strong></div>
          <div>SCOs: <strong>{lessonCount}</strong> (one per lesson)</div>
          <div>Version: <strong>{format}</strong></div>
          <div>Lesson mode: <strong>Normal</strong></div>
        </div>
      </div>

      {/* Completion criteria */}
      <div className="space-y-2">
        <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
          Completion Criteria
        </label>
        <div className="space-y-1.5">
          {[
            { value: 'launch' as const, label: 'On Launch', desc: 'Mark complete when learner opens the lesson' },
            { value: 'complete' as const, label: 'On Complete', desc: 'Mark complete when learner reaches the end' },
            { value: 'passed' as const, label: 'On Passed', desc: 'Mark complete only when quiz is passed' }
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex items-start gap-2.5 p-2.5 rounded-md border cursor-pointer transition-colors ${
                completionCriteria === opt.value
                  ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5'
                  : 'border-[var(--border-default)] hover:border-[var(--brand-magenta)]/50'
              }`}
            >
              <input
                type="radio"
                name="completion"
                value={opt.value}
                checked={completionCriteria === opt.value}
                onChange={() => onCompletionChange(opt.value)}
                className="mt-0.5 accent-[var(--brand-magenta)] cursor-pointer"
              />
              <div>
                <div className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">{opt.label}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">{opt.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Mastery score */}
      <div className="space-y-2">
        <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
          Mastery Score
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={100}
            value={masteryScore}
            onChange={(e) => onMasteryChange(parseInt(e.target.value))}
            className="flex-1 accent-[var(--brand-magenta)]"
            aria-label="Mastery score percentage"
          />
          <span className="text-sm font-bold text-[var(--text-primary)] w-12 text-right">
            {masteryScore}%
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-tertiary)]">
          {format === 'scorm-2004'
            ? 'The minimum normalized measure (cmi.score.scaled) required to pass.'
            : 'The minimum quiz score required to pass. Sent to the LMS as cmi.core.score mastery.'}
        </p>
      </div>
    </div>
  )
}

function XapiSettings({
  endpoint,
  username,
  password,
  actorName,
  actorEmail,
  onEndpointChange,
  onUsernameChange,
  onPasswordChange,
  onActorNameChange,
  onActorEmailChange,
  lessonCount
}: {
  endpoint: string
  username: string
  password: string
  actorName: string
  actorEmail: string
  onEndpointChange: (v: string) => void
  onUsernameChange: (v: string) => void
  onPasswordChange: (v: string) => void
  onActorNameChange: (v: string) => void
  onActorEmailChange: (v: string) => void
  lessonCount: number
}): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          xAPI / Tin Can Settings
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Configure the Learning Record Store (LRS) endpoint for xAPI statements.
        </p>
      </div>

      <div className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 mb-2">
          <Package size={14} className="text-[var(--brand-indigo)]" />
          <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Package Summary
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs text-[var(--text-secondary)]">
          <div>Format: <strong>xAPI / Tin Can</strong></div>
          <div>Pages: <strong>{lessonCount}</strong></div>
          <div>Includes: <strong>tincan.xml</strong></div>
          <div>Statements: <strong>launched, completed, passed/failed, answered</strong></div>
        </div>
      </div>

      {/* LRS Endpoint */}
      <div className="space-y-1.5">
        <label htmlFor="xapi-endpoint" className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
          LRS Endpoint URL
        </label>
        <input
          id="xapi-endpoint"
          type="url"
          value={endpoint}
          onChange={(e) => onEndpointChange(e.target.value)}
          placeholder="https://lrs.example.com/xapi"
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      </div>

      {/* Auth credentials */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="xapi-user" className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
            Username / Key
          </label>
          <input
            id="xapi-user"
            type="text"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="xapi-pass" className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
            Password / Secret
          </label>
          <input
            id="xapi-pass"
            type="password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
      </div>

      {/* Actor info */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label htmlFor="xapi-actor-name" className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
            Default Actor Name
          </label>
          <input
            id="xapi-actor-name"
            type="text"
            value={actorName}
            onChange={(e) => onActorNameChange(e.target.value)}
            placeholder="Learner"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="xapi-actor-email" className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
            Default Actor Email
          </label>
          <input
            id="xapi-actor-email"
            type="email"
            value={actorEmail}
            onChange={(e) => onActorEmailChange(e.target.value)}
            placeholder="learner@example.com"
            className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>
      </div>

      <p className="text-[10px] text-[var(--text-tertiary)]">
        These credentials are embedded in the exported package. In production, the LMS typically provides actor info via launch parameters.
      </p>
    </div>
  )
}

function PdfSettings({
  pageSize,
  includeAnswers,
  includeUdl,
  onPageSizeChange,
  onIncludeAnswersChange,
  onIncludeUdlChange
}: {
  pageSize: 'A4' | 'Letter'
  includeAnswers: boolean
  includeUdl: boolean
  onPageSizeChange: (v: 'A4' | 'Letter') => void
  onIncludeAnswersChange: (v: boolean) => void
  onIncludeUdlChange: (v: boolean) => void
}): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          PDF Settings
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Configure page layout and content options for the PDF export.
        </p>
      </div>

      {/* Page size */}
      <div className="space-y-2">
        <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
          Page Size
        </label>
        <div className="flex gap-2">
          {(['A4', 'Letter'] as const).map((size) => (
            <label
              key={size}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md border cursor-pointer transition-colors ${
                pageSize === size
                  ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5'
                  : 'border-[var(--border-default)] hover:border-[var(--brand-magenta)]/50'
              }`}
            >
              <input
                type="radio"
                name="pdf-page-size"
                value={size}
                checked={pageSize === size}
                onChange={() => onPageSizeChange(size)}
                className="accent-[var(--brand-magenta)] cursor-pointer"
              />
              <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                {size} {size === 'A4' ? '(210 × 297mm)' : '(8.5 × 11in)'}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Content options */}
      <div className="space-y-2">
        <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
          Content Options
        </label>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 p-2.5 rounded-md border border-[var(--border-default)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
            <input
              type="checkbox"
              checked={includeAnswers}
              onChange={(e) => onIncludeAnswersChange(e.target.checked)}
              className="accent-[var(--brand-magenta)] cursor-pointer"
            />
            <div>
              <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                Include quiz answers
              </span>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                Show correct answers marked with a checkmark
              </p>
            </div>
          </label>
          <label className="flex items-center gap-2 p-2.5 rounded-md border border-[var(--border-default)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
            <input
              type="checkbox"
              checked={includeUdl}
              onChange={(e) => onIncludeUdlChange(e.target.checked)}
              className="accent-[var(--brand-magenta)] cursor-pointer"
            />
            <div>
              <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                Include UDL notes
              </span>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                Append UDL checklist data and accessibility notes
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
        <div className="flex items-center gap-2 text-xs text-blue-700">
          <AlertCircle size={14} className="shrink-0" />
          <span>Video and audio blocks will show as placeholders with transcripts included.</span>
        </div>
      </div>
    </div>
  )
}

// ─── Build Step ───

const FORMAT_LABELS: Record<ExportFormat, string> = {
  'scorm-1.2': 'SCORM 1.2',
  'scorm-2004': 'SCORM 2004',
  'xapi': 'xAPI',
  'html5': 'Standalone HTML',
  'pdf': 'PDF'
}

const FORMAT_EXTENSIONS: Record<ExportFormat, string> = {
  'scorm-1.2': '_SCORM12.zip',
  'scorm-2004': '_SCORM2004.zip',
  'xapi': '_xAPI.zip',
  'html5': '_HTML.zip',
  'pdf': '.pdf'
}

function BuildStep({
  building,
  progress,
  buildError,
  buildComplete,
  onBuild,
  courseName,
  format,
  canUploadToLms,
  onUploadToLms
}: {
  building: boolean
  progress: PackageProgress | null
  buildError: string | null
  buildComplete: boolean
  onBuild: () => void
  courseName: string
  format: ExportFormat
  canUploadToLms?: boolean
  onUploadToLms?: () => void
}): JSX.Element {
  const safeName = courseName.replace(/[^a-zA-Z0-9]/g, '_')
  const fileName = `${safeName}${FORMAT_EXTENSIONS[format]}`
  const formatLabel = FORMAT_LABELS[format]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Build & Download
        </h2>
        <p className="text-sm text-[var(--text-secondary)]">
          Generate your {formatLabel} package and download it.
        </p>
      </div>

      {/* Output info */}
      <div className="p-3 rounded-lg bg-[var(--bg-panel)] border border-[var(--border-default)]">
        <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
          <FileDown size={14} className="text-[var(--brand-indigo)]" />
          <span>Output: <strong className="text-[var(--text-primary)]">{fileName}</strong></span>
        </div>
      </div>

      {/* Build button */}
      {!building && !buildComplete && !buildError && (
        <button
          onClick={onBuild}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 text-sm text-white rounded-lg bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer font-[var(--font-weight-semibold)]"
        >
          <Package size={16} />
          Build {formatLabel} Package
        </button>
      )}

      {/* Building progress */}
      {building && progress && (
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-[var(--brand-magenta)]" />
            <span className="text-sm text-[var(--text-primary)]">{progress.step}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--bg-panel)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] transition-all duration-300"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)] text-center">
            Step {progress.current} of {progress.total}
          </p>
        </div>
      )}

      {/* Build error */}
      {buildError && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle size={16} className="text-red-500 shrink-0" />
            <div>
              <div className="text-xs font-[var(--font-weight-semibold)] text-red-600">Build Failed</div>
              <p className="text-[10px] text-red-500/80 mt-0.5">{buildError}</p>
            </div>
          </div>
          <button
            onClick={onBuild}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-xs text-[var(--text-primary)] rounded-md border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          >
            Retry Build
          </button>
        </div>
      )}

      {/* Build success */}
      {buildComplete && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20">
            <CheckCircle2 size={24} className="text-green-500 shrink-0" />
            <div>
              <div className="text-sm font-[var(--font-weight-semibold)] text-green-600">
                Package Built Successfully
              </div>
              <p className="text-xs text-green-600/70 mt-0.5">
                Your {formatLabel} package has been downloaded as {fileName}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onBuild}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs text-[var(--text-primary)] rounded-md border border-[var(--border-default)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
            >
              <FileDown size={14} />
              Download Again
            </button>
            {canUploadToLms && onUploadToLms && (
              <button
                onClick={onUploadToLms}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer font-[var(--font-weight-medium)]"
              >
                <Upload size={14} />
                Upload to LMS
              </button>
            )}
          </div>

          {(format === 'scorm-1.2' || format === 'scorm-2004') && !canUploadToLms && (
            <p className="text-[10px] text-[var(--text-tertiary)] text-center">
              Upload the ZIP file to your LMS (Moodle, Canvas, Blackboard, etc.) to deploy.
            </p>
          )}
          {canUploadToLms && (
            <p className="text-[10px] text-[var(--text-tertiary)] text-center">
              Click "Upload to LMS" to directly upload to Canvas, Moodle, or Blackboard, or upload the ZIP manually.
            </p>
          )}
          {format === 'xapi' && (
            <p className="text-[10px] text-[var(--text-tertiary)] text-center">
              Upload to an xAPI-compatible LMS or host on any web server. Includes tincan.xml for LRS integration.
            </p>
          )}
          {format === 'html5' && (
            <p className="text-[10px] text-[var(--text-tertiary)] text-center">
              Extract the ZIP and open index.html in any browser. No server or LMS required.
            </p>
          )}
          {format === 'pdf' && (
            <p className="text-[10px] text-[var(--text-tertiary)] text-center">
              Share the PDF as a printable course document.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
