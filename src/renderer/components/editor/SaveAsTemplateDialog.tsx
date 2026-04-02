import { useState } from 'react'
import { X, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAppStore } from '@/stores/useAppStore'
import { uid } from '@/lib/uid'
import type { Course, UserTemplate } from '@/types/course'

interface SaveAsTemplateDialogProps {
  course: Course
  open: boolean
  onClose: () => void
}

const ICON_OPTIONS = [
  'FileText',
  'Briefcase',
  'Users',
  'ShieldCheck',
  'GraduationCap',
  'Accessibility'
]

export function SaveAsTemplateDialog({ course, open, onClose }: SaveAsTemplateDialogProps): JSX.Element | null {
  const addUserTemplate = useAppStore((s) => s.addUserTemplate)
  const [name, setName] = useState(course.meta.title + ' Template')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('FileText')
  const [removeContent, setRemoveContent] = useState(false)

  if (!open) return null

  function handleSave() {
    // Clone the course, strip ids and timestamps
    const courseClone = JSON.parse(JSON.stringify(course))
    delete courseClone.id
    delete courseClone.createdAt
    delete courseClone.updatedAt

    if (removeContent) {
      // Clear block content but keep structure
      for (const mod of courseClone.modules) {
        for (const lesson of mod.lessons) {
          for (const block of lesson.blocks) {
            switch (block.type) {
              case 'text':
                block.content = ''
                break
              case 'media':
                block.assetPath = ''
                block.caption = ''
                block.altText = ''
                break
              case 'video':
                block.url = ''
                block.transcript = ''
                block.captions = []
                break
              case 'audio':
                block.assetPath = ''
                block.transcript = ''
                block.captions = []
                break
              case 'quiz':
                block.questions = []
                break
              case 'accordion':
                block.items = block.items.map((item: { title: string }) => ({ title: item.title, content: '' }))
                break
              case 'tabs':
                block.tabs = block.tabs.map((tab: { label: string }) => ({ label: tab.label, content: '' }))
                break
              case 'flashcard':
                block.cards = []
                break
              case 'callout':
                block.content = ''
                break
              case 'code':
                block.code = ''
                break
              case 'embed':
                block.url = ''
                break
              case 'branching':
                block.scenario = ''
                block.choices = []
                break
            }
          }
        }
      }
    }

    const template: UserTemplate = {
      id: uid('tpl'),
      name: name.trim() || 'Untitled Template',
      description: description.trim(),
      icon,
      tags: course.meta.tags,
      courseJson: JSON.stringify(courseClone),
      createdAt: new Date().toISOString()
    }

    addUserTemplate(template)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)]">
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Save as Template
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Template Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="My Template"
            />
          </div>

          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)] resize-none"
              placeholder="Brief description of this template..."
            />
          </div>

          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Icon
            </label>
            <select
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            >
              {ICON_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={removeContent}
              onChange={(e) => setRemoveContent(e.target.checked)}
              className="rounded border-[var(--border-default)] text-[var(--brand-magenta)] focus:ring-[var(--ring-brand)]"
            />
            <span className="text-xs text-[var(--text-secondary)]">
              Remove all content (keep structure only)
            </span>
          </label>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-[var(--border-default)]">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSave}>
            <Save size={14} />
            Save Template
          </Button>
        </div>
      </div>
    </div>
  )
}
