import { create } from 'zustand'
import type { Task } from '../types/task'

interface UndoAction {
  type: 'complete' | 'archive' | 'delete' | 'move'
  taskId: string
  previousState?: Partial<Task>
  timestamp: number
}

interface UndoState {
  actions: UndoAction[]
  addAction: (action: UndoAction) => void
  undoLast: () => UndoAction | null
  clear: () => void
}

export const useUndoStore = create<UndoState>((set, get) => ({
  actions: [],
  addAction: (action) => {
    set((s) => ({ actions: [action, ...s.actions].slice(0, 10) })) // Keep last 10 actions
  },
  undoLast: () => {
    const actions = get().actions
    if (actions.length === 0) return null
    const [last, ...rest] = actions
    set({ actions: rest })
    return last
  },
  clear: () => set({ actions: [] }),
}))
