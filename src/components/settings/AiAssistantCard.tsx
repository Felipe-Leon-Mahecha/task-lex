import { useState } from 'react'
import { Check, ExternalLink, KeyRound, Loader2, Lock, Plus, Sparkles, X } from 'lucide-react'
import { AI_PROVIDERS, askAI, providerOf } from '../../lib/assistant'
import { useAiStore } from '../../store/ai'

export default function AiAssistantCard() {
  const provider = useAiStore((s) => s.provider)
  const keys = useAiStore((s) => s.keys)
  const model = useAiStore((s) => s.model)
  const baseUrl = useAiStore((s) => s.baseUrl)
  const setProvider = useAiStore((s) => s.setProvider)
  const addKeys = useAiStore((s) => s.addKeys)
  const removeKey = useAiStore((s) => s.removeKey)
  const setModel = useAiStore((s) => s.setModel)
  const setBaseUrl = useAiStore((s) => s.setBaseUrl)

  const [paste, setPaste] = useState('')
  const [testing, setTesting] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null)

  const enabled = provider !== 'none'
  const meta = providerOf(provider)
  const activeKeys = keys.map((k) => k.trim()).filter(Boolean)

  const test = async () => {
    setTesting(true)
    setResult(null)
    try {
      const out = await askAI({
        provider,
        keys: activeKeys,
        model: model || meta?.defaultModel || '',
        baseUrl,
        system: 'Respondé con una sola palabra: OK',
        user: 'Hola',
      })
      setResult({ ok: true, text: out.slice(0, 60) })
    } catch (err) {
      setResult({ ok: false, text: err instanceof Error ? err.message : 'Falló la prueba' })
    } finally {
      setTesting(false)
    }
  }

  const handleAdd = () => {
    const added = addKeys(paste)
    setResult(added.length ? { ok: true, text: `Se agregaron ${added.length} key(s) al pool.` } : { ok: false, text: 'Ninguna key nueva (ya estaban o no había).' })
    setPaste('')
  }

  return (
    <div className="card w-full p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[var(--accent)]" />
        <p className="text-sm font-semibold">Asistente IA para Temporadas</p>
      </div>
      <p className="mt-1 text-sm leading-relaxed text-[var(--text-muted)]">
        Las preguntas de lore las inventa una IA sobre el tema que te toque. Si una key se agota, la app rota sola a la
        siguiente. Sin key usa el cuestionario local.
      </p>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-[var(--text)]">Asistente</span>
        <button
          onClick={() => {
            setResult(null)
            if (provider === 'none') setProvider('mistral')
            else setProvider('none')
          }}
          className={`relative h-6 w-11 rounded-full transition-colors ${enabled ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'}`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              enabled ? 'left-[1.35rem]' : 'left-0.5'
            }`}
          />
        </button>
      </div>

      {provider !== 'none' && (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Proveedor</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value as typeof provider)}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none"
            >
              <option value="none">Apagado</option>
              {AI_PROVIDERS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {meta && (
            <a
              href={meta.getKeyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Sacar mi key gratis en {meta.label}
            </a>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
              Pool de keys ({activeKeys.length}) — se rotan solas
            </label>
            {activeKeys.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {activeKeys.map((k) => (
                  <span
                    key={k}
                    className="flex items-center gap-1 rounded-full border border-[var(--border)] bg-[var(--surface-2)] py-0.5 pl-2 pr-1 text-[11px] font-semibold text-[var(--text-muted)]"
                  >
                    <KeyRound className="h-3 w-3" /> {k.slice(0, 9)}…{k.slice(-4)}
                    <button
                      onClick={() => removeKey(k)}
                      className="grid h-4 w-4 place-items-center rounded-full hover:bg-red-500/10 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              rows={3}
              placeholder="Pegá varias keys aquí, una por línea…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none transition-colors focus:border-[var(--accent)]"
            />
            <button onClick={handleAdd} disabled={!paste.trim()} className="btn-primary mt-2">
              <Plus className="h-4 w-4" /> Agregar key(s) al pool
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Modelo</label>
            <input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              list="ai-models"
              placeholder={meta?.defaultModel}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text)] outline-none"
            />
            <datalist id="ai-models">
              {meta?.models.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
          </div>

          {meta && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">URL base</label>
              <input
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={meta.baseUrl}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm text-[var(--text-muted)] outline-none"
              />
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={test} disabled={testing || activeKeys.length === 0} className="btn-primary">
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Probar conexión
            </button>
            {result && (
              <p className={`flex items-center gap-1 text-xs ${result.ok ? 'text-emerald-400' : 'text-red-400'}`}>
                {result.ok ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />} {result.text}
              </p>
            )}
          </div>

          <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-[var(--text-muted)]">
            <Lock className="mt-0.5 h-3 w-3 shrink-0" />
            Las keys quedan guardadas solo en este dispositivo (localStorage), nunca en el código ni en la nube. Se usan
            únicamente al sortear una temporada.
          </p>
        </div>
      )}
    </div>
  )
}