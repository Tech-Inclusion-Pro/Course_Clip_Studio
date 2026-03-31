import { useState, useCallback } from 'react'

export interface SlidePosition {
  x: number
  y: number
  width: number
  height: number
}

const DEFAULT_POSITION: SlidePosition = {
  x: 0,
  y: 0,
  width: 100,
  height: 80
}

export function useSlideLayout() {
  const [positions, setPositions] = useState<Map<string, SlidePosition>>(new Map())

  const getPosition = useCallback(
    (blockId: string): SlidePosition => {
      return positions.get(blockId) ?? DEFAULT_POSITION
    },
    [positions]
  )

  const setPosition = useCallback((blockId: string, pos: Partial<SlidePosition>) => {
    setPositions((prev) => {
      const next = new Map(prev)
      const current = next.get(blockId) ?? DEFAULT_POSITION
      next.set(blockId, { ...current, ...pos })
      return next
    })
  }, [])

  return { getPosition, setPosition }
}
