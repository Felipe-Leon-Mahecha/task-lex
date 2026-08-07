import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUid } from '../lib/session'
import { removeTask, setTask } from '../lib/taskDb'
import { cancelReminder, scheduleReminder } from '../lib/notifications'
import { deleteTaskImage } from '../lib/taskImages'
import { reviveTask } from '../lib/tasks'
import type { Task } from '../types/task'

interface TasksState {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  deleteTasksBySection: (sectionId: string) => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) => {
        set((s) => ({ tasks: [task, ...s.tasks] }))
        const uid = getUid()
        if (uid) setTask(uid, task).catch(() => {})
        scheduleReminder(task).catch(() => {})
      },
      updateTask: (id, patch) => {
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date() } : t)),
        }))
        const updated = get().tasks.find((t) => t.id === id) ?? null
        if (updated) {
          if (updated.status === 'done' || updated.archived) cancelReminder(id)
          else scheduleReminder(updated).catch(() => {})
          const uid = getUid()
          if (uid) setTask(uid, updated).catch(() => {})
        }
      },
      deleteTask: (id) => {
        const target = get().tasks.find((t) => t.id === id)
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
        cancelReminder(id)
        target?.images.forEach((url) => deleteTaskImage(url).catch(() => {}))
        const uid = getUid()
        if (uid) removeTask(uid, id).catch(() => {})
      },
      deleteTasksBySection: (sectionId) => {
        const toDelete = get().tasks.filter((t) => t.sectionId === sectionId)
        set((s) => ({ tasks: s.tasks.filter((t) => t.sectionId !== sectionId) }))
        toDelete.forEach((t) => cancelReminder(t.id))
        toDelete.forEach((t) => t.images.forEach((url) => deleteTaskImage(url).catch(() => {})))
        const uid = getUid()
        if (uid) {
          toDelete.forEach((t) => removeTask(uid, t.id).catch(() => {}))
        }
      },
    }),
    {
      name: 'task-lex-tasks',
      merge: (persisted, current) => {
        const p = persisted as { tasks?: Task[] } | undefined
        if (!p?.tasks) return current
        return { ...current, tasks: p.tasks.map(reviveTask) }
      },
    },
  ),
)
