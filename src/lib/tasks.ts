import type { Priority, Recurrence, SectionId, Status, Task } from '../types/task'
import { useSettingsStore } from '../store/settings'
import { migrateSectionId } from './sections'

export type TaskInput = {
  title: string
  description: string
  dueDate: Date | null
  priority: Priority
  status: Status
  recurrence: Recurrence
  focusDay: boolean
  reminderLead: number | null
  reminder2HoursBefore: boolean
  subtasks: { id: string; text: string; done: boolean }[]
  notesLinks: { id: string; type: 'nota' | 'link'; content: string; label?: string }[]
  images: string[]
  tags: string[]
}

export function createTask(sectionId: SectionId, input: TaskInput): Task {
  const now = new Date()
  const { focusMinutes, shortBreak } = useSettingsStore.getState()
  return {
    id: crypto.randomUUID(),
    sectionId,
    ...input,
    pomodoro: {
      focusMinutes,
      shortBreak,
      longBreak: 15,
      sessionsDone: 0,
      running: false,
      endsAt: null,
    },
    createdAt: now,
    updatedAt: now,
    completedAt: input.status === 'done' ? now : null,
    archived: false,
  }
}

export function toTaskInput(t: Task): TaskInput {
  return {
    title: t.title,
    description: t.description,
    dueDate: t.dueDate,
    priority: t.priority,
    status: t.status,
    recurrence: t.recurrence,
    focusDay: t.focusDay,
    reminderLead: t.reminderLead,
    reminder2HoursBefore: t.reminder2HoursBefore,
    subtasks: t.subtasks,
    notesLinks: t.notesLinks,
    images: t.images,
    tags: t.tags,
  }
}

export function isToday(d: Date) {
  const n = new Date()
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate()
}

export function toInputValue(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export function reviveTask(t: Task): Task {
  return {
    ...t,
    sectionId: migrateSectionId(t.sectionId),
    images: Array.isArray(t.images) ? t.images : [],
    dueDate: t.dueDate ? new Date(t.dueDate) : null,
    createdAt: new Date(t.createdAt),
    updatedAt: new Date(t.updatedAt),
    completedAt: t.completedAt ? new Date(t.completedAt) : null,
  }
}
