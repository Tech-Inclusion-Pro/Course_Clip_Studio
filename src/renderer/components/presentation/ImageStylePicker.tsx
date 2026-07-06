import { usePresentationStore } from '@/stores/usePresentationStore'
import type { ImageStyle } from '@/types/presentation'

const IMAGE_STYLES: Array<{ id: ImageStyle; label: string; desc: string }> = [
  { id: 'flat_vector', label: 'Flat Vector', desc: 'Clean illustrations' },
  { id: 'photographic', label: 'Photo', desc: 'Real photographs' },
  { id: 'diagram', label: 'Diagram', desc: 'Charts & diagrams' },
  { id: 'abstract_gradient', label: 'Abstract', desc: 'Gradient backgrounds' }
]

export function ImageStylePicker(): JSX.Element {
  const imageStyle = usePresentationStore((s) => s.activeDraft?.imageStyle ?? 'flat_vector')
  const setImageStyle = usePresentationStore((s) => s.setImageStyle)

  return (
    <div className="flex gap-2">
      {IMAGE_STYLES.map((style) => (
        <button
          key={style.id}
          onClick={() => setImageStyle(style.id)}
          className={`px-3 py-1.5 rounded-md border text-xs font-[var(--font-weight-medium)] cursor-pointer transition-colors ${
            imageStyle === style.id
              ? 'border-[var(--brand-magenta)] bg-[var(--bg-active)] text-[var(--text-brand)]'
              : 'border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          }`}
          title={style.desc}
        >
          {style.label}
        </button>
      ))}
    </div>
  )
}
