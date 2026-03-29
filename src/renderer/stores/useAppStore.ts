import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark' | 'system'

interface AppState {
  theme: ThemeMode
  sidebarCollapsed: boolean
  setTheme: (theme: ThemeMode) => void
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  theme: 'system',
  sidebarCollapsed: false,
  setTheme: (theme) => set({ theme }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed })
}))
