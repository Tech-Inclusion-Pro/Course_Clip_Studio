import { ElectronAPI } from '@electron-toolkit/preload'

interface LuminaAPI {
  theme: {
    get(): Promise<string>
    set(theme: string): Promise<void>
  }
  dialog: {
    openFile(options?: Record<string, unknown>): Promise<Electron.OpenDialogReturnValue>
    saveFile(options?: Record<string, unknown>): Promise<Electron.SaveDialogReturnValue>
    openDirectory(): Promise<Electron.OpenDialogReturnValue>
  }
  app: {
    getInfo(): Promise<{ name: string; version: string; platform: string; arch: string }>
  }
  fs: {
    readFile(filePath: string, encoding?: 'utf-8' | 'base64'): Promise<string>
    readFileBuffer(filePath: string): Promise<ArrayBuffer>
    writeFile(filePath: string, content: string): Promise<void>
    readDir(dirPath: string): Promise<Array<{ name: string; isDirectory: boolean }>>
    mkdir(dirPath: string): Promise<void>
    exists(filePath: string): Promise<boolean>
    removeDir(dirPath: string): Promise<void>
  }
  settings: {
    get(key: string): Promise<unknown>
    set(key: string, value: unknown): Promise<void>
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
