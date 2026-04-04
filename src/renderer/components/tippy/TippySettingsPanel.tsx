/**
 * TIPPY Settings Panel — Settings > TIPPY tab
 *
 * Phase 4: Shows profile summary, Get to Know You launcher, profile export/reset,
 * active AI provider info, TIPPY behavior toggles, walkthrough library,
 * auto-assess on export, conversation history, and about info.
 */

import { useState } from 'react'
import {
  User,
  Download,
  Trash2,
  MessageCircle,
  Brain,
  Info,
  ExternalLink,
  PlayCircle,
  ClipboardCheck,
  BookOpen
} from 'lucide-react'
import { useAppStore } from '@/stores/useAppStore'
import { useAuthorProfileStore, ONBOARDING_SECTIONS } from '@/stores/useAuthorProfileStore'
import { useTippyStore } from '@/stores/useTippyStore'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { FieldRow } from '@/components/ui/FieldRow'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { GetToKnowYou } from './GetToKnowYou'
import { formatBrandKitForPreFill, formatBrandFontForPreFill } from '@/lib/tippy/profile-generator'
import { getWalkthroughSummaries } from '@/lib/tippy/walkthrough-library'
import TippyIcon from '@/assets/tippy/Tippy_Icon.png'

export function TippySettingsPanel(): JSX.Element {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const profile = useAuthorProfileStore((s) => s.profile)
  const sections = useAuthorProfileStore((s) => s.sections)
  const profileMarkdown = useAuthorProfileStore((s) => s.profileMarkdown)
  const updatedAt = useAuthorProfileStore((s) => s.updatedAt)
  const resetProfile = useAuthorProfileStore((s) => s.resetProfile)
  const preFillBrand = useAuthorProfileStore((s) => s.preFillBrand)

  const aiProvider = useAppStore((s) => s.ai.provider)
  const brandKits = useAppStore((s) => s.brandKits)
  const activeBrandKitId = useAppStore((s) => s.activeBrandKitId)

  const savedSessions = useTippyStore((s) => s.savedSessions)
  const reasoningViewCount = useTippyStore((s) => s.reasoningViewCount)
  const autoAssessOnExport = useTippyStore((s) => s.autoAssessOnExport)
  const setAutoAssessOnExport = useTippyStore((s) => s.setAutoAssessOnExport)
  const startWalkthrough = useTippyStore((s) => s.startWalkthrough)
  const openTippy = useTippyStore((s) => s.open)

  const completedCount = sections.filter((s) => s.completed).length

  // If onboarding is open, show full-panel Get to Know You
  if (showOnboarding) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{
          backgroundColor: 'var(--bg-panel)',
          border: '1px solid var(--border-default)',
          height: '600px'
        }}
      >
        <GetToKnowYou onClose={() => setShowOnboarding(false)} />
      </div>
    )
  }

  function handleExportProfile(): void {
    if (!profileMarkdown) return
    const blob = new Blob([profileMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'tippy-profile.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleReset(): void {
    if (!confirmReset) {
      setConfirmReset(true)
      return
    }
    resetProfile()
    setConfirmReset(false)
  }

  function handleStartOnboarding(): void {
    // Pre-fill brand section if a brand kit is configured
    const activeBrandKit = brandKits.find((k) => k.id === activeBrandKitId)
    if (activeBrandKit) {
      preFillBrand(
        formatBrandKitForPreFill(activeBrandKit),
        formatBrandFontForPreFill(activeBrandKit)
      )
    }
    setShowOnboarding(true)
  }

  return (
    <div className="space-y-6">
      {/* Get to Know You */}
      <SettingsCard title="Get to Know You" icon={User}>
        {profile ? (
          <>
            {/* Profile summary */}
            <div
              className="p-4 rounded-lg mb-4"
              style={{ backgroundColor: 'var(--bg-muted)', border: '1px solid var(--border-default)' }}
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={TippyIcon} alt="" className="w-10 h-10 rounded-full" />
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {profile.preferredName || profile.name || 'Author'}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                    {profile.role || 'No role specified'}
                    {profile.organization ? ` — ${profile.organization}` : ''}
                  </div>
                </div>
                <div className="ml-auto text-xs" style={{ color: 'var(--text-tertiary)' }}>
                  {completedCount}/{ONBOARDING_SECTIONS.length} sections
                </div>
              </div>

              {/* Section completion dots */}
              <div className="flex gap-2 mb-3">
                {ONBOARDING_SECTIONS.map((meta) => {
                  const data = sections.find((s) => s.id === meta.id)
                  return (
                    <div
                      key={meta.id}
                      className="flex-1 h-1.5 rounded-full"
                      style={{
                        backgroundColor: data?.completed
                          ? 'var(--brand-magenta)'
                          : 'var(--bg-hover)'
                      }}
                      title={`${meta.title}: ${data?.completed ? 'Complete' : 'Not complete'}`}
                    />
                  )
                })}
              </div>

              {/* Quick profile highlights */}
              <div className="space-y-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                {profile.credentials && (
                  <div>Credentials: {profile.credentials}</div>
                )}
                {profile.accessibilityPrinciples && (
                  <div>Accessibility: {profile.accessibilityPrinciples.slice(0, 100)}...</div>
                )}
                {profile.aiSupportPreference && (
                  <div>AI preference: {profile.aiSupportPreference.slice(0, 100)}...</div>
                )}
              </div>

              {updatedAt && (
                <div className="mt-2 text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  Last updated: {new Date(updatedAt).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleStartOnboarding}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--brand-indigo)',
                  color: '#fff',
                  border: 'none'
                }}
              >
                <MessageCircle size={14} /> Update Profile
              </button>
              <button
                onClick={handleExportProfile}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: 'var(--bg-muted)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)'
                }}
              >
                <Download size={14} /> Export Profile
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium cursor-pointer"
                style={{
                  backgroundColor: confirmReset ? 'var(--color-danger-600)' : 'var(--bg-muted)',
                  color: confirmReset ? '#fff' : 'var(--text-secondary)',
                  border: confirmReset ? 'none' : '1px solid var(--border-default)'
                }}
              >
                <Trash2 size={14} />
                {confirmReset ? 'Confirm Reset' : 'Reset Profile'}
              </button>
            </div>
          </>
        ) : (
          /* No profile yet */
          <div className="text-center py-6">
            <img src={TippyIcon} alt="" className="w-16 h-16 rounded-full mx-auto mb-3" />
            <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Let TIPPY get to know you
            </h3>
            <p className="text-xs mb-4 max-w-sm mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Answer a few questions about your role, audience, and design preferences.
              TIPPY will use your profile to give you more relevant, personalized suggestions.
            </p>
            <button
              onClick={handleStartOnboarding}
              className="px-5 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
              style={{
                backgroundColor: 'var(--brand-magenta)',
                color: '#fff',
                border: 'none'
              }}
            >
              Start Get to Know You
            </button>
          </div>
        )}
      </SettingsCard>

      {/* Active AI Provider */}
      <SettingsCard title="Active AI Provider" icon={Brain}>
        <FieldRow
          label="Current provider"
          description="Set in Settings > AI/LLM. TIPPY uses this provider for all responses."
        >
          <div className="flex items-center gap-2">
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                backgroundColor: aiProvider === 'ollama'
                  ? '#e8f5e9'
                  : aiProvider
                    ? '#fff3e0'
                    : 'var(--bg-muted)',
                color: aiProvider === 'ollama'
                  ? '#2e7d32'
                  : aiProvider
                    ? '#e65100'
                    : 'var(--text-tertiary)'
              }}
            >
              {aiProvider
                ? `${aiProvider.charAt(0).toUpperCase() + aiProvider.slice(1)}${aiProvider === 'ollama' ? ' (local)' : ' (cloud)'}`
                : 'Not configured'}
            </span>
          </div>
        </FieldRow>
        {aiProvider && aiProvider !== 'ollama' && (
          <div
            className="p-3 rounded-lg text-xs mt-2"
            style={{
              backgroundColor: '#fff3e0',
              border: '1px solid #ffe0b2',
              color: '#e65100'
            }}
          >
            Cloud provider active. TIPPY will show FERPA warnings before sending
            messages that may contain learner data. For privacy-sensitive work,
            switch to Ollama in Settings &gt; AI/LLM.
          </div>
        )}
      </SettingsCard>

      {/* TIPPY Behavior */}
      <SettingsCard title="TIPPY Behavior" icon={MessageCircle}>
        <FieldRow
          label="FERPA warnings"
          description="Show warnings before sending learner data to cloud AI providers. This cannot be disabled."
        >
          <span
            className="px-2 py-1 rounded text-xs font-medium"
            style={{ backgroundColor: '#e8f5e9', color: '#2e7d32' }}
          >
            Always On
          </span>
        </FieldRow>

        <FieldRow
          label="Reasoning transparency"
          description="TIPPY shows a 'How does TIPPY reason?' panel on substantive recommendations."
        >
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {reasoningViewCount} reasoning panels shown
          </span>
        </FieldRow>

        <FieldRow
          label="Auto-run Assesses on export"
          description="Automatically run a TIPPY Assesses report before exporting a course."
        >
          <ToggleSwitch checked={autoAssessOnExport} onChange={setAutoAssessOnExport} label="Auto-run Assesses on export" />
        </FieldRow>
      </SettingsCard>

      {/* Walkthrough Library */}
      <SettingsCard title="Walkthrough Library" icon={PlayCircle}>
        <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
          Guided walkthroughs that highlight UI elements and walk you through features step by step.
        </p>
        <div className="space-y-1">
          {getWalkthroughSummaries().map((wt) => (
            <div
              key={wt.id}
              className="flex items-center justify-between py-2 px-3 rounded-lg"
              style={{ backgroundColor: 'var(--bg-muted)' }}
            >
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {wt.title}
                </div>
                <div className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>
                  {wt.stepCount} steps
                </div>
              </div>
              <button
                onClick={() => {
                  openTippy()
                  startWalkthrough(wt.id)
                }}
                className="shrink-0 flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium cursor-pointer"
                style={{
                  backgroundColor: '#8B0000',
                  color: '#fff',
                  border: 'none'
                }}
                type="button"
              >
                <PlayCircle size={10} /> Run
              </button>
            </div>
          ))}
        </div>
      </SettingsCard>

      {/* Conversation History */}
      <SettingsCard title="Conversation History" icon={MessageCircle}>
        <FieldRow
          label="Saved sessions"
          description="Sessions saved from the TIPPY chat panel."
        >
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
            {savedSessions.length} session{savedSessions.length !== 1 ? 's' : ''} saved
          </span>
        </FieldRow>
      </SettingsCard>

      {/* About TIPPY */}
      <SettingsCard title="About TIPPY" icon={Info}>
        <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
          <div className="flex justify-between">
            <span>Version</span>
            <span style={{ color: 'var(--text-primary)' }}>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Knowledge base</span>
            <span style={{ color: 'var(--text-primary)' }}>2026-04-04</span>
          </div>
          <div className="flex justify-between">
            <span>Full name</span>
            <span style={{ color: 'var(--text-primary)' }}>
              Teaching Inclusion and Pedagogy Partner for You
            </span>
          </div>
        </div>
      </SettingsCard>
    </div>
  )
}
