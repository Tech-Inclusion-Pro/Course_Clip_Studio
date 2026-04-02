import { ElectronAPI } from '@electron-toolkit/preload'

interface LuminaAPI {
  webUtils: {
    getPathForFile(file: File): string
  }
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
    writeFileBuffer(filePath: string, data: ArrayBuffer): Promise<void>
    readDir(dirPath: string): Promise<Array<{ name: string; isDirectory: boolean }>>
    mkdir(dirPath: string): Promise<void>
    exists(filePath: string): Promise<boolean>
    removeDir(dirPath: string): Promise<void>
  }
  settings: {
    get(key: string): Promise<unknown>
    set(key: string, value: unknown): Promise<void>
  }
  secrets: {
    get(key: string): Promise<string | null>
    set(key: string, value: string): Promise<void>
    delete(key: string): Promise<void>
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
  net: {
    request(opts: {
      url: string
      method?: string
      headers?: Record<string, string>
      body?: string
    }): Promise<{ status: number; statusText: string; headers: Record<string, string>; body: string }>
    uploadFile(opts: {
      url: string
      method?: string
      headers?: Record<string, string>
      fileData: ArrayBuffer
      fileName: string
      fieldName: string
      extraFields?: Record<string, string>
    }): Promise<{ status: number; statusText: string; body: string }>
  }
  updater: {
    check(): Promise<{ updateAvailable: boolean; version?: string }>
    download(): Promise<void>
    install(): Promise<void>
    onAvailable(callback: (info: { version: string; releaseDate?: string }) => void): () => void
    onProgress(callback: (progress: { percent: number }) => void): () => void
    onDownloaded(callback: (info: { version: string }) => void): () => void
    onError(callback: (error: string) => void): () => void
  }
  deepLink: {
    onOpenCourse(callback: (coursePath: string) => void): () => void
  }
}

declare global {
  interface Window {
    electron: ElectronAPI
    electronAPI: LuminaAPI
  }
}
