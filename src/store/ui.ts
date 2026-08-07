import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ViewMode } from '../types/task'

interface UIState {
  views: Record<string, ViewMode>
  sidebarOpen: boolean
  focusOpen: boolean
  setView: (id: string, view: ViewMode) => void
  openSidebar: () => void
  closeSidebar: () => void
  openFocus: () => void
  closeFocus: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      views: {},
      sidebarOpen: false,
      focusOpen: false,
      setView: (id, view) => set((s) => ({ views: { ...s.views, [id]: view } })),
      openSidebar: () => set({ sidebarOpen: true }),
      closeSidebar: () => set({ sidebarOpen: false }),
      openFocus: () => set({ focusOpen: true }),
      closeFocus: () => set({ focusOpen: false }),
    }),
    { name: 'task-lex-ui', partialize: (s) => ({ views: s.views }) },
  ),
)
