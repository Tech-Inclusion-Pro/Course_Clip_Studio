interface GridOverlayProps {
  width: number
  height: number
  gridSize?: number
  style?: 'dots' | 'lines'
}

export function GridOverlay({ width, height, gridSize = 20, style = 'dots' }: GridOverlayProps): JSX.Element {
  if (style === 'lines') {
    return (
      <svg
        className="absolute inset-0 pointer-events-none"
        width={width}
        height={height}
        aria-hidden="true"
      >
        <defs>
          <pattern id="grid-lines" width={gridSize} height={gridSize} patternUnits="userSpaceOnUse">
            <path d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-lines)" />
      </svg>
    )
  }

  // Dots pattern
  const dots: JSX.Element[] = []
  for (let x = gridSize; x < width; x += gridSize) {
    for (let y = gridSize; y < height; y += gridSize) {
      dots.push(<circle key={`${x}-${y}`} cx={x} cy={y} r={0.8} fill="rgba(0,0,0,0.12)" />)
    }
  }

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      aria-hidden="true"
    >
      {dots}
    </svg>
  )
}
