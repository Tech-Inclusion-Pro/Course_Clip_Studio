/**
 * TIPPY Assesses — AI Prompt Builders
 *
 * Phase 4: Builds structured prompts for the active AI provider to perform
 * deeper WCAG, UDL, and Inclusion analysis beyond what the deterministic
 * audit engine can detect.
 */

/**
 * Build a prompt for AI-enhanced WCAG analysis.
 * The AI synthesizes axe-core-style findings with semantic understanding.
 */
export function buildWCAGPrompt(minimalHTML: string, existingFindings: string): string {
  return `You are an accessibility expert evaluating course content against WCAG 2.1 AA.

Below is the course content serialized as minimal HTML (decorative elements removed).
Also provided are the findings from the deterministic accessibility audit engine.

Your task:
1. Review the existing findings for accuracy and completeness.
2. Identify any additional WCAG issues the automated engine may have missed, especially:
   - Cognitive accessibility issues (2.4.6 Headings and Labels, 3.3.2 Labels or Instructions)
   - Language clarity (3.1.1 Language of Page)
   - Meaningful sequence issues (1.3.2)
   - Keyboard operability patterns (2.1.1)
3. For each new finding, provide:
   - criterion: The WCAG success criterion (e.g., "1.3.2 Meaningful Sequence")
   - impact: "critical" | "serious" | "moderate" | "minor"
   - description: Plain-language explanation
   - suggestion: Specific remediation advice
   - estimatedMinutes: Time to fix (number)

Return ONLY a JSON array of new findings (do not repeat existing findings).
If no new findings, return an empty array: []

--- EXISTING FINDINGS ---
${existingFindings}

--- COURSE HTML ---
${minimalHTML.slice(0, 8000)}

Return JSON array:`
}

/**
 * Build a prompt for AI-enhanced UDL evaluation.
 */
export function buildUDLPrompt(minimalHTML: string, blockTypeSummary: string): string {
  return `You are a Universal Design for Learning (UDL) specialist evaluating course content
against the CAST UDL Guidelines 3.0.

Below is the course content as minimal HTML and a summary of block types used.

Evaluate the content against these UDL principles:

**Representation** (Perception, Language & Symbols, Comprehension):
- Are there multiple formats for key content?
- Are visuals explained, not just alt-texted?
- Are technical terms defined on first use?

**Action & Expression** (Physical Action, Expression & Communication, Executive Functions):
- Are there multiple response options?
- Are goals clearly stated?
- Is scaffolding provided before assessment?

**Engagement** (Recruiting Interest, Sustaining Effort, Self-Regulation):
- Is purpose communicated?
- Are there learner choice points?
- Is feedback specific and actionable?

For each principle, provide:
- strengths: Array of strings (what the course does well)
- gaps: Array of { checkpoint: string, explanation: string, suggestion: string }

Return ONLY valid JSON with this structure:
{
  "representation": { "strengths": [...], "gaps": [...] },
  "actionExpression": { "strengths": [...], "gaps": [...] },
  "engagement": { "strengths": [...], "gaps": [...] }
}

--- BLOCK TYPES ---
${blockTypeSummary}

--- COURSE HTML ---
${minimalHTML.slice(0, 8000)}

Return JSON:`
}

/**
 * Build a prompt for AI-powered inclusion assessment.
 */
export function buildInclusionPrompt(minimalHTML: string): string {
  return `You are an inclusion and equity specialist evaluating course content using
DisCrit (Disability Critical Race Theory), culturally responsive design, and
anti-deficit instructional design principles.

Evaluate the content below for:

**Representation of People:**
- Do scenarios or examples represent diverse communities?
- Are disabled people represented as active agents?
- Are cultural contexts beyond Western norms included?

**Language and Framing:**
- Is deficit language present (suffering from, confined to, wheelchair-bound, special needs)?
- Are medical model framings of disability present?
- Do examples center only one demographic context?

**Assessment Design:**
- Do questions assume specific cultural background?
- Are scenarios inclusive in characters and settings?

**Access and Flexibility:**
- Are accommodation notices present?
- Are there multiple pathways?
- Is keyboard/screen reader navigation supported?

For each finding, provide:
- criterion: "representation-of-people" | "language-and-framing" | "assessment-design" | "access-and-flexibility"
- description: What was found
- suggestion: Specific improvement advice

Also provide:
- strengths: Array of strings (what the course does well for inclusion)
- overallRating: "exemplary" | "proficient" | "developing" | "needs-review"

Return ONLY valid JSON:
{
  "strengths": [...],
  "findings": [...],
  "overallRating": "..."
}

--- COURSE HTML ---
${minimalHTML.slice(0, 8000)}

Return JSON:`
}

/**
 * Build a prompt for generating the top-5 prioritized recommendations.
 */
export function buildRecommendationsPrompt(
  wcagSummary: string,
  udlSummary: string,
  inclusionSummary: string
): string {
  return `Based on the assessment results below, generate the top 5 highest-impact
recommendations. Prioritize by combined WCAG/UDL/Inclusion impact.

For each recommendation, provide:
- description: Clear, actionable instruction
- frameworks: Array of which frameworks it addresses ("wcag", "udl", "inclusion")
- estimatedMinutes: Estimated remediation time
- actionType: "fix-it" (for automatable fixes) | "show-me" (for guided walkthrough) | "learn-more" (for research/review)

Return ONLY a JSON array of 5 recommendations, ordered by priority.

--- WCAG FINDINGS SUMMARY ---
${wcagSummary}

--- UDL FINDINGS SUMMARY ---
${udlSummary}

--- INCLUSION FINDINGS SUMMARY ---
${inclusionSummary}

Return JSON array:`
}
