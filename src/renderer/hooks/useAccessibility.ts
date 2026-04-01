import { useEffect } from 'react'
import { useAppStore } from '@/stores/useAppStore'

const EXCLUDED_SELECTORS = 'code, pre, input, textarea, button, svg, [contenteditable], .tiptap'

const COLOR_BLIND_FILTERS: Record<string, string> = {
  protanopia: `<filter id="a11y-protanopia"><feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0"/></filter>`,
  deuteranopia: `<filter id="a11y-deuteranopia"><feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0"/></filter>`,
  tritanopia: `<filter id="a11y-tritanopia"><feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0"/></filter>`
}

function ensureSvgFilters(): void {
  if (document.getElementById('a11y-svg-filters')) return
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
  svg.id = 'a11y-svg-filters'
  svg.setAttribute('aria-hidden', 'true')
  svg.style.position = 'absolute'
  svg.style.width = '0'
  svg.style.height = '0'
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs')
  defs.innerHTML = Object.values(COLOR_BLIND_FILTERS).join('')
  svg.appendChild(defs)
  document.body.appendChild(svg)
}

function bionicWord(word: string): HTMLElement {
  const mid = Math.ceil(word.length / 2)
  const b = document.createElement('b')
  b.className = 'bionic'
  b.textContent = word.slice(0, mid)
  const span = document.createElement('span')
  span.appendChild(b)
  span.appendChild(document.createTextNode(word.slice(mid)))
  return span
}

function applyBionic(root: HTMLElement): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement
      if (!parent) return NodeFilter.FILTER_REJECT
      if (parent.closest(EXCLUDED_SELECTORS)) return NodeFilter.FILTER_REJECT
      if (parent.hasAttribute('data-bionic-processed') || parent.classList.contains('bionic'))
        return NodeFilter.FILTER_REJECT
      if (!(node.textContent || '').trim()) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    }
  })

  const nodes: Text[] = []
  let current = walker.nextNode()
  while (current) {
    nodes.push(current as Text)
    current = walker.nextNode()
  }

  for (const node of nodes) {
    const parent = node.parentElement
    if (!parent) continue
    const text = node.textContent || ''
    if (!text.trim()) continue

    const fragment = document.createDocumentFragment()
    const parts = text.split(/(\s+)/)
    for (const part of parts) {
      if (/^\s+$/.test(part) || part.length <= 1) {
        fragment.appendChild(document.createTextNode(part))
      } else {
        fragment.appendChild(bionicWord(part))
      }
    }

    const wrapper = document.createElement('span')
    wrapper.setAttribute('data-bionic-processed', 'true')
    wrapper.appendChild(fragment)
    parent.replaceChild(wrapper, node)
  }
}

function removeBionic(root: HTMLElement): void {
  const processed = root.querySelectorAll('[data-bionic-processed]')
  for (const el of processed) {
    el.replaceWith(document.createTextNode(el.textContent || ''))
  }
}

export function useAccessibility(): void {
  const a11y = useAppStore((s) => s.accessibility)

  // Font size
  useEffect(() => {
    document.documentElement.style.fontSize = `${a11y.baseFontSize}px`
  }, [a11y.baseFontSize])

  // High contrast
  useEffect(() => {
    document.documentElement.classList.toggle('a11y-high-contrast', a11y.highContrastMode)
  }, [a11y.highContrastMode])

  // Reduced motion
  useEffect(() => {
    document.documentElement.classList.toggle('a11y-reduced-motion', a11y.reducedMotion)
  }, [a11y.reducedMotion])

  // Color blind mode
  useEffect(() => {
    const root = document.documentElement
    if (a11y.colorBlindMode === 'none') {
      root.style.filter = ''
    } else if (a11y.colorBlindMode === 'achromatopsia') {
      root.style.filter = 'grayscale(100%)'
    } else {
      ensureSvgFilters()
      root.style.filter = `url(#a11y-${a11y.colorBlindMode})`
    }
    return () => {
      root.style.filter = ''
    }
  }, [a11y.colorBlindMode])

  // OpenDyslexic
  useEffect(() => {
    document.documentElement.classList.toggle('a11y-dyslexic', a11y.openDyslexic)
  }, [a11y.openDyslexic])

  // Cursor style
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('a11y-cursor-large', 'a11y-cursor-crosshair', 'a11y-cursor-high-contrast')
    if (a11y.cursorStyle !== 'default') {
      root.classList.add(`a11y-cursor-${a11y.cursorStyle}`)
    }
  }, [a11y.cursorStyle])

  // Cursor trail
  useEffect(() => {
    if (!a11y.cursorTrail || a11y.reducedMotion) return

    const dots: HTMLElement[] = []
    const handleMouseMove = (e: MouseEvent): void => {
      const dot = document.createElement('div')
      dot.style.cssText = `position:fixed;left:${e.clientX}px;top:${e.clientY}px;width:8px;height:8px;border-radius:50%;background:var(--brand-indigo);opacity:0.6;pointer-events:none;z-index:9990;transition:opacity 0.5s,transform 0.5s;`
      document.body.appendChild(dot)
      dots.push(dot)
      requestAnimationFrame(() => {
        dot.style.opacity = '0'
        dot.style.transform = 'scale(0.3)'
      })
      setTimeout(() => {
        dot.remove()
        dots.splice(dots.indexOf(dot), 1)
      }, 500)
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      dots.forEach((d) => d.remove())
    }
  }, [a11y.cursorTrail, a11y.reducedMotion])

  // Enhanced text spacing
  useEffect(() => {
    document.documentElement.classList.toggle('a11y-enhanced-spacing', a11y.enhancedTextSpacing)
  }, [a11y.enhancedTextSpacing])

  // Enhanced focus indicators
  useEffect(() => {
    document.documentElement.classList.toggle('a11y-enhanced-focus', a11y.enhancedFocusIndicators)
  }, [a11y.enhancedFocusIndicators])

  // Bionic reading
  useEffect(() => {
    document.documentElement.classList.toggle('a11y-bionic', a11y.bionicReading)

    if (!a11y.bionicReading) return

    const mainContent = document.getElementById('main-content')
    if (!mainContent) return

    applyBionic(mainContent)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof HTMLElement) {
            applyBionic(node)
          }
        }
      }
    })

    observer.observe(mainContent, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      removeBionic(mainContent)
    }
  }, [a11y.bionicReading])
}
