import { useState } from 'react'
import { FileCode, AlertTriangle } from 'lucide-react'
import type { CustomHTMLBlock } from '@/types/course'

interface CustomHTMLBlockEditorProps {
  block: CustomHTMLBlock
  onUpdate: (partial: Partial<CustomHTMLBlock>) => void
}

type TabId = 'html' | 'css' | 'js'

export function CustomHTMLBlockEditor({ block, onUpdate }: CustomHTMLBlockEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('html')

  const tabs: { id: TabId; label: string; value: string; placeholder: string }[] = [
    { id: 'html', label: 'HTML', value: block.html, placeholder: '<div>\n  <!-- Your HTML here -->\n</div>' },
    { id: 'css', label: 'CSS', value: block.css, placeholder: '/* Your styles here */\n.my-element {\n  color: inherit;\n}' },
    { id: 'js', label: 'JS', value: block.js, placeholder: '// Your JavaScript here\nconsole.log("Hello");' }
  ]

  const activeTabData = tabs.find((t) => t.id === activeTab)!

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

      {/* Tab bar */}
      <div className="flex items-center bg-[#1e1e2e] border-b border-[#313244]">
        <div className="flex items-center gap-1 px-2 py-1">
          <FileCode size={14} className="text-[#a6adc8]" />
        </div>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-[var(--font-weight-medium)] cursor-pointer transition-colors border-b-2 ${
              activeTab === tab.id
                ? 'text-[#cdd6f4] border-[var(--brand-magenta)]'
                : 'text-[#6c7086] border-transparent hover:text-[#a6adc8]'
            }`}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            {tab.label}
            {tab.value.length > 0 && (
              <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[var(--brand-magenta)] inline-block" />
            )}
          </button>
        ))}
      </div>

      {/* Code editor */}
      <textarea
        value={activeTabData.value}
        onChange={(e) => onUpdate({ [activeTab]: e.target.value })}
        rows={10}
        className="w-full px-4 py-3 text-xs leading-5 bg-[#1e1e2e] text-[#cdd6f4] font-mono focus:outline-none resize-y min-h-[120px]"
        placeholder={activeTabData.placeholder}
        aria-label={`${activeTabData.label} code editor`}
        spellCheck={false}
        style={{ tabSize: 2 }}
        onKeyDown={(e) => {
          if (e.key === 'Tab') {
            e.preventDefault()
            const target = e.target as HTMLTextAreaElement
            const start = target.selectionStart
            const end = target.selectionEnd
            const value = target.value
            onUpdate({ [activeTab]: value.substring(0, start) + '  ' + value.substring(end) })
            requestAnimationFrame(() => {
              target.selectionStart = target.selectionEnd = start + 2
            })
          }
        }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-[#181825] border-t border-[#313244]">
        <span className="text-[10px] text-[#6c7086]">
          {activeTabData.value.split('\n').length} line{activeTabData.value.split('\n').length !== 1 ? 's' : ''}
        </span>
        <span className="text-[10px] text-[#6c7086]">
          {activeTabData.label}
        </span>
      </div>
    </div>
  )
}
