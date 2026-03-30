import { useState, useEffect } from 'react'
import { Download, RefreshCw, X } from 'lucide-react'

type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; version: string }
  | { status: 'downloading'; percent: number }
  | { status: 'downloaded'; version: string }
  | { status: 'error'; message: string }

export function UpdateBanner(): JSX.Element | null {
  const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle' })
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const cleanups: Array<() => void> = []

    cleanups.push(
      window.electronAPI.updater.onAvailable((info) => {
        setUpdateState({ status: 'available', version: info.version })
        setDismissed(false)
      })
    )

    cleanups.push(
      window.electronAPI.updater.onProgress((progress) => {
        setUpdateState({ status: 'downloading', percent: progress.percent })
      })
    )

    cleanups.push(
      window.electronAPI.updater.onDownloaded((info) => {
        setUpdateState({ status: 'downloaded', version: info.version })
        setDismissed(false)
      })
    )

    cleanups.push(
      window.electronAPI.updater.onError((error) => {
        setUpdateState({ status: 'error', message: error })
      })
    )

    return () => cleanups.forEach((c) => c())
  }, [])

  if (updateState.status === 'idle' || dismissed) return null

  return (
    <div className="flex items-center gap-3 px-4 py-2 text-sm border-b border-[var(--border-default)] bg-[var(--bg-surface)]">
      {updateState.status === 'available' && (
        <>
          <Download size={16} className="text-[var(--accent)]" />
          <span className="flex-1">
            Version {updateState.version} is available.
          </span>
          <button
            onClick={() => {
              window.electronAPI.updater.download()
              setUpdateState({ status: 'downloading', percent: 0 })
            }}
            className="px-3 py-1 rounded text-xs font-medium bg-[var(--accent)] text-white hover:opacity-90"
          >
            Download Update
          </button>
        </>
      )}

      {updateState.status === 'downloading' && (
        <>
          <RefreshCw size={16} className="text-[var(--accent)] animate-spin" />
          <span className="flex-1">
            Downloading update... {updateState.percent}%
          </span>
          <div className="w-32 h-1.5 rounded bg-[var(--border-default)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent)] transition-all duration-300"
              style={{ width: `${updateState.percent}%` }}
            />
          </div>
        </>
      )}

      {updateState.status === 'downloaded' && (
        <>
          <Download size={16} className="text-green-500" />
          <span className="flex-1">
            Version {updateState.version} is ready. Restart to apply.
          </span>
          <button
            onClick={() => window.electronAPI.updater.install()}
            className="px-3 py-1 rounded text-xs font-medium bg-green-600 text-white hover:opacity-90"
          >
            Restart Now
          </button>
        </>
      )}

      {updateState.status === 'error' && (
        <>
          <X size={16} className="text-red-500" />
          <span className="flex-1 text-red-500">
            Update error: {updateState.message}
          </span>
        </>
      )}

      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded hover:bg-[var(--bg-hover)]"
        aria-label="Dismiss update notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}
