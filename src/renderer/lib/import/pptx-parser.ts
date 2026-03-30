import JSZip from 'jszip'
import { createTextBlock, createMediaBlock } from '@/lib/block-factories'
import type { ImportResult, ParsedModule, ParsedLesson, ImportProgressCallback } from './types'

/**
 * Parse a PPTX file into an ImportResult.
 *
 * PPTX files are ZIP archives containing XML. We extract:
 * - Slide text → TextBlocks
 * - Slide images → MediaBlocks (extracted as base64 data URIs)
 * - Speaker notes → speakerNotes field on ParsedLesson
 *
 * Each slide becomes one lesson.
 * All slides are grouped into a single module.
 */
export async function parsePptx(
  data: ArrayBuffer,
  fileName: string,
  onProgress?: ImportProgressCallback
): Promise<ImportResult> {
  onProgress?.({ phase: 'reading', message: 'Reading PPTX archive...', percent: 10 })

  const zip = await JSZip.loadAsync(data)
  const warnings: string[] = []
  const suggestedTitle = fileName.replace(/\.pptx$/i, '')

  onProgress?.({ phase: 'parsing', message: 'Extracting slides...', percent: 25 })

  // Find all slide XML files (ppt/slides/slide1.xml, slide2.xml, etc.)
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((a, b) => {
      const numA = parseInt(a.match(/slide(\d+)/i)?.[1] ?? '0', 10)
      const numB = parseInt(b.match(/slide(\d+)/i)?.[1] ?? '0', 10)
      return numA - numB
    })

  if (slideFiles.length === 0) {
    warnings.push('No slides found in PPTX file')
    return {
      format: 'pptx',
      suggestedTitle,
      modules: [],
      warnings,
      totalBlocks: 0,
      totalLessons: 0
    }
  }

  // Collect all images from ppt/media/
  const imageMap = new Map<string, string>()
  const mediaFiles = Object.keys(zip.files).filter((name) =>
    /^ppt\/media\//i.test(name)
  )
  for (const mediaPath of mediaFiles) {
    try {
      const blob = await zip.files[mediaPath].async('base64')
      const ext = mediaPath.split('.').pop()?.toLowerCase() || 'png'
      const mimeType =
        ext === 'jpg' || ext === 'jpeg'
          ? 'image/jpeg'
          : ext === 'png'
            ? 'image/png'
            : ext === 'gif'
              ? 'image/gif'
              : ext === 'svg'
                ? 'image/svg+xml'
                : 'image/png'
      const dataUri = `data:${mimeType};base64,${blob}`
      // Store by the relative path from ppt/
      const relPath = mediaPath.replace(/^ppt\//, '')
      imageMap.set(relPath, dataUri)
    } catch {
      // Skip unreadable media
    }
  }

  // Parse each slide
  const lessons: ParsedLesson[] = []
  for (let i = 0; i < slideFiles.length; i++) {
    const slideFile = slideFiles[i]
    const slideNum = i + 1

    onProgress?.({
      phase: 'parsing',
      message: `Parsing slide ${slideNum} of ${slideFiles.length}...`,
      percent: 25 + Math.round((i / slideFiles.length) * 50)
    })

    try {
      const slideXml = await zip.files[slideFile].async('text')
      const lesson = parseSlideXml(slideXml, slideNum, imageMap, warnings)

      // Try to get speaker notes
      const notesFile = `ppt/notesSlides/notesSlide${slideNum}.xml`
      if (zip.files[notesFile]) {
        try {
          const notesXml = await zip.files[notesFile].async('text')
          lesson.speakerNotes = extractTextFromXml(notesXml)
        } catch {
          // No notes for this slide
        }
      }

      // Also try to resolve image references from slide relationships
      const relsFile = `ppt/slides/_rels/slide${slideNum}.xml.rels`
      if (zip.files[relsFile]) {
        try {
          const relsXml = await zip.files[relsFile].async('text')
          addImageBlocksFromRels(relsXml, imageMap, lesson, warnings)
        } catch {
          // Skip relationship parsing errors
        }
      }

      lessons.push(lesson)
    } catch {
      warnings.push(`Failed to parse slide ${slideNum}`)
    }
  }

  onProgress?.({ phase: 'mapping', message: 'Building course structure...', percent: 85 })

  const module: ParsedModule = {
    title: suggestedTitle,
    description: `Imported from ${fileName}`,
    lessons
  }

  const totalBlocks = lessons.reduce((sum, l) => sum + l.blocks.length, 0)

  onProgress?.({ phase: 'complete', message: 'Import complete', percent: 100 })

  return {
    format: 'pptx',
    suggestedTitle,
    modules: [module],
    warnings,
    totalBlocks,
    totalLessons: lessons.length
  }
}

// ─── XML Parsing Helpers ───

/**
 * Extract all text content from a PPTX slide XML.
 * Looks for <a:t> elements which contain the actual text runs.
 */
function parseSlideXml(
  xml: string,
  slideNum: number,
  _imageMap: Map<string, string>,
  _warnings: string[]
): ParsedLesson {
  const texts = extractTextRuns(xml)
  const blocks = []

  // Group consecutive text runs into paragraphs
  // Split on paragraph markers (</a:p>) and collect text
  const paragraphs = extractParagraphs(xml)

  let title = `Slide ${slideNum}`

  for (let i = 0; i < paragraphs.length; i++) {
    const text = paragraphs[i].trim()
    if (!text) continue

    // First non-empty paragraph becomes the slide/lesson title
    if (i === 0 || (i === 1 && !paragraphs[0].trim())) {
      title = text
      continue
    }

    blocks.push(createTextBlock({ content: `<p>${escapeHtml(text)}</p>` }))
  }

  // If no paragraphs but we have raw text, use that
  if (blocks.length === 0 && texts.length > 0) {
    const combined = texts.join(' ').trim()
    if (combined) {
      title = combined.slice(0, 80)
      if (combined.length > 80) {
        blocks.push(createTextBlock({ content: `<p>${escapeHtml(combined)}</p>` }))
      }
    }
  }

  return { title, blocks }
}

/**
 * Extract paragraph-level text from PPTX XML.
 * Each <a:p> element represents a paragraph.
 */
function extractParagraphs(xml: string): string[] {
  const paragraphs: string[] = []
  // Match each <a:p>...</a:p> block
  const pRegex = /<a:p\b[^>]*>([\s\S]*?)<\/a:p>/g
  let match
  while ((match = pRegex.exec(xml)) !== null) {
    const pContent = match[1]
    // Extract all <a:t> text runs within this paragraph
    const texts: string[] = []
    const tRegex = /<a:t>([\s\S]*?)<\/a:t>/g
    let tMatch
    while ((tMatch = tRegex.exec(pContent)) !== null) {
      texts.push(tMatch[1])
    }
    if (texts.length > 0) {
      paragraphs.push(texts.join(''))
    }
  }
  return paragraphs
}

/**
 * Extract all <a:t> text values from XML.
 */
function extractTextRuns(xml: string): string[] {
  const texts: string[] = []
  const regex = /<a:t>([\s\S]*?)<\/a:t>/g
  let match
  while ((match = regex.exec(xml)) !== null) {
    texts.push(match[1])
  }
  return texts
}

/**
 * Extract plain text from notes XML.
 */
function extractTextFromXml(xml: string): string {
  return extractTextRuns(xml).join(' ').trim()
}

/**
 * Parse slide relationships to find embedded images and add them as MediaBlocks.
 */
function addImageBlocksFromRels(
  relsXml: string,
  imageMap: Map<string, string>,
  lesson: ParsedLesson,
  warnings: string[]
): void {
  // Look for image relationships
  const relRegex = /<Relationship[^>]*Type="[^"]*image"[^>]*Target="([^"]*)"[^>]*\/>/gi
  let match
  while ((match = relRegex.exec(relsXml)) !== null) {
    let target = match[1]
    // Normalize relative path (../media/image1.png → media/image1.png)
    target = target.replace(/^\.\.\//, '')

    const dataUri = imageMap.get(target)
    if (dataUri) {
      lesson.blocks.push(
        createMediaBlock({
          assetPath: dataUri,
          altText: '',
          caption: ''
        })
      )
      warnings.push(`Image from slide "${lesson.title}" has no alt text — please add`)
    }
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
