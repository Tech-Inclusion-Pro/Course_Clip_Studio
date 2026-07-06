/**
 * Bind a citation source to a Content Area (spec §8).
 *
 * Enter a DOI → resolve via the first enabled citation source → Tier-1 DOI
 * validation → local APA 7 → write a .md note into the area's files/ dir and
 * attach it as a ContentAreaFile carrying priority, provenance context, and the
 * live-link fields. Because the area's files already feed AI generation, the note
 * participates in authoring immediately.
 */

import { useState, useEffect } from 'react'
import { X, BookMarked, CheckCircle2, AlertTriangle, HelpCircle, Loader2, BadgeCheck } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/stores/useAppStore'
import { getFirstEnabledCitationProvider, lookupByDoi } from '@/lib/citations'
import { authorIdentityFor } from '@/lib/citations/orcid'
import { verifyDoi } from '@/lib/citations/verify'
import { formatApa } from '@/lib/citations/apa'
import { buildBinding } from '@/lib/citations/binding'
import type { CitationSourceRecord, Tier1Result } from '@/types/citations'
import type { ContentArea } from '@/types/course'

interface Props {
  contentArea: ContentArea
  onClose: () => void
}

const TIER1_BADGE: Record<
  Tier1Result['state'],
  { label: string; icon: typeof CheckCircle2; color: string }
> = {
  verified: { label: 'DOI verified', icon: CheckCircle2, color: '#2e7d32' },
  mismatch: { label: 'Check metadata', icon: AlertTriangle, color: '#ed6c02' },
  not_found: { label: 'DOI not found', icon: AlertTriangle, color: '#d32f2f' },
  no_doi: { label: 'No DOI', icon: HelpCircle, color: '#9e9e9e' }
}

export function BindCitationDialog({ contentArea, onClose }: Props): JSX.Element {
  const workspacePath = useAppStore((s) => s.workspacePath)
  const providers = useAppStore((s) => s.citationApis.providers)
  const addContentAreaFile = useAppStore((s) => s.addContentAreaFile)

  const [doi, setDoi] = useState('')
  const [status, setStatus] = useState<'idle' | 'resolving' | 'resolved' | 'saving'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [record, setRecord] = useState<CitationSourceRecord | null>(null)
  const [tier1, setTier1] = useState<Tier1Result | null>(null)
  const [apa, setApa] = useState<string>('')
  const [priority, setPriority] = useState<1 | 2 | 3>(2)
  const [live, setLive] = useState(true)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const provider = getFirstEnabledCitationProvider(providers)

  async function handleResolve() {
    setError(null)
    setRecord(null)
    setTier1(null)
    if (!provider) {
      setError('No citation source is enabled. Enable one in Settings → AI.')
      return
    }
    if (!doi.trim()) {
      setError('Enter a DOI to resolve.')
      return
    }
    setStatus('resolving')
    try {
      const rec = await lookupByDoi(provider, doi.trim())
      if (!rec) {
        setStatus('idle')
        setError('That DOI could not be found. Check it and try again.')
        return
      }
      const t1 = await verifyDoi(rec.DOI ?? doi.trim(), undefined, provider.contactEmail)
      setRecord(rec)
      setTier1(t1)
      setApa(formatApa(rec).text)
      setStatus('resolved')
    } catch {
      setStatus('idle')
      setError('Something went wrong resolving the source. Try again shortly.')
    }
  }

  async function handleAttach() {
    if (!record || !tier1 || !workspacePath) return
    setStatus('saving')
    try {
      const { file, markdown } = buildBinding({
        contentAreaId: contentArea.id,
        workspacePath,
        record,
        tier1,
        priority,
        live,
        existingNames: (contentArea.files ?? []).map((f) => f.name)
      })

      // Ensure the files/ directory tree exists, then write the note.
      const caDir = `${workspacePath}/content-areas`
      const idDir = `${caDir}/${contentArea.id}`
      const filesDir = `${idDir}/files`
      for (const dir of [caDir, idDir, filesDir]) {
        if (!(await window.electronAPI.fs.exists(dir))) {
          await window.electronAPI.fs.mkdir(dir)
        }
      }
      await window.electronAPI.fs.writeFile(file.path, markdown)

      addContentAreaFile(contentArea.id, file)
      onClose()
    } catch {
      setStatus('resolved')
      setError('Could not save the note to the workspace. Check the folder and try again.')
    }
  }

  const badge = tier1 ? TIER1_BADGE[tier1.state] : null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={`Cite a source for ${contentArea.name}`}
    >
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto mx-4 p-6 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-default)] shadow-[var(--shadow-xl)]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <BookMarked size={18} className="text-[var(--brand-indigo)]" />
          <h2 className="text-base font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Cite a source
          </h2>
        </div>
        <p className="text-xs text-[var(--text-tertiary)] mb-4">
          Adds a verified, APA-formatted reference to <strong>{contentArea.name}</strong> that guides
          AI authoring. Only the DOI leaves your machine.
        </p>

        {!provider && (
          <p
            role="alert"
            className="mb-3 text-xs text-[var(--color-danger-700,#b91c1c)] bg-[var(--color-danger-100,#fee2e2)] rounded-md px-3 py-2"
          >
            No citation source is enabled. Enable one in Settings → AI → Citation &amp; Research
            Sources.
          </p>
        )}

        <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
          DOI
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleResolve()}
            placeholder="10.1037/0003-066X.59.1.29"
            className="flex-1 px-2.5 py-2 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--ring-brand)]"
          />
          <Button onClick={handleResolve} disabled={status === 'resolving' || !provider}>
            {status === 'resolving' ? <Loader2 size={16} className="animate-spin" /> : 'Resolve'}
          </Button>
        </div>

        {error && (
          <p role="alert" className="mt-2 text-xs text-[var(--color-danger-700,#b91c1c)]">
            {error}
          </p>
        )}

        {status !== 'idle' && record && tier1 && (
          <div className="mt-4 space-y-3">
            <div className="p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)]">
              <div aria-live="polite" className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                {badge && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-[var(--font-weight-medium)]"
                    style={{ color: badge.color }}
                  >
                    <badge.icon size={14} aria-hidden="true" />
                    {badge.label}
                  </span>
                )}
                {authorIdentityFor(record) === 'orcid_verified' && (
                  <span
                    className="inline-flex items-center gap-1.5 text-xs font-[var(--font-weight-medium)]"
                    style={{ color: '#2e7d32' }}
                  >
                    <BadgeCheck size={14} aria-hidden="true" />
                    Author verified (ORCID)
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--text-primary)]">{apa}</p>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                Priority
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value) as 1 | 2 | 3)}
                  className="px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] cursor-pointer"
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                </select>
              </label>
              <label className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                <input
                  type="checkbox"
                  checked={live}
                  onChange={(e) => setLive(e.target.checked)}
                  className="w-4 h-4"
                />
                Keep live (re-verify when opened)
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleAttach} disabled={status === 'saving' || !workspacePath}>
                {status === 'saving' ? 'Saving…' : `Attach to ${contentArea.name}`}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
