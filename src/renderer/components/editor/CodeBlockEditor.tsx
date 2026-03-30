import { Code2 } from 'lucide-react'
import type { CodeBlock } from '@/types/course'

interface CodeBlockEditorProps {
  block: CodeBlock
  onUpdate: (partial: Partial<CodeBlock>) => void
}

const LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
  'sql', 'bash', 'json', 'yaml', 'xml', 'markdown', 'plaintext'
]

export function CodeBlockEditor({ block, onUpdate }: CodeBlockEditorProps): JSX.Element {
  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Code block editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2e] border-b border-[#313244]">
        <div className="flex items-center gap-2">
          <Code2 size={14} className="text-[#cdd6f4]" />
          <select
            value={block.language}
            onChange={(e) => onUpdate({ language: e.target.value })}
            className="px-2 py-0.5 text-xs rounded bg-[#313244] text-[#cdd6f4] border border-[#45475a] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            aria-label="Programming language"
          >
            {LANGUAGES.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={block.runnable}
            onChange={(e) => onUpdate({ runnable: e.target.checked })}
            className="rounded border-[#45475a] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
          />
          <span className="text-[10px] text-[#a6adc8]">Runnable</span>
        </label>
      </div>

      {/* Code editor */}
      <div className="relative">
        <textarea
          value={block.code}
          onChange={(e) => onUpdate({ code: e.target.value })}
          rows={10}
          className="w-full px-4 py-3 text-xs leading-5 bg-[#1e1e2e] text-[#cdd6f4] font-mono focus:outline-none resize-y min-h-[120px]"
          placeholder={`// Write your ${block.language} code here...`}
          aria-label="Code editor"
          spellCheck={false}
          style={{ tabSize: 2 }}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault()
              const target = e.target as HTMLTextAreaElement
              const start = target.selectionStart
              const end = target.selectionEnd
              const value = target.value
              onUpdate({ code: value.substring(0, start) + '  ' + value.substring(end) })
              requestAnimationFrame(() => {
                target.selectionStart = target.selectionEnd = start + 2
              })
            }
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#181825] border-t border-[#313244]">
        <span className="text-[10px] text-[#6c7086]">
          {block.code.split('\n').length} line{block.code.split('\n').length !== 1 ? 's' : ''}
        </span>
        <span className="text-[10px] text-[#6c7086]">
          {block.language}
        </span>
      </div>
    </div>
  )
}
