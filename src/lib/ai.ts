import { z } from 'zod'
import { Capacitor } from '@capacitor/core'

const API_HOST = Capacitor.getPlatform() === 'android'
  ? 'task-lex.vercel.app'
  : window.location.host
const PARSE_URL = `${window.location.protocol}//${API_HOST}/api/parse-task`

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
  const res = await fetch(PARSE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `AI error ${res.status}`)
  }

  const raw = await res.json()
  return ParsedTaskSchema.parse(raw)
}
