let counter = 0

/**
 * Generate a unique ID with optional prefix.
 * Combines an incrementing counter with a random suffix for uniqueness.
 */
export function uid(prefix = 'id'): string {
  counter += 1
  return `${prefix}-${Date.now()}-${counter}-${Math.random().toString(36).slice(2, 8)}`
}
