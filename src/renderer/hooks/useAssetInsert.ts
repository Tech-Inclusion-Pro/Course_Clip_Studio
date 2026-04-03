import { useCallback } from 'react'
import { useCourseStore } from '@/stores/useCourseStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { getBuiltInSvg } from '@/lib/built-in-assets'
import type { MediaAsset } from '@/types/media'
import type { ContentBlock } from '@/types/course'

/**
 * Hook that provides an insert function for Media Library assets.
 * When called, it updates the currently selected block (if compatible)
 * with the asset's file path or SVG content.
 *
 * Returns the asset path/svg for the calling component to use directly.
 */
export function useAssetInsert(): (asset: MediaAsset) => string | null {
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId)
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateBlock = useCourseStore((s) => s.updateBlock)
  const activeModuleId = useEditorStore((s) => s.activeModuleId)
  const activeLessonId = useEditorStore((s) => s.activeLessonId)

  return useCallback(
    (asset: MediaAsset): string | null => {
      const isBuiltIn = asset.filePath.startsWith('built-in://')

      // For built-in SVG assets, return the SVG string
      if (isBuiltIn) {
        const svg = getBuiltInSvg(asset.metadata.id)
        return svg
      }

      // For file-based assets, try to update the selected block
      if (selectedBlockId && activeCourseId && activeModuleId && activeLessonId) {
        if (asset.type === 'image') {
          updateBlock(activeCourseId, activeModuleId, activeLessonId, selectedBlockId, {
            src: asset.filePath,
            alt: asset.metadata.altText || asset.metadata.title
          } as Partial<ContentBlock>)
        } else if (asset.type === 'video') {
          updateBlock(activeCourseId, activeModuleId, activeLessonId, selectedBlockId, {
            src: asset.filePath
          } as Partial<ContentBlock>)
        } else if (asset.type === 'audio') {
          updateBlock(activeCourseId, activeModuleId, activeLessonId, selectedBlockId, {
            src: asset.filePath
          } as Partial<ContentBlock>)
        }
      }

      return asset.filePath
    },
    [selectedBlockId, activeCourseId, activeModuleId, activeLessonId, updateBlock]
  )
}
