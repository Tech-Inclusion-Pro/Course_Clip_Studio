import { useState } from 'react'
import {
  X,
  History,
  Save,
  RotateCcw,
  Clock,
  Tag
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCourseStore } from '@/stores/useCourseStore'
import { useHistoryStore } from '@/stores/useHistoryStore'
import { serializeCourse, deserializeCourse } from '@/lib/course-helpers'

interface VersionHistoryPanelProps {
  onClose: () => void
}

export function VersionHistoryPanel({ onClose }: VersionHistoryPanelProps): JSX.Element {
  const course = useCourseStore((s) => s.courses.find((c) => c.id === s.activeCourseId))
  const activeCourseId = useCourseStore((s) => s.activeCourseId)
  const updateCourse = useCourseStore((s) => s.updateCourse)

  const undoStack = useHistoryStore((s) => s.undoStack)
  const pushSnapshot = useHistoryStore((s) => s.pushSnapshot)

  const [checkpointLabel, setCheckpointLabel] = useState('')
  const [confirmingId, setConfirmingId] = useState<string | null>(null)

  function handleSaveCheckpoint() {
    if (!course) return
    const label = checkpointLabel.trim() || 'Manual checkpoint'
    pushSnapshot(serializeCourse(course), label)
    setCheckpointLabel('')
  }

  function handleRestore(snapshotId: string) {
    if (confirmingId === snapshotId) {
      // Confirmed — restore
      const snapshot = undoStack.find((s) => s.id === snapshotId)
      if (snapshot && activeCourseId && course) {
        // Save current state first
        pushSnapshot(serializeCourse(course), 'Before restore')
        const restored = deserializeCourse(snapshot.courseJson)
        updateCourse(activeCourseId, restored)
      }
      setConfirmingId(null)
    } else {
      setConfirmingId(snapshotId)
    }
  }

  function formatTimestamp(iso: string): string {
    const date = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMin / 60)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Show snapshots newest first
  const snapshots = [...undoStack].reverse()

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-2">
          <History size={16} className="text-[var(--brand-indigo)]" />
          <h2 className="text-sm font-[var(--font-weight-semibold)] text-[var(--text-primary)]">
            Version History
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md cursor-pointer text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
          aria-label="Close version history"
        >
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Save Checkpoint */}
        <div className="space-y-2">
          <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)] block">
            Save Checkpoint
          </label>
          <div className="flex gap-1.5">
            <input
              type="text"
              value={checkpointLabel}
              onChange={(e) => setCheckpointLabel(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCheckpoint() }}
              placeholder="Checkpoint label..."
              className="flex-1 px-2.5 py-1.5 text-xs rounded-md border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--ring-brand)]"
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveCheckpoint}
              disabled={!course}
            >
              <Save size={14} />
              Save
            </Button>
          </div>
          <p className="text-[10px] text-[var(--text-tertiary)]">
            Auto-saves occur every 5 minutes while editing.
          </p>
        </div>

        {/* Snapshot list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-[var(--font-weight-semibold)] text-[var(--text-secondary)]">
              Snapshots ({snapshots.length})
            </label>
          </div>

          {snapshots.length === 0 ? (
            <div className="text-center py-8">
              <History size={24} className="mx-auto mb-2 text-[var(--text-tertiary)]" />
              <p className="text-xs text-[var(--text-tertiary)]">
                No snapshots yet. Save a checkpoint or wait for auto-save.
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {snapshots.map((snapshot) => (
                <div
                  key={snapshot.id}
                  className="p-2.5 rounded-lg border border-[var(--border-default)] hover:border-[var(--brand-indigo)]/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {snapshot.label === 'Auto-save' ? (
                          <Clock size={10} className="text-[var(--text-tertiary)] shrink-0" />
                        ) : (
                          <Tag size={10} className="text-[var(--brand-magenta)] shrink-0" />
                        )}
                        <span className={`text-xs font-[var(--font-weight-semibold)] truncate ${
                          snapshot.label === 'Auto-save'
                            ? 'text-[var(--text-secondary)]'
                            : 'text-[var(--text-primary)]'
                        }`}>
                          {snapshot.label}
                        </span>
                      </div>
                      <span className="text-[10px] text-[var(--text-tertiary)]">
                        {formatTimestamp(snapshot.timestamp)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRestore(snapshot.id)}
                      className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-[var(--font-weight-semibold)] cursor-pointer transition-colors ${
                        confirmingId === snapshot.id
                          ? 'bg-[var(--color-danger-600,#dc2626)] text-white'
                          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                      }`}
                      aria-label={confirmingId === snapshot.id ? 'Confirm restore' : `Restore to ${snapshot.label}`}
                      title={confirmingId === snapshot.id ? 'Click again to confirm' : 'Restore'}
                    >
                      <RotateCcw size={10} />
                      {confirmingId === snapshot.id ? 'Confirm?' : 'Restore'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
