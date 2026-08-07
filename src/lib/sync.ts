import { collection, getDoc, getDocs, onSnapshot, writeBatch, type Firestore } from 'firebase/firestore'
import { db } from './firebase'
import { focusDoc, sectionDoc, settingsDoc, taskDoc, toFirestore, saveFocusLog, saveSettings } from './taskDb'
import { useTasksStore } from '../store/tasks'
import { defaultTheme, useThemeStore } from '../store/theme'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { cancelReminder, scheduleReminder } from './notifications'
import { migrateSectionId } from './sections'
import { getFocusLog, mergeRemoteFocus } from './focusStats'
import type { SectionMeta, Task, ThemeConfig } from '../types/task'

let unsubs: (() => void)[] = []

function reviveTask(id: string, data: Record<string, unknown>): Task {
  const d = data as unknown as Record<string, string | null | number | boolean | unknown[]>
  return {
    ...(d as unknown as Task),
    id,
    sectionId: migrateSectionId((d as { sectionId?: string }).sectionId ?? ''),
    images: Array.isArray((d as { images?: unknown }).images) ? ((d as { images: string[] }).images) : [],
    dueDate: d.dueDate ? new Date(d.dueDate as string) : null,
    createdAt: new Date(d.createdAt as string),
    updatedAt: new Date(d.updatedAt as string),
    completedAt: d.completedAt ? new Date(d.completedAt as string) : null,
  }
}

function mergeTheme(id: string, remote: Partial<ThemeConfig>) {
  useThemeStore.setState((s) => ({
    themes: { ...s.themes, [id]: { ...defaultTheme, ...s.themes[id], ...remote } },
  }))
}

export async function startSync(uid: string) {
  stopSync()
  if (!db) return
  const fdb = db
  await migrateLegacySections(uid, fdb)
  await syncSettingsAndFocus(uid)

  try {
    const snap = await getDocs(collection(fdb, 'users', uid, 'tasks'))
    const existing = new Set(snap.docs.map((d) => d.id))
    const local = useTasksStore.getState().tasks.filter((t) => !existing.has(t.id))
    if (local.length > 0) {
      const batch = writeBatch(fdb)
      local.forEach((t) => batch.set(taskDoc(uid, t.id), toFirestore(t)))
      await batch.commit()
    }
  } catch {
    // offline: se continúa con datos locales
  }

  let firstSnapshot = true
  unsubs.push(
    onSnapshot(collection(fdb, 'users', uid, 'tasks'), (snap) => {
      const tasks = snap.docs.map((d) => reviveTask(d.id, d.data() as Record<string, unknown>))
      useTasksStore.setState({ tasks })
      if (firstSnapshot) {
        firstSnapshot = false
        rescheduleReminders()
      }
    }),
  )

  unsubs.push(
    onSnapshot(collection(fdb, 'users', uid, 'sections'), (snap) => {
      const remote = snap.docs.map((d) => {
        const data = d.data() as Record<string, unknown>
        const theme = data.theme as Partial<ThemeConfig> | undefined
        const id = migrateSectionId(d.id)
        if (theme) mergeTheme(id, theme)
        return {
          id,
          label: typeof data.label === 'string' ? data.label : id,
          icon: typeof data.icon === 'string' ? data.icon : 'star',
          order: typeof data.order === 'number' ? data.order : 0,
        } as SectionMeta
      })
      const local = useSectionsStore.getState().sections
      const missing = local.filter((s) => !remote.some((r) => r.id === s.id))
      if (missing.length > 0) {
        const batch = writeBatch(fdb)
        missing.forEach((s) =>
          batch.set(
            sectionDoc(uid, s.id),
            {
              id: s.id,
              label: s.label,
              icon: s.icon,
              order: s.order,
              theme: useThemeStore.getState().themes[s.id] ?? defaultTheme,
            },
            { merge: true },
          ),
        )
        batch.commit().catch(() => {})
      }
      if (remote.length > 0) useSectionsStore.getState().syncRemote(remote)
    }),
  )
}

export function stopSync() {
  unsubs.forEach((u) => u())
  unsubs = []
}

async function migrateLegacySections(uid: string, fdb: Firestore) {
  try {
    const batch = writeBatch(fdb)
    let changed = false
    const tasksSnap = await getDocs(collection(fdb, 'users', uid, 'tasks'))
    for (const d of tasksSnap.docs) {
      const sid = (d.data().sectionId as string) ?? ''
      const next = migrateSectionId(sid)
      if (next !== sid) {
        batch.update(d.ref, { sectionId: next })
        changed = true
      }
    }
    const sectionsSnap = await getDocs(collection(fdb, 'users', uid, 'sections'))
    for (const d of sectionsSnap.docs) {
      const next = migrateSectionId(d.id)
      if (next !== d.id) {
        const data = d.data()
        const theme = data.theme as Partial<ThemeConfig> | undefined
        if (theme) batch.set(sectionDoc(uid, next), { theme }, { merge: true })
        batch.delete(d.ref)
        changed = true
      }
    }
    if (changed) await batch.commit()
  } catch {
    // offline: la migración se reintenta en el siguiente inicio
  }
}

async function syncSettingsAndFocus(uid: string) {
  try {
    const s = await getDoc(settingsDoc(uid))
    if (s.exists()) {
      const d = s.data()
      const cur = useSettingsStore.getState()
      useSettingsStore.setState({
        dailyGoal: typeof d.dailyGoal === 'number' ? d.dailyGoal : cur.dailyGoal,
        focusMinutes: typeof d.focusMinutes === 'number' ? d.focusMinutes : cur.focusMinutes,
        shortBreak: typeof d.shortBreak === 'number' ? d.shortBreak : cur.shortBreak,
        notificationsOn: typeof d.notificationsOn === 'boolean' ? d.notificationsOn : cur.notificationsOn,
      })
    } else {
      const cur = useSettingsStore.getState()
      saveSettings(uid, {
        dailyGoal: cur.dailyGoal,
        focusMinutes: cur.focusMinutes,
        shortBreak: cur.shortBreak,
        notificationsOn: cur.notificationsOn,
      }).catch(() => {})
    }
    const f = await getDoc(focusDoc(uid))
    if (f.exists()) {
      const entries = f.data().entries as { d: string; min: number }[] | undefined
      if (Array.isArray(entries)) mergeRemoteFocus(entries)
    } else {
      saveFocusLog(uid, getFocusLog()).catch(() => {})
    }
  } catch {
    // offline: los ajustes locales se suben en el siguiente inicio
  }
}

function rescheduleReminders() {
  const tasks = useTasksStore.getState().tasks
  for (const t of tasks) {
    if (!t.dueDate || !t.reminderLead) continue
    if (t.status === 'done' || t.archived) {
      cancelReminder(t.id)
    } else {
      scheduleReminder(t).catch(() => {})
    }
  }
}
