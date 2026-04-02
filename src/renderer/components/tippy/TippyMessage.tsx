// ─── Tippy Chat Message Bubble ───

import type { TippyMessage as TippyMessageType } from '@/stores/useTippyStore'
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
        className="relative group max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed"
        style={{
          backgroundColor: isUser ? 'var(--brand-indigo)' : 'var(--bg-surface)',
          color: isUser ? '#ffffff' : 'var(--text-primary)',
          border: isUser ? 'none' : '1px solid var(--border-default)'
        }}
      >
        {isUser ? message.content : renderMarkdown(message.content)}

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
