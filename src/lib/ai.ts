import { z } from 'zod'
import { apiUrl } from './apiUrl'
import { auth } from './firebase'

const PARSE_URL = apiUrl('/api/parse-task')

export const ParsedTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().default(''),
  dueDate: z.string().nullable().default(null).transform((val) => {
    if (!val) return null
    try {
      const d = new Date(val)
      if (isNaN(d.getTime())) return null
      return d.toISOString()
    } catch {
      return null
    }
  }),
  priority: z.enum(['baja', 'media', 'alta']).default('media'),
  tags: z.array(z.string()).default([]),
})

export type ParsedTask = z.infer<typeof ParsedTaskSchema>

export async function parseTaskWithAI(prompt: string): Promise<ParsedTask> {
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
  const res = await fetch(PARSE_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `AI error ${res.status}`)
  }

  const raw = await res.json()
  return ParsedTaskSchema.parse(raw)
}
