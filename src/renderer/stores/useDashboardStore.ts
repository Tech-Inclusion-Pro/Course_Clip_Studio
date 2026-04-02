import { create } from 'zustand'
import type { PublishStatus } from '@/types/course'

export type DashboardSection = 'courses' | 'templates' | 'content-areas' | 'syllabus'

interface DashboardState {
  searchQuery: string
  statusFilter: PublishStatus | 'all'
  tagFilter: string | null
  activeSection: DashboardSection
  sidebarCollapsed: boolean
  setSearchQuery: (query: string) => void
  setStatusFilter: (status: PublishStatus | 'all') => void
  setTagFilter: (tag: string | null) => void
  setActiveSection: (section: DashboardSection) => void
  toggleSidebar: () => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  searchQuery: '',
  statusFilter: 'all',
  tagFilter: null,
  activeSection: 'courses',
  sidebarCollapsed: false,
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setTagFilter: (tag) => set((state) => ({ tagFilter: state.tagFilter === tag ? null : tag })),
  setActiveSection: (section) => set({ activeSection: section }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}))
