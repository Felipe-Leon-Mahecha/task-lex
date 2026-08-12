import { useTasksStore } from '../store/tasks'
import { useThemeStore } from '../store/theme'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { reviveTask } from './tasks'
import type { SectionMeta, Task, ThemeConfig } from '../types/task'

const AUTO_BACKUP_KEY = 'task-lex-last-backup'

export function exportJSON() {
  const tasks = useTasksStore.getState().tasks
  const themes = useThemeStore.getState().themes
  const sections = useSectionsStore.getState().sections
  const settings = useSettingsStore.getState()
  const payload = {
    app: 'task-lex',
    version: 2,
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
    settings: {
      dailyGoal: settings.dailyGoal,
      focusMinutes: settings.focusMinutes,
      shortBreak: settings.shortBreak,
      notificationsOn: settings.notificationsOn,
      appThemeId: settings.appThemeId,
      accentThemeId: settings.accentThemeId,
      autoDarkMode: settings.autoDarkMode,
      calendarSync: settings.calendarSync,
      dailyReminderFrequency: settings.dailyReminderFrequency,
      soundsEnabled: settings.soundsEnabled,
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
}

export function checkAutoBackup() {
  const settings = useSettingsStore.getState()
  if (!settings.autoBackup) return

  try {
    const lastBackup = localStorage.getItem(AUTO_BACKUP_KEY)
    const now = Date.now()
    const frequencyMs = settings.backupFrequency * 24 * 60 * 60 * 1000

    if (!lastBackup || now - parseInt(lastBackup) > frequencyMs) {
      exportJSON()
      localStorage.setItem(AUTO_BACKUP_KEY, now.toString())
    }
  } catch (error) {
    console.error('Error checking auto-backup:', error)
  }
}

export function importJSON(file: File): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result)) as {
          tasks?: Task[]
          themes?: Partial<Record<string, ThemeConfig>>
          sections?: SectionMeta[]
          settings?: {
            dailyGoal?: number
            focusMinutes?: number
            shortBreak?: number
            notificationsOn?: boolean
            appThemeId?: string
            accentThemeId?: string
            autoDarkMode?: boolean
            calendarSync?: boolean
            dailyReminderFrequency?: number
            soundsEnabled?: boolean
            autoBackup?: boolean
            backupFrequency?: number
          }
        }
        if (!Array.isArray(data.tasks)) {
          resolve({ ok: false, message: 'Archivo inválido: no contiene tareas.' })
          return
        }
        const tasks = data.tasks.map((t) => reviveTask(t))
        useTasksStore.setState({ tasks })
        
        if (data.sections?.length) {
          useSectionsStore.setState({ sections: data.sections })
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
          if (data.settings.autoDarkMode !== undefined) s.setAutoDarkMode(data.settings.autoDarkMode)
          if (data.settings.calendarSync !== undefined) s.setCalendarSync(data.settings.calendarSync)
          if (data.settings.dailyReminderFrequency !== undefined) s.setDailyReminderFrequency(data.settings.dailyReminderFrequency)
          if (data.settings.soundsEnabled !== undefined) s.setSoundsEnabled(data.settings.soundsEnabled)
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
