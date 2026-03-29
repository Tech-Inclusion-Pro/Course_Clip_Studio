/**
 * Flesch-Kincaid Grade Level computation.
 * Returns a US grade level (e.g. 8 = 8th grade).
 * Works on plain text — strip HTML before calling.
 */

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, '')
  if (w.length <= 3) return 1

  let count = 0
  const vowels = 'aeiouy'
  let prevVowel = false

  for (let i = 0; i < w.length; i++) {
    const isVowel = vowels.includes(w[i])
    if (isVowel && !prevVowel) count++
    prevVowel = isVowel
  }

  // Silent e
  if (w.endsWith('e') && count > 1) count--
  // -le at end counts if preceded by consonant
  if (w.endsWith('le') && w.length > 2 && !vowels.includes(w[w.length - 3])) count++

  return Math.max(1, count)
}

function splitSentences(text: string): string[] {
  return text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
}

function splitWords(text: string): string[] {
  return text.split(/\s+/).filter((w) => w.replace(/[^a-zA-Z]/g, '').length > 0)
}

/**
 * Strip HTML tags from a string.
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Compute Flesch-Kincaid Grade Level.
 * Returns null for empty or too-short text.
 */
export function fleschKincaidGrade(text: string): number | null {
  const plain = stripHtml(text)
  const sentences = splitSentences(plain)
  const words = splitWords(plain)

  if (words.length < 10 || sentences.length === 0) return null

  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0)

  const grade =
    0.39 * (words.length / sentences.length) +
    11.8 * (totalSyllables / words.length) -
    15.59

  return Math.max(1, Math.round(grade))
}
