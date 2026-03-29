import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardView } from '@/views/DashboardView'
import { EditorView } from '@/views/EditorView'
import { PreviewView } from '@/views/PreviewView'
import { SettingsView } from '@/views/SettingsView'
import { PublishView } from '@/views/PublishView'
import { ROUTES } from '@/lib/constants'

export function App(): JSX.Element {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={ROUTES.DASHBOARD} element={<DashboardView />} />
        <Route path={ROUTES.EDITOR} element={<EditorView />} />
        <Route path={ROUTES.PREVIEW} element={<PreviewView />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsView />} />
        <Route path={ROUTES.PUBLISH} element={<PublishView />} />
      </Route>
    </Routes>
  )
}
