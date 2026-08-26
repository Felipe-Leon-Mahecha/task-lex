import { useEffect, useState } from 'react'
import { Copy, Gift, Share2, Check } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Share } from '@capacitor/share'
import { useAuthStore } from '../../store/auth'

const REASONS: Record<string, string> = {
  ya_canjeado: 'Ya canjeaste un código de invitación antes',
  codigo_propio: 'Ese es tu propio código',
  codigo_invalido: 'El código no existe, revisa bien',
}

export default function InviteCard() {
  const user = useAuthStore((s) => s.user)
  const [myCode, setMyCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [input, setInput] = useState('')
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [alreadyUsed, setAlreadyUsed] = useState(false)

  useEffect(() => {
    if (!user) return
    const host = Capacitor.getPlatform() === 'android' ? 'task-lex.vercel.app' : window.location.host
    fetch(`${window.location.protocol}//${host}/api/referral`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'code', uid: user.uid }),
    })
      .then((r) => r.json())
      .then((d) => setMyCode(d.code || ''))
      .catch(() => {})
  }, [user])

  const handleRedeem = async () => {
    if (!user || !input.trim() || busy) return
    setBusy(true)
    setMsg(null)
    try {
      const host = Capacitor.getPlatform() === 'android' ? 'task-lex.vercel.app' : window.location.host
      const res = await fetch(`${window.location.protocol}//${host}/api/referral`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'redeem', uid: user.uid, code: input }),
      })
      const d = await res.json()
      if (d.ok) {
        setMsg({ ok: true, text: `¡Canjeado! Ganaste ${d.reward} monedas` })
        setInput('')
      } else if (d.reason === 'ya_canjeado') {
        setAlreadyUsed(true)
        setMsg({ ok: false, text: REASONS[d.reason] })
      } else {
        setMsg({ ok: false, text: REASONS[d.reason] || 'No se pudo canjear' })
      }
    } catch {
      setMsg({ ok: false, text: 'Error de conexión, inténtalo de nuevo' })
    } finally {
      setBusy(false)
    }
  }

  const handleShare = async () => {
    const text = `Únete a Flux con mi código ${myCode} y gana monedas gratis: https://task-lex.vercel.app`
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({ title: 'Flux — Invita y gana', text, dialogTitle: 'Compartir código' })
      } else {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {}
  }

  return (
    <div className="card mb-4 max-w-lg p-5">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <Gift className="h-4 w-4 text-[var(--accent)]" /> Invita y gana
      </p>
      <p className="mt-1 text-sm text-[var(--text-muted)]">
        Comparte tu código: tu amigo gana <span className="font-bold text-[var(--accent)]">100 monedas</span> y tú ganas{' '}
        <span className="font-bold text-[var(--accent)]">200</span> cuando lo canjee.
      </p>

      {myCode ? (
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 rounded-xl border border-dashed border-[var(--accent)]/60 bg-[var(--accent)]/10 px-3 py-2.5 text-center text-lg font-extrabold tracking-[0.3em] text-[var(--accent)]">
            {myCode}
          </code>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--bg)] transition-transform active:scale-95"
          >
            {copied ? <Check className="h-4 w-4" /> : Capacitor.isNativePlatform() ? <Share2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copiado' : Capacitor.isNativePlatform() ? 'Compartir' : 'Copiar'}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <div className="h-10 flex-1 animate-pulse rounded-xl bg-[var(--surface)]" />
          <div className="h-10 w-24 animate-pulse rounded-full bg-[var(--surface)]" />
        </div>
      )}

      {!alreadyUsed && (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">¿Tienes un código de un amigo?</p>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value.toUpperCase())}
              maxLength={8}
              placeholder="ABCD1234"
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm font-bold tracking-widest text-[var(--text)] outline-none focus:border-[var(--accent)]"
            />
            <button
              onClick={handleRedeem}
              disabled={busy || !input.trim()}
              className="rounded-full bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-[var(--bg)] transition-transform active:scale-95 disabled:opacity-40"
            >
              {busy ? '...' : 'Canjear'}
            </button>
          </div>
          {msg && (
            <p className={`mt-2 flex items-center gap-1 text-xs font-semibold ${msg.ok ? 'text-emerald-400' : 'text-red-400'}`}>
              {msg.ok && <Check className="h-3.5 w-3.5" />} {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
