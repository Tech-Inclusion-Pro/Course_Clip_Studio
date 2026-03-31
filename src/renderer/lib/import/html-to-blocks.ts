import type { ContentBlock } from '@/types/course'
import { uid } from '@/lib/uid'

/**
 * Convert HTML string to ContentBlock array using DOMParser.
 */
export function htmlToBlocks(html: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const elements = doc.body.children

  for (const el of Array.from(elements)) {
    const tagName = el.tagName.toLowerCase()

    if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'blockquote', 'ul', 'ol', 'li'].includes(tagName)) {
      const textContent = el.innerHTML.trim()
      if (textContent) {
        blocks.push({
          id: uid('block'),
          type: 'text',
          ariaLabel: 'Text content',
          notes: '',
          content: textContent
        })
      }
    } else if (tagName === 'img') {
      const src = el.getAttribute('src') || ''
      const alt = el.getAttribute('alt') || ''
      blocks.push({
        id: uid('block'),
        type: 'media',
        ariaLabel: alt || 'Image',
        notes: '',
        assetPath: src,
        caption: '',
        altText: alt
      })
    } else if (tagName === 'video') {
      const src = el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || ''
      blocks.push({
        id: uid('block'),
        type: 'video',
        ariaLabel: 'Video',
        notes: '',
        source: 'embed',
        url: src,
        transcript: '',
        captions: [],
        poster: ''
      })
    } else if (tagName === 'audio') {
      const src = el.getAttribute('src') || el.querySelector('source')?.getAttribute('src') || ''
      blocks.push({
        id: uid('block'),
        type: 'audio',
        ariaLabel: 'Audio',
        notes: '',
        assetPath: src,
        transcript: '',
        captions: []
      })
    } else if (tagName === 'iframe') {
      const src = el.getAttribute('src') || ''
      blocks.push({
        id: uid('block'),
        type: 'embed',
        ariaLabel: 'Embedded content',
        notes: '',
        url: src,
        title: el.getAttribute('title') || ''
      })
    } else if (tagName === 'pre' || tagName === 'code') {
      blocks.push({
        id: uid('block'),
        type: 'code',
        ariaLabel: 'Code example',
        notes: '',
        language: 'text',
        code: el.textContent || '',
        runnable: false
      })
    } else if (el.innerHTML.trim()) {
      // Generic fallback: treat as custom HTML
      blocks.push({
        id: uid('block'),
        type: 'custom-html',
        ariaLabel: 'Custom HTML content',
        notes: '',
        html: el.outerHTML,
        css: '',
        js: ''
      })
    }
  }

  // If no blocks were created, add the entire content as a single text block
  if (blocks.length === 0 && html.trim()) {
    blocks.push({
      id: uid('block'),
      type: 'text',
      ariaLabel: 'Text content',
      notes: '',
      content: html.trim()
    })
  }

  return blocks
}
