import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_SECTIONS, makeSectionId } from '../lib/sections'
import { useThemeStore } from './theme'
import { useTasksStore } from './tasks'
import { getUid } from '../lib/session'
import { removeSectionRemote, setSectionMeta } from '../lib/taskDb'
import type { SectionMeta } from '../types/task'

interface SectionsState {
  sections: SectionMeta[]
  addSection: (label: string, icon: string) => string
  removeSection: (id: string) => void
  renameSection: (id: string, label: string) => void
  setIcon: (id: string, icon: string) => void
  reorderSections: (fromId: string, toId: string) => void
  syncRemote: (remote: SectionMeta[]) => void
}

export const useSectionsStore = create<SectionsState>()(
  persist(
    (set, get) => ({
      sections: DEFAULT_SECTIONS,
      addSection: (label, icon) => {
        const id = makeSectionId(label, get().sections.map((s) => s.id))
        const meta: SectionMeta = { id, label, icon, order: get().sections.length }
        set((s) => ({ sections: [...s.sections, meta] }))
        useThemeStore.getState().setTheme(id, {})
        const uid = getUid()
        if (uid) setSectionMeta(uid, meta).catch(() => {})
        return id
      },
      removeSection: (id) => {
        set((s) => ({ sections: s.sections.filter((x) => x.id !== id) }))
        useThemeStore.getState().removeTheme(id)
        useTasksStore.getState().deleteTasksBySection(id)
        const uid = getUid()
        if (uid) removeSectionRemote(uid, id).catch(() => {})
      },
      renameSection: (id, label) => {
        set((s) => ({
          sections: s.sections.map((x) => (x.id === id ? { ...x, label } : x)),
        }))
        const meta = get().sections.find((x) => x.id === id)
        const uid = getUid()
        if (uid && meta) setSectionMeta(uid, meta).catch(() => {})
      },
      setIcon: (id, icon) => {
        set((s) => ({
          sections: s.sections.map((x) => (x.id === id ? { ...x, icon } : x)),
        }))
        const meta = get().sections.find((x) => x.id === id)
        const uid = getUid()
        if (uid && meta) setSectionMeta(uid, meta).catch(() => {})
      },
      reorderSections: (fromId, toId) => {
        const list = [...get().sections]
        const from = list.findIndex((x) => x.id === fromId)
        const to = list.findIndex((x) => x.id === toId)
        if (from < 0 || to < 0 || from === to) return
        const [moved] = list.splice(from, 1)
        list.splice(to, 0, moved)
        const next = list.map((x, i) => ({ ...x, order: i }))
        set({ sections: next })
        const uid = getUid()
        if (uid) {
          next.forEach((meta) => setSectionMeta(uid, meta).catch(() => {}))
        }
      },
      syncRemote: (remote) =>
        set((s) => {
          const map = new Map(s.sections.map((x) => [x.id, x]))
          remote.forEach((r) => map.set(r.id, r))
          return { sections: Array.from(map.values()).sort((a, b) => a.order - b.order) }
        }),
    }),
    { name: 'task-lex-sections' },
  ),
)
