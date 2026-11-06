import { useEffect, useRef, useState } from 'react'
import { BrainCircuit, Check, Sparkles, X } from 'lucide-react'
import type { ThemeEntry } from '../../lib/seasons/catalog'
import { hexOf, hexToRgba2, primaryOf } from '../../lib/seasons/catalog'
import { aiGeneratedQuestion, answerMatches, randomQuestion, type Question } from '../../lib/seasons/quiz'
import { useAiStore } from '../../store/ai'
import Modal from '../ui/Modal'

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | null> {
  return Promise.race([
    p,
    new Promise<T | null>((res) => {
      setTimeout(() => res(null), ms)
    }),
  ])
}

export default function QuizModal({
  open,
  entry,
  onClose,
  onSuccess,
  onFail,
}: {
  open: boolean
  entry: ThemeEntry | null
  onClose: () => void
  onSuccess: () => void
  onFail: () => void
}) {
  const [question, setQuestion] = useState<Question | null>(null)
  const [source, setSource] = useState<'ia' | 'local'>('local')
  const [loading, setLoading] = useState(true)
  const [reveal, setReveal] = useState<null | { chosen: string; correct: string }>(null)
  const [status, setStatus] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [answer, setAnswer] = useState('')
  const [chosen, setChosen] = useState<string | null>(null)
  const [fails, setFails] = useState(0)
  const [retryKey, setRetryKey] = useState(0)
  const lastTextRef = useRef('')
  const prevKeyRef = useRef<string | null>(null)
  const wasOpenRef = useRef(false)
  const finishRef = useRef<null | 'success' | 'fail'>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const aiReady = useAiStore((s) => s.provider !== 'none' && s.keys.some((k) => k.trim().length > 0))
  const base = entry ? hexOf(primaryOf(entry)) : '#888'

  const finish = (kind: 'success' | 'fail') => {
    if (finishRef.current) return
    finishRef.current = kind
    onClose()
    if (kind === 'success') onSuccess()
    else onFail()
  }

  const handleClose = () => {
    if (currentReveal || status !== 'idle') finish(status === 'ok' ? 'success' : 'fail')
    else onClose()
  }

  useEffect(() => {
    if (!open || !entry) {
      if (!open) wasOpenRef.current = false
      return
    }
    const freshSession = !wasOpenRef.current
    wasOpenRef.current = true
    const isFresh = freshSession || prevKeyRef.current !== entry.key
    prevKeyRef.current = entry.key
    if (isFresh) finishRef.current = null
    let alive = true
    const load = async () => {
      setQuestion(null)
      setAnswer('')
      setChosen(null)
      setReveal(null)
      setStatus('idle')
      if (isFresh) setFails(0)
      setLoading(true)
      const avoidText = isFresh ? '' : lastTextRef.current
      let q: Question | null = null
      for (let i = 0; i < 6 && alive; i++) {
        try {
          if (aiReady) {
            const ai = await withTimeout(aiGeneratedQuestion(entry), 8000)
            q = ai ?? randomQuestion(entry)
          } else {
            q = randomQuestion(entry)
          }
        } catch {
          q = randomQuestion(entry)
        }
        if (q && q.question !== avoidText) break
      }
      if (!alive) return
      lastTextRef.current = q?.question ?? ''
      setSource(aiReady ? 'ia' : 'local')
      setQuestion(q)
      setLoading(false)
      setTimeout(() => {
        if (alive) inputRef.current?.focus()
      }, 120)
    }
    void load()
    return () => {
      alive = false
    }
  }, [open, entry?.key, retryKey])

  useEffect(() => {
    if (!open || status === 'idle') return
    const t = setTimeout(() => finish(status === 'ok' ? 'success' : 'fail'), status === 'ok' ? 900 : 1300)
    return () => clearTimeout(t)
  }, [status, open])

  if (!open || !entry) return null

  const currentReveal = reveal
  const questionText = question?.question ?? ''

  const submit = (value: string) => {
    if (status !== 'idle' || !question || currentReveal) return
    const ok =
      question.kind === 'mc' || question.kind === 'tf'
        ? value === question.correct
        : answerMatches(value, question.correct)

    if (ok) {
      setStatus('ok')
      return
    }
    const nf = fails + 1
    setFails(nf)
    setChosen(value)
    setReveal({ chosen: value, correct: question.correct })
    if (nf === 1) {
      setTimeout(() => {
        if (open) setRetryKey((k) => k + 1)
      }, 1300)
    } else {
      setTimeout(() => {
        if (open) setStatus('fail')
      }, 1300)
    }
  }

  const isMC = question?.kind === 'mc'
  const isTF = question?.kind === 'tf'
  const showOptions = isMC || isTF

  const optionClass = (opt: string): string => {
    if (!currentReveal && status !== 'ok') {
      return chosen === opt
        ? 'border-[var(--accent)] text-[var(--text)]'
        : 'border-[var(--border)] text-[var(--text)] hover:bg-[var(--surface-2)]'
    }
    if (status === 'ok' && opt === question?.correct) return 'border-emerald-400 text-emerald-400'
    if (currentReveal && opt === currentReveal.correct) return 'border-emerald-400 text-emerald-400'
    if (currentReveal && opt === currentReveal.chosen) return 'border-red-500 text-red-500'
    return 'border-[var(--border)] text-[var(--text-muted)]'
  }

  return (
    <Modal open={open} onClose={handleClose} title="La IA pregunta…">
      <div className="flex flex-col items-center gap-4">
        <div
          className="grid h-12 w-12 place-items-center rounded-full"
          style={{ background: `${hexToRgba2(base, 0.18)}`, color: base }}
        >
          <BrainCircuit className="h-6 w-6" />
        </div>
        <p className="text-center text-sm text-[var(--text-muted)]">
          Para re-sortear <strong className="text-[var(--text)]">{entry.name}</strong> respondé esto:
        </p>

        {loading && (
          <div className="flex flex-col items-center gap-2 py-4 text-center">
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)]">
              <Sparkles className="h-4 w-4 animate-pulse text-[var(--accent)]" /> La IA está pensando…
            </p>
            <p className="text-xs text-[var(--text-muted)]">Inventando una pregunta de lore sobre {entry.name}</p>
          </div>
        )}

        {!loading && question && (
          <>
            {source === 'ia' && (
              <p className="flex items-center gap-1.5 rounded-full bg-[var(--accent)]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--accent)]">
                <Sparkles className="h-3 w-3" /> Pregunta del asistente
              </p>
            )}
            <p className="text-center text-base font-bold leading-snug text-[var(--text)]">{questionText}</p>

            {showOptions && (
              <div className="grid w-full gap-2">
                {(question.options ?? []).map((opt) => {
                  const isOver = !!currentReveal || status !== 'idle'
                  return (
                    <button
                      key={opt}
                      disabled={isOver}
                      onClick={() => submit(opt)}
                      className={`flex items-center justify-between gap-2 rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors ${optionClass(opt)}`}
                    >
                      {opt}
                      {(currentReveal?.correct === opt || (status === 'ok' && opt === question.correct)) && (
                        <Check className="h-4 w-4 shrink-0" />
                      )}
                      {currentReveal?.chosen === opt && currentReveal.chosen !== currentReveal.correct && (
                        <X className="h-4 w-4 shrink-0" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}

            {!showOptions && (
              <div className="w-full">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    submit(answer)
                  }}
                  className="flex gap-2"
                >
                  <input
                    ref={inputRef}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={status !== 'idle' || !!currentReveal}
                    placeholder={question.hint ?? 'Tu respuesta…'}
                    className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                  />
                  <button type="submit" className="btn-primary" disabled={status !== 'idle' || !!currentReveal}>
                    Responder
                  </button>
                </form>
                {currentReveal && (
                  <div className="mt-3 flex flex-col gap-1.5">
                    <p className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-400">
                      <X className="h-4 w-4" /> Tu respuesta: “{currentReveal.chosen}”
                    </p>
                    <p className="flex items-center gap-2 rounded-xl border border-emerald-400/40 bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-400">
                      <Check className="h-4 w-4" /> Respuesta: “{currentReveal.correct}”
                    </p>
                  </div>
                )}
              </div>
            )}

            {currentReveal && fails === 1 && (
              <p className="flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-1.5 text-sm font-bold text-amber-400">
                <X className="h-4 w-4" /> Te queda 1 oportunidad… nueva pregunta en camino.
              </p>
            )}

            {status === 'ok' && (
              <p className="flex items-center gap-2 rounded-full bg-emerald-500/15 px-4 py-1.5 text-sm font-bold text-emerald-400">
                <Check className="h-4 w-4" /> ¡Bien ahí! Re-sorteando…
              </p>
            )}
            {status === 'fail' && (
              <p className="flex items-center gap-2 rounded-full bg-red-500/15 px-4 py-1.5 text-sm font-bold text-red-500">
                <X className="h-4 w-4" /> Sin oportunidades esta vez 🙃
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  )
}