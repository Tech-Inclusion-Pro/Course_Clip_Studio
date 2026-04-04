import { useState, useEffect } from 'react'
import {
  Settings,
  Palette,
  Brain,
  PersonStanding,
  User,
  Globe,
  Plus,
  Trash2,
  Check,
  TestTube,
  FolderOpen,
  RefreshCw,
  Info,
  Lock,
  Image,
  Video,
  BarChart3,
  Mic,
  Workflow,
  Clapperboard,
  Sigma,
  FileInput,
  FolderSearch,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  X,
  MessageCircle
} from 'lucide-react'
import { useAppStore, type ThemeMode } from '@/stores/useAppStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { LANGUAGES } from '@/lib/i18n/languages'
import { useT } from '@/hooks/useT'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { uid } from '@/lib/uid'
import { persistWorkspacePath, loadWorkspace } from '@/lib/workspace'
import type { BrandKit } from '@/types/course'
import { GoogleFontPicker } from '@/components/editor/GoogleFontPicker'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { FieldRow } from '@/components/ui/FieldRow'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { ColorInput } from '@/components/ui/ColorInput'
import { AnalyticsSettingsTab } from '@/components/settings/AnalyticsSettingsTab'
import { TippySettingsPanel } from '@/components/tippy/TippySettingsPanel'
import type { LRSSettings } from '@/types/course'

type SettingsTab = 'general' | 'brand' | 'ai' | 'accessibility' | 'analytics' | 'tippy'

const TABS: Array<{ id: SettingsTab; label: string; icon: typeof Settings }> = [
  { id: 'general', label: 'General', icon: User },
  { id: 'brand', label: 'Brand Kits', icon: Palette },
  { id: 'ai', label: 'AI / LLM', icon: Brain },
  { id: 'accessibility', label: 'Accessibility', icon: PersonStanding },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'tippy', label: 'TIPPY', icon: MessageCircle }
]

export function SettingsView(): JSX.Element {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-6">
        Settings
      </h2>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border-default)]" role="tablist" aria-label="Settings sections">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={isActive}
              className={`
                flex items-center gap-2 px-4 py-2.5 text-sm font-[var(--font-weight-medium)]
                border-b-2 transition-colors cursor-pointer
                ${isActive
                  ? 'border-[var(--brand-magenta)] text-[var(--text-brand)]'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                }
              `}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div role="tabpanel">
        {activeTab === 'general' && <GeneralSettings />}
        {activeTab === 'brand' && <BrandKitSettings />}
        {activeTab === 'ai' && <AISettingsPanel />}
        {activeTab === 'accessibility' && <AccessibilitySettingsPanel />}
        {activeTab === 'analytics' && <AnalyticsSettings />}
        {activeTab === 'tippy' && <TippySettingsPanel />}
      </div>
    </div>
  )
}

// ─── General Settings ───

function GeneralSettings(): JSX.Element {
  const t = useT()
  const isTranslating = useLocaleStore((s) => s.isTranslating)
  const authorName = useAppStore((s) => s.authorName)
  const setAuthorName = useAppStore((s) => s.setAuthorName)
  const defaultLanguage = useAppStore((s) => s.defaultLanguage)
  const setDefaultLanguage = useAppStore((s) => s.setDefaultLanguage)
  const autoSaveIntervalMs = useAppStore((s) => s.autoSaveIntervalMs)
  const setAutoSaveInterval = useAppStore((s) => s.setAutoSaveInterval)
  const defaultExportFolder = useAppStore((s) => s.defaultExportFolder)
  const setDefaultExportFolder = useAppStore((s) => s.setDefaultExportFolder)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const brandKits = useAppStore((s) => s.brandKits)
  const uiLanguage = useAppStore((s) => s.uiLanguage)
  const setUILanguage = useAppStore((s) => s.setUILanguage)

  return (
    <div className="space-y-6">
      <SessionCard />

      <SettingsCard title="Author" icon={User}>
        <FieldRow label="Author Name" description="Used in collaborator notes and certificates">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-64 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard title={t('settings.general.uiLanguage', 'UI Language')} icon={Globe}>
        <FieldRow label={t('settings.general.uiLanguage', 'UI Language')} description={t('settings.general.uiLanguageDescription', 'Language for the application interface')}>
          <div className="flex items-center gap-2">
            <select
              value={uiLanguage}
              disabled={isTranslating}
              onChange={(e) => {
                const lang = e.target.value
                setUILanguage(lang)
                useLocaleStore.getState().setLanguage(lang)
              }}
              className="w-52 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] disabled:opacity-50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.nativeName} — {lang.name}
                </option>
              ))}
            </select>
            {isTranslating && (
              <span className="text-xs text-[var(--text-tertiary)] animate-pulse">Translating...</span>
            )}
          </div>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Preferences" icon={Settings}>
        <FieldRow label="Default Language" description="Language for new courses">
          <select
            value={defaultLanguage}
            onChange={(e) => setDefaultLanguage(e.target.value)}
            className="w-40 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="pt">Portuguese</option>
            <option value="ja">Japanese</option>
            <option value="zh">Chinese</option>
            <option value="ko">Korean</option>
          </select>
        </FieldRow>
        <FieldRow label="Auto-save Interval" description="How often to auto-snapshot while editing">
          <select
            value={autoSaveIntervalMs}
            onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
            className="w-40 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value={60000}>1 minute</option>
            <option value={180000}>3 minutes</option>
            <option value={300000}>5 minutes</option>
            <option value={600000}>10 minutes</option>
          </select>
        </FieldRow>
        <FieldRow label="Default Export Folder" description="Where exported files are saved">
          <input
            type="text"
            value={defaultExportFolder ?? ''}
            onChange={(e) => setDefaultExportFolder(e.target.value || null)}
            className="w-64 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="~/Documents/exports"
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Appearance" icon={Palette}>
        <FieldRow label="Theme" description="Controls the authoring UI appearance">
          <div className="flex flex-wrap gap-1">
            {(['system', 'light', 'dark', 'sepia', 'midnight', 'forest', 'ocean'] as ThemeMode[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`
                  px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md border cursor-pointer transition-colors
                  ${theme === t
                    ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                  }
                `}
                aria-pressed={theme === t}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </FieldRow>
        {brandKits.length > 0 && (
          <FieldRow label="Brand Kit Themes" description="Apply your brand colors as a theme">
            <div className="flex flex-wrap gap-1">
              {brandKits.map((kit) => (
                <button
                  key={kit.id}
                  onClick={() => setTheme(`brand-${kit.id}`)}
                  className={`
                    flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md border cursor-pointer transition-colors
                    ${theme === `brand-${kit.id}`
                      ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
                      : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    }
                  `}
                  aria-pressed={theme === `brand-${kit.id}`}
                >
                  <span className="flex gap-0.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: kit.primaryColor }} />
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: kit.secondaryColor }} />
                  </span>
                  {kit.name}
                </button>
              ))}
            </div>
          </FieldRow>
        )}
      </SettingsCard>

      <WorkspaceFolderSettings />

      <AboutAndUpdates />
    </div>
  )
}

// ─── About & Updates ───

function AboutAndUpdates(): JSX.Element {
  const [appInfo, setAppInfo] = useState<{ name: string; version: string; platform: string; arch: string } | null>(null)
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'available' | 'up-to-date' | 'error'>('idle')
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)

  useEffect(() => {
    window.electronAPI.app.getInfo().then(setAppInfo)
  }, [])

  async function handleCheckUpdates() {
    setUpdateStatus('checking')
    try {
      const result = await window.electronAPI.updater.check()
      if (result.updateAvailable) {
        setUpdateStatus('available')
        setUpdateVersion(result.version ?? null)
      } else {
        setUpdateStatus('up-to-date')
      }
    } catch {
      setUpdateStatus('error')
    }
    setTimeout(() => {
      setUpdateStatus((s) => (s !== 'available' ? 'idle' : s))
    }, 5000)
  }

  return (
    <SettingsCard title="About & Updates" icon={Info}>
      <FieldRow label="Application" description="Course Clip Studio">
        <span className="text-sm text-[var(--text-primary)] font-mono">
          v{appInfo?.version ?? '...'} ({appInfo?.platform ?? ''}/{appInfo?.arch ?? ''})
        </span>
      </FieldRow>
      <FieldRow label="Check for Updates" description="Download the latest version">
        <div className="flex items-center gap-2">
          <button
            onClick={handleCheckUpdates}
            disabled={updateStatus === 'checking'}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={updateStatus === 'checking' ? 'animate-spin' : ''} />
            {updateStatus === 'checking' ? 'Checking...' : 'Check Now'}
          </button>
          {updateStatus === 'available' && (
            <span className="text-xs text-[var(--accent)]">
              v{updateVersion} available!
            </span>
          )}
          {updateStatus === 'up-to-date' && (
            <span className="text-xs text-emerald-600">Up to date</span>
          )}
          {updateStatus === 'error' && (
            <span className="text-xs text-[var(--color-danger-600)]">Check failed</span>
          )}
        </div>
      </FieldRow>
    </SettingsCard>
  )
}

// ─── Workspace Folder Settings ───

function WorkspaceFolderSettings(): JSX.Element {
  const workspacePath = useAppStore((s) => s.workspacePath)
  const setWorkspacePath = useAppStore((s) => s.setWorkspacePath)
  const setCourses = useCourseStore((s) => s.setCourses)

  async function handleChange() {
    const result = await window.electronAPI.dialog.openDirectory()
    if (result.canceled || !result.filePaths[0]) return

    const path = result.filePaths[0]
    await persistWorkspacePath(path)
    setWorkspacePath(path)

    const courses = await loadWorkspace(path)
    setCourses(courses)
  }

  return (
    <SettingsCard title="Workspace" icon={FolderOpen}>
      <FieldRow label="Workspace Folder" description="Where your courses are stored on disk">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--text-secondary)] font-mono max-w-[200px] truncate" title={workspacePath ?? 'Not set'}>
            {workspacePath ?? 'Not set'}
          </span>
          <button
            onClick={handleChange}
            className="px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
          >
            Change
          </button>
        </div>
      </FieldRow>
    </SettingsCard>
  )
}

// ─── Session Card ───

function SessionCard(): JSX.Element {
  const userProfile = useAuthStore((s) => s.userProfile)
  const staySignedIn = useAuthStore((s) => s.staySignedIn)
  const setStaySignedIn = useAuthStore((s) => s.setStaySignedIn)
  const signOut = useAuthStore((s) => s.signOut)

  if (!userProfile) return <></>

  return (
    <SettingsCard title="Session" icon={Lock}>
      <FieldRow label="Signed in as" description={userProfile.email}>
        <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
          {userProfile.name}
        </span>
      </FieldRow>
      <FieldRow label="Stay Signed In" description="Skip PIN entry on app launch">
        <ToggleSwitch
          checked={staySignedIn}
          onChange={setStaySignedIn}
          label="Stay signed in"
        />
      </FieldRow>
      <div className="flex justify-end">
        <button
          onClick={() => signOut()}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--color-danger-600)] border border-[var(--color-danger-600)] rounded-md hover:bg-[var(--color-danger-100,#fee2e2)] transition-colors cursor-pointer"
        >
          <Lock size={14} />
          Sign Out
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Brand Kit Settings ───

function BrandKitSettings(): JSX.Element {
  const brandKits = useAppStore((s) => s.brandKits)
  const activeBrandKitId = useAppStore((s) => s.activeBrandKitId)
  const setActiveBrandKit = useAppStore((s) => s.setActiveBrandKit)
  const addBrandKit = useAppStore((s) => s.addBrandKit)
  const updateBrandKit = useAppStore((s) => s.updateBrandKit)
  const removeBrandKit = useAppStore((s) => s.removeBrandKit)

  const [editingId, setEditingId] = useState<string | null>(null)

  function handleCreate() {
    const now = new Date().toISOString()
    const kit: BrandKit = {
      id: uid('brand'),
      name: 'New Brand Kit',
      logoPath: null,
      primaryColor: '#a23b84',
      secondaryColor: '#3a2b95',
      accentColor: '#6f2fa6',
      fontFamily: 'Arial, sans-serif',
      fontFamilyHeading: 'Arial, sans-serif',
      customFontPaths: [],
      createdAt: now,
      updatedAt: now
    }
    addBrandKit(kit)
    setEditingId(kit.id)
  }

  const editingKit = editingId ? brandKits.find((k) => k.id === editingId) : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[var(--text-secondary)]">
          Brand kits define colors, fonts, and logos for your courses.
        </p>
        <button
          onClick={handleCreate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-white bg-[var(--brand-magenta)] rounded-md hover:bg-[var(--brand-magenta-dark)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        >
          <Plus size={14} />
          New Brand Kit
        </button>
      </div>

      {brandKits.length === 0 ? (
        <div className="p-8 text-center rounded-lg border border-dashed border-[var(--border-default)]">
          <Palette size={32} className="mx-auto text-[var(--text-tertiary)] mb-2" />
          <p className="text-sm text-[var(--text-tertiary)]">No brand kits yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {brandKits.map((kit) => (
            <div
              key={kit.id}
              className={`
                p-3 rounded-lg border transition-colors
                ${kit.id === activeBrandKitId
                  ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)]'
                  : 'border-[var(--border-default)] bg-[var(--bg-surface)]'
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-0.5">
                    <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: kit.primaryColor }} />
                    <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: kit.secondaryColor }} />
                    <div className="w-5 h-5 rounded-full border border-white/20" style={{ backgroundColor: kit.accentColor }} />
                  </div>
                  <div>
                    <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">{kit.name}</p>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{kit.fontFamily}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {kit.id !== activeBrandKitId && (
                    <button
                      onClick={() => setActiveBrandKit(kit.id)}
                      className="px-2 py-1 text-[10px] font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] rounded cursor-pointer hover:bg-[var(--bg-hover)]"
                    >
                      Set Active
                    </button>
                  )}
                  {kit.id === activeBrandKitId && (
                    <span className="flex items-center gap-1 px-2 py-1 text-[10px] font-[var(--font-weight-medium)] text-emerald-600">
                      <Check size={12} /> Active
                    </span>
                  )}
                  <button
                    onClick={() => setEditingId(editingId === kit.id ? null : kit.id)}
                    className="px-2 py-1 text-[10px] font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-default)] rounded cursor-pointer hover:bg-[var(--bg-hover)]"
                  >
                    {editingId === kit.id ? 'Close' : 'Edit'}
                  </button>
                  <button
                    onClick={() => removeBrandKit(kit.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete brand kit"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {editingId === kit.id && editingKit && (
                <div className="mt-3 pt-3 border-t border-[var(--border-default)] space-y-3">
                  <div>
                    <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Name</label>
                    <input
                      type="text"
                      value={editingKit.name}
                      onChange={(e) => updateBrandKit(kit.id, { name: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <ColorInput label="Primary" value={editingKit.primaryColor} onChange={(v) => updateBrandKit(kit.id, { primaryColor: v })} />
                    <ColorInput label="Secondary" value={editingKit.secondaryColor} onChange={(v) => updateBrandKit(kit.id, { secondaryColor: v })} />
                    <ColorInput label="Accent" value={editingKit.accentColor} onChange={(v) => updateBrandKit(kit.id, { accentColor: v })} />
                  </div>
                  <GoogleFontPicker
                    label="Body Font"
                    value={editingKit.fontFamily}
                    onChange={(fontFamily) => updateBrandKit(kit.id, { fontFamily })}
                  />
                  <GoogleFontPicker
                    label="Heading Font"
                    value={editingKit.fontFamilyHeading}
                    onChange={(fontFamily) => updateBrandKit(kit.id, { fontFamilyHeading: fontFamily })}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── AI Settings ───

function AISettingsPanel(): JSX.Element {
  const ai = useAppStore((s) => s.ai)
  const updateAI = useAppStore((s) => s.updateAISettings)
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  async function handleTestConnection() {
    setTestStatus('testing')
    try {
      if (ai.provider === 'ollama') {
        const res = await window.electronAPI.net.request({ url: `${ai.ollamaEndpoint}/api/tags`, method: 'GET' })
        setTestStatus(res.status >= 200 && res.status < 300 ? 'success' : 'error')
      } else if (ai.provider === 'anthropic' && ai.anthropicApiKey) {
        const res = await window.electronAPI.net.request({
          url: 'https://api.anthropic.com/v1/messages',
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-api-key': ai.anthropicApiKey, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 10, messages: [{ role: 'user', content: 'Hi' }] })
        })
        setTestStatus(res.status >= 200 && res.status < 300 ? 'success' : 'error')
      } else if (ai.provider === 'openai' && ai.openaiApiKey) {
        const res = await window.electronAPI.net.request({
          url: 'https://api.openai.com/v1/models',
          method: 'GET',
          headers: { 'Authorization': `Bearer ${ai.openaiApiKey}` }
        })
        setTestStatus(res.status >= 200 && res.status < 300 ? 'success' : 'error')
      } else {
        setTestStatus('error')
      }
    } catch {
      setTestStatus('error')
    }
    setTimeout(() => setTestStatus('idle'), 3000)
  }

  return (
    <div className="space-y-6">
      <SettingsCard title="LLM Provider" icon={Brain}>
        <FieldRow label="Provider" description="Select your AI provider">
          <select
            value={ai.provider ?? ''}
            onChange={(e) => updateAI({ provider: (e.target.value || null) as 'anthropic' | 'openai' | 'ollama' | null })}
            className="w-48 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="">None (AI disabled)</option>
            <option value="anthropic">Anthropic (Claude)</option>
            <option value="openai">OpenAI (GPT)</option>
            <option value="ollama">Ollama (Local)</option>
          </select>
        </FieldRow>

        {ai.provider === 'anthropic' && (
          <FieldRow label="API Key" description="Your Anthropic API key">
            <input
              type="password"
              value={ai.anthropicApiKey ?? ''}
              onChange={(e) => updateAI({ anthropicApiKey: e.target.value || null })}
              className="w-64 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="sk-ant-..."
            />
          </FieldRow>
        )}

        {ai.provider === 'openai' && (
          <FieldRow label="API Key" description="Your OpenAI API key">
            <input
              type="password"
              value={ai.openaiApiKey ?? ''}
              onChange={(e) => updateAI({ openaiApiKey: e.target.value || null })}
              className="w-64 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="sk-..."
            />
          </FieldRow>
        )}

        {ai.provider === 'ollama' && (
          <>
            <FieldRow label="Endpoint" description="Ollama server URL">
              <input
                type="text"
                value={ai.ollamaEndpoint}
                onChange={(e) => updateAI({ ollamaEndpoint: e.target.value })}
                className="w-64 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              />
            </FieldRow>
            <FieldRow label="Model" description="Ollama model name">
              <input
                type="text"
                value={ai.ollamaModel ?? ''}
                onChange={(e) => updateAI({ ollamaModel: e.target.value || null })}
                className="w-48 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                placeholder="llama3"
              />
            </FieldRow>
          </>
        )}

        {ai.provider && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleTestConnection}
              disabled={testStatus === 'testing'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer disabled:opacity-50"
            >
              <TestTube size={14} />
              Test Connection
            </button>
            {testStatus === 'success' && <span className="text-xs text-emerald-600">Connected successfully</span>}
            {testStatus === 'error' && <span className="text-xs text-[var(--color-danger-600)]">Connection failed</span>}
            {testStatus === 'testing' && <span className="text-xs text-[var(--text-tertiary)]">Testing...</span>}
          </div>
        )}
      </SettingsCard>

      <SettingsCard title="AI Defaults" icon={Globe}>
        <FieldRow label="Default AI Language" description="Language for AI-generated content">
          <select
            value={ai.defaultAILanguage}
            onChange={(e) => updateAI({ defaultAILanguage: e.target.value })}
            className="w-40 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="pt">Portuguese</option>
          </select>
        </FieldRow>
      </SettingsCard>

      <BaseBrainSection />

      <VisualApisSection />

      <VideoApisSection />

      <ChartApisSection />

      <AudioApisSection />

      <DiagramApisSection />

      <InteractiveVideoApisSection />

      <MathApisSection />

      <ContentImportApisSection />

      <AssetManagementApisSection />
    </div>
  )
}

// ─── Base Brain Section ───

function BaseBrainSection(): JSX.Element {
  const [expanded, setExpanded] = useState(false)
  const [viewingFile, setViewingFile] = useState<{ name: string; content: string } | null>(null)
  const baseBrain = useAppStore((s) => s.baseBrain)
  const updateBaseBrain = useAppStore((s) => s.updateBaseBrain)
  const addBaseBrainFile = useAppStore((s) => s.addBaseBrainFile)
  const removeBaseBrainFile = useAppStore((s) => s.removeBaseBrainFile)

  type BrainCategory = 'accessibility' | 'udl' | 'inclusive' | 'general'

  const CATEGORIES: Array<{ id: BrainCategory; label: string; description: string }> = [
    { id: 'accessibility', label: 'Accessibility (WCAG)', description: 'WCAG compliance and digital accessibility standards' },
    { id: 'udl', label: 'Universal Design for Learning', description: 'UDL principles for inclusive instructional design' },
    { id: 'inclusive', label: 'Inclusive Teaching (DisCrit)', description: 'Disability critical race theory and intersectional inclusion' },
    { id: 'general', label: 'General', description: 'Other reference files' }
  ]

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, category: BrainCategory) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      addBaseBrainFile(file.name, reader.result as string, category)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent, category: BrainCategory) {
    e.preventDefault()
    e.stopPropagation()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    if (!/\.(md|markdown|txt|docx)$/i.test(file.name)) return
    const reader = new FileReader()
    reader.onload = () => {
      addBaseBrainFile(file.name, reader.result as string, category)
    }
    reader.readAsText(file)
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
  }

  const filesByCategory = (cat: BrainCategory) =>
    baseBrain.referenceFiles
      .map((f, i) => ({ ...f, originalIndex: i }))
      .filter((f) => f.category === cat)

  return (
    <SettingsCard title="Base Brain" icon={Brain}>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-secondary)]">
            Define your design DNA — assumptions, tone, preferences, and reference docs that AI always uses.
          </p>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            aria-label={expanded ? 'Collapse Base Brain' : 'Expand Base Brain'}
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        <FieldRow label="Enable Base Brain" description="Include Base Brain context in all AI prompts">
          <ToggleSwitch
            checked={baseBrain.enabled}
            onChange={(v) => updateBaseBrain({ enabled: v })}
            label="Enable Base Brain"
          />
        </FieldRow>

        {expanded && (
          <div className="space-y-4 pt-2">
            {/* Categorized Reference Files */}
            {CATEGORIES.map((cat) => {
              const files = filesByCategory(cat.id)
              return (
                <div
                  key={cat.id}
                  onDrop={(e) => handleDrop(e, cat.id)}
                  onDragOver={handleDragOver}
                >
                  <div className="mb-1.5">
                    <label className="block text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                      {cat.label}
                    </label>
                    <p className="text-[10px] text-[var(--text-tertiary)]">{cat.description}</p>
                  </div>
                  {files.length > 0 && (
                    <div className="space-y-1 mb-2">
                      {files.map((file) => (
                        <div key={file.originalIndex} className="flex items-center gap-2 p-2 rounded-md bg-[var(--bg-panel)] border border-[var(--border-default)]">
                          <FileText size={14} className="text-[var(--brand-magenta)] shrink-0" />
                          <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{file.name}</span>
                          <button
                            onClick={() => setViewingFile({ name: file.name, content: file.content })}
                            className="px-1.5 py-0.5 text-[10px] text-[var(--text-secondary)] hover:text-[var(--brand-magenta)] cursor-pointer rounded border border-[var(--border-default)] hover:border-[var(--brand-magenta)]"
                          >
                            View
                          </button>
                          <button
                            onClick={() => removeBaseBrainFile(file.originalIndex)}
                            className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="w-full flex items-center justify-center gap-2 p-2 rounded-md border border-dashed border-[var(--border-default)] text-[10px] text-[var(--text-secondary)] hover:border-[var(--brand-magenta)] hover:text-[var(--brand-magenta)] transition-colors cursor-pointer">
                    <Upload size={12} />
                    <span>Upload or drop .md / .txt file</span>
                    <input
                      type="file"
                      accept=".md,.markdown,.txt,.docx"
                      onChange={(e) => handleFileUpload(e, cat.id)}
                      className="hidden"
                    />
                  </label>
                </div>
              )
            })}

            {/* File Viewer Modal */}
            {viewingFile && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-8" onClick={() => setViewingFile(null)}>
                <div className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
                    <span className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">{viewingFile.name}</span>
                    <button onClick={() => setViewingFile(null)} className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer">
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <pre className="text-xs text-[var(--text-primary)] whitespace-pre-wrap font-mono leading-relaxed">{viewingFile.content}</pre>
                  </div>
                </div>
              </div>
            )}

            {/* Text Areas */}
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Design Assumptions</label>
              <textarea
                value={baseBrain.designAssumptions}
                onChange={(e) => updateBaseBrain({ designAssumptions: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                placeholder="e.g., All courses use scenario-based learning, 5-10 minutes per lesson..."
              />
            </div>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Tone & Voice</label>
              <textarea
                value={baseBrain.toneAndVoice}
                onChange={(e) => updateBaseBrain({ toneAndVoice: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                placeholder="e.g., Professional but approachable, use active voice, avoid jargon..."
              />
            </div>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Visual Preferences</label>
              <textarea
                value={baseBrain.visualPreferences}
                onChange={(e) => updateBaseBrain({ visualPreferences: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                placeholder="e.g., Clean layouts, generous whitespace, brand colors for accents..."
              />
            </div>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Goals</label>
              <textarea
                value={baseBrain.goals}
                onChange={(e) => updateBaseBrain({ goals: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                placeholder="e.g., Increase learner engagement, meet WCAG AA compliance, reduce time-to-completion..."
              />
            </div>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Design Considerations</label>
              <textarea
                value={baseBrain.designConsiderations}
                onChange={(e) => updateBaseBrain({ designConsiderations: e.target.value })}
                rows={4}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                placeholder="e.g., Target mobile-first design, support offline learners, include knowledge checks every 3 slides..."
              />
            </div>
          </div>
        )}
      </div>
    </SettingsCard>
  )
}

// ─── Visual APIs Section ───

function VisualApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.visualApis.providers)
  const updateProvider = useAppStore((s) => s.updateVisualApiProvider)
  const addCustom = useAppStore((s) => s.addCustomVisualApi)
  const removeApi = useAppStore((s) => s.removeVisualApi)

  return (
    <SettingsCard title="Visual / Image APIs" icon={Image}>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    Free
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.enabled && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey ?? ''}
                    onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Enter API key..."
                  />
                </div>

                {provider.type === 'custom' && (
                  <>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Provider Name
                      </label>
                      <input
                        type="text"
                        value={provider.name}
                        onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="My Image API"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={provider.endpoint ?? ''}
                        onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="https://api.example.com/v1/search"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Auth Header Name
                      </label>
                      <input
                        type="text"
                        value={provider.headerName ?? ''}
                        onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="Authorization"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Video APIs Section ───

function VideoApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.videoApis.providers)
  const updateProvider = useAppStore((s) => s.updateVideoApiProvider)
  const addCustom = useAppStore((s) => s.addCustomVideoApi)
  const removeApi = useAppStore((s) => s.removeVideoApi)

  return (
    <SettingsCard title="Video APIs" icon={Video}>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Configure video providers that AI can use to search and embed video content in your courses.
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    Free
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom video API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.notes && (
              <p className="text-[11px] text-[var(--text-tertiary)] italic">{provider.notes}</p>
            )}

            {provider.enabled && (
              <div className="space-y-2">
                {(provider.type === 'pexels-video' || provider.type === 'pixabay-video' || provider.type === 'custom') && (
                  <div>
                    <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={provider.apiKey ?? ''}
                      onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                      placeholder="Enter API key..."
                    />
                  </div>
                )}

                {provider.type === 'custom' && (
                  <>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Provider Name
                      </label>
                      <input
                        type="text"
                        value={provider.name}
                        onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="My Video API"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={provider.endpoint ?? ''}
                        onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="https://api.example.com/v1/videos"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Auth Header Name
                      </label>
                      <input
                        type="text"
                        value={provider.headerName ?? ''}
                        onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="Authorization"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom Video API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Chart APIs Section ───

function ChartApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.chartApis.providers)
  const updateProvider = useAppStore((s) => s.updateChartApiProvider)
  const addCustom = useAppStore((s) => s.addCustomChartApi)
  const removeApi = useAppStore((s) => s.removeChartApi)

  return (
    <SettingsCard title="Charts & Data Visualization" icon={BarChart3}>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Configure chart and data visualization libraries that AI can use to generate charts in your courses.
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    Free{provider.local ? ' (local)' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom chart API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.notes && (
              <p className="text-[11px] text-[var(--text-tertiary)] italic">{provider.notes}</p>
            )}

            {provider.enabled && (
              <div className="space-y-2">
                {(provider.type === 'quickchart' || provider.type === 'custom') && (
                  <div>
                    <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                      API Key {provider.type === 'quickchart' && <span className="text-[var(--text-tertiary)]">(optional)</span>}
                    </label>
                    <input
                      type="password"
                      value={provider.apiKey ?? ''}
                      onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                      placeholder="Enter API key..."
                    />
                  </div>
                )}

                {provider.type === 'custom' && (
                  <>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Provider Name
                      </label>
                      <input
                        type="text"
                        value={provider.name}
                        onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="My Chart API"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={provider.endpoint ?? ''}
                        onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="https://api.example.com/v1/charts"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Auth Header Name
                      </label>
                      <input
                        type="text"
                        value={provider.headerName ?? ''}
                        onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="Authorization"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom Chart API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Audio APIs Section ───

function AudioApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.audioApis.providers)
  const updateProvider = useAppStore((s) => s.updateAudioApiProvider)
  const addCustom = useAppStore((s) => s.addCustomAudioApi)
  const removeApi = useAppStore((s) => s.removeAudioApi)

  return (
    <SettingsCard title="Audio / Voiceover" icon={Mic}>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Configure audio transcription and text-to-speech providers that AI can use for voiceover and captions.
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    {provider.local ? 'Free (local)' : 'Free tier'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom audio API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.notes && (
              <p className="text-[11px] text-[var(--text-tertiary)] italic">{provider.notes}</p>
            )}

            {provider.enabled && (
              <div className="space-y-2">
                {(provider.type === 'elevenlabs' || provider.type === 'custom') && (
                  <div>
                    <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={provider.apiKey ?? ''}
                      onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                      placeholder="Enter API key..."
                    />
                  </div>
                )}

                {provider.type === 'custom' && (
                  <>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Provider Name
                      </label>
                      <input
                        type="text"
                        value={provider.name}
                        onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="My Audio API"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Endpoint URL
                      </label>
                      <input
                        type="text"
                        value={provider.endpoint ?? ''}
                        onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="https://api.example.com/v1/audio"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                        Auth Header Name
                      </label>
                      <input
                        type="text"
                        value={provider.headerName ?? ''}
                        onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                        className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                        placeholder="Authorization"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom Audio API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Diagram APIs Section ───

function DiagramApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.diagramApis.providers)
  const updateProvider = useAppStore((s) => s.updateDiagramApiProvider)
  const addCustom = useAppStore((s) => s.addCustomDiagramApi)
  const removeApi = useAppStore((s) => s.removeDiagramApi)

  return (
    <SettingsCard title="Diagrams & Visual Thinking" icon={Workflow}>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Configure diagram and visual thinking tools that AI can use to generate flowcharts, whiteboards, and diagrams.
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    Free{provider.local ? ' (local)' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom diagram API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.notes && (
              <p className="text-[11px] text-[var(--text-tertiary)] italic">{provider.notes}</p>
            )}

            {provider.enabled && provider.type === 'kroki' && (
              <div>
                <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                  Endpoint URL <span className="text-[var(--text-tertiary)]">(default: https://kroki.io)</span>
                </label>
                <input
                  type="text"
                  value={provider.endpoint ?? ''}
                  onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  placeholder="https://kroki.io"
                />
              </div>
            )}

            {provider.enabled && provider.type === 'custom' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey ?? ''}
                    onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Enter API key..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={provider.name}
                    onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="My Diagram API"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={provider.endpoint ?? ''}
                    onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="https://api.example.com/v1/diagrams"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Auth Header Name
                  </label>
                  <input
                    type="text"
                    value={provider.headerName ?? ''}
                    onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Authorization"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom Diagram API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Interactive Video APIs Section ───

function InteractiveVideoApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.interactiveVideoApis.providers)
  const updateProvider = useAppStore((s) => s.updateInteractiveVideoApiProvider)
  const addCustom = useAppStore((s) => s.addCustomInteractiveVideoApi)
  const removeApi = useAppStore((s) => s.removeInteractiveVideoApi)

  return (
    <SettingsCard title="Interactive Video" icon={Clapperboard}>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Configure interactive video players and APIs for playback control, quiz overlays, and branching scenarios.
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    Free{provider.local ? ' (local)' : ''}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom interactive video API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.notes && (
              <p className="text-[11px] text-[var(--text-tertiary)] italic">{provider.notes}</p>
            )}

            {provider.enabled && provider.type === 'h5p' && (
              <div>
                <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                  H5P Server URL <span className="text-[var(--text-tertiary)]">(self-hosted instance)</span>
                </label>
                <input
                  type="text"
                  value={provider.endpoint ?? ''}
                  onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                  className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  placeholder="https://h5p.example.com"
                />
              </div>
            )}

            {provider.enabled && provider.type === 'custom' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey ?? ''}
                    onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Enter API key..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={provider.name}
                    onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="My Interactive Video API"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={provider.endpoint ?? ''}
                    onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="https://api.example.com/v1/interactive"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Auth Header Name
                  </label>
                  <input
                    type="text"
                    value={provider.headerName ?? ''}
                    onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Authorization"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom Interactive Video API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Math APIs Section ───

function MathApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.mathApis.providers)
  const updateProvider = useAppStore((s) => s.updateMathApiProvider)
  const addCustom = useAppStore((s) => s.addCustomMathApi)
  const removeApi = useAppStore((s) => s.removeMathApi)

  return (
    <SettingsCard title="Math & Science Notation" icon={Sigma}>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Configure math and science rendering libraries for LaTeX equations, MathML, and molecular structures.
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    Free (local)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom math API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.notes && (
              <p className="text-[11px] text-[var(--text-tertiary)] italic">{provider.notes}</p>
            )}

            {provider.enabled && provider.type === 'custom' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey ?? ''}
                    onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Enter API key..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={provider.name}
                    onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="My Math API"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={provider.endpoint ?? ''}
                    onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="https://api.example.com/v1/math"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Auth Header Name
                  </label>
                  <input
                    type="text"
                    value={provider.headerName ?? ''}
                    onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Authorization"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom Math API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Content Import / Parsing ───

function ContentImportApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.contentImportApis.providers)
  const updateProvider = useAppStore((s) => s.updateContentImportProvider)
  const addCustom = useAppStore((s) => s.addCustomContentImportApi)
  const removeApi = useAppStore((s) => s.removeContentImportApi)

  return (
    <SettingsCard title="Content Import / Parsing" icon={FileInput}>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Configure content import and parsing libraries for converting documents, PDFs, and presentations into course content.
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    Free (local)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom content import API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.notes && (
              <p className="text-[11px] text-[var(--text-tertiary)] italic">{provider.notes}</p>
            )}

            {provider.enabled && provider.type === 'custom' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey ?? ''}
                    onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Enter API key..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={provider.name}
                    onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="My Import API"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={provider.endpoint ?? ''}
                    onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="https://api.example.com/v1/import"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Auth Header Name
                  </label>
                  <input
                    type="text"
                    value={provider.headerName ?? ''}
                    onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Authorization"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom Import API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Asset Management & Search ───

function AssetManagementApisSection(): JSX.Element {
  const providers = useAppStore((s) => s.assetManagementApis.providers)
  const updateProvider = useAppStore((s) => s.updateAssetManagementProvider)
  const addCustom = useAppStore((s) => s.addCustomAssetManagementApi)
  const removeApi = useAppStore((s) => s.removeAssetManagementApi)

  return (
    <SettingsCard title="Asset Management & Search" icon={FolderSearch}>
      <p className="text-xs text-[var(--text-secondary)] mb-3">
        Configure asset search APIs for icons, illustrations, animations, and stock media.
      </p>
      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {provider.name}
                </span>
                {provider.type !== 'custom' && (
                  <span className="px-1.5 py-0.5 text-[10px] font-[var(--font-weight-medium)] text-emerald-700 bg-emerald-100 rounded">
                    {provider.local ? 'Free (self-hosted)' : provider.type === 'pexels-unsplash' ? 'Free' : 'Free tier'}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {provider.type === 'custom' && (
                  <button
                    onClick={() => removeApi(provider.id)}
                    className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] hover:bg-[var(--color-danger-100,#fee2e2)]"
                    aria-label="Delete custom asset API"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
                <ToggleSwitch
                  checked={provider.enabled}
                  onChange={(v) => updateProvider(provider.id, { enabled: v })}
                  label={`Enable ${provider.name}`}
                />
              </div>
            </div>

            {provider.notes && (
              <p className="text-[11px] text-[var(--text-tertiary)] italic">{provider.notes}</p>
            )}

            {provider.enabled && !provider.local && provider.type !== 'pexels-unsplash' && provider.type !== 'custom' && (
              <div>
                <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                  API Key
                </label>
                <input
                  type="password"
                  value={provider.apiKey ?? ''}
                  onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                  className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  placeholder="Enter API key..."
                />
              </div>
            )}

            {provider.enabled && provider.type === 'custom' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={provider.apiKey ?? ''}
                    onChange={(e) => updateProvider(provider.id, { apiKey: e.target.value || null })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Enter API key..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={provider.name}
                    onChange={(e) => updateProvider(provider.id, { name: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="My Asset API"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={provider.endpoint ?? ''}
                    onChange={(e) => updateProvider(provider.id, { endpoint: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="https://api.example.com/v1/assets"
                  />
                </div>
                <div>
                  <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                    Auth Header Name
                  </label>
                  <input
                    type="text"
                    value={provider.headerName ?? ''}
                    onChange={(e) => updateProvider(provider.id, { headerName: e.target.value })}
                    className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    placeholder="Authorization"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="pt-2">
        <button
          onClick={addCustom}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] border border-[var(--border-default)] rounded-md hover:bg-[var(--bg-hover)] cursor-pointer"
        >
          <Plus size={14} />
          Add Custom Asset API
        </button>
      </div>
    </SettingsCard>
  )
}

// ─── Accessibility Settings ───

function AccessibilitySettingsPanel(): JSX.Element {
  const accessibility = useAppStore((s) => s.accessibility)
  const updateAccessibility = useAppStore((s) => s.updateAccessibilitySettings)

  const colorBlindOptions: Array<{ value: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'; label: string }> = [
    { value: 'none', label: 'None' },
    { value: 'protanopia', label: 'Protanopia' },
    { value: 'deuteranopia', label: 'Deuteranopia' },
    { value: 'tritanopia', label: 'Tritanopia' },
    { value: 'achromatopsia', label: 'Monochrome' }
  ]

  const cursorOptions: Array<{ value: 'default' | 'large' | 'crosshair' | 'high-contrast'; label: string }> = [
    { value: 'default', label: 'Default' },
    { value: 'large', label: 'Large' },
    { value: 'crosshair', label: 'Crosshair' },
    { value: 'high-contrast', label: 'High Contrast' }
  ]

  return (
    <div className="space-y-6">
      <SettingsCard title="Display" icon={PersonStanding}>
        <FieldRow label="High Contrast Mode" description="Increases contrast for better visibility in the authoring UI">
          <ToggleSwitch
            checked={accessibility.highContrastMode}
            onChange={(v) => updateAccessibility({ highContrastMode: v })}
            label="High contrast"
          />
        </FieldRow>
        <FieldRow label="Base Font Size" description="Minimum font size for the authoring UI">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={12}
              max={28}
              value={accessibility.baseFontSize}
              onChange={(e) => updateAccessibility({ baseFontSize: Number(e.target.value) })}
              className="w-32"
              aria-label="Base font size"
            />
            <span className="text-sm text-[var(--text-primary)] font-mono w-10">{accessibility.baseFontSize}px</span>
          </div>
        </FieldRow>
        <FieldRow label="Reduced Motion" description="Minimize animations and transitions (WCAG 2.3.3)">
          <ToggleSwitch
            checked={accessibility.reducedMotion}
            onChange={(v) => updateAccessibility({ reducedMotion: v })}
            label="Reduced motion"
          />
        </FieldRow>
        <FieldRow label="Enhanced Text Spacing" description="Increase line height, letter spacing, and word spacing (WCAG 1.4.12)">
          <ToggleSwitch
            checked={accessibility.enhancedTextSpacing}
            onChange={(v) => updateAccessibility({ enhancedTextSpacing: v })}
            label="Enhanced text spacing"
          />
        </FieldRow>
        <FieldRow label="Enhanced Focus Indicators" description="High-visibility focus outlines for keyboard navigation (WCAG 2.4.7)">
          <ToggleSwitch
            checked={accessibility.enhancedFocusIndicators}
            onChange={(v) => updateAccessibility({ enhancedFocusIndicators: v })}
            label="Enhanced focus indicators"
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Color Blind Support" icon={PersonStanding}>
        <FieldRow label="Color Blind Mode" description="Simulates color vision deficiency for accessible design">
          <div className="flex flex-wrap gap-1">
            {colorBlindOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateAccessibility({ colorBlindMode: opt.value })}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                  accessibility.colorBlindMode === opt.value
                    ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
                aria-pressed={accessibility.colorBlindMode === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Cursor" icon={PersonStanding}>
        <FieldRow label="Cursor Style" description="Custom cursor for motor accessibility">
          <div className="flex flex-wrap gap-1">
            {cursorOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => updateAccessibility({ cursorStyle: opt.value })}
                className={`px-2.5 py-1 text-xs rounded-md border transition-colors cursor-pointer ${
                  accessibility.cursorStyle === opt.value
                    ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
                    : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
                aria-pressed={accessibility.cursorStyle === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Cursor Trail" description="Visual trail that follows your cursor">
          <ToggleSwitch
            checked={accessibility.cursorTrail}
            onChange={(v) => updateAccessibility({ cursorTrail: v })}
            label="Cursor trail"
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Reading" icon={PersonStanding}>
        <FieldRow label="OpenDyslexic Font" description="Dyslexia-friendly typeface (SIL Open Font License)">
          <ToggleSwitch
            checked={accessibility.openDyslexic}
            onChange={(v) => updateAccessibility({ openDyslexic: v })}
            label="OpenDyslexic font"
          />
        </FieldRow>
        <FieldRow label="Bionic Reading" description="Bold the first half of each word to create fixation points for faster reading">
          <ToggleSwitch
            checked={accessibility.bionicReading}
            onChange={(v) => updateAccessibility({ bionicReading: v })}
            label="Bionic reading"
          />
        </FieldRow>
      </SettingsCard>

      <div className="p-4 rounded-lg bg-[var(--bg-muted)] border border-[var(--border-default)]">
        <p className="text-xs text-[var(--text-secondary)]">
          These settings affect the authoring environment. Learner-facing accessibility settings are configured per-course in the Course Settings panel.
        </p>
      </div>
    </div>
  )
}

// ─── Analytics Settings ───

function AnalyticsSettings(): JSX.Element {
  const course = useCourseStore((s) => s.activeCourse)
  const updateCourse = useCourseStore((s) => s.updateCourse)
  const workspacePath = useAppStore((s) => s.workspacePath)

  if (!course) {
    return (
      <div className="p-8 text-center text-sm text-[var(--text-tertiary)]">
        Open a course to configure analytics settings.
      </div>
    )
  }

  const lrs = course.settings.lrs ?? null
  const identifiedReportingEnabled = course.settings.identifiedReportingEnabled ?? false

  function handleLRSChange(newLrs: LRSSettings | null) {
    updateCourse(course!.id, {
      settings: { ...course!.settings, lrs: newLrs }
    })
  }

  function handleIdentifiedReportingChange(enabled: boolean) {
    const ferpaAcks = { ...course!.settings.ferpaAcknowledgments }
    if (enabled) {
      ferpaAcks['identified-reporting'] = {
        acknowledgedAt: new Date().toISOString(),
        provider: 'anthropic'
      }
    }
    updateCourse(course!.id, {
      settings: {
        ...course!.settings,
        identifiedReportingEnabled: enabled,
        ferpaAcknowledgments: ferpaAcks
      }
    })
  }

  async function handleClearData() {
    if (!workspacePath) return
    const { useAnalyticsStore } = await import('@/stores/useAnalyticsStore')
    await useAnalyticsStore.getState().clearData(workspacePath, course!)
  }

  return (
    <AnalyticsSettingsTab
      lrs={lrs}
      identifiedReportingEnabled={identifiedReportingEnabled}
      onLRSChange={handleLRSChange}
      onIdentifiedReportingChange={handleIdentifiedReportingChange}
      onClearData={handleClearData}
    />
  )
}

