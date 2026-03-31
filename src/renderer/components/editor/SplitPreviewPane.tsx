import { useState, useEffect, useMemo, useRef } from 'react'
import { Monitor, Tablet, Smartphone } from 'lucide-react'
import { useEditorStore, type PreviewDevice } from '@/stores/useEditorStore'
import { renderPreviewHtml } from '@/lib/preview/render-preview-html'
import type { Course, Lesson } from '@/types/course'

interface SplitPreviewPaneProps {
  course: Course
  lesson: Lesson
  moduleTitle: string
  lessonIndex: number
  totalLessons: number
}

const DEVICE_WIDTHS: Record<PreviewDevice, string> = {
  desktop: '100%',
  tablet: '768px',
  mobile: '375px'
}

export function SplitPreviewPane({
  course,
  lesson,
  moduleTitle,
  lessonIndex,
  totalLessons
}: SplitPreviewPaneProps): JSX.Element {
  const previewDevice = useEditorStore((s) => s.previewDevice)
  const setPreviewDevice = useEditorStore((s) => s.setPreviewDevice)
  const [debouncedHtml, setDebouncedHtml] = useState('')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const html = useMemo(
    () => renderPreviewHtml(course, lesson, moduleTitle, lessonIndex, totalLessons),
    [course, lesson, moduleTitle, lessonIndex, totalLessons]
  )

  // Debounce HTML updates
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedHtml(html), 300)
    return () => clearTimeout(timer)
  }, [html])

  return (
    <div className="flex flex-col h-full border-l border-[var(--border-default)] bg-[var(--bg-muted)]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-default)] bg-[var(--bg-surface)] shrink-0">
        <span className="text-[10px] font-[var(--font-weight-semibold)] text-[var(--text-tertiary)] uppercase tracking-wider">
          Preview
        </span>
        <div className="flex items-center gap-0.5">
          {([
            { mode: 'desktop' as PreviewDevice, icon: Monitor },
            { mode: 'tablet' as PreviewDevice, icon: Tablet },
            { mode: 'mobile' as PreviewDevice, icon: Smartphone }
          ]).map(({ mode, icon: Icon }) => (
            <button
              key={mode}
              onClick={() => setPreviewDevice(mode)}
              aria-pressed={previewDevice === mode}
              className={`p-1 rounded cursor-pointer transition-colors ${
                previewDevice === mode
                  ? 'bg-[var(--bg-active)] text-[var(--text-brand)]'
                  : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Icon size={12} />
            </button>
          ))}
        </div>
      </div>

      {/* iframe */}
      <div className="flex-1 flex items-start justify-center overflow-auto p-2">
        <div
          className="bg-white rounded shadow overflow-hidden h-full"
          style={{ width: DEVICE_WIDTHS[previewDevice], maxWidth: '100%' }}
        >
          <iframe
            ref={iframeRef}
            srcDoc={debouncedHtml}
            title="Split preview"
            className="w-full h-full border-0"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  )
}
