import { useState, useMemo, useRef, useCallback } from 'react'
import {
  X,
  Award,
  Eye,
  EyeOff,
  FileDown,
  Check,
  Image as ImageIcon,
  Type,
  Upload,
  Move,
  Plus,
  Trash2,
  Maximize2,
  Minimize2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourseStore } from '@/stores/useCourseStore'
import {
  CERTIFICATE_TEMPLATES,
  renderCertificate,
  type CertificateTemplate
} from '@/lib/certificate'
import { downloadBlob } from '@/lib/scorm'
import { uid } from '@/lib/uid'
import type { CertificateConfig, CertificateField } from '@/types/course'

const DEFAULT_FIELDS: CertificateField[] = [
  { id: 'f-name', label: 'Learner Name', variable: '{{learner_name}}', x: 50, y: 45, fontSize: 26, fontWeight: 'bold', color: '#3a2b95', textAlign: 'center' },
  { id: 'f-course', label: 'Course Title', variable: '{{course_title}}', x: 50, y: 25, fontSize: 20, fontWeight: 'bold', color: '#1a1a2e', textAlign: 'center' },
  { id: 'f-date', label: 'Date', variable: '{{completion_date}}', x: 25, y: 80, fontSize: 11, fontWeight: 'normal', color: '#4a4a6a', textAlign: 'center' },
  { id: 'f-score', label: 'Score', variable: '{{score}}', x: 50, y: 80, fontSize: 11, fontWeight: 'normal', color: '#4a4a6a', textAlign: 'center' },
  { id: 'f-sig', label: 'Signature', variable: '{{signature}}', x: 75, y: 80, fontSize: 11, fontWeight: 'normal', color: '#4a4a6a', textAlign: 'center' }
]

interface CertificateDesignerProps {
  onClose: () => void
}

export function CertificateDesigner({ onClose }: CertificateDesignerProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateCourse = useCourseStore((s) => s.updateCourse)

  const cert = course?.certificate ?? null
  const [showPreview, setShowPreview] = useState(false)
  const [designerMode, setDesignerMode] = useState(false)
  const [enlargedDesigner, setEnlargedDesigner] = useState(false)
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ fieldId: string; startX: number; startY: number; fieldX: number; fieldY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

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

  const fields = cert?.fields ?? DEFAULT_FIELDS
  const backgroundImage = cert?.backgroundImage ?? null

  function updateField(fieldId: string, partial: Partial<CertificateField>) {
    const newFields = fields.map((f) => (f.id === fieldId ? { ...f, ...partial } : f))
    updateCert({ fields: newFields })
  }

  function addField() {
    const newField: CertificateField = {
      id: uid('cf'),
      label: 'New Field',
      variable: '',
      x: 50,
      y: 50,
      fontSize: 14,
      fontWeight: 'normal',
      color: '#1a1a2e',
      textAlign: 'center'
    }
    updateCert({ fields: [...fields, newField] })
    setSelectedFieldId(newField.id)
  }

  function removeField(fieldId: string) {
    updateCert({ fields: fields.filter((f) => f.id !== fieldId) })
    if (selectedFieldId === fieldId) setSelectedFieldId(null)
  }

  async function handleUploadBackground() {
    if (!window.electronAPI?.dialog?.openFile) return
    try {
      const result = await window.electronAPI.dialog.openFile({
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg'] }]
      })
      if (result?.data) {
        const ext = result.name?.split('.').pop()?.toLowerCase() ?? 'png'
        const mime = ext === 'svg' ? 'image/svg+xml' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png'
        // Convert to base64 data URI
        const base64 = typeof result.data === 'string' ? result.data : btoa(String.fromCharCode(...new Uint8Array(result.data)))
        const dataUri = `data:${mime};base64,${base64}`
        updateCert({ backgroundImage: dataUri })
      }
    } catch {
      // Fallback: use file input
    }
  }

  async function handleUploadTemplate() {
    if (!window.electronAPI?.dialog?.openFile) return
    try {
      const result = await window.electronAPI.dialog.openFile({
        filters: [{ name: 'HTML Template', extensions: ['html', 'htm'] }]
      })
      if (result?.data) {
        const text = typeof result.data === 'string' ? result.data : new TextDecoder().decode(result.data)
        updateCert({ template: text })
      }
    } catch {
      // Ignore
    }
  }

  // Handle drag on canvas
  const handleCanvasMouseDown = useCallback((fieldId: string, e: React.MouseEvent) => {
    e.preventDefault()
    const field = fields.find((f) => f.id === fieldId)
    if (!field) return
    setSelectedFieldId(fieldId)
    setDragging({
      fieldId,
      startX: e.clientX,
      startY: e.clientY,
      fieldX: field.x,
      fieldY: field.y
    })
  }, [fields])

  const handleCanvasMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging || !canvasRef.current) return
    const rect = canvasRef.current.getBoundingClientRect()
    const dx = ((e.clientX - dragging.startX) / rect.width) * 100
    const dy = ((e.clientY - dragging.startY) / rect.height) * 100
    const newX = Math.max(0, Math.min(100, dragging.fieldX + dx))
    const newY = Math.max(0, Math.min(100, dragging.fieldY + dy))
    updateField(dragging.fieldId, { x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 })
  }, [dragging])

  const handleCanvasMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  const currentTemplateId = useMemo(() => {
    if (!cert?.template) return 'formal'
    const match = CERTIFICATE_TEMPLATES.find((t) => t.html === cert.template)
    return match?.id ?? 'custom'
  }, [cert?.template])

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
      completion_timestamp: new Date().toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      score: '92%',
      instructor: course.meta.author || 'Course Author',
      signature: cert.signatureLine || course.meta.author || 'Course Author',
      logoPath: cert.logoPath ?? course.theme.logoPath
    })
  }, [cert?.template, cert?.signatureLine, cert?.logoPath, course])

  async function handleExportPreview() {
    if (!previewHtml) return
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
    const blob = new Blob([previewHtml], { type: 'text/html' })
    downloadBlob(blob, 'certificate_preview.html')
  }

  if (!course) return <div />

  const selectedField = fields.find((f) => f.id === selectedFieldId)

  // Enlarged designer overlay
  if (enlargedDesigner && designerMode) {
    return (
      <>
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8">
          <div className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Enlarged header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] shrink-0">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[var(--brand-magenta)]" />
                <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Certificate Field Designer</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={addField} className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] text-white bg-[var(--brand-magenta)] rounded hover:opacity-90 cursor-pointer">
                  <Plus size={10} /> Add Field
                </button>
                <button onClick={() => setEnlargedDesigner(false)} className="p-1.5 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] cursor-pointer">
                  <Minimize2 size={14} />
                </button>
              </div>
            </div>
            {/* Enlarged canvas + fields sidebar */}
            <div className="flex flex-1 min-h-0">
              {/* Large canvas */}
              <div className="flex-1 p-4 overflow-auto flex items-center justify-center bg-[var(--bg-muted)]">
                <div
                  ref={canvasRef}
                  className="relative border border-[var(--border-default)] rounded-lg overflow-hidden cursor-crosshair shadow-lg"
                  style={{
                    width: '100%',
                    maxWidth: '900px',
                    aspectRatio: '297 / 210',
                    background: backgroundImage
                      ? `url(${backgroundImage}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                  }}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                >
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`absolute cursor-move select-none px-1 ${
                        selectedFieldId === field.id
                          ? 'ring-2 ring-[var(--brand-magenta)] rounded'
                          : 'hover:ring-1 hover:ring-[var(--brand-magenta)]/50 rounded'
                      }`}
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${Math.max(10, field.fontSize * 0.6)}px`,
                        fontWeight: field.fontWeight,
                        color: field.color,
                        textAlign: field.textAlign,
                        whiteSpace: 'nowrap'
                      }}
                      onMouseDown={(e) => handleCanvasMouseDown(field.id, e)}
                      title={`${field.label} (${field.variable || 'custom text'})`}
                    >
                      {field.label}
                    </div>
                  ))}
                </div>
              </div>
              {/* Field properties sidebar */}
              <div className="w-64 border-l border-[var(--border-default)] overflow-y-auto p-3 space-y-2 shrink-0">
                <p className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Fields</p>
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className={`p-2 rounded border text-[10px] cursor-pointer ${
                      selectedFieldId === field.id
                        ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5'
                        : 'border-[var(--border-default)] bg-[var(--bg-surface)]'
                    }`}
                    onClick={() => setSelectedFieldId(field.id)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-[var(--font-weight-semibold)] text-[var(--text-primary)]">{field.label}</span>
                      <button onClick={(e) => { e.stopPropagation(); removeField(field.id) }} className="p-0.5 text-red-400 hover:text-red-600 cursor-pointer">
                        <Trash2 size={10} />
                      </button>
                    </div>
                    {selectedFieldId === field.id && (
                      <div className="space-y-1.5 mt-1.5">
                        <input type="text" value={field.label} onChange={(e) => updateField(field.id, { label: e.target.value })} placeholder="Field label" className="w-full px-1.5 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]" />
                        <select value={field.variable} onChange={(e) => updateField(field.id, { variable: e.target.value })} className="w-full px-1.5 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]">
                          <option value="">Custom text</option>
                          <option value="{{learner_name}}">Learner Name</option>
                          <option value="{{course_title}}">Course Title</option>
                          <option value="{{completion_date}}">Completion Date</option>
                          <option value="{{completion_timestamp}}">Completion Timestamp</option>
                          <option value="{{score}}">Score</option>
                          <option value="{{instructor}}">Instructor</option>
                          <option value="{{signature}}">Signature</option>
                        </select>
                        <div className="flex gap-1">
                          <input type="number" value={field.fontSize} onChange={(e) => updateField(field.id, { fontSize: parseInt(e.target.value) || 14 })} className="w-12 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)]" title="Font size (pt)" />
                          <select value={field.fontWeight} onChange={(e) => updateField(field.id, { fontWeight: e.target.value as 'normal' | 'bold' })} className="flex-1 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)]">
                            <option value="normal">Normal</option>
                            <option value="bold">Bold</option>
                          </select>
                          <select value={field.textAlign} onChange={(e) => updateField(field.id, { textAlign: e.target.value as 'left' | 'center' | 'right' })} className="flex-1 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)]">
                            <option value="left">Left</option>
                            <option value="center">Center</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                        <div className="flex gap-1 items-center">
                          <label className="text-[9px] text-[var(--text-tertiary)]">Color:</label>
                          <input type="color" value={field.color} onChange={(e) => updateField(field.id, { color: e.target.value })} className="w-6 h-5 p-0 border-0 cursor-pointer" />
                          <label className="text-[9px] text-[var(--text-tertiary)] ml-2">X:{field.x}%</label>
                          <label className="text-[9px] text-[var(--text-tertiary)]">Y:{field.y}%</label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

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

            {/* Upload Template / Background */}
            <div className="space-y-2">
              <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] block">
                Upload
              </label>
              <div className="flex gap-1.5">
                <button
                  onClick={handleUploadTemplate}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded hover:bg-[var(--bg-hover)] cursor-pointer"
                >
                  <Upload size={10} /> HTML Template
                </button>
                <button
                  onClick={handleUploadBackground}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] text-[var(--text-secondary)] bg-[var(--bg-surface)] border border-[var(--border-default)] rounded hover:bg-[var(--bg-hover)] cursor-pointer"
                >
                  <ImageIcon size={10} /> Background Image
                </button>
              </div>
              <div className="p-2 rounded bg-[var(--bg-muted)] border border-[var(--border-default)]">
                <p className="text-[9px] text-[var(--text-tertiary)] leading-relaxed">
                  <strong>Recommended size:</strong> A4 Landscape (297 × 210 mm) / 11.69 × 8.27 in.
                  For print quality, use 3508 × 2480 px at 300 DPI.
                  Accepted formats: PNG, JPG, SVG for backgrounds; HTML for templates.
                </p>
              </div>
              {backgroundImage && (
                <div className="flex items-center justify-between p-1.5 rounded border border-[var(--border-default)] bg-[var(--bg-surface)]">
                  <span className="text-[10px] text-[var(--text-secondary)]">Background uploaded</span>
                  <button
                    onClick={() => updateCert({ backgroundImage: null })}
                    className="text-[10px] text-red-500 cursor-pointer hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
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

            {/* Field Designer toggle */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] flex items-center gap-1">
                  <Move size={12} />
                  Field Designer
                </label>
                <div className="flex items-center gap-2">
                  {designerMode && (
                    <button
                      onClick={() => setEnlargedDesigner(!enlargedDesigner)}
                      className="text-[10px] text-[var(--text-secondary)] cursor-pointer hover:text-[var(--brand-magenta)] flex items-center gap-0.5"
                      title={enlargedDesigner ? 'Minimize' : 'Enlarge designer'}
                    >
                      {enlargedDesigner ? <Minimize2 size={10} /> : <Maximize2 size={10} />}
                      {enlargedDesigner ? 'Minimize' : 'Enlarge'}
                    </button>
                  )}
                  <button
                    onClick={() => { setDesignerMode(!designerMode); setEnlargedDesigner(false) }}
                    className="text-[10px] text-[var(--brand-magenta)] cursor-pointer hover:underline"
                  >
                    {designerMode ? 'Close' : 'Open'}
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-tertiary)] mb-2">
                Drag fields to position them on the certificate. These override the template layout for uploaded backgrounds.
              </p>
            </div>

            {designerMode && (
              <div className="space-y-3">
                {/* Visual Canvas */}
                <div
                  ref={canvasRef}
                  className="relative border border-[var(--border-default)] rounded-lg overflow-hidden cursor-crosshair"
                  style={{
                    aspectRatio: '297 / 210',
                    background: backgroundImage
                      ? `url(${backgroundImage}) center/cover no-repeat`
                      : 'linear-gradient(135deg, #f8f9fa, #e9ecef)'
                  }}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                  onMouseLeave={handleCanvasMouseUp}
                >
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`absolute cursor-move select-none px-1 ${
                        selectedFieldId === field.id
                          ? 'ring-2 ring-[var(--brand-magenta)] rounded'
                          : 'hover:ring-1 hover:ring-[var(--brand-magenta)]/50 rounded'
                      }`}
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        transform: 'translate(-50%, -50%)',
                        fontSize: `${Math.max(8, field.fontSize * 0.4)}px`,
                        fontWeight: field.fontWeight,
                        color: field.color,
                        textAlign: field.textAlign,
                        whiteSpace: 'nowrap'
                      }}
                      onMouseDown={(e) => handleCanvasMouseDown(field.id, e)}
                      title={`${field.label} (${field.variable || 'custom text'})`}
                    >
                      {field.label}
                    </div>
                  ))}
                </div>

                {/* Field list */}
                <div className="space-y-1.5">
                  {fields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-2 rounded border text-[10px] ${
                        selectedFieldId === field.id
                          ? 'border-[var(--brand-magenta)] bg-[var(--brand-magenta)]/5'
                          : 'border-[var(--border-default)] bg-[var(--bg-surface)]'
                      }`}
                      onClick={() => setSelectedFieldId(field.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-[var(--font-weight-semibold)] text-[var(--text-primary)]">{field.label}</span>
                        <button onClick={() => removeField(field.id)} className="p-0.5 text-red-400 hover:text-red-600 cursor-pointer">
                          <Trash2 size={10} />
                        </button>
                      </div>
                      {selectedFieldId === field.id && (
                        <div className="space-y-1.5 mt-1.5">
                          <input
                            type="text"
                            value={field.label}
                            onChange={(e) => updateField(field.id, { label: e.target.value })}
                            placeholder="Field label"
                            className="w-full px-1.5 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                          />
                          <select
                            value={field.variable}
                            onChange={(e) => updateField(field.id, { variable: e.target.value })}
                            className="w-full px-1.5 py-1 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                          >
                            <option value="">Custom text</option>
                            <option value="{{learner_name}}">Learner Name</option>
                            <option value="{{course_title}}">Course Title</option>
                            <option value="{{completion_date}}">Completion Date</option>
                            <option value="{{completion_timestamp}}">Completion Timestamp</option>
                            <option value="{{score}}">Score</option>
                            <option value="{{instructor}}">Instructor</option>
                            <option value="{{signature}}">Signature</option>
                          </select>
                          <div className="flex gap-1">
                            <input
                              type="number"
                              value={field.fontSize}
                              onChange={(e) => updateField(field.id, { fontSize: parseInt(e.target.value) || 14 })}
                              className="w-12 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)]"
                              title="Font size (pt)"
                            />
                            <select
                              value={field.fontWeight}
                              onChange={(e) => updateField(field.id, { fontWeight: e.target.value as 'normal' | 'bold' })}
                              className="flex-1 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)]"
                            >
                              <option value="normal">Normal</option>
                              <option value="bold">Bold</option>
                            </select>
                            <select
                              value={field.textAlign}
                              onChange={(e) => updateField(field.id, { textAlign: e.target.value as 'left' | 'center' | 'right' })}
                              className="flex-1 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)]"
                            >
                              <option value="left">Left</option>
                              <option value="center">Center</option>
                              <option value="right">Right</option>
                            </select>
                          </div>
                          <div className="flex gap-1 items-center">
                            <label className="text-[9px] text-[var(--text-tertiary)]">Color:</label>
                            <input
                              type="color"
                              value={field.color}
                              onChange={(e) => updateField(field.id, { color: e.target.value })}
                              className="w-6 h-5 p-0 border-0 cursor-pointer"
                            />
                            <label className="text-[9px] text-[var(--text-tertiary)] ml-2">X:{field.x}%</label>
                            <label className="text-[9px] text-[var(--text-tertiary)]">Y:{field.y}%</label>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={addField}
                    className="w-full flex items-center justify-center gap-1 px-2 py-1.5 text-[10px] text-[var(--text-secondary)] border border-dashed border-[var(--border-default)] rounded hover:bg-[var(--bg-hover)] cursor-pointer"
                  >
                    <Plus size={10} /> Add Field
                  </button>
                </div>
              </div>
            )}

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
                Variables: {'{{learner_name}}'}, {'{{course_title}}'}, {'{{completion_date}}'}, {'{{completion_timestamp}}'}, {'{{score}}'}, {'{{instructor}}'}, {'{{signature}}'}, {'{{logo_img}}'}
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
