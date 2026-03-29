import { useState } from 'react'
import {
  Palette,
  Type,
  Monitor,
  ChevronDown,
  ChevronUp,
  X,
  Eye
} from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { contrastRatio, formatRatio, contrastLabel } from '@/lib/contrast'
import type { CourseTheme, PlayerShellConfig } from '@/types/course'

interface ThemeEditorProps {
  onClose: () => void
}

export function ThemeEditor({ onClose }: ThemeEditorProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateCourseTheme = useCourseStore((s) => s.updateCourseTheme)

  const [expandedSection, setExpandedSection] = useState<string | null>('colors')

  if (!course || !activeCourseId) {
    return (
      <div className="p-4">
        <p className="text-sm text-[var(--text-tertiary)]">No course loaded.</p>
      </div>
    )
  }

  const theme = course.theme

  function handleUpdate(partial: Partial<CourseTheme>) {
    if (activeCourseId) {
      updateCourseTheme(activeCourseId, partial)
    }
  }

  function handlePlayerUpdate(partial: Partial<PlayerShellConfig>) {
    handleUpdate({
      playerShell: { ...theme.playerShell, ...partial }
    })
  }

  function toggleSection(section: string) {
    setExpandedSection((prev) => (prev === section ? null : section))
  }

  // Compute contrast ratios
  const textBgRatio = contrastRatio(theme.textColor, theme.backgroundColor)
  const textSurfaceRatio = contrastRatio(theme.textColor, theme.surfaceColor)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <Palette size={16} className="text-[var(--brand-magenta)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Course Theme
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          aria-label="Close theme editor"
        >
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Theme name */}
        <div className="px-4 py-3 border-b border-[var(--border-default)]">
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Theme Name
          </label>
          <input
            type="text"
            value={theme.name}
            onChange={(e) => handleUpdate({ name: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>

        {/* Colors Section */}
        <ThemeSection
          title="Colors"
          icon={Palette}
          expanded={expandedSection === 'colors'}
          onToggle={() => toggleSection('colors')}
        >
          <div className="space-y-3">
            <ColorField label="Primary" value={theme.primaryColor} onChange={(v) => handleUpdate({ primaryColor: v })} />
            <ColorField label="Secondary" value={theme.secondaryColor} onChange={(v) => handleUpdate({ secondaryColor: v })} />
            <ColorField label="Accent" value={theme.accentColor} onChange={(v) => handleUpdate({ accentColor: v })} />

            <div className="border-t border-[var(--border-default)] pt-3 mt-3">
              <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">Background & Surface</p>
              <div className="space-y-3">
                <ColorField label="Background" value={theme.backgroundColor} onChange={(v) => handleUpdate({ backgroundColor: v })} />
                <ColorField label="Surface" value={theme.surfaceColor} onChange={(v) => handleUpdate({ surfaceColor: v })} />
                <ColorField label="Text" value={theme.textColor} onChange={(v) => handleUpdate({ textColor: v })} />
              </div>
            </div>

            {/* WCAG Contrast Preview */}
            <div className="border-t border-[var(--border-default)] pt-3 mt-3">
              <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">WCAG Contrast</p>
              <div className="space-y-2">
                <ContrastIndicator label="Text on Background" ratio={textBgRatio} />
                <ContrastIndicator label="Text on Surface" ratio={textSurfaceRatio} />
              </div>
            </div>

            {/* Live preview swatch */}
            <div className="border-t border-[var(--border-default)] pt-3 mt-3">
              <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
                <Eye size={12} className="inline mr-1" />
                Preview
              </p>
              <div
                className="rounded-lg p-4 border"
                style={{
                  backgroundColor: theme.backgroundColor,
                  borderColor: theme.primaryColor
                }}
              >
                <p
                  style={{
                    color: theme.textColor,
                    fontFamily: theme.fontFamily || 'inherit',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '4px'
                  }}
                >
                  Sample Heading
                </p>
                <p
                  style={{
                    color: theme.textColor,
                    fontFamily: theme.fontFamily || 'inherit',
                    fontSize: '12px',
                    opacity: 0.7
                  }}
                >
                  This is how your course text will appear to learners.
                </p>
                <div className="flex gap-2 mt-3">
                  <button
                    className="px-3 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: theme.primaryColor }}
                  >
                    Primary
                  </button>
                  <button
                    className="px-3 py-1 rounded text-xs text-white"
                    style={{ backgroundColor: theme.accentColor }}
                  >
                    Accent
                  </button>
                </div>
              </div>
            </div>
          </div>
        </ThemeSection>

        {/* Typography Section */}
        <ThemeSection
          title="Typography"
          icon={Type}
          expanded={expandedSection === 'typography'}
          onToggle={() => toggleSection('typography')}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Body Font
              </label>
              <select
                value={theme.fontFamily}
                onChange={(e) => handleUpdate({ fontFamily: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              >
                <option value="Arial, sans-serif">Arial (Default)</option>
                <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Times New Roman', serif">Times New Roman</option>
                <option value="Verdana, sans-serif">Verdana</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option value="system-ui, sans-serif">System UI</option>
                <option value="'Segoe UI', sans-serif">Segoe UI</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Heading Font
              </label>
              <select
                value={theme.fontFamilyHeading}
                onChange={(e) => handleUpdate({ fontFamilyHeading: e.target.value })}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              >
                <option value="Arial, sans-serif">Arial (Default)</option>
                <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
                <option value="Impact, sans-serif">Impact</option>
                <option value="system-ui, sans-serif">System UI</option>
              </select>
            </div>
          </div>
        </ThemeSection>

        {/* Player Shell Section */}
        <ThemeSection
          title="Player Shell"
          icon={Monitor}
          expanded={expandedSection === 'player'}
          onToggle={() => toggleSection('player')}
        >
          <div className="space-y-3">
            <ColorField
              label="Header Color"
              value={theme.playerShell.headerColor}
              onChange={(v) => handlePlayerUpdate({ headerColor: v })}
            />
            <ColorField
              label="Progress Bar"
              value={theme.playerShell.progressBarColor}
              onChange={(v) => handlePlayerUpdate({ progressBarColor: v })}
            />
            <ColorField
              label="Background"
              value={theme.playerShell.backgroundColor}
              onChange={(v) => handlePlayerUpdate({ backgroundColor: v })}
            />
            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Button Style
              </label>
              <select
                value={theme.playerShell.buttonStyle}
                onChange={(e) => handlePlayerUpdate({ buttonStyle: e.target.value as 'rounded' | 'square' | 'pill' })}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              >
                <option value="rounded">Rounded</option>
                <option value="square">Square</option>
                <option value="pill">Pill</option>
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={theme.playerShell.showLogo}
                onChange={(e) => handlePlayerUpdate({ showLogo: e.target.checked })}
                className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
              />
              <span className="text-xs text-[var(--text-secondary)]">Show logo in player header</span>
            </label>
          </div>
        </ThemeSection>

        {/* Dark Mode + Custom CSS */}
        <ThemeSection
          title="Advanced"
          icon={Palette}
          expanded={expandedSection === 'advanced'}
          onToggle={() => toggleSection('advanced')}
        >
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={theme.darkMode}
                onChange={(e) => handleUpdate({ darkMode: e.target.checked })}
                className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
              />
              <span className="text-xs text-[var(--text-secondary)]">Enable dark mode for learner view</span>
            </label>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Custom CSS
              </label>
              <textarea
                value={theme.customCSS}
                onChange={(e) => handleUpdate({ customCSS: e.target.value })}
                rows={5}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                placeholder="/* Custom CSS injected into the learner player shell */"
              />
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                This CSS will be injected into the exported player shell. Use with care.
              </p>
            </div>

            <div>
              <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
                Logo Path
              </label>
              <input
                type="text"
                value={theme.logoPath ?? ''}
                onChange={(e) => handleUpdate({ logoPath: e.target.value || null })}
                className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                placeholder="Path to logo file..."
              />
            </div>
          </div>
        </ThemeSection>
      </div>
    </div>
  )
}

// ─── Helper Components ───

function ThemeSection({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children
}: {
  title: string
  icon: typeof Palette
  expanded: boolean
  onToggle: () => void
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="border-b border-[var(--border-default)]">
      <button
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left cursor-pointer hover:bg-[var(--bg-hover)] transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <Icon size={14} className="text-[var(--text-tertiary)]" />
          <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {title}
          </span>
        </div>
        {expanded ? <ChevronUp size={14} className="text-[var(--text-tertiary)]" /> : <ChevronDown size={14} className="text-[var(--text-tertiary)]" />}
      </button>
      {expanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

function ColorField({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (value: string) => void
}): JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <label className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-md border border-[var(--border-default)] cursor-pointer p-0.5"
          title={`${label}: ${value}`}
        />
        <div className="min-w-0">
          <span className="text-xs text-[var(--text-secondary)] block">{label}</span>
          <span className="text-[10px] text-[var(--text-tertiary)] font-mono block">{value}</span>
        </div>
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => {
          const v = e.target.value
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
        }}
        className="w-20 px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
        aria-label={`${label} hex value`}
      />
    </div>
  )
}

function ContrastIndicator({
  label,
  ratio
}: {
  label: string
  ratio: number | null
}): JSX.Element {
  if (ratio === null) {
    return (
      <div className="flex items-center justify-between text-xs">
        <span className="text-[var(--text-tertiary)]">{label}</span>
        <span className="text-[var(--text-tertiary)]">N/A</span>
      </div>
    )
  }

  const info = contrastLabel(ratio)
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-[var(--text-secondary)]">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-[var(--text-primary)] font-mono">{formatRatio(ratio)}</span>
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-[var(--font-weight-semibold)] text-white"
          style={{ backgroundColor: info.color }}
        >
          {info.label}
        </span>
      </div>
    </div>
  )
}
