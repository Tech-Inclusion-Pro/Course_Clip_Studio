/**
 * TIPPY Author Profile Generator
 *
 * Builds AuthorProfile from onboarding section data and generates
 * the tippy-profile.md markdown summary for system prompt injection.
 */

import type { AuthorProfile, OnboardingSectionData } from '@/types/analytics'

/**
 * Build a structured AuthorProfile from completed onboarding sections.
 * Returns null if no sections have been completed.
 */
export function buildProfileFromSections(
  sections: OnboardingSectionData[]
): AuthorProfile | null {
  const hasAnyData = sections.some((s) => s.responses.some((r) => r.trim().length > 0))
  if (!hasAnyData) return null

  const get = (sectionId: string, qIndex: number): string => {
    const section = sections.find((s) => s.id === sectionId)
    return section?.responses[qIndex]?.trim() || ''
  }

  return {
    // About You
    name: get('about-you', 0),
    preferredName: extractPreferredName(get('about-you', 0)),
    role: get('about-you', 1),
    organization: get('about-you', 2),
    credentials: get('about-you', 3),

    // Your Audience
    audienceDescription: get('your-audience', 0),
    disabilityFocus: get('your-audience', 1),
    multilingualFocus: get('your-audience', 2),
    audienceWishes: get('your-audience', 3),

    // Design Philosophy
    designApproach: get('design-philosophy', 0),
    accessibilityPrinciples: get('design-philosophy', 1),
    inclusionMeaning: get('design-philosophy', 2),
    frameworks: get('design-philosophy', 3),

    // Brand and Visual Style
    brandColors: get('brand-visual', 0),
    typography: get('brand-visual', 1),
    visualStyle: get('brand-visual', 2),
    visualAvoidances: get('brand-visual', 3),

    // Workflow
    workflowStart: get('workflow', 0),
    teamComposition: get('workflow', 1),
    biggestPainPoint: get('workflow', 2),
    aiWorkflowWishes: get('workflow', 3),

    // AI Preferences
    aiSupportPreference: get('ai-preferences', 0),
    reasoningDetail: get('ai-preferences', 1),
    cautionTopics: get('ai-preferences', 2),
    privacyPreferences: get('ai-preferences', 3)
  }
}

/**
 * Extract preferred name from the "What's your name? What do you prefer I call you?" response.
 * Looks for patterns like "call me X" or "I go by X" or just uses the first name.
 */
function extractPreferredName(nameResponse: string): string {
  if (!nameResponse) return ''

  const lower = nameResponse.toLowerCase()

  // Check for "call me X" or "I go by X" patterns
  const callMeMatch = lower.match(/call me\s+["']?(\w+)["']?/i)
  if (callMeMatch) return capitalize(callMeMatch[1])

  const goByMatch = lower.match(/go by\s+["']?(\w+)["']?/i)
  if (goByMatch) return capitalize(goByMatch[1])

  const preferMatch = lower.match(/prefer\s+["']?(\w+)["']?/i)
  if (preferMatch) return capitalize(preferMatch[1])

  // Fallback: first word that looks like a name
  const words = nameResponse.trim().split(/\s+/)
  const firstName = words[0]?.replace(/[.,!?'"]/g, '')
  return firstName || ''
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

/**
 * Generate the tippy-profile.md markdown from an AuthorProfile.
 * This is injected into TIPPY's system prompt as Layer 3.
 */
export function generateProfileMarkdown(profile: AuthorProfile): string {
  const lines: string[] = []
  const name = profile.preferredName || profile.name || 'Author'

  lines.push(`# Author Profile — ${name}`)
  lines.push('')

  // About
  if (profile.role || profile.organization || profile.credentials) {
    lines.push('## About')
    if (profile.role) lines.push(`Role: ${profile.role}`)
    if (profile.credentials) lines.push(`Credentials: ${profile.credentials}`)
    if (profile.organization) lines.push(`Organization: ${profile.organization}`)
    if (profile.preferredName && profile.preferredName !== profile.name) {
      lines.push(`Preferred name: ${profile.preferredName}`)
    }
    lines.push('')
  }

  // Audience
  if (profile.audienceDescription || profile.disabilityFocus || profile.multilingualFocus) {
    lines.push('## Audience')
    if (profile.audienceDescription) lines.push(profile.audienceDescription)
    if (profile.disabilityFocus) lines.push(`Disability focus: ${profile.disabilityFocus}`)
    if (profile.multilingualFocus) lines.push(`Multilingual focus: ${profile.multilingualFocus}`)
    if (profile.audienceWishes) lines.push(`Key wish: ${profile.audienceWishes}`)
    lines.push('')
  }

  // Design Philosophy
  if (profile.designApproach || profile.accessibilityPrinciples || profile.inclusionMeaning) {
    lines.push('## Design Philosophy')
    if (profile.designApproach) lines.push(profile.designApproach)
    if (profile.accessibilityPrinciples) lines.push(`Accessibility approach: ${profile.accessibilityPrinciples}`)
    if (profile.inclusionMeaning) lines.push(`Inclusion means: ${profile.inclusionMeaning}`)
    if (profile.frameworks) lines.push(`Frameworks: ${profile.frameworks}`)
    lines.push('')
  }

  // Brand
  if (profile.brandColors || profile.typography || profile.visualStyle) {
    lines.push('## Brand')
    if (profile.brandColors) lines.push(`Colors: ${profile.brandColors}`)
    if (profile.typography) lines.push(`Typography: ${profile.typography}`)
    if (profile.visualStyle) lines.push(`Visual style: ${profile.visualStyle}`)
    if (profile.visualAvoidances) lines.push(`Avoids: ${profile.visualAvoidances}`)
    lines.push('')
  }

  // Workflow
  if (profile.workflowStart || profile.teamComposition || profile.biggestPainPoint) {
    lines.push('## Workflow')
    if (profile.workflowStart) lines.push(`Starts with: ${profile.workflowStart}`)
    if (profile.teamComposition) lines.push(`Team: ${profile.teamComposition}`)
    if (profile.biggestPainPoint) lines.push(`Biggest pain point: ${profile.biggestPainPoint}`)
    if (profile.aiWorkflowWishes) lines.push(`Wishes: ${profile.aiWorkflowWishes}`)
    lines.push('')
  }

  // AI Preferences
  if (profile.aiSupportPreference || profile.reasoningDetail || profile.privacyPreferences) {
    lines.push('## AI Preferences')
    if (profile.aiSupportPreference) lines.push(`AI support style: ${profile.aiSupportPreference}`)
    if (profile.reasoningDetail) lines.push(`Reasoning detail: ${profile.reasoningDetail}`)
    if (profile.cautionTopics) lines.push(`Caution topics: ${profile.cautionTopics}`)
    if (profile.privacyPreferences) lines.push(`Privacy: ${profile.privacyPreferences}`)
    lines.push('')
  }

  return lines.join('\n')
}

/**
 * Format a brand kit into a pre-fill string for the brand colors question.
 */
export function formatBrandKitForPreFill(kit: {
  primaryColor: string
  secondaryColor: string
  accentColor: string
}): string {
  return `Primary: ${kit.primaryColor}, Secondary: ${kit.secondaryColor}, Accent: ${kit.accentColor}`
}

/**
 * Format brand kit typography for pre-fill.
 */
export function formatBrandFontForPreFill(kit: {
  fontFamily: string
  fontFamilyHeading: string
}): string {
  if (kit.fontFamily === kit.fontFamilyHeading) {
    return kit.fontFamily
  }
  return `Body: ${kit.fontFamily}, Headings: ${kit.fontFamilyHeading}`
}
