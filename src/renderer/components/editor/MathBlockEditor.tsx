import { useState, useMemo } from 'react'
import katex from 'katex'
import type { MathBlock } from '@/types/course'

interface MathBlockEditorProps {
  block: MathBlock
  onUpdate: (partial: Partial<MathBlock>) => void
}

const SYMBOL_SHORTCUTS = [
  { label: '\\frac{a}{b}', insert: '\\frac{}{}' },
  { label: '\\sqrt{}', insert: '\\sqrt{}' },
  { label: '\\sum', insert: '\\sum_{i=0}^{n}' },
  { label: '\\int', insert: '\\int_{a}^{b}' },
  { label: '\\alpha', insert: '\\alpha' },
  { label: '\\beta', insert: '\\beta' },
  { label: '\\pi', insert: '\\pi' },
  { label: '\\infty', insert: '\\infty' },
  { label: '\\pm', insert: '\\pm' },
  { label: '\\neq', insert: '\\neq' },
  { label: '\\leq', insert: '\\leq' },
  { label: '\\geq', insert: '\\geq' },
]

export function MathBlockEditor({ block, onUpdate }: MathBlockEditorProps): JSX.Element {
  const [error, setError] = useState<string | null>(null)

  const renderedHtml = useMemo(() => {
    if (!block.latex.trim()) return ''
    try {
      const html = katex.renderToString(block.latex, {
        displayMode: block.displayMode,
        throwOnError: true,
        trust: false
      })
      setError(null)
      return html
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid LaTeX')
      return ''
    }
  }, [block.latex, block.displayMode])

  function insertSymbol(symbol: string) {
    onUpdate({ latex: block.latex + symbol })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Math block editor">
      {/* Settings bar */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <label className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
          <input
            type="checkbox"
            checked={block.displayMode}
            onChange={(e) => onUpdate({ displayMode: e.target.checked })}
            className="rounded"
          />
          Display mode (centered block)
        </label>
      </div>

      {/* Symbol shortcuts */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-[var(--border-default)]">
        {SYMBOL_SHORTCUTS.map((s) => (
          <button
            key={s.insert}
            onClick={() => insertSymbol(s.insert)}
            className="px-1.5 py-0.5 text-[10px] font-mono rounded border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer"
            title={s.insert}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* LaTeX input */}
      <div className="p-3">
        <textarea
          value={block.latex}
          onChange={(e) => onUpdate({ latex: e.target.value })}
          rows={3}
          className="w-full px-3 py-2 text-sm font-mono rounded-lg border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
          placeholder="Enter LaTeX expression... e.g. E = mc^2"
          aria-label="LaTeX expression"
          spellCheck={false}
        />
      </div>

      {/* Preview */}
      <div className="px-3 pb-3">
        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider mb-1">Preview</p>
        <div className="p-4 rounded-lg border border-[var(--border-default)] bg-white dark:bg-[#1e1e2e] min-h-[48px] flex items-center justify-center">
          {error ? (
            <p className="text-xs text-[var(--color-danger-600)]">{error}</p>
          ) : renderedHtml ? (
            <div dangerouslySetInnerHTML={{ __html: renderedHtml }} />
          ) : (
            <p className="text-xs text-[var(--text-tertiary)] italic">Type LaTeX above to see preview</p>
          )}
        </div>
      </div>
    </div>
  )
}
