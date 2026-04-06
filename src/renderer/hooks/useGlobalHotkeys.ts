import { useEffect, useRef } from 'react'
import { useHotkeyStore } from '@/stores/useHotkeyStore'
import { matchesBinding, getPlatform, isTextInputFocused } from '@/lib/hotkey-utils'

// Hotkeys that should work even when a text input is focused
const TEXT_SAFE_ALLOWLIST = new Set([
  'global.undo',
  'global.redo',
  'global.save',
  'global.saveAs',
  'global.hotkeyReference'
])

export function useGlobalHotkeys(handlers: Record<string, () => void>): void {
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  useEffect(() => {
    const platform = getPlatform()

    function onKeyDown(event: KeyboardEvent): void {
      const state = useHotkeyStore.getState()
      const { keymap, activeContext } = state
      const textFocused = isTextInputFocused()

      for (const [hotkeyId, handler] of Object.entries(handlersRef.current)) {
        const definition = keymap[hotkeyId]
        if (!definition) continue

        const binding = definition.current[platform]
        if (!binding) continue

        if (!matchesBinding(event, binding)) continue

        // Context gating: skip if in text-focused and not in allowlist
        if (textFocused && !TEXT_SAFE_ALLOWLIST.has(hotkeyId)) continue

        // Context gating: skip non-global hotkeys if context doesn't match
        if (definition.context !== 'global' && definition.context !== activeContext) continue

        // Skip if modal is open and this isn't a global action
        if (activeContext === 'modal-open' && definition.context !== 'global') continue

        event.preventDefault()
        event.stopPropagation()
        handler()
        return
      }
    }

    // Use capture phase to intercept before other handlers
    document.addEventListener('keydown', onKeyDown, true)
    return () => document.removeEventListener('keydown', onKeyDown, true)
  }, [])
}
