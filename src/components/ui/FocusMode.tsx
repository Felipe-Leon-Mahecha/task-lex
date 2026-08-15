import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, SkipForward, Volume1, VolumeX, X } from 'lucide-react'
import { useTasksStore } from '../../store/tasks'
import { useSettingsStore } from '../../store/settings'
import { AmbientPlayer, SOUND_OPTIONS, type SoundId } from '../../lib/focusSounds'
import { addFocusMinutes } from '../../lib/focusStats'
import type { Task } from '../../types/task'
import Select from './Select'

const quotes = [
  'Una tarea a la vez.',
  'El foco vence a la prisa.',
  'Pequeños pasos, grandes resultados.',
  'Hazlo ahora o nunca.',
  'La constancia construye.',
  'Menos distracciones, más avance.',
  'Tú controlas el tiempo.',
  'Empieza aunque sea en pequeño.',
  'Hoy avanzas un poco, mañana más.',
  'Un minuto de foco vale por horas.',
  'La disciplina es el puente entre metas y logros.',
  'Concéntrate en lo que importa.',
]

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

export default function FocusMode({ open, onClose }: { open: boolean; onClose: () => void }) {
  const tasks = useTasksStore((s) => s.tasks)
  const updateTask = useTasksStore((s) => s.updateTask)
  const focusMinutes = useSettingsStore((s) => s.focusMinutes)
  const shortBreak = useSettingsStore((s) => s.shortBreak)
  const pending = tasks.filter((t) => !t.archived && t.status !== 'done')
  const [taskId, setTaskId] = useState('')
  const [quote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)])
  const [phase, setPhase] = useState<'focus' | 'break'>('focus')
  const [running, setRunning] = useState(false)
  const [remaining, setRemaining] = useState(focusMinutes * 60)
  const [sound, setSound] = useState<Exclude<SoundId, 'none'>>('white')
  const [volume, setVolume] = useState(0.5)
  const [playing, setPlaying] = useState(false)
  const playerRef = useRef<AmbientPlayer | null>(null)

  const task: Task | null = pending.find((t) => t.id === taskId) ?? pending[0] ?? null

  const getPlayer = () => {
    if (!playerRef.current) playerRef.current = new AmbientPlayer()
    return playerRef.current
  }

  useEffect(() => {
    setPhase('focus')
    setRunning(false)
    setRemaining(focusMinutes * 60)
  }, [taskId, focusMinutes])

  useEffect(() => {
    if (!running || !task) return
    const iv = setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => clearInterval(iv)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, taskId])

  useEffect(() => {
    if (!running || !task || remaining > 0) return
    if (phase === 'focus') {
      const current = tasks.find((t) => t.id === task.id)
      updateTask(task.id, {
        pomodoro: {
          ...(current?.pomodoro ?? task.pomodoro),
          sessionsDone: (current?.pomodoro.sessionsDone ?? task.pomodoro.sessionsDone) + 1,
          running: false,
          endsAt: null,
        },
      })
      addFocusMinutes(focusMinutes)
      setPhase('break')
      setRemaining(shortBreak * 60)
    } else {
      setPhase('focus')
      setRemaining(focusMinutes * 60)
    }
    setRunning(false)
    beep()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(
    () => () => {
      try {
        playerRef.current?.stop()
      } catch {}
    },
    [],
  )

  if (!open) return null

  const start = () => {
    setRunning(true)
  }

  const pause = () => setRunning(false)

  const reset = () => {
    setRunning(false)
    setPhase('focus')
    setRemaining(focusMinutes * 60)
  }

  const skip = () => {
    setRunning(false)
    if (phase === 'focus') {
      setPhase('break')
      setRemaining(shortBreak * 60)
    } else {
      setPhase('focus')
      setRemaining(focusMinutes * 60)
    }
  }

  const handleClose = () => {
    getPlayer().stop()
    setPlaying(false)
    onClose()
  }

  const toggleSound = (id: Exclude<SoundId, 'none'>) => {
    if (id === sound && playing) {
      getPlayer().stop()
      setPlaying(false)
      return
    }
    setSound(id)
    const p = getPlayer()
    p.setVolume(volume)
    p.start(id)
    setPlaying(true)
  }

  const changeVolume = (v: number) => {
    setVolume(v)
    if (playing) getPlayer().setVolume(v)
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-[var(--bg)] text-[var(--text)] animate-in fade-in duration-300">
      <div className="flex items-center justify-between px-5 py-4">
        <span className="eyebrow">Temporizador</span>
        <button
          onClick={handleClose}
          title="Salir del modo foco"
          className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-5 pb-12">
        {pending.length > 0 && (
          <div className="w-full max-w-md">
            <label className="mb-1 block text-center text-xs text-[var(--text-muted)]">
              Tarea en foco
            </label>
            <Select
              value={task?.id ?? ''}
              onChange={setTaskId}
              options={pending.map((t) => ({ value: t.id, label: t.title }))}
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-sm outline-none focus:border-[var(--accent)]"
              placeholder="Seleccionar tarea"
            />
          </div>
        )}

        <span
          className={`rounded-full border px-4 py-1 text-xs ${
            phase === 'focus'
              ? 'border-[var(--accent)] text-[var(--accent)]'
              : 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
          }`}
        >
          {phase === 'focus' ? `Foco · ${focusMinutes} min` : `Descanso · ${shortBreak} min`}
        </span>

        <p className="text-8xl font-bold tabular-nums tracking-tight">{fmt(remaining)}</p>

        {task && (
          <p className="max-w-md text-center text-lg font-semibold text-[var(--text)]">{task.title}</p>
        )}
        <p className="max-w-sm text-center text-sm text-[var(--text-muted)] italic">"{quote}"</p>

        <div className="flex items-center gap-3">
          {running ? (
            <button onClick={pause} className="btn-primary px-6 py-3 text-base">
              <Pause className="h-5 w-5" /> Pausar
            </button>
          ) : (
            <button onClick={start} className="btn-primary px-6 py-3 text-base">
              <Play className="h-5 w-5" /> Iniciar
            </button>
          )}
          <button
            onClick={reset}
            title="Reiniciar"
            className="rounded-full border border-[var(--border)] p-3 text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={skip}
            title="Saltar fase"
            className="rounded-full border border-[var(--border)] p-3 text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            <SkipForward className="h-5 w-5" />
          </button>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Sonidos de foco</span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {playing ? 'Reproduciendo' : 'En pausa'}
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {SOUND_OPTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSound(s.id)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  sound === s.id && playing
                    ? 'border-[var(--accent)] bg-[var(--accent)] font-semibold text-[#121212]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2">
            {volume === 0 ? (
              <VolumeX className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            ) : (
              <Volume1 className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            )}
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => changeVolume(Number(e.target.value))}
              className="w-full h-2 cursor-pointer appearance-none rounded-full bg-[var(--surface-2)] [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--accent)] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[var(--surface-2)] [&::-webkit-slider-thumb]:shadow-sm [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[var(--accent)] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[var(--surface-2)] [&::-moz-range-thumb]:shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
