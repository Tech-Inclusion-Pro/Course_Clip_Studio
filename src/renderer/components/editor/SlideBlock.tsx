import { useRef, useCallback, type ReactNode } from 'react'
import type { SlidePosition } from '@/hooks/useSlideLayout'

interface BoundingRect {
  id: string
  x: number
  y: number
  width: number
  height: number
}

interface SlideBlockProps {
  blockId: string
  position: SlidePosition
  onPositionChange: (pos: Partial<SlidePosition>) => void
  selected: boolean
  onSelect: () => void
  children: ReactNode
  snapToGrid?: boolean
  gridSize?: number
  onDrag?: (rect: BoundingRect) => void
  onDragEnd?: () => void
}

const snapValue = (v: number, size: number): number => Math.round(v / size) * size

export function SlideBlock({
  blockId,
  position,
  onPositionChange,
  selected,
  onSelect,
  children,
  snapToGrid,
  gridSize = 20,
  onDrag,
  onDragEnd
}: SlideBlockProps): JSX.Element {
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return
      e.stopPropagation()
      onSelect()

      dragRef.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: position.x,
        startPosY: position.y
      }

      const handleMouseMove = (me: MouseEvent) => {
        if (!dragRef.current) return
        const dx = me.clientX - dragRef.current.startX
        const dy = me.clientY - dragRef.current.startY
        let newX = dragRef.current.startPosX + dx
        let newY = dragRef.current.startPosY + dy
        if (snapToGrid) {
          newX = snapValue(newX, gridSize)
          newY = snapValue(newY, gridSize)
        }
        onPositionChange({ x: newX, y: newY })
        onDrag?.({ id: blockId, x: newX, y: newY, width: position.width, height: position.height })
      }

      const handleMouseUp = () => {
        dragRef.current = null
        onDragEnd?.()
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }

      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
    },
    [position, onPositionChange, onSelect, snapToGrid, gridSize, blockId, onDrag, onDragEnd]
  )

  return (
    <div
      data-block-id={blockId}
      className={`absolute cursor-move ${
        selected ? 'ring-2 ring-[var(--brand-magenta)] z-10' : 'hover:ring-1 hover:ring-[var(--border-default)]'
      }`}
      style={{
        left: position.x,
        top: position.y,
        width: position.width,
        minHeight: position.height
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="bg-white rounded-lg shadow-sm border border-[var(--border-default)] p-3 pointer-events-auto">
        {children}
      </div>

      {/* Resize handle */}
      {selected && (
        <div
          className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--brand-magenta)] rounded-sm cursor-se-resize"
          onMouseDown={(e) => {
            e.stopPropagation()
            const startX = e.clientX
            const startY = e.clientY
            const startW = position.width
            const startH = position.height

            const onMove = (me: MouseEvent) => {
              let newW = Math.max(100, startW + (me.clientX - startX))
              let newH = Math.max(60, startH + (me.clientY - startY))
              if (snapToGrid) {
                newW = snapValue(newW, gridSize)
                newH = snapValue(newH, gridSize)
              }
              onPositionChange({ width: newW, height: newH })
              onDrag?.({ id: blockId, x: position.x, y: position.y, width: newW, height: newH })
            }
            const onUp = () => {
              onDragEnd?.()
              window.removeEventListener('mousemove', onMove)
              window.removeEventListener('mouseup', onUp)
            }
            window.addEventListener('mousemove', onMove)
            window.addEventListener('mouseup', onUp)
          }}
        />
      )}
    </div>
  )
}
