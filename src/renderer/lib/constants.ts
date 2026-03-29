export const APP_NAME = 'LuminaUDL'
export const APP_VERSION = '0.1.0'

export const ROUTES = {
  DASHBOARD: '/',
  EDITOR: '/editor',
  PREVIEW: '/preview',
  SETTINGS: '/settings',
  PUBLISH: '/publish'
} as const

export const NAV_ITEMS = [
  { path: ROUTES.DASHBOARD, label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: ROUTES.EDITOR, label: 'Editor', icon: 'PenTool' },
  { path: ROUTES.PREVIEW, label: 'Preview', icon: 'Eye' },
  { path: ROUTES.SETTINGS, label: 'Settings', icon: 'Settings' },
  { path: ROUTES.PUBLISH, label: 'Publish', icon: 'Upload' }
] as const
