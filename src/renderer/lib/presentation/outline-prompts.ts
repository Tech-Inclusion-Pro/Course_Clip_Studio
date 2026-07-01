import type { IntakeConfig, LayoutHint } from '@/types/presentation'
import { SLIDE_LAYOUTS } from './slide-layouts'

const DENSITY_MAP: Record<string, string> = {
  light: '2-3 bullet points per slide, concise text',
  medium: '3-5 bullet points per slide, moderate detail',
  dense: '5-8 bullet points per slide, detailed content'
}

const ALL_LAYOUT_HINTS: LayoutHint[] = SLIDE_LAYOUTS.map((l) => l.id)

function layoutGuidance(): string {
  const descriptions = SLIDE_LAYOUTS.map((l) => `  - "${l.id}": ${l.description}`).join('\n')
  return `Available layouts:\n${descriptions}`
}

function bilingualInstruction(intake: IntakeConfig): string {
  if (!intake.language) return ''
  return '\n\nIMPORTANT: Generate bilingual content. Each slide title and body should include both English and Spanish text. Format as "English text / Texto en español". Speaker notes should remain in English only.'
}

function baseInstructions(intake: IntakeConfig): string {
  const parts: string[] = []
  if (intake.audience) parts.push(`Target audience: ${intake.audience}`)
  parts.push(`Number of slides: ${intake.slideCount}`)
  parts.push(`Content density: ${DENSITY_MAP[intake.density] || DENSITY_MAP.medium}`)
  return parts.join('\n') + bilingualInstruction(intake)
}

function jsonSchema(): string {
  return `Return a JSON array of slide objects. Each object has these fields:
- "title": string (slide title)
- "body": string (slide body content, use \\n for line breaks between bullets)
- "speakerNotes": string (presenter notes for this slide)
- "imagePrompt": string (a search term for finding a relevant stock image)
- "layoutHint": one of ${JSON.stringify(ALL_LAYOUT_HINTS)}
- "flags": array (empty array for prompt mode)

${layoutGuidance()}

Layout selection guidance:
- First slide: always "title"
- Topic transitions: "section"
- Most content: "bullets"
- Visual emphasis: "image-left" or "image-right"
- Key statistics or metrics: "big-number" (put the number in "title", caption in "body")
- Quotations: "quote" (put quote in "body", end with "-- Attribution Name" on its own line)
- Pros/cons or side-by-side: "comparison" (separate two columns with "---" in body, first line of each column is the label)
- Parallel points: "two-column" (separate columns with "---" in body)
- Background imagery: "full-image"
- Minimal/spacer: "blank"

Output ONLY valid JSON with no markdown fencing, no explanation text.`
}

export function promptModeOutlinePrompt(topic: string, intake: IntakeConfig): string {
  return `Create a professional presentation outline about the following topic:

${topic}

${baseInstructions(intake)}

${jsonSchema()}

Generate a clear, well-structured presentation with an engaging title slide, logical flow of content, and a concluding slide. Each slide should have a concise title and substantive body content appropriate for the density level. Use a variety of layouts for visual interest — include at least one special layout (big-number, quote, or comparison) where appropriate.`
}

export function notesModeOutlinePrompt(notes: string, intake: IntakeConfig): string {
  return `Convert the following notes into a structured presentation outline. Preserve the user's original wording as much as possible. Do not invent facts — only restructure and organize.

USER NOTES:
${notes}

${baseInstructions(intake)}

Return a JSON array of slide objects. Each object has these fields:
- "title": string (slide title)
- "body": string (slide body content, use \\n for line breaks between bullets)
- "speakerNotes": string (presenter notes for this slide)
- "imagePrompt": string (a search term for finding a relevant stock image)
- "layoutHint": one of ${JSON.stringify(ALL_LAYOUT_HINTS)}
- "flags": array of objects with { "kind": "invented" | "condensed" | "citation", "detail": string }
  - Use "invented" if you had to create a title or structure not in the original notes
  - Use "condensed" if you significantly shortened the user's text
  - Use "citation" if the notes contain a reference or citation that should be preserved

${layoutGuidance()}

Layout selection guidance:
- First slide: always "title"
- Topic transitions: "section"
- Key statistics from the notes: "big-number" (put the number in "title", caption in "body")
- Quotations from the notes: "quote" (put quote in "body", end with "-- Attribution" on its own line)
- Comparisons in the notes: "comparison" (separate columns with "---" in body)

Output ONLY valid JSON with no markdown fencing, no explanation text.

Faithfully structure the provided notes. Carry forward any citations. Flag any content you invented or condensed.`
}
