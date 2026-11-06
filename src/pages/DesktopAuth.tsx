import { useEffect, useState } from 'react'
import { ArrowUpRight, LoaderCircle, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'
import { GoogleAuthProvider, getRedirectResult, signInWithRedirect } from 'firebase/auth'
import { useLocation } from 'react-router-dom'
import { auth } from '../lib/firebase'

const DESKTOP_AUTH_STATE_KEY = 'quacker-desktop-auth-state'

async function returnToDesktop(idToken: string, state: string) {
  const response = await fetch('/api/desktop-auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'create', idToken }),
  })
  const result = await response.json()
  if (!response.ok || typeof result.ticket !== 'string') throw new Error(result.error || 'No se pudo preparar el regreso a Quacker.')
  window.location.href = `quacker://auth?state=${encodeURIComponent(state)}&ticket=${encodeURIComponent(result.ticket)}`
}

export default function DesktopAuth() {
  const location = useLocation()
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!auth) return
    let active = true
    void getRedirectResult(auth).then(async (credential) => {
      if (!active || !credential) return
      const state = sessionStorage.getItem(DESKTOP_AUTH_STATE_KEY) ?? ''
      sessionStorage.removeItem(DESKTOP_AUTH_STATE_KEY)
      if (!/^[a-f0-9]{48}$/.test(state)) {
        setError('La sesión se inició, pero el regreso a Quacker venció. Vuelve a la app e inténtalo otra vez.')
        return
      }
      setBusy(true)
      setMessage('Cuenta verificada. Regresando a Quacker…')
      try {
        await returnToDesktop(await credential.user.getIdToken(true), state)
      } catch (cause) {
        if (!active) return
        setError(cause instanceof Error ? cause.message : 'No se pudo conectar la cuenta con Quacker.')
        setMessage('Puedes volver a la app de Windows e intentarlo de nuevo.')
        setBusy(false)
      }
    }).catch((cause: unknown) => {
      if (!active) return
      const code = (cause as { code?: string })?.code
      if (code) {
        setError(code === 'auth/unauthorized-domain'
          ? 'El dominio de Quacker no está autorizado en Firebase Authentication.'
          : 'Google no pudo completar el acceso. Vuelve a la app de Windows e inténtalo otra vez.')
        setMessage('El acceso no se completó; puedes volver a la app de Windows.')
      }
      sessionStorage.removeItem(DESKTOP_AUTH_STATE_KEY)
    })
    return () => { active = false }
  }, [])

  const connect = async () => {
    const state = new URLSearchParams(location.search).get('state')
    if (!state || !/^[a-f0-9]{48}$/.test(state)) {
      setError('Este enlace ya venció. Vuelve a Quacker para iniciar sesión otra vez.')
      return
    }
    if (!auth) {
      setError('No se pudo conectar con el servicio de cuentas de Quacker.')
      return
    }
    setBusy(true)
    setError('')
    setMessage('Abriendo el acceso seguro de Google…')
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      sessionStorage.setItem(DESKTOP_AUTH_STATE_KEY, state)
      setMessage('Google abrirá el acceso y luego volverás aquí para conectar Quacker…')
      await signInWithRedirect(auth, provider)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión con Google.')
      setMessage('Puedes volver a la app de Windows e intentarlo de nuevo.')
      setBusy(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[var(--bg)] p-5 text-[var(--text)]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_15%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent_44%),radial-gradient(ellipse_at_90%_85%,rgba(56,189,248,.08),transparent_38%)]" />
      <section className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-[var(--accent)]/20 bg-[var(--surface)]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-9">
        <div aria-hidden="true" className="absolute -right-14 -top-14 h-44 w-44 rounded-full border border-[var(--accent)]/10" />
        <div className="relative flex items-center gap-3">
          <img src="/icons/icon-192.png" alt="" className="h-12 w-12 rounded-2xl shadow-lg" />
          <div><p className="text-xs font-bold uppercase tracking-[.18em] text-[var(--accent)]">Quacker para Windows</p><h1 className="text-xl font-extrabold">Conecta tu cuenta</h1></div>
        </div>
        <div className="mt-7 rounded-2xl border border-[var(--border)] bg-[var(--bg)]/65 p-4">
          <div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]"><LockKeyhole className="h-5 w-5" /></span><div><p className="text-sm font-bold">Acceso seguro con Google</p><p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">Google se abre en tu navegador habitual. Al terminar, regresarás a la aplicación de Quacker para Windows.</p></div></div>
        </div>
        {message && <p role="status" className="mt-4 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/[.06] p-3 text-sm text-[var(--text-muted)]">{message}</p>}
        {error && <p role="alert" className="mt-3 rounded-xl border border-rose-400/25 bg-rose-400/[.06] p-3 text-sm text-rose-300">{error}</p>}
        <button onClick={() => void connect()} disabled={busy} className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-extrabold text-[var(--accent-text)] shadow-lg shadow-[var(--accent)]/15 transition hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-70">
          {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
          {busy ? 'Conectando…' : 'Continuar con Google'}
        </button>
        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-[var(--text-muted)]"><ShieldCheck className="h-3.5 w-3.5 text-emerald-400" /> La conexión vuelve a Quacker con un pase temporal de un solo uso.</div>
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-[.15em] text-[var(--text-muted)]"><Sparkles className="h-3 w-3 text-[var(--accent)]" /> Hecho para volver a la app</div>
      </section>
    </main>
  )
}
