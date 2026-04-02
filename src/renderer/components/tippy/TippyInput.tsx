// ─── Tippy Chat Input ───

import { useState, useRef, useCallback, useEffect } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { useT } from '@/hooks/useT'

interface TippyInputProps {
  onSend: (text: string) => void
  isGenerating: boolean
}

export function TippyInput({ onSend, isGenerating }: TippyInputProps): JSX.Element {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const t = useT()

  const adjustHeight = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    const maxRows = 4
    const lineHeight = 20
    const maxHeight = lineHeight * maxRows + 16 // padding
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`
  }, [])

  useEffect(() => {
    adjustHeight()
  }, [text, adjustHeight])

  const handleSend = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed || isGenerating) return
    onSend(trimmed)
    setText('')
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }, [text, isGenerating, onSend])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSend()
      }
    },
    [handleSend]
  )

  return (
    <div
      className="flex items-end gap-2 p-3 border-t"
      style={{ borderColor: 'var(--border-default)' }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('tippy.placeholder', 'Ask Tippy anything...')}
        disabled={isGenerating}
        rows={1}
        aria-label={t('tippy.inputLabel', 'Message Tippy')}
        className="flex-1 resize-none rounded-lg px-3 py-2 text-sm leading-5 outline-none"
        style={{
          backgroundColor: 'var(--bg-muted)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-default)',
          minHeight: '36px'
        }}
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || isGenerating}
        aria-label={t('tippy.send', 'Send')}
        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: 'var(--brand-indigo)',
          color: '#ffffff'
        }}
      >
        {isGenerating ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
      </button>
    </div>
  )
}
