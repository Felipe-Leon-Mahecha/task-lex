import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Dices, Eye, EyeOff, ListTodo, Loader2, Lock, Mail, Sparkles, Timer } from 'lucide-react'
import { useAuthStore } from '../store/auth'

interface Floater {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  kind: 0 | 1 | 2 | 3
  rot: number
  vr: number
  flash: number
}

function PhysicsBg() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    const parent = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !parent || !ctx) return
    const css = getComputedStyle(parent)
    const accent = (css.getPropertyValue('--accent') || '').trim() || '#D9A02B'
    const muted = (css.getPropertyValue('--text-muted') || '').trim() || '#9c9c9c'
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = 0
    let h = 0
    let raf = 0
    let items: Floater[] = []
    const statics = [
      { x: 0.85, y: 0.12, r: 90 },
      { x: 0.1, y: 0.75, r: 120 },
      { x: 0.5, y: 0.95, r: 70 },
    ]

    const resize = () => {
      const rect = parent.getBoundingClientRect()
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const spawn = (): Floater => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 36,
      vy: (Math.random() - 0.5) * 36,
      r: 16 + Math.random() * 26,
      kind: Math.floor(Math.random() * 4) as Floater['kind'],
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.6,
      flash: 0,
    })

    const drawShape = (f: Floater) => {
      ctx.save()
      ctx.translate(f.x, f.y)
      ctx.rotate(f.rot)
      const a = 0.22 + f.flash * 0.55
      ctx.globalAlpha = Math.min(1, a)
      ctx.strokeStyle = accent
      ctx.fillStyle = accent
      ctx.lineWidth = 1.5
      ctx.shadowBlur = f.flash * 22
      ctx.shadowColor = accent
      const r = f.r
      if (f.kind === 0) {
        const w2 = r * 1.5
        const h2 = r * 1.7
        const cr = r * 0.55
        ctx.beginPath()
        ctx.moveTo(-w2 / 2 + cr, -h2 / 2)
        ctx.arcTo(w2 / 2, -h2 / 2, w2 / 2, -h2 / 2 + cr, cr)
        ctx.arcTo(w2 / 2, h2 / 2, w2 / 2 - cr, h2 / 2, cr * 0.7)
        ctx.arcTo(-w2 / 2, h2 / 2, -w2 / 2, h2 / 2 - cr, cr * 0.7)
        ctx.arcTo(-w2 / 2, -h2 / 2, -w2 / 2 + cr, -h2 / 2, cr)
        ctx.closePath()
        ctx.stroke()
      } else if (f.kind === 1) {
        ctx.beginPath()
        ctx.ellipse(0, 0, r * 1.7, r * 0.62, 0, 0, Math.PI * 2)
        ctx.stroke()
        ctx.globalAlpha = Math.min(1, a * 0.6)
        ctx.beginPath()
        ctx.ellipse(0, 0, r * 1.1, r * 0.34, 0, 0, Math.PI * 2)
        ctx.stroke()
      } else if (f.kind === 2) {
        ctx.beginPath()
        ctx.arc(0, r * 0.35, r * 0.42, Math.PI * 1.15, Math.PI * 1.85)
        ctx.stroke()
        for (let k = -1; k <= 1; k++) {
          const ang = -Math.PI / 2 + k * 0.5
          ctx.beginPath()
          ctx.moveTo(Math.cos(ang) * r * 0.25, Math.sin(ang) * r * 0.25 - r * 0.05)
          ctx.lineTo(Math.cos(ang) * r * 0.95, Math.sin(ang) * r * 0.95 - r * 0.05)
          ctx.stroke()
        }
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, r * 0.7, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(r * 0.9, -r * 0.7, r * 0.12, 0, Math.PI * 2)
        ctx.globalAlpha = Math.min(1, a + 0.15)
        ctx.fill()
      }
      ctx.restore()
    }

    const drawStatics = () => {
      ctx.save()
      ctx.globalAlpha = 0.1
      ctx.strokeStyle = muted
      ctx.lineWidth = 1
      for (const s of statics) {
        ctx.beginPath()
        ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2)
        ctx.stroke()
      }
      ctx.restore()
    }

    const step = (dt: number) => {
      for (const f of items) {
        f.x += f.vx * dt
        f.y += f.vy * dt
        f.rot += f.vr * dt
        f.flash *= 0.94
        const m = 8
        if (f.x < f.r + m) {
          f.x = f.r + m
          f.vx = Math.abs(f.vx) * 0.98
        }
        if (f.x > w - f.r - m) {
          f.x = w - f.r - m
          f.vx = -Math.abs(f.vx) * 0.98
        }
        if (f.y < f.r + m) {
          f.y = f.r + m
          f.vy = Math.abs(f.vy) * 0.98
        }
        if (f.y > h - f.r - m) {
          f.y = h - f.r - m
          f.vy = -Math.abs(f.vy) * 0.98
        }
      }
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i]!
          const b = items[j]!
          const dx = b.x - a.x
          const dy = b.y - a.y
          const dist = Math.hypot(dx, dy) || 0.001
          const min = a.r + b.r
          if (dist >= min) continue
          const nx = dx / dist
          const ny = dy / dist
          const ma = a.r * a.r
          const mb = b.r * b.r
          const overlap = (min - dist) / 2
          a.x -= nx * overlap
          a.y -= ny * overlap
          b.x += nx * overlap
          b.y += ny * overlap
          const van = a.vx * nx + a.vy * ny
          const vbn = b.vx * nx + b.vy * ny
          if (van - vbn <= 0) continue
          const p = (2 * (van - vbn)) / (ma + mb)
          a.vx -= p * mb * nx
          a.vy -= p * mb * ny
          b.vx += p * ma * nx
          b.vy += p * ma * ny
          a.flash = 1
          b.flash = 1
        }
      }
    }

    const paint = () => {
      ctx.clearRect(0, 0, w, h)
      drawStatics()
      for (const f of items) drawShape(f)
    }

    resize()
    items = Array.from({ length: 13 }, spawn)
    if (reduced) {
      step(0.016)
      paint()
      return
    }
    let last = performance.now()
    const frame = (now: number) => {
      const dt = Math.min(Math.max((now - last) / 1000, 0.001), 0.05)
      last = now
      step(dt)
      paint()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const onVis = () => {
      if (document.visibilityState === 'hidden') {
        cancelAnimationFrame(raf)
        raf = 0
      } else if (!raf) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={ref} className="absolute inset-0" />
      <div className="anim-glow absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[var(--accent)]/15 blur-3xl" />
      <div
        className="anim-glow absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-[var(--accent)]/10 blur-3xl"
        style={{ animationDelay: '-3.5s' }}
      />
      <div className="anim-glow absolute left-[8%] top-[38%] h-40 w-40 rounded-full bg-[var(--accent)]/10 blur-3xl" style={{ animationDelay: '-5s' }} />
      <div className="absolute left-0 top-[30%] h-px w-[130%] -rotate-12 bg-gradient-to-r from-transparent via-[var(--accent)]/30 to-transparent" />
      <div className="absolute bottom-[22%] left-0 h-px w-[130%] rotate-[8deg] bg-gradient-to-r from-transparent via-[var(--accent)]/20 to-transparent" />
      <svg className="anim-drift absolute left-[-10%] top-[55%] w-[120%]" viewBox="0 0 800 120" fill="none">
        <path
          d="M-20 70 Q 100 20 220 60 T 460 55 T 700 65 T 920 50"
          stroke="var(--accent)"
          strokeOpacity="0.35"
          strokeWidth="1.5"
          strokeDasharray="5 9"
          strokeLinecap="round"
          className="anim-dash"
        />
      </svg>
      <svg className="anim-drift absolute left-[-15%] top-[12%] w-[130%] opacity-70" viewBox="0 0 800 120" fill="none" style={{ animationDuration: '19s', animationDelay: '-7s' }}>
        <path
          d="M-20 60 Q 140 100 300 50 T 620 60 T 920 45"
          stroke="var(--accent)"
          strokeOpacity="0.22"
          strokeWidth="1.2"
          strokeDasharray="3 11"
          strokeLinecap="round"
          className="anim-dash"
        />
      </svg>
    </div>
  )
}

const QUACK_TIPS = [
  '¿Qué le dice un pato a otro? Nos vemos en el pan-tano.',
  'Mi psicólogo dice que hable de mis traumas. Mi trauma: quedarme sin pan.',
  'Un pato no necesita GPS: huele el pan a 3 km.',
  '¿Por qué el pato cruzó la calle? Al otro lado vendían pan caliente.',
  'Ser adulto es pagar cuentas. Ser pato es comer pan. Elige sabio.',
  'El pato no madruga: el pan lo espera.',
  'Los patos duermen con medio cerebro despierto. Productividad extrema.',
  'Las plumas del pato repelen el agua gracias a un aceite especial.',
  'Un pato ve casi 360° sin mover la cabeza. Como tus tareas aquí: nada se escapa.',
  'Dicen que el cuack no tiene eco. La ciencia sigue debatiéndolo.',
  'Los patitos siguen a lo primero que ven al nacer. Elige bien a quién sigues.',
  'Algunos patos migran miles de kilómetros al año. Y tú sin salir de casa.',
  'El pico del pato tiene sensores para encontrar comida bajo el agua.',
  'Hay más de 120 especies de patos en el mundo. Este es el más elegante.',
]

function GoogleMark({ className = 'h-[18px] w-[18px]' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45c-.28 1.48-1.12 2.73-2.4 3.58v2.97h3.87c2.27-2.09 3.58-5.17 3.58-8.74z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28v-3.1H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.1z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.76 0 3.34.6 4.58 1.8l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.1c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  )
}

const FEATURES = [
  { icon: ListTodo, title: 'Todo en su lugar', desc: 'Tareas, notas y planes semanales en un espacio claro.' },
  { icon: Timer, title: 'Un paso a la vez', desc: 'Planifica, enfócate y celebra tu progreso.' },
  { icon: Sparkles, title: 'Ayuda cuando la necesitas', desc: 'El asistente te ayuda a organizarte y tu mascota te acompaña.' },
]

export default function Login() {
  const signIn = useAuthStore((s) => s.signIn)
  const signUp = useAuthStore((s) => s.signUp)
  const signInWithGoogle = useAuthStore((s) => s.signInWithGoogle)
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset)
  const error = useAuthStore((s) => s.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mode, setMode] = useState<'in' | 'up'>('in')
  const [busy, setBusy] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [tipIdx, setTipIdx] = useState(() => Math.floor(Math.random() * QUACK_TIPS.length))

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

  const resetPassword = async () => {
    if (busy) return
    setBusy(true)
    const ok = await sendPasswordReset(email)
    setBusy(false)
    if (ok) setResetSent(true)
  }

  const google = async () => {
    if (busy) return
    setBusy(true)
    await signInWithGoogle()
    setBusy(false)
  }

  return (
    <div className="relative flex h-full flex-col items-center justify-center gap-4 overflow-y-auto p-4">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--accent)]/10 via-transparent to-transparent"
      />
      <PhysicsBg />
      <div className="card relative w-full max-w-3xl overflow-hidden p-0 md:grid md:grid-cols-[1fr_1.15fr]">
        <div className="hidden flex-col justify-between gap-8 bg-gradient-to-br from-[var(--accent)]/25 via-[var(--accent)]/5 to-transparent p-8 md:flex">
          <div className="flex items-center gap-3">
            <img src="/icons/icon-192.png" alt="" className="h-11 w-11 rounded-2xl shadow-lg" />
            <div>
              <p className="text-lg font-extrabold leading-none tracking-tight">Quacker</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">Organiza lo importante, cada día</p>
            </div>
          </div>
          <div>
            <p className="eyebrow mb-2">Tu espacio para avanzar</p>
            <h1 className="max-w-sm text-3xl font-extrabold leading-[1.08] tracking-tight text-[var(--text)]">
              Tu día, con más orden y menos ruido.
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--text-muted)]">
              Reúne tus pendientes, ideas y planes para que sepas qué sigue y puedas enfocarte.
            </p>
          </div>
          <ul className="space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]">
                  <f.icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-[var(--text)]">{f.title}</span>
                  <span className="mt-0.5 block text-xs leading-snug text-[var(--text-muted)]">{f.desc}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-[11px] leading-relaxed text-[var(--text-muted)]">
            Tus cambios se sincronizan entre web y Android para que continúes donde quedaste.
          </p>
        </div>
        <div className="p-6 sm:p-8">
          <div className="mb-5 flex items-center gap-2.5 md:hidden">
            <img src="/icons/icon-192.png" alt="" className="h-10 w-10 rounded-xl shadow-lg" />
            <div>
              <p className="text-base font-extrabold leading-none tracking-tight">Quacker</p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Organiza lo importante, cada día</p>
            </div>
          </div>
          <p className="eyebrow mb-1">{mode === 'in' ? 'Iniciar sesión' : 'Crear cuenta'}</p>
          <p className="mb-5 text-xs text-[var(--text-muted)]">
            {mode === 'in' ? 'Qué bueno verte de nuevo.' : 'Empieza a organizarte en segundos.'}
          </p>
          <form onSubmit={submit} className="space-y-3">
            <label className="relative block">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="email"
                required
                placeholder="Correo"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
            </label>
            <label className="relative block">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Contraseña"
                autoComplete={mode === 'in' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 pl-9 pr-10 text-sm outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </label>
            {error && <p className="text-xs text-red-400">{error}</p>}
            {resetSent && (
              <p className="text-xs text-[var(--accent)]">
                Revisa tu correo: te enviamos un link para restablecer la contraseña.
              </p>
            )}
            <button type="submit" disabled={busy} className="btn-primary w-full justify-center">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'in' ? 'Entrar' : 'Crear mi cuenta'}
            </button>
            {mode === 'in' && (
              <button
                type="button"
                onClick={resetPassword}
                disabled={busy}
                className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
              >
                ¿Olvidaste tu contraseña?
              </button>
            )}
          </form>
          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-[var(--border)]" />
            <span className="text-[11px] text-[var(--text-muted)]">o continúa con</span>
            <span className="h-px flex-1 bg-[var(--border)]" />
          </div>
          <button
            onClick={google}
            disabled={busy}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-[var(--border)] bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-60"
          >
            <GoogleMark />
            Continuar con Google
          </button>
          <p className="mt-5 text-center text-xs text-[var(--text-muted)]">
            {mode === 'in' ? '¿Sin cuenta?' : '¿Ya tienes cuenta?'}{' '}
            <button
              onClick={() => setMode(mode === 'in' ? 'up' : 'in')}
              className="font-semibold text-[var(--accent)] hover:underline"
            >
              {mode === 'in' ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </p>
          <p className="mt-3 text-center text-[11px] text-[var(--text-muted)]">
            <Link to="/privacidad" className="hover:text-[var(--text)] hover:underline">
              Política de privacidad
            </Link>
          </p>
        </div>
      </div>
      <div className="relative w-full max-w-3xl rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <span className="eyebrow">Quack-tip</span>
          <button
            type="button"
            onClick={() => setTipIdx(Math.floor(Math.random() * QUACK_TIPS.length))}
            aria-label="Otro tip"
            className="rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <Dices className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{QUACK_TIPS[tipIdx]}</p>
      </div>
    </div>
  )
}
