// ─── Tippy AI Assistant Store ───
// Phase 4: Core TIPPY with 4-layer prompt, KB retrieval, reasoning transparency,
// FERPA cloud warnings, walkthrough system, and TIPPY Assesses.

import { create } from 'zustand'
import { uid } from '@/lib/uid'
import { getProvider } from '@/lib/ai/ai-client'
import { useAppStore } from './useAppStore'
import { getAppContext } from '@/lib/tippy/tippyContext'
import { buildTippySystemPrompt } from '@/lib/tippy/tippySystemPrompt'
import { detectWalkthroughTrigger } from '@/lib/tippy/walkthrough-engine'
import { runAssessesReport } from '@/lib/tippy/assesses-engine'
import type { TippyReasoningData, TippyConfidenceLevel, AssessesReport, AssessesScope } from '@/types/analytics'

export interface TippyMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  /** Reasoning transparency data (assistant messages only) */
  reasoning?: TippyReasoningData | null
  /** Walkthrough ID — present when TIPPY offers to start a walkthrough */
  walkthroughId?: string | null
}

interface TippySession {
  id: string
  name: string
  messages: TippyMessage[]
  savedAt: number
}

interface FerpaWarningState {
  visible: boolean
  providerName: string
  pendingMessage: string | null
}

interface TippyState {
  // Panel
  isOpen: boolean
  position: { x: number; y: number }

  // Chat
  messages: TippyMessage[]
  isGenerating: boolean
  error: string | null

  // Tour / Walkthrough
  tourActive: boolean
  tourStepIndex: number
  activeWalkthroughId: string | null

  // Sessions
  savedSessions: TippySession[]

  // FERPA
  ferpaWarning: FerpaWarningState

  // Reasoning panel usage count (for AI note display)
  reasoningViewCount: number

  // Assesses
  assessReport: AssessesReport | null
  isAssessing: boolean
  autoAssessOnExport: boolean

  // Panel actions
  toggle: () => void
  open: () => void
  close: () => void
  setPosition: (pos: { x: number; y: number }) => void

  // Chat actions
  addMessage: (msg: Omit<TippyMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void
  setGenerating: (v: boolean) => void
  setError: (err: string | null) => void

  // Tour / Walkthrough actions
  startTour: () => void
  startWalkthrough: (walkthroughId: string) => void
  nextTourStep: () => void
  prevTourStep: () => void
  endTour: () => void

  // Session actions
  saveSession: (name: string) => void
  loadSession: (id: string) => void
  deleteSession: (id: string) => void

  // FERPA actions
  showFerpaWarning: (providerName: string, pendingMessage: string) => void
  dismissFerpaWarning: () => void
  acknowledgeFerpa: () => void

  // Assesses actions
  runAssesses: (scope: AssessesScope, scopeId?: string) => void
  clearAssessment: () => void
  setAutoAssessOnExport: (v: boolean) => void

  // Send message (calls AI)
  sendMessage: (text: string) => Promise<void>
}

const STORAGE_KEY_MESSAGES = 'tippy_messages'
const STORAGE_KEY_SESSIONS = 'tippy_sessions'
const STORAGE_KEY_POSITION = 'tippy_position'
const STORAGE_KEY_REASONING_COUNT = 'tippy_reasoning_count'
const STORAGE_KEY_AUTO_ASSESS = 'tippy_auto_assess'
const MAX_CONTEXT_MESSAGES = 20

// ─── FERPA keyword detection ───

const FERPA_KEYWORDS = [
  'student', 'learner name', 'learner id', 'grade', 'score',
  'transcript', 'disability', 'accommodation', 'iep', 'section 504',
  'identified', 'roster', 'enrollment'
]

function containsLearnerData(text: string): boolean {
  const lower = text.toLowerCase()
  return FERPA_KEYWORDS.some((kw) => lower.includes(kw))
}

// ─── Reasoning extraction from AI response ───

/**
 * Extract reasoning data from the AI response text.
 * The AI is instructed to include a ```reasoning code block.
 */
function extractReasoning(response: string): {
  cleanContent: string
  reasoning: TippyReasoningData | null
} {
  const reasoningMatch = response.match(/```reasoning\n([\s\S]*?)```/)

  if (!reasoningMatch) {
    return { cleanContent: response, reasoning: null }
  }

  const cleanContent = response.replace(/```reasoning\n[\s\S]*?```/, '').trim()
  const raw = reasoningMatch[1]

  try {
    const reasoning = parseReasoningBlock(raw)
    return { cleanContent, reasoning }
  } catch {
    return { cleanContent, reasoning: null }
  }
}

function parseReasoningBlock(raw: string): TippyReasoningData {
  const lines = raw.split('\n')
  const data: Record<string, string> = {}
  let currentKey = ''

  for (const line of lines) {
    const keyMatch = line.match(/^(\w[\w_]+):\s*(.*)/)
    if (keyMatch) {
      currentKey = keyMatch[1]
      data[currentKey] = keyMatch[2].trim()
    } else if (currentKey && line.trim()) {
      data[currentKey] = (data[currentKey] ? data[currentKey] + ' ' : '') + line.trim()
    }
  }

  // Parse sources
  const sourcesRaw = data['sources'] || ''
  const sources = sourcesRaw
    .split(/[;,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((label) => ({
      label,
      type: inferSourceType(label),
      reference: undefined
    }))

  // Parse confidence
  const confidenceRaw = (data['confidence'] || 'medium').toLowerCase() as TippyConfidenceLevel
  const overallConfidence = ['high', 'medium', 'low', 'uncertain'].includes(confidenceRaw)
    ? confidenceRaw
    : 'medium' as TippyConfidenceLevel

  // Parse confidence details
  const detailsRaw = data['confidence_details'] || ''
  const confidenceBreakdown = detailsRaw
    .split(/[;.]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((detail) => {
      const levelMatch = detail.match(/\b(high|medium|low|uncertain)\b/i)
      const level = (levelMatch ? levelMatch[1].toLowerCase() : 'medium') as TippyConfidenceLevel
      const dashIdx = detail.indexOf('—')
      const colonIdx = detail.indexOf(':')
      const splitIdx = dashIdx >= 0 ? dashIdx : colonIdx
      const category = splitIdx >= 0 ? detail.slice(0, splitIdx).trim() : 'General'
      const explanation = splitIdx >= 0 ? detail.slice(splitIdx + 1).trim() : detail
      return { category, level, explanation }
    })

  // Parse limitations
  const limitationsRaw = data['limitations'] || ''
  const limitations = limitationsRaw
    .split(/[;.]/)
    .map((s) => s.trim())
    .filter(Boolean)

  // Parse human review
  const humanReviewRaw = data['human_review'] || ''
  const humanReviewRequired = humanReviewRaw
    .split(/[;.]/)
    .map((s) => s.trim())
    .filter(Boolean)

  return {
    sources,
    overallConfidence,
    confidenceBreakdown,
    limitations,
    humanReviewRequired
  }
}

function inferSourceType(label: string): 'standard' | 'feature-kb' | 'author-profile' | 'tool-result' | 'ai-provider' {
  const lower = label.toLowerCase()
  if (lower.includes('wcag') || lower.includes('udl') || lower.includes('cast') || lower.includes('discrit')) return 'standard'
  if (lower.includes('feature') || lower.includes('tippy-features')) return 'feature-kb'
  if (lower.includes('profile') || lower.includes('author')) return 'author-profile'
  if (lower.includes('axe') || lower.includes('readability') || lower.includes('pa11y')) return 'tool-result'
  if (lower.includes('provider') || lower.includes('model') || lower.includes('claude') || lower.includes('gpt') || lower.includes('ollama')) return 'ai-provider'
  return 'standard'
}

// ─── Persistence helpers ───

function loadMessages(): TippyMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MESSAGES)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistMessages(messages: TippyMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_MESSAGES, JSON.stringify(messages))
  } catch {
    // Storage full — silently fail
  }
}

function loadSessions(): TippySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSIONS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function persistSessions(sessions: TippySession[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions))
  } catch {
    // Storage full
  }
}

function loadPosition(): { x: number; y: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_POSITION)
    if (raw) return JSON.parse(raw)
  } catch {
    // ignore
  }
  // Default: bottom-left, offset from AccessibilityWidget which is bottom-right
  return { x: 24, y: window.innerHeight - 80 }
}

function persistPosition(pos: { x: number; y: number }): void {
  try {
    localStorage.setItem(STORAGE_KEY_POSITION, JSON.stringify(pos))
  } catch {
    // ignore
  }
}

function loadReasoningCount(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY_REASONING_COUNT) || '0', 10)
  } catch {
    return 0
  }
}

function persistReasoningCount(count: number): void {
  try {
    localStorage.setItem(STORAGE_KEY_REASONING_COUNT, String(count))
  } catch {
    // ignore
  }
}

function loadAutoAssess(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_AUTO_ASSESS) === 'true'
  } catch {
    return false
  }
}

function persistAutoAssess(v: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTO_ASSESS, String(v))
  } catch {
    // ignore
  }
}

// ─── Assesses trigger detection ───

const ASSESS_TRIGGERS = [
  'assess this', 'assess my', 'run assessment', 'run assesses', 'check accessibility',
  'wcag check', 'udl check', 'inclusion check', 'how accessible', 'accessibility audit',
  'tippy assesses', 'evaluate this', 'grade this', 'score this'
]

function isAssessTrigger(text: string): boolean {
  const lower = text.toLowerCase()
  return ASSESS_TRIGGERS.some((trigger) => lower.includes(trigger))
}

// ─── Store ───

export const useTippyStore = create<TippyState>((set, get) => ({
  isOpen: false,
  position: loadPosition(),
  messages: loadMessages(),
  isGenerating: false,
  error: null,
  tourActive: false,
  tourStepIndex: 0,
  activeWalkthroughId: null,
  savedSessions: loadSessions(),
  ferpaWarning: { visible: false, providerName: '', pendingMessage: null },
  reasoningViewCount: loadReasoningCount(),
  assessReport: null,
  isAssessing: false,
  autoAssessOnExport: loadAutoAssess(),

  // Panel
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setPosition: (pos) => {
    set({ position: pos })
    persistPosition(pos)
  },

  // Chat
  addMessage: (msg) => {
    const message: TippyMessage = {
      ...msg,
      id: uid('tippy'),
      timestamp: Date.now()
    }
    set((s) => {
      const messages = [...s.messages, message]
      persistMessages(messages)
      // Track reasoning panel usage
      if (msg.reasoning) {
        const count = s.reasoningViewCount + 1
        persistReasoningCount(count)
        return { messages, reasoningViewCount: count }
      }
      return { messages }
    })
  },

  clearMessages: () => {
    set({ messages: [] })
    persistMessages([])
  },

  setGenerating: (v) => set({ isGenerating: v }),
  setError: (err) => set({ error: err }),

  // Tour / Walkthrough
  startTour: () => set({ tourActive: true, tourStepIndex: 0, activeWalkthroughId: null }),
  startWalkthrough: (walkthroughId: string) =>
    set({ tourActive: true, tourStepIndex: 0, activeWalkthroughId: walkthroughId }),
  nextTourStep: () => set((s) => ({ tourStepIndex: s.tourStepIndex + 1 })),
  prevTourStep: () => set((s) => ({ tourStepIndex: Math.max(0, s.tourStepIndex - 1) })),
  endTour: () => set({ tourActive: false, tourStepIndex: 0, activeWalkthroughId: null }),

  // Sessions
  saveSession: (name) => {
    const { messages, savedSessions } = get()
    if (messages.length === 0) return
    const session: TippySession = {
      id: uid('session'),
      name,
      messages: [...messages],
      savedAt: Date.now()
    }
    const updated = [...savedSessions, session]
    set({ savedSessions: updated })
    persistSessions(updated)
  },

  loadSession: (id) => {
    const { savedSessions } = get()
    const session = savedSessions.find((s) => s.id === id)
    if (!session) return
    set({ messages: [...session.messages] })
    persistMessages(session.messages)
  },

  deleteSession: (id) => {
    const updated = get().savedSessions.filter((s) => s.id !== id)
    set({ savedSessions: updated })
    persistSessions(updated)
  },

  // FERPA
  showFerpaWarning: (providerName, pendingMessage) => {
    set({ ferpaWarning: { visible: true, providerName, pendingMessage } })
  },

  dismissFerpaWarning: () => {
    set({ ferpaWarning: { visible: false, providerName: '', pendingMessage: null } })
  },

  acknowledgeFerpa: () => {
    const { ferpaWarning } = get()
    const pendingMsg = ferpaWarning.pendingMessage
    set({ ferpaWarning: { visible: false, providerName: '', pendingMessage: null } })

    // Re-send the pending message after acknowledgment
    if (pendingMsg) {
      // Use a microtask to avoid calling sendMessage synchronously
      queueMicrotask(() => {
        get().sendMessage(pendingMsg)
      })
    }
  },

  // Assesses
  runAssesses: (scope: AssessesScope, scopeId?: string) => {
    const { addMessage, open } = get()
    const courseStore = require('@/stores/useCourseStore').useCourseStore
    const course = courseStore.getState().course
    if (!course) {
      addMessage({ role: 'system', content: 'No course is open. Open a course before running an assessment.' })
      return
    }

    set({ isAssessing: true, assessReport: null })
    open()
    addMessage({
      role: 'assistant',
      content: `Running TIPPY Assesses on **${scope}**... Evaluating WCAG 2.1 AA, UDL checkpoints, and inclusion criteria.`
    })

    // Run assessment (synchronous — the engine is deterministic)
    try {
      const aiSettings = useAppStore.getState().ai
      const providerName = aiSettings.provider || 'local'
      const modelName = aiSettings.model || 'default'
      const resolvedScopeId = scopeId || (scope === 'course' ? course.id : '')

      const report = runAssessesReport(course, scope, resolvedScopeId, providerName, modelName)
      set({ assessReport: report, isAssessing: false })

      const { scorecard } = report
      addMessage({
        role: 'assistant',
        content: [
          `**TIPPY Assesses — ${report.scopeTitle}**`,
          '',
          `**Overall Grade: ${scorecard.overallGrade}**`,
          `- WCAG 2.1 AA: ${scorecard.wcagScore}% (${scorecard.wcagPass ? 'Pass' : 'Fail'})`,
          `- UDL: ${scorecard.udlScore}% (${scorecard.udlLabel})`,
          `- Inclusion: ${scorecard.inclusionRating.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}`,
          '',
          `Found ${report.wcagFindings.length} WCAG issues, ${report.udlFindings.flatMap((f) => f.gaps).length} UDL gaps, and ${report.inclusionFindings.length} inclusion items.`,
          '',
          'The full report is displayed below. Review the recommendations tab for prioritized next steps.'
        ].join('\n')
      })
    } catch (err) {
      set({ isAssessing: false })
      const errorMsg = err instanceof Error ? err.message : 'Assessment failed'
      addMessage({ role: 'system', content: `Assessment error: ${errorMsg}` })
    }
  },

  clearAssessment: () => set({ assessReport: null }),

  setAutoAssessOnExport: (v: boolean) => {
    set({ autoAssessOnExport: v })
    persistAutoAssess(v)
  },

  // Send message — enhanced with KB retrieval, reasoning extraction, FERPA gating, walkthrough + assess detection
  sendMessage: async (text: string) => {
    const { addMessage, setGenerating, setError, showFerpaWarning, startWalkthrough } = get()

    // Check for FERPA concerns with cloud providers
    const aiSettings = useAppStore.getState().ai
    if (aiSettings.provider && aiSettings.provider !== 'ollama' && containsLearnerData(text)) {
      // Check if this is a re-send after acknowledgment (no pending message means fresh send)
      const { ferpaWarning } = get()
      if (!ferpaWarning.pendingMessage) {
        showFerpaWarning(aiSettings.provider, text)
        return
      }
    }

    // Add user message
    addMessage({ role: 'user', content: text })

    // Check for assessment trigger phrases
    if (isAssessTrigger(text)) {
      const { runAssesses } = get()
      // Determine scope from message
      const lower = text.toLowerCase()
      let scope: AssessesScope = 'course'
      if (lower.includes('lesson')) scope = 'lesson'
      else if (lower.includes('module')) scope = 'module'
      else if (lower.includes('block')) scope = 'block'
      runAssesses(scope)
      return
    }

    // Check for walkthrough trigger phrases
    const walkthroughMatch = detectWalkthroughTrigger(text)
    if (walkthroughMatch) {
      addMessage({
        role: 'assistant',
        content: `I can walk you through **${walkthroughMatch.title}** step by step! This walkthrough has ${walkthroughMatch.steps.length} steps and will highlight each part of the interface as we go.\n\nClick **Show Me** below to start, or keep chatting if you'd prefer a text explanation.`,
        walkthroughId: walkthroughMatch.id
      })
      return
    }

    setGenerating(true)
    setError(null)

    try {
      const provider = getProvider(aiSettings)

      // Gather context
      const context = getAppContext()

      // Build 4-layer system prompt with query for KB retrieval
      const systemPrompt = buildTippySystemPrompt(context, text)

      // Build conversation prompt from recent messages
      const recentMessages = get().messages.slice(-MAX_CONTEXT_MESSAGES)
      const conversationLines = recentMessages.map(
        (m) => `${m.role === 'user' ? 'User' : m.role === 'assistant' ? 'Tippy' : 'System'}: ${m.content}`
      )
      const prompt = conversationLines.join('\n\n')

      const response = await provider.generateText(prompt, systemPrompt)

      // Extract reasoning data from response
      const { cleanContent, reasoning } = extractReasoning(response)

      addMessage({ role: 'assistant', content: cleanContent, reasoning })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMsg)
      addMessage({ role: 'system', content: `Error: ${errorMsg}` })
    } finally {
      setGenerating(false)
    }
  }
}))
