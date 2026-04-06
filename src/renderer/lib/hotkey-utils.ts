type Platform = 'mac' | 'windows' | 'linux'

interface ParsedBinding {
  ctrl: boolean
  meta: boolean
  shift: boolean
  alt: boolean
  key: string
}

const MAC_SYMBOLS: Record<string, string> = {
  Cmd: '\u2318',
  Ctrl: '\u2303',
  Shift: '\u21E7',
  Alt: '\u2325',
  Option: '\u2325',
  Enter: '\u21A9',
  Backspace: '\u232B',
  Delete: '\u2326',
  Escape: '\u238B',
  Tab: '\u21E5',
  Space: '\u2423',
  ArrowUp: '\u2191',
  ArrowDown: '\u2193',
  ArrowLeft: '\u2190',
  ArrowRight: '\u2192'
}

export function getPlatform(): Platform {
  const p = navigator.platform?.toLowerCase() ?? ''
  if (p.includes('mac')) return 'mac'
  if (p.includes('linux')) return 'linux'
  return 'windows'
}

export function formatKeyForDisplay(binding: string, platform?: Platform): string {
  const plat = platform ?? getPlatform()
  if (plat === 'mac') {
    let result = binding
    for (const [token, symbol] of Object.entries(MAC_SYMBOLS)) {
      result = result.replace(new RegExp(`\\b${token}\\b`, 'g'), symbol)
    }
    return result.replace(/\+/g, '')
  }
  return binding
}

export function parseBinding(binding: string): ParsedBinding {
  const parts = binding.split('+').map((s) => s.trim())
  const modifiers = new Set(parts.slice(0, -1).map((m) => m.toLowerCase()))
  const key = parts[parts.length - 1].toLowerCase()

  return {
    ctrl: modifiers.has('ctrl'),
    meta: modifiers.has('cmd') || modifiers.has('meta'),
    shift: modifiers.has('shift'),
    alt: modifiers.has('alt') || modifiers.has('option'),
    key
  }
}

export function matchesBinding(event: KeyboardEvent, binding: string): boolean {
  const parsed = parseBinding(binding)
  const platform = getPlatform()

  // On Mac, Cmd maps to metaKey; on others, Cmd maps to ctrlKey
  const expectMeta = platform === 'mac' ? parsed.meta : false
  const expectCtrl = platform === 'mac' ? parsed.ctrl : parsed.ctrl || parsed.meta

  if (event.metaKey !== expectMeta) return false
  if (event.ctrlKey !== expectCtrl) return false
  if (event.shiftKey !== parsed.shift) return false
  if (event.altKey !== parsed.alt) return false

  const eventKey = event.key.toLowerCase()
  const parsedKey = parsed.key.toLowerCase()

  // Handle special key names
  const keyMap: Record<string, string> = {
    escape: 'escape',
    esc: 'escape',
    enter: 'enter',
    return: 'enter',
    backspace: 'backspace',
    delete: 'delete',
    tab: 'tab',
    space: ' ',
    arrowup: 'arrowup',
    arrowdown: 'arrowdown',
    arrowleft: 'arrowleft',
    arrowright: 'arrowright',
    '/': '/',
    '[': '[',
    ']': ']',
    '-': '-',
    '=': '='
  }

  const normalizedEvent = keyMap[eventKey] ?? eventKey
  const normalizedParsed = keyMap[parsedKey] ?? parsedKey

  return normalizedEvent === normalizedParsed
}

export function isTextInputFocused(): boolean {
  const el = document.activeElement
  if (!el) return false
  const tag = el.tagName.toLowerCase()
  if (tag === 'input') {
    const type = (el as HTMLInputElement).type.toLowerCase()
    const textTypes = new Set(['text', 'email', 'password', 'search', 'url', 'tel', 'number'])
    return textTypes.has(type)
  }
  if (tag === 'textarea') return true
  if ((el as HTMLElement).isContentEditable) return true
  return false
}
