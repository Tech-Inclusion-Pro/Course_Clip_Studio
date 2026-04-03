import { MediaLibraryPanel } from '@/components/media-library/MediaLibraryPanel'

export function MediaLibrarySection(): JSX.Element {
  return (
    <div className="h-full">
      <div className="mb-4">
        <h2 className="text-2xl font-[var(--font-weight-bold)] text-[var(--text-primary)]">
          Media Library
        </h2>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          Browse, upload, and manage media assets for your courses
        </p>
      </div>
      <div
        className="border border-[var(--border-default)] rounded-xl bg-[var(--bg-surface)] overflow-hidden"
        style={{ height: 'calc(100vh - 14rem)' }}
      >
        <MediaLibraryPanel />
      </div>
    </div>
  )
}
