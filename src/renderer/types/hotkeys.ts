export type HotkeyCategory = 'global' | 'recording' | 'slide-editor'

export type HotkeyContext =
  | 'global'
  | 'recording-panel'
  | 'slide-editor'
  | 'text-focused'
  | 'modal-open'

export interface PlatformKeybinding {
  mac: string
  windows: string
  linux: string
}

export interface HotkeyDefinition {
  id: string
  label: string
  description: string
  category: HotkeyCategory
  context: HotkeyContext
  default: PlatformKeybinding
  current: PlatformKeybinding
  isRemappable: boolean
  requiresConfirm: boolean
  wcagRequired: boolean
}

export type HotkeyMap = Record<string, HotkeyDefinition>
