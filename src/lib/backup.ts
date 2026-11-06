import { useTasksStore } from '../store/tasks'
import { useThemeStore } from '../store/theme'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { useNotesStore } from '../store/notes'
import { reviveTask } from './tasks'
import { getUid } from './session'
import { setTask } from './taskDb'
import { setFolderRemote, setNoteRemote, setNotesBgRemote } from './notesDb'
import type { SectionMeta, Task, ThemeConfig } from '../types/task'
import type { NoteFolder, StoredNote } from '../types/notes'

const AUTO_BACKUP_KEY = 'task-lex-last-backup'
const backupKey = () => `${AUTO_BACKUP_KEY}:${getUid() ?? 'local'}`

export function exportJSON() {
  const tasks = useTasksStore.getState().tasks
  const themes = useThemeStore.getState().themes
  const sections = useSectionsStore.getState().sections
  const settings = useSettingsStore.getState()
  const { folders, notes, bgImage } = useNotesStore.getState()
  const payload = {
    app: 'task-lex',
    version: 3,
    exportedAt: new Date().toISOString(),
    sections,
    tasks: tasks.map((t) => ({
      ...t,
      dueDate: t.dueDate ? t.dueDate.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    })),
    themes,
    folders,
    notes,
    notesBg: bgImage,
    settings: {
      dailyGoal: settings.dailyGoal,
      focusMinutes: settings.focusMinutes,
      shortBreak: settings.shortBreak,
      notificationsOn: settings.notificationsOn,
      appThemeId: settings.appThemeId,
      accentThemeId: settings.accentThemeId,
      calendarSync: settings.calendarSync,
      dailyReminderFrequency: settings.dailyReminderFrequency,
      soundsEnabled: settings.soundsEnabled,
      soundVolume: settings.soundVolume,
      autoBackup: settings.autoBackup,
      backupFrequency: settings.backupFrequency,
    },
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-lex-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
  try {
    localStorage.setItem(backupKey(), String(Date.now()))
    window.dispatchEvent(new CustomEvent('tasklex:backup-exported'))
  } catch {}
}

export function lastBackupAt(): number | null {
  try {
    const value = Number(localStorage.getItem(backupKey()) ?? localStorage.getItem(AUTO_BACKUP_KEY))
    return Number.isFinite(value) && value > 0 ? value : null
  } catch { return null }
}

export function checkAutoBackup() {
  const settings = useSettingsStore.getState()
  if (!settings.autoBackup) return

  try {
    const lastBackup = localStorage.getItem(backupKey()) ?? localStorage.getItem(AUTO_BACKUP_KEY)
    const now = Date.now()
    const frequencyMs = settings.backupFrequency * 24 * 60 * 60 * 1000

    if (!lastBackup || now - parseInt(lastBackup) > frequencyMs) {
      exportJSON()
      localStorage.setItem(backupKey(), now.toString())
    }
  } catch (error) {
    console.error('Error checking auto-backup:', error)
  }
}

export function importJSON(file: File): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(String(reader.result)) as {
          tasks?: Task[]
          themes?: Partial<Record<string, ThemeConfig>>
          sections?: SectionMeta[]
          folders?: NoteFolder[]
          notes?: StoredNote[]
          notesBg?: string | null
          settings?: {
            dailyGoal?: number
            focusMinutes?: number
            shortBreak?: number
            notificationsOn?: boolean
            appThemeId?: string
            accentThemeId?: string
            calendarSync?: boolean
            dailyReminderFrequency?: number
            soundsEnabled?: boolean
            soundVolume?: number
            autoBackup?: boolean
            backupFrequency?: number
          }
        }
        if (!Array.isArray(data.tasks)) {
          resolve({ ok: false, message: 'Archivo inválido: no contiene tareas.' })
          return
        }
        const validTasks = data.tasks.filter((task): task is Task =>
          !!task && typeof task === 'object' && typeof task.id === 'string' && task.id.length > 0 &&
          typeof task.title === 'string' && task.title.trim().length > 0 && typeof task.sectionId === 'string',
        )
        if (validTasks.length !== data.tasks.length) {
          resolve({ ok: false, message: 'El archivo contiene tareas dañadas; no se aplicaron cambios.' })
          return
        }
        const importedTasks = validTasks.map((task) => reviveTask(task))
        const currentTasks = useTasksStore.getState().tasks
        const taskMap = new Map(currentTasks.map((task) => [task.id, task]))
        importedTasks.forEach((task) => {
          const existing = taskMap.get(task.id)
          if (!existing || task.updatedAt.getTime() > existing.updatedAt.getTime()) taskMap.set(task.id, task)
        })
        const tasks = [...taskMap.values()]
        useTasksStore.setState({ tasks })
        const uid = getUid()
        if (uid) {
          for (const task of importedTasks) {
            const existing = currentTasks.find((item) => item.id === task.id)
            if (!existing || task.updatedAt.getTime() > existing.updatedAt.getTime()) {
              try {
                await setTask(uid, task)
              } catch {}
            }
          }
        }
        
        if (data.sections?.length) {
          const sections = useSectionsStore.getState().sections
          const sectionMap = new Map(sections.map((section) => [section.id, section]))
          data.sections.filter((section) => !!section && typeof section.id === 'string' && typeof section.label === 'string')
            .forEach((section) => { if (!sectionMap.has(section.id)) sectionMap.set(section.id, section) })
          useSectionsStore.setState({ sections: [...sectionMap.values()] })
        }

        if (Array.isArray(data.folders) && Array.isArray(data.notes)) {
          const folders = data.folders.filter(
            (f): f is NoteFolder =>
              !!f && typeof f === 'object' && typeof (f as NoteFolder).id === 'string' && typeof (f as NoteFolder).name === 'string',
          )
          const notes = data.notes.filter(
            (n): n is StoredNote =>
              !!n && typeof n === 'object' && typeof (n as StoredNote).id === 'string' && Array.isArray((n as StoredNote).blocks),
          )
          const currentNotes = useNotesStore.getState()
          const folderMap = new Map(currentNotes.folders.map((folder) => [folder.id, folder]))
          folders.forEach((folder) => {
            const existing = folderMap.get(folder.id)
            if (!existing || folder.updatedAt >= existing.updatedAt) folderMap.set(folder.id, folder)
          })
          const noteMap = new Map(currentNotes.notes.map((note) => [note.id, note]))
          notes.forEach((note) => {
            const existing = noteMap.get(note.id)
            if (!existing || note.updatedAt >= existing.updatedAt) noteMap.set(note.id, note)
          })
          const mergedFolders = [...folderMap.values()]
          const mergedNotes = [...noteMap.values()]
          useNotesStore.setState({ folders: mergedFolders, notes: mergedNotes })
          if (uid) {
            for (const f of mergedFolders) {
              try {
                await setFolderRemote(uid, f)
              } catch {}
            }
            for (const n of mergedNotes) {
              try {
                await setNoteRemote(uid, n)
              } catch {}
            }
          }
        }
        if (typeof data.notesBg === 'string' || data.notesBg === null) {
          useNotesStore.getState().setBgImage(data.notesBg)
        } else if (uid && data.notesBg === undefined) {
          try {
            await setNotesBgRemote(uid, useNotesStore.getState().bgImage)
          } catch {}
        }
        
        if (data.themes) {
          const current = useThemeStore.getState().themes
          const clean = Object.fromEntries(
            Object.entries(data.themes).filter(([, v]) => v != null),
          ) as Record<string, ThemeConfig>
          useThemeStore.setState({ themes: { ...current, ...clean } })
        }
        
        if (data.settings) {
          const s = useSettingsStore.getState()
          if (data.settings.dailyGoal !== undefined) s.setDailyGoal(data.settings.dailyGoal)
          if (data.settings.focusMinutes !== undefined) s.setFocusMinutes(data.settings.focusMinutes)
          if (data.settings.shortBreak !== undefined) s.setShortBreak(data.settings.shortBreak)
          if (data.settings.notificationsOn !== undefined) s.setNotificationsOn(data.settings.notificationsOn)
          if (data.settings.appThemeId !== undefined) s.setAppThemeId(data.settings.appThemeId)
          if (data.settings.accentThemeId !== undefined) s.setAccentThemeId(data.settings.accentThemeId)
          if (data.settings.calendarSync !== undefined) s.setCalendarSync(data.settings.calendarSync)
          if (data.settings.dailyReminderFrequency !== undefined) s.setDailyReminderFrequency(data.settings.dailyReminderFrequency)
          if (data.settings.soundsEnabled !== undefined) s.setSoundsEnabled(data.settings.soundsEnabled)
          if (data.settings.soundVolume !== undefined) s.setSoundVolume(data.settings.soundVolume)
          if (data.settings.autoBackup !== undefined) s.setAutoBackup(data.settings.autoBackup)
          if (data.settings.backupFrequency !== undefined) s.setBackupFrequency(data.settings.backupFrequency)
        }
        
        resolve({ ok: true, message: `${tasks.length} tareas importadas.` })
      } catch {
        resolve({ ok: false, message: 'No se pudo leer el archivo.' })
      }
    }
    reader.onerror = () => resolve({ ok: false, message: 'Error de lectura.' })
    reader.readAsText(file)
  })
}
