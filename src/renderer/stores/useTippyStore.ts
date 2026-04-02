// ─── Tippy AI Assistant Store ───

import { create } from 'zustand'
import { uid } from '@/lib/uid'
import { getProvider } from '@/lib/ai/ai-client'
import { useAppStore } from './useAppStore'
import { getAppContext } from '@/lib/tippy/tippyContext'
import { buildTippySystemPrompt } from '@/lib/tippy/tippySystemPrompt'

export interface TippyMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
}

interface TippySession {
  id: string
  name: string
  messages: TippyMessage[]
  savedAt: number
}

interface TippyState {
  // Panel
  isOpen: boolean
  position: { x: number; y: number }

  // Chat
  messages: TippyMessage[]
  isGenerating: boolean
  error: string | null

  // Tour
  tourActive: boolean
  tourStepIndex: number

  // Sessions
  savedSessions: TippySession[]

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

  // Tour actions
  startTour: () => void
  nextTourStep: () => void
  prevTourStep: () => void
  endTour: () => void

  // Session actions
  saveSession: (name: string) => void
  loadSession: (id: string) => void
  deleteSession: (id: string) => void

  // Send message (calls AI)
  sendMessage: (text: string) => Promise<void>
}

const STORAGE_KEY_MESSAGES = 'tippy_messages'
const STORAGE_KEY_SESSIONS = 'tippy_sessions'
const STORAGE_KEY_POSITION = 'tippy_position'
const MAX_CONTEXT_MESSAGES = 20

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

export const useTippyStore = create<TippyState>((set, get) => ({
  isOpen: false,
  position: loadPosition(),
  messages: loadMessages(),
  isGenerating: false,
  error: null,
  tourActive: false,
  tourStepIndex: 0,
  savedSessions: loadSessions(),

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
      return { messages }
    })
  },

  clearMessages: () => {
    set({ messages: [] })
    persistMessages([])
  },

  setGenerating: (v) => set({ isGenerating: v }),
  setError: (err) => set({ error: err }),

  // Tour
  startTour: () => set({ tourActive: true, tourStepIndex: 0 }),
  nextTourStep: () => set((s) => ({ tourStepIndex: s.tourStepIndex + 1 })),
  prevTourStep: () => set((s) => ({ tourStepIndex: Math.max(0, s.tourStepIndex - 1) })),
  endTour: () => set({ tourActive: false, tourStepIndex: 0 }),

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

  // Send message
  sendMessage: async (text: string) => {
    const { addMessage, setGenerating, setError } = get()

    // Add user message
    addMessage({ role: 'user', content: text })
    setGenerating(true)
    setError(null)

    try {
      const aiSettings = useAppStore.getState().ai
      const provider = getProvider(aiSettings)

      // Gather context
      const context = getAppContext()
      const systemPrompt = buildTippySystemPrompt(context)

      // Build conversation prompt from recent messages
      const recentMessages = get().messages.slice(-MAX_CONTEXT_MESSAGES)
      const conversationLines = recentMessages.map(
        (m) => `${m.role === 'user' ? 'User' : m.role === 'assistant' ? 'Tippy' : 'System'}: ${m.content}`
      )
      const prompt = conversationLines.join('\n\n')

      const response = await provider.generateText(prompt, systemPrompt)

      addMessage({ role: 'assistant', content: response })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An unknown error occurred'
      setError(errorMsg)
      addMessage({ role: 'system', content: `Error: ${errorMsg}` })
    } finally {
      setGenerating(false)
    }
  }
}))
