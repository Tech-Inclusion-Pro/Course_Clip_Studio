import { ipcMain, dialog, app, BrowserWindow, net } from 'electron'
import { readFileSync, readFile, writeFileSync, existsSync, mkdirSync, readdirSync, statSync, rmSync } from 'fs'
import { join, dirname } from 'path'

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

  // Read a file as text (UTF-8) or binary (base64)
  ipcMain.handle(
    'fs:readFile',
    async (_event, filePath: string, encoding?: 'utf-8' | 'base64') => {
      return new Promise<string>((resolve, reject) => {
        if (encoding === 'base64') {
          readFile(filePath, (err, data) => {
            if (err) return reject(err.message)
            resolve(data.toString('base64'))
          })
        } else {
          readFile(filePath, 'utf-8', (err, data) => {
            if (err) return reject(err.message)
            resolve(data)
          })
        }
      })
    }
  )

  // Read a file as an ArrayBuffer (for binary formats like PPTX)
  ipcMain.handle('fs:readFileBuffer', async (_event, filePath: string) => {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      readFile(filePath, (err, data) => {
        if (err) return reject(err.message)
        resolve(data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength))
      })
    })
  })

  // Generate PDF from HTML using a hidden BrowserWindow
  ipcMain.handle(
    'pdf:generate',
    async (
      _event,
      html: string,
      options?: {
        pageSize?: 'A4' | 'Letter'
        printBackground?: boolean
        margins?: { top: number; bottom: number; left: number; right: number }
      }
    ) => {
      const win = new BrowserWindow({
        show: false,
        width: 800,
        height: 600,
        webPreferences: { offscreen: true }
      })

      try {
        await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
        // Wait for content to render
        await new Promise((resolve) => setTimeout(resolve, 500))

        const pdfBuffer = await win.webContents.printToPDF({
          pageSize: options?.pageSize ?? 'A4',
          printBackground: options?.printBackground ?? true,
          margins: options?.margins
            ? {
                marginType: 'custom',
                top: options.margins.top / 25.4,
                bottom: options.margins.bottom / 25.4,
                left: options.margins.left / 25.4,
                right: options.margins.right / 25.4
              }
            : { marginType: 'default' }
        })

        return pdfBuffer
      } finally {
        win.close()
      }
    }
  )

  // ─── File System Helpers ───

  ipcMain.handle('fs:writeFile', async (_event, filePath: string, content: string) => {
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(filePath, content, 'utf-8')
  })

  ipcMain.handle('fs:writeFileBuffer', async (_event, filePath: string, data: ArrayBuffer) => {
    const dir = dirname(filePath)
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
    }
    writeFileSync(filePath, Buffer.from(data))
  })

  ipcMain.handle('fs:readDir', async (_event, dirPath: string) => {
    if (!existsSync(dirPath)) return []
    const entries = readdirSync(dirPath)
    return entries.map((name) => {
      const fullPath = join(dirPath, name)
      const stat = statSync(fullPath)
      return { name, isDirectory: stat.isDirectory() }
    })
  })

  ipcMain.handle('fs:mkdir', async (_event, dirPath: string) => {
    mkdirSync(dirPath, { recursive: true })
  })

  ipcMain.handle('fs:exists', async (_event, filePath: string) => {
    return existsSync(filePath)
  })

  ipcMain.handle('fs:removeDir', async (_event, dirPath: string) => {
    if (existsSync(dirPath)) {
      rmSync(dirPath, { recursive: true, force: true })
    }
  })

  // ─── Directory Picker ───

  ipcMain.handle('dialog:openDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    return result
  })

  // ─── Settings Persistence ───

  ipcMain.handle('settings:get', async (_event, key: string) => {
    const config = readConfig()
    return config[key] ?? null
  })

  ipcMain.handle('settings:set', async (_event, key: string, value: unknown) => {
    const config = readConfig()
    config[key] = value
    writeConfig(config)
  })

  // ─── HTTP Requests (for LMS API calls, bypasses CORS) ───

  ipcMain.handle(
    'net:request',
    async (
      _event,
      opts: {
        url: string
        method?: string
        headers?: Record<string, string>
        body?: string
      }
    ): Promise<{ status: number; statusText: string; headers: Record<string, string>; body: string }> => {
      return new Promise((resolve, reject) => {
        try {
          const request = net.request({
            url: opts.url,
            method: (opts.method ?? 'GET') as 'GET' | 'POST' | 'PUT' | 'DELETE'
          })

          if (opts.headers) {
            for (const [key, value] of Object.entries(opts.headers)) {
              request.setHeader(key, value)
            }
          }

          let responseBody = ''
          let responseHeaders: Record<string, string> = {}

          request.on('response', (response) => {
            const rawHeaders = response.headers
            for (const [key, value] of Object.entries(rawHeaders)) {
              responseHeaders[key] = Array.isArray(value) ? value.join(', ') : (value as string)
            }

            response.on('data', (chunk: Buffer) => {
              responseBody += chunk.toString()
            })

            response.on('end', () => {
              resolve({
                status: response.statusCode,
                statusText: response.statusMessage ?? '',
                headers: responseHeaders,
                body: responseBody
              })
            })
          })

          request.on('error', (err) => {
            reject(err.message)
          })

          if (opts.body) {
            request.write(opts.body)
          }

          request.end()
        } catch (err) {
          reject(err instanceof Error ? err.message : 'Network request failed')
        }
      })
    }
  )

  // Upload file with multipart/form-data (for LMS SCORM package upload)
  ipcMain.handle(
    'net:uploadFile',
    async (
      _event,
      opts: {
        url: string
        method?: string
        headers?: Record<string, string>
        fileData: ArrayBuffer
        fileName: string
        fieldName: string
        extraFields?: Record<string, string>
      }
    ): Promise<{ status: number; statusText: string; body: string }> => {
      return new Promise((resolve, reject) => {
        try {
          const boundary = '----LuminaBoundary' + Date.now().toString(36)
          const fileBuffer = Buffer.from(opts.fileData)

          // Build multipart body
          const parts: Buffer[] = []

          // Extra form fields
          if (opts.extraFields) {
            for (const [key, value] of Object.entries(opts.extraFields)) {
              parts.push(Buffer.from(
                `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
              ))
            }
          }

          // File field
          parts.push(Buffer.from(
            `--${boundary}\r\nContent-Disposition: form-data; name="${opts.fieldName}"; filename="${opts.fileName}"\r\nContent-Type: application/zip\r\n\r\n`
          ))
          parts.push(fileBuffer)
          parts.push(Buffer.from(`\r\n--${boundary}--\r\n`))

          const body = Buffer.concat(parts)

          const request = net.request({
            url: opts.url,
            method: (opts.method ?? 'POST') as 'POST' | 'PUT'
          })

          request.setHeader('Content-Type', `multipart/form-data; boundary=${boundary}`)
          request.setHeader('Content-Length', String(body.length))

          if (opts.headers) {
            for (const [key, value] of Object.entries(opts.headers)) {
              request.setHeader(key, value)
            }
          }

          let responseBody = ''

          request.on('response', (response) => {
            response.on('data', (chunk: Buffer) => {
              responseBody += chunk.toString()
            })

            response.on('end', () => {
              resolve({
                status: response.statusCode,
                statusText: response.statusMessage ?? '',
                body: responseBody
              })
            })
          })

          request.on('error', (err) => {
            reject(err.message)
          })

          request.write(body)
          request.end()
        } catch (err) {
          reject(err instanceof Error ? err.message : 'Upload failed')
        }
      })
    }
  )
}
