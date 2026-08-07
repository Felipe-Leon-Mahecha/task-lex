import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, Timer } from 'lucide-react'
import Modal from '../ui/Modal'
import { useTasksStore } from '../../store/tasks'
import { useSettingsStore } from '../../store/settings'
import { addFocusMinutes } from '../../lib/focusStats'
import type { PomodoroState, Task } from '../../types/task'

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
  } catch {
    // sin audio
  }
}

function notify(msg: string) {
  beep()
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Flux', { body: msg })
  }
}

export default function PomodoroTimer({ task }: { task: Task }) {
  const focusMinutes = useSettingsStore((s) => s.focusMinutes)
  const shortBreak = useSettingsStore((s) => s.shortBreak)
  const [open, setOpen] = useState(false)
  const [phase, setPhase] = useState<'focus' | 'break'>('focus')
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(focusMinutes * 60)

  const currentPomodoro = () => useTasksStore.getState().tasks.find((t) => t.id === task.id)?.pomodoro

  const patchPomodoro = (patch: Partial<PomodoroState>) => {
    const current = currentPomodoro()
    if (!current) return
    useTasksStore.getState().updateTask(task.id, { pomodoro: { ...current, ...patch } })
  }

  const finish = () => {
    const isFocus = phase === 'focus'
    const current = currentPomodoro()
    patchPomodoro({
      running: false,
      endsAt: null,
      sessionsDone: current ? current.sessionsDone + (isFocus ? 1 : 0) : 0,
    })
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

  useEffect(() => {
    const st = currentPomodoro()
    if (st?.running && st.endsAt) {
      const ms = st.endsAt.getTime() - Date.now()
      if (ms > 0) {
        setRunning(true)
        setRemaining(Math.ceil(ms / 1000))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = () => {
    const secs = (phase === 'focus' ? focusMinutes : shortBreak) * 60
    patchPomodoro({ running: true, endsAt: new Date(Date.now() + secs * 1000) })
    setRemaining(secs)
    setRunning(true)
  }

  const pause = () => {
    patchPomodoro({ running: false, endsAt: null })
    setRunning(false)
  }

  const reset = () => {
    patchPomodoro({ running: false, endsAt: null })
    setRunning(false)
    setPhase('focus')
    setRemaining(focusMinutes * 60)
  }

  const openModal = () => {
    setOpen(true)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {})
    }
  }

  const sessions = task.pomodoro.sessionsDone

  return (
    <>
      <button
        onClick={openModal}
        title="Pomodoro"
        className="relative rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
      >
        <Timer className="h-4 w-4" />
        {sessions > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-[var(--accent)] px-0.5 text-[9px] font-bold text-[#121212]">
            {sessions}
          </span>
        )}
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Pomodoro">
        <div className="flex flex-col items-center gap-4 py-2">
          <span
            className={`rounded-full border px-3 py-1 text-xs ${
              phase === 'focus'
                ? 'border-[var(--accent)] text-[var(--accent)]'
                : 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
            }`}
          >
            {phase === 'focus' ? 'Foco' : 'Descanso'}
          </span>
          <p className="text-5xl font-bold tabular-nums">{fmt(remaining)}</p>
          <p className="text-xs text-[var(--text-muted)]">{sessions} sesiones hoy</p>
          <div className="flex items-center gap-2">
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
              className="rounded-full border border-[var(--border)] p-2.5 text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
