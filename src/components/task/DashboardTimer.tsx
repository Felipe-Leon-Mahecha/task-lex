import { useEffect, useRef, useState } from 'react'
import { Coffee, Pause, Play, RotateCcw, Settings2, Timer } from 'lucide-react'
import { useSettingsStore } from '../../store/settings'
import { addFocusMinutes } from '../../lib/focusStats'
import Modal from '../ui/Modal'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

function fmt(sec: number) {
  return `${pad(Math.floor(sec / 60))}:${pad(sec % 60)}`
}

function beep() {
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
    osc.start()
    osc.stop(ctx.currentTime + 0.8)
  } catch {}
}

function notify(msg: string) {
  beep()
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Quacker', { body: msg })
  }
}

export default function DashboardTimer() {
  const focusMinutes = useSettingsStore((s) => s.focusMinutes)
  const shortBreak = useSettingsStore((s) => s.shortBreak)
  const setFocusMinutes = useSettingsStore((s) => s.setFocusMinutes)
  const setShortBreak = useSettingsStore((s) => s.setShortBreak)
  const [phase, setPhase] = useState<'focus' | 'break'>('focus')
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(focusMinutes * 60)
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem('quacker-timer-sessions')
      return raw ? Number(raw) : 0
    } catch {
      return 0
    }
  })
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [focusDraft, setFocusDraft] = useState(focusMinutes)
  const [breakDraft, setBreakDraft] = useState(shortBreak)
  const phaseRef = useRef(phase)
  phaseRef.current = phase

  useEffect(() => {
    try {
      localStorage.setItem('quacker-timer-sessions', String(sessions))
    } catch {}
  }, [sessions])

  const duration = () => (phaseRef.current === 'focus' ? focusMinutes : shortBreak) * 60

  const finish = () => {
    const isFocus = phaseRef.current === 'focus'
    setSessions((s) => (isFocus ? s + 1 : s))
    if (isFocus) addFocusMinutes(focusMinutes)
    notify(
      isFocus ? 'Sesión de foco completada. Toca descansar.' : 'Descanso terminado. ¡Vuelve al foco!',
    )
    setPhase(isFocus ? 'break' : 'focus')
    setRemaining((isFocus ? shortBreak : focusMinutes) * 60)
    setRunning(false)
  }

  useEffect(() => {
    if (!running) return
    const iv = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          finish()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase])

  const start = () => {
    setRemaining(duration())
    setRunning(true)
  }

  useEffect(() => {
    const startFromShortcut = () => start()
    window.addEventListener('tasklex:start-focus-timer', startFromShortcut)
    return () => window.removeEventListener('tasklex:start-focus-timer', startFromShortcut)
  }, [focusMinutes, shortBreak])

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setPhase('focus')
    setRemaining(focusMinutes * 60)
  }

  const openSettings = () => {
    setFocusDraft(focusMinutes)
    setBreakDraft(shortBreak)
    setSettingsOpen(true)
  }

  const saveTimerSettings = () => {
    const nextFocus = Math.min(120, Math.max(1, Math.round(Number(focusDraft) || focusMinutes)))
    const nextBreak = Math.min(60, Math.max(1, Math.round(Number(breakDraft) || shortBreak)))
    setFocusMinutes(nextFocus)
    setShortBreak(nextBreak)
    setRunning(false)
    setRemaining((phaseRef.current === 'focus' ? nextFocus : nextBreak) * 60)
    setSettingsOpen(false)
  }

  return (
    <div className="card flex h-full flex-col p-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
        <Timer className="h-5 w-5 text-[var(--accent)]" />
        <h2 className="text-xl font-bold tracking-tight">Temporizador</h2>
        </div>
        <button type="button" onClick={openSettings} title="Personalizar tiempos" aria-label="Personalizar tiempos del temporizador" className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"><Settings2 className="h-4 w-4" /></button>
      </div>

      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Personaliza tu temporizador">
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">Elige la duración de tus sesiones. El cambio se aplica también a los temporizadores de tareas.</p>
          <label className="block text-sm font-semibold">Tiempo de enfoque<input type="number" min={1} max={120} value={focusDraft} onChange={(event) => setFocusDraft(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5" /><span className="mt-1 block text-xs font-normal text-[var(--text-muted)]">De 1 a 120 minutos</span></label>
          <label className="block text-sm font-semibold">Tiempo de descanso<input type="number" min={1} max={60} value={breakDraft} onChange={(event) => setBreakDraft(Number(event.target.value))} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5" /><span className="mt-1 block text-xs font-normal text-[var(--text-muted)]">De 1 a 60 minutos</span></label>
          <div className="flex justify-end gap-2"><button onClick={() => setSettingsOpen(false)} className="btn-ghost">Cancelar</button><button onClick={saveTimerSettings} className="btn-primary">Guardar tiempos</button></div>
        </div>
      </Modal>
      <p className="mt-0.5 text-xs text-[var(--text-muted)]">
        Concentración con descansos. Sesiones de {focusMinutes} min + {shortBreak} min de pausa.
      </p>

      <div className="mt-4 flex justify-center">
        <div className="flex rounded-full border border-[var(--border)] p-1">
          <button
            onClick={() => {
              setRunning(false)
              setPhase('focus')
              setRemaining(focusMinutes * 60)
            }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs transition-colors ${
              phase === 'focus'
                ? 'bg-[var(--accent)] font-semibold text-[var(--accent-text,#121212)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Timer className="h-3.5 w-3.5" /> Foco
          </button>
          <button
            onClick={() => {
              setRunning(false)
              setPhase('break')
              setRemaining(shortBreak * 60)
            }}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs transition-colors ${
              phase === 'break'
                ? 'bg-emerald-400 font-semibold text-[var(--accent-text,#121212)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            <Coffee className="h-3.5 w-3.5" /> Descanso
          </button>
        </div>
      </div>

      <div className="relative mx-auto my-5 flex h-40 w-40 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="72" fill="none" stroke="var(--surface-2)" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r="72"
            fill="none"
            stroke={phase === 'focus' ? 'var(--accent)' : '#34d399'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 72}
            strokeDashoffset={2 * Math.PI * 72 * (1 - remaining / (duration() || 1))}
          />
        </svg>
        <p className="text-5xl font-bold tabular-nums">{fmt(remaining)}</p>
      </div>

      <p className="text-center text-xs text-[var(--text-muted)]">
        {sessions} sesión{sessions === 1 ? '' : 'es'} de foco completada{sessions === 1 ? '' : 's'} hoy
      </p>

      <div className="mt-4 flex items-center justify-center gap-2">
        {running ? (
          <button onClick={pause} className="btn-primary">
            <Pause className="h-4 w-4" /> Pausar
          </button>
        ) : (
          <button onClick={start} className="btn-primary">
            <Play className="h-4 w-4" /> Iniciar
          </button>
        )}
        <button
          onClick={reset}
          title="Reiniciar"
          className="rounded-full border border-[var(--border)] p-2.5 text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
