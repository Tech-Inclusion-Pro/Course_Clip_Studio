import { useState } from 'react'
import {
  Sparkles,
  Settings,
  Brain,
  Image,
  Palette,
  Accessibility,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  SkipForward,
  Globe,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Upload,
  FileText,
  X,
  Loader2
} from 'lucide-react'
import { useAppStore, type ThemeMode } from '@/stores/useAppStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useLocaleStore } from '@/stores/useLocaleStore'
import { LANGUAGES } from '@/lib/i18n/languages'
import { useT } from '@/hooks/useT'
import { SettingsCard } from '@/components/ui/SettingsCard'
import { FieldRow } from '@/components/ui/FieldRow'
import { ToggleSwitch } from '@/components/ui/ToggleSwitch'
import { ColorInput } from '@/components/ui/ColorInput'
import { GoogleFontPicker } from '@/components/editor/GoogleFontPicker'
import { uid } from '@/lib/uid'
import type { BrandKit } from '@/types/course'
import logoSrc from '@/assets/logo.png'

type Step = 'welcome' | 'language' | 'accessibility' | 'general' | 'ai-llm' | 'visual-apis' | 'branding' | 'complete'

const STEPS: Step[] = ['welcome', 'language', 'accessibility', 'general', 'ai-llm', 'visual-apis', 'branding', 'complete']

const STEP_LABELS: Record<Step, string> = {
  welcome: 'Welcome',
  language: 'Language',
  accessibility: 'Access.',
  general: 'General',
  'ai-llm': 'AI / LLM',
  'visual-apis': 'Visual APIs',
  branding: 'Branding',
  complete: 'Complete'
}

export function OnboardingWizard(): JSX.Element {
  const [currentStep, setCurrentStep] = useState<Step>('welcome')
  const setOnboardingComplete = useAuthStore((s) => s.setOnboardingComplete)

  const currentIndex = STEPS.indexOf(currentStep)
  const isFirst = currentIndex === 0
  const isLast = currentStep === 'complete'

  function goNext() {
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1])
    }
  }

  function goBack() {
    if (currentIndex > 0) {
      setCurrentStep(STEPS[currentIndex - 1])
    }
  }

  function skipAll() {
    setOnboardingComplete()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[var(--bg-app)] flex flex-col">
      {/* Progress bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, i) => (
              <div key={step} className="flex items-center">
                <div
                  className={`
                    flex items-center justify-center w-7 h-7 rounded-full text-xs font-[var(--font-weight-medium)] transition-colors
                    ${i < currentIndex
                      ? 'bg-[var(--brand-magenta)] text-white'
                      : i === currentIndex
                        ? 'bg-[var(--brand-magenta)] text-white ring-2 ring-[var(--brand-magenta)] ring-offset-2 ring-offset-[var(--bg-app)]'
                        : 'bg-[var(--bg-muted)] text-[var(--text-tertiary)] border border-[var(--border-default)]'
                    }
                  `}
                >
                  {i < currentIndex ? <CheckCircle size={14} /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-0.5 mx-1 ${
                      i < currentIndex ? 'bg-[var(--brand-magenta)]' : 'bg-[var(--border-default)]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {STEPS.map((step) => (
              <span key={step} className="text-[9px] text-[var(--text-tertiary)] w-7 text-center">
                {STEP_LABELS[step].slice(0, 6)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        <div className="max-w-2xl mx-auto">
          {currentStep === 'welcome' && <WelcomeStep />}
          {currentStep === 'language' && <LanguageStep />}
          {currentStep === 'accessibility' && <AccessibilityStep />}
          {currentStep === 'general' && <GeneralStep />}
          {currentStep === 'ai-llm' && <AILLMStep />}
          {currentStep === 'visual-apis' && <VisualApisStep />}
          {currentStep === 'branding' && <BrandingStep />}
          {currentStep === 'complete' && <CompleteStep onFinish={skipAll} />}
        </div>
      </div>

      {/* Navigation */}
      {!isLast && (
        <div className="px-6 py-4 border-t border-[var(--border-default)] bg-[var(--bg-surface)]">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div>
              {!isFirst && (
                <button
                  onClick={goBack}
                  className="flex items-center gap-1 px-4 py-2 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={skipAll}
                className="flex items-center gap-1 px-3 py-2 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] cursor-pointer transition-colors"
              >
                <SkipForward size={14} />
                Skip All
              </button>
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-[var(--font-weight-medium)] text-white bg-[var(--brand-magenta)] rounded-lg hover:bg-[var(--brand-magenta-dark)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              >
                {currentStep === 'welcome' ? 'Get Started' : 'Next'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 1: Welcome ───

function WelcomeStep(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <img src={logoSrc} alt="Course Clip Studio" className="w-20 h-20 mb-6" />
      <h1 className="text-3xl font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-3">
        Welcome to Course Clip Studio
      </h1>
      <p className="text-base text-[var(--text-secondary)] max-w-md mb-8">
        Let's get your workspace set up. We'll walk you through the key settings so you can start creating
        accessible, engaging courses right away.
      </p>
      <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
        <Sparkles size={16} />
        <span>This will only take a couple of minutes</span>
      </div>
    </div>
  )
}

// ─── Step 2: Language ───

function LanguageStep(): JSX.Element {
  const t = useT()
  const uiLanguage = useAppStore((s) => s.uiLanguage)
  const setUILanguage = useAppStore((s) => s.setUILanguage)
  const isTranslating = useLocaleStore((s) => s.isTranslating)
  const translationProgress = useLocaleStore((s) => s.translationProgress)

  function handleLanguageChange(code: string) {
    setUILanguage(code)
    useLocaleStore.getState().setLanguage(code)
  }

  // Group languages: current selection first, then RTL group, then rest
  const rtlLanguages = LANGUAGES.filter((l) => l.dir === 'rtl')
  const ltrLanguages = LANGUAGES.filter((l) => l.dir === 'ltr')

  return (
    <div className="space-y-6 py-4">
      <div className="mb-4 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center mx-auto mb-4">
          <Globe size={28} className="text-[var(--brand-magenta)]" />
        </div>
        <h2 className="text-xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          {t('onboarding.chooseLanguage', 'Choose Your Language')}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          {t('onboarding.languageDescription', 'Select the language for the application interface. The UI will be translated using AI.')}
        </p>
      </div>

      {/* Translation progress */}
      {isTranslating && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-[var(--brand-magenta)]/10 border border-[var(--brand-magenta)]/20">
          <Loader2 size={16} className="animate-spin text-[var(--brand-magenta)]" />
          <div className="flex-1">
            <p className="text-xs text-[var(--text-secondary)]">
              {t('translation.translating', 'Translating...')} {translationProgress}%
            </p>
            <div className="mt-1 h-1.5 rounded-full bg-[var(--bg-muted)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--brand-magenta)] transition-[width] duration-300"
                style={{ width: `${translationProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Language grid */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-1">
            {t('onboarding.ltrLanguages', 'Languages (Left-to-Right)')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ltrLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isTranslating}
                className={`
                  flex flex-col items-start px-3 py-2.5 rounded-lg border text-left cursor-pointer transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${uiLanguage === lang.code
                    ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] ring-2 ring-[var(--brand-magenta)]/30'
                    : 'border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:border-[var(--text-tertiary)]'
                  }
                `}
                aria-pressed={uiLanguage === lang.code}
              >
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                  {lang.nativeName}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider mb-2 px-1">
            {t('onboarding.rtlLanguages', 'Languages (Right-to-Left)')}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {rtlLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                disabled={isTranslating}
                className={`
                  flex flex-col items-start px-3 py-2.5 rounded-lg border text-left cursor-pointer transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed
                  ${uiLanguage === lang.code
                    ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] ring-2 ring-[var(--brand-magenta)]/30'
                    : 'border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:border-[var(--text-tertiary)]'
                  }
                `}
                aria-pressed={uiLanguage === lang.code}
              >
                <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]" dir="rtl">
                  {lang.nativeName}
                </span>
                <span className="text-xs text-[var(--text-tertiary)]">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: General ───

function GeneralStep(): JSX.Element {
  const authorName = useAppStore((s) => s.authorName)
  const setAuthorName = useAppStore((s) => s.setAuthorName)
  const defaultLanguage = useAppStore((s) => s.defaultLanguage)
  const setDefaultLanguage = useAppStore((s) => s.setDefaultLanguage)
  const autoSaveIntervalMs = useAppStore((s) => s.autoSaveIntervalMs)
  const setAutoSaveInterval = useAppStore((s) => s.setAutoSaveInterval)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)

  return (
    <div className="space-y-6 py-4">
      <div className="mb-4">
        <h2 className="text-xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">General Settings</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Configure your basic preferences</p>
      </div>

      <SettingsCard title="Author" icon={Settings}>
        <FieldRow label="Author Name" description="Used in collaborator notes and certificates">
          <input
            type="text"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-64 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </FieldRow>
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
      </SettingsCard>
    </div>
  )
}

// ─── Step 3: AI/LLM ───

function AILLMStep(): JSX.Element {
  const ai = useAppStore((s) => s.ai)
  const updateAI = useAppStore((s) => s.updateAISettings)
  const baseBrain = useAppStore((s) => s.baseBrain)
  const updateBaseBrain = useAppStore((s) => s.updateBaseBrain)
  const addBaseBrainFile = useAppStore((s) => s.addBaseBrainFile)
  const removeBaseBrainFile = useAppStore((s) => s.removeBaseBrainFile)
  const [bbExpanded, setBbExpanded] = useState(false)

  function handleBbFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      addBaseBrainFile(file.name, reader.result as string)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6 py-4">
      <div className="mb-4">
        <h2 className="text-xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">AI / LLM Settings</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Connect an AI provider for content generation (optional)</p>
      </div>

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

      {/* Base Brain (Optional) */}
      <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]">
        <button
          onClick={() => setBbExpanded(!bbExpanded)}
          className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-[var(--text-secondary)]" />
            <div>
              <span className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)]">Base Brain (Optional)</span>
              <p className="text-xs text-[var(--text-tertiary)]">Define your design DNA for AI context</p>
            </div>
          </div>
          {bbExpanded ? <ChevronUp size={16} className="text-[var(--text-tertiary)]" /> : <ChevronDown size={16} className="text-[var(--text-tertiary)]" />}
        </button>

        {bbExpanded && (
          <div className="px-4 pb-4 space-y-4 border-t border-[var(--border-default)]">
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">Enable Base Brain</span>
              <ToggleSwitch
                checked={baseBrain.enabled}
                onChange={(v) => updateBaseBrain({ enabled: v })}
                label="Enable Base Brain"
              />
            </div>

            {/* Reference Files */}
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">Reference Files</label>
              {baseBrain.referenceFiles.length > 0 && (
                <div className="space-y-1 mb-2">
                  {baseBrain.referenceFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-md bg-[var(--bg-panel)] border border-[var(--border-default)]">
                      <FileText size={14} className="text-[var(--brand-magenta)] shrink-0" />
                      <span className="text-xs text-[var(--text-primary)] flex-1 truncate">{file.name}</span>
                      <button
                        onClick={() => removeBaseBrainFile(i)}
                        className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                        aria-label={`Remove ${file.name}`}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="w-full flex items-center justify-center gap-2 p-2.5 rounded-md border border-dashed border-[var(--border-default)] text-xs text-[var(--text-secondary)] hover:border-[var(--brand-magenta)] hover:text-[var(--brand-magenta)] transition-colors cursor-pointer">
                <Upload size={14} />
                <span>Upload .md or .docx file</span>
                <input
                  type="file"
                  accept=".md,.markdown,.txt,.docx"
                  onChange={handleBbFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Design Assumptions</label>
              <textarea
                value={baseBrain.designAssumptions}
                onChange={(e) => updateBaseBrain({ designAssumptions: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                placeholder="e.g., All courses use scenario-based learning..."
              />
            </div>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Tone & Voice</label>
              <textarea
                value={baseBrain.toneAndVoice}
                onChange={(e) => updateBaseBrain({ toneAndVoice: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                placeholder="e.g., Professional but approachable..."
              />
            </div>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Goals</label>
              <textarea
                value={baseBrain.goals}
                onChange={(e) => updateBaseBrain({ goals: e.target.value })}
                rows={3}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
                placeholder="e.g., Increase engagement, meet WCAG AA..."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Step 4: Visual APIs ───

function VisualApisStep(): JSX.Element {
  const providers = useAppStore((s) => s.visualApis.providers)
  const updateProvider = useAppStore((s) => s.updateVisualApiProvider)
  const addCustom = useAppStore((s) => s.addCustomVisualApi)
  const removeApi = useAppStore((s) => s.removeVisualApi)

  return (
    <div className="space-y-6 py-4">
      <div className="mb-4">
        <h2 className="text-xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">Visual / Image APIs</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Connect image providers for stock photos in your courses (optional)</p>
      </div>

      <SettingsCard title="Image Providers" icon={Image}>
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
                      className="p-1 rounded cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)]"
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
    </div>
  )
}

// ─── Step 5: Branding ───

function BrandingStep(): JSX.Element {
  const brandKits = useAppStore((s) => s.brandKits)
  const addBrandKit = useAppStore((s) => s.addBrandKit)
  const updateBrandKit = useAppStore((s) => s.updateBrandKit)
  const [editing, setEditing] = useState(false)
  const kit = brandKits[0] ?? null

  function handleCreate() {
    const now = new Date().toISOString()
    const newKit: BrandKit = {
      id: uid('brand'),
      name: 'My Brand',
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
    addBrandKit(newKit)
    setEditing(true)
  }

  return (
    <div className="space-y-6 py-4">
      <div className="mb-4">
        <h2 className="text-xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">Branding</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Create a brand kit for consistent course styling (optional)</p>
      </div>

      {!kit && !editing ? (
        <div className="p-8 text-center rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)]">
          <Palette size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-sm text-[var(--text-secondary)] mb-4">No brand kit yet. Create one to apply your colors and fonts to courses.</p>
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-[var(--font-weight-medium)] text-white bg-[var(--brand-magenta)] rounded-lg hover:bg-[var(--brand-magenta-dark)] transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Create Brand Kit
          </button>
        </div>
      ) : kit ? (
        <SettingsCard title="Brand Kit" icon={Palette}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Name</label>
              <input
                type="text"
                value={kit.name}
                onChange={(e) => updateBrandKit(kit.id, { name: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <ColorInput label="Primary" value={kit.primaryColor} onChange={(v) => updateBrandKit(kit.id, { primaryColor: v })} />
              <ColorInput label="Secondary" value={kit.secondaryColor} onChange={(v) => updateBrandKit(kit.id, { secondaryColor: v })} />
              <ColorInput label="Accent" value={kit.accentColor} onChange={(v) => updateBrandKit(kit.id, { accentColor: v })} />
            </div>
            <GoogleFontPicker
              label="Body Font"
              value={kit.fontFamily}
              onChange={(fontFamily) => updateBrandKit(kit.id, { fontFamily })}
            />
            <GoogleFontPicker
              label="Heading Font"
              value={kit.fontFamilyHeading}
              onChange={(fontFamily) => updateBrandKit(kit.id, { fontFamilyHeading: fontFamily })}
            />
          </div>
        </SettingsCard>
      ) : null}
    </div>
  )
}

// ─── Step 6: Accessibility ───

function AccessibilityStep(): JSX.Element {
  const accessibility = useAppStore((s) => s.accessibility)
  const updateAccessibility = useAppStore((s) => s.updateAccessibilitySettings)

  return (
    <div className="space-y-6 py-4">
      <div className="mb-4">
        <h2 className="text-xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">Accessibility</h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">Customize the authoring experience for your needs</p>
      </div>

      <SettingsCard title="Display" icon={Accessibility}>
        <FieldRow label="High Contrast Mode" description="Increases contrast for better visibility">
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
        <FieldRow label="Reduced Motion" description="Minimize animations and transitions">
          <ToggleSwitch
            checked={accessibility.reducedMotion}
            onChange={(v) => updateAccessibility({ reducedMotion: v })}
            label="Reduced motion"
          />
        </FieldRow>
      </SettingsCard>

      <SettingsCard title="Color & Vision" icon={Accessibility}>
        <FieldRow label="Color Blind Mode" description="Simulates color vision deficiency">
          <div className="flex flex-wrap gap-1">
            {([
              { value: 'none' as const, label: 'None' },
              { value: 'protanopia' as const, label: 'Protanopia' },
              { value: 'deuteranopia' as const, label: 'Deuteranopia' },
              { value: 'tritanopia' as const, label: 'Tritanopia' },
              { value: 'achromatopsia' as const, label: 'Monochrome' }
            ]).map((opt) => (
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

      <SettingsCard title="Reading" icon={Accessibility}>
        <FieldRow label="OpenDyslexic Font" description="Dyslexia-friendly typeface">
          <ToggleSwitch
            checked={accessibility.openDyslexic}
            onChange={(v) => updateAccessibility({ openDyslexic: v })}
            label="OpenDyslexic font"
          />
        </FieldRow>
        <FieldRow label="Enhanced Text Spacing" description="Increase line height, letter and word spacing">
          <ToggleSwitch
            checked={accessibility.enhancedTextSpacing}
            onChange={(v) => updateAccessibility({ enhancedTextSpacing: v })}
            label="Enhanced text spacing"
          />
        </FieldRow>
        <FieldRow label="Enhanced Focus Indicators" description="High-visibility focus outlines for keyboard navigation">
          <ToggleSwitch
            checked={accessibility.enhancedFocusIndicators}
            onChange={(v) => updateAccessibility({ enhancedFocusIndicators: v })}
            label="Enhanced focus indicators"
          />
        </FieldRow>
      </SettingsCard>
    </div>
  )
}

// ─── Step 7: Complete ───

function CompleteStep({ onFinish }: { onFinish: () => void }): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-6">
        <CheckCircle size={32} className="text-emerald-600" />
      </div>
      <h1 className="text-3xl font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-3">
        You're all set!
      </h1>
      <p className="text-base text-[var(--text-secondary)] max-w-md mb-8">
        Your workspace is configured and ready. You can always adjust these settings later from the Settings page.
      </p>
      <button
        onClick={onFinish}
        className="inline-flex items-center gap-2 px-8 py-3 text-base font-[var(--font-weight-medium)] text-white bg-[var(--brand-magenta)] rounded-lg hover:bg-[var(--brand-magenta-dark)] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
      >
        Get Started
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
