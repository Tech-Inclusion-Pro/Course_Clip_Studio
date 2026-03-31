import { useState, useEffect } from 'react'
import {
  Settings,
  Palette,
  Brain,
  Accessibility,
  User,
  Globe,
  Plus,
  Trash2,
  Check,
  TestTube,
  FolderOpen,
  RefreshCw,
  Info
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { useAppStore, type ThemeMode } from '@/stores/useAppStore'
import { useCourseStore } from '@/stores/useCourseStore'
import { uid } from '@/lib/uid'
import { persistWorkspacePath, loadWorkspace } from '@/lib/workspace'
import type { BrandKit } from '@/types/course'

type SettingsTab = 'general' | 'brand' | 'ai' | 'accessibility'

const TABS: Array<{ id: SettingsTab; label: string; icon: typeof Settings }> = [
  { id: 'general', label: 'General', icon: User },
  { id: 'brand', label: 'Brand Kits', icon: Palette },
  { id: 'ai', label: 'AI / LLM', icon: Brain },
  { id: 'accessibility', label: 'Accessibility', icon: Accessibility }
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
      </div>
    </div>
  )
}

// ─── General Settings ───

function GeneralSettings(): JSX.Element {
  const { t } = useTranslation('settings')
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
  const uiLanguage = useAppStore((s) => s.uiLanguage)
  const setUILanguage = useAppStore((s) => s.setUILanguage)

  return (
    <div className="space-y-6">
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

      <SettingsCard title={t('general.uiLanguage')} icon={Globe}>
        <FieldRow label={t('general.uiLanguage')} description={t('general.uiLanguageDescription')}>
          <select
            value={uiLanguage}
            onChange={(e) => {
              const lang = e.target.value
              setUILanguage(lang)
              i18next.changeLanguage(lang)
            }}
            className="w-40 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="en">English</option>
            <option value="es">Espa&#241;ol</option>
          </select>
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
          <div className="flex gap-1">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((t) => (
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
                  <div>
                    <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Body Font</label>
                    <select
                      value={editingKit.fontFamily}
                      onChange={(e) => updateBrandKit(kit.id, { fontFamily: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                    >
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Helvetica Neue', sans-serif">Helvetica</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="Verdana, sans-serif">Verdana</option>
                      <option value="system-ui, sans-serif">System UI</option>
                    </select>
                  </div>
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
        const res = await fetch(`${ai.ollamaEndpoint}/api/tags`)
        if (res.ok) {
          setTestStatus('success')
        } else {
          setTestStatus('error')
        }
      } else {
        const hasKey = ai.provider === 'anthropic' ? !!ai.anthropicApiKey : !!ai.openaiApiKey
        setTestStatus(hasKey ? 'success' : 'error')
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
    </div>
  )
}

// ─── Accessibility Settings ───

function AccessibilitySettingsPanel(): JSX.Element {
  const accessibility = useAppStore((s) => s.accessibility)
  const updateAccessibility = useAppStore((s) => s.updateAccessibilitySettings)

  return (
    <div className="space-y-6">
      <SettingsCard title="Display" icon={Accessibility}>
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
              min={14}
              max={24}
              value={accessibility.baseFontSize}
              onChange={(e) => updateAccessibility({ baseFontSize: Number(e.target.value) })}
              className="w-32"
              aria-label="Base font size"
            />
            <span className="text-sm text-[var(--text-primary)] font-mono w-10">{accessibility.baseFontSize}px</span>
          </div>
        </FieldRow>
        <FieldRow label="Reduced Motion" description="Minimize animations and transitions">
          <ToggleSwitch
            checked={accessibility.reducedMotion}
            onChange={(v) => updateAccessibility({ reducedMotion: v })}
            label="Reduced motion"
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

// ─── Shared Components ───

function SettingsCard({
  title,
  icon: Icon,
  children
}: {
  title: string
  icon: typeof Settings
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)] bg-[var(--bg-muted)]">
        <Icon size={16} className="text-[var(--text-tertiary)]" />
        <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">{title}</h3>
      </div>
      <div className="p-4 space-y-4">{children}</div>
    </div>
  )
}

function FieldRow({
  label,
  description,
  children
}: {
  label: string
  description: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">{label}</p>
        <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function ToggleSwitch({
  checked,
  onChange,
  label
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}): JSX.Element {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full cursor-pointer transition-colors
        focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] focus:ring-offset-2
        ${checked ? 'bg-[var(--brand-magenta)]' : 'bg-[var(--border-default)]'}
      `}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${checked ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}

function ColorInput({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}): JSX.Element {
  return (
    <div>
      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded border border-[var(--border-default)] cursor-pointer p-0.5"
        />
        <span className="text-[10px] text-[var(--text-tertiary)] font-mono">{value}</span>
      </div>
    </div>
  )
}
