// ─── System Prompts for AI Actions ───

import type { InterviewAnswers } from './types'

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

export const SYSTEM_PROMPT = `You are an expert instructional designer and course author for LuminaUDL, an accessible course authoring application. You follow Universal Design for Learning (UDL) principles and WCAG 2.1 AA accessibility standards. Always write clear, structured, inclusive educational content. When generating JSON, output only valid JSON with no markdown fencing.`

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
  return `Translate this educational content to ${targetLanguage}. Preserve all HTML formatting, block structure, and JSON structure exactly. Only translate the human-readable text content.

Content to translate:
${content}

Return the translated content in the same format as the input.`
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
