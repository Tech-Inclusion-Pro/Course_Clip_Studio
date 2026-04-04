/**
 * TIPPY Features KB — Section Retrieval Engine
 *
 * Parses tippy-features.md into sections and retrieves the most relevant
 * sections for a given query using keyword matching and TF-IDF-like scoring.
 *
 * This is Layer 2 of the TIPPY system prompt assembly. Relevant sections
 * are injected into the prompt so TIPPY has feature-specific knowledge
 * without loading the entire KB into the context window.
 */

import type { TippyFeatureSection, TippyFeaturesIndex } from '@/types/analytics'
import featuresMarkdown from './tippy-features.md?raw'

// ─── Section Parsing ───

let cachedIndex: TippyFeaturesIndex | null = null

/**
 * Parse tippy-features.md into indexed sections.
 * Sections are split on H2 headings (## Section Name).
 * Keywords are extracted from the heading and content for matching.
 */
function buildIndex(): TippyFeaturesIndex {
  if (cachedIndex) return cachedIndex

  const sections: TippyFeatureSection[] = []
  const lines = featuresMarkdown.split('\n')

  let currentHeading = ''
  let currentLines: string[] = []

  for (const line of lines) {
    const h2Match = line.match(/^## (.+)/)
    if (h2Match) {
      // Flush previous section
      if (currentHeading && currentLines.length > 0) {
        sections.push(buildSection(currentHeading, currentLines.join('\n')))
      }
      currentHeading = h2Match[1].trim()
      currentLines = []
    } else if (currentHeading) {
      currentLines.push(line)
    }
  }

  // Flush last section
  if (currentHeading && currentLines.length > 0) {
    sections.push(buildSection(currentHeading, currentLines.join('\n')))
  }

  cachedIndex = {
    sections,
    version: '1.0.0',
    lastUpdated: '2026-04-04'
  }

  return cachedIndex
}

function buildSection(heading: string, content: string): TippyFeatureSection {
  // Extract keywords from heading and content
  const keywords = extractKeywords(heading + ' ' + content)
  return { heading, keywords, content: content.trim() }
}

// ─── Keyword Extraction ───

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'has', 'have', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
  'it', 'its', 'they', 'them', 'their', 'you', 'your', 'we', 'our',
  'i', 'my', 'me', 'not', 'no', 'all', 'each', 'every', 'any', 'some',
  'if', 'when', 'how', 'what', 'which', 'who', 'where', 'why', 'as',
  'so', 'than', 'then', 'just', 'also', 'more', 'most', 'very', 'too',
  'about', 'up', 'out', 'into', 'over', 'after', 'before', 'between',
  'under', 'through', 'during', 'use', 'using', 'used'
])

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))

  // Unique words, sorted by frequency (most frequent first)
  const freq = new Map<string, number>()
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1)
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word)
}

// ─── Query Matching ───

/**
 * Score a section against a query using keyword overlap.
 * Higher score = more relevant section.
 */
function scoreSection(section: TippyFeatureSection, queryKeywords: string[]): number {
  let score = 0
  const sectionKeywordsSet = new Set(section.keywords)
  const headingLower = section.heading.toLowerCase()

  for (const qk of queryKeywords) {
    // Heading match is worth 3x
    if (headingLower.includes(qk)) {
      score += 3
    }
    // Keyword match
    if (sectionKeywordsSet.has(qk)) {
      score += 1
    }
    // Substring match in keywords (e.g., "quiz" matches "quizzes")
    for (const sk of section.keywords) {
      if (sk !== qk && (sk.includes(qk) || qk.includes(sk))) {
        score += 0.5
      }
    }
  }

  return score
}

/**
 * Retrieve the top N most relevant feature sections for a user query.
 * Returns 3–5 sections by default, enough to give TIPPY good context
 * without overwhelming the prompt.
 */
export function retrieveFeatureSections(
  query: string,
  maxSections: number = 4
): TippyFeatureSection[] {
  const index = buildIndex()
  const queryKeywords = extractKeywords(query)

  if (queryKeywords.length === 0) return []

  const scored = index.sections
    .map((section) => ({
      section,
      score: scoreSection(section, queryKeywords)
    }))
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, maxSections).map((s) => s.section)
}

/**
 * Get all feature section headings (for UI display or walkthrough triggers).
 */
export function getFeatureSectionHeadings(): string[] {
  return buildIndex().sections.map((s) => s.heading)
}

/**
 * Get a specific section by heading name.
 */
export function getFeatureSection(heading: string): TippyFeatureSection | null {
  return buildIndex().sections.find(
    (s) => s.heading.toLowerCase() === heading.toLowerCase()
  ) ?? null
}

/**
 * Get the full features index (for debugging or export).
 */
export function getFeaturesIndex(): TippyFeaturesIndex {
  return buildIndex()
}
