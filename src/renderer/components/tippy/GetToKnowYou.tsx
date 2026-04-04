/**
 * TIPPY Get to Know You — Conversational Onboarding
 *
 * A full-panel guided conversation where TIPPY asks the author about their
 * role, audience, design philosophy, brand, workflow, and AI preferences.
 * Responses are saved per-section and used to build the author profile.
 *
 * This is NOT a form — it's a warm, direct conversation with TIPPY.
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  User,
  Users,
  Lightbulb,
  Palette,
  Workflow,
  Brain,
  ChevronLeft,
  ChevronRight,
  Check,
  SkipForward,
  ArrowLeft
} from 'lucide-react'
import { useAuthorProfileStore, ONBOARDING_SECTIONS } from '@/stores/useAuthorProfileStore'
import type { OnboardingSectionId } from '@/types/analytics'
import TippyIcon from '@/assets/tippy/Tippy_Icon.png'

const SECTION_ICONS: Record<string, typeof User> = {
  user: User,
  users: Users,
  lightbulb: Lightbulb,
  palette: Palette,
  workflow: Workflow,
  brain: Brain
}

interface Props {
  onClose: () => void
}

export function GetToKnowYou({ onClose }: Props): JSX.Element {
  const sections = useAuthorProfileStore((s) => s.sections)
  const activeSection = useAuthorProfileStore((s) => s.activeSection)
  const activeQuestionIndex = useAuthorProfileStore((s) => s.activeQuestionIndex)
  const startSection = useAuthorProfileStore((s) => s.startSection)
  const setResponse = useAuthorProfileStore((s) => s.setResponse)
  const completeSection = useAuthorProfileStore((s) => s.completeSection)
  const skipSection = useAuthorProfileStore((s) => s.skipSection)
  const nextQuestion = useAuthorProfileStore((s) => s.nextQuestion)
  const prevQuestion = useAuthorProfileStore((s) => s.prevQuestion)

  // If no active section, show section picker
  if (!activeSection) {
    return <SectionPicker sections={sections} onSelect={startSection} onClose={onClose} />
  }

  return (
    <ConversationView
      sectionId={activeSection}
      questionIndex={activeQuestionIndex}
      sections={sections}
      onSetResponse={setResponse}
      onNextQuestion={nextQuestion}
      onPrevQuestion={prevQuestion}
      onComplete={completeSection}
      onSkip={skipSection}
      onBack={() => useAuthorProfileStore.setState({ activeSection: null })}
    />
  )
}

// ─── Section Picker ───

function SectionPicker({
  sections,
  onSelect,
  onClose
}: {
  sections: typeof useAuthorProfileStore extends (s: infer S) => infer R ? never : any
  onSelect: (id: OnboardingSectionId) => void
  onClose: () => void
}): JSX.Element {
  const completedCount = sections.filter((s: any) => s.completed).length

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <button
          onClick={onClose}
          className="p-1 rounded cursor-pointer"
          style={{ color: 'var(--text-tertiary)' }}
          aria-label="Back to TIPPY settings"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <img src={TippyIcon} alt="" className="w-8 h-8 rounded-full" />
          <div>
            <h2 className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
              Get to Know You
            </h2>
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {completedCount} of {ONBOARDING_SECTIONS.length} sections complete
            </p>
          </div>
        </div>
      </div>

      {/* Intro message */}
      <div className="px-6 py-4">
        <div
          className="p-4 rounded-xl text-sm leading-relaxed"
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="flex gap-3">
            <img src={TippyIcon} alt="" className="w-7 h-7 rounded-full shrink-0 mt-0.5" />
            <p>
              I'd love to learn about you so I can give you better, more relevant advice.
              Pick any section below to start a conversation. You can complete them in any order,
              skip any section, and come back to update your answers anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Section cards */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
        {ONBOARDING_SECTIONS.map((meta) => {
          const data = sections.find((s: any) => s.id === meta.id)
          const Icon = SECTION_ICONS[meta.icon] || User
          const isComplete = data?.completed ?? false
          const hasPartialData = data?.responses?.some((r: string) => r.trim().length > 0) ?? false

          return (
            <button
              key={meta.id}
              onClick={() => onSelect(meta.id)}
              className="w-full flex items-center gap-3 p-4 rounded-xl text-left transition-colors cursor-pointer"
              style={{
                backgroundColor: isComplete ? 'var(--bg-active)' : 'var(--bg-surface)',
                border: `1px solid ${isComplete ? 'var(--brand-magenta)' : 'var(--border-default)'}`,
                color: 'var(--text-primary)'
              }}
            >
              <div
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: isComplete ? 'var(--brand-magenta)' : 'var(--bg-muted)',
                  color: isComplete ? '#fff' : 'var(--text-secondary)'
                }}
              >
                {isComplete ? <Check size={18} /> : <Icon size={18} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{meta.title}</div>
                <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {isComplete
                    ? data?.summary || 'Completed'
                    : hasPartialData
                      ? 'In progress — tap to continue'
                      : `${meta.questions.length} questions`}
                </div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Conversation View ───

function ConversationView({
  sectionId,
  questionIndex,
  sections,
  onSetResponse,
  onNextQuestion,
  onPrevQuestion,
  onComplete,
  onSkip,
  onBack
}: {
  sectionId: OnboardingSectionId
  questionIndex: number
  sections: any[]
  onSetResponse: (sectionId: OnboardingSectionId, qIdx: number, val: string) => void
  onNextQuestion: () => void
  onPrevQuestion: () => void
  onComplete: (sectionId: OnboardingSectionId, summary: string) => void
  onSkip: (sectionId: OnboardingSectionId) => void
  onBack: () => void
}): JSX.Element {
  const meta = ONBOARDING_SECTIONS.find((s) => s.id === sectionId)!
  const sectionData = sections.find((s: any) => s.id === sectionId)!
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showSummary, setShowSummary] = useState(false)

  const currentResponse = sectionData.responses[questionIndex] || ''
  const isLastQuestion = questionIndex === meta.questions.length - 1
  const allAnswered = sectionData.responses.every((r: string) => r.trim().length > 0)

  // Focus textarea on question change
  useEffect(() => {
    textareaRef.current?.focus()
  }, [questionIndex])

  // Scroll to bottom on question change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [questionIndex, showSummary])

  const handleSubmitResponse = useCallback(() => {
    if (!currentResponse.trim()) return

    if (isLastQuestion) {
      // Show summary before completing
      setShowSummary(true)
    } else {
      onNextQuestion()
    }
  }, [currentResponse, isLastQuestion, onNextQuestion])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSubmitResponse()
      }
    },
    [handleSubmitResponse]
  )

  const handleComplete = useCallback(() => {
    // Build a summary from responses
    const responses = sectionData.responses.filter((r: string) => r.trim().length > 0)
    const summary =
      responses.length > 0
        ? responses[0].slice(0, 80) + (responses[0].length > 80 ? '...' : '')
        : 'Completed'
    onComplete(sectionId, summary)
  }, [sectionId, sectionData.responses, onComplete])

  const Icon = SECTION_ICONS[meta.icon] || User

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-6 py-4 border-b shrink-0"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <button
          onClick={onBack}
          className="p-1 rounded cursor-pointer"
          style={{ color: 'var(--text-tertiary)' }}
          aria-label="Back to sections"
        >
          <ArrowLeft size={18} />
        </button>
        <Icon size={18} style={{ color: 'var(--brand-magenta)' }} />
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          {meta.title}
        </h2>
        <span className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>
          {questionIndex + 1} / {meta.questions.length}
        </span>
      </div>

      {/* Conversation area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
        {/* Show all previous Q&A pairs */}
        {meta.questions.slice(0, questionIndex + 1).map((question, idx) => (
          <div key={idx} className="space-y-3">
            {/* TIPPY question bubble */}
            <div className="flex gap-2">
              <img src={TippyIcon} alt="" className="w-7 h-7 rounded-full shrink-0 mt-1" />
              <div
                className="px-3 py-2 rounded-xl text-sm leading-relaxed max-w-[85%]"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)'
                }}
              >
                {question}
              </div>
            </div>

            {/* Author response bubble (if answered) */}
            {sectionData.responses[idx]?.trim() && idx < questionIndex && (
              <div className="flex justify-end">
                <div
                  className="px-3 py-2 rounded-xl text-sm leading-relaxed max-w-[85%]"
                  style={{
                    backgroundColor: 'var(--brand-indigo)',
                    color: '#fff'
                  }}
                >
                  {sectionData.responses[idx]}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Summary confirmation */}
        {showSummary && (
          <div className="space-y-3">
            {/* Show last answer */}
            {currentResponse.trim() && (
              <div className="flex justify-end">
                <div
                  className="px-3 py-2 rounded-xl text-sm leading-relaxed max-w-[85%]"
                  style={{ backgroundColor: 'var(--brand-indigo)', color: '#fff' }}
                >
                  {currentResponse}
                </div>
              </div>
            )}

            {/* TIPPY confirmation */}
            <div className="flex gap-2">
              <img src={TippyIcon} alt="" className="w-7 h-7 rounded-full shrink-0 mt-1" />
              <div
                className="px-3 py-2 rounded-xl text-sm leading-relaxed max-w-[85%]"
                style={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)'
                }}
              >
                Thank you for sharing all of that. I've saved your responses for the{' '}
                <strong>{meta.title}</strong> section. I'll use this to give you more relevant
                suggestions as you build your courses.
              </div>
            </div>

            {/* Save button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={handleComplete}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--brand-magenta)',
                  color: '#fff',
                  border: 'none'
                }}
              >
                <Check size={16} />
                Save &amp; Continue
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input area (hidden during summary) */}
      {!showSummary && (
        <div
          className="px-6 py-4 border-t shrink-0"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <div className="flex gap-2">
            <textarea
              ref={textareaRef}
              value={currentResponse}
              onChange={(e) => onSetResponse(sectionId, questionIndex, e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response... (Enter to submit, Shift+Enter for new line)"
              rows={3}
              className="flex-1 px-3 py-2 rounded-lg text-sm resize-none"
              style={{
                backgroundColor: 'var(--bg-muted)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                outline: 'none'
              }}
            />
          </div>

          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              {questionIndex > 0 && (
                <button
                  onClick={onPrevQuestion}
                  className="flex items-center gap-1 px-3 py-1.5 rounded text-xs cursor-pointer"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-default)'
                  }}
                >
                  <ChevronLeft size={14} /> Previous
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onSkip(sectionId)}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs cursor-pointer"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-tertiary)',
                  border: '1px solid var(--border-default)'
                }}
              >
                <SkipForward size={14} /> Skip Section
              </button>
              <button
                onClick={handleSubmitResponse}
                disabled={!currentResponse.trim()}
                className="flex items-center gap-1 px-4 py-1.5 rounded text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: currentResponse.trim()
                    ? 'var(--brand-indigo)'
                    : 'var(--bg-muted)',
                  color: currentResponse.trim() ? '#fff' : 'var(--text-tertiary)',
                  border: 'none',
                  opacity: currentResponse.trim() ? 1 : 0.6
                }}
              >
                {isLastQuestion ? 'Finish' : 'Next'} <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
