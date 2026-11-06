export type AiProvider = 'none' | 'mistral' | 'groq' | 'openrouter' | 'openai'

export interface AiProviderMeta {
  id: AiProvider
  label: string
  baseUrl: string
  defaultModel: string
  models: string[]
  getKeyUrl: string
}

export const AI_PROVIDERS: AiProviderMeta[] = [
  {
    id: 'mistral',
    label: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1',
    defaultModel: 'mistral-small-latest',
    models: ['mistral-small-latest', 'open-mistral-7b', 'mistral-medium-latest'],
    getKeyUrl: 'https://console.mistral.ai/api-keys',
  },
  {
    id: 'groq',
    label: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    defaultModel: 'llama-3.3-70b-versatile',
    models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma2-9b-it'],
    getKeyUrl: 'https://console.groq.com/keys',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    models: ['meta-llama/llama-3.3-70b-instruct:free', 'moonshotai/kimi-k2-instruct:free'],
    getKeyUrl: 'https://openrouter.ai/settings/keys',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    models: ['gpt-4o-mini', 'gpt-4o'],
    getKeyUrl: 'https://platform.openai.com/api-keys',
  },
]

export function providerOf(id: AiProvider): AiProviderMeta | undefined {
  return AI_PROVIDERS.find((p) => p.id === id)
}

export interface AiRequest {
  provider: AiProvider
  keys?: string[]
  apiKey?: string
  model: string
  baseUrl: string
  system: string
  user: string
}

let round = 0

function normalizeB64Key(key: string): string {
  return key.trim().replace(/^["'\s]+|["'\s]+$/g, '').replace(/,\s*$/, '')
}

async function callOnce(opts: AiRequest & { apiKey: string }): Promise<string> {
  const base = (opts.baseUrl || providerOf(opts.provider)?.baseUrl || '').replace(/\/+$/, '')
  if (!base) throw new Error('URL de la API vacía')
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.apiKey}`,
    },
    body: JSON.stringify({
      model: opts.model,
      messages: [
        { role: 'system', content: opts.system },
        { role: 'user', content: opts.user },
      ],
      max_tokens: 220,
      temperature: 0.4,
    }),
  })
  if (!res.ok) {
    let detail = ''
    try {
      const b = await res.json()
      detail = b?.error?.message ?? JSON.stringify(b).slice(0, 140)
    } catch {
      detail = await res.text().then((t) => t.slice(0, 140))
    }
    throw new Error(`Error ${res.status} (${opts.provider}): ${detail || 'sin detalle'}`)
  }
  const data = await res.json()
  const content: unknown = data?.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('La IA no respondió nada')
  }
  return content.trim()
}

export async function askAI(opts: AiRequest): Promise<string> {
  const keys = (opts.keys?.length ? opts.keys : opts.apiKey ? [opts.apiKey] : [])
    .map(normalizeB64Key)
    .filter(Boolean)
  if (opts.provider === 'none' || keys.length === 0) {
    throw new Error('No hay asistente configurado ni keys disponibles')
  }

  let lastErr: unknown = null
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const key = keys[round % keys.length]
    round++
    try {
      return await callOnce({ ...opts, apiKey: key })
    } catch (err) {
      lastErr = err
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Fallaron todas las keys')
}