import { useState, useMemo, useRef } from 'react'
import {
  X,
  Award,
  Eye,
  EyeOff,
  FileDown,
  Check,
  Image as ImageIcon,
  Type
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourseStore } from '@/stores/useCourseStore'
import {
  CERTIFICATE_TEMPLATES,
  renderCertificate,
  type CertificateTemplate
} from '@/lib/certificate'
import { downloadBlob } from '@/lib/scorm'
import type { CertificateConfig } from '@/types/course'

interface CertificateDesignerProps {
  onClose: () => void
}

export function CertificateDesigner({ onClose }: CertificateDesignerProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateCourse = useCourseStore((s) => s.updateCourse)

  const cert = course?.certificate ?? null
  const [showPreview, setShowPreview] = useState(false)

  function updateCert(partial: Partial<CertificateConfig>) {
    if (!activeCourseId) return
    const current: CertificateConfig = cert ?? {
      enabled: false,
      template: CERTIFICATE_TEMPLATES[0].html,
      triggerOnCompletion: true,
      passScoreRequired: null,
      logoPath: null,
      signatureLine: '',
      brandColors: true
    }
    updateCourse(activeCourseId, { certificate: { ...current, ...partial } })
  }

  function selectTemplate(template: CertificateTemplate) {
    updateCert({ template: template.html })
  }

  function toggleEnabled() {
    updateCert({ enabled: !cert?.enabled })
  }

  // Determine which template is currently selected
  const currentTemplateId = useMemo(() => {
    if (!cert?.template) return 'formal'
    const match = CERTIFICATE_TEMPLATES.find((t) => t.html === cert.template)
    return match?.id ?? 'custom'
  }, [cert?.template])

  // Preview HTML with sample data
  const previewHtml = useMemo(() => {
    if (!cert?.template || !course) return ''
    return renderCertificate(cert.template, {
      learner_name: 'Jane Doe',
      course_title: course.meta.title,
      completion_date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      score: '92%',
      instructor: course.meta.author || 'Course Author',
      signature: cert.signatureLine || course.meta.author || 'Course Author',
      logoPath: cert.logoPath ?? course.theme.logoPath
    })
  }, [cert?.template, cert?.signatureLine, cert?.logoPath, course])

  async function handleExportPreview() {
    if (!previewHtml) return

    // Try Electron PDF generation
    if (window.electronAPI?.pdf?.generate) {
      try {
        const pdfBuffer = await window.electronAPI.pdf.generate(previewHtml, {
          pageSize: 'A4',
          printBackground: true
        })
        const blob = new Blob([pdfBuffer], { type: 'application/pdf' })
        downloadBlob(blob, 'certificate_preview.pdf')
        return
      } catch {
        // Fallback to HTML
      }
    }

    // Fallback: download as HTML
    const blob = new Blob([previewHtml], { type: 'text/html' })
    downloadBlob(blob, 'certificate_preview.html')
  }

  if (!course) return <div />

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <Award size={16} className="text-[var(--brand-magenta)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Certificate Designer
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Close certificate designer"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {/* Enable toggle */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              Enable Certificate
            </div>
            <p className="text-[10px] text-[var(--text-tertiary)]">
              Award a certificate upon course completion
            </p>
          </div>
          <button
            onClick={toggleEnabled}
            role="switch"
            aria-checked={cert?.enabled ?? false}
            className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
              cert?.enabled
                ? 'bg-[var(--brand-magenta)]'
                : 'bg-[var(--border-default)]'
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                cert?.enabled ? 'translate-x-[18px]' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>

        {cert?.enabled && (
          <>
            {/* Template selection */}
            <div>
              <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] block mb-2">
                Template
              </label>
              <div className="space-y-1.5">
                {CERTIFICATE_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    onClick={() => selectTemplate(tmpl)}
                    className={`w-full flex items-center gap-2.5 p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                      currentTemplateId === tmpl.id
                        ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5'
                        : 'border-[var(--border-default)] hover:border-[var(--brand-magenta)]/50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      currentTemplateId === tmpl.id ? 'border-[var(--brand-magenta)]' : 'border-[var(--border-default)]'
                    }`}>
                      {currentTemplateId === tmpl.id && (
                        <Check size={10} className="text-[var(--brand-magenta)]" />
                      )}
                    </div>
                    <div>
                      <div className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                        {tmpl.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-tertiary)]">
                        {tmpl.description}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Trigger settings */}
            <div>
              <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] block mb-2">
                Trigger
              </label>
              <div className="space-y-1.5">
                <label className="flex items-center gap-2 p-2 rounded-md border border-[var(--border-default)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors">
                  <input
                    type="checkbox"
                    checked={cert?.triggerOnCompletion ?? true}
                    onChange={(e) => updateCert({ triggerOnCompletion: e.target.checked })}
                    className="accent-[var(--brand-magenta)] cursor-pointer"
                  />
                  <span className="text-xs text-[var(--text-primary)]">
                    Award on course completion
                  </span>
                </label>
              </div>

              <div className="mt-2">
                <label className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-secondary)] block mb-1">
                  Required Pass Score (optional)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={cert?.passScoreRequired ?? ''}
                    onChange={(e) =>
                      updateCert({
                        passScoreRequired: e.target.value ? parseInt(e.target.value) : null
                      })
                    }
                    placeholder="None"
                    className="w-20 px-2 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
                  />
                  <span className="text-[10px] text-[var(--text-tertiary)]">%</span>
                </div>
              </div>
            </div>

            {/* Signature */}
            <div>
              <label
                htmlFor="cert-signature"
                className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] flex items-center gap-1 mb-1"
              >
                <Type size={12} />
                Signature Line
              </label>
              <input
                id="cert-signature"
                type="text"
                value={cert?.signatureLine ?? ''}
                onChange={(e) => updateCert({ signatureLine: e.target.value })}
                placeholder={course.meta.author || 'Enter name...'}
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              />
            </div>

            {/* Logo */}
            <div>
              <label
                htmlFor="cert-logo"
                className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] flex items-center gap-1 mb-1"
              >
                <ImageIcon size={12} />
                Logo Path
              </label>
              <input
                id="cert-logo"
                type="text"
                value={cert?.logoPath ?? ''}
                onChange={(e) => updateCert({ logoPath: e.target.value || null })}
                placeholder="Path or data URI (optional)"
                className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              />
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                Uses course theme logo if left blank.
              </p>
            </div>

            {/* Brand colors toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                  Use Brand Colors
                </div>
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  Apply course theme colors to certificate
                </p>
              </div>
              <button
                onClick={() => updateCert({ brandColors: !cert?.brandColors })}
                role="switch"
                aria-checked={cert?.brandColors ?? true}
                className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${
                  cert?.brandColors
                    ? 'bg-[var(--brand-magenta)]'
                    : 'bg-[var(--border-default)]'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    cert?.brandColors ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Custom HTML editor */}
            <div>
              <label
                htmlFor="cert-custom-html"
                className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] block mb-1"
              >
                Custom Template HTML
              </label>
              <textarea
                id="cert-custom-html"
                value={cert?.template ?? ''}
                onChange={(e) => updateCert({ template: e.target.value })}
                rows={6}
                className="w-full px-2.5 py-1.5 text-[10px] font-mono rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
                placeholder="Paste or edit HTML template..."
              />
              <p className="text-[10px] text-[var(--text-tertiary)] mt-1">
                Variables: {'{{learner_name}}'}, {'{{course_title}}'}, {'{{completion_date}}'}, {'{{score}}'}, {'{{instructor}}'}, {'{{signature}}'}, {'{{logo_img}}'}
              </p>
            </div>

            {/* Preview toggle + export */}
            <div className="space-y-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
                className="w-full"
              >
                {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </Button>

              {showPreview && (
                <div className="rounded-lg border border-[var(--border-default)] overflow-hidden bg-white">
                  <iframe
                    srcDoc={previewHtml}
                    title="Certificate preview"
                    className="w-full h-48 border-0"
                    sandbox="allow-same-origin"
                  />
                </div>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportPreview}
                className="w-full"
              >
                <FileDown size={14} />
                Export Preview PDF
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
