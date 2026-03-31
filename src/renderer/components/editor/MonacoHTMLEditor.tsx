import { useState } from 'react'
import Editor from '@monaco-editor/react'

interface MonacoHTMLEditorProps {
  html: string
  css: string
  js: string
  onUpdate: (field: 'html' | 'css' | 'js', value: string) => void
}

type TabId = 'html' | 'css' | 'js'

const TAB_LANGUAGE: Record<TabId, string> = {
  html: 'html',
  css: 'css',
  js: 'javascript'
}

const TAB_COLORS: Record<TabId, string> = {
  html: '#e34c26',
  css: '#264de4',
  js: '#f7df1e'
}

export function MonacoHTMLEditor({ html, css, js, onUpdate }: MonacoHTMLEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<TabId>('html')

  const values: Record<TabId, string> = { html, css, js }

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border border-[var(--border-default)]">
      {/* Tab bar */}
      <div className="flex bg-[#1e1e2e] border-b border-[#313244]">
        {(['html', 'css', 'js'] as TabId[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-medium uppercase tracking-wider cursor-pointer transition-colors ${
              activeTab === tab
                ? 'bg-[#313244] text-white border-b-2'
                : 'text-[#a6adc8] hover:text-white hover:bg-[#313244]/50'
            }`}
            style={activeTab === tab ? { borderBottomColor: TAB_COLORS[tab] } : undefined}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Editor */}
      <div style={{ height: 300 }}>
        <Editor
          language={TAB_LANGUAGE[activeTab]}
          value={values[activeTab]}
          onChange={(value) => onUpdate(activeTab, value ?? '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 2,
            padding: { top: 8 }
          }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#1e1e2e] border-t border-[#313244]">
        <span className="text-[10px] text-[#a6adc8]">
          {TAB_LANGUAGE[activeTab].toUpperCase()} • {values[activeTab].length} chars
        </span>
        <div className="flex gap-2">
          {html && <span className="text-[10px] text-[#e34c26]">HTML</span>}
          {css && <span className="text-[10px] text-[#264de4]">CSS</span>}
          {js && <span className="text-[10px] text-[#f7df1e]">JS</span>}
        </div>
      </div>
    </div>
  )
}
