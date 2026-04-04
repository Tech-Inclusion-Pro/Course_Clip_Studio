// ─── Tippy Chat Panel ───

import { useRef, useEffect, useCallback, useState } from 'react'
import { X, Save, Trash2, FolderOpen } from 'lucide-react'
import { useTippyStore } from '@/stores/useTippyStore'
import { TippyMessage } from './TippyMessage'
import { TippyInput } from './TippyInput'
import { FerpaCloudWarning } from './FerpaCloudWarning'
import { TippyAssessesReport } from './TippyAssessesReport'
import { useT } from '@/hooks/useT'

export function TippyPanel(): JSX.Element | null {
  const isOpen = useTippyStore((s) => s.isOpen)
  const messages = useTippyStore((s) => s.messages)
  const isGenerating = useTippyStore((s) => s.isGenerating)
  const position = useTippyStore((s) => s.position)
  const savedSessions = useTippyStore((s) => s.savedSessions)
  const ferpaWarning = useTippyStore((s) => s.ferpaWarning)
  const close = useTippyStore((s) => s.close)
  const sendMessage = useTippyStore((s) => s.sendMessage)
  const clearMessages = useTippyStore((s) => s.clearMessages)
  const saveSession = useTippyStore((s) => s.saveSession)
  const loadSession = useTippyStore((s) => s.loadSession)
  const deleteSession = useTippyStore((s) => s.deleteSession)
  const startTour = useTippyStore((s) => s.startTour)
  const acknowledgeFerpa = useTippyStore((s) => s.acknowledgeFerpa)
  const dismissFerpaWarning = useTippyStore((s) => s.dismissFerpaWarning)
  const assessReport = useTippyStore((s) => s.assessReport)
  const isAssessing = useTippyStore((s) => s.isAssessing)
  const runAssesses = useTippyStore((s) => s.runAssesses)

  const panelRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [showSessions, setShowSessions] = useState(false)
  const t = useT()

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Escape key closes
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        close()
      }
    },
    [isOpen, close]
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Click outside closes
  useEffect(() => {
    if (!isOpen) return
    const handle = (e: MouseEvent): void => {
      const target = e.target as Node
      if (panelRef.current && !panelRef.current.contains(target)) {
        // Don't close if clicking the Tippy button
        const btn = document.getElementById('tippy-fab')
        if (btn?.contains(target)) return
        close()
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [isOpen, close])

  // Focus trap: focus panel on open
  useEffect(() => {
    if (isOpen && panelRef.current) {
      panelRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  // Position panel: open toward center of screen
  const panelWidth = 360
  const panelHeight = 500
  const vw = window.innerWidth
  const vh = window.innerHeight

  // Anchor near button position
  const openRight = position.x < vw / 2
  const openUp = position.y > vh / 2

  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9997,
    width: `${panelWidth}px`,
    height: `${panelHeight}px`,
    maxHeight: '70vh',
    ...(openRight
      ? { left: `${position.x}px` }
      : { right: `${vw - position.x - 52}px` }),
    ...(openUp
      ? { bottom: `${vh - position.y + 12}px` }
      : { top: `${position.y + 64}px` }),
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border-default)',
    borderRadius: '1rem',
    boxShadow: 'var(--shadow-xl)',
    display: 'flex',
    flexDirection: 'column',
    animation: 'slideUp 200ms ease-out'
  }

  function handleQuickAction(action: string): void {
    switch (action) {
      case 'tour':
        startTour()
        sendMessage("Give me a tour of Course Clip Studio!")
        break
      case 'start':
        sendMessage("Help me get started creating my first course.")
        break
      case 'context':
        sendMessage("What can I do from where I am right now?")
        break
      case 'assess':
        runAssesses('course')
        break
    }
  }

  function handleSaveSession(): void {
    const name = `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    saveSession(name)
  }

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label={t('tippy.ariaLabel', 'Tippy AI Assistant')}
      tabIndex={-1}
      style={panelStyle}
      className="outline-none"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b shrink-0"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {t('tippy.title', 'Tippy')}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSessions(!showSessions)}
            className="p-1.5 rounded cursor-pointer transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label={t('tippy.sessions', 'Sessions')}
            title="Sessions"
          >
            <FolderOpen size={14} />
          </button>
          <button
            onClick={handleSaveSession}
            className="p-1.5 rounded cursor-pointer transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label={t('tippy.save', 'Save session')}
            title="Save session"
            disabled={messages.length === 0}
          >
            <Save size={14} />
          </button>
          <button
            onClick={clearMessages}
            className="p-1.5 rounded cursor-pointer transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label={t('tippy.clear', 'Clear chat')}
            title="Clear chat"
          >
            <Trash2 size={14} />
          </button>
          <button
            onClick={close}
            className="p-1.5 rounded cursor-pointer transition-colors"
            style={{ color: 'var(--text-tertiary)' }}
            aria-label={t('tippy.close', 'Close')}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Session list dropdown */}
      {showSessions && (
        <div
          className="px-4 py-2 border-b max-h-32 overflow-y-auto shrink-0"
          style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--bg-muted)' }}
        >
          {savedSessions.length === 0 ? (
            <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
              {t('tippy.noSessions', 'No saved sessions')}
            </p>
          ) : (
            savedSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-1"
              >
                <button
                  onClick={() => {
                    loadSession(session.id)
                    setShowSessions(false)
                  }}
                  className="text-xs truncate flex-1 text-left cursor-pointer hover:underline"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {session.name} ({session.messages.length} msgs)
                </button>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="p-0.5 cursor-pointer shrink-0"
                  style={{ color: 'var(--text-tertiary)' }}
                  aria-label={`Delete session ${session.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p
              className="text-sm text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('tippy.greeting', "Hi! I'm Tippy, your AI assistant. How can I help?")}
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[240px]">
              <QuickActionButton
                label={t('tippy.quickTour', 'Give me a tour')}
                onClick={() => handleQuickAction('tour')}
              />
              <QuickActionButton
                label={t('tippy.quickStart', 'Help me get started')}
                onClick={() => handleQuickAction('start')}
              />
              <QuickActionButton
                label={t('tippy.quickContext', 'What can I do here?')}
                onClick={() => handleQuickAction('context')}
              />
              <QuickActionButton
                label={t('tippy.quickAssess', 'Assess my course')}
                onClick={() => handleQuickAction('assess')}
              />
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <TippyMessage key={msg.id} message={msg} />
            ))}
            {(isGenerating || isAssessing) && (
              <div className="flex gap-2 my-2">
                <div className="shrink-0 w-7 h-7" />
                <div
                  className="px-3 py-2 rounded-xl text-sm"
                  style={{
                    backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-tertiary)'
                  }}
                >
                  <span className="inline-flex gap-1">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </div>
              </div>
            )}
            {/* Assessment report */}
            {assessReport && (
              <div className="my-3">
                <TippyAssessesReport report={assessReport} />
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <TippyInput onSend={sendMessage} isGenerating={isGenerating} />

      {/* FERPA Cloud Warning Modal */}
      {ferpaWarning.visible && (
        <FerpaCloudWarning
          providerName={ferpaWarning.providerName}
          actionDescription="send a message that may contain learner data"
          onAcknowledge={acknowledgeFerpa}
          onCancel={dismissFerpaWarning}
        />
      )}
    </div>
  )
}

function QuickActionButton({
  label,
  onClick
}: {
  label: string
  onClick: () => void
}): JSX.Element {
  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 rounded-lg text-sm text-left transition-colors cursor-pointer"
      style={{
        backgroundColor: 'var(--bg-muted)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-default)'
      }}
    >
      {label}
    </button>
  )
}
