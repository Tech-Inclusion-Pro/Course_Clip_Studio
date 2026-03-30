import { useState, useCallback } from 'react'
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  TestTube,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  BookOpen,
  X
} from 'lucide-react'
import {
  LMS_PROVIDERS,
  canvasTestConnection,
  canvasListCourses,
  canvasUploadScorm,
  moodleTestConnection,
  moodleListCourses,
  moodleUploadScorm,
  blackboardTestConnection,
  blackboardListCourses,
  blackboardUploadScorm
} from '@/lib/lms'
import type { LmsProvider, LmsCourse, LmsConnectionResult, LmsUploadResult } from '@/lib/lms'

type WizardStep = 'select-lms' | 'credentials' | 'select-course' | 'uploading' | 'result'

interface LmsUploadWizardProps {
  packageBlob: Blob
  fileName: string
  onClose: () => void
}

export function LmsUploadWizard({ packageBlob, fileName, onClose }: LmsUploadWizardProps): JSX.Element {
  const [step, setStep] = useState<WizardStep>('select-lms')
  const [provider, setProvider] = useState<LmsProvider | null>(null)
  const [baseUrl, setBaseUrl] = useState('')
  const [apiToken, setApiToken] = useState('')
  const [connectionResult, setConnectionResult] = useState<LmsConnectionResult | null>(null)
  const [testing, setTesting] = useState(false)
  const [courses, setCourses] = useState<LmsCourse[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [courseSearchQuery, setCourseSearchQuery] = useState('')
  const [uploadResult, setUploadResult] = useState<LmsUploadResult | null>(null)
  const [uploading, setUploading] = useState(false)

  const providerInfo = provider ? LMS_PROVIDERS.find((p) => p.id === provider) : null

  const handleTestConnection = useCallback(async () => {
    if (!provider || !baseUrl || !apiToken) return
    setTesting(true)
    setConnectionResult(null)

    let result: LmsConnectionResult
    switch (provider) {
      case 'canvas':
        result = await canvasTestConnection(baseUrl, apiToken)
        break
      case 'moodle':
        result = await moodleTestConnection(baseUrl, apiToken)
        break
      case 'blackboard':
        result = await blackboardTestConnection(baseUrl, apiToken)
        break
    }

    setConnectionResult(result)
    setTesting(false)
  }, [provider, baseUrl, apiToken])

  const handleLoadCourses = useCallback(async () => {
    if (!provider || !baseUrl || !apiToken) return
    setLoadingCourses(true)
    setCourses([])

    try {
      let courseList: LmsCourse[]
      switch (provider) {
        case 'canvas':
          courseList = await canvasListCourses(baseUrl, apiToken)
          break
        case 'moodle':
          courseList = await moodleListCourses(baseUrl, apiToken)
          break
        case 'blackboard':
          courseList = await blackboardListCourses(baseUrl, apiToken)
          break
      }
      setCourses(courseList)
      setStep('select-course')
    } catch (err) {
      setConnectionResult({
        connected: false,
        error: `Failed to load courses: ${err instanceof Error ? err.message : 'Unknown error'}`
      })
    } finally {
      setLoadingCourses(false)
    }
  }, [provider, baseUrl, apiToken])

  const handleUpload = useCallback(async () => {
    if (!provider || !baseUrl || !apiToken || !selectedCourseId) return
    setUploading(true)
    setStep('uploading')

    let result: LmsUploadResult
    switch (provider) {
      case 'canvas':
        result = await canvasUploadScorm(baseUrl, apiToken, selectedCourseId, packageBlob, fileName)
        break
      case 'moodle':
        result = await moodleUploadScorm(baseUrl, apiToken, selectedCourseId, packageBlob, fileName)
        break
      case 'blackboard':
        result = await blackboardUploadScorm(baseUrl, apiToken, selectedCourseId, packageBlob, fileName)
        break
    }

    setUploadResult(result)
    setUploading(false)
    setStep('result')
  }, [provider, baseUrl, apiToken, selectedCourseId, packageBlob, fileName])

  const filteredCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(courseSearchQuery.toLowerCase())
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="relative w-full max-w-lg max-h-[80vh] flex flex-col bg-[var(--bg-surface)] rounded-xl shadow-xl border border-[var(--border-default)] overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Upload to LMS"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-default)] shrink-0">
          <div className="flex items-center gap-2">
            <Upload size={16} className="text-[var(--brand-magenta)]" />
            <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              Upload to LMS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {step === 'select-lms' && (
            <SelectLmsStep
              provider={provider}
              onSelect={(p) => {
                setProvider(p)
                setBaseUrl('')
                setApiToken('')
                setConnectionResult(null)
                setStep('credentials')
              }}
            />
          )}

          {step === 'credentials' && providerInfo && (
            <CredentialsStep
              providerInfo={providerInfo}
              baseUrl={baseUrl}
              apiToken={apiToken}
              onBaseUrlChange={setBaseUrl}
              onApiTokenChange={setApiToken}
              connectionResult={connectionResult}
              testing={testing}
              loadingCourses={loadingCourses}
              onTest={handleTestConnection}
              onConnect={handleLoadCourses}
              onBack={() => {
                setStep('select-lms')
                setConnectionResult(null)
              }}
            />
          )}

          {step === 'select-course' && (
            <SelectCourseStep
              courses={filteredCourses}
              selectedCourseId={selectedCourseId}
              searchQuery={courseSearchQuery}
              onSearchChange={setCourseSearchQuery}
              onSelect={setSelectedCourseId}
              onUpload={handleUpload}
              fileName={fileName}
              providerLabel={providerInfo?.label ?? ''}
              onBack={() => setStep('credentials')}
            />
          )}

          {step === 'uploading' && (
            <UploadingStep fileName={fileName} providerLabel={providerInfo?.label ?? ''} />
          )}

          {step === 'result' && uploadResult && (
            <ResultStep
              result={uploadResult}
              providerLabel={providerInfo?.label ?? ''}
              fileName={fileName}
              onClose={onClose}
              onRetry={() => {
                setUploadResult(null)
                setStep('select-course')
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Step 1: Select LMS ───

function SelectLmsStep({
  provider,
  onSelect
}: {
  provider: LmsProvider | null
  onSelect: (p: LmsProvider) => void
}): JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
          Select Your LMS
        </h3>
        <p className="text-xs text-[var(--text-secondary)]">
          Choose which Learning Management System to upload your course to.
        </p>
      </div>

      <div className="space-y-2">
        {LMS_PROVIDERS.map((lms) => (
          <button
            key={lms.id}
            onClick={() => onSelect(lms.id)}
            className={`w-full flex items-center gap-3 p-3.5 rounded-lg border text-left transition-colors cursor-pointer ${
              provider === lms.id
                ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5'
                : 'border-[var(--border-default)] hover:border-[var(--brand-magenta)]/50 hover:bg-[var(--bg-hover)]'
            }`}
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--bg-muted)] flex items-center justify-center shrink-0">
              <BookOpen size={20} className="text-[var(--brand-indigo)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                {lms.label}
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] mt-0.5">
                {lms.description}
              </p>
            </div>
            <ChevronRight size={14} className="text-[var(--text-tertiary)] shrink-0" />
          </button>
        ))}
      </div>

      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
        <p className="text-[10px] text-blue-700 leading-relaxed">
          Don't see your LMS? You can always download the SCORM package and upload it manually
          through your LMS's course import feature.
        </p>
      </div>
    </div>
  )
}

// ─── Step 2: Credentials ───

function CredentialsStep({
  providerInfo,
  baseUrl,
  apiToken,
  onBaseUrlChange,
  onApiTokenChange,
  connectionResult,
  testing,
  loadingCourses,
  onTest,
  onConnect,
  onBack
}: {
  providerInfo: (typeof LMS_PROVIDERS)[number]
  baseUrl: string
  apiToken: string
  onBaseUrlChange: (v: string) => void
  onApiTokenChange: (v: string) => void
  connectionResult: LmsConnectionResult | null
  testing: boolean
  loadingCourses: boolean
  onTest: () => void
  onConnect: () => void
  onBack: () => void
}): JSX.Element {
  const canProceed = connectionResult?.connected && baseUrl && apiToken

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h3 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Connect to {providerInfo.label}
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Enter your LMS credentials to connect.
          </p>
        </div>
      </div>

      {/* URL input */}
      <div className="space-y-1.5">
        <label htmlFor="lms-url" className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
          LMS URL
        </label>
        <input
          id="lms-url"
          type="url"
          value={baseUrl}
          onChange={(e) => onBaseUrlChange(e.target.value)}
          placeholder={providerInfo.urlPlaceholder}
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      </div>

      {/* API Token input */}
      <div className="space-y-1.5">
        <label htmlFor="lms-token" className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
          API Token
        </label>
        <input
          id="lms-token"
          type="password"
          value={apiToken}
          onChange={(e) => onApiTokenChange(e.target.value)}
          placeholder="Paste your API token here"
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      </div>

      {/* How to get a token */}
      <details className="text-xs">
        <summary className="flex items-center gap-1 text-[var(--text-brand)] cursor-pointer font-[var(--font-weight-medium)]">
          <ExternalLink size={12} />
          How to get an API token
        </summary>
        <div className="mt-2 p-3 rounded-lg bg-[var(--bg-muted)] text-[var(--text-secondary)] leading-relaxed">
          {providerInfo.tokenHelp}
        </div>
      </details>

      {/* Test connection */}
      <div className="flex items-center gap-3">
        <button
          onClick={onTest}
          disabled={!baseUrl || !apiToken || testing}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {testing ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <TestTube size={12} />
          )}
          Test Connection
        </button>

        {connectionResult && (
          <span className={`flex items-center gap-1 text-xs ${connectionResult.connected ? 'text-emerald-600' : 'text-red-500'}`}>
            {connectionResult.connected ? (
              <>
                <CheckCircle2 size={12} />
                Connected{connectionResult.userName ? ` as ${connectionResult.userName}` : ''}
              </>
            ) : (
              <>
                <AlertCircle size={12} />
                {connectionResult.error || 'Connection failed'}
              </>
            )}
          </span>
        )}
      </div>

      {/* Proceed button */}
      <button
        onClick={onConnect}
        disabled={!canProceed || loadingCourses}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white rounded-lg bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-[var(--font-weight-semibold)]"
      >
        {loadingCourses ? (
          <>
            <Loader2 size={14} className="animate-spin" />
            Loading courses...
          </>
        ) : (
          <>
            Select Course
            <ChevronRight size={14} />
          </>
        )}
      </button>
    </div>
  )
}

// ─── Step 3: Select Course ───

function SelectCourseStep({
  courses,
  selectedCourseId,
  searchQuery,
  onSearchChange,
  onSelect,
  onUpload,
  fileName,
  providerLabel,
  onBack
}: {
  courses: LmsCourse[]
  selectedCourseId: string | null
  searchQuery: string
  onSearchChange: (v: string) => void
  onSelect: (id: string) => void
  onUpload: () => void
  fileName: string
  providerLabel: string
  onBack: () => void
}): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
          aria-label="Back"
        >
          <ArrowLeft size={14} />
        </button>
        <div>
          <h3 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Select Target Course
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            Choose which {providerLabel} course to upload <strong>{fileName}</strong> to.
          </p>
        </div>
      </div>

      {/* Search */}
      {courses.length > 5 && (
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search courses..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        />
      )}

      {/* Course list */}
      <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-[var(--border-default)] p-1.5">
        {courses.length === 0 ? (
          <div className="p-4 text-center text-xs text-[var(--text-tertiary)]">
            No courses found. You may need a teacher or admin role.
          </div>
        ) : (
          courses.map((course) => (
            <button
              key={course.id}
              onClick={() => onSelect(course.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left text-xs cursor-pointer transition-colors ${
                selectedCourseId === course.id
                  ? 'bg-[var(--brand-magenta)]/10 text-[var(--text-brand)] font-[var(--font-weight-medium)] border border-[var(--brand-magenta)]/30'
                  : 'text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent'
              }`}
            >
              <BookOpen size={14} className="shrink-0 text-[var(--text-tertiary)]" />
              <span className="truncate">{course.name}</span>
            </button>
          ))
        )}
      </div>

      {/* Upload button */}
      <button
        onClick={onUpload}
        disabled={!selectedCourseId}
        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm text-white rounded-lg bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed font-[var(--font-weight-semibold)]"
      >
        <Upload size={14} />
        Upload to {providerLabel}
      </button>
    </div>
  )
}

// ─── Step 4: Uploading ───

function UploadingStep({
  fileName,
  providerLabel
}: {
  fileName: string
  providerLabel: string
}): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Loader2 size={32} className="animate-spin text-[var(--brand-magenta)] mb-4" />
      <h3 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
        Uploading to {providerLabel}
      </h3>
      <p className="text-xs text-[var(--text-secondary)]">
        Uploading <strong>{fileName}</strong>... This may take a moment.
      </p>
    </div>
  )
}

// ─── Step 5: Result ───

function ResultStep({
  result,
  providerLabel,
  fileName,
  onClose,
  onRetry
}: {
  result: LmsUploadResult
  providerLabel: string
  fileName: string
  onClose: () => void
  onRetry: () => void
}): JSX.Element {
  if (result.success) {
    return (
      <div className="space-y-4 text-center py-4">
        <CheckCircle2 size={40} className="mx-auto text-emerald-500" />
        <div>
          <h3 className="text-base font-[var(--font-weight-semibold)] text-emerald-600 mb-1">
            Upload Successful
          </h3>
          <p className="text-xs text-[var(--text-secondary)]">
            <strong>{fileName}</strong> has been uploaded to {providerLabel}.
          </p>
          {result.moduleName && (
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              Module: {result.moduleName}
            </p>
          )}
          {result.error && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-left">
              <p className="text-[10px] text-yellow-700">{result.error}</p>
            </div>
          )}
        </div>

        <div className="pt-2">
          <p className="text-[10px] text-[var(--text-tertiary)] mb-3">
            Log in to your {providerLabel} instance to verify the content and configure settings.
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2 text-xs text-white rounded-lg bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer font-[var(--font-weight-medium)]"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-center py-4">
      <AlertCircle size={40} className="mx-auto text-red-500" />
      <div>
        <h3 className="text-base font-[var(--font-weight-semibold)] text-red-600 mb-1">
          Upload Failed
        </h3>
        <p className="text-xs text-[var(--text-secondary)] mb-2">
          Could not upload <strong>{fileName}</strong> to {providerLabel}.
        </p>
        {result.error && (
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20 text-left">
            <p className="text-[10px] text-red-600">{result.error}</p>
          </div>
        )}
      </div>

      <div className="flex gap-3 justify-center pt-2">
        <button
          onClick={onRetry}
          className="px-4 py-2 text-xs text-[var(--text-primary)] rounded-md border border-[var(--border-default)] hover:bg-[var(--bg-hover)] cursor-pointer font-[var(--font-weight-medium)]"
        >
          Try Again
        </button>
        <button
          onClick={onClose}
          className="px-4 py-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          Close
        </button>
      </div>

      <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-left">
        <p className="text-[10px] text-blue-700 leading-relaxed">
          You can still upload the SCORM package manually. The ZIP file has already been downloaded to your computer.
          Go to your {providerLabel} course settings and use the content import feature.
        </p>
      </div>
    </div>
  )
}
