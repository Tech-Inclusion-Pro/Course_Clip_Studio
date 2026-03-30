import { app, shell, BrowserWindow, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerIpcHandlers } from './ipc-handlers'
import { createSplashWindow, closeSplashWindow, updateSplashStatus } from './splash'
import { initAutoUpdater } from './auto-updater'
import { registerProtocol, handleDeepLink, setPendingDeepLink, processPendingDeepLink } from './deep-link'

let mainWindow: BrowserWindow | null = null

// Register deep link protocol before app is ready
registerProtocol()

// Handle protocol URL on macOS (app already running)
app.on('open-url', (event, url) => {
  event.preventDefault()
  if (mainWindow) {
    handleDeepLink(url, mainWindow)
  } else {
    setPendingDeepLink(url)
  }
})

// Handle protocol URL on Windows/Linux (second instance)
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, argv) => {
    // Windows/Linux: protocol URL is in argv
    const url = argv.find((arg) => arg.startsWith('lumina://'))
    if (url) {
      handleDeepLink(url, mainWindow)
    }

    // Focus existing window
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    // Dismiss splash and show main window
    closeSplashWindow()
    mainWindow?.show()

    // Process any pending deep link
    if (mainWindow) {
      processPendingDeepLink(mainWindow)
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.course-clip-studio')

  // Show splash screen
  createSplashWindow()
  updateSplashStatus('Initializing...')

  // Production CSP
  if (!is.dev) {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      callback({
        responseHeaders: {
          ...details.responseHeaders,
          'Content-Security-Policy': [
            "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:"
          ]
        }
      })
    })
  }

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  updateSplashStatus('Loading workspace...')
  registerIpcHandlers()
  createWindow()

  // Initialize auto-updater after main window is created
  if (mainWindow) {
    initAutoUpdater(mainWindow)
  }

  // Handle cold-start protocol URL on Windows/Linux
  if (process.platform !== 'darwin') {
    const url = process.argv.find((arg) => arg.startsWith('lumina://'))
    if (url) {
      setPendingDeepLink(url)
    }
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
