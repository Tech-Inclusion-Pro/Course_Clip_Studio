import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { AssetMetadata, UDLPrinciple, WCAGStatus, ProjectScope } from '@/types/media'

interface AssetMetadataEditorProps {
  open: boolean
  initialData: Partial<AssetMetadata> | null
  onSave: (metadata: Partial<AssetMetadata>) => void
  onClose: () => void
  isNewAsset?: boolean
}

const UDL_OPTIONS: Array<{ value: UDLPrinciple; label: string }> = [
  { value: 'representation', label: 'Representation' },
  { value: 'action-expression', label: 'Action & Expression' },
  { value: 'engagement', label: 'Engagement' },
  { value: 'multiple', label: 'Multiple Principles' }
]

const WCAG_OPTIONS: Array<{ value: WCAGStatus; label: string }> = [
  { value: 'complete', label: 'Complete' },
  { value: 'incomplete', label: 'Incomplete' },
  { value: 'flagged', label: 'Flagged' }
]

const LICENSE_OPTIONS = [
  'Built-in (Lumina UDL)',
  'CC0 (Public Domain)',
  'CC BY 4.0',
  'CC BY-SA 4.0',
  'CC BY-NC 4.0',
  'CC BY-NC-SA 4.0',
  'Royalty-Free',
  'Custom / Other'
]

export function AssetMetadataEditor({
  open,
  initialData,
  onSave,
  onClose,
  isNewAsset
}: AssetMetadataEditorProps): JSX.Element | null {
  const dialogRef = useRef<HTMLDivElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)

  const [title, setTitle] = useState('')
  const [altText, setAltText] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [ariaLabel, setAriaLabel] = useState('')
  const [source, setSource] = useState('')
  const [license, setLicense] = useState('CC0 (Public Domain)')
  const [udlTag, setUdlTag] = useState<UDLPrinciple>('representation')
  const [wcagStatus, setWcagStatus] = useState<WCAGStatus>('incomplete')
  const [language, setLanguage] = useState('en')
  const [tags, setTags] = useState('')
  const [projectScope, setProjectScope] = useState<ProjectScope>('project')

  // Populate from initial data
  useEffect(() => {
    if (open && initialData) {
      setTitle(initialData.title ?? '')
      setAltText(initialData.altText ?? '')
      setLongDescription(initialData.longDescription ?? '')
      setAriaLabel(initialData.ariaLabel ?? '')
      setSource(initialData.source ?? '')
      setLicense(initialData.license ?? 'CC0 (Public Domain)')
      setUdlTag(initialData.udlTag ?? 'representation')
      setWcagStatus(initialData.wcagStatus ?? 'incomplete')
      setLanguage(initialData.language ?? 'en')
      setTags(initialData.tags?.join(', ') ?? '')
      setProjectScope(initialData.projectScope ?? 'project')
    }
  }, [open, initialData])

  // Focus trap
  useEffect(() => {
    if (open) {
      returnFocusRef.current = document.activeElement as HTMLElement
      setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('input')?.focus(), 50)
    }
    return () => {
      returnFocusRef.current?.focus()
    }
  }, [open])

  // Escape to close
  useEffect(() => {
    if (!open) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  function handleSave() {
    const parsedTags = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    onSave({
      title: title.trim() || 'Untitled Asset',
      altText: altText.trim(),
      longDescription: longDescription.trim() || undefined,
      ariaLabel: ariaLabel.trim() || undefined,
      source: source.trim() || undefined,
      license,
      udlTag,
      wcagStatus: altText.trim() ? wcagStatus : 'incomplete',
      language,
      tags: parsedTags,
      projectScope
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Edit asset metadata"
    >
      <div
        ref={dialogRef}
        className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] shrink-0">
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {isNewAsset ? 'Add Asset Metadata' : 'Edit Asset Metadata'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* Title */}
          <Field label="Title *">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Asset title"
              required
            />
          </Field>

          {/* Alt Text */}
          <Field label="Alt Text *">
            <textarea
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              rows={2}
              className={`${INPUT_CLASS} resize-none`}
              placeholder="Descriptive text for screen readers"
            />
          </Field>

          {/* Long Description */}
          <Field label="Long Description">
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              rows={2}
              className={`${INPUT_CLASS} resize-none`}
              placeholder="Optional extended description"
            />
          </Field>

          {/* ARIA Label */}
          <Field label="ARIA Label">
            <input
              type="text"
              value={ariaLabel}
              onChange={(e) => setAriaLabel(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Label for assistive technology"
            />
          </Field>

          {/* Source / Credit */}
          <Field label="Source / Credit">
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              className={INPUT_CLASS}
              placeholder="Attribution or source URL"
            />
          </Field>

          {/* License */}
          <Field label="License">
            <select
              value={license}
              onChange={(e) => setLicense(e.target.value)}
              className={INPUT_CLASS}
            >
              {LICENSE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </Field>

          {/* UDL Tag */}
          <Field label="UDL Principle">
            <select
              value={udlTag}
              onChange={(e) => setUdlTag(e.target.value as UDLPrinciple)}
              className={INPUT_CLASS}
            >
              {UDL_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          {/* WCAG Status */}
          <Field label="Accessibility Status">
            <select
              value={wcagStatus}
              onChange={(e) => setWcagStatus(e.target.value as WCAGStatus)}
              className={INPUT_CLASS}
            >
              {WCAG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>

          {/* Language */}
          <Field label="Language">
            <input
              type="text"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className={INPUT_CLASS}
              placeholder="en"
            />
          </Field>

          {/* Tags */}
          <Field label="Tags (comma-separated)">
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className={INPUT_CLASS}
              placeholder="photo, nature, landscape"
            />
          </Field>

          {/* Project Scope */}
          <Field label="Scope">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-1.5 text-sm text-[var(--text-primary)] cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="project"
                  checked={projectScope === 'project'}
                  onChange={() => setProjectScope('project')}
                />
                Project only
              </label>
              <label className="flex items-center gap-1.5 text-sm text-[var(--text-primary)] cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="global"
                  checked={projectScope === 'global'}
                  onChange={() => setProjectScope('global')}
                />
                Global (all projects)
              </label>
            </div>
          </Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--border-default)] shrink-0">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            {isNewAsset ? 'Add Asset' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───

const INPUT_CLASS =
  'w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]'

function Field({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}
