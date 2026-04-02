import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { DashboardView } from '@/views/DashboardView'
import { EditorView } from '@/views/EditorView'
import { PreviewView } from '@/views/PreviewView'
import { SettingsView } from '@/views/SettingsView'
import { PublishView } from '@/views/PublishView'
import { SignInView } from '@/views/SignInView'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'
import { TranslationBanner } from '@/components/common/TranslationBanner'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { ROUTES } from '@/lib/constants'

function AuthGate({ children }: { children: React.ReactNode }): JSX.Element {
  const authLoaded = useAuthStore((s) => s.authLoaded)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const onboardingComplete = useAuthStore((s) => s.onboardingComplete)
  const loadAuthState = useAuthStore((s) => s.loadAuthState)

  useEffect(() => {
    loadAuthState()
  }, [loadAuthState])

  if (!authLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center gradient-primary">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          <p className="text-sm text-white/70">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <SignInView />
  }

  if (!onboardingComplete) {
    return <OnboardingWizard />
  }

  return <>{children}</>
}

export function App(): JSX.Element {
  // Hydrate saved language on startup
  useEffect(() => {
    window.electronAPI?.settings.get('uiLanguage').then((lang: unknown) => {
      if (typeof lang === 'string' && lang !== 'en') {
        useLocaleStore.getState().setLanguage(lang)
      }
    })
  }, [])

  return (
    <AuthGate>
      <TranslationBanner />
      <Routes>
        <Route element={<AppShell />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardView />} />
          <Route path={ROUTES.EDITOR} element={<EditorView />} />
          <Route path={ROUTES.PREVIEW} element={<PreviewView />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsView />} />
          <Route path={ROUTES.PUBLISH} element={<PublishView />} />
        </Route>
      </Routes>
    </AuthGate>
  )
}
