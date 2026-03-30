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
