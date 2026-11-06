import { useTasksStore } from '../store/tasks'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { useThemeStore } from '../store/theme'
import { useFoxSkinsStore } from '../store/foxSkins'
import { useNotesStore } from '../store/notes'
import { useSeasonsStore } from '../store/seasons'
import { useOfflineStore } from '../store/offline'
import { useUIStore } from '../store/ui'
import { cancelReminder } from './notifications'
import { getUid } from './session'

const KEEP = new Set(['task-lex-tutorial', 'task-lex-custom-app-colors'])
const THEME_PREFIX = 'task-lex-theme-'

export function themeCacheKey(uid: string | null): string | null {
  return uid ? `${THEME_PREFIX}${uid}` : null
}

export function saveThemeCache(uid: string | null, appThemeId: string, accentThemeId: string) {
  const k = themeCacheKey(uid)
  if (!k) return
  try {
    localStorage.setItem(k, JSON.stringify({ appThemeId, accentThemeId }))
  } catch {}
}

export function loadThemeCache(uid: string | null): { appThemeId: string; accentThemeId: string } | null {
  const k = themeCacheKey(uid)
  if (!k) return null
  try {
    const raw = localStorage.getItem(k)
    if (!raw) return null
    const o = JSON.parse(raw) as { appThemeId?: unknown; accentThemeId?: unknown }
    if (typeof o.appThemeId === 'string' && typeof o.accentThemeId === 'string') {
      return { appThemeId: o.appThemeId, accentThemeId: o.accentThemeId }
    }
  } catch {}
  return null
}

export function resetUserData() {
  try {
    const tasks = useTasksStore.getState().tasks
    for (const t of tasks) cancelReminder(t.id)
  } catch {}
  try {
    const s = useSettingsStore.getState()
    saveThemeCache(getUid(), s.appThemeId, s.accentThemeId)
  } catch {}
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('task-lex') && !KEEP.has(k) && !k.startsWith(THEME_PREFIX))
      .forEach((k) => localStorage.removeItem(k))
  } catch {}
  try {
    useTasksStore.persist.rehydrate()
    useSectionsStore.persist.rehydrate()
    useSettingsStore.persist.rehydrate()
    useThemeStore.persist.rehydrate()
    useFoxSkinsStore.persist.rehydrate()
    useNotesStore.persist.rehydrate()
    useSeasonsStore.persist.rehydrate()
    useOfflineStore.persist.rehydrate()
    useUIStore.persist.rehydrate()
  } catch {}
}