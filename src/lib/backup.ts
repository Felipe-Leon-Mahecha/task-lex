import { useTasksStore } from '../store/tasks'
import { useThemeStore } from '../store/theme'
import { useSectionsStore } from '../store/sections'
import { reviveTask } from './tasks'
import type { SectionMeta, Task, ThemeConfig } from '../types/task'

export function exportJSON() {
  const tasks = useTasksStore.getState().tasks
  const themes = useThemeStore.getState().themes
  const sections = useSectionsStore.getState().sections
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
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `task-lex-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
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
        resolve({ ok: true, message: `${tasks.length} tareas importadas.` })
      } catch {
        resolve({ ok: false, message: 'No se pudo leer el archivo.' })
      }
    }
    reader.onerror = () => resolve({ ok: false, message: 'Error de lectura.' })
    reader.readAsText(file)
  })
}
