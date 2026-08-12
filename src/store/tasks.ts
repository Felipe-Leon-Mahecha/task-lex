import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUid } from '../lib/session'
import { removeTask, setTask } from '../lib/taskDb'
import { cancelReminder, scheduleReminder } from '../lib/notifications'
import { deleteTaskImage } from '../lib/taskImages'
import { reviveTask } from '../lib/tasks'
import { createCalendarEvent, updateCalendarEvent, deleteCalendarEvent } from '../lib/calendar'
import { useSettingsStore } from './settings'
import { useOfflineStore, generateOperationId, type PendingOperation } from './offline'
import { playTaskComplete, playNewTask, playDeleteTask } from '../lib/sounds'
import { hapticImpact } from '../lib/haptics'
import { ImpactStyle } from '@capacitor/haptics'
import { useUndoStore } from './undo'
import type { Task } from '../types/task'

interface TasksState {
  tasks: Task[]
  addTask: (task: Task) => void
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  deleteTasksBySection: (sectionId: string) => void
  reorderTasks: (oldIndex: number, newIndex: number) => void
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      addTask: (task) => {
        set((s) => ({ tasks: [task, ...s.tasks] }))
        const uid = getUid()
        const isOnline = useOfflineStore.getState().isOnline
        
        if (uid) {
          if (isOnline) {
            setTask(uid, task).catch(() => {})
          } else {
            // Queue operation for offline
            const operation: PendingOperation = {
              id: generateOperationId(),
              type: 'task',
              action: 'create',
              data: task,
              timestamp: Date.now(),
            }
            useOfflineStore.getState().addPendingOperation(operation)
          }
        }
        
        scheduleReminder(task).catch(() => {})
        
        // Play sound if enabled
        const soundsEnabled = useSettingsStore.getState().soundsEnabled
        if (soundsEnabled) {
          playNewTask()
        }
        
        // Haptic feedback
        hapticImpact(ImpactStyle.Light)
        
        // Sync to calendar if enabled and task has due date
        const calendarSync = useSettingsStore.getState().calendarSync
        if (calendarSync && task.dueDate && isOnline) {
          createCalendarEvent({
            title: task.title,
            description: task.description,
            dueDate: task.dueDate,
          }).then((eventId) => {
            if (eventId) {
              get().updateTask(task.id, { calendarEventId: eventId })
            }
          }).catch(() => {})
        }
      },
      updateTask: (id, patch) => {
        const wasDone = get().tasks.find((t) => t.id === id)?.status === 'done'
        const previousTask = get().tasks.find((t) => t.id === id)
        
        set((s) => ({
          tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: new Date() } : t)),
        }))
        const updated = get().tasks.find((t) => t.id === id) ?? null
        const isOnline = useOfflineStore.getState().isOnline
        
        if (updated) {
          // Play sound if task was just completed
          const soundsEnabled = useSettingsStore.getState().soundsEnabled
          if (!wasDone && updated.status === 'done' && soundsEnabled) {
            playTaskComplete()
            // Haptic feedback based on priority
            const hapticStyle = updated.priority === 'alta' ? ImpactStyle.Heavy : 
                               updated.priority === 'media' ? ImpactStyle.Medium : ImpactStyle.Light
            hapticImpact(hapticStyle)
            // Add to undo
            useUndoStore.getState().addAction({
              type: 'complete',
              taskId: id,
              previousState: previousTask ? { status: previousTask.status } : undefined,
              timestamp: Date.now(),
            })
          }
          
          if (updated.status === 'done' || updated.archived) cancelReminder(id)
          else scheduleReminder(updated).catch(() => {})
          
          const uid = getUid()
          if (uid) {
            if (isOnline) {
              setTask(uid, updated).catch(() => {})
            } else {
              // Queue operation for offline
              const operation: PendingOperation = {
                id: generateOperationId(),
                type: 'task',
                action: 'update',
                data: updated,
                timestamp: Date.now(),
              }
              useOfflineStore.getState().addPendingOperation(operation)
            }
          }
          
          // Sync to calendar if enabled
          const calendarSync = useSettingsStore.getState().calendarSync
          if (calendarSync && updated.calendarEventId && isOnline) {
            updateCalendarEvent(updated.calendarEventId, {
              title: updated.title,
              description: updated.description,
              dueDate: updated.dueDate,
            }).catch(() => {})
          } else if (calendarSync && !updated.calendarEventId && updated.dueDate && isOnline) {
            // Create calendar event if task now has due date
            createCalendarEvent({
              title: updated.title,
              description: updated.description,
              dueDate: updated.dueDate,
            }).then((eventId) => {
              if (eventId) {
                get().updateTask(id, { calendarEventId: eventId })
              }
            }).catch(() => {})
          }
        }
      },
      deleteTask: (id) => {
        const target = get().tasks.find((t) => t.id === id)
        set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }))
        cancelReminder(id)
        target?.images.forEach((url) => deleteTaskImage(url).catch(() => {}))
        
        const isOnline = useOfflineStore.getState().isOnline
        
        // Play sound if enabled
        const soundsEnabled = useSettingsStore.getState().soundsEnabled
        if (soundsEnabled) {
          playDeleteTask()
        }
        
        // Haptic feedback
        hapticImpact(ImpactStyle.Medium)
        
        // Add to undo
        if (target) {
          useUndoStore.getState().addAction({
            type: 'delete',
            taskId: id,
            previousState: target,
            timestamp: Date.now(),
          })
        }
        
        // Delete from calendar if synced
        const calendarSync = useSettingsStore.getState().calendarSync
        if (calendarSync && target?.calendarEventId && isOnline) {
          deleteCalendarEvent(target.calendarEventId).catch(() => {})
        }
        
        const uid = getUid()
        if (uid) {
          if (isOnline) {
            removeTask(uid, id).catch(() => {})
          } else {
            // Queue operation for offline
            const operation: PendingOperation = {
              id: generateOperationId(),
              type: 'task',
              action: 'delete',
              data: { id, task: target },
              timestamp: Date.now(),
            }
            useOfflineStore.getState().addPendingOperation(operation)
          }
        }
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
      reorderTasks: (oldIndex, newIndex) => {
        set((s) => {
          const tasks = [...s.tasks]
          const [moved] = tasks.splice(oldIndex, 1)
          tasks.splice(newIndex, 0, moved)
          return { tasks }
        })
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
