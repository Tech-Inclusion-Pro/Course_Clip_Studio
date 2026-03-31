import { AlertTriangle } from 'lucide-react'
import { MonacoHTMLEditor } from './MonacoHTMLEditor'
import type { CustomHTMLBlock } from '@/types/course'

interface CustomHTMLBlockEditorProps {
  block: CustomHTMLBlock
  onUpdate: (partial: Partial<CustomHTMLBlock>) => void
}

export function CustomHTMLBlockEditor({ block, onUpdate }: CustomHTMLBlockEditorProps): JSX.Element {
  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Custom HTML block editor"
    >
      {/* Warning banner */}
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-900/50">
        <AlertTriangle size={14} className="text-yellow-600 dark:text-yellow-400 shrink-0" />
        <p className="text-xs text-yellow-800 dark:text-yellow-300">
          Custom code — WCAG compliance is the author&apos;s responsibility
        </p>
      </div>

      {/* Monaco editor */}
      <MonacoHTMLEditor
        html={block.html}
        css={block.css}
        js={block.js}
        onUpdate={(field, value) => onUpdate({ [field]: value })}
      />
    </div>
  )
}
