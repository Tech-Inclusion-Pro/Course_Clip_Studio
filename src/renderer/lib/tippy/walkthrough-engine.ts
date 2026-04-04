/**
 * TIPPY Walkthrough Engine
 *
 * Matches user messages to walkthroughs by trigger phrases,
 * manages walkthrough execution, and handles navigation/highlight
 * coordination.
 */

import type { TIPPYWalkthrough, WalkthroughStep } from '@/types/analytics'
import { WALKTHROUGH_LIBRARY } from './walkthrough-library'

// ─── Trigger Phrase Detection ───

/**
 * Check if a user message matches any walkthrough trigger phrases.
 * Returns the best matching walkthrough or null.
 */
export function detectWalkthroughTrigger(message: string): TIPPYWalkthrough | null {
  const lower = message.toLowerCase().trim()

  // Score each walkthrough by how well the message matches its triggers
  let bestMatch: TIPPYWalkthrough | null = null
  let bestScore = 0

  for (const wt of WALKTHROUGH_LIBRARY) {
    let score = 0

    for (const phrase of wt.triggerPhrases) {
      const phraseLower = phrase.toLowerCase()

      // Exact phrase match = highest score
      if (lower.includes(phraseLower)) {
        // Longer phrase matches are more specific and score higher
        score = Math.max(score, phraseLower.length + 10)
      } else {
        // Word-level matching for partial matches
        const phraseWords = phraseLower.split(/\s+/)
        const matchingWords = phraseWords.filter((w) => lower.includes(w))
        const wordScore = matchingWords.length / phraseWords.length
        if (wordScore >= 0.5) {
          score = Math.max(score, wordScore * phraseLower.length)
        }
      }
    }

    if (score > bestScore) {
      bestScore = score
      bestMatch = wt
    }
  }

  // Minimum score threshold to avoid false positives
  return bestScore >= 3 ? bestMatch : null
}

// ─── Walkthrough Step Execution ───

/**
 * Apply highlight styling to a target element.
 * Returns the element if found, null otherwise.
 */
export function highlightElement(step: WalkthroughStep): HTMLElement | null {
  // Try each selector (comma-separated fallbacks)
  const selectors = step.targetSelector.split(',').map((s) => s.trim())

  for (const selector of selectors) {
    const el = document.querySelector<HTMLElement>(selector)
    if (el) {
      // Add the tippy-highlight class
      el.classList.add('tippy-highlight')

      // Set highlight style variant
      el.setAttribute('data-tippy-highlight', step.highlightStyle)

      return el
    }
  }

  return null
}

/**
 * Remove highlight from all highlighted elements.
 */
export function clearHighlights(): void {
  const highlighted = document.querySelectorAll('.tippy-highlight')
  highlighted.forEach((el) => {
    el.classList.remove('tippy-highlight')
    el.removeAttribute('data-tippy-highlight')
  })
}

/**
 * Scroll the target element into view if needed.
 */
export function scrollToElement(el: HTMLElement): void {
  el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
}

/**
 * Get the bounding rect of a highlighted element, with padding.
 */
export function getHighlightRect(
  el: HTMLElement,
  padding: number = 8
): { top: number; left: number; width: number; height: number } {
  const rect = el.getBoundingClientRect()
  return {
    top: rect.top - padding,
    left: rect.left - padding,
    width: rect.width + padding * 2,
    height: rect.height + padding * 2
  }
}

/**
 * Calculate the best position for a speech bubble relative to the target element.
 * Returns position and coordinates for the bubble.
 */
export function calculateBubblePosition(
  targetRect: { top: number; left: number; width: number; height: number },
  bubbleWidth: number = 280,
  bubbleHeight: number = 160
): { position: 'top' | 'bottom' | 'left' | 'right'; x: number; y: number } {
  const vw = window.innerWidth
  const vh = window.innerHeight

  const centerX = targetRect.left + targetRect.width / 2
  const centerY = targetRect.top + targetRect.height / 2

  // Prefer bottom, then top, then right, then left
  const spaceBelow = vh - (targetRect.top + targetRect.height)
  const spaceAbove = targetRect.top
  const spaceRight = vw - (targetRect.left + targetRect.width)
  const spaceLeft = targetRect.left

  if (spaceBelow >= bubbleHeight + 20) {
    return {
      position: 'bottom',
      x: Math.max(8, Math.min(centerX - bubbleWidth / 2, vw - bubbleWidth - 8)),
      y: targetRect.top + targetRect.height + 12
    }
  }

  if (spaceAbove >= bubbleHeight + 20) {
    return {
      position: 'top',
      x: Math.max(8, Math.min(centerX - bubbleWidth / 2, vw - bubbleWidth - 8)),
      y: targetRect.top - bubbleHeight - 12
    }
  }

  if (spaceRight >= bubbleWidth + 20) {
    return {
      position: 'right',
      x: targetRect.left + targetRect.width + 12,
      y: Math.max(8, Math.min(centerY - bubbleHeight / 2, vh - bubbleHeight - 8))
    }
  }

  return {
    position: 'left',
    x: targetRect.left - bubbleWidth - 12,
    y: Math.max(8, Math.min(centerY - bubbleHeight / 2, vh - bubbleHeight - 8))
  }
}

// ─── CSS Injection ───

let styleInjected = false

/**
 * Inject the tippy-highlight CSS styles into the document.
 * Called once on first walkthrough start.
 */
export function injectHighlightStyles(): void {
  if (styleInjected) return
  styleInjected = true

  const style = document.createElement('style')
  style.id = 'tippy-walkthrough-styles'
  style.textContent = `
    .tippy-highlight {
      outline: 3px dotted #8B0000 !important;
      outline-offset: 4px !important;
      position: relative;
      z-index: 10001;
    }

    .tippy-highlight[data-tippy-highlight="pulse"] {
      animation: tippy-pulse 1.5s ease-in-out infinite;
    }

    .tippy-highlight[data-tippy-highlight="spotlight"] {
      outline-style: solid !important;
      outline-color: #8B0000 !important;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.4);
    }

    @keyframes tippy-pulse {
      0%, 100% {
        outline-color: #8B0000;
        outline-offset: 4px;
      }
      50% {
        outline-color: #B71C1C;
        outline-offset: 6px;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tippy-highlight,
      .tippy-highlight[data-tippy-highlight="pulse"] {
        animation: none !important;
      }
    }
  `
  document.head.appendChild(style)
}
