import { unified } from 'unified'
import remarkParse from 'remark-parse'
import type { Root, Content, Heading, Code, Image, Paragraph } from 'mdast'
import { createTextBlock, createMediaBlock, createCodeBlock, createDividerBlock } from '@/lib/block-factories'
import type { ContentBlock } from '@/types/course'
import type { ImportResult, ParsedModule, ParsedLesson, ImportProgressCallback } from './types'

/**
 * Parse a Markdown file into an ImportResult.
 *
 * Mapping rules:
 * - H1 → course title
 * - H2 → module titles
 * - H3 → lesson titles
 * - Paragraphs → TextBlocks
 * - Images (![alt](src)) → MediaBlocks
 * - Fenced code blocks → CodeBlocks
 * - Thematic breaks (---) → DividerBlocks
 * - Other inline content → TextBlocks
 */
export async function parseMarkdown(
  content: string,
  fileName: string,
  onProgress?: ImportProgressCallback
): Promise<ImportResult> {
  onProgress?.({ phase: 'reading', message: 'Reading Markdown file...', percent: 10 })

  const tree = unified().use(remarkParse).parse(content) as Root

  onProgress?.({ phase: 'parsing', message: 'Parsing Markdown structure...', percent: 30 })

  const warnings: string[] = []
  let suggestedTitle = fileName.replace(/\.md$/i, '')

  // Accumulate modules; if no H2 found, create one default module
  const modules: ParsedModule[] = []
  let currentModule: ParsedModule | null = null
  let currentLesson: ParsedLesson | null = null

  // Flush current lesson into current module
  function flushLesson() {
    if (currentLesson && currentModule) {
      if (currentLesson.blocks.length > 0 || currentLesson.title !== 'Untitled Lesson') {
        currentModule.lessons.push(currentLesson)
      }
    }
    currentLesson = null
  }

  // Flush current module into modules list
  function flushModule() {
    flushLesson()
    if (currentModule) {
      if (currentModule.lessons.length > 0) {
        modules.push(currentModule)
      }
    }
    currentModule = null
  }

  // Ensure we have an active module
  function ensureModule() {
    if (!currentModule) {
      currentModule = { title: 'Imported Content', description: '', lessons: [] }
    }
  }

  // Ensure we have an active lesson
  function ensureLesson() {
    ensureModule()
    if (!currentLesson) {
      currentLesson = { title: 'Untitled Lesson', blocks: [] }
    }
  }

  // Extract plain text from an mdast node tree
  function extractText(node: Content): string {
    if ('value' in node) return (node as { value: string }).value
    if ('children' in node) {
      return (node as { children: Content[] }).children.map(extractText).join('')
    }
    return ''
  }

  // Convert a paragraph or other text node to HTML-ish plain text
  function nodeToHtml(node: Paragraph | Content): string {
    if (node.type === 'paragraph') {
      const parts = node.children.map((child) => {
        switch (child.type) {
          case 'text':
            return child.value
          case 'strong':
            return `<strong>${extractText(child)}</strong>`
          case 'emphasis':
            return `<em>${extractText(child)}</em>`
          case 'inlineCode':
            return `<code>${child.value}</code>`
          case 'link':
            return `<a href="${child.url}">${extractText(child)}</a>`
          default:
            return extractText(child)
        }
      })
      return `<p>${parts.join('')}</p>`
    }
    if (node.type === 'blockquote') {
      const inner = (node as { children: Content[] }).children
        .map((c) => nodeToHtml(c))
        .join('')
      return `<blockquote>${inner}</blockquote>`
    }
    if (node.type === 'list') {
      const tag = node.ordered ? 'ol' : 'ul'
      const items = node.children
        .map((li) => {
          const liContent = (li as { children: Content[] }).children
            .map((c) => nodeToHtml(c))
            .join('')
          return `<li>${liContent}</li>`
        })
        .join('')
      return `<${tag}>${items}</${tag}>`
    }
    return extractText(node)
  }

  // Process each top-level node
  for (const node of tree.children) {
    switch (node.type) {
      case 'heading': {
        const heading = node as Heading
        const text = extractText(heading).trim()

        if (heading.depth === 1) {
          // H1 → course title
          suggestedTitle = text
        } else if (heading.depth === 2) {
          // H2 → new module
          flushModule()
          currentModule = { title: text, description: '', lessons: [] }
        } else if (heading.depth === 3) {
          // H3 → new lesson
          flushLesson()
          ensureModule()
          currentLesson = { title: text, blocks: [] }
        } else {
          // H4+ → heading text block in current lesson
          ensureLesson()
          currentLesson!.blocks.push(
            createTextBlock({ content: `<h${heading.depth}>${text}</h${heading.depth}>` })
          )
        }
        break
      }

      case 'paragraph': {
        // Check if paragraph contains only an image
        if (
          node.children.length === 1 &&
          node.children[0].type === 'image'
        ) {
          const img = node.children[0] as Image
          ensureLesson()
          currentLesson!.blocks.push(
            createMediaBlock({
              assetPath: img.url,
              altText: img.alt || '',
              caption: img.title || ''
            })
          )
          if (!img.alt) {
            warnings.push(`Image "${img.url}" is missing alt text`)
          }
        } else {
          ensureLesson()
          const html = nodeToHtml(node)
          currentLesson!.blocks.push(createTextBlock({ content: html }))
        }
        break
      }

      case 'code': {
        const codeNode = node as Code
        ensureLesson()
        currentLesson!.blocks.push(
          createCodeBlock({
            code: codeNode.value,
            language: codeNode.lang || 'plaintext'
          })
        )
        break
      }

      case 'thematicBreak': {
        ensureLesson()
        currentLesson!.blocks.push(createDividerBlock())
        break
      }

      case 'blockquote':
      case 'list': {
        ensureLesson()
        const html = nodeToHtml(node)
        currentLesson!.blocks.push(createTextBlock({ content: html }))
        break
      }

      case 'html': {
        ensureLesson()
        currentLesson!.blocks.push(createTextBlock({ content: node.value }))
        break
      }

      default:
        // Skip unknown node types
        break
    }
  }

  // Flush remaining
  flushModule()

  onProgress?.({ phase: 'mapping', message: 'Building course structure...', percent: 80 })

  // If no modules were created (no H2 headings), wrap everything in a single module
  if (modules.length === 0) {
    // Re-parse with everything in a single module/lesson
    const singleModule: ParsedModule = { title: 'Imported Content', description: '', lessons: [] }
    const singleLesson: ParsedLesson = { title: suggestedTitle, blocks: [] }

    for (const node of tree.children) {
      if (node.type === 'heading' && (node as Heading).depth === 1) continue
      if (node.type === 'paragraph') {
        if (node.children.length === 1 && node.children[0].type === 'image') {
          const img = node.children[0] as Image
          singleLesson.blocks.push(
            createMediaBlock({ assetPath: img.url, altText: img.alt || '', caption: img.title || '' })
          )
        } else {
          singleLesson.blocks.push(createTextBlock({ content: nodeToHtml(node) }))
        }
      } else if (node.type === 'code') {
        singleLesson.blocks.push(
          createCodeBlock({ code: (node as Code).value, language: (node as Code).lang || 'plaintext' })
        )
      } else if (node.type === 'thematicBreak') {
        singleLesson.blocks.push(createDividerBlock())
      } else if (node.type === 'blockquote' || node.type === 'list') {
        singleLesson.blocks.push(createTextBlock({ content: nodeToHtml(node) }))
      }
    }

    if (singleLesson.blocks.length > 0) {
      singleModule.lessons.push(singleLesson)
    }
    modules.push(singleModule)
  }

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0)
  const totalBlocks = modules.reduce(
    (sum, m) => sum + m.lessons.reduce((s, l) => s + l.blocks.length, 0),
    0
  )

  onProgress?.({ phase: 'complete', message: 'Import complete', percent: 100 })

  return {
    format: 'markdown',
    suggestedTitle,
    modules,
    warnings,
    totalBlocks,
    totalLessons
  }
}
