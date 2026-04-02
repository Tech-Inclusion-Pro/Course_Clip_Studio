// ─── Tippy Error Watcher ───
// Headless component that watches for app errors and notifies Tippy

import { useEffect, useRef } from 'react'
import { useAIStore } from '@/stores/useAIStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { useTippyStore } from '@/stores/useTippyStore'

const DEBOUNCE_MS = 10_000 // Max 1 error notification per 10 seconds

export function TippyErrorWatcher(): null {
  const aiError = useAIStore((s) => s.lastError)
  const localeError = useLocaleStore((s) => s.error)
  const lastNotified = useRef(0)

  useEffect(() => {
    const error = aiError || localeError
    if (!error) return

    const now = Date.now()
    if (now - lastNotified.current < DEBOUNCE_MS) return
    lastNotified.current = now

    const { open, addMessage } = useTippyStore.getState()
    open()
    addMessage({
      role: 'system',
      content: `I noticed an error: ${error}. Would you like help resolving this?`
    })
  }, [aiError, localeError])

  return null
}
