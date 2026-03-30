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
  fs: {
    readFile(filePath: string, encoding?: 'utf-8' | 'base64'): Promise<string>
    readFileBuffer(filePath: string): Promise<ArrayBuffer>
  }
  pdf: {
    generate(
      html: string,
      options?: {
        pageSize?: 'A4' | 'Letter'
        printBackground?: boolean
        margins?: { top: number; bottom: number; left: number; right: number }
      }
    ): Promise<ArrayBuffer>
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: LuminaAPI
  }
}
