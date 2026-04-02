// ─── AI Translation for UI Strings ───

import type { AIProvider } from '@/lib/ai/types'
import { getLanguage } from './languages'

const BATCH_SIZE = 100

/**
 * Translate a dictionary of English UI strings to a target language using the AI provider.
 * Splits into batches of ~100 keys to stay within token limits.
 */
export async function translateUIStrings(
  provider: AIProvider,
  englishStrings: Record<string, string>,
  targetLanguageCode: string,
  onProgress?: (percent: number) => void
): Promise<Record<string, string>> {
  const lang = getLanguage(targetLanguageCode)
  if (!lang) throw new Error(`Unknown language code: ${targetLanguageCode}`)

  const entries = Object.entries(englishStrings)
  const totalBatches = Math.ceil(entries.length / BATCH_SIZE)
  const result: Record<string, string> = {}

  for (let i = 0; i < totalBatches; i++) {
    const batch = entries.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
    const batchObj = Object.fromEntries(batch)

    const prompt = `Translate these UI strings from English to ${lang.name} (${lang.nativeName}).
Return a JSON object with the same keys and translated values.
Rules:
- Keep placeholders like {{name}}, {{count}}, {{current}}, {{total}}, {{version}} unchanged
- Keep technical terms (SCORM, WCAG, UDL, HTML, CSS, H5P, LTI, xAPI, PDF, JSON) untranslated
- Match formality level appropriate for ${lang.name}
- For RTL languages, do not reverse punctuation or numbers
- Only return valid JSON, no markdown fencing, no extra text

JSON to translate:
${JSON.stringify(batchObj, null, 2)}`

    const systemPrompt = `You are a professional UI localization translator. Return ONLY valid JSON with the same keys and translated string values. No explanation, no markdown.`

    const raw = await provider.generateText(prompt, systemPrompt)

    // Parse the JSON response, stripping any markdown fencing
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
    try {
      const parsed = JSON.parse(cleaned) as Record<string, string>
      Object.assign(result, parsed)
    } catch {
      // If parsing fails, try to salvage — skip this batch
      console.error(`Failed to parse translation batch ${i + 1}/${totalBatches}`)
    }

    if (onProgress) {
      onProgress(Math.round(((i + 1) / totalBatches) * 100))
    }
  }

  return result
}
