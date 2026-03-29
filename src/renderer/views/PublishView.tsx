import { Upload } from 'lucide-react'

export function PublishView(): JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <div
        className="
          w-16 h-16 mb-4 rounded-[var(--radius-xl)]
          bg-[var(--bg-muted)] flex items-center justify-center
        "
      >
        <Upload size={32} className="text-[var(--text-tertiary)]" />
      </div>
      <h2 className="text-lg font-[var(--font-weight-semibold)] text-[var(--text-primary)] mb-2">
        Publish Course
      </h2>
      <p className="text-sm text-[var(--text-secondary)] max-w-md">
        Export your course to SCORM, xAPI, HTML5, or PDF. Open a course first to configure export
        options.
      </p>
    </div>
  )
}
