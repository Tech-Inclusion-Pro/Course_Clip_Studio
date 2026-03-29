import { ipcMain, dialog, app } from 'electron'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'

function getConfigPath(): string {
  const configDir = join(app.getPath('userData'), 'config')
  if (!existsSync(configDir)) {
    mkdirSync(configDir, { recursive: true })
  }
  return join(configDir, 'settings.json')
}

function readConfig(): Record<string, unknown> {
  const configPath = getConfigPath()
  if (!existsSync(configPath)) return {}
  try {
    return JSON.parse(readFileSync(configPath, 'utf-8'))
  } catch {
    return {}
  }
}

function writeConfig(data: Record<string, unknown>): void {
  writeFileSync(getConfigPath(), JSON.stringify(data, null, 2))
}

export function registerIpcHandlers(): void {
  ipcMain.handle('theme:get', () => {
    const config = readConfig()
    return (config.theme as string) ?? 'system'
  })

  ipcMain.handle('theme:set', (_event, theme: string) => {
    const config = readConfig()
    config.theme = theme
    writeConfig(config)
  })

  ipcMain.handle('dialog:openFile', async (_event, options?: Electron.OpenDialogOptions) => {
    const result = await dialog.showOpenDialog(options ?? {})
    return result
  })

  ipcMain.handle('dialog:saveFile', async (_event, options?: Electron.SaveDialogOptions) => {
    const result = await dialog.showSaveDialog(options ?? {})
    return result
  })

  ipcMain.handle('app:getInfo', () => {
    return {
      name: app.getName(),
      version: app.getVersion(),
      platform: process.platform,
      arch: process.arch
    }
  })
}
