import { useMemo } from 'react'
import { SlidersHorizontal, Clock, Target, UserPlus, Zap } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useTriggersStore } from '@/stores/triggers-store'
import { findBlock, findLesson } from '@/lib/course-helpers'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { imageDescriptionPrompt } from '@/lib/ai/prompts'
import { AIGenerateButton } from '@/components/ui/AIGenerateButton'
import { BLOCK_TYPE_LABELS } from '@/types/course'
import type { ContentBlock, LessonCompletionCriteria } from '@/types/course'
import type { ProgressionPolicy } from '@/types/trigger-model'

export function PropertiesPanel(): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateBlock = useCourseStore((s) => s.updateBlock)
  const updateCourse = useCourseStore((s) => s.updateCourse)
  const updateLesson = useCourseStore((s) => s.updateLesson)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const activeLessonId = useEditorStore((s) => s.activeLessonId)

  const blockData = useMemo(() => {
    if (!course || !selectedBlockId) return null
    return findBlock(course, selectedBlockId)
  }, [course, selectedBlockId])

  const lessonData = useMemo(() => {
    if (!course || !activeLessonId) return null
    return findLesson(course, activeLessonId)
  }, [course, activeLessonId])

  function handleUpdate(partial: Partial<ContentBlock>) {
    if (!activeCourseId || !blockData) return
    updateBlock(activeCourseId, blockData.module.id, blockData.lesson.id, blockData.block.id, partial)
  }

  function handleUpdateCompletionCriteria(partial: Partial<LessonCompletionCriteria>) {
    if (!activeCourseId || !lessonData) return
    const current: LessonCompletionCriteria = lessonData.lesson.completionCriteria ?? {
      quizPassRequired: false,
      quizPassScore: 70,
      interactiveRequired: false,
      minimumTimeSeconds: 0
    }
    updateLesson(activeCourseId, lessonData.module.id, lessonData.lesson.id, {
      completionCriteria: { ...current, ...partial }
    })
  }

  // Show lesson settings when no block selected but lesson is active
  if (!blockData) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-default)]">
          <SlidersHorizontal size={16} className="text-[var(--icon-default)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            {lessonData ? 'Lesson Settings' : 'Properties'}
          </h2>
        </div>
        {lessonData ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
                {lessonData.lesson.title}
              </h3>
              <p className="text-[10px] text-[var(--text-tertiary)]">
                {lessonData.lesson.blocks.length} block{lessonData.lesson.blocks.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Enrollment Page toggle (course-level) */}
            <div className="p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserPlus size={14} className="text-[var(--brand-magenta)]" />
                  <div>
                    <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                      Enrollment Page
                    </span>
                    <p className="text-[9px] text-[var(--text-tertiary)]">
                      Capture learner name before course starts
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (!activeCourseId || !course) return
                    updateCourse(activeCourseId, {
                      settings: { ...course.settings, enrollmentPage: !course.settings.enrollmentPage }
                    })
                  }}
                  role="switch"
                  aria-checked={course?.settings.enrollmentPage ?? false}
                  className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer shrink-0 ${
                    course?.settings.enrollmentPage
                      ? 'bg-[var(--brand-magenta)]'
                      : 'bg-[var(--border-default)]'
                  }`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                    course?.settings.enrollmentPage ? 'translate-x-[18px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--border-default)] pt-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Target size={14} className="text-[var(--brand-magenta)]" />
                <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                  Completion Criteria
                </h3>
              </div>

              <div className="space-y-3">
                {/* Quiz pass required */}
                <div className="p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonData.lesson.completionCriteria?.quizPassRequired ?? false}
                      onChange={(e) => handleUpdateCompletionCriteria({ quizPassRequired: e.target.checked })}
                      className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
                    />
                    <div>
                      <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                        Require quiz pass
                      </span>
                      <p className="text-[9px] text-[var(--text-tertiary)]">
                        Learner must pass quiz(es) in this lesson
                      </p>
                    </div>
                  </label>
                  {(lessonData.lesson.completionCriteria?.quizPassRequired) && (
                    <div className="flex items-center gap-2 pl-6">
                      <label className="text-[10px] text-[var(--text-secondary)]">Min score:</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={lessonData.lesson.completionCriteria?.quizPassScore ?? 70}
                        onChange={(e) => handleUpdateCompletionCriteria({ quizPassScore: parseInt(e.target.value) || 70 })}
                        className="w-16 px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                      />
                      <span className="text-[10px] text-[var(--text-tertiary)]">%</span>
                    </div>
                  )}
                </div>

                {/* Interactive completion required */}
                <div className="p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={lessonData.lesson.completionCriteria?.interactiveRequired ?? false}
                      onChange={(e) => handleUpdateCompletionCriteria({ interactiveRequired: e.target.checked })}
                      className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
                    />
                    <div>
                      <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                        Complete all interactive blocks
                      </span>
                      <p className="text-[9px] text-[var(--text-tertiary)]">
                        Must interact with all drag-drop, matching, flashcard, and branching blocks
                      </p>
                    </div>
                  </label>
                </div>

                {/* Minimum time */}
                <div className="p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Clock size={14} className="text-[var(--text-tertiary)]" />
                    <div>
                      <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                        Minimum time on page
                      </span>
                      <p className="text-[9px] text-[var(--text-tertiary)]">
                        Learner must spend at least this long before marking complete
                      </p>
                    </div>
                  </label>
                  <div className="flex items-center gap-2 pl-6">
                    <input
                      type="number"
                      min={0}
                      value={lessonData.lesson.completionCriteria?.minimumTimeSeconds ?? 0}
                      onChange={(e) => handleUpdateCompletionCriteria({ minimumTimeSeconds: parseInt(e.target.value) || 0 })}
                      className="w-20 px-2 py-1 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    />
                    <span className="text-[10px] text-[var(--text-tertiary)]">seconds</span>
                    {(lessonData.lesson.completionCriteria?.minimumTimeSeconds ?? 0) > 0 && (
                      <span className="text-[10px] text-[var(--text-secondary)]">
                        ({Math.floor((lessonData.lesson.completionCriteria?.minimumTimeSeconds ?? 0) / 60)}m {(lessonData.lesson.completionCriteria?.minimumTimeSeconds ?? 0) % 60}s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progression Policy */}
            {activeCourseId && (
              <ProgressionPolicySection courseId={activeCourseId} />
            )}

            <p className="text-[9px] text-[var(--text-tertiary)] pt-2">
              Select a block to view block-level properties. These settings control when this lesson is considered complete.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <p className="text-sm text-[var(--text-tertiary)] text-center">
              Select a block to view its properties
            </p>
          </div>
        )}
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

        {/* Global: Block Feedback */}
        <FieldGroup label="Block Feedback">
          <textarea
            value={block.feedback ?? ''}
            onChange={(e) => handleUpdate({ feedback: e.target.value || undefined })}
            rows={2}
            className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
            placeholder="Optional feedback shown to learners as a collapsible..."
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

        {/* Completion & Tracking */}
        <div className="border-t border-[var(--border-default)] pt-4 space-y-2">
          <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
            Completion & Tracking
          </h3>
          <ToggleField
            label="Required for completion"
            checked={block.required !== false}
            onChange={(v) => handleUpdate({ required: v } as Partial<ContentBlock>)}
          />
          <ToggleField
            label="Track completion"
            checked={block.trackCompletion !== false}
            onChange={(v) => handleUpdate({ trackCompletion: v } as Partial<ContentBlock>)}
          />
        </div>
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
  const { generate: generateAI, isGenerating: isGeneratingAlt, isConfigured: aiConfigured } = useAIGenerate()
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
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
                Alt Text (required)
              </label>
              {block.assetPath && (
                <AIGenerateButton
                  onClick={async () => {
                    const filename = block.assetPath?.split('/').pop() || ''
                    const result = await generateAI(imageDescriptionPrompt(filename, block.caption || '', ''))
                    if (result) onUpdate({ altText: result.trim() } as Partial<ContentBlock>)
                  }}
                  isGenerating={isGeneratingAlt}
                  disabled={!aiConfigured}
                  size="xs"
                  title={aiConfigured ? 'Generate alt text with AI' : 'Configure AI provider in Settings'}
                />
              )}
            </div>
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
          </div>
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
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Use the inline editor in the canvas to add and edit questions.
          </p>
          <FieldGroup label="Pass Threshold (%)">
            <input
              type="number"
              min={0}
              max={100}
              value={block.passThreshold}
              onChange={(e) => onUpdate({ passThreshold: Math.max(0, Math.min(100, Number(e.target.value))) } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </FieldGroup>
          <div className="space-y-2">
            <ToggleField label="Show Feedback" checked={block.showFeedback} onChange={(v) => onUpdate({ showFeedback: v } as Partial<ContentBlock>)} />
            <ToggleField label="Allow Retry" checked={block.allowRetry} onChange={(v) => onUpdate({ allowRetry: v } as Partial<ContentBlock>)} />
            <ToggleField label="Shuffle Questions" checked={block.shuffleQuestions} onChange={(v) => onUpdate({ shuffleQuestions: v } as Partial<ContentBlock>)} />
            <ToggleField label="Shuffle Answers" checked={block.shuffleAnswers} onChange={(v) => onUpdate({ shuffleAnswers: v } as Partial<ContentBlock>)} />
          </div>
          <div className="p-2 rounded-md bg-[var(--bg-muted)]">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {block.questions.length} question{block.questions.length !== 1 ? 's' : ''}
            </p>
            {block.questions.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {block.questions.map((q, i) => (
                  <p key={q.id} className="text-[10px] text-[var(--text-tertiary)] truncate">
                    Q{i + 1}: {q.prompt || 'Untitled'} ({q.type})
                  </p>
                ))}
              </div>
            )}
          </div>
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

    case 'drag-drop':
      return (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Use the inline editor in the canvas to manage items and zones.
          </p>
          <FieldGroup label="Instruction">
            <input
              type="text"
              value={block.instruction}
              onChange={(e) => onUpdate({ instruction: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Drag each item to the correct zone."
            />
          </FieldGroup>
          <div className="p-2 rounded-md bg-[var(--bg-muted)]">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {block.items.length} item{block.items.length !== 1 ? 's' : ''}, {block.zones.length} zone{block.zones.length !== 1 ? 's' : ''}
            </p>
          </div>
        </>
      )

    case 'matching':
      return (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Use the inline editor in the canvas to manage matching pairs.
          </p>
          <FieldGroup label="Instruction">
            <input
              type="text"
              value={block.instruction}
              onChange={(e) => onUpdate({ instruction: e.target.value } as Partial<ContentBlock>)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
          </FieldGroup>
          <div className="p-2 rounded-md bg-[var(--bg-muted)]">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {block.leftItems.length} left, {block.rightItems.length} right, {block.correctPairs.length} pair{block.correctPairs.length !== 1 ? 's' : ''}
            </p>
          </div>
        </>
      )

    case 'accordion':
      return (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Use the inline editor in the canvas to manage accordion sections.
          </p>
          <div className="p-2 rounded-md bg-[var(--bg-muted)]">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {block.items.length} section{block.items.length !== 1 ? 's' : ''}
            </p>
            {block.items.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {block.items.map((item, i) => (
                  <p key={i} className="text-[10px] text-[var(--text-tertiary)] truncate">
                    {i + 1}. {item.title || 'Untitled section'}
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      )

    case 'tabs':
      return (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Use the inline editor in the canvas to manage tabs.
          </p>
          <div className="p-2 rounded-md bg-[var(--bg-muted)]">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {block.tabs.length} tab{block.tabs.length !== 1 ? 's' : ''}
            </p>
            {block.tabs.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {block.tabs.map((tab, i) => (
                  <p key={i} className="text-[10px] text-[var(--text-tertiary)] truncate">
                    {i + 1}. {tab.label || 'Untitled tab'}
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      )

    case 'flashcard':
      return (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Use the inline editor in the canvas to add and edit cards.
          </p>
          <div className="p-2 rounded-md bg-[var(--bg-muted)]">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {block.cards.length} card{block.cards.length !== 1 ? 's' : ''}
            </p>
            {block.cards.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {block.cards.slice(0, 5).map((card, i) => (
                  <p key={i} className="text-[10px] text-[var(--text-tertiary)] truncate">
                    {i + 1}. {card.front || 'Empty front'}
                  </p>
                ))}
                {block.cards.length > 5 && (
                  <p className="text-[10px] text-[var(--text-tertiary)]">+{block.cards.length - 5} more</p>
                )}
              </div>
            )}
          </div>
        </>
      )

    case 'branching':
      return (
        <>
          <p className="text-xs text-[var(--text-tertiary)] mb-2">
            Use the inline editor in the canvas to manage scenario and choices.
          </p>
          <FieldGroup label="Scenario">
            <textarea
              value={block.scenario}
              onChange={(e) => onUpdate({ scenario: e.target.value } as Partial<ContentBlock>)}
              rows={3}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
            />
          </FieldGroup>
          <div className="p-2 rounded-md bg-[var(--bg-muted)]">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
              {block.choices.length} branch{block.choices.length !== 1 ? 'es' : ''}
            </p>
            {block.choices.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {block.choices.map((choice, i) => (
                  <p key={choice.id} className="text-[10px] text-[var(--text-tertiary)] truncate">
                    {i + 1}. {choice.label || 'Untitled choice'} {choice.nextLessonId ? '→ lesson' : ''}
                  </p>
                ))}
              </div>
            )}
          </div>
        </>
      )

    default:
      return null
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

// ─── Progression Policy Section ───

const POLICY_OPTIONS: { value: ProgressionPolicy; label: string; description: string }[] = [
  { value: 'linear_strict', label: 'Must complete in order', description: 'Learner must complete each lesson before advancing' },
  { value: 'fail_open', label: 'Suggest next steps', description: 'Show encouraging options when criteria aren\'t met' },
  { value: 'open_always', label: 'Free navigation', description: 'Learner can navigate freely to any lesson' }
]

function ProgressionPolicySection({ courseId }: { courseId: string }): JSX.Element {
  const config = useTriggersStore.getState().getInteractivity(courseId)
  const progression = config.progression

  function handlePolicyChange(policy: ProgressionPolicy) {
    useTriggersStore.getState().updateProgression(courseId, { policy })
  }

  function handleOptionChange(key: keyof typeof progression.whatsNextOptions, checked: boolean) {
    useTriggersStore.getState().updateProgression(courseId, {
      whatsNextOptions: { ...progression.whatsNextOptions, [key]: checked }
    })
  }

  return (
    <div className="border-t border-[var(--border-default)] pt-4">
      <div className="flex items-center gap-1.5 mb-3">
        <Zap size={14} className="text-[var(--brand-magenta)]" />
        <h3 className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
          Progression Policy
        </h3>
      </div>

      <div className="space-y-2">
        {POLICY_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-start gap-2 p-2 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] cursor-pointer hover:border-[var(--brand-magenta)] transition-colors"
          >
            <input
              type="radio"
              name="progression-policy"
              value={option.value}
              checked={progression.policy === option.value}
              onChange={() => handlePolicyChange(option.value)}
              className="mt-0.5 text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
            />
            <div>
              <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)]">
                {option.label}
              </span>
              <p className="text-[9px] text-[var(--text-tertiary)]">{option.description}</p>
            </div>
          </label>
        ))}
      </div>

      {progression.policy === 'fail_open' && (
        <div className="mt-3 p-2.5 rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)]">
          <p className="text-[10px] font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-2">
            "What's Next?" modal options:
          </p>
          <div className="space-y-1.5">
            {([
              { key: 'retry' as const, label: 'Try this lesson again' },
              { key: 'pickAnother' as const, label: 'Choose another lesson' },
              { key: 'reviewProgress' as const, label: 'Review my progress' },
              { key: 'startOver' as const, label: 'Start course over' },
              { key: 'continueAnyway' as const, label: 'Continue anyway' }
            ]).map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={progression.whatsNextOptions[key]}
                  onChange={(e) => handleOptionChange(key, e.target.checked)}
                  className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
                />
                <span className="text-[10px] text-[var(--text-secondary)]">{label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
