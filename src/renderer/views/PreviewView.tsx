import { Eye } from 'lucide-react'

export function PreviewView(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div
        className="
          w-16 h-16 mb-4 rounded-[var(--radius-xl)]
          bg-[var(--bg-muted)] flex items-center justify-center
        "
      >
        <Eye size={32} className="text-[var(--text-tertiary)]" />
      </div>
      <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
        Course Preview
      </h2>
      <p className="text-sm text-[var(--text-secondary)] max-w-md">
        Preview how your course will appear to learners. Open a course in the editor first.
      </p>
    </div>
  )
}
