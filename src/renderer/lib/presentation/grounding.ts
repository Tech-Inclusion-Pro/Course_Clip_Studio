// ─── Content-Area grounding for presentation generation ───
// Builds an outline prompt grounded in a Content Area's profile AND its reference
// files — including Knowledge Web citation notes bound via the Content Areas feature.
// Reuses contentAreaFilesContext() (lib/ai/prompts) so bound citations flow straight
// into slide generation, and instructs the model to cite sources it uses.

import type { ContentArea } from '@/types/course'
import type { IntakeConfig } from '@/types/presentation'
import { contentAreaFilesContext } from '@/lib/ai/prompts'
import { promptModeOutlinePrompt } from './outline-prompts'

/** Read a Content Area's files into the id→content map contentAreaFilesContext expects. */
async function loadContentAreaFiles(area: ContentArea): Promise<string> {
  const files = area.files ?? []
  if (files.length === 0) return ''
  const fileContents: Record<string, string> = {}
  for (const f of files) {
    try {
      fileContents[f.id] = await window.electronAPI.fs.readFile(f.path, 'utf-8')
    } catch {
      // Unreadable/binary/missing — skip, same as the AI panel does.
    }
  }
  return contentAreaFilesContext(files, fileContents)
}

function profileBlock(area: ContentArea): string {
  const parts: string[] = [`Content area: ${area.name}`]
  if (area.audience) parts.push(`Audience: ${area.audience}`)
  if (area.objectives) parts.push(`Learning objectives: ${area.objectives}`)
  if (area.priorKnowledge) parts.push(`Assumed prior knowledge: ${area.priorKnowledge}`)
  if (area.tone) parts.push(`Preferred tone: ${area.tone}`)
  if (area.accessibilityNeeds) parts.push(`Accessibility needs: ${area.accessibilityNeeds}`)
  return parts.join('\n')
}

/**
 * Build a grounded outline prompt for a Content Area. The area's profile shapes the
 * request; its reference files (incl. citation notes) are provided as grounding, and
 * the model is told to ground claims and preserve citations via the "citation" flag.
 */
export async function buildContentAreaOutlinePrompt(
  area: ContentArea,
  intake: IntakeConfig,
  extraTopic?: string
): Promise<string> {
  const grounding = await loadContentAreaFiles(area)
  const topic = `${profileBlock(area)}${
    extraTopic ? `\n\nFocus: ${extraTopic}` : ''
  }${grounding}

Ground the presentation in the reference material above. When a slide draws on a reference file, preserve its citation and add a { "kind": "citation", "detail": "<source>" } flag to that slide. Do not invent facts beyond the references and the topic.`
  return promptModeOutlinePrompt(topic, intake)
}
