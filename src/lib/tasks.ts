import type { Priority, Recurrence, ReminderKind, SectionId, Status, Task } from '../types/task'
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
  completeWithSubtasks?: boolean
  reminderLead: number | null
  reminder2HoursBefore: boolean
  reminderKind?: ReminderKind
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
    completeWithSubtasks: t.completeWithSubtasks,
    reminderLead: t.reminderLead,
    reminder2HoursBefore: t.reminder2HoursBefore,
    reminderKind: t.reminderKind,
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
  const parse = (value: Date | string | null | undefined): Date | null => {
    if (!value) return null
    const result = value instanceof Date ? value : new Date(value)
    return Number.isNaN(result.getTime()) ? null : result
  }
  const createdAt = parse(t.createdAt) ?? new Date()
  const updatedAt = parse(t.updatedAt) ?? createdAt
  return {
    ...t,
    sectionId: migrateSectionId(t.sectionId),
    images: Array.isArray(t.images) ? t.images : [],
    dueDate: parse(t.dueDate),
    createdAt,
    updatedAt,
    completedAt: parse(t.completedAt),
    pomodoro: { ...t.pomodoro, endsAt: parse(t.pomodoro?.endsAt) },
  }
}
