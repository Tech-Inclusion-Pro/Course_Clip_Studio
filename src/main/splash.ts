import { BrowserWindow, app } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'

let splashWindow: BrowserWindow | null = null

export function createSplashWindow(): BrowserWindow {
  splashWindow = new BrowserWindow({
    width: 420,
    height: 340,
    frame: false,
    transparent: true,
    resizable: false,
    center: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  })

  const splashPath = is.dev
    ? join(__dirname, '../../resources/splash.html')
    : join(process.resourcesPath, 'splash.html')

  splashWindow.loadFile(splashPath)

  splashWindow.once('ready-to-show', () => {
    splashWindow?.show()
    // Inject version number
    const version = app.getVersion()
    splashWindow?.webContents.executeJavaScript(
      `document.getElementById('version').textContent = 'v${version}';`
    )
  })

  return splashWindow
}

export function closeSplashWindow(): void {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.close()
    splashWindow = null
  }
}

export function updateSplashStatus(message: string): void {
  if (splashWindow && !splashWindow.isDestroyed()) {
    splashWindow.webContents.executeJavaScript(
      `document.getElementById('status').textContent = '${message}';`
    )
  }
}
