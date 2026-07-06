import { useState, useEffect } from 'react'
import { ImageIcon, ArrowRight, AlertTriangle, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StockSearchDialog } from '@/components/ui/StockSearchDialog'
import { usePresentationStore } from '@/stores/usePresentationStore'
import { useAppStore } from '@/stores/useAppStore'
import { resolveTheme } from '@/lib/presentation/themes'
import { verifyThemeContrast } from '@/lib/presentation/wcag-verifier'
import { getDeckAssetsDir } from '@/lib/presentation/deck-persistence'
import { generateSlideImage, ImageGenError } from '@/lib/presentation/image-gen'
import { ContrastReportPanel } from './ContrastReportPanel'
import type { RenderedSlide, ContrastReport } from '@/types/presentation'

const IMAGE_STYLE_MODIFIERS: Record<string, string> = {
  flat_vector: 'vector illustration',
  photographic: 'photograph',
  diagram: 'diagram infographic',
  abstract_gradient: 'abstract gradient'
}

export function RenderingView(): JSX.Element {
  const draft = usePresentationStore((s) => s.activeDraft)
  const activeDeck = usePresentationStore((s) => s.activeDeck)
  const setRenderedSlides = usePresentationStore((s) => s.setRenderedSlides)
  const updateRenderedSlide = usePresentationStore((s) => s.updateRenderedSlide)
  const finalizeDeck = usePresentationStore((s) => s.finalizeDeck)
  const setStep = usePresentationStore((s) => s.setStep)
  const workspacePath = useAppStore((s) => s.workspacePath)
  const imageGen = useAppStore((s) => s.imageGen)
  const customThemes = useAppStore((s) => s.customPresentationThemes)

  const [contrastReport, setContrastReport] = useState<ContrastReport | null>(null)
  const [overrideReason, setOverrideReason] = useState('')
  const [searchSlideId, setSearchSlideId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [genError, setGenError] = useState<string | null>(null)

  const theme = resolveTheme(draft?.themeId ?? 'lumina-light', customThemes)
  const renderedSlides = activeDeck?.slides ?? []

  // Sync rendered slides from the draft whenever it changes, preserving any image
  // assignments (imagePath/imageAltText) by slide id. This ensures outline edits —
  // including layout changes — are always reflected here and in the export.
  useEffect(() => {
    if (!draft) return
    const prev = new Map(
      (usePresentationStore.getState().activeDeck?.slides ?? []).map((s) => [s.id, s])
    )
    const slides: RenderedSlide[] = draft.slides.map((s) => {
      const existing = prev.get(s.id)
      return {
        ...s,
        imagePath: existing?.imagePath ?? null,
        imageAltText: existing?.imageAltText ?? ''
      }
    })
    setRenderedSlides(slides)
  }, [draft])

  // Check contrast on mount
  useEffect(() => {
    const report = verifyThemeContrast(theme)
    setContrastReport(report)
  }, [theme.id])

  if (!draft) return <></>

  const searchSlide = renderedSlides.find((s) => s.id === searchSlideId)
  const imageStyle = draft.imageStyle

  // Validation: all slides with images must have alt text
  const missingAltText = renderedSlides.some((s) => s.imagePath && !s.imageAltText.trim())
  // Chart/table slides must carry a text summary (accessibility parity with alt text)
  const missingDataSummary = renderedSlides.some(
    (s) =>
      (s.layoutHint === 'chart' && !s.chart?.summary.trim()) ||
      (s.layoutHint === 'table' && !s.table?.summary.trim())
  )

  function handleImageSelect(slideId: string, localPath: string) {
    const slide = renderedSlides.find((s) => s.id === slideId)
    updateRenderedSlide(slideId, {
      imagePath: localPath,
      imageAltText: slide?.imageAltText || `Image for: ${slide?.title ?? 'slide'}`
    })
    setSearchSlideId(null)
  }

  async function handleGenerateImage(slide: RenderedSlide) {
    if (!activeDeck || !workspacePath) {
      setGenError('Choose a workspace folder before generating images.')
      return
    }
    setGenError(null)
    setGeneratingId(slide.id)
    try {
      const path = await generateSlideImage({
        prompt: slide.imagePrompt || slide.title,
        style: imageStyle,
        cfg: imageGen,
        assetsDir: getDeckAssetsDir(workspacePath, activeDeck),
        slideId: slide.id
      })
      handleImageSelect(slide.id, path)
    } catch (err) {
      setGenError(
        err instanceof ImageGenError
          ? err.message
          : 'Image generation failed. Check your settings and try again.'
      )
    } finally {
      setGeneratingId(null)
    }
  }

  function handleProceedToPreview() {
    finalizeDeck(theme)
    setStep('preview')
  }

  const showContrastWarning = !!contrastReport && !contrastReport.allPass

  return (
    <div className="space-y-6">
      {/* Contrast report */}
      {contrastReport && (
        <ContrastReportPanel report={contrastReport} />
      )}

      {showContrastWarning && (
        <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-300 bg-amber-50">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-amber-800 mb-2">
              This theme has contrast issues. You can override by providing a reason, or go back to change themes.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={overrideReason}
                onChange={(e) => setOverrideReason(e.target.value)}
                placeholder="Reason for override..."
                className="flex-1 px-2 py-1 text-sm rounded border border-amber-300 bg-white"
              />
              <Button variant="ghost" size="sm" onClick={() => setStep('outline')}>
                Change Theme
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Per-slide image assignment */}
      <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
        Assign Images & Alt Text
      </h3>

      <div className="space-y-3">
        {renderedSlides.map((slide, index) => (
          <div
            key={slide.id}
            className="flex items-start gap-4 p-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)]"
          >
            {/* Slide info */}
            <div className="w-8 text-center">
              <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-tertiary)]">{index + 1}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-[var(--font-weight-medium)] text-[var(--text-primary)] truncate mb-1">
                {slide.title || 'Untitled slide'}
              </p>

              {/* Image prompt / search */}
              {slide.imagePrompt && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs text-[var(--text-tertiary)]">
                    Search: "{slide.imagePrompt} {IMAGE_STYLE_MODIFIERS[imageStyle] ?? ''}"
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchSlideId(slide.id)}
                  >
                    <ImageIcon size={12} />
                    {slide.imagePath ? 'Change' : 'Search'}
                  </Button>
                  {imageGen.enabled && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateImage(slide)}
                      disabled={generatingId === slide.id}
                    >
                      {generatingId === slide.id ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <Sparkles size={12} />
                      )}
                      Generate
                    </Button>
                  )}
                </div>
              )}

              {/* Image preview */}
              {slide.imagePath && (
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={`file://${slide.imagePath}`}
                    alt={slide.imageAltText}
                    className="w-20 h-14 rounded object-cover border border-[var(--border-default)]"
                  />
                  <div className="flex-1">
                    <label className="block text-[10px] font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-0.5">
                      Alt Text (required)
                    </label>
                    <input
                      type="text"
                      value={slide.imageAltText}
                      onChange={(e) => updateRenderedSlide(slide.id, { imageAltText: e.target.value })}
                      placeholder="Describe this image for accessibility..."
                      className={`w-full px-2 py-1 text-xs rounded border bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)] ${
                        slide.imagePath && !slide.imageAltText.trim()
                          ? 'border-red-400'
                          : 'border-[var(--border-default)]'
                      }`}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Image generation error */}
      {genError && <p className="text-xs text-red-600">{genError}</p>}

      {/* Validation warning */}
      {missingAltText && (
        <p className="text-xs text-red-600">
          All images require alt text before proceeding.
        </p>
      )}
      {missingDataSummary && (
        <p className="text-xs text-red-600">
          Chart and table slides need a text summary (add it in the outline step) before proceeding.
        </p>
      )}

      {/* Proceed button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          size="md"
          onClick={handleProceedToPreview}
          disabled={missingAltText || missingDataSummary || (showContrastWarning && !overrideReason.trim())}
        >
          Preview & Export
          <ArrowRight size={16} />
        </Button>
      </div>

      {/* Stock search dialog */}
      {searchSlide && (
        <StockSearchDialog
          open={!!searchSlideId}
          onClose={() => setSearchSlideId(null)}
          onSelect={(localPath) => handleImageSelect(searchSlide.id, localPath)}
          mediaType="image"
          initialQuery={`${searchSlide.imagePrompt} ${IMAGE_STYLE_MODIFIERS[imageStyle] ?? ''}`.trim()}
          title={`Image for: ${searchSlide.title}`}
        />
      )}
    </div>
  )
}
