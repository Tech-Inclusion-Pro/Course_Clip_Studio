import { useMemo } from 'react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { useSlideLayout } from '@/hooks/useSlideLayout'
import { findLesson } from '@/lib/course-helpers'
import { BlockPreview } from './BlockPreview'
import { SlideBlock } from './SlideBlock'

const ASPECT_RATIOS: Record<string, { width: number; height: number }> = {
  '16:9': { width: 960, height: 540 },
  '4:3': { width: 960, height: 720 }
}

export function SlideCanvas(): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeLessonId = useEditorStore((s) => s.activeLessonId)
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const setSelectedBlock = useEditorStore((s) => s.setSelectedBlock)
  const slideAspectRatio = useEditorStore((s) => s.slideAspectRatio)

  const { getPosition, setPosition } = useSlideLayout()

  const lessonData = useMemo(() => {
    if (!course || !activeLessonId) return null
    return findLesson(course, activeLessonId)
  }, [course, activeLessonId])

  const dims = ASPECT_RATIOS[slideAspectRatio] ?? ASPECT_RATIOS['16:9']

  if (!lessonData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg-app)]">
        <p className="text-sm text-[var(--text-tertiary)]">Select a lesson to use slide view</p>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--bg-muted)] overflow-auto p-8">
      <div
        className="relative bg-white rounded-lg shadow-lg border border-[var(--border-default)]"
        style={{ width: dims.width, height: dims.height }}
        onClick={() => setSelectedBlock(null)}
      >
        {/* Slide label */}
        <div className="absolute -top-6 left-0 text-[10px] text-[var(--text-tertiary)]">
          {lessonData.lesson.title} — {slideAspectRatio}
        </div>

        {lessonData.lesson.blocks.map((block, i) => (
          <SlideBlock
            key={block.id}
            blockId={block.id}
            position={getPosition(block.id) || { x: 40, y: 40 + i * 100, width: dims.width - 80, height: 80 }}
            onPositionChange={(pos) => setPosition(block.id, pos)}
            selected={selectedBlockId === block.id}
            onSelect={() => setSelectedBlock(block.id)}
          >
            <BlockPreview block={block} />
          </SlideBlock>
        ))}
      </div>
    </div>
  )
}
