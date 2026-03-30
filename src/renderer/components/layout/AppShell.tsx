import { Outlet } from 'react-router-dom'
import { SkipLink } from '@/components/ui/SkipLink'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { useTheme } from '@/hooks/useTheme'
import { useWorkspaceInit } from '@/hooks/useWorkspaceInit'
import { useAutoSave } from '@/hooks/useAutoSave'

export function AppShell(): JSX.Element {
  useTheme()
  useWorkspaceInit()
  useAutoSave()

  return (
    <>
      <SkipLink />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <TopBar />
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
