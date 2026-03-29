/**
 * Accessibility Audit Engine
 * Analyzes course content for WCAG 2.1 AA compliance issues.
 */

import type { Course, Lesson, ContentBlock, UDLChecklist } from '@/types/course'
import { contrastRatio, contrastLevel, formatRatio } from '@/lib/contrast'
import { fleschKincaidGrade, stripHtml } from '@/lib/reading-level'

// ─── Types ───

export type AuditSeverity = 'critical' | 'serious' | 'moderate' | 'minor'

export interface AuditIssue {
  id: string
  severity: AuditSeverity
  criterion: string
  title: string
  description: string
  suggestion: string
  lessonId: string
  lessonTitle: string
  blockId: string | null
  blockType: string | null
}

export interface ReadingLevelReport {
  lessonId: string
  lessonTitle: string
  gradeLevel: number | null
  wordCount: number
  sentenceCount: number
  avgWordsPerSentence: number
}

export interface AuditReport {
  timestamp: string
  issues: AuditIssue[]
  score: number // 0–100
  readingLevels: ReadingLevelReport[]
  summary: {
    critical: number
    serious: number
    moderate: number
    minor: number
    total: number
  }
}

// ─── Audit Functions ───

let issueCounter = 0

function issueId(): string {
  return `issue-${++issueCounter}-${Date.now()}`
}

/** Check all media blocks for missing alt text (WCAG 1.1.1). */
function auditAltText(course: Course): AuditIssue[] {
  const issues: AuditIssue[] = []
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if (block.type === 'media' && !block.altText.trim()) {
          issues.push({
            id: issueId(),
            severity: 'critical',
            criterion: '1.1.1 Non-text Content',
            title: 'Missing alt text on image',
            description: `Image block "${block.ariaLabel}" in "${lesson.title}" has no alt text.`,
            suggestion: 'Add descriptive alt text that conveys the content and function of the image.',
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: block.id,
            blockType: block.type
          })
        }
        if (block.type === 'video' && !block.poster && block.url) {
          issues.push({
            id: issueId(),
            severity: 'minor',
            criterion: '1.1.1 Non-text Content',
            title: 'Video missing poster image',
            description: `Video block in "${lesson.title}" has no poster image.`,
            suggestion: 'Add a poster image to provide a visual preview before playback.',
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: block.id,
            blockType: block.type
          })
        }
      }
    }
  }
  return issues
}

/** Check video/audio blocks for missing transcripts (WCAG 1.2.1, 1.2.2, 1.2.3). */
function auditTranscripts(course: Course): AuditIssue[] {
  const issues: AuditIssue[] = []
  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if (block.type === 'video' && !block.transcript.trim()) {
          issues.push({
            id: issueId(),
            severity: 'critical',
            criterion: '1.2.1 Audio-only and Video-only',
            title: 'Missing video transcript',
            description: `Video block in "${lesson.title}" has no transcript.`,
            suggestion: 'Add a text transcript of the video content for users who cannot view video.',
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: block.id,
            blockType: block.type
          })
        }
        if (block.type === 'video' && block.captions.length === 0 && block.url) {
          issues.push({
            id: issueId(),
            severity: 'serious',
            criterion: '1.2.2 Captions (Prerecorded)',
            title: 'Missing video captions',
            description: `Video block in "${lesson.title}" has no caption tracks.`,
            suggestion: 'Add caption tracks (.vtt) for deaf and hard-of-hearing users.',
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: block.id,
            blockType: block.type
          })
        }
        if (block.type === 'audio' && !block.transcript.trim()) {
          issues.push({
            id: issueId(),
            severity: 'critical',
            criterion: '1.2.1 Audio-only and Video-only',
            title: 'Missing audio transcript',
            description: `Audio block in "${lesson.title}" has no transcript.`,
            suggestion: 'Add a text transcript of the audio content.',
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: block.id,
            blockType: block.type
          })
        }
      }
    }
  }
  return issues
}

/** Check course theme contrast ratios (WCAG 1.4.3). */
function auditContrast(course: Course): AuditIssue[] {
  const issues: AuditIssue[] = []
  const theme = course.theme

  // Text on background
  const textBgRatio = contrastRatio(theme.textColor, theme.backgroundColor)
  if (textBgRatio !== null) {
    const level = contrastLevel(textBgRatio)
    if (!level.aa) {
      issues.push({
        id: issueId(),
        severity: 'serious',
        criterion: '1.4.3 Contrast (Minimum)',
        title: 'Insufficient text contrast',
        description: `Text color (${theme.textColor}) on background (${theme.backgroundColor}) has a ratio of ${formatRatio(textBgRatio)}, below the 4.5:1 minimum.`,
        suggestion: 'Increase the contrast between text and background colors to at least 4.5:1.',
        lessonId: '',
        lessonTitle: 'Course Theme',
        blockId: null,
        blockType: null
      })
    }
  }

  // Primary on background
  const primaryBgRatio = contrastRatio(theme.primaryColor, theme.backgroundColor)
  if (primaryBgRatio !== null) {
    const level = contrastLevel(primaryBgRatio)
    if (!level.aaLarge) {
      issues.push({
        id: issueId(),
        severity: 'moderate',
        criterion: '1.4.3 Contrast (Minimum)',
        title: 'Low primary color contrast',
        description: `Primary color (${theme.primaryColor}) on background (${theme.backgroundColor}) has a ratio of ${formatRatio(primaryBgRatio)}, below 3:1 for large text.`,
        suggestion: 'Adjust the primary color or background for better visibility.',
        lessonId: '',
        lessonTitle: 'Course Theme',
        blockId: null,
        blockType: null
      })
    }
  }

  // Accent on background
  const accentBgRatio = contrastRatio(theme.accentColor, theme.backgroundColor)
  if (accentBgRatio !== null) {
    const level = contrastLevel(accentBgRatio)
    if (!level.aaLarge) {
      issues.push({
        id: issueId(),
        severity: 'moderate',
        criterion: '1.4.3 Contrast (Minimum)',
        title: 'Low accent color contrast',
        description: `Accent color (${theme.accentColor}) on background (${theme.backgroundColor}) has a ratio of ${formatRatio(accentBgRatio)}, below 3:1 for large text.`,
        suggestion: 'Adjust the accent color for better visibility against the background.',
        lessonId: '',
        lessonTitle: 'Course Theme',
        blockId: null,
        blockType: null
      })
    }
  }

  return issues
}

/** Check heading structure in text blocks (WCAG 1.3.1). */
function auditHeadings(course: Course): AuditIssue[] {
  const issues: AuditIssue[] = []

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const headingLevels: number[] = []

      for (const block of lesson.blocks) {
        if (block.type === 'text' && block.content) {
          // Extract heading levels from HTML content
          const headingMatches = block.content.matchAll(/<h([1-6])[^>]*>/gi)
          for (const match of headingMatches) {
            headingLevels.push(parseInt(match[1]))
          }
        }
      }

      // Check for skipped heading levels
      for (let i = 1; i < headingLevels.length; i++) {
        const prev = headingLevels[i - 1]
        const curr = headingLevels[i]
        if (curr > prev + 1) {
          issues.push({
            id: issueId(),
            severity: 'moderate',
            criterion: '1.3.1 Info and Relationships',
            title: 'Skipped heading level',
            description: `In "${lesson.title}": heading jumps from H${prev} to H${curr}. Heading levels should not skip (e.g., H2 to H4).`,
            suggestion: `Use H${prev + 1} instead of H${curr} to maintain a logical heading hierarchy.`,
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: null,
            blockType: 'text'
          })
        }
      }

      // Check if first heading is H1 (should typically start at H1 or H2)
      if (headingLevels.length > 0 && headingLevels[0] > 2) {
        issues.push({
          id: issueId(),
          severity: 'minor',
          criterion: '1.3.1 Info and Relationships',
          title: 'Missing top-level heading',
          description: `In "${lesson.title}": first heading is H${headingLevels[0]}. Lessons should start with H1 or H2.`,
          suggestion: 'Add a top-level heading at the beginning of the lesson.',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          blockId: null,
          blockType: 'text'
        })
      }
    }
  }

  return issues
}

/** Check ARIA labels on blocks (WCAG 4.1.2). */
function auditAriaLabels(course: Course): AuditIssue[] {
  const issues: AuditIssue[] = []

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if (!block.ariaLabel || block.ariaLabel.trim().length === 0) {
          issues.push({
            id: issueId(),
            severity: 'moderate',
            criterion: '4.1.2 Name, Role, Value',
            title: 'Missing ARIA label',
            description: `${block.type} block in "${lesson.title}" has no ARIA label.`,
            suggestion: 'Add a descriptive aria-label to help screen reader users understand the block content.',
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: block.id,
            blockType: block.type
          })
        }
      }
    }
  }

  return issues
}

/** Check embed/H5P blocks for accessible titles (WCAG 4.1.2). */
function auditEmbeds(course: Course): AuditIssue[] {
  const issues: AuditIssue[] = []

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if (block.type === 'embed' && !block.title?.trim()) {
          issues.push({
            id: issueId(),
            severity: 'serious',
            criterion: '4.1.2 Name, Role, Value',
            title: 'Embedded content missing title',
            description: `Embed block in "${lesson.title}" has no title attribute.`,
            suggestion: 'Add a descriptive title that identifies the embedded content.',
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: block.id,
            blockType: block.type
          })
        }
        if (block.type === 'h5p' && !block.ariaLabel?.trim()) {
          issues.push({
            id: issueId(),
            severity: 'serious',
            criterion: '4.1.2 Name, Role, Value',
            title: 'H5P content missing accessible name',
            description: `H5P block in "${lesson.title}" has no accessible name.`,
            suggestion: 'Add an ARIA label describing the interactive H5P content.',
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            blockId: block.id,
            blockType: block.type
          })
        }
      }
    }
  }

  return issues
}

/** Check reading levels across lessons. */
function auditReadingLevel(course: Course): AuditIssue[] {
  const issues: AuditIssue[] = []

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const allText = lesson.blocks
        .filter((b): b is ContentBlock & { type: 'text'; content: string } => b.type === 'text')
        .map((b) => stripHtml(b.content))
        .join(' ')

      if (allText.length < 50) continue

      const grade = fleschKincaidGrade(allText)
      if (grade !== null && grade > 12) {
        issues.push({
          id: issueId(),
          severity: 'moderate',
          criterion: '3.1.5 Reading Level',
          title: 'High reading level',
          description: `"${lesson.title}" has a Flesch-Kincaid grade level of ${grade}, above grade 12.`,
          suggestion: 'Simplify language: use shorter sentences, simpler vocabulary, and break complex ideas into smaller parts.',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          blockId: null,
          blockType: null
        })
      } else if (grade !== null && grade > 8) {
        issues.push({
          id: issueId(),
          severity: 'minor',
          criterion: '3.1.5 Reading Level',
          title: 'Elevated reading level',
          description: `"${lesson.title}" has a Flesch-Kincaid grade level of ${grade} (target: grade 8 or below for broad accessibility).`,
          suggestion: 'Consider simplifying some sections to improve readability for a wider audience.',
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          blockId: null,
          blockType: null
        })
      }
    }
  }

  return issues
}

/** Check quiz blocks for accessibility (labeled inputs, feedback). */
function auditQuizzes(course: Course): AuditIssue[] {
  const issues: AuditIssue[] = []

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      for (const block of lesson.blocks) {
        if (block.type !== 'quiz') continue

        if (block.questions.length === 0) continue

        for (const question of block.questions) {
          if (!question.prompt.trim()) {
            issues.push({
              id: issueId(),
              severity: 'serious',
              criterion: '4.1.2 Name, Role, Value',
              title: 'Quiz question missing prompt',
              description: `A ${question.type} question in "${lesson.title}" has no prompt text.`,
              suggestion: 'Add a clear question prompt so learners know what is being asked.',
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              blockId: block.id,
              blockType: block.type
            })
          }

          if (block.showFeedback && !question.feedbackCorrect && !question.feedbackIncorrect) {
            issues.push({
              id: issueId(),
              severity: 'minor',
              criterion: 'UDL Engagement',
              title: 'Quiz question missing feedback',
              description: `A question in "${lesson.title}" has feedback enabled but no feedback text.`,
              suggestion: 'Add feedback for both correct and incorrect answers to support learning.',
              lessonId: lesson.id,
              lessonTitle: lesson.title,
              blockId: block.id,
              blockType: block.type
            })
          }
        }
      }
    }
  }

  return issues
}

// ─── Reading Level Report ───

export function generateReadingLevelReports(course: Course): ReadingLevelReport[] {
  const reports: ReadingLevelReport[] = []

  for (const mod of course.modules) {
    for (const lesson of mod.lessons) {
      const allText = lesson.blocks
        .filter((b): b is ContentBlock & { type: 'text'; content: string } => b.type === 'text')
        .map((b) => stripHtml(b.content))
        .join(' ')

      const words = allText.split(/\s+/).filter((w) => w.length > 0)
      const sentences = allText.split(/[.!?]+/).filter((s) => s.trim().length > 0)

      reports.push({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        gradeLevel: fleschKincaidGrade(allText),
        wordCount: words.length,
        sentenceCount: sentences.length,
        avgWordsPerSentence: sentences.length > 0 ? Math.round((words.length / sentences.length) * 10) / 10 : 0
      })
    }
  }

  return reports
}

// ─── Score Calculation ───

function calculateScore(issues: AuditIssue[]): number {
  // Start at 100, deduct per issue based on severity
  let score = 100
  for (const issue of issues) {
    switch (issue.severity) {
      case 'critical': score -= 15; break
      case 'serious': score -= 10; break
      case 'moderate': score -= 5; break
      case 'minor': score -= 2; break
    }
  }
  return Math.max(0, Math.min(100, score))
}

// ─── Main Audit Function ───

export function runAccessibilityAudit(course: Course): AuditReport {
  issueCounter = 0

  const issues = [
    ...auditAltText(course),
    ...auditTranscripts(course),
    ...auditContrast(course),
    ...auditHeadings(course),
    ...auditAriaLabels(course),
    ...auditEmbeds(course),
    ...auditReadingLevel(course),
    ...auditQuizzes(course)
  ]

  // Sort by severity (critical first)
  const severityOrder: Record<AuditSeverity, number> = { critical: 0, serious: 1, moderate: 2, minor: 3 }
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  const summary = {
    critical: issues.filter((i) => i.severity === 'critical').length,
    serious: issues.filter((i) => i.severity === 'serious').length,
    moderate: issues.filter((i) => i.severity === 'moderate').length,
    minor: issues.filter((i) => i.severity === 'minor').length,
    total: issues.length
  }

  return {
    timestamp: new Date().toISOString(),
    issues,
    score: calculateScore(issues),
    readingLevels: generateReadingLevelReports(course),
    summary
  }
}

// ─── Severity Helpers ───

export function severityColor(severity: AuditSeverity): string {
  switch (severity) {
    case 'critical': return '#dc2626'
    case 'serious': return '#ea580c'
    case 'moderate': return '#d97706'
    case 'minor': return '#6b7280'
  }
}

export function severityLabel(severity: AuditSeverity): string {
  switch (severity) {
    case 'critical': return 'Critical'
    case 'serious': return 'Serious'
    case 'moderate': return 'Moderate'
    case 'minor': return 'Minor'
  }
}

export function scoreColor(score: number): string {
  if (score >= 90) return '#16a34a'
  if (score >= 70) return '#d97706'
  return '#dc2626'
}

export function scoreLabel(score: number): string {
  if (score >= 90) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Needs Work'
  return 'Poor'
}
