import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  theme: {
    get: (): Promise<string> => ipcRenderer.invoke('theme:get'),
    set: (theme: string): Promise<void> => ipcRenderer.invoke('theme:set', theme)
  },
  dialog: {
    openFile: (options?: Record<string, unknown>) =>
      ipcRenderer.invoke('dialog:openFile', options),
    saveFile: (options?: Record<string, unknown>) =>
      ipcRenderer.invoke('dialog:saveFile', options),
    openDirectory: (): Promise<Electron.OpenDialogReturnValue> =>
      ipcRenderer.invoke('dialog:openDirectory')
  },
  app: {
    getInfo: (): Promise<{ name: string; version: string; platform: string; arch: string }> =>
      ipcRenderer.invoke('app:getInfo')
  },
  fs: {
    readFile: (filePath: string, encoding?: 'utf-8' | 'base64'): Promise<string> =>
      ipcRenderer.invoke('fs:readFile', filePath, encoding),
    readFileBuffer: (filePath: string): Promise<ArrayBuffer> =>
      ipcRenderer.invoke('fs:readFileBuffer', filePath),
    writeFile: (filePath: string, content: string): Promise<void> =>
      ipcRenderer.invoke('fs:writeFile', filePath, content),
    writeFileBuffer: (filePath: string, data: ArrayBuffer): Promise<void> =>
      ipcRenderer.invoke('fs:writeFileBuffer', filePath, data),
    readDir: (dirPath: string): Promise<Array<{ name: string; isDirectory: boolean }>> =>
      ipcRenderer.invoke('fs:readDir', dirPath),
    mkdir: (dirPath: string): Promise<void> =>
      ipcRenderer.invoke('fs:mkdir', dirPath),
    exists: (filePath: string): Promise<boolean> =>
      ipcRenderer.invoke('fs:exists', filePath),
    removeDir: (dirPath: string): Promise<void> =>
      ipcRenderer.invoke('fs:removeDir', dirPath)
  },
  settings: {
    get: (key: string): Promise<unknown> =>
      ipcRenderer.invoke('settings:get', key),
    set: (key: string, value: unknown): Promise<void> =>
      ipcRenderer.invoke('settings:set', key, value)
  },
  secrets: {
    get: (key: string): Promise<string | null> =>
      ipcRenderer.invoke('secrets:get', key),
    set: (key: string, value: string): Promise<void> =>
      ipcRenderer.invoke('secrets:set', key, value),
    delete: (key: string): Promise<void> =>
      ipcRenderer.invoke('secrets:delete', key)
  },
  pdf: {
    generate: (
      html: string,
      options?: {
        pageSize?: 'A4' | 'Letter'
        printBackground?: boolean
        margins?: { top: number; bottom: number; left: number; right: number }
      }
    ): Promise<ArrayBuffer> => ipcRenderer.invoke('pdf:generate', html, options)
  },
  net: {
    request: (opts: {
      url: string
      method?: string
      headers?: Record<string, string>
      body?: string
    }): Promise<{ status: number; statusText: string; headers: Record<string, string>; body: string }> =>
      ipcRenderer.invoke('net:request', opts),
    uploadFile: (opts: {
      url: string
      method?: string
      headers?: Record<string, string>
      fileData: ArrayBuffer
      fileName: string
      fieldName: string
      extraFields?: Record<string, string>
    }): Promise<{ status: number; statusText: string; body: string }> =>
      ipcRenderer.invoke('net:uploadFile', opts)
  },
  updater: {
    check: (): Promise<{ updateAvailable: boolean; version?: string }> =>
      ipcRenderer.invoke('updater:check'),
    download: (): Promise<void> =>
      ipcRenderer.invoke('updater:download'),
    install: (): Promise<void> =>
      ipcRenderer.invoke('updater:install'),
    onAvailable: (callback: (info: { version: string; releaseDate?: string }) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, info: { version: string; releaseDate?: string }): void => { callback(info) }
      ipcRenderer.on('updater:available', handler)
      return () => { ipcRenderer.removeListener('updater:available', handler) }
    },
    onProgress: (callback: (progress: { percent: number }) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, progress: { percent: number }): void => { callback(progress) }
      ipcRenderer.on('updater:progress', handler)
      return () => { ipcRenderer.removeListener('updater:progress', handler) }
    },
    onDownloaded: (callback: (info: { version: string }) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, info: { version: string }): void => { callback(info) }
      ipcRenderer.on('updater:downloaded', handler)
      return () => { ipcRenderer.removeListener('updater:downloaded', handler) }
    },
    onError: (callback: (error: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, error: string): void => { callback(error) }
      ipcRenderer.on('updater:error', handler)
      return () => { ipcRenderer.removeListener('updater:error', handler) }
    }
  },
  deepLink: {
    onOpenCourse: (callback: (coursePath: string) => void) => {
      const handler = (_event: Electron.IpcRendererEvent, path: string): void => { callback(path) }
      ipcRenderer.on('deep-link:open-course', handler)
      return () => { ipcRenderer.removeListener('deep-link:open-course', handler) }
    }
  }
}

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('electronAPI', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore
  window.electron = electronAPI
  // @ts-ignore
  window.electronAPI = api
}
