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
      ipcRenderer.invoke('dialog:saveFile', options)
  },
  app: {
    getInfo: (): Promise<{ name: string; version: string; platform: string; arch: string }> =>
      ipcRenderer.invoke('app:getInfo')
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
