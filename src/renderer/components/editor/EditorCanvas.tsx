import { useMemo } from 'react'
import { Layers } from 'lucide-react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { findLesson } from '@/lib/course-helpers'
import { createBlock } from '@/lib/block-factories'
import { BlockWrapper } from './BlockWrapper'
import { BlockPreview } from './BlockPreview'
import { BlockInserterButton } from './BlockInserter'
import type { BlockType } from '@/types/course'

export function EditorCanvas(): JSX.Element {
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const addBlock = useCourseStore((s) => s.addBlock)
  const removeBlock = useCourseStore((s) => s.removeBlock)
  const duplicateBlock = useCourseStore((s) => s.duplicateBlock)
  const reorderBlocks = useCourseStore((s) => s.reorderBlocks)

  const activeModuleId = useEditorStore((s) => s.activeModuleId)
  const activeLessonId = useEditorStore((s) => s.activeLessonId)
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock)

  const lessonData = useMemo(() => {
    if (!course || !activeLessonId) return null
    return findLesson(course, activeLessonId)
  }, [course, activeLessonId])

  function handleInsertBlock(type: BlockType, atIndex?: number) {
    if (!activeCourseId || !activeModuleId || !activeLessonId) return
    const block = createBlock(type)
    addBlock(activeCourseId, activeModuleId, activeLessonId, block, atIndex)
    setSelectedBlock(block.id)
  }

  function handleDeleteBlock(blockId: string) {
    if (!activeCourseId || !activeModuleId || !activeLessonId) return
    removeBlock(activeCourseId, activeModuleId, activeLessonId, blockId)
    setSelectedBlock(null)
  }

  function handleDuplicateBlock(blockId: string) {
    if (!activeCourseId || !activeModuleId || !activeLessonId) return
    duplicateBlock(activeCourseId, activeModuleId, activeLessonId, blockId)
  }

  function handleMoveBlock(fromIndex: number, direction: 'up' | 'down') {
    if (!activeCourseId || !activeModuleId || !activeLessonId) return
    const toIndex = direction === 'up' ? fromIndex - 1 : fromIndex + 1
    reorderBlocks(activeCourseId, activeModuleId, activeLessonId, fromIndex, toIndex)
  }

  // No lesson selected
  if (!lessonData) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-app)]">
        <div className="flex flex-col items-center text-center p-8">
          <Layers size={40} className="text-[var(--text-tertiary)] mb-3" />
          <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-1">
            Canvas
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Select a lesson from the outline to start editing
          </p>
        </div>
      </div>
    )
  }

  const { lesson, module } = lessonData

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--bg-app)]">
      {/* Lesson header */}
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-2">
        <p className="text-xs text-[var(--text-tertiary)] mb-1">{module.title}</p>
        <h2 className="text-xl font-[var(--font-weight-bold)] text-[var(--text-primary)] mb-4">
          {lesson.title}
        </h2>
      </div>

      {/* Block list */}
      <div className="max-w-3xl mx-auto px-6 pb-12" role="list" aria-label="Content blocks">
        {/* Top inserter */}
        <div className="py-2">
          <BlockInserterButton onInsert={(type) => handleInsertBlock(type, 0)} />
        </div>

        {lesson.blocks.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <p className="text-sm text-[var(--text-tertiary)] mb-2">
              This lesson has no content blocks yet.
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Click the + button above to add your first block.
            </p>
          </div>
        ) : (
          lesson.blocks.map((block, index) => (
            <div key={block.id}>
              <BlockWrapper
                block={block}
                index={index}
                totalBlocks={lesson.blocks.length}
                onSelect={() => setSelectedBlock(block.id)}
                onDuplicate={() => handleDuplicateBlock(block.id)}
                onDelete={() => handleDeleteBlock(block.id)}
                onMoveUp={() => handleMoveBlock(index, 'up')}
                onMoveDown={() => handleMoveBlock(index, 'down')}
              >
                <BlockPreview block={block} />
              </BlockWrapper>

              {/* Inserter between blocks */}
              <div className="py-1">
                <BlockInserterButton onInsert={(type) => handleInsertBlock(type, index + 1)} />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Live region for status */}
      <div aria-live="polite" className="sr-only">
        {lesson.blocks.length} block{lesson.blocks.length !== 1 ? 's' : ''} in this lesson
      </div>
    </div>
  )
}
