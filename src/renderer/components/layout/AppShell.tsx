import { Outlet } from 'react-router-dom'
import { SkipLink } from '@/components/ui/SkipLink'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { UpdateBanner } from './UpdateBanner'
import { useTheme } from '@/hooks/useTheme'
import { useWorkspaceInit } from '@/hooks/useWorkspaceInit'
import { useAutoSave } from '@/hooks/useAutoSave'
import { useDeepLink } from '@/hooks/useDeepLink'

export function AppShell(): JSX.Element {
  useTheme()
  useWorkspaceInit()
  useAutoSave()
  useDeepLink()

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
    </>
  )
}
