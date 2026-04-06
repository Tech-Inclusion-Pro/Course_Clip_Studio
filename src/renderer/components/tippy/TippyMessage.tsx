// ─── Tippy Chat Message Bubble ───
// Phase 3: includes reasoning transparency, "Show Me" walkthrough button.

import type { TippyMessage as TippyMessageType } from '@/stores/useTippyStore'
import { useTippyStore, AI_FEATURE_AREAS } from '@/stores/useTippyStore'
import { TippyReasoningPanel } from './TippyReasoningPanel'
import TippyIcon from '@/assets/tippy/Tippy_Icon.png'

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/** Minimal markdown rendering: bold, links, inline code, lists */
function renderMarkdown(text: string): JSX.Element {
  const lines = text.split('\n')
  const elements: JSX.Element[] = []
  let listItems: string[] = []

  function flushList(): void {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="list-disc pl-4 my-1 space-y-0.5">
          {listItems.map((item, i) => (
            <li key={i}>{inlineMarkdown(item)}</li>
          ))}
        </ul>
      )
      listItems = []
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const listMatch = line.match(/^[-*•]\s+(.+)/)
    if (listMatch) {
      listItems.push(listMatch[1])
      continue
    }

    flushList()

    if (line.trim() === '') {
      elements.push(<br key={`br-${i}`} />)
    } else {
      elements.push(
        <p key={`p-${i}`} className="my-0.5">
          {inlineMarkdown(line)}
        </p>
      )
    }
  }
  flushList()

  return <>{elements}</>
}

function inlineMarkdown(text: string): JSX.Element {
  // Process bold, links, inline code
  const parts: (string | JSX.Element)[] = []
  let remaining = text
  let keyIdx = 0

  while (remaining.length > 0) {
    // Inline code
    const codeMatch = remaining.match(/`([^`]+)`/)
    // Bold
    const boldMatch = remaining.match(/\*\*([^*]+)\*\*/)
    // Link
    const linkMatch = remaining.match(/\[([^\]]+)\]\(([^)]+)\)/)

    // Find earliest match
    const matches = [
      codeMatch && { type: 'code', match: codeMatch },
      boldMatch && { type: 'bold', match: boldMatch },
      linkMatch && { type: 'link', match: linkMatch }
    ].filter(Boolean) as Array<{ type: string; match: RegExpMatchArray }>

    if (matches.length === 0) {
      parts.push(remaining)
      break
    }

    const earliest = matches.reduce((min, m) =>
      (m.match.index ?? Infinity) < (min.match.index ?? Infinity) ? m : min
    )

    const idx = earliest.match.index ?? 0
    if (idx > 0) parts.push(remaining.slice(0, idx))

    if (earliest.type === 'code') {
      parts.push(
        <code
          key={`c-${keyIdx++}`}
          className="px-1 py-0.5 rounded text-xs"
          style={{ backgroundColor: 'var(--bg-muted)', fontFamily: 'monospace' }}
        >
          {earliest.match[1]}
        </code>
      )
    } else if (earliest.type === 'bold') {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold">
          {earliest.match[1]}
        </strong>
      )
    } else if (earliest.type === 'link') {
      parts.push(
        <a
          key={`a-${keyIdx++}`}
          href={earliest.match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
          style={{ color: 'var(--brand-indigo)' }}
        >
          {earliest.match[1]}
        </a>
      )
    }

    remaining = remaining.slice(idx + earliest.match[0].length)
  }

  return <>{parts}</>
}

export function TippyMessage({ message }: { message: TippyMessageType }): JSX.Element {
  const reasoningViewCount = useTippyStore((s) => s.reasoningViewCount)
  const startWalkthrough = useTippyStore((s) => s.startWalkthrough)

  if (message.role === 'system') {
    return (
      <div className="flex justify-center my-2">
        <div
          className="px-3 py-1.5 rounded-lg text-xs max-w-[85%] text-center"
          style={{ backgroundColor: 'var(--bg-muted)', color: 'var(--text-tertiary)' }}
        >
          {message.content}
        </div>
      </div>
    )
  }

  const isUser = message.role === 'user'

  return (
    <div className={`flex gap-2 my-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="shrink-0 w-7 h-7 rounded-full overflow-hidden mt-1">
          <img src={TippyIcon} alt="Tippy" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Bubble */}
      <div
        className="relative group max-w-[80%]"
      >
        <div
          className="px-3 py-2 rounded-xl text-sm leading-relaxed"
          style={{
            backgroundColor: isUser ? 'var(--brand-indigo)' : 'var(--bg-surface)',
            color: isUser ? '#ffffff' : 'var(--text-primary)',
            border: isUser ? 'none' : '1px solid var(--border-default)'
          }}
        >
          {isUser ? message.content : renderMarkdown(message.content)}
        </div>

        {/* "Show Me" walkthrough button (when TIPPY offers a walkthrough) */}
        {!isUser && message.walkthroughId && (
          <button
            onClick={() => startWalkthrough(message.walkthroughId!)}
            className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors"
            style={{
              backgroundColor: '#8B0000',
              color: '#fff',
              border: 'none'
            }}
            type="button"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            Show Me
          </button>
        )}

        {/* Assess course picker buttons */}
        {!isUser && (message as any).assessCourseOptions && (
          <div className="grid grid-cols-2 gap-1.5 mt-2">
            {(() => {
              const courseStore = require('@/stores/useCourseStore').useCourseStore
              return courseStore.getState().courses.map((course: any) => (
                <button
                  key={course.id}
                  onClick={() => {
                    const scope = useTippyStore.getState().pendingAssessScope || 'course'
                    useTippyStore.getState().setAssessCourseSelection(false)
                    useTippyStore.getState().setPendingAssessScope(null)
                    courseStore.getState().setActiveCourse(course.id)
                    useTippyStore.getState().runAssesses(scope)
                  }}
                  className="px-2 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--bg-muted)',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)'
                  }}
                  type="button"
                >
                  {course.meta?.title || 'Untitled Course'}
                </button>
              ))
            })()}
          </div>
        )}

        {/* AI feature "Show Me" buttons */}
        {!isUser && (message as any).aiFeatureShowMe && (
          <div className="flex flex-col gap-1.5 mt-2">
            {AI_FEATURE_AREAS.map((area) => (
              <button
                key={area.id}
                onClick={() => {
                  useTippyStore.getState().addMessage({
                    role: 'assistant',
                    content: `**${area.label}**\n\n${area.description}`
                  })
                  setTimeout(() => {
                    useTippyStore.setState({ helpHighlightSelector: area.dataTourSelector } as any)
                  }, 400)
                  setTimeout(() => {
                    useTippyStore.setState({ helpHighlightSelector: null } as any)
                  }, 8400)
                }}
                className="flex items-center gap-1.5 w-full px-3 py-2 rounded-lg text-xs text-left transition-colors cursor-pointer hover:opacity-80"
                style={{
                  backgroundColor: '#8B0000',
                  color: '#fff',
                  border: 'none'
                }}
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                </svg>
                {area.label}
              </button>
            ))}
          </div>
        )}

        {/* Reasoning transparency panel (assistant messages only) */}
        {!isUser && message.reasoning && (
          <TippyReasoningPanel
            reasoning={message.reasoning}
            showFullAINote={reasoningViewCount <= 3}
          />
        )}

        {/* Cloud provider indicator for assistant messages */}
        {!isUser && (
          <CloudIndicator />
        )}

        {/* Timestamp on hover */}
        <span
          className="absolute -bottom-5 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap"
          style={{
            color: 'var(--text-tertiary)',
            [isUser ? 'right' : 'left']: 0
          }}
        >
          {formatTime(message.timestamp)}
        </span>
      </div>
    </div>
  )
}

/** Small cloud indicator showing when responses come from a cloud provider */
function CloudIndicator(): JSX.Element | null {
  // Import useAppStore lazily to avoid circular deps
  const { useAppStore: appStore } = require('@/stores/useAppStore')
  const provider = appStore.getState().ai.provider

  if (!provider || provider === 'ollama') return null

  return (
    <span
      className="inline-flex items-center gap-1 mt-1 text-[10px]"
      style={{ color: 'var(--text-tertiary)' }}
      title={`Response generated via ${provider} (cloud)`}
    >
      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.35 10.04A7.49 7.49 0 0012 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 000 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
      </svg>
      {provider}
    </span>
  )
}
