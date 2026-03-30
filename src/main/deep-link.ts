import { app, BrowserWindow } from 'electron'

const PROTOCOL = 'lumina'

let pendingDeepLink: string | null = null

/**
 * Register the lumina:// protocol as the default handler.
 * Must be called before app.whenReady().
 */
export function registerProtocol(): void {
  if (process.defaultApp) {
    // Dev mode: register with the path to electron + script
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [process.argv[1]])
    }
  } else {
    app.setAsDefaultProtocolClient(PROTOCOL)
  }
}

/**
 * Handle a deep link URL.
 * Parses lumina://open?course=<path> and sends it to the renderer.
 */
export function handleDeepLink(url: string, mainWindow: BrowserWindow | null): void {
  if (!url.startsWith(`${PROTOCOL}://`)) return

  try {
    const parsed = new URL(url)
    const action = parsed.hostname // e.g. "open"

    if (action === 'open') {
      const coursePath = parsed.searchParams.get('course')
      if (coursePath && mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('deep-link:open-course', coursePath)

        // Focus the window
        if (mainWindow.isMinimized()) mainWindow.restore()
        mainWindow.focus()
      }
    }
  } catch {
    // Invalid URL — ignore
  }
}

/**
 * Store a deep link for later processing (when app is cold-started via protocol).
 */
export function setPendingDeepLink(url: string): void {
  pendingDeepLink = url
}

/**
 * Process any pending deep link after the main window is ready.
 */
export function processPendingDeepLink(mainWindow: BrowserWindow): void {
  if (pendingDeepLink) {
    handleDeepLink(pendingDeepLink, mainWindow)
    pendingDeepLink = null
  }
}
