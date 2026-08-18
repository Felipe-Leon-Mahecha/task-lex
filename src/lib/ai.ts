import { z } from 'zod'

const PARSE_URL = '/api/parse-task'

export const ParsedTaskSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().default(''),
  dueDate: z.string().datetime().nullable().default(null),
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
