import { BrowserWindow, ipcMain } from 'electron'
import { is } from '@electron-toolkit/utils'

let mainWindow: BrowserWindow | null = null

export function initAutoUpdater(win: BrowserWindow): void {
  mainWindow = win

  // Don't check for updates in dev mode
  if (is.dev) return

  // electron-updater may not be available in packaged builds
  // if node_modules is excluded from the asar bundle
  let autoUpdater: typeof import('electron-updater').autoUpdater
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    autoUpdater = require('electron-updater').autoUpdater
  } catch {
    console.warn('electron-updater not available, auto-updates disabled')
    registerNoopHandlers()
    return
  }

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('checking-for-update', () => {
    sendToRenderer('updater:checking')
  })

  autoUpdater.on('update-available', (info) => {
    sendToRenderer('updater:available', {
      version: info.version,
      releaseDate: info.releaseDate
    })
  })

  autoUpdater.on('update-not-available', () => {
    sendToRenderer('updater:not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    sendToRenderer('updater:progress', {
      percent: Math.round(progress.percent),
      bytesPerSecond: progress.bytesPerSecond,
      transferred: progress.transferred,
      total: progress.total
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    sendToRenderer('updater:downloaded', {
      version: info.version
    })
  })

  autoUpdater.on('error', (err) => {
    sendToRenderer('updater:error', err.message)
  })

  // IPC handlers for renderer to control updates
  ipcMain.handle('updater:check', async () => {
    try {
      const result = await autoUpdater.checkForUpdates()
      return {
        updateAvailable: !!result?.updateInfo,
        version: result?.updateInfo?.version
      }
    } catch {
      return { updateAvailable: false }
    }
  })

  ipcMain.handle('updater:download', async () => {
    await autoUpdater.downloadUpdate()
  })

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall(false, true)
  })

  // Check for updates after a short delay
  setTimeout(() => {
    autoUpdater.checkForUpdates().catch(() => {
      // Silently fail — no network or no releases
    })
  }, 5000)
}

function registerNoopHandlers(): void {
  ipcMain.handle('updater:check', async () => ({ updateAvailable: false }))
  ipcMain.handle('updater:download', async () => {})
  ipcMain.handle('updater:install', () => {})
}

function sendToRenderer(channel: string, data?: unknown): void {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data)
  }
}
