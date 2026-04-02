// ─── Tippy System Prompt Builder ───
// Constructs a context-aware system prompt for Tippy AI responses

import type { TippyContext } from './tippyContext'

export function buildTippySystemPrompt(ctx: TippyContext): string {
  const sections: string[] = []

  // Personality
  sections.push(`You are Tippy, the friendly AI assistant built into Course Clip Studio — an accessible e-learning authoring tool. You are warm, encouraging, concise, and expert in instructional design, Universal Design for Learning (UDL), and WCAG accessibility.

Your job is to help the user create excellent, accessible online courses. You provide in-app help, explain features, suggest improvements, troubleshoot errors, and guide users through the interface.

Keep responses short and actionable. Use 2-3 sentences when possible. Use bullet points for multi-step instructions. Reference specific UI elements by name (e.g., "Click the **Publish** button in the toolbar").`)

  // Language instruction
  if (ctx.language !== 'en') {
    sections.push(`IMPORTANT: Respond in the user's selected language: "${ctx.language}". All your responses must be in this language.`)
  }

  // Current view context
  sections.push(`## Current App Context`)
  sections.push(`- **Current view:** ${ctx.currentView}`)

  if (ctx.activeCourse) {
    sections.push(`- **Active course:** "${ctx.activeCourse.title}" (${ctx.activeCourse.moduleCount} modules, ${ctx.activeCourse.lessonCount} lessons)`)
  } else {
    sections.push(`- **No active course** — the user hasn't opened a course yet.`)
  }

  if (ctx.activeModule) {
    sections.push(`- **Active module:** "${ctx.activeModule.title}"`)
  }

  if (ctx.activeLesson) {
    sections.push(`- **Active lesson:** "${ctx.activeLesson.title}" (${ctx.activeLesson.blockCount} blocks)`)
  }

  if (ctx.selectedBlock) {
    sections.push(`- **Selected block:** type="${ctx.selectedBlock.type}"`)
  }

  if (ctx.editorState) {
    sections.push(`- **Canvas mode:** ${ctx.editorState.canvasMode}`)
    sections.push(`- **Split preview:** ${ctx.editorState.splitPreview ? 'open' : 'closed'}`)
    if (ctx.editorState.panelsOpen.length > 0) {
      sections.push(`- **Open panels:** ${ctx.editorState.panelsOpen.join(', ')}`)
    }
  }

  if (ctx.dashboardState) {
    sections.push(`- **Dashboard section:** ${ctx.dashboardState.section}`)
    sections.push(`- **Total courses:** ${ctx.dashboardState.courseCount}`)
    if (ctx.dashboardState.searchActive) {
      sections.push(`- User is actively searching courses`)
    }
  }

  if (!ctx.aiConfigured) {
    sections.push(`- **AI not configured** — remind the user to set up an AI provider in Settings → AI/LLM if they ask about AI features.`)
  }

  // Available actions based on view
  sections.push(`\n## Available Actions in "${ctx.currentView}" View`)

  switch (ctx.currentView) {
    case 'dashboard':
      sections.push(`The user can: create a new course, open an existing course, import a course, search/filter courses, access templates, manage content areas, use the syllabus builder, or go to Settings.`)
      break
    case 'editor':
      sections.push(`The user can: add/edit/reorder content blocks, switch between Block and Slide view, use the outline panel (left), properties panel (right), AI assistant panel, theme editor, accessibility audit, preview, notes, version history, undo/redo, save, and publish.`)
      break
    case 'preview':
      sections.push(`The user can: preview the course as a learner, switch between desktop/tablet/mobile views, add learner notes and bookmarks, and navigate between lessons.`)
      break
    case 'settings':
      sections.push(`The user can: configure author name, default language, theme, workspace folder, AI/LLM provider and API keys, brand kits, accessibility settings, and visual API providers.`)
      break
    case 'publish':
      sections.push(`The user can: export the course as SCORM, xAPI, or HTML5 package, configure publish settings, and download the output.`)
      break
  }

  // Accessibility context
  if (ctx.accessibility.highContrast || ctx.accessibility.reducedMotion || ctx.accessibility.fontSize !== 16) {
    sections.push(`\n## Accessibility Note`)
    sections.push(`The user has accessibility settings active: ${[
      ctx.accessibility.highContrast && 'high contrast mode',
      ctx.accessibility.reducedMotion && 'reduced motion',
      ctx.accessibility.fontSize !== 16 && `font size ${ctx.accessibility.fontSize}px`
    ].filter(Boolean).join(', ')}. Be mindful of this in your suggestions.`)
  }

  // Errors
  if (ctx.recentErrors.length > 0) {
    sections.push(`\n## Recent Errors`)
    sections.push(`The following errors have occurred: ${ctx.recentErrors.join('; ')}. If the user asks about errors, help them resolve these.`)
  }

  return sections.join('\n')
}
