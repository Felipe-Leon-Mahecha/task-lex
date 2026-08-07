import { create } from 'zustand'

interface TutorialState {
  open: boolean
  step: number
  start: () => void
  next: () => void
  close: () => void
}

const markSeen = () => {
  try {
    localStorage.setItem('task-lex-tutorial', '1')
  } catch {}
}
export const useTutorialStore = create<TutorialState>()((set) => ({
  open: false,
  step: 0,
  start: () => set({ open: true, step: 0 }),
  next: () => set((s) => ({ step: s.step + 1 })),
  close: () => {
    markSeen()
    set({ open: false })
  },
}))
