import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useHotkeyStore } from '@/stores/useHotkeyStore'
import { isTextInputFocused } from '@/lib/hotkey-utils'
import type { HotkeyContext } from '@/types/hotkeys'

function getRouteContext(pathname: string): HotkeyContext {
  if (pathname.includes('/editor')) return 'slide-editor'
  if (pathname.includes('/record')) return 'recording-panel'
  return 'global'
}

function isModalOpen(): boolean {
  return document.querySelector('[role="dialog"], [aria-modal="true"], .modal-overlay') !== null
}

function detectContext(pathname: string): HotkeyContext {
  if (isModalOpen()) return 'modal-open'
  if (isTextInputFocused()) return 'text-focused'
  return getRouteContext(pathname)
}

export function useHotkeyContext(): void {
  const location = useLocation()
  const setActiveContext = useHotkeyStore((s) => s.setActiveContext)

  useEffect(() => {
    function update(): void {
      setActiveContext(detectContext(location.pathname))
    }

    update()

    document.addEventListener('focusin', update)
    document.addEventListener('focusout', update)

    // Watch for modals appearing/disappearing
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('focusin', update)
      document.removeEventListener('focusout', update)
      observer.disconnect()
    }
  }, [location.pathname, setActiveContext])
}
