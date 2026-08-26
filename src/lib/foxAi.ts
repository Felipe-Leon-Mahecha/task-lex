import { z } from 'zod'
import { Capacitor } from '@capacitor/core'

const API_HOST = Capacitor.getPlatform() === 'android'
  ? 'task-lex.vercel.app'
  : window.location.host
const FOX_URL = `${window.location.protocol}//${API_HOST}/api/fox`

export interface FoxTaskRef {
  id: string
  title: string
  section: string
  priority: 'baja' | 'media' | 'alta'
  dueDate: string | null
}

export interface PlanBlock {
  taskId: string
  startTime: string
  endTime: string
  reason: string
}

const PlanSchema = z.object({
  plan: z.array(z.object({
    taskId: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    reason: z.string(),
  })),
  summary: z.string(),
})

const AnswerSchema = z.object({ answer: z.string() })
const BreakdownSchema = z.object({ subtasks: z.array(z.string()).min(2).max(8) })

const EnergySchema = z.object({
  taskId: z.string().nullable(),
  message: z.string(),
})

const CoachSchema = z.object({
  insight: z.string(),
  tips: z.array(z.string()).length(3),
})

const ChatSchema = z.object({ reply: z.string() })

const RescheduleSchema = z.object({
  plan: z.array(z.object({
    taskId: z.string(),
    newDueDate: z.string(),
    reason: z.string(),
  })),
})

const BriefingSchema = z.object({ message: z.string() })

export interface OverdueTaskRef {
  id: string
  title: string
  section: string
  priority: string
  dueDate: string
}

export interface RescheduleItem {
  taskId: string
  newDueDate: string
  reason: string
}

export interface ChatMessage {
  role: 'user' | 'fox'
  text: string
}

async function callFox<T>(body: Record<string, unknown>, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(FOX_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? `AI error ${res.status}`)
  }
  return schema.parse(await res.json())
}

export function planDay(tasks: FoxTaskRef[], wakeHour = 7) {
  return callFox({ action: 'plan', tasks, stats: { wakeHour } }, PlanSchema)
}

export function askFox(question: string, tasks: FoxTaskRef[], stats: Record<string, unknown> = {}) {
  return callFox({ action: 'ask', prompt: question, tasks, stats }, AnswerSchema)
}

export function breakDownTask(title: string, description = '') {
  return callFox({ action: 'breakdown', title, description }, BreakdownSchema)
}

export function energyCheck(mood: string, tasks: FoxTaskRef[]) {
  return callFox({ action: 'energy', mood, tasks }, EnergySchema)
}

export function coachInsight(stats: Record<string, unknown>) {
  return callFox({ action: 'coach', stats }, CoachSchema)
}

export function chatWithFox(messages: ChatMessage[], tasks: FoxTaskRef[], stats: Record<string, unknown> = {}) {
  return callFox({ action: 'chat', messages, tasks, stats }, ChatSchema)
}

export function rescheduleOverdue(overdueTasks: OverdueTaskRef[]) {
  return callFox({ action: 'reschedule', overdueTasks, now: new Date().toISOString() }, RescheduleSchema)
}

export function dailyBriefing(stats: Record<string, unknown>) {
  return callFox({ action: 'briefing', stats }, BriefingSchema)
}
