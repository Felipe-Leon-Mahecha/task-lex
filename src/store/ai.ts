import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AiProvider } from '../lib/assistant'
import { providerOf } from '../lib/assistant'

interface AiConfigState {
  provider: AiProvider
  keys: string[]
  model: string
  baseUrl: string
  setProvider: (p: AiProvider) => void
  addKeys: (raw: string) => string[]
  removeKey: (key: string) => void
  setModel: (model: string) => void
  setBaseUrl: (url: string) => void
}

function cleanKeys(raw: string): string[] {
  const out: string[] = []
  for (const line of raw.split(/\r?\n|,|;/)) {
    const k = line.trim().replace(/^["'=\s]+|["'\s]+$/g, '')
    if (k && !out.includes(k)) out.push(k)
  }
  return out
}

function envSeedKeys(): string[] {
  const raw = import.meta.env.VITE_MISTRAL_KEYS ?? ''
  return cleanKeys(typeof raw === 'string' ? raw : String(raw))
}

const seeded = envSeedKeys()

type PersistedV0 = {
  provider?: AiProvider
  apiKey?: string
  keys?: string[]
  model?: string
  baseUrl?: string
}

export const useAiStore = create<AiConfigState>()(
  persist(
    (set, get) => ({
      provider: seeded.length ? 'mistral' : 'none',
      keys: seeded,
      model: seeded.length ? 'mistral-small-latest' : '',
      baseUrl: '',

      setProvider: (p) =>
        set((s) => {
          if (p === 'none') return { provider: 'none' }
          const meta = providerOf(p)
          return {
            provider: p,
            model: meta?.defaultModel ?? s.model,
            baseUrl: meta?.baseUrl ?? s.baseUrl,
          }
        }),

      addKeys: (raw) => {
        const merged = [...get().keys]
        const added: string[] = []
        for (const k of cleanKeys(raw)) {
          if (!merged.includes(k)) {
            merged.push(k)
            added.push(k)
          }
        }
        if (added.length) set({ keys: merged })
        return added
      },

      removeKey: (key) => set((s) => ({ keys: s.keys.filter((k) => k !== key) })),

      setModel: (model) => set({ model }),
      setBaseUrl: (url) => set({ baseUrl: url }),
    }),
    {
      name: 'task-lex-ai',
      version: 1,
      migrate: (persisted) => {
        const p = (persisted as PersistedV0) ?? {}
        if (Array.isArray(p.keys) && p.keys.length) {
          return { provider: p.provider ?? 'none', keys: p.keys, model: p.model ?? '', baseUrl: p.baseUrl ?? '' }
        }
        const legacy = (p.apiKey ?? '').trim()
        return {
          provider: p.provider ?? 'none',
          keys: legacy ? [legacy] : [],
          model: p.model ?? '',
          baseUrl: p.baseUrl ?? '',
        }
      },
    },
  ),
)