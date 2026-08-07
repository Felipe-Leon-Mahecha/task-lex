import { useState, type FormEvent } from 'react'
import { useAuthStore } from '../store/auth'

const field =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]'

export default function Login() {
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const error = useAuthStore((s) => s.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    const ok = mode === 'in' ? await signIn(email, password) : await signUp(email, password)
    setBusy(false)
    if (ok) {
      setEmail('')
      setPassword('')
    }
  }

  const google = async () => {
    if (busy) return
    setBusy(true)
    await signInWithGoogle()
    setBusy(false)
  }

  return (
    <div className="flex h-full items-center justify-center p-4">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-5 flex items-center gap-2">
          <img src="/icons/icon-192.png" alt="" className="h-9 w-9 rounded-lg" />
          <h1 className="text-lg font-bold tracking-tight">Flux</h1>
        </div>
        <p className="eyebrow mb-4">{mode === 'in' ? 'Iniciar sesión' : 'Crear cuenta'}</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={field}
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={field}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
            {mode === 'in' ? 'Entrar' : 'Registrarme'}
          </button>
        </form>
        <button
          onClick={google}
          disabled={busy}
          className="mt-2 w-full rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
        >
          Continuar con Google
        </button>
        <p className="mt-4 text-center text-xs text-[var(--text-muted)]">
          {mode === 'in' ? '¿Sin cuenta?' : '¿Ya tienes cuenta?'}{' '}
          <button
            onClick={() => setMode(mode === 'in' ? 'up' : 'in')}
            className="text-[var(--accent)] hover:underline"
          >
            {mode === 'in' ? 'Regístrate' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  )
}
