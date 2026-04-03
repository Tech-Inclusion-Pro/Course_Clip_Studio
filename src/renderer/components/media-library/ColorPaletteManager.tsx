import { useState, useEffect } from 'react'
import { X, Plus, Trash2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useMediaLibraryStore } from '@/stores/useMediaLibraryStore'
import { contrastRatio, formatRatio, contrastLabel } from '@/lib/contrast'

export function ColorPaletteManager({ onClose }: { onClose: () => void }): JSX.Element {
  const palettes = useMediaLibraryStore((s) => s.palettes)
  const addPalette = useMediaLibraryStore((s) => s.addPalette)
  const removePalette = useMediaLibraryStore((s) => s.removePalette)
  const addColorToPalette = useMediaLibraryStore((s) => s.addColorToPalette)
  const removeColorFromPalette = useMediaLibraryStore((s) => s.removeColorFromPalette)
  const loadPalettes = useMediaLibraryStore((s) => s.loadPalettes)

  const [newPaletteName, setNewPaletteName] = useState('')
  const [addingColor, setAddingColor] = useState<string | null>(null)
  const [newColorHex, setNewColorHex] = useState('#000000')
  const [newColorName, setNewColorName] = useState('')

  useEffect(() => {
    loadPalettes()
  }, [loadPalettes])

  function handleCreatePalette() {
    if (!newPaletteName.trim()) return
    addPalette(newPaletteName.trim())
    setNewPaletteName('')
  }

  function handleAddColor(paletteId: string) {
    if (!newColorHex) return
    addColorToPalette(paletteId, newColorHex, newColorName.trim() || newColorHex)
    setAddingColor(null)
    setNewColorHex('#000000')
    setNewColorName('')
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-[var(--bg-surface)] rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Color Palette Manager"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] shrink-0">
          <div className="flex items-center gap-2">
            <Palette size={16} className="text-[var(--text-brand)]" />
            <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
              Color Palette Manager
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-primary)] cursor-pointer"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {palettes.map((palette) => (
            <div
              key={palette.id}
              className="border border-[var(--border-default)] rounded-lg p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
                  {palette.name}
                  {palette.isSystem && (
                    <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-tertiary)]">
                      System
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1">
                  {!palette.isSystem && (
                    <button
                      onClick={() => removePalette(palette.id)}
                      className="p-1 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer"
                      aria-label={`Delete ${palette.name}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setAddingColor(addingColor === palette.id ? null : palette.id)
                      setNewColorHex('#000000')
                      setNewColorName('')
                    }}
                    className="p-1 rounded text-[var(--text-tertiary)] hover:text-[var(--text-brand)] cursor-pointer"
                    aria-label="Add color"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Colors grid */}
              {palette.colors.length === 0 ? (
                <p className="text-xs text-[var(--text-tertiary)]">No colors yet</p>
              ) : (
                <div className="space-y-1.5">
                  {palette.colors.map((color, idx) => {
                    const onWhite = contrastRatio(color.hex, '#ffffff')
                    const onBlack = contrastRatio(color.hex, '#000000')
                    const whiteLabel = onWhite ? contrastLabel(onWhite) : null
                    const blackLabel = onBlack ? contrastLabel(onBlack) : null

                    return (
                      <div key={idx} className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-md border border-[var(--border-default)] shrink-0"
                          style={{ backgroundColor: color.hex }}
                          title={color.hex}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-[var(--font-weight-medium)] text-[var(--text-primary)] truncate">
                              {color.name}
                            </span>
                            <span className="text-[10px] text-[var(--text-tertiary)] font-mono">
                              {color.hex}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            {onWhite && (
                              <span
                                className="text-[9px] px-1 rounded"
                                style={{
                                  color: whiteLabel?.color,
                                  backgroundColor: `${whiteLabel?.color}15`
                                }}
                              >
                                On white: {formatRatio(onWhite)} ({whiteLabel?.label})
                              </span>
                            )}
                            {onBlack && (
                              <span
                                className="text-[9px] px-1 rounded"
                                style={{
                                  color: blackLabel?.color,
                                  backgroundColor: `${blackLabel?.color}15`
                                }}
                              >
                                On black: {formatRatio(onBlack)} ({blackLabel?.label})
                              </span>
                            )}
                          </div>
                        </div>
                        {!palette.isSystem && (
                          <button
                            onClick={() => removeColorFromPalette(palette.id, idx)}
                            className="p-0.5 rounded text-[var(--text-tertiary)] hover:text-red-500 cursor-pointer shrink-0"
                            aria-label={`Remove ${color.name}`}
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add color form */}
              {addingColor === palette.id && (
                <div className="mt-2 flex items-end gap-2 pt-2 border-t border-[var(--border-default)]">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-0"
                    />
                    <input
                      type="text"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-20 px-1.5 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] font-mono focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
                      placeholder="#000000"
                    />
                  </div>
                  <input
                    type="text"
                    value={newColorName}
                    onChange={(e) => setNewColorName(e.target.value)}
                    className="flex-1 px-1.5 py-1 text-xs rounded border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--ring-brand)]"
                    placeholder="Color name"
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAddColor(palette.id) }}
                  />
                  <Button variant="primary" size="sm" onClick={() => handleAddColor(palette.id)}>
                    Add
                  </Button>
                </div>
              )}
            </div>
          ))}

          {/* Create new palette */}
          <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-default)]">
            <input
              type="text"
              value={newPaletteName}
              onChange={(e) => setNewPaletteName(e.target.value)}
              className="flex-1 px-2.5 py-1.5 text-sm rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
              placeholder="New palette name..."
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreatePalette() }}
            />
            <Button variant="primary" size="sm" onClick={handleCreatePalette}>
              <Plus size={14} />
              Create
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
