import { useState, useRef } from 'react'
import {
  X,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Wand2,
  BookOpen,
  MessageSquare,
  Languages,
  Shield,
  Lightbulb,
  Mic,
  ImageIcon,
  Trash2,
  Settings
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useAIStore, type AIView } from '@/stores/useAIStore'
import {
  getProvider,
  AIClientError,
  AI_ACTIONS,
  SYSTEM_PROMPT,
  outlinePrompt,
  lessonContentPrompt,
  quizPrompt,
  narrationPrompt,
  altTextPrompt,
  translatePrompt,
  wcagReviewPrompt,
  udlSuggestionsPrompt
} from '@/lib/ai'
import type {
  InterviewAnswers,
  AIAction,
  CourseOutlineResult,
  QuizGenerationResult,
  WCAGIssue,
  UDLSuggestion
} from '@/lib/ai'
import { uid } from '@/lib/uid'
import { createTextBlock, createCalloutBlock, createQuizBlock, createQuizQuestion, createQuizChoice } from '@/lib/block-factories'
import { stripHtml } from '@/lib/reading-level'

interface AIPanelProps {
  onClose: () => void
}

export function AIPanel({ onClose }: AIPanelProps): JSX.Element {
  const aiSettings = useAppStore((s) => s.ai)
  const view = useAIStore((s) => s.view)
  const isGenerating = useAIStore((s) => s.isGenerating)

  const providerConfigured = aiSettings.provider !== null

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[var(--border-default)] shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-[var(--brand-magenta)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            AI Assistant
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
          aria-label="Close AI panel"
        >
          <X size={14} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!providerConfigured ? (
          <NoProviderMessage />
        ) : view === 'home' ? (
          <HomeView />
        ) : view === 'interview' ? (
          <InterviewView />
        ) : view === 'actions' ? (
          <ActionsView />
        ) : view === 'result' ? (
          <ResultView />
        ) : null}
      </div>

      {/* Generation indicator */}
      {isGenerating && (
        <div
          className="flex items-center gap-2 px-3 py-2 border-t border-[var(--border-default)] bg-[var(--bg-panel)] shrink-0"
          role="status"
          aria-live="polite"
        >
          <Loader2 size={14} className="animate-spin text-[var(--brand-magenta)]" />
          <span className="text-xs text-[var(--text-secondary)]">AI is generating...</span>
        </div>
      )}
    </div>
  )
}

// ─── No Provider ───

function NoProviderMessage(): JSX.Element {
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2 text-[var(--text-warning)]">
        <AlertCircle size={16} />
        <span className="text-sm font-[var(--font-weight-semibold)]">No AI Provider</span>
      </div>
      <p className="text-sm text-[var(--text-secondary)]">
        Configure an AI provider in Settings to use AI features. Supported providers: Anthropic (Claude), OpenAI (GPT-4), or Ollama (local).
      </p>
      <div className="flex items-center gap-1.5 text-xs text-[var(--text-tertiary)]">
        <Settings size={12} />
        <span>Settings → AI/LLM</span>
      </div>
    </div>
  )
}

// ─── Home View ───

function HomeView(): JSX.Element {
  const setView = useAIStore((s) => s.setView)
  const interviewComplete = useAIStore((s) => s.interviewComplete)
  const masterKeyFileName = useAIStore((s) => s.masterKeyFileName)
  const setMasterKey = useAIStore((s) => s.setMasterKey)
  const clearMasterKey = useAIStore((s) => s.clearMasterKey)
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleMasterKeyUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setMasterKey(reader.result as string, file.name)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="p-4 space-y-4">
      {/* Pre-Creation Interview */}
      <button
        onClick={() => setView(interviewComplete ? 'actions' : 'interview')}
        className="w-full flex items-center gap-3 p-3 rounded-lg border border-[var(--border-default)] hover:border-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left group"
      >
        <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-[var(--brand-indigo)] to-[var(--brand-magenta)] text-white shrink-0">
          <Wand2 size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {interviewComplete ? 'AI Generation Actions' : 'Pre-Creation Interview'}
          </div>
          <div className="text-xs text-[var(--text-tertiary)] mt-0.5">
            {interviewComplete
              ? 'Generate content based on your interview'
              : 'Answer questions to guide AI content generation'}
          </div>
        </div>
        <ChevronRight size={14} className="text-[var(--text-tertiary)] group-hover:text-[var(--brand-magenta)]" />
      </button>

      {/* Master Key Upload */}
      <div className="space-y-2">
        <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wide">
          Markdown Master Key
        </label>
        {masterKeyFileName ? (
          <div className="flex items-center gap-2 p-2 rounded-md bg-[var(--bg-panel)] border border-[var(--border-default)]">
            <FileText size={14} className="text-[var(--brand-magenta)] shrink-0" />
            <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{masterKeyFileName}</span>
            <button
              onClick={clearMasterKey}
              className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
              aria-label="Remove master key file"
            >
              <Trash2 size={12} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed border-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:border-[var(--brand-magenta)] hover:text-[var(--brand-magenta)] transition-colors cursor-pointer"
          >
            <Upload size={14} />
            <span>Upload .md reference file</span>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept=".md,.markdown,.txt"
          onChange={handleMasterKeyUpload}
          className="hidden"
          aria-label="Upload markdown master key file"
        />
        <p className="text-[10px] text-[var(--text-tertiary)]">
          Upload a reference document that AI will use as context for all generation tasks.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="space-y-2">
        <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wide">
          Quick Actions
        </label>
        <QuickActionButton
          icon={Shield}
          label="WCAG Review"
          description="Check lesson accessibility"
          action="wcag-review"
        />
        <QuickActionButton
          icon={Lightbulb}
          label="UDL Suggestions"
          description="Improve UDL alignment"
          action="udl-suggestions"
        />
        <QuickActionButton
          icon={MessageSquare}
          label="Generate Quiz"
          description="Create questions from content"
          action="generate-quiz"
        />
        <QuickActionButton
          icon={Mic}
          label="Narration Script"
          description="Write audio narration"
          action="write-narration"
        />
      </div>

      {/* Interview status */}
      {interviewComplete && (
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-green-500/10 border border-green-500/20">
          <CheckCircle2 size={12} className="text-green-500 shrink-0" />
          <span className="text-[10px] text-green-600 dark:text-green-400">Interview complete — AI has full context</span>
        </div>
      )}
    </div>
  )
}

// ─── Quick Action Button ───

function QuickActionButton({
  icon: Icon,
  label,
  description,
  action
}: {
  icon: typeof Shield
  label: string
  description: string
  action: AIAction
}): JSX.Element {
  const isGenerating = useAIStore((s) => s.isGenerating)

  return (
    <button
      onClick={() => runAction(action)}
      disabled={isGenerating}
      className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon size={14} className="text-[var(--text-secondary)] shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">{label}</div>
        <div className="text-[10px] text-[var(--text-tertiary)]">{description}</div>
      </div>
    </button>
  )
}

// ─── Interview View ───

const INTERVIEW_STEPS = [
  {
    field: 'audience' as const,
    label: 'Target Audience',
    question: 'Who is this course for? Describe your learners.',
    placeholder: 'e.g., New employees at a tech company, college-level knowledge, diverse learning needs...',
    type: 'textarea' as const
  },
  {
    field: 'objectives' as const,
    label: 'Learning Objectives',
    question: 'What are the 3-5 key learning objectives?',
    placeholder: 'e.g.,\n1. Understand company safety protocols\n2. Identify common workplace hazards\n3. Apply first aid procedures...',
    type: 'textarea' as const
  },
  {
    field: 'priorKnowledge' as const,
    label: 'Prior Knowledge',
    question: 'What prior knowledge should learners have?',
    placeholder: 'e.g., Basic understanding of workplace safety, no specialized training required...',
    type: 'textarea' as const
  },
  {
    field: 'tone' as const,
    label: 'Tone & Style',
    question: 'What tone works best for this audience?',
    placeholder: '',
    type: 'select' as const,
    options: [
      { value: 'formal', label: 'Formal — Professional, academic style' },
      { value: 'conversational', label: 'Conversational — Friendly, approachable' },
      { value: 'scenario-based', label: 'Scenario-Based — Story-driven, immersive' }
    ]
  },
  {
    field: 'format' as const,
    label: 'Course Format',
    question: 'What format structure do you prefer?',
    placeholder: '',
    type: 'select' as const,
    options: [
      { value: 'linear', label: 'Linear — Sequential lessons' },
      { value: 'branching', label: 'Branching — Choice-driven paths' },
      { value: 'mixed', label: 'Mixed — Linear with branching scenarios' }
    ]
  },
  {
    field: 'accessibilityNeeds' as const,
    label: 'Accessibility Needs',
    question: 'Any specific accessibility needs for this audience?',
    placeholder: 'e.g., Large text for low vision users, simple language for ESL learners, screen reader support...',
    type: 'textarea' as const
  }
]

function InterviewView(): JSX.Element {
  const step = useAIStore((s) => s.interviewStep)
  const answers = useAIStore((s) => s.interviewAnswers)
  const setStep = useAIStore((s) => s.setInterviewStep)
  const updateAnswer = useAIStore((s) => s.updateInterviewAnswer)
  const completeInterview = useAIStore((s) => s.completeInterview)
  const setView = useAIStore((s) => s.setView)

  const currentStep = INTERVIEW_STEPS[step]
  const isLast = step === INTERVIEW_STEPS.length - 1
  const currentValue = answers[currentStep.field] ?? ''

  function handleNext() {
    if (isLast) {
      completeInterview()
    } else {
      setStep(step + 1)
    }
  }

  function handleBack() {
    if (step === 0) {
      setView('home')
    } else {
      setStep(step - 1)
    }
  }

  return (
    <div className="p-4 space-y-4">
      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px] text-[var(--text-tertiary)]">
          <span>Step {step + 1} of {INTERVIEW_STEPS.length}</span>
          <span>{currentStep.label}</span>
        </div>
        <div className="h-1 rounded-full bg-[var(--bg-panel)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] transition-all duration-300"
            style={{ width: `${((step + 1) / INTERVIEW_STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-2">
        <label className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {currentStep.question}
        </label>

        {currentStep.type === 'textarea' ? (
          <textarea
            value={currentValue}
            onChange={(e) => updateAnswer(currentStep.field, e.target.value)}
            placeholder={currentStep.placeholder}
            rows={4}
            className="w-full px-3 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            aria-label={currentStep.question}
          />
        ) : currentStep.type === 'select' && currentStep.options ? (
          <div className="space-y-1.5">
            {currentStep.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateAnswer(currentStep.field, opt.value)}
                className={`w-full flex items-center gap-2 p-2.5 rounded-md border text-left text-xs transition-colors cursor-pointer ${
                  currentValue === opt.value
                    ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/10 text-[var(--text-primary)]'
                    : 'border-[var(--border-default)] hover:border-[var(--brand-magenta)] text-[var(--text-secondary)]'
                }`}
                role="radio"
                aria-checked={currentValue === opt.value}
              >
                <div className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
                  currentValue === opt.value
                    ? 'border-[var(--brand-magenta)]'
                    : 'border-[var(--border-default)]'
                }`}>
                  {currentValue === opt.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--brand-magenta)]" />
                  )}
                </div>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-md hover:bg-[var(--bg-hover)] transition-colors cursor-pointer"
        >
          <ChevronLeft size={12} />
          Back
        </button>
        <button
          onClick={handleNext}
          className="flex items-center gap-1 px-4 py-1.5 text-xs text-white rounded-md bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] hover:opacity-90 transition-opacity cursor-pointer"
        >
          {isLast ? 'Complete' : 'Next'}
          {!isLast && <ChevronRight size={12} />}
        </button>
      </div>
    </div>
  )
}

// ─── Actions View ───

function ActionsView(): JSX.Element {
  const setView = useAIStore((s) => s.setView)
  const isGenerating = useAIStore((s) => s.isGenerating)
  const resetInterview = useAIStore((s) => s.resetInterview)

  const ACTION_ICONS: Record<string, typeof Wand2> = {
    'generate-outline': BookOpen,
    'generate-lesson': FileText,
    'generate-quiz': MessageSquare,
    'write-narration': Mic,
    'generate-alt-text': ImageIcon,
    'translate-lesson': Languages,
    'wcag-review': Shield,
    'udl-suggestions': Lightbulb
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ChevronLeft size={12} />
          Back
        </button>
        <button
          onClick={resetInterview}
          className="text-[10px] text-[var(--text-tertiary)] hover:text-[var(--brand-magenta)] cursor-pointer"
        >
          Redo Interview
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] uppercase tracking-wide">
          Generation Actions
        </label>

        {AI_ACTIONS.map((action) => {
          const Icon = ACTION_ICONS[action.id] ?? Wand2
          return (
            <button
              key={action.id}
              onClick={() => runAction(action.id)}
              disabled={isGenerating}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-md border border-[var(--border-default)] hover:border-[var(--brand-magenta)] hover:bg-[var(--bg-hover)] transition-colors cursor-pointer text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon size={14} className="text-[var(--brand-magenta)] shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">{action.label}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">{action.description}</div>
              </div>
              <ChevronRight size={12} className="text-[var(--text-tertiary)] shrink-0" />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Result View ───

function ResultView(): JSX.Element {
  const setView = useAIStore((s) => s.setView)
  const lastResult = useAIStore((s) => s.lastResult)
  const lastError = useAIStore((s) => s.lastError)
  const currentAction = useAIStore((s) => s.currentAction)
  const isGenerating = useAIStore((s) => s.isGenerating)

  const [applied, setApplied] = useState(false)

  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const activeModuleId = useEditorStore((s) => s.activeModuleId)
  const activeLessonId = useEditorStore((s) => s.activeLessonId)
  const addModule = useCourseStore((s) => s.addModule)
  const addLesson = useCourseStore((s) => s.addLesson)
  const addBlock = useCourseStore((s) => s.addBlock)
  const updateBlock = useCourseStore((s) => s.updateBlock)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)

  function handleApply() {
    if (!lastResult || !activeCourseId || applied) return

    try {
      // Alt text: plain text result, no JSON parsing needed
      if (currentAction === 'generate-alt-text') {
        if (!activeModuleId || !activeLessonId || !selectedBlockId) return
        updateBlock(activeCourseId, activeModuleId, activeLessonId, selectedBlockId, { altText: lastResult.trim() })
        setApplied(true)
        return
      }

      // Translate: JSON array of blocks with translated fields
      if (currentAction === 'translate-lesson') {
        if (!activeModuleId || !activeLessonId) return
        const translated = JSON.parse(lastResult)
        if (!Array.isArray(translated)) return
        for (const block of translated) {
          if (!block.id || !block.type) continue
          const partial: Record<string, unknown> = {}
          if (block.ariaLabel !== undefined) partial.ariaLabel = block.ariaLabel
          if (block.type === 'text' && block.content !== undefined) partial.content = block.content
          if (block.type === 'callout') {
            if (block.content !== undefined) partial.content = block.content
            if (block.title !== undefined) partial.title = block.title
          }
          if (block.type === 'media') {
            if (block.caption !== undefined) partial.caption = block.caption
            if (block.altText !== undefined) partial.altText = block.altText
          }
          if (block.type === 'quiz' && block.questions) partial.questions = block.questions
          if (block.type === 'accordion' && block.items) partial.items = block.items
          if (block.type === 'tabs' && block.tabs) partial.tabs = block.tabs
          if (block.type === 'flashcard' && block.cards) partial.cards = block.cards
          if (block.type === 'branching') {
            if (block.scenario !== undefined) partial.scenario = block.scenario
            if (block.choices) partial.choices = block.choices
          }
          if (Object.keys(partial).length > 0) {
            updateBlock(activeCourseId, activeModuleId, activeLessonId, block.id, partial)
          }
        }
        setApplied(true)
        return
      }

      const parsed = JSON.parse(lastResult)

      if (currentAction === 'generate-outline' && parsed.modules) {
        // Apply course outline
        for (const mod of parsed.modules) {
          const moduleId = uid('module')
          const newModule = {
            id: moduleId,
            title: mod.title || 'Untitled Module',
            description: mod.description || '',
            lessons: [] as Array<{
              id: string
              title: string
              blocks: Array<ReturnType<typeof createTextBlock>>
              notes: never[]
              accessibilityScore: null
              readingLevel: null
            }>,
            udlChecklist: {
              representation: { multipleFormats: false, altTextPresent: false, transcriptsPresent: false, captionsPresent: false, readingLevelAppropriate: false },
              action: { keyboardNavigable: false, multipleResponseModes: false, sufficientTime: false },
              engagement: { choiceAndAutonomy: false, relevantContext: false, feedbackPresent: false, progressVisible: false }
            },
            completionRequired: true
          }

          if (mod.lessons) {
            for (const les of mod.lessons) {
              newModule.lessons.push({
                id: uid('lesson'),
                title: les.title || 'Untitled Lesson',
                blocks: [createTextBlock({ content: `<p>${les.description || ''}</p>` })],
                notes: [],
                accessibilityScore: null,
                readingLevel: null
              })
            }
          }

          addModule(activeCourseId, newModule)
        }
        setApplied(true)
      } else if (currentAction === 'generate-quiz' && parsed.questions && activeModuleId && activeLessonId) {
        // Apply quiz questions
        const quizBlock = createQuizBlock({
          questions: parsed.questions.map((q: { type: string; prompt: string; choices: Array<{ label: string; isCorrect: boolean }>; feedbackCorrect: string; feedbackIncorrect: string }) => {
            const qType = q.type === 'true-false' ? 'true-false' : 'multiple-choice'
            const question = createQuizQuestion(qType, { prompt: q.prompt, feedbackCorrect: q.feedbackCorrect, feedbackIncorrect: q.feedbackIncorrect })
            if (q.choices) {
              question.choices = q.choices.map((c: { label: string; isCorrect: boolean }) =>
                createQuizChoice({ label: c.label, isCorrect: c.isCorrect })
              )
              const correct = question.choices.find((c) => c.isCorrect)
              if (correct) question.correctId = correct.id
            }
            return question
          })
        })
        addBlock(activeCourseId, activeModuleId, activeLessonId, quizBlock)
        setApplied(true)
      } else if (currentAction === 'generate-lesson' && Array.isArray(parsed) && activeModuleId && activeLessonId) {
        // Apply lesson content blocks
        for (const blockData of parsed) {
          if (blockData.type === 'text') {
            addBlock(activeCourseId, activeModuleId, activeLessonId,
              createTextBlock({ content: blockData.content || '', ariaLabel: blockData.ariaLabel || 'Text content' }))
          } else if (blockData.type === 'callout') {
            addBlock(activeCourseId, activeModuleId, activeLessonId,
              createCalloutBlock({ variant: blockData.variant || 'info', content: blockData.content || '', ariaLabel: blockData.ariaLabel || 'Callout' }))
          }
        }
        setApplied(true)
      }
    } catch {
      // Result isn't JSON or can't be applied structurally
    }
  }

  return (
    <div className="p-4 space-y-4">
      <button
        onClick={() => setView(useAIStore.getState().interviewComplete ? 'actions' : 'home')}
        className="flex items-center gap-1 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
      >
        <ChevronLeft size={12} />
        Back
      </button>

      {isGenerating ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 size={24} className="animate-spin text-[var(--brand-magenta)]" />
          <span className="text-sm text-[var(--text-secondary)]">Generating content...</span>
        </div>
      ) : lastError ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle size={14} />
            <span className="text-xs font-[var(--font-weight-semibold)]">Generation Failed</span>
          </div>
          <p className="text-xs text-[var(--text-secondary)] bg-red-500/10 border border-red-500/20 rounded-md p-2.5">
            {lastError}
          </p>
        </div>
      ) : lastResult ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-500">
            <CheckCircle2 size={14} />
            <span className="text-xs font-[var(--font-weight-semibold)]">Generation Complete</span>
          </div>

          {/* Result preview */}
          <div className="max-h-64 overflow-y-auto rounded-md border border-[var(--border-default)] bg-[var(--bg-panel)] p-3">
            <pre className="text-[10px] text-[var(--text-secondary)] whitespace-pre-wrap font-mono leading-relaxed">
              {formatResult(lastResult)}
            </pre>
          </div>

          {/* Apply button */}
          {canApply(currentAction) && (
            <button
              onClick={handleApply}
              disabled={applied}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-xs rounded-md transition-colors cursor-pointer ${
                applied
                  ? 'bg-green-500/10 text-green-600 border border-green-500/20'
                  : 'bg-gradient-to-r from-[var(--brand-indigo)] to-[var(--brand-magenta)] text-white hover:opacity-90'
              }`}
            >
              {applied ? (
                <>
                  <CheckCircle2 size={14} />
                  Applied to Course
                </>
              ) : (
                <>
                  <Wand2 size={14} />
                  Apply to Course
                </>
              )}
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

// ─── Helpers ───

function canApply(action: AIAction | null): boolean {
  return action === 'generate-outline' || action === 'generate-quiz' || action === 'generate-lesson' || action === 'generate-alt-text' || action === 'translate-lesson'
}

function formatResult(raw: string): string {
  try {
    const parsed = JSON.parse(raw)
    return JSON.stringify(parsed, null, 2)
  } catch {
    // Plain text result (narration, alt text, etc.)
    return raw
  }
}

// ─── Run Action (module-level function) ───

async function runAction(action: AIAction): Promise<void> {
  const aiStore = useAIStore.getState()
  const appStore = useAppStore.getState()
  const courseStore = useCourseStore.getState()
  const editorStore = useEditorStore.getState()

  if (aiStore.isGenerating) return

  const { ai: aiSettings } = appStore
  const course = courseStore.courses.find((c) => c.id === courseStore.activeCourseId)

  // Get current lesson content for context
  let lessonContent = ''
  if (course && editorStore.activeModuleId && editorStore.activeLessonId) {
    const mod = course.modules.find((m) => m.id === editorStore.activeModuleId)
    const lesson = mod?.lessons.find((l) => l.id === editorStore.activeLessonId)
    if (lesson) {
      lessonContent = lesson.blocks
        .map((b) => {
          if (b.type === 'text') return stripHtml(b.content)
          if (b.type === 'callout') return b.content
          if (b.type === 'quiz') return b.questions.map((q) => q.prompt).join('\n')
          return ''
        })
        .filter(Boolean)
        .join('\n\n')
    }
  }

  useAIStore.setState({ view: 'result' })
  aiStore.startGeneration(action)

  try {
    const provider = getProvider(aiSettings)
    let result: string

    switch (action) {
      case 'generate-outline': {
        const topic = course?.meta.title || 'Course'
        const prompt = outlinePrompt(topic, aiStore.interviewAnswers)
        result = await provider.generateText(prompt, SYSTEM_PROMPT)
        break
      }
      case 'generate-lesson': {
        const mod = course?.modules.find((m) => m.id === editorStore.activeModuleId)
        const lesson = mod?.lessons.find((l) => l.id === editorStore.activeLessonId)
        const prompt = lessonContentPrompt(
          lesson?.title || 'Lesson',
          '',
          aiStore.interviewAnswers
        )
        result = await provider.generateText(prompt, SYSTEM_PROMPT)
        break
      }
      case 'generate-quiz': {
        if (!lessonContent) throw new Error('No lesson content to generate quiz from. Add some text blocks first.')
        const prompt = quizPrompt(lessonContent)
        result = await provider.generateText(prompt, SYSTEM_PROMPT)
        break
      }
      case 'write-narration': {
        if (!lessonContent) throw new Error('No lesson content to write narration for. Add some text blocks first.')
        const prompt = narrationPrompt(lessonContent)
        result = await provider.generateText(prompt, SYSTEM_PROMPT)
        break
      }
      case 'generate-alt-text': {
        const selectedBlockId = editorStore.selectedBlockId
        if (!selectedBlockId) throw new Error('No block selected. Select a media block first.')
        const mod = course?.modules.find((m) => m.id === editorStore.activeModuleId)
        const lesson = mod?.lessons.find((l) => l.id === editorStore.activeLessonId)
        const block = lesson?.blocks.find((b) => b.id === selectedBlockId)
        if (!block || block.type !== 'media') throw new Error('Selected block is not a media block. Select an image block to generate alt text.')
        const contextParts: string[] = []
        if (block.caption) contextParts.push(`Caption: ${block.caption}`)
        if (block.assetPath) contextParts.push(`Filename: ${block.assetPath.split('/').pop()}`)
        if (lesson?.title) contextParts.push(`Lesson: ${lesson.title}`)
        if (lessonContent) contextParts.push(`Surrounding content: ${lessonContent.slice(0, 500)}`)
        const imageContext = contextParts.join('\n') || 'No additional context available'
        const prompt = altTextPrompt(imageContext)
        result = await provider.generateText(prompt, SYSTEM_PROMPT)
        break
      }
      case 'translate-lesson': {
        const mod = course?.modules.find((m) => m.id === editorStore.activeModuleId)
        const lesson = mod?.lessons.find((l) => l.id === editorStore.activeLessonId)
        if (!lesson || lesson.blocks.length === 0) throw new Error('No lesson content to translate. Add some content blocks first.')
        const langMap: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', de: 'German', pt: 'Portuguese' }
        const langCode = aiSettings.defaultAILanguage || 'es'
        const languageName = langMap[langCode] || langCode
        const translatableBlocks = lesson.blocks.map((b) => {
          if (b.type === 'text') return { id: b.id, type: b.type, content: b.content, ariaLabel: b.ariaLabel }
          if (b.type === 'callout') return { id: b.id, type: b.type, content: b.content, title: b.title, ariaLabel: b.ariaLabel }
          if (b.type === 'media') return { id: b.id, type: b.type, caption: b.caption, altText: b.altText, ariaLabel: b.ariaLabel }
          if (b.type === 'quiz') return { id: b.id, type: b.type, questions: b.questions.map((q) => ({ id: q.id, prompt: q.prompt, choices: q.choices.map((c) => ({ id: c.id, label: c.label })), feedbackCorrect: q.feedbackCorrect, feedbackIncorrect: q.feedbackIncorrect })) }
          if (b.type === 'accordion') return { id: b.id, type: b.type, items: b.items, ariaLabel: b.ariaLabel }
          if (b.type === 'tabs') return { id: b.id, type: b.type, tabs: b.tabs, ariaLabel: b.ariaLabel }
          if (b.type === 'flashcard') return { id: b.id, type: b.type, cards: b.cards, ariaLabel: b.ariaLabel }
          if (b.type === 'branching') return { id: b.id, type: b.type, scenario: b.scenario, choices: b.choices.map((c) => ({ id: c.id, label: c.label, consequence: c.consequence })), ariaLabel: b.ariaLabel }
          return null
        }).filter(Boolean)
        const jsonContent = JSON.stringify(translatableBlocks, null, 2)
        const prompt = translatePrompt(jsonContent, languageName)
        result = await provider.generateText(prompt, SYSTEM_PROMPT)
        break
      }
      case 'wcag-review': {
        if (!lessonContent) throw new Error('No lesson content to review. Add some content blocks first.')
        const prompt = wcagReviewPrompt(lessonContent)
        result = await provider.generateText(prompt, SYSTEM_PROMPT)
        break
      }
      case 'udl-suggestions': {
        if (!lessonContent) throw new Error('No lesson content to analyze. Add some content blocks first.')
        const prompt = udlSuggestionsPrompt(lessonContent)
        result = await provider.generateText(prompt, SYSTEM_PROMPT)
        break
      }
      default:
        result = 'Unknown action'
    }

    useAIStore.getState().finishGeneration(result)
    useAIStore.getState().addMessage({ role: 'assistant', content: result, action })
  } catch (err) {
    const message = err instanceof AIClientError
      ? err.message
      : err instanceof Error
        ? err.message
        : 'An unexpected error occurred'
    useAIStore.getState().failGeneration(message)
  }
}
