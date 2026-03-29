import { ElectronAPI } from '@electron-toolkit/preload'

interface LuminaAPI {
  theme: {
    get(): Promise<string>
    set(theme: string): Promise<void>
  }
  dialog: {
    openFile(options?: Record<string, unknown>): Promise<Electron.OpenDialogReturnValue>
    saveFile(options?: Record<string, unknown>): Promise<Electron.SaveDialogReturnValue>
  }
  app: {
    getInfo(): Promise<{ name: string; version: string; platform: string; arch: string }>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: LuminaAPI
  }
}
