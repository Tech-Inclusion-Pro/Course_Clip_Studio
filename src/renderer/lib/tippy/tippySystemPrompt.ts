// ─── Tippy System Prompt Builder ───
// Assembles TIPPY's 4-layer system prompt at runtime.
//
// Layer 1: Core Identity (from tippy-core.md)
// Layer 2: Features KB (relevant sections retrieved by query)
// Layer 3: Author Profile (from saved Get to Know You data — Phase 2, stub for now)
// Layer 4: Session Context (current view, active block, recent actions)

import type { TippyContext } from './tippyContext'
import type { TippyFeatureSection } from '@/types/analytics'
import coreIdentity from './tippy-core.md?raw'
import { retrieveFeatureSections } from './features-retrieval'

// ─── Layer 1: Core Identity ───

function buildLayer1(): string {
  return coreIdentity.trim()
}

// ─── Layer 2: Features KB (query-driven retrieval) ───

function buildLayer2(query: string): string {
  const sections = retrieveFeatureSections(query, 4)
  if (sections.length === 0) return ''

  const header = `\n---\n\n## Relevant Feature Documentation\n\nThe following sections from the LuminaUDL Feature Reference are relevant to the author's question:\n`
  const body = sections
    .map((s: TippyFeatureSection) => `### ${s.heading}\n${s.content}`)
    .join('\n\n')

  return header + body
}

// ─── Layer 3: Author Profile ───

function buildLayer3(): string {
  // Access the author profile store to get the generated markdown
  // Uses dynamic import pattern to avoid circular dependency issues
  try {
    const { useAuthorProfileStore } = require('@/stores/useAuthorProfileStore')
    const profileMarkdown = useAuthorProfileStore.getState().profileMarkdown
    if (!profileMarkdown) return ''

    return `\n---\n\n## Author Design Profile\n\nThe following profile was built from the author's Get to Know You onboarding. Use it to personalize your suggestions.\n\n${profileMarkdown}`
  } catch {
    return ''
  }
}

// ─── Layer 4: Session Context ───

function buildLayer4(ctx: TippyContext): string {
  const parts: string[] = []

  parts.push(`\n---\n\n## Current Session Context`)

  // Language
  if (ctx.language !== 'en') {
    parts.push(`\nIMPORTANT: Respond in the user's selected language: "${ctx.language}". All your responses must be in this language.`)
  }

  // Current view
  parts.push(`\n- **Current view:** ${ctx.currentView}`)

  // AI Provider info
  if (ctx.aiProvider) {
    parts.push(`- **Active AI provider:** ${ctx.aiProvider.name}${ctx.aiProvider.isLocal ? ' (local — no data sent to cloud)' : ' (cloud)'}`)
  }

  // Course context
  if (ctx.activeCourse) {
    parts.push(`- **Active course:** "${ctx.activeCourse.title}" (${ctx.activeCourse.moduleCount} modules, ${ctx.activeCourse.lessonCount} lessons)`)
  } else {
    parts.push(`- **No active course** — the user hasn't opened a course yet.`)
  }

  if (ctx.activeModule) {
    parts.push(`- **Active module:** "${ctx.activeModule.title}"`)
  }

  if (ctx.activeLesson) {
    parts.push(`- **Active lesson:** "${ctx.activeLesson.title}" (${ctx.activeLesson.blockCount} blocks)`)
  }

  if (ctx.selectedBlock) {
    parts.push(`- **Selected block:** type="${ctx.selectedBlock.type}"`)
  }

  // Editor state
  if (ctx.editorState) {
    parts.push(`- **Canvas mode:** ${ctx.editorState.canvasMode}`)
    parts.push(`- **Split preview:** ${ctx.editorState.splitPreview ? 'open' : 'closed'}`)
    if (ctx.editorState.panelsOpen.length > 0) {
      parts.push(`- **Open panels:** ${ctx.editorState.panelsOpen.join(', ')}`)
    }
  }

  // Dashboard state
  if (ctx.dashboardState) {
    parts.push(`- **Dashboard section:** ${ctx.dashboardState.section}`)
    parts.push(`- **Total courses:** ${ctx.dashboardState.courseCount}`)
    if (ctx.dashboardState.searchActive) {
      parts.push(`- User is actively searching courses`)
    }
  }

  // AI not configured
  if (!ctx.aiConfigured) {
    parts.push(`- **AI not configured** — remind the user to set up an AI provider in Settings > AI/LLM if they ask about AI features.`)
  }

  // Recent actions
  if (ctx.recentActions.length > 0) {
    parts.push(`\n## Recent Author Actions`)
    parts.push(ctx.recentActions.map((a) => `- ${a}`).join('\n'))
  }

  // WCAG flags
  if (ctx.currentWCAGFlags.length > 0) {
    parts.push(`\n## Active WCAG Issues in Current View`)
    parts.push(ctx.currentWCAGFlags.map((f) => `- **${f.criterion}** (${f.impact}): ${f.description}`).join('\n'))
  }

  // Available actions based on view
  parts.push(`\n## Available Actions in "${ctx.currentView}" View`)

  switch (ctx.currentView) {
    case 'dashboard':
      parts.push(`The user can: create a new course, open an existing course, import a course, search/filter courses, access templates, manage content areas, use the syllabus builder, or go to Settings.`)
      break
    case 'editor':
      parts.push(`The user can: add/edit/reorder content blocks, switch between Block and Slide view, use the outline panel (left), properties panel (right), AI assistant panel, theme editor, accessibility audit, preview, notes, version history, undo/redo, save, and publish.`)
      break
    case 'preview':
      parts.push(`The user can: preview the course as a learner, switch between desktop/tablet/mobile views, add learner notes and bookmarks, and navigate between lessons.`)
      break
    case 'settings':
      parts.push(`The user can: configure author name, default language, theme, workspace folder, AI/LLM provider and API keys, brand kits, accessibility settings, analytics, and media source providers.`)
      break
    case 'publish':
      parts.push(`The user can: export the course as SCORM, xAPI, HTML5, PDF, or cmi5 package, configure publish settings, and download the output.`)
      break
  }

  // Accessibility context
  if (ctx.accessibility.highContrast || ctx.accessibility.reducedMotion || ctx.accessibility.fontSize !== 16) {
    parts.push(`\n## Accessibility Note`)
    parts.push(`The user has accessibility settings active: ${[
      ctx.accessibility.highContrast && 'high contrast mode',
      ctx.accessibility.reducedMotion && 'reduced motion',
      ctx.accessibility.fontSize !== 16 && `font size ${ctx.accessibility.fontSize}px`
    ].filter(Boolean).join(', ')}. Be mindful of this in your suggestions.`)
  }

  // Errors
  if (ctx.recentErrors.length > 0) {
    parts.push(`\n## Recent Errors`)
    parts.push(`The following errors have occurred: ${ctx.recentErrors.join('; ')}. If the user asks about errors, help them resolve these.`)
  }

  return parts.join('\n')
}

// ─── Reasoning Instruction ───

function buildReasoningInstruction(): string {
  return `\n---\n\n## Response Format Requirements

For every substantive recommendation, include a reasoning block at the END of your response using this exact format:

\`\`\`reasoning
sources: [List sources you drew on — WCAG criteria, UDL checkpoints, feature docs, axe-core results, etc.]
confidence: [high | medium | low | uncertain]
confidence_details: [Brief breakdown of confidence per aspect]
limitations: [What you cannot evaluate or what might be wrong]
human_review: [What the author needs to verify or decide]
\`\`\`

For simple factual answers or feature explanations, you may omit the reasoning block. Only include it when you are making a recommendation, assessment, or suggestion that involves judgment.`
}

// ─── Public API ───

/**
 * Build the full TIPPY system prompt from all 4 layers.
 * The query parameter is used for Layer 2 (features KB retrieval).
 */
export function buildTippySystemPrompt(ctx: TippyContext, query?: string): string {
  const layers: string[] = []

  // Layer 1: Core Identity
  layers.push(buildLayer1())

  // Layer 2: Features KB (only if there's a query to match against)
  if (query) {
    const layer2 = buildLayer2(query)
    if (layer2) layers.push(layer2)
  }

  // Layer 3: Author Profile (Phase 2)
  const layer3 = buildLayer3()
  if (layer3) layers.push(layer3)

  // Layer 4: Session Context
  layers.push(buildLayer4(ctx))

  // Reasoning instruction
  layers.push(buildReasoningInstruction())

  return layers.join('\n')
}
