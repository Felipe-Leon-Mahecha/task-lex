export type SectionId = string
export type Priority = 'baja' | 'media' | 'alta'
export type Status = 'pending' | 'in_progress' | 'done'
export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly'
export type ViewMode = 'list' | 'board' | 'calendar' | 'gantt'

export interface Subtask {
  id: string
  text: string
  done: boolean
}

export interface LinkNote {
  id: string
  type: 'nota' | 'link'
  content: string
  label?: string
}

export interface PomodoroState {
  focusMinutes: number
  shortBreak: number
  longBreak: number
  sessionsDone: number
  running: boolean
  endsAt: Date | null
}

export interface Reminder {
  id: string
  taskId: string
  offsetMs: number
  sentAt: Date | null
}

export interface Task {
  id: string
  sectionId: SectionId
  title: string
  description: string
  subtasks: Subtask[]
  dueDate: Date | null
  priority: Priority
  status: Status
  recurrence: Recurrence
  focusDay: boolean
  reminderLead: number | null
  notesLinks: LinkNote[]
  images: string[]
  pomodoro: PomodoroState
  tags: string[]
  createdAt: Date
  updatedAt: Date
  completedAt: Date | null
  archived: boolean
}

export interface ThemeConfig {
  name: string
  backgroundImage?: string
  background: string
  surface: string
  accent: string
  text: string
  textMuted: string
  border: string
  borderRadius: number
  darkMode: boolean
}

export interface SectionMeta {
  id: string
  label: string
  icon: string
  order: number
}

export interface SectionConfig {
  id: SectionId
  label: string
  icon: string
  theme: ThemeConfig
  reminders: Reminder[]
  defaultView: ViewMode
}

export interface AppSettings {
  userId: string
  defaultTheme: ThemeConfig
  pomodoroDefaults: { focusMinutes: number; shortBreak: number; longBreak: number }
  notificationLeadTimes: number[]
  weekStart: 1
  locale: 'es-CO'
}
