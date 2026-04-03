import { useState } from 'react'
import { Plus, Trash2, Upload } from 'lucide-react'
import { uid } from '@/lib/uid'
import type { ImageMapBlock, ImageMapHotspot } from '@/types/course'

interface ImageMapBlockEditorProps {
  block: ImageMapBlock
  onUpdate: (partial: Partial<ImageMapBlock>) => void
}

export function ImageMapBlockEditor({ block, onUpdate }: ImageMapBlockEditorProps): JSX.Element {
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null)

  async function handleImageUpload() {
    try {
      const result = await (window as any).electronAPI.showOpenDialog({
        filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg', 'webp'] }],
        properties: ['openFile']
      })
      if (!result || result.canceled || !result.filePaths?.length) return
      onUpdate({ imagePath: result.filePaths[0] })
    } catch { /* dialog canceled */ }
  }

  function addHotspot(shape: 'rect' | 'circle') {
    const hotspot: ImageMapHotspot = {
      id: uid('hotspot'),
      shape,
      coords: shape === 'rect' ? [50, 50, 150, 100] : [100, 100, 40],
      label: `Hotspot ${block.hotspots.length + 1}`,
      popupContent: ''
    }
    onUpdate({ hotspots: [...block.hotspots, hotspot] })
    setSelectedHotspot(hotspot.id)
  }

  function updateHotspot(id: string, partial: Partial<ImageMapHotspot>) {
    const hotspots = block.hotspots.map((h) => (h.id === id ? { ...h, ...partial } : h))
    onUpdate({ hotspots })
  }

  function removeHotspot(id: string) {
    onUpdate({ hotspots: block.hotspots.filter((h) => h.id !== id) })
    if (selectedHotspot === id) setSelectedHotspot(null)
  }

  function updateCoord(id: string, index: number, value: number) {
    const hotspot = block.hotspots.find((h) => h.id === id)
    if (!hotspot) return
    const coords = [...hotspot.coords]
    coords[index] = value
    updateHotspot(id, { coords })
  }

  return (
    <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-surface)] overflow-hidden" role="region" aria-label="Image map block editor">
      <div className="p-3 space-y-3">
        {/* Image upload */}
        <div>
          <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)] mb-1">Background Image</p>
          <div className="flex items-center gap-2">
            <button
              onClick={handleImageUpload}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-[var(--font-weight-medium)] rounded-md border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer"
            >
              <Upload size={12} /> Choose Image
            </button>
            <span className="text-xs text-[var(--text-tertiary)] truncate flex-1">
              {block.imagePath ? block.imagePath.split('/').pop() : 'No image selected'}
            </span>
          </div>
        </div>

        {/* Alt text */}
        <label className="block text-xs text-[var(--text-secondary)]">
          Image Alt Text
          <input
            type="text"
            value={block.imageAlt}
            onChange={(e) => onUpdate({ imageAlt: e.target.value })}
            className="mt-1 w-full px-2 py-1 text-sm rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            placeholder="Describe the image..."
          />
        </label>
        {!block.imageAlt && block.imagePath && (
          <p className="text-xs text-[var(--color-danger-600)]">Alt text is required for accessibility</p>
        )}

        {/* Hotspot controls */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-[var(--font-weight-medium)] text-[var(--text-secondary)]">
              Hotspots ({block.hotspots.length})
            </p>
            <button onClick={() => addHotspot('rect')} className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer">
              <Plus size={10} /> Rectangle
            </button>
            <button onClick={() => addHotspot('circle')} className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-muted)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] cursor-pointer">
              <Plus size={10} /> Circle
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {block.hotspots.map((hs) => (
              <div
                key={hs.id}
                className={`p-2 rounded border cursor-pointer ${selectedHotspot === hs.id ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)]' : 'border-[var(--border-default)] bg-[var(--bg-muted)]'}`}
                onClick={() => setSelectedHotspot(hs.id)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase text-[var(--text-tertiary)]">{hs.shape}</span>
                  <input
                    type="text"
                    value={hs.label}
                    onChange={(e) => updateHotspot(hs.id, { label: e.target.value })}
                    className="flex-1 px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                    placeholder="Label"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button onClick={(e) => { e.stopPropagation(); removeHotspot(hs.id) }} className="p-0.5 text-[var(--text-tertiary)] hover:text-[var(--color-danger-600)] cursor-pointer">
                    <Trash2 size={12} />
                  </button>
                </div>

                {selectedHotspot === hs.id && (
                  <>
                    <div className="flex gap-1 mb-1">
                      {hs.coords.map((c, ci) => (
                        <input
                          key={ci}
                          type="number"
                          value={c}
                          onChange={(e) => updateCoord(hs.id, ci, parseInt(e.target.value) || 0)}
                          className="w-14 px-1 py-0.5 text-[10px] rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ))}
                    </div>
                    <textarea
                      value={hs.popupContent}
                      onChange={(e) => updateHotspot(hs.id, { popupContent: e.target.value })}
                      rows={2}
                      className="w-full px-1 py-0.5 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] resize-y"
                      placeholder="Popup content (HTML)..."
                      onClick={(e) => e.stopPropagation()}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
