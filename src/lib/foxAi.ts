import { z } from 'zod'
import { auth } from './firebase'
import { apiUrl } from './apiUrl'

const FOX_URL = apiUrl('/api/fox')

export interface FoxTaskRef {
  id: string
  title: string
  section: string
  sectionId?: string
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

const AssistantActionSchema = z.object({
  type: z.enum(['create_task', 'update_task', 'create_note', 'update_note', 'create_section', 'rename_section', 'create_week_block', 'update_week_block', 'equip_skin', 'set_active_pet', 'navigate']),
  summary: z.string(),
  targetId: z.string().optional(), title: z.string().optional(), description: z.string().optional(), content: z.string().optional(),
  sectionId: z.string().optional(), folderId: z.string().optional(), priority: z.enum(['baja', 'media', 'alta']).optional(), dueDate: z.string().optional(),
  start: z.string().optional(), end: z.string().optional(), days: z.array(z.number().int().min(0).max(6)).optional(), date: z.string().optional(), details: z.string().optional(),
  pet: z.enum(['fox', 'quackington']).optional(), skinId: z.string().optional(), route: z.string().optional(),
  icon: z.string().optional(),
})
export type AssistantAction = z.infer<typeof AssistantActionSchema>
const ChatSchema = z.object({ reply: z.string(), actions: z.array(AssistantActionSchema).max(3).default([]) })

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

async function buildHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (!auth?.currentUser) throw new Error('Sesión no iniciada. Vuelve a entrar a tu cuenta.')
  try {
    const token = await auth.currentUser.getIdToken()
    if (!token) throw new Error('Sesión expirada. Vuelve a entrar a tu cuenta.')
    headers.Authorization = `Bearer ${token}`
  } catch (e) {
    if (e instanceof Error && /sesi[oó]n/i.test(e.message)) throw e
    throw new Error('Sesión expirada. Vuelve a entrar a tu cuenta.')
  }
  return headers
}

async function callFox<T>(body: Record<string, unknown>, schema: z.ZodType<T>): Promise<T> {
  const res = await fetch(FOX_URL, {
    method: 'POST',
    headers: await buildHeaders(),
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

export function chatWithFox(messages: ChatMessage[], tasks: FoxTaskRef[], stats: Record<string, unknown> = {}, pet: 'fox' | 'quackington' = 'fox', petName?: string, appContext: Record<string, unknown> = {}) {
  return callFox({ action: 'chat', messages, tasks, stats, pet, petName, appContext }, ChatSchema)
}

export function rescheduleOverdue(overdueTasks: OverdueTaskRef[]) {
  return callFox({ action: 'reschedule', overdueTasks, now: new Date().toISOString() }, RescheduleSchema)
}

export function dailyBriefing(stats: Record<string, unknown>) {
  return callFox({ action: 'briefing', stats }, BriefingSchema)
}
