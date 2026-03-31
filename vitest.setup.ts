import '@testing-library/jest-dom'

// Mock window.electronAPI
const mockElectronAPI = {
  theme: { get: vi.fn().mockResolvedValue('system'), set: vi.fn().mockResolvedValue(undefined) },
  dialog: { openFile: vi.fn(), saveFile: vi.fn(), openDirectory: vi.fn() },
  app: { getInfo: vi.fn().mockResolvedValue({ name: 'Test', version: '0.1.0', platform: 'darwin', arch: 'arm64' }) },
  fs: {
    readFile: vi.fn().mockResolvedValue(''),
    readFileBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(0)),
    writeFile: vi.fn().mockResolvedValue(undefined),
    writeFileBuffer: vi.fn().mockResolvedValue(undefined),
    readDir: vi.fn().mockResolvedValue([]),
    mkdir: vi.fn().mockResolvedValue(undefined),
    exists: vi.fn().mockResolvedValue(false),
    removeDir: vi.fn().mockResolvedValue(undefined)
  },
  settings: { get: vi.fn().mockResolvedValue(null), set: vi.fn().mockResolvedValue(undefined) },
  pdf: { generate: vi.fn().mockResolvedValue(new ArrayBuffer(0)) },
  net: { request: vi.fn(), uploadFile: vi.fn() },
  updater: { check: vi.fn(), download: vi.fn(), install: vi.fn(), onAvailable: vi.fn(), onProgress: vi.fn(), onDownloaded: vi.fn(), onError: vi.fn() },
  deepLink: { onOpenCourse: vi.fn() }
}

Object.defineProperty(window, 'electronAPI', { value: mockElectronAPI, writable: true })
