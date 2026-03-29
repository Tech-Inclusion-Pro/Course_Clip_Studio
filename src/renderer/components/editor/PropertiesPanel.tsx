import { useMemo } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { findBlock } from '@/lib/course-helpers'
import { BLOCK_TYPE_LABELS } from '@/types/course'
import type { ContentBlock } from '@/types/course'

export function PropertiesPanel(): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateBlock = useCourseStore((s) => s.updateBlock)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)

  const blockData = useMemo(() => {
    if (!course || !selectedBlockId) return null
    return findBlock(course, selectedBlockId)
  }, [course, selectedBlockId])

  function handleUpdate(partial: Partial<ContentBlock>) {
    if (!activeCourseId || !blockData) return
    updateBlock(activeCourseId, blockData.module.id, blockData.lesson.id, blockData.block.id, partial)
  }

  if (!blockData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
          <SlidersHorizontal size={16} className="text-[var(--icon-default)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Properties
          </h2>
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-sm text-[var(--text-tertiary)] text-center">
            Select a block to view its properties
          </p>
        </div>
      </div>
    )
  }

  const { block } = blockData

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
        <SlidersHorizontal size={16} className="text-[var(--icon-default)]" />
        <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          {BLOCK_TYPE_LABELS[block.type]}
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Global: ARIA Label */}
        <FieldGroup label="ARIA Label">
          <input
            type="text"
            value={block.ariaLabel}
            onChange={(e) => handleUpdate({ ariaLabel: e.target.value })}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          />
        </FieldGroup>

        {/* Global: Notes */}
        <FieldGroup label="Author Notes">
          <textarea
            value={block.notes}
            onChange={(e) => handleUpdate({ notes: e.target.value })}
            rows={2}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            placeholder="Internal notes about this block..."
          />
        </FieldGroup>

        {/* Type-specific fields */}
        <TypeSpecificFields block={block} onUpdate={handleUpdate} />

        {/* Animation */}
        <FieldGroup label="Animation">
          <select
            value={block.animation?.type ?? 'none'}
            onChange={(e) =>
              handleUpdate({
                animation: {
                  type: e.target.value as 'fade-in' | 'slide-up' | 'slide-left' | 'scale' | 'none',
                  duration: block.animation?.duration ?? 300,
                  delay: block.animation?.delay ?? 0
                }
              })
            }
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="none">None</option>
            <option value="fade-in">Fade In</option>
            <option value="slide-up">Slide Up</option>
            <option value="slide-left">Slide Left</option>
            <option value="scale">Scale</option>
          </select>
        </FieldGroup>
      </div>
    </div>
  )
}

// ─── Field Group ───

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }): JSX.Element {
  return (
    <div>
      <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── Type-Specific Fields ───

function TypeSpecificFields({
  block,
  onUpdate
}: {
  block: ContentBlock
  onUpdate: (partial: Partial<ContentBlock>) => void
}): JSX.Element | null {
  switch (block.type) {
    case 'text':
      return (
        <>
          <p className="text-xs text-[var(--text-tertiary)]">
            Use the inline editor in the canvas to edit rich text content.
          </p>
          {block.readingLevel !== undefined && block.readingLevel !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--text-secondary)]">Reading Level:</span>
              <span
                className={`text-xs font-[var(--font-weight-medium)] px-1.5 py-0.5 rounded ${
                  (block.readingLevel ?? 0) <= 8
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : (block.readingLevel ?? 0) <= 12
                      ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}
              >
                Grade {block.readingLevel}
              </span>
            </div>
          )}
          {(!block.readingLevel) && block.content && (
            <p className="text-xs text-[var(--text-tertiary)]">
              Add more text to see reading level analysis.
            </p>
          )}
        </>
      )

    case 'media':
      return (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Use the inline editor in the canvas to manage image, alt text, and caption.
          </p>
          <FieldGroup label="Image Path">
            <input
              type="text"
              value={block.assetPath}
              onChange={(e) => onUpdate({ assetPath: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Path to image file..."
            />
          </FieldGroup>
          <FieldGroup label="Alt Text (required)">
            <input
              type="text"
              value={block.altText}
              onChange={(e) => onUpdate({ altText: e.target.value } as Partial<ContentBlock>)}
              className={`w-full px-2.5 py-1.5 text-sm rounded-md border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] ${
                !block.altText ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]'
              }`}
              placeholder="Describe this image for screen readers..."
              aria-required="true"
              aria-invalid={!block.altText}
            />
            {!block.altText && (
              <p className="text-xs text-[var(--color-danger-600)] mt-0.5">Required before publishing (WCAG 1.1.1)</p>
            )}
          </FieldGroup>
          <FieldGroup label="Caption">
            <input
              type="text"
              value={block.caption}
              onChange={(e) => onUpdate({ caption: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Optional visible caption..."
            />
          </FieldGroup>
        </>
      )

    case 'video':
      return (
        <>
          <FieldGroup label="Source">
            <select
              value={block.source}
              onChange={(e) => onUpdate({ source: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            >
              <option value="upload">Upload</option>
              <option value="embed">Embed URL</option>
            </select>
          </FieldGroup>
          <FieldGroup label="URL">
            <input
              type="text"
              value={block.url}
              onChange={(e) => onUpdate({ url: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder={block.source === 'embed' ? 'YouTube/Vimeo URL...' : 'File path...'}
            />
          </FieldGroup>
          <FieldGroup label="Transcript (required)">
            <textarea
              value={block.transcript}
              onChange={(e) => onUpdate({ transcript: e.target.value } as Partial<ContentBlock>)}
              rows={3}
              className={`w-full px-2.5 py-1.5 text-sm rounded-md border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y ${
                !block.transcript ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]'
              }`}
              placeholder="Full transcript of the video..."
            />
            {!block.transcript && (
              <p className="text-xs text-[var(--color-danger-600)] mt-0.5">Required before publishing</p>
            )}
          </FieldGroup>
        </>
      )

    case 'audio':
      return (
        <>
          <FieldGroup label="Audio File">
            <input
              type="text"
              value={block.assetPath}
              onChange={(e) => onUpdate({ assetPath: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Path to audio file..."
            />
          </FieldGroup>
          <FieldGroup label="Transcript (required)">
            <textarea
              value={block.transcript}
              onChange={(e) => onUpdate({ transcript: e.target.value } as Partial<ContentBlock>)}
              rows={3}
              className={`w-full px-2.5 py-1.5 text-sm rounded-md border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y ${
                !block.transcript ? 'border-[var(--color-danger-600)]' : 'border-[var(--border-default)]'
              }`}
              placeholder="Full transcript of the audio..."
            />
            {!block.transcript && (
              <p className="text-xs text-[var(--color-danger-600)] mt-0.5">Required before publishing</p>
            )}
          </FieldGroup>
        </>
      )

    case 'quiz':
      return (
        <>
          <FieldGroup label="Pass Threshold (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={block.passThreshold}
              onChange={(e) => onUpdate({ passThreshold: Number(e.target.value) } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </FieldGroup>
          <div className="space-y-2">
            <ToggleField label="Show Feedback" checked={block.showFeedback} onChange={(v) => onUpdate({ showFeedback: v } as Partial<ContentBlock>)} />
            <ToggleField label="Allow Retry" checked={block.allowRetry} onChange={(v) => onUpdate({ allowRetry: v } as Partial<ContentBlock>)} />
            <ToggleField label="Shuffle Questions" checked={block.shuffleQuestions} onChange={(v) => onUpdate({ shuffleQuestions: v } as Partial<ContentBlock>)} />
            <ToggleField label="Shuffle Answers" checked={block.shuffleAnswers} onChange={(v) => onUpdate({ shuffleAnswers: v } as Partial<ContentBlock>)} />
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            {block.questions.length} question{block.questions.length !== 1 ? 's' : ''} configured
          </p>
        </>
      )

    case 'callout':
      return (
        <>
          <FieldGroup label="Variant">
            <select
              value={block.variant}
              onChange={(e) => onUpdate({ variant: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            >
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="success">Success</option>
              <option value="danger">Danger</option>
              <option value="tip">Tip</option>
            </select>
          </FieldGroup>
          <FieldGroup label="Title (optional)">
            <input
              type="text"
              value={block.title ?? ''}
              onChange={(e) => onUpdate({ title: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </FieldGroup>
          <FieldGroup label="Content">
            <textarea
              value={block.content}
              onChange={(e) => onUpdate({ content: e.target.value } as Partial<ContentBlock>)}
              rows={3}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            />
          </FieldGroup>
        </>
      )

    case 'code':
      return (
        <>
          <FieldGroup label="Language">
            <input
              type="text"
              value={block.language}
              onChange={(e) => onUpdate({ language: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </FieldGroup>
          <FieldGroup label="Code">
            <textarea
              value={block.code}
              onChange={(e) => onUpdate({ code: e.target.value } as Partial<ContentBlock>)}
              rows={8}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[#1e1e2e] text-[#cdd6f4] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            />
          </FieldGroup>
          <ToggleField label="Runnable" checked={block.runnable} onChange={(v) => onUpdate({ runnable: v } as Partial<ContentBlock>)} />
        </>
      )

    case 'divider':
      return (
        <FieldGroup label="Style">
          <select
            value={block.style}
            onChange={(e) => onUpdate({ style: e.target.value } as Partial<ContentBlock>)}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
          >
            <option value="line">Line</option>
            <option value="dots">Dots</option>
            <option value="space">Space</option>
          </select>
        </FieldGroup>
      )

    case 'embed':
      return (
        <>
          <FieldGroup label="URL">
            <input
              type="text"
              value={block.url}
              onChange={(e) => onUpdate({ url: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Embed URL..."
            />
          </FieldGroup>
          <FieldGroup label="Title (required for accessibility)">
            <input
              type="text"
              value={block.title}
              onChange={(e) => onUpdate({ title: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Accessible title for this embed..."
            />
          </FieldGroup>
        </>
      )

    case 'h5p':
      return (
        <FieldGroup label="H5P Embed URL">
          <input
            type="text"
            value={block.embedUrl}
            onChange={(e) => onUpdate({ embedUrl: e.target.value } as Partial<ContentBlock>)}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="H5P content URL..."
          />
        </FieldGroup>
      )

    case 'custom-html':
      return (
        <>
          <div className="p-2 rounded-md bg-yellow-50 border border-yellow-200 text-xs text-yellow-800 mb-2">
            Custom code — WCAG compliance is the author's responsibility
          </div>
          <FieldGroup label="HTML">
            <textarea
              value={block.html}
              onChange={(e) => onUpdate({ html: e.target.value } as Partial<ContentBlock>)}
              rows={4}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            />
          </FieldGroup>
          <FieldGroup label="CSS">
            <textarea
              value={block.css}
              onChange={(e) => onUpdate({ css: e.target.value } as Partial<ContentBlock>)}
              rows={3}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            />
          </FieldGroup>
          <FieldGroup label="JavaScript">
            <textarea
              value={block.js}
              onChange={(e) => onUpdate({ js: e.target.value } as Partial<ContentBlock>)}
              rows={3}
              className="w-full px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            />
          </FieldGroup>
        </>
      )

    default:
      return (
        <p className="text-xs text-[var(--text-tertiary)]">
          Properties editor for {BLOCK_TYPE_LABELS[block.type]} will be expanded in a future milestone.
        </p>
      )
  }
}

// ─── Toggle Field ───

function ToggleField({
  label,
  checked,
  onChange
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}): JSX.Element {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
      />
      <span className="text-xs text-[var(--text-secondary)]">{label}</span>
    </label>
  )
}
