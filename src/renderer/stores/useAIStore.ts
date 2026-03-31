import { create } from 'zustand'
import type { InterviewAnswers, AIAction } from '@/lib/ai/types'
import { EMPTY_INTERVIEW } from '@/lib/ai/types'

export type AIView = 'home' | 'interview' | 'actions' | 'result'

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  action?: AIAction
}

interface AIState {
  // View state
  view: AIView
  interviewStep: number

  // Interview
  interviewAnswers: InterviewAnswers
  interviewComplete: boolean

  // Master key
  masterKeyFileName: string | null

  // Generation
  isGenerating: boolean
  currentAction: AIAction | null
  lastResult: string | null
  lastError: string | null

  // Message log
  messages: AIMessage[]

  // ─── Actions ───

  // Navigation
  setView: (view: AIView) => void
  setInterviewStep: (step: number) => void

  // Interview
  updateInterviewAnswer: (field: keyof InterviewAnswers, value: string) => void
  completeInterview: () => void
  resetInterview: () => void

  // Master key
  setMasterKey: (content: string, fileName: string) => void
  clearMasterKey: () => void

  // Generation
  startGeneration: (action: AIAction) => void
  finishGeneration: (result: string) => void
  failGeneration: (error: string) => void

  // Messages
  addMessage: (msg: Omit<AIMessage, 'id' | 'timestamp'>) => void
  clearMessages: () => void

  // Reset
  resetAI: () => void
}

let msgCounter = 0

export const useAIStore = create<AIState>((set) => ({
  // Defaults
  view: 'home',
  interviewStep: 0,
  interviewAnswers: { ...EMPTY_INTERVIEW },
  interviewComplete: false,
  masterKeyFileName: null,
  isGenerating: false,
  currentAction: null,
  lastResult: null,
  lastError: null,
  messages: [],

  // Navigation
  setView: (view) => set({ view }),
  setInterviewStep: (step) => set({ interviewStep: step }),

  // Interview
  updateInterviewAnswer: (field, value) =>
    set((s) => ({
      interviewAnswers: { ...s.interviewAnswers, [field]: value }
    })),

  completeInterview: () =>
    set({ interviewComplete: true, view: 'actions' }),

  resetInterview: () =>
    set({
      interviewAnswers: { ...EMPTY_INTERVIEW },
      interviewComplete: false,
      interviewStep: 0,
      view: 'interview'
    }),

  // Master key
  setMasterKey: (content, fileName) =>
    set((s) => ({
      masterKeyFileName: fileName,
      interviewAnswers: { ...s.interviewAnswers, masterKeyContent: content }
    })),

  clearMasterKey: () =>
    set((s) => ({
      masterKeyFileName: null,
      interviewAnswers: { ...s.interviewAnswers, masterKeyContent: null }
    })),

  // Generation
  startGeneration: (action) =>
    set({ isGenerating: true, currentAction: action, lastError: null, lastResult: null }),

  finishGeneration: (result) =>
    set({ isGenerating: false, lastResult: result }),

  failGeneration: (error) =>
    set({ isGenerating: false, currentAction: null, lastError: error }),

  // Messages
  addMessage: (msg) =>
    set((s) => ({
      messages: [
        ...s.messages,
        {
          ...msg,
          id: `msg-${++msgCounter}-${Date.now()}`,
          timestamp: new Date().toISOString()
        }
      ]
    })),

  clearMessages: () => set({ messages: [] }),

  // Reset
  resetAI: () =>
    set({
      view: 'home',
      interviewStep: 0,
      interviewAnswers: { ...EMPTY_INTERVIEW },
      interviewComplete: false,
      masterKeyFileName: null,
      isGenerating: false,
      currentAction: null,
      lastResult: null,
      lastError: null,
      messages: []
    })
}))
