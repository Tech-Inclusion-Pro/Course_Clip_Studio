import { useCallback, useState } from 'react'
import type { Guide } from '@/components/editor/SmartGuides'

interface BoundingRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

const SNAP_THRESHOLD = 5

export function useSmartGuides() {
  const [guides, setGuides] = useState<Guide[]>([])

  const computeGuides = useCallback((draggingId: string, draggingRect: BoundingRect, otherRects: BoundingRect[]) => {
    const newGuides: Guide[] = []
    const dragCenterX = draggingRect.x + draggingRect.width / 2
    const dragCenterY = draggingRect.y + draggingRect.height / 2

    for (const other of otherRects) {
      if (other.id === draggingId) continue
      const otherCenterX = other.x + other.width / 2
      const otherCenterY = other.y + other.height / 2

      // Vertical center alignment
      if (Math.abs(dragCenterX - otherCenterX) < SNAP_THRESHOLD) {
        newGuides.push({
          type: 'vertical',
          position: otherCenterX,
          start: Math.min(draggingRect.y, other.y),
          end: Math.max(draggingRect.y + draggingRect.height, other.y + other.height)
        })
      }

      // Horizontal center alignment
      if (Math.abs(dragCenterY - otherCenterY) < SNAP_THRESHOLD) {
        newGuides.push({
          type: 'horizontal',
          position: otherCenterY,
          start: Math.min(draggingRect.x, other.x),
          end: Math.max(draggingRect.x + draggingRect.width, other.x + other.width)
        })
      }

      // Left edge alignment
      if (Math.abs(draggingRect.x - other.x) < SNAP_THRESHOLD) {
        newGuides.push({
          type: 'vertical',
          position: other.x,
          start: Math.min(draggingRect.y, other.y),
          end: Math.max(draggingRect.y + draggingRect.height, other.y + other.height)
        })
      }

      // Right edge alignment
      if (Math.abs(draggingRect.x + draggingRect.width - (other.x + other.width)) < SNAP_THRESHOLD) {
        newGuides.push({
          type: 'vertical',
          position: other.x + other.width,
          start: Math.min(draggingRect.y, other.y),
          end: Math.max(draggingRect.y + draggingRect.height, other.y + other.height)
        })
      }
    }

    setGuides(newGuides)
  }, [])

  const clearGuides = useCallback(() => setGuides([]), [])

  return { guides, computeGuides, clearGuides }
}
