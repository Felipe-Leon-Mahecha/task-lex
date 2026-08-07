import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUid } from '../lib/session'
import { setSectionTheme } from '../lib/taskDb'
import type { ThemeConfig } from '../types/task'

export const defaultTheme: ThemeConfig = {
  name: 'Dark & Gold',
  background: '#121212',
  surface: '#1c1c1c',
  accent: '#e0b563',
  text: '#f5f0e6',
  textMuted: '#9c9c9c',
  border: '#2c2c2c',
  borderRadius: 16,
  darkMode: true,
}

interface ThemeState {
  themes: Record<string, ThemeConfig>
  setTheme: (id: string, patch: Partial<ThemeConfig>) => void
  removeTheme: (id: string) => void
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themes: { trabajo: defaultTheme, universidad: defaultTheme, diario: defaultTheme },
      setTheme: (id, patch) => {
        const base = get().themes[id] ?? defaultTheme
        const next = { ...base, ...patch }
        set((s) => ({ themes: { ...s.themes, [id]: next } }))
        const uid = getUid()
        if (uid) setSectionTheme(uid, id, next).catch(() => {})
      },
      removeTheme: (id) =>
        set((s) => {
          const rest = { ...s.themes }
          delete rest[id]
          return { themes: rest }
        }),
    }),
    { name: 'task-lex-themes' },
  ),
)
