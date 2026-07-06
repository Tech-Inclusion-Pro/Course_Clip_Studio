import { Chart } from 'react-chartjs-2'
import 'chart.js/auto'
import type { RenderedSlide, PresentationTheme } from '@/types/presentation'
import { getLayoutDef } from '@/lib/presentation/slide-layouts'
import { chartToChartJsConfig } from '@/lib/presentation/chart-data'

interface SlidePreviewCardProps {
  slide: RenderedSlide
  theme: PresentationTheme
  index: number
}

export function SlidePreviewCard({ slide, theme, index }: SlidePreviewCardProps): JSX.Element {
  const layout = getLayoutDef(slide.layoutHint)
  const hasImage = !!slide.imagePath
  const showImageLeft = slide.layoutHint === 'image-left'
  const showImageRight = slide.layoutHint === 'image-right'
  const isFullImage = slide.layoutHint === 'full-image'
  const isTwoColumn = slide.layoutHint === 'two-column' || slide.layoutHint === 'comparison'

  // Parse special content
  const isQuote = slide.layoutHint === 'quote'
  const isBigNumber = slide.layoutHint === 'big-number'

  let quoteText = ''
  let quoteAttribution = ''
  if (isQuote && slide.body) {
    const lines = slide.body.split('\n')
    const attrIdx = lines.findIndex((l) => l.trim().startsWith('--'))
    if (attrIdx >= 0) {
      quoteText = lines.slice(0, attrIdx).join('\n').trim()
      quoteAttribution = lines[attrIdx].replace(/^--\s*/, '').trim()
    } else {
      quoteText = slide.body
    }
  }

  let colLeft = ''
  let colRight = ''
  if (isTwoColumn && slide.body) {
    const parts = slide.body.split('---')
    colLeft = (parts[0] || '').trim()
    colRight = (parts[1] || '').trim()
  }

  const isChart = slide.layoutHint === 'chart' && !!slide.chart
  const isTable = slide.layoutHint === 'table' && !!slide.table
  const chartCfg = isChart ? chartToChartJsConfig(slide.chart!, theme) : null

  return (
    <div className="rounded-lg border border-[var(--border-default)] overflow-hidden shadow-sm">
      {/* Slide label bar */}
      <div className="px-3 py-1 bg-[var(--bg-muted)] text-[10px] text-[var(--text-tertiary)] font-[var(--font-weight-medium)] flex justify-between">
        <span>Slide {index + 1}</span>
        <span>{layout.name}</span>
      </div>

      {/* 16:9 slide area */}
      <div
        className="relative"
        style={{
          aspectRatio: '16 / 9',
          backgroundColor: layout.accentBackground ? theme.accent : theme.background,
          fontFamily: theme.fontFamily,
          overflow: 'hidden'
        }}
      >
        {/* Big Number layout */}
        {isBigNumber && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '5%' }}>
            <div style={{ color: theme.accent, fontSize: '2.5em', fontWeight: 700, lineHeight: 1 }}>
              {slide.title}
            </div>
            {slide.body && (
              <div style={{ color: theme.textPrimary, fontSize: '0.65em', marginTop: '0.5em', textAlign: 'center', opacity: 0.85 }}>
                {slide.body}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '7%', backgroundColor: theme.accent }} />
          </div>
        )}

        {/* Chart layout */}
        {isChart && chartCfg && (
          <div style={{ padding: '5%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: theme.textPrimary, fontSize: '0.85em', fontWeight: 700, marginBottom: '0.4em' }}>
              {slide.title}
            </div>
            <div style={{ flex: 1, minHeight: 0 }}>
              <Chart type={chartCfg.type as never} data={chartCfg.data as never} options={chartCfg.options as never} />
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '7%', backgroundColor: theme.accent }} />
          </div>
        )}

        {/* Table layout */}
        {isTable && slide.table && (
          <div style={{ padding: '5%', height: '100%', overflow: 'hidden' }}>
            <div style={{ color: theme.textPrimary, fontSize: '0.85em', fontWeight: 700, marginBottom: '0.4em' }}>
              {slide.title}
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.5em', color: theme.textPrimary }}>
              <thead>
                <tr>
                  {slide.table.headers.map((h, i) => (
                    <th key={i} style={{ border: `1px solid ${theme.accent}`, background: theme.surface, padding: '0.3em', textAlign: 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {slide.table.rows.map((r, ri) => (
                  <tr key={ri}>
                    {r.map((c, ci) => (
                      <td key={ci} style={{ border: `1px solid ${theme.surface}`, padding: '0.3em' }}>{c}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '7%', backgroundColor: theme.accent }} />
          </div>
        )}

        {/* Quote layout */}
        {isQuote && (
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', padding: '8%' }}>
            <div style={{ color: theme.accent, fontSize: '2.5em', fontWeight: 700, lineHeight: 0.8 }}>{'\u201C'}</div>
            <div style={{ color: theme.textPrimary, fontSize: '0.7em', fontStyle: 'italic', textAlign: 'center', margin: '0.5em 0', lineHeight: 1.4 }}>
              {quoteText}
            </div>
            {quoteAttribution && (
              <div style={{ color: theme.textPrimary, fontSize: '0.55em', textAlign: 'right', opacity: 0.7 }}>
                {'\u2014'} {quoteAttribution}
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '7%', backgroundColor: theme.accent }} />
          </div>
        )}

        {/* Two column / Comparison layout */}
        {isTwoColumn && !isBigNumber && !isQuote && (
          <div style={{ padding: '5%', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ color: theme.textPrimary, fontSize: '0.85em', fontWeight: 700, marginBottom: '0.4em' }}>
              {slide.title}
            </div>
            <div style={{ display: 'flex', gap: '3%', flex: 1 }}>
              <div style={{ flex: 1, fontSize: '0.55em', color: theme.textPrimary, whiteSpace: 'pre-wrap', opacity: 0.85 }}>
                {colLeft}
              </div>
              <div style={{ flex: 1, fontSize: '0.55em', color: theme.textPrimary, whiteSpace: 'pre-wrap', opacity: 0.85 }}>
                {colRight}
              </div>
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '7%', backgroundColor: theme.accent }} />
          </div>
        )}

        {/* Title / Section layout */}
        {layout.accentBackground && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '5%' }}>
            <div style={{ color: theme.textOnAccent, fontSize: '1.2em', fontWeight: 700, marginBottom: '0.4em', lineHeight: 1.2, textAlign: 'center' }}>
              {slide.title}
            </div>
            {slide.body && (
              <div style={{ color: theme.textOnAccent, fontSize: '0.6em', lineHeight: 1.5, textAlign: 'center', opacity: 0.9 }}>
                {slide.body}
              </div>
            )}
          </div>
        )}

        {/* Standard content layouts (bullets, image-left/right, full-image, blank) */}
        {!layout.accentBackground && !isBigNumber && !isQuote && !isTwoColumn && (
          <div
            style={{
              padding: '5%',
              height: '100%',
              display: 'flex',
              flexDirection: isFullImage ? 'column' : showImageLeft ? 'row' : showImageRight ? 'row-reverse' : 'column',
              gap: '4%'
            }}
          >
            {/* Image area */}
            {hasImage && (
              <div
                style={{
                  width: isFullImage ? '100%' : (showImageLeft || showImageRight) ? '40%' : '100%',
                  height: isFullImage ? '60%' : 'auto',
                  maxHeight: '60%',
                  flexShrink: 0,
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={`file://${slide.imagePath}`}
                  alt={slide.imageAltText || slide.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Text content */}
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div
                style={{
                  color: theme.textPrimary,
                  fontSize: '0.85em',
                  fontWeight: 700,
                  marginBottom: '0.4em',
                  lineHeight: 1.2
                }}
              >
                {slide.title}
              </div>
              {slide.body && (
                <div
                  style={{
                    color: theme.textPrimary,
                    fontSize: '0.6em',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    opacity: 0.85
                  }}
                >
                  {slide.body}
                </div>
              )}
            </div>

            {/* Accent bar */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '7%', backgroundColor: theme.accent }} />
          </div>
        )}
      </div>
    </div>
  )
}
