// ─── AI image generation for slides (BYOK) ───
// Posts the slide's image prompt to an OpenAI-compatible images endpoint, decodes
// the returned base64 PNG, and writes it into the deck's assets dir. Alt text is
// still required downstream — generation does not bypass the accessibility gate.

import type { ImageGenConfig, ImageStyle } from '@/types/presentation'

const STYLE_MODIFIERS: Record<ImageStyle, string> = {
  flat_vector: 'flat vector illustration, clean, minimal',
  photographic: 'realistic photograph, natural lighting',
  diagram: 'clear labeled diagram / infographic',
  abstract_gradient: 'abstract gradient background, soft shapes'
}

function decodeBase64(b64: string): ArrayBuffer {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

export class ImageGenError extends Error {}

/**
 * Generate an image for a slide and save it under `assetsDir`. Returns the local
 * file path. Throws ImageGenError with a plain-language message on failure.
 */
export async function generateSlideImage(opts: {
  prompt: string
  style: ImageStyle
  cfg: ImageGenConfig
  assetsDir: string
  slideId: string
}): Promise<string> {
  const { prompt, style, cfg, assetsDir, slideId } = opts
  if (!cfg.enabled) throw new ImageGenError('AI image generation is off. Enable it in Settings → AI.')
  if (!cfg.apiKey) throw new ImageGenError('Add an image-generation API key in Settings → AI.')

  const fullPrompt = `${prompt}. Style: ${STYLE_MODIFIERS[style]}.`
  const url =
    cfg.provider === 'custom' && cfg.endpoint
      ? cfg.endpoint
      : 'https://api.openai.com/v1/images/generations'

  const res = await window.electronAPI.net.request({
    url,
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: cfg.model,
      prompt: fullPrompt,
      size: cfg.size,
      n: 1,
      response_format: 'b64_json'
    })
  })

  if (res.status < 200 || res.status >= 300) {
    throw new ImageGenError(`Image generation failed (${res.status}). Check your key and model.`)
  }

  const data = JSON.parse(res.body) as { data?: { b64_json?: string; url?: string }[] }
  const b64 = data.data?.[0]?.b64_json
  if (!b64) throw new ImageGenError('The image service returned no image data.')

  await window.electronAPI.fs.mkdir(assetsDir)
  const destPath = `${assetsDir}/gen-${slideId}-${Date.now().toString(36)}.png`
  await window.electronAPI.fs.writeFileBuffer(destPath, decodeBase64(b64))
  return destPath
}
