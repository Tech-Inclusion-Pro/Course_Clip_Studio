import { create } from 'zustand'
import type { PublishStatus } from '@/types/course'

export type DashboardSection = 'courses' | 'templates'

interface DashboardState {
  searchQuery: string
  statusFilter: PublishStatus | 'all'
  tagFilter: string | null
  activeSection: DashboardSection
  setSearchQuery: (query: string) => void
  setStatusFilter: (status: PublishStatus | 'all') => void
  setTagFilter: (tag: string | null) => void
  setActiveSection: (section: DashboardSection) => void
}

export const useDashboardStore = create<DashboardState>((set) => ({
  searchQuery: '',
  statusFilter: 'all',
  tagFilter: null,
  activeSection: 'courses',
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setTagFilter: (tag) => set((state) => ({ tagFilter: state.tagFilter === tag ? null : tag })),
  setActiveSection: (section) => set({ activeSection: section })
}))
