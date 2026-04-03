import { useState } from 'react'
import { Plus, Trash2, Layers } from 'lucide-react'
import { useAIGenerate } from '@/hooks/useAIGenerate'
import { tabContentPrompt } from '@/lib/ai'
import { AIGenerateButton } from '@/components/ui/AIGenerateButton'
import type { TabsBlock } from '@/types/course'

interface TabsBlockEditorProps {
  block: TabsBlock
  onUpdate: (partial: Partial<TabsBlock>) => void
}

export function TabsBlockEditor({ block, onUpdate }: TabsBlockEditorProps): JSX.Element {
  const [activeTab, setActiveTab] = useState(0)
  const { generate, isGenerating, isConfigured } = useAIGenerate()

  async function handleAIGenerate() {
    const existing = block.tabs.filter((t) => t.label.trim()).map((t) => t.label).join(', ')
    const topic = existing || 'educational content'
    const text = await generate(tabContentPrompt(topic, 3))
    if (!text) return
    try {
      const parsed = JSON.parse(text.replace(/```json?\n?/g, '').replace(/```/g, '').trim())
      const tabs = (Array.isArray(parsed) ? parsed : []).map((t: Record<string, string>) => ({
        label: t.label || '',
        content: t.content || ''
      })).filter((t: { label: string }) => t.label)
      if (tabs.length > 0) {
        onUpdate({ tabs: [...block.tabs, ...tabs] })
      }
    } catch { /* ignore parse errors */ }
  }

  function addTab() {
    onUpdate({
      tabs: [...block.tabs, { label: '', content: '' }]
    })
    setActiveTab(block.tabs.length)
  }

  function updateTab(index: number, partial: Partial<{ label: string; content: string }>) {
    const updated = block.tabs.map((tab, i) => (i === index ? { ...tab, ...partial } : tab))
    onUpdate({ tabs: updated })
  }

  function removeTab(index: number) {
    if (block.tabs.length <= 1) return
    const updated = block.tabs.filter((_, i) => i !== index)
    onUpdate({ tabs: updated })
    if (activeTab >= updated.length) setActiveTab(Math.max(0, updated.length - 1))
    else if (activeTab > index) setActiveTab(activeTab - 1)
  }

  return (
    <div
      className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden"
      role="region"
      aria-label="Tabs block editor"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-muted)] border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-[var(--brand-magenta)]" />
          <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">Tabs</h3>
        </div>
        <div className="flex items-center gap-1">
          {isConfigured && (
            <AIGenerateButton
              label="Generate Tabs"
              onClick={handleAIGenerate}
              isGenerating={isGenerating}
              size="sm"
            />
          )}
          <button
            onClick={addTab}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] border border-[var(--border-default)] rounded-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            aria-label="Add tab"
          >
            <Plus size={12} /> Add Tab
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div
        className="flex items-center gap-0.5 px-3 pt-2 bg-[var(--bg-muted)] overflow-x-auto"
        role="tablist"
        aria-label="Tab sections"
      >
        {block.tabs.map((tab, index) => (
          <div key={index} className="flex items-center group">
            <button
              role="tab"
              aria-selected={activeTab === index}
              onClick={() => setActiveTab(index)}
              className={`px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-t-md transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] ${
                activeTab === index
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] border border-b-0 border-[var(--border-default)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              }`}
            >
              {tab.label || `Tab ${index + 1}`}
            </button>
            {block.tabs.length > 1 && (
              <button
                onClick={(e) => { e.stopPropagation(); removeTab(index) }}
                className="p-0.5 ml-0.5 rounded text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label={`Remove tab ${tab.label || index + 1}`}
                tabIndex={-1}
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Active tab content */}
      {block.tabs[activeTab] && (
        <div className="p-4 space-y-3" role="tabpanel" aria-label={`Tab ${activeTab + 1} content`}>
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Tab Label
            </label>
            <input
              type="text"
              value={block.tabs[activeTab].label}
              onChange={(e) => updateTab(activeTab, { label: e.target.value })}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="Tab label..."
            />
          </div>
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Content
            </label>
            <textarea
              value={block.tabs[activeTab].content}
              onChange={(e) => updateTab(activeTab, { content: e.target.value })}
              rows={4}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-y"
              placeholder="Tab content..."
            />
          </div>
        </div>
      )}
    </div>
  )
}
