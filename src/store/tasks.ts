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
import { useFoxSkinsStore } from './foxSkins'
import type { Task } from '../types/task'

function isTemporaryCloudError(error: unknown): boolean {
  const code = (error as { code?: string } | null)?.code ?? ''
  return ['unavailable', 'deadline-exceeded', 'network-request-failed', 'cancelled'].includes(code)
}

function queueFailedTaskWrite(uid: string, action: PendingOperation['action'], data: unknown, error: unknown) {
  if (!isTemporaryCloudError(error)) return
  useOfflineStore.getState().addPendingOperation({
    id: generateOperationId(),
    uid,
    type: 'task',
    action,
    data,
    timestamp: Date.now(),
  })
  useOfflineStore.getState().setOnline(false)
}

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
            setTask(uid, task).catch((error) => queueFailedTaskWrite(uid, 'create', task, error))
          } else {
            // Queue operation for offline
            const operation: PendingOperation = {
              id: generateOperationId(),
              uid,
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
          tasks: s.tasks.map((t) => {
            if (t.id !== id) return t
            const next = { ...t, ...patch, updatedAt: new Date() }
            if (patch.status === 'done') {
              next.completedAt = t.status === 'done' && t.completedAt ? t.completedAt : (patch.completedAt ?? new Date())
            } else if (patch.status) {
              next.completedAt = null
            }
            return next
          }),
        }))
        const updated = get().tasks.find((t) => t.id === id) ?? null
        const isOnline = useOfflineStore.getState().isOnline
        
        if (updated) {
          if (!wasDone && updated.status === 'done') {
            void useFoxSkinsStore.getState().recordTaskReward(id).catch(() => {})
          }
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
              setTask(uid, updated).catch((error) => queueFailedTaskWrite(uid, 'update', updated, error))
            } else {
              // Queue operation for offline
              const operation: PendingOperation = {
                id: generateOperationId(),
                uid,
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
          if (updated.calendarEventId && !updated.dueDate && isOnline) {
            deleteCalendarEvent(updated.calendarEventId).then(() => {
              get().updateTask(id, { calendarEventId: undefined })
            }).catch(() => {})
          } else if (calendarSync && updated.calendarEventId && isOnline && Object.keys(patch).some((key) => key !== 'calendarEventId')) {
            updateCalendarEvent(updated.calendarEventId, {
              title: updated.title,
              description: updated.description,
              dueDate: updated.dueDate,
            }).catch(() => {})
          } else if (calendarSync && !updated.calendarEventId && updated.dueDate && isOnline && Object.keys(patch).some((key) => key !== 'calendarEventId')) {
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
        
        // Remove any event previously linked to this task.
        if (target?.calendarEventId && isOnline) {
          deleteCalendarEvent(target.calendarEventId).catch(() => {})
        }
        
        const uid = getUid()
        if (uid) {
          if (isOnline) {
            removeTask(uid, id).catch((error) => queueFailedTaskWrite(uid, 'delete', { id, task: target }, error))
          } else {
            // Queue operation for offline
            const operation: PendingOperation = {
              id: generateOperationId(),
              uid,
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
          const isOnline = useOfflineStore.getState().isOnline
          toDelete.forEach((t) => {
            if (isOnline) {
              removeTask(uid, t.id).catch((error) => queueFailedTaskWrite(uid, 'delete', { id: t.id, task: t }, error))
            } else {
              useOfflineStore.getState().addPendingOperation({
                id: generateOperationId(),
                uid,
                type: 'task',
                action: 'delete',
                data: { id: t.id, task: t },
                timestamp: Date.now(),
              })
            }
          })
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
