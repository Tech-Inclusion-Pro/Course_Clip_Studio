// ─── System Prompts for AI Actions ───

import type { InterviewAnswers, ReferenceFileCategory } from './types'
import type { BaseBrainSettings, ContentAreaFile } from '@/types/course'
import type { AIReferenceFile } from '@/stores/useAIStore'

const CATEGORY_INSTRUCTIONS: Record<ReferenceFileCategory, string> = {
  design: 'Use these files to inform visual design decisions, layout, colors, and styling',
  content: 'Use these files as source content to draw from or reference',
  assignment: 'Use these files to guide assignment/activity creation',
  quiz: 'Use these files to inform quiz question generation',
  format: 'Use these files for formatting guidelines and document structure',
  activity: 'Use these files to guide interactive activity design',
  assessment: 'Use these files for assessment criteria and evaluation approaches',
  rubric: 'Use these files as rubric templates or grading criteria',
  standards: 'Use these files for alignment with learning standards and competencies',
  template: 'Use these files as structural templates to follow'
}

export function categorizedRefFilesContext(referenceFiles: AIReferenceFile[]): string {
  if (referenceFiles.length === 0) return ''

  const grouped = new Map<string, AIReferenceFile[]>()

  for (const rf of referenceFiles) {
    if (rf.categories.length === 0) {
      const list = grouped.get('general') || []
      list.push(rf)
      grouped.set('general', list)
    } else {
      for (const cat of rf.categories) {
        const list = grouped.get(cat) || []
        list.push(rf)
        grouped.set(cat, list)
      }
    }
  }

  let context = '\n\n## Reference Files\n'

  for (const [key, files] of grouped) {
    if (key === 'general') {
      context += '\n### General Reference\n'
    } else {
      const instruction = CATEGORY_INSTRUCTIONS[key as ReferenceFileCategory]
      context += `\n### ${key.charAt(0).toUpperCase() + key.slice(1)} References\n${instruction}\n`
    }
    for (const rf of files) {
      context += `\n**${rf.name}**${rf.notes ? `\nUser notes: ${rf.notes}` : ''}\n\`\`\`\n${rf.content.slice(0, 5000)}\n\`\`\`\n`
    }
  }

  return context
}

/**
 * Build context string from content area files.
 * Accepts pre-loaded file contents keyed by file ID.
 * Files are sorted by priority (high first) and include user-provided context annotations.
 */
export function contentAreaFilesContext(
  files: ContentAreaFile[],
  fileContents: Record<string, string>
): string {
  if (files.length === 0) return ''

  // Sort by priority descending (3=High first)
  const sorted = [...files].sort((a, b) => b.priority - a.priority)
  const PRIORITY_LABELS: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' }

  let context = '\n\n## Content Area Reference Files\nThe user has uploaded the following reference files for this content area. Use them to inform your responses, following the priority and context notes provided.\n'

  for (const f of sorted) {
    const content = fileContents[f.id]
    if (!content) continue

    context += `\n### ${f.name} (Priority: ${PRIORITY_LABELS[f.priority] ?? 'Medium'})\n`
    if (f.context) {
      context += `**User context:** ${f.context}\n`
    }
    // Truncate very large files to avoid blowing up context
    const truncated = content.length > 8000 ? content.slice(0, 8000) + '\n...[truncated]' : content
    context += `\`\`\`\n${truncated}\n\`\`\`\n`
  }

  return context
}

function interviewContext(answers: InterviewAnswers): string {
  const parts: string[] = []
  if (answers.audience) parts.push(`Target audience: ${answers.audience}`)
  if (answers.objectives) parts.push(`Learning objectives:\n${answers.objectives}`)
  if (answers.priorKnowledge) parts.push(`Prior knowledge: ${answers.priorKnowledge}`)
  if (answers.tone) parts.push(`Tone: ${answers.tone}`)
  if (answers.format) parts.push(`Format: ${answers.format}`)
  if (answers.accessibilityNeeds) parts.push(`Accessibility needs: ${answers.accessibilityNeeds}`)
  if (answers.masterKeyContent) parts.push(`Reference material:\n${answers.masterKeyContent}`)
  return parts.join('\n\n')
}

export function baseBrainContext(bb: BaseBrainSettings): string {
  if (!bb.enabled) return ''
  const parts: string[] = []
  if (bb.designAssumptions) parts.push(`Design assumptions: ${bb.designAssumptions}`)
  if (bb.toneAndVoice) parts.push(`Tone & voice: ${bb.toneAndVoice}`)
  if (bb.visualPreferences) parts.push(`Visual preferences: ${bb.visualPreferences}`)
  if (bb.goals) parts.push(`Goals: ${bb.goals}`)
  if (bb.designConsiderations) parts.push(`Design considerations: ${bb.designConsiderations}`)

  // Categorized reference files
  const accessibilityFiles = bb.referenceFiles.filter((f) => 'category' in f && f.category === 'accessibility')
  const udlFiles = bb.referenceFiles.filter((f) => 'category' in f && f.category === 'udl')
  const inclusiveFiles = bb.referenceFiles.filter((f) => 'category' in f && f.category === 'inclusive')
  const generalFiles = bb.referenceFiles.filter((f) => !('category' in f) || f.category === 'general')

  if (accessibilityFiles.length > 0) {
    parts.push(`\n## Accessibility Framework (WCAG)\nUse these standards when checking accessibility, evaluating contrast, alt text, keyboard navigation, and ARIA compliance:\n${accessibilityFiles.map((f) => f.content).join('\n\n')}`)
  }
  if (udlFiles.length > 0) {
    parts.push(`\n## Universal Design for Learning (UDL) Framework\nUse these principles when suggesting multiple means of representation, action/expression, and engagement:\n${udlFiles.map((f) => f.content).join('\n\n')}`)
  }
  if (inclusiveFiles.length > 0) {
    parts.push(`\n## Inclusive Teaching Framework (DisCrit)\nUse these principles when reviewing content for inclusive language, identity representation, and intersectional design:\n${inclusiveFiles.map((f) => f.content).join('\n\n')}`)
  }
  for (const file of generalFiles) {
    parts.push(`Reference file "${file.name}":\n${file.content}`)
  }

  if (parts.length === 0) return ''
  return `\n\n--- Base Brain Context ---\n${parts.join('\n\n')}`
}

export const SYSTEM_PROMPT = `You are an expert instructional designer and course author for LuminaUDL, an accessible course authoring application. You follow Universal Design for Learning (UDL) principles and WCAG 2.1 AA accessibility standards. Always write clear, structured, inclusive educational content. When generating JSON, output only valid JSON with no markdown fencing. When Base Brain context is provided, ALWAYS apply those frameworks consistently: check accessibility against WCAG screener criteria, validate UDL alignment against UDL screener principles, and ensure inclusive language/identity standards from the DisCrit screener.`

export function outlinePrompt(topic: string, answers: InterviewAnswers): string {
  return `Generate a course outline for the topic: "${topic}"

${interviewContext(answers)}

Return a JSON object with this exact structure:
{
  "modules": [
    {
      "title": "Module title",
      "description": "Brief module description",
      "lessons": [
        {
          "title": "Lesson title",
          "description": "Brief lesson description",
          "suggestedBlocks": ["text", "media", "quiz"]
        }
      ]
    }
  ]
}

Create 3-5 modules with 2-4 lessons each. Suggest appropriate block types for each lesson (text, media, video, audio, quiz, accordion, tabs, flashcard, callout). Ensure content is accessible and follows UDL principles with multiple means of representation.`
}

export function lessonContentPrompt(
  lessonTitle: string,
  lessonDescription: string,
  answers: InterviewAnswers
): string {
  return `Generate lesson content for: "${lessonTitle}"
Description: ${lessonDescription}

${interviewContext(answers)}

Return a JSON array of content blocks:
[
  {
    "type": "text",
    "content": "<p>HTML content here</p>",
    "ariaLabel": "Section: Introduction"
  },
  {
    "type": "callout",
    "variant": "info",
    "content": "Key point here",
    "ariaLabel": "Key information"
  }
]

Supported block types: text (HTML content), callout (variant: info/tip/warning/success), accordion (items: [{title, content}]), tabs (tabs: [{label, content}]).
Include 4-8 blocks. Use clear headings, short paragraphs, and varied block types for UDL compliance. All content must be appropriate for the stated audience and reading level.`
}

export function quizPrompt(lessonContent: string): string {
  return `Based on this lesson content, generate 5 quiz questions:

${lessonContent}

Return a JSON object:
{
  "questions": [
    {
      "type": "multiple-choice",
      "prompt": "Question text",
      "choices": [
        { "label": "Option A", "isCorrect": true },
        { "label": "Option B", "isCorrect": false },
        { "label": "Option C", "isCorrect": false },
        { "label": "Option D", "isCorrect": false }
      ],
      "feedbackCorrect": "Correct! Explanation...",
      "feedbackIncorrect": "Not quite. The correct answer is... because..."
    }
  ]
}

Create a mix of multiple-choice and true-false questions. Each must have clear feedback for both correct and incorrect answers. Questions should test comprehension, not just recall.`
}

export function narrationPrompt(lessonContent: string): string {
  return `Write a narration script for this lesson content. The script will be read aloud as audio accompanying the visual content.

Lesson content:
${lessonContent}

Write in a conversational but professional tone. Include:
- Opening hook to engage the learner
- Clear explanations matching the visual content
- Transitions between sections
- Summary at the end
- Reading time guidance (aim for 3-5 minutes)

Return plain text only, with section breaks marked by blank lines.`
}

export function altTextPrompt(imageDescription: string): string {
  return `Generate accessible alt text for this image.

Image context: ${imageDescription}

Requirements:
- Be concise but descriptive (under 125 characters preferred)
- Describe the content and function, not just appearance
- Follow WCAG 1.1.1 guidelines
- Do not start with "Image of" or "Picture of"

Return only the alt text string, no JSON.`
}

export function translatePrompt(content: string, targetLanguage: string): string {
  return `Translate this educational content to ${targetLanguage}.

Content to translate (JSON array of content blocks):
${content}

Rules:
- Translate only human-readable text fields (content, title, caption, altText, ariaLabel, prompt, label, feedbackCorrect, feedbackIncorrect, scenario, consequence, front, back)
- Preserve the JSON structure, all keys, block IDs, and HTML tags exactly
- Do not translate or modify "id", "type", or any structural keys
- Return only a valid JSON array with no markdown fencing or extra text`
}

export function wcagReviewPrompt(lessonHtml: string): string {
  return `Review this lesson content for WCAG 2.1 AA accessibility issues:

${lessonHtml}

Return a JSON array of issues:
[
  {
    "severity": "critical",
    "criterion": "1.1.1 Non-text Content",
    "description": "Description of the issue",
    "suggestion": "How to fix it",
    "element": "Which element is affected"
  }
]

Check for:
- Missing alt text on images (1.1.1)
- Missing transcripts on audio/video (1.2.1, 1.2.2)
- Heading structure issues (1.3.1)
- Color contrast problems (1.4.3)
- Missing form labels (4.1.2)
- Reading level too high (3.1.5)
- Missing language attributes (3.1.1)

Severity levels: critical (must fix), serious (should fix), moderate (consider fixing), minor (nice to fix).`
}

export function udlSuggestionsPrompt(lessonContent: string): string {
  return `Analyze this lesson for Universal Design for Learning (UDL) compliance and suggest improvements:

${lessonContent}

Return a JSON array of suggestions:
[
  {
    "pillar": "representation",
    "suggestion": "Specific actionable suggestion",
    "priority": "high"
  }
]

UDL Pillars:
1. Representation: Multiple means of presenting information (text + audio + visual, captions, varied media)
2. Action & Expression: Multiple ways for learners to demonstrate knowledge (quizzes, drag-drop, short answer, branching)
3. Engagement: Multiple ways to motivate (relevance, choice, feedback, progress tracking)

Provide 3-6 specific, actionable suggestions across all three pillars.`
}
