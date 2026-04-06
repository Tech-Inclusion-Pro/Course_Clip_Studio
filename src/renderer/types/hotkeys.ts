export type HotkeyCategory =
  | 'global'
  | 'recording'
  | 'slide-editor'
  | 'timeline'
  | 'text'
  | 'media'
  | 'syllabus'
  | 'export'
  | 'accessibility'

export type HotkeyContext =
  | 'global'
  | 'recording-panel'
  | 'slide-editor'
  | 'timeline'
  | 'text-focused'
  | 'media-library'
  | 'syllabus-builder'
  | 'export-panel'
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

export type Platform = 'mac' | 'windows' | 'linux'

export interface ConflictResult {
  hasConflict: boolean
  conflictingActionId?: string
  conflictingActionLabel?: string
  conflictContext?: HotkeyContext
  isCrossContext: boolean
}

export interface ImportResult {
  success: boolean
  appliedCount: number
  skippedCount: number
  conflicts: ConflictResult[]
}

export interface HotkeyExportFile {
  version: string
  platform: Platform
  exportedAt: string
  bindings: Record<string, string>
}
