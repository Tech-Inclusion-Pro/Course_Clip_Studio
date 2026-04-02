// ─── Syllabus Builder AI Prompts ───

import type { SyllabusObjective, SyllabusAssignment } from '@/types/syllabus'

/**
 * Robustly extract JSON from AI responses that may contain
 * markdown fencing, explanatory text before/after the JSON, etc.
 */
export function extractJSON<T>(raw: string): T {
  // Strip markdown fencing
  let text = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()

  // Try direct parse first
  try { return JSON.parse(text) as T } catch { /* continue */ }

  // Find the first [ or { and match to closing bracket
  const arrayStart = text.indexOf('[')
  const objStart = text.indexOf('{')

  let start: number
  let openChar: string
  let closeChar: string

  if (arrayStart === -1 && objStart === -1) {
    throw new Error('No JSON found in AI response')
  } else if (arrayStart === -1) {
    start = objStart; openChar = '{'; closeChar = '}'
  } else if (objStart === -1) {
    start = arrayStart; openChar = '['; closeChar = ']'
  } else {
    start = Math.min(arrayStart, objStart)
    openChar = text[start]; closeChar = openChar === '[' ? ']' : '}'
  }

  // Walk through to find the matching closing bracket
  let depth = 0
  let inString = false
  let escape = false
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (escape) { escape = false; continue }
    if (ch === '\\') { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === openChar) depth++
    else if (ch === closeChar) {
      depth--
      if (depth === 0) {
        return JSON.parse(text.slice(start, i + 1)) as T
      }
    }
  }

  // Last resort: try to parse up to the last ] or }
  const lastClose = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'))
  if (lastClose > start) {
    return JSON.parse(text.slice(start, lastClose + 1)) as T
  }

  throw new Error('Could not extract valid JSON from AI response')
}

export const SYLLABUS_SYSTEM_PROMPT = `You are an instructional design assistant helping educators create inclusive, accessible course syllabi.
You follow Universal Design for Learning (UDL) principles and Bloom's Taxonomy.
Always suggest concrete, actionable content. Use plain language unless the user's context indicates expertise.
Never generate content that is deficit-framing toward any learner group.
Match your suggestions to the audience level and content area provided.
When generating JSON, output only valid JSON with no markdown fencing.`

export function generateObjectivesPrompt(
  contentAreas: string[],
  courseGoal: string,
  gradeLevel: string,
  audienceContext: string,
  existingObjectives: string[]
): string {
  const existingList = existingObjectives.length > 0
    ? `\nExisting objectives (avoid duplicates):\n${existingObjectives.map((o, i) => `${i + 1}. ${o}`).join('\n')}`
    : ''

  return `Generate 4-6 learning objectives for a course with the following details:

Content areas: ${contentAreas.join(', ') || 'General'}
Course goal: ${courseGoal || 'Not specified'}
Audience level: ${gradeLevel || 'Not specified'}
Audience context: ${audienceContext || 'Not specified'}
${existingList}

Requirements:
- Each objective must start with "Students will be able to..." or equivalent
- Each must use a measurable verb from Bloom's Taxonomy
- Assign the appropriate Bloom's level to each (remember, understand, apply, analyze, evaluate, create)
- Include a brief rationale for each objective
- Cover a range of Bloom's levels appropriate for the audience
- Ensure objectives are specific, measurable, and achievable

Return a JSON array with this structure:
[
  {
    "text": "Students will be able to...",
    "bloomsLevel": "understand",
    "rationale": "This objective ensures..."
  }
]`
}

export function generateAssignmentPrompt(
  objectives: SyllabusObjective[],
  gradeLevel: string,
  audienceContext: string,
  existingAssignments: string[]
): string {
  const objectivesList = objectives.map((o, i) => `${i + 1}. [${o.bloomsLevel}] ${o.text}`).join('\n')
  const existingList = existingAssignments.length > 0
    ? `\nExisting assignments (avoid duplicates):\n${existingAssignments.map((a, i) => `${i + 1}. ${a}`).join('\n')}`
    : ''

  return `Generate 3-5 assignments for a course with the following objectives:

${objectivesList}

Audience level: ${gradeLevel || 'Not specified'}
Audience context: ${audienceContext || 'Not specified'}
${existingList}

Requirements:
- Each assignment should align with one or more objectives
- Use a variety of assignment types: written-essay, project-portfolio, presentation, discussion, quiz-exam, lab-hands-on, reflection-journal, group-work, case-study
- Include UDL accommodations for each assignment (representation, action & expression, engagement)
- Match complexity to the audience level
- Provide clear, actionable descriptions

Return a JSON array with this structure:
[
  {
    "title": "Assignment Title",
    "description": "Clear description of what students will do...",
    "type": "written-essay",
    "linkedObjectiveIds": [],
    "udl": {
      "representation": "Multiple means of presenting assignment instructions...",
      "actionExpression": "Multiple ways students can complete and submit...",
      "engagement": "Strategies to motivate and sustain effort..."
    }
  }
]

Note: linkedObjectiveIds will be empty since IDs are system-generated. The user will link them manually.`
}

export function generateUDLSuggestionsPrompt(
  assignment: SyllabusAssignment,
  objectives: SyllabusObjective[],
  gradeLevel: string,
  pillar: 'representation' | 'actionExpression' | 'engagement'
): string {
  const pillarName = pillar === 'actionExpression' ? 'Action & Expression'
    : pillar.charAt(0).toUpperCase() + pillar.slice(1)

  const objectivesList = objectives.map((o) => `- ${o.text}`).join('\n')

  return `Suggest 2-3 concrete UDL strategies for the "${pillarName}" pillar for this assignment:

Assignment: ${assignment.title || 'Untitled'}
Type: ${assignment.type}
Description: ${assignment.description || 'No description'}
Linked objectives:
${objectivesList || '(none specified)'}
Audience level: ${gradeLevel || 'Not specified'}

UDL Pillar - ${pillarName}:
${pillar === 'representation' ? 'How can information and content be presented in different ways?' : ''}
${pillar === 'actionExpression' ? 'How can learners express what they know in different ways?' : ''}
${pillar === 'engagement' ? 'How can learners be motivated and stay engaged?' : ''}

Requirements:
- Provide specific, actionable strategies (not vague suggestions)
- Each strategy should be implementable without major curriculum changes
- Consider diverse learner needs including those with disabilities
- Be concrete: mention specific tools, formats, or approaches

Return a JSON object:
{
  "strategies": [
    "Strategy 1: Specific actionable suggestion...",
    "Strategy 2: Another specific suggestion...",
    "Strategy 3: A third suggestion..."
  ]
}`
}

export function generateRubricPrompt(
  assignment: SyllabusAssignment,
  objectives: SyllabusObjective[],
  rubricType: string,
  gradeLevel: string
): string {
  const objectivesList = objectives.map((o) => `- [${o.bloomsLevel}] ${o.text}`).join('\n')

  return `Generate a ${rubricType} rubric for this assignment:

Assignment: ${assignment.title || 'Untitled'}
Type: ${assignment.type}
Description: ${assignment.description || 'No description'}
Linked objectives:
${objectivesList || '(none specified)'}
Audience level: ${gradeLevel || 'Not specified'}

Rubric type: ${rubricType}
${rubricType === 'analytic' ? 'Create a rubric with 3-4 criteria and 3 performance levels (Beginning, Developing, Proficient).' : ''}
${rubricType === 'holistic' ? 'Create 3-4 performance levels with overall descriptors.' : ''}
${rubricType === 'single-point' ? 'Create 3-4 criteria with proficient-level descriptions.' : ''}
${rubricType === 'checklist' ? 'Create 5-8 checklist items that must be present.' : ''}

CRITICAL: You MUST provide a description for EVERY combination of criterion and level.
If there are N criteria (rows) and M levels (columns), the "cells" object must have exactly N × M entries.
Each key MUST use this exact format: "crit-gen-{rowIndex}:lvl-gen-{colIndex}" where rowIndex and colIndex are 0-based.
For example, with 3 criteria and 3 levels, you need exactly 9 cells:
  "crit-gen-0:lvl-gen-0", "crit-gen-0:lvl-gen-1", "crit-gen-0:lvl-gen-2",
  "crit-gen-1:lvl-gen-0", "crit-gen-1:lvl-gen-1", "crit-gen-1:lvl-gen-2",
  "crit-gen-2:lvl-gen-0", "crit-gen-2:lvl-gen-1", "crit-gen-2:lvl-gen-2"
Do NOT leave any cell empty or missing. Every cell must have a meaningful, specific description.

Requirements:
- Criteria should align with the assignment objectives
- Use clear, measurable language
- Performance descriptions should be specific and distinguishable
- Appropriate complexity for the audience level

Return a JSON object with this structure:
{
  "type": "${rubricType}",
  "columns": [
    { "label": "Beginning", "points": 1 },
    { "label": "Developing", "points": 2 },
    { "label": "Proficient", "points": 3 }
  ],
  "rows": [
    { "label": "Criterion Name", "weight": 1 }
  ],
  "cells": {
    "crit-gen-0:lvl-gen-0": "Description for criterion 1 at beginning level",
    "crit-gen-0:lvl-gen-1": "Description for criterion 1 at developing level",
    "crit-gen-0:lvl-gen-2": "Description for criterion 1 at proficient level"
  }
}

For holistic rubrics, use cells keys like "crit-gen-0:holistic".
For single-point rubrics, use keys like "crit-gen-0:growth", "crit-gen-0:proficient", "crit-gen-0:strengths".
For checklists, only include rows (no columns or cells needed).`
}

export function suggestActivitiesPrompt(
  courseName: string,
  courseGoal: string,
  objectives: SyllabusObjective[],
  gradeLevel: string
): string {
  const objectivesList = objectives.map((o, i) => `${i + 1}. [${o.bloomsLevel}] ${o.text}`).join('\n')

  return `Suggest 3-5 learning activities for this course:

Course: ${courseName || 'Untitled'}
Goal: ${courseGoal || 'Not specified'}
Audience level: ${gradeLevel || 'Not specified'}

Objectives:
${objectivesList || '(none specified)'}

Requirements:
- Activities should support one or more objectives
- Include a mix of individual and collaborative activities
- Consider UDL principles (multiple means of engagement)
- Be specific and actionable

Return a JSON array:
[
  {
    "title": "Activity Name",
    "description": "What students will do...",
    "objectiveAlignment": "Which objectives this supports",
    "duration": "Estimated time"
  }
]`
}
