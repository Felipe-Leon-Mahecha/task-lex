import { collection, getDoc, getDocs, onSnapshot, writeBatch, type Firestore } from 'firebase/firestore'
import { db } from './firebase'
import { focusDoc, sectionDoc, settingsDoc, taskDoc, toFirestore, saveFocusLog, saveSettings } from './taskDb'
import { folderDoc, getNotesBgRemote, noteDoc, setFolderTombstone, setNoteTombstone, setNotesBgRemote } from './notesDb'
import { useTasksStore } from '../store/tasks'
import { defaultTheme, useThemeStore } from '../store/theme'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { useNotesStore } from '../store/notes'
import { useOfflineStore } from '../store/offline'
import { cancelReminder, scheduleReminder } from './notifications'
import { migrateSectionId } from './sections'
import { getFocusLog, mergeRemoteFocus } from './focusStats'
import { markCloudSync } from './syncStatus'
import type { NoteFolder, StoredNote } from '../types/notes'
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
  const local = useThemeStore.getState().themes[id]
  const localTs = typeof local?.updatedAt === 'number' ? local.updatedAt : 0
  const remoteTs = typeof remote.updatedAt === 'number' ? remote.updatedAt : 0
  if (local && remoteTs < localTs) return
  useThemeStore.setState((s) => ({
    themes: { ...s.themes, [id]: { ...defaultTheme, ...s.themes[id], ...remote } },
  }))
}

export async function startSync(uid: string) {
  stopSync()
  if (!db) return
  if (useOfflineStore.getState().isOnline) useOfflineStore.getState().setOnline(true)
  const fdb = db
  await migrateLegacySections(uid, fdb)
  await syncSettingsAndFocus(uid)
  await syncNotes(uid, fdb)

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
      if (!snap.metadata.fromCache) markCloudSync(uid)
      const remote = snap.docs.map((d) => reviveTask(d.id, d.data() as Record<string, unknown>))
      const local = useTasksStore.getState().tasks
      const localMap = new Map(local.map((t) => [t.id, t]))
      const merged = remote.map((r) => {
        const l = localMap.get(r.id)
        if (l && l.updatedAt && r.updatedAt && l.updatedAt >= r.updatedAt) return l
        return r
      })
      local.forEach((l) => {
        if (!remote.some((r) => r.id === l.id)) merged.push(l)
      })
      useTasksStore.setState({ tasks: merged })
      if (firstSnapshot) {
        firstSnapshot = false
        rescheduleReminders()
      }
    },
    (err) => console.error('[sync tasks]', err),
    ),
  )

  unsubs.push(
    onSnapshot(collection(fdb, 'users', uid, 'sections'), (snap) => {
      if (!snap.metadata.fromCache) markCloudSync(uid)
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
    },
    (err) => console.error('[sync sections]', err),
    ),
  )
}

export function stopSync() {
  unsubs.forEach((u) => u())
  unsubs = []
}

function reviveNote(id: string, data: Record<string, unknown>): StoredNote {
  return {
    id,
    folderId: typeof data.folderId === 'string' ? data.folderId : null,
    title: typeof data.title === 'string' ? data.title : '',
    blocks: Array.isArray(data.blocks) ? (data.blocks as StoredNote['blocks']) : [],
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
    pinned: !!data.pinned,
  }
}

function reviveFolder(id: string, data: Record<string, unknown>): NoteFolder {
  return {
    id,
    name: typeof data.name === 'string' ? data.name : 'Carpeta',
    color: typeof data.color === 'string' ? data.color : '#06b6d4',
    createdAt: typeof data.createdAt === 'number' ? data.createdAt : 0,
    updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : (typeof data.createdAt === 'number' ? data.createdAt : 0),
  }
}

async function syncNotes(uid: string, fdb: Firestore) {
  await uploadMissingNotes(uid, fdb)
  try {
    const local = useNotesStore.getState().bgImage
    if (local) {
      setNotesBgRemote(uid, local).catch(() => {})
    } else {
      const remote = await getNotesBgRemote(uid)
      if (remote) useNotesStore.getState().applyRemoteBg(remote)
    }
  } catch {}

  unsubs.push(
    onSnapshot(
      collection(fdb, 'users', uid, 'notes'),
      (snap) => {
        const tombstones = new Set(snap.docs.filter((d) => !!d.data()._deleted).map((d) => d.id))
        const trash = useNotesStore.getState().trash
        const trashIds = new Set(trash.map((t) => t.id))
        const remote = snap.docs
          .filter((d) => !d.data()._deleted && !trashIds.has(d.id))
          .map((d) => reviveNote(d.id, d.data() as Record<string, unknown>))
        snap.docs.forEach((d) => {
          if (!d.data()._deleted && trashIds.has(d.id)) {
            setNoteTombstone(uid, d.id, Date.now()).catch(() => {})
          }
        })
        const local = useNotesStore.getState().notes
        const live = local.filter((n) => !tombstones.has(n.id) && !trash.some((t) => t.id === n.id))
        const localMap = new Map(live.map((n) => [n.id, n]))
        const merged = remote.map((r) => {
          const l = localMap.get(r.id)
          if (l && l.updatedAt >= r.updatedAt) return l
          return r
        })
        live.forEach((l) => {
          if (!remote.some((r) => r.id === l.id)) merged.push(l)
        })
        const removed = tombstones.size > 0 || trash.length > 0
        useNotesStore.setState({
          notes: merged,
          trash: removed ? trash.filter((t) => !tombstones.has(t.id)) : trash,
        })
      },
      (err) => console.error('[sync notes]', err),
    ),
    onSnapshot(
      collection(fdb, 'users', uid, 'note_folders'),
      (snap) => {
        const tombstones = new Set(snap.docs.filter((d) => !!d.data()._deleted).map((d) => d.id))
        const trashFolders = useNotesStore.getState().trashFolders
        const trashIds = new Set(trashFolders.map((t) => t.id))
        const remote = snap.docs
          .filter((d) => !d.data()._deleted && !trashIds.has(d.id))
          .map((d) => reviveFolder(d.id, d.data() as Record<string, unknown>))
        snap.docs.forEach((d) => {
          if (!d.data()._deleted && trashIds.has(d.id)) {
            setFolderTombstone(uid, d.id, Date.now()).catch(() => {})
          }
        })
        const local = useNotesStore.getState().folders
        const live = local.filter((f) => !tombstones.has(f.id) && !trashFolders.some((t) => t.id === f.id))
        const localMap = new Map(live.map((f) => [f.id, f]))
        const merged = remote.map((r) => {
          const l = localMap.get(r.id)
          if (l && l.updatedAt >= r.updatedAt) return l
          return r
        })
        live.forEach((l) => {
          if (!remote.some((r) => r.id === l.id)) merged.push(l)
        })
        const removed = tombstones.size > 0 || trashFolders.length > 0
        useNotesStore.setState({
          folders: merged,
          trashFolders: removed ? trashFolders.filter((t) => !tombstones.has(t.id)) : trashFolders,
        })
      },
      (err) => console.error('[sync folders]', err),
    ),
  )
}

async function uploadMissingNotes(uid: string, fdb: Firestore) {
  try {
    const [notesSnap, foldersSnap] = await Promise.all([
      getDocs(collection(fdb, 'users', uid, 'notes')),
      getDocs(collection(fdb, 'users', uid, 'note_folders')),
    ])
    const remoteNotes = new Set(notesSnap.docs.map((d) => d.id))
    const remoteFolders = new Set(foldersSnap.docs.map((d) => d.id))
    const trash = useNotesStore.getState().trash
    const trashIds = new Set(trash.map((t) => t.id))
    const trashFolders = useNotesStore.getState().trashFolders
    const trashFolderIds = new Set(trashFolders.map((t) => t.id))
    const batch = writeBatch(fdb)
    let wrote = 0
    useNotesStore
      .getState()
      .notes.filter((n) => !remoteNotes.has(n.id))
      .forEach((n) => {
        batch.set(noteDoc(uid, n.id), n)
        wrote++
      })
    useNotesStore
      .getState()
      .folders.filter((f) => !remoteFolders.has(f.id))
      .forEach((f) => {
        batch.set(folderDoc(uid, f.id), f)
        wrote++
      })
    notesSnap.docs
      .filter((d) => !d.data()._deleted && trashIds.has(d.id))
      .forEach((d) => {
        batch.set(noteDoc(uid, d.id), { id: d.id, _deleted: true, deletedAt: d.data().updatedAt ?? Date.now(), updatedAt: Date.now() })
        wrote++
      })
    foldersSnap.docs
      .filter((d) => !d.data()._deleted && trashFolderIds.has(d.id))
      .forEach((d) => {
        batch.set(folderDoc(uid, d.id), { id: d.id, _deleted: true, deletedAt: d.data().updatedAt ?? Date.now(), updatedAt: Date.now() })
        wrote++
      })
    if (wrote > 0) await batch.commit()
  } catch {
    // offline: la subida se reintenta en el siguiente inicio
  }
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
      if (typeof d.appThemeId === 'string') useSettingsStore.getState().setAppThemeId(d.appThemeId)
      if (typeof d.accentThemeId === 'string') useSettingsStore.getState().setAccentThemeId(d.accentThemeId)
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
