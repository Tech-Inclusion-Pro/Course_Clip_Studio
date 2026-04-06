import { useMemo } from 'react'
import { Outlet } from 'react-router-dom'
import { SkipLink } from '@/components/ui/SkipLink'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { UpdateBanner } from './UpdateBanner'
import { useTheme } from '@/hooks/useTheme'
import { useWorkspaceInit } from '@/hooks/useWorkspaceInit'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useDeepLink } from '@/hooks/useDeepLink'
import { useAccessibility } from '@/hooks/useAccessibility'
import { useHotkeyContext } from '@/hooks/useHotkeyContext'
import { useGlobalHotkeys } from '@/hooks/useGlobalHotkeys'
import { AccessibilityWidget } from '@/components/ui/AccessibilityWidget'
import { HotkeyReferencePanel } from '@/components/ui/HotkeyReferencePanel'
import { TippyButton } from '@/components/tippy/TippyButton'
import { TippyPanel } from '@/components/tippy/TippyPanel'
import { TippyTour } from '@/components/tippy/TippyTour'
import { TippyErrorWatcher } from '@/components/tippy/TippyErrorWatcher'
import { useHotkeyStore } from '@/stores/useHotkeyStore'

export function AppShell(): JSX.Element {
  useTheme()
  useWorkspaceInit()
  useAutoSave()
  useDeepLink()
  useAccessibility()
  useHotkeyContext()

  const toggleReference = useHotkeyStore((s) => s.toggleReference)

  const handlers = useMemo(
    () => ({ 'global.hotkeyReference': toggleReference }),
    [toggleReference]
  )

  useGlobalHotkeys(handlers)

  return (
    <>
      <SkipLink />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
          <UpdateBanner />
          <main
            id="main-content"
            className="flex-1 overflow-auto p-6 bg-[var(--bg-app)]"
            role="main"
            tabIndex={-1}
          >
            <Outlet />
          </main>
        </div>
      </div>
      <AccessibilityWidget />
      <TippyButton />
      <TippyPanel />
      <TippyTour />
      <TippyErrorWatcher />
      <HotkeyReferencePanel />
    </>
  )
}
