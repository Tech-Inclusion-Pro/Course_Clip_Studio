/**
 * Custom presentation theme builder (spec: extends the accessibility considerations).
 * Colors are edited live and re-checked against WCAG AA on every change via
 * verifyThemeContrast — a theme can only be saved once it passes, or with an explicit
 * override reason (mirroring the render-step contrast gate).
 */

import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ColorInput } from '@/components/ui/ColorInput'
import { useAppStore } from '@/stores/useAppStore'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { verifyThemeContrast } from '@/lib/presentation/wcag-verifier'
import { uid } from '@/lib/uid'
import { ContrastReportPanel } from './ContrastReportPanel'
import type { PresentationTheme } from '@/types/presentation'

interface Props {
  base: PresentationTheme
  editingId?: string // when editing an existing custom theme
  onClose: () => void
}

const FIELDS: { key: keyof PresentationTheme; label: string }[] = [
  { key: 'background', label: 'Background' },
  { key: 'surface', label: 'Surface' },
  { key: 'textPrimary', label: 'Text' },
  { key: 'accent', label: 'Accent' },
  { key: 'accentSecondary', label: 'Accent 2' },
  { key: 'textOnAccent', label: 'Text on accent' }
]

export function ThemeBuilder({ base, editingId, onClose }: Props): JSX.Element {
  const saveTheme = useAppStore((s) => s.saveCustomPresentationTheme)
  const setThemeId = usePresentationStore((s) => s.setThemeId)

  const [theme, setTheme] = useState<PresentationTheme>({
    ...base,
    id: editingId ?? uid('theme'),
    name: editingId ? base.name : 'My Theme'
  })
  const [override, setOverride] = useState('')

  const report = verifyThemeContrast(theme)
  const canSave = theme.name.trim().length > 0 && (report.allPass || override.trim().length > 0)

  function set(key: keyof PresentationTheme, value: string) {
    setTheme((t) => ({ ...t, [key]: value }))
  }

  function handleSave() {
    saveTheme(theme)
    setThemeId(theme.id)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label="Custom theme builder"
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-lg max-h-[88vh] overflow-y-auto mx-4 p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-xl)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <h2 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-4">
          {editingId ? 'Edit theme' : 'New theme'}
        </h2>

        <div className="mb-3">
          <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
            Theme name
          </label>
          <input
            type="text"
            value={theme.name}
            onChange={(e) => setTheme((t) => ({ ...t, name: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          {FIELDS.map((f) => (
            <ColorInput
              key={f.key}
              label={f.label}
              value={theme[f.key] as string}
              onChange={(v) => set(f.key, v)}
            />
          ))}
        </div>

        {/* Live preview */}
        <div
          className="rounded-lg border border-[var(--border-default)] p-4 mb-3"
          style={{ background: theme.background, color: theme.textPrimary }}
        >
          <div className="text-sm font-semibold mb-1">Preview title</div>
          <div className="text-xs mb-2">Body text on the background.</div>
          <span
            className="inline-block text-xs px-2 py-1 rounded"
            style={{ background: theme.accent, color: theme.textOnAccent }}
          >
            Accent chip
          </span>
        </div>

        {/* Live WCAG report */}
        <div className="mb-3">
          <ContrastReportPanel report={report} />
        </div>

        {!report.allPass && (
          <div className="mb-3">
            <label className="block text-xs text-amber-700 mb-1">
              This theme doesn't meet WCAG AA. Add a reason to save it anyway.
            </label>
            <input
              type="text"
              value={override}
              onChange={(e) => setOverride(e.target.value)}
              placeholder="Reason for override…"
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-amber-300 bg-[var(--bg-surface)] text-[var(--text-primary)]"
            />
          </div>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            Save theme
          </Button>
        </div>
      </div>
    </div>
  )
}
