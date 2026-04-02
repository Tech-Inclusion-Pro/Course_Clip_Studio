import { useState, useRef, useCallback } from 'react'
import {
  Trash2,
  Plus
} from 'lucide-react'
import { uid } from '@/lib/uid'
import { useAssetUpload } from '@/hooks/useAssetUpload'
import type { SlideBlock, SlideElement, SlideElementType } from '@/types/course'

interface SlideBlockEditorProps {
  block: SlideBlock
  onUpdate: (partial: Partial<SlideBlock>) => void
}

const CANVAS_W = 800
const CANVAS_H = 450

const ELEMENT_DEFAULTS: Record<SlideElementType, { width: number; height: number }> = {
  button: { width: 140, height: 40 },
  embed: { width: 300, height: 200 },
  quiz: { width: 300, height: 180 },
  matching: { width: 300, height: 180 },
  text: { width: 200, height: 60 },
  image: { width: 200, height: 150 }
}

const ELEMENT_TYPE_LABELS: Record<SlideElementType, string> = {
  button: 'Button',
  embed: 'Embed',
  quiz: 'Quiz',
  matching: 'Matching',
  text: 'Text',
  image: 'Image'
}

export function SlideBlockEditor({ block, onUpdate }: SlideBlockEditorProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const copyAsset = useAssetUpload()

  const selectedElement = block.elements.find((el) => el.id === selectedId) || null

  function addElement(type: SlideElementType) {
    const defaults = ELEMENT_DEFAULTS[type]
    const newEl: SlideElement = {
      id: uid('slide-el'),
      type,
      x: Math.round((CANVAS_W - defaults.width) / 2),
      y: Math.round((CANVAS_H - defaults.height) / 2),
      width: defaults.width,
      height: defaults.height,
      data: {}
    }
    onUpdate({ elements: [...block.elements, newEl] })
    setSelectedId(newEl.id)
  }

  function updateElement(id: string, partial: Partial<SlideElement>) {
    onUpdate({
      elements: block.elements.map((el) => (el.id === id ? { ...el, ...partial } : el))
    })
  }

  function removeElement(id: string) {
    onUpdate({ elements: block.elements.filter((el) => el.id !== id) })
    if (selectedId === id) setSelectedId(null)
  }

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, el: SlideElement) => {
      e.stopPropagation()
      setSelectedId(el.id)
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      setDragging({
        id: el.id,
        offsetX: e.clientX - rect.left - el.x,
        offsetY: e.clientY - rect.top - el.y
      })
    },
    []
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging || !canvasRef.current) return
      const rect = canvasRef.current.getBoundingClientRect()
      const el = block.elements.find((el) => el.id === dragging.id)
      if (!el) return
      let x = e.clientX - rect.left - dragging.offsetX
      let y = e.clientY - rect.top - dragging.offsetY
      x = Math.max(0, Math.min(CANVAS_W - el.width, x))
      y = Math.max(0, Math.min(CANVAS_H - el.height, y))
      updateElement(dragging.id, { x: Math.round(x), y: Math.round(y) })
    },
    [dragging, block.elements]
  )

  const handleMouseUp = useCallback(() => {
    setDragging(null)
  }, [])

  function handleBgImageUpload() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        const copied = await copyAsset(file.path)
        onUpdate({ backgroundImage: copied })
      }
    }
    input.click()
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-3 py-2 bg-[var(--bg-muted)] border-b border-[var(--border-default)] flex-wrap">
        <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] mr-2">Add:</span>
        {(Object.keys(ELEMENT_TYPE_LABELS) as SlideElementType[]).map((type) => (
          <button
            key={type}
            onClick={() => addElement(type)}
            className="flex items-center gap-1 px-2 py-1 text-xs rounded text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer transition-colors"
            title={`Add ${type}`}
          >
            <Plus size={10} />
            {ELEMENT_TYPE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative mx-auto my-3 border border-[var(--border-default)] rounded overflow-hidden select-none"
        style={{
          width: CANVAS_W,
          height: CANVAS_H,
          backgroundColor: block.backgroundColor || '#ffffff',
          backgroundImage: block.backgroundImage ? `url(file://${block.backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedId(null)}
      >
        {block.elements.map((el) => {
          const isSelected = selectedId === el.id
          return (
            <div
              key={el.id}
              className={`absolute flex items-center justify-center border-2 rounded cursor-move transition-shadow ${
                isSelected
                  ? 'border-[var(--brand-magenta)] shadow-lg'
                  : 'border-transparent hover:border-[var(--border-default)]'
              }`}
              style={{
                left: el.x,
                top: el.y,
                width: el.width,
                height: el.height,
                backgroundColor: el.type === 'button' ? 'var(--brand-magenta)' : 'rgba(255,255,255,0.85)'
              }}
              onMouseDown={(e) => handleMouseDown(e, el)}
              onClick={(e) => e.stopPropagation()}
            >
              <span className={`text-xs text-center px-2 truncate w-full ${el.type === 'button' ? 'text-white font-semibold' : 'text-[var(--text-secondary)]'}`}>
                {el.data.buttonLabel || el.data.textContent || el.data.embedTitle || el.type}
              </span>
              {isSelected && (
                <button
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[var(--color-danger-600)] text-white flex items-center justify-center cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); removeElement(el.id) }}
                  title="Remove element"
                >
                  <Trash2 size={10} />
                </button>
              )}
            </div>
          )
        })}

        {block.elements.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-[var(--text-tertiary)]">
            <Plus size={24} />
            <p className="text-xs mt-1">Add elements from the toolbar above</p>
          </div>
        )}
      </div>

      {/* Properties panel */}
      <div className="p-3 border-t border-[var(--border-default)] space-y-3">
        {/* Background controls */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-[var(--border-default)] cursor-pointer"
              />
              <input
                type="text"
                value={block.backgroundColor || '#ffffff'}
                onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
                className="flex-1 px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">
              Background Image
            </label>
            <button
              onClick={handleBgImageUpload}
              className="w-full px-2 py-1.5 text-xs rounded border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer truncate"
            >
              {block.backgroundImage ? block.backgroundImage.split('/').pop() : 'Choose image...'}
            </button>
          </div>
        </div>

        {/* Selected element properties */}
        {selectedElement && (
          <div className="p-3 rounded-lg bg-[var(--bg-muted)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-primary)] capitalize">
                {selectedElement.type} Properties
              </span>
              <button
                onClick={() => removeElement(selectedElement.id)}
                className="text-xs text-[var(--color-danger-600)] hover:underline cursor-pointer"
              >
                Delete
              </button>
            </div>

            {/* Position & size */}
            <div className="grid grid-cols-4 gap-2">
              {(['x', 'y', 'width', 'height'] as const).map((prop) => (
                <div key={prop}>
                  <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5 uppercase">{prop}</label>
                  <input
                    type="number"
                    value={selectedElement[prop]}
                    onChange={(e) => updateElement(selectedElement.id, { [prop]: Number(e.target.value) || 0 })}
                    className="w-full px-1.5 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  />
                </div>
              ))}
            </div>

            {/* Type-specific fields */}
            {selectedElement.type === 'button' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5">Label</label>
                  <input
                    type="text"
                    value={selectedElement.data.buttonLabel || ''}
                    onChange={(e) => updateElement(selectedElement.id, { data: { ...selectedElement.data, buttonLabel: e.target.value } })}
                    className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Button text..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5">URL</label>
                  <input
                    type="text"
                    value={selectedElement.data.buttonUrl || ''}
                    onChange={(e) => updateElement(selectedElement.id, { data: { ...selectedElement.data, buttonUrl: e.target.value } })}
                    className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {selectedElement.type === 'text' && (
              <div>
                <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5">Content</label>
                <textarea
                  value={selectedElement.data.textContent || ''}
                  onChange={(e) => updateElement(selectedElement.id, { data: { ...selectedElement.data, textContent: e.target.value } })}
                  rows={2}
                  className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] resize-y"
                  placeholder="Text content..."
                />
              </div>
            )}

            {selectedElement.type === 'embed' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5">URL</label>
                  <input
                    type="text"
                    value={selectedElement.data.embedUrl || ''}
                    onChange={(e) => updateElement(selectedElement.id, { data: { ...selectedElement.data, embedUrl: e.target.value } })}
                    className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Embed URL..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5">Title</label>
                  <input
                    type="text"
                    value={selectedElement.data.embedTitle || ''}
                    onChange={(e) => updateElement(selectedElement.id, { data: { ...selectedElement.data, embedTitle: e.target.value } })}
                    className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Accessible title..."
                  />
                </div>
              </div>
            )}

            {selectedElement.type === 'image' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5">Image Path</label>
                  <input
                    type="text"
                    value={selectedElement.data.imagePath || ''}
                    onChange={(e) => updateElement(selectedElement.id, { data: { ...selectedElement.data, imagePath: e.target.value } })}
                    className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Path to image..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5">Alt Text</label>
                  <input
                    type="text"
                    value={selectedElement.data.imageAlt || ''}
                    onChange={(e) => updateElement(selectedElement.id, { data: { ...selectedElement.data, imageAlt: e.target.value } })}
                    className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Describe this image..."
                  />
                </div>
              </div>
            )}

            {selectedElement.type === 'quiz' && (
              <div>
                <label className="block text-[10px] text-[var(--text-tertiary)] mb-0.5">Question Prompt</label>
                <input
                  type="text"
                  value={selectedElement.data.quizPrompt || ''}
                  onChange={(e) => updateElement(selectedElement.id, { data: { ...selectedElement.data, quizPrompt: e.target.value } })}
                  className="w-full px-2 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                  placeholder="Enter a question..."
                />
              </div>
            )}

            {selectedElement.type === 'matching' && (
              <div>
                <p className="text-[10px] text-[var(--text-tertiary)]">
                  Configure matching pairs in the preview. {selectedElement.data.matchingPairs?.length || 0} pair(s) set.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
