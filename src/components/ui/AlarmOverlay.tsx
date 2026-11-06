import { useCallback, useEffect, useRef, useState } from 'react'
import { BellRing, Check, Clock3, VolumeX } from 'lucide-react'
import { alarmToneUrl, cancelReminder, snoozeAlarm, type FiredAlarm } from '../../lib/notifications'
import { useSettingsStore } from '../../store/settings'
import { useTasksStore } from '../../store/tasks'
import { useFoxSkinsStore } from '../../store/foxSkins'

function startWebBeep(onBlocked: () => void): { stop: () => void; unlock: () => void } {
  const noop = () => {}
  try {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) {
      onBlocked()
      return { stop: noop, unlock: noop }
    }
    const ctx = new Ctx()
    let alive = true
    let timer = 0
    const beep = (freq: number, dur: number) => {
      if (!alive) return
      const osc = ctx.createOscillator()
      const g = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      g.gain.setValueAtTime(0.0001, ctx.currentTime)
      g.gain.exponentialRampToValueAtTime(0.4, ctx.currentTime + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur)
      osc.connect(g)
      g.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + dur + 0.05)
    }
    const loop = () => {
      if (!alive || ctx.state !== 'running') return
      beep(880, 0.22)
      timer = window.setTimeout(() => {
        if (!alive || ctx.state !== 'running') return
        beep(660, 0.22)
        timer = window.setTimeout(loop, 650)
      }, 350)
    }
    const boot = () => {
      if (!alive) return
      if (ctx.state === 'running') loop()
      else onBlocked()
    }
    const stop = () => {
      alive = false
      clearTimeout(timer)
      try {
        void ctx.close()
      } catch {}
    }
    const unlock = () => {
      try {
        void ctx.resume().then(boot, boot)
      } catch {
        onBlocked()
      }
    }
    try {
      void ctx.resume().then(boot, boot)
    } catch {
      onBlocked()
    }
    return { stop, unlock }
  } catch {
    onBlocked()
    return { stop: noop, unlock: noop }
  }
}

export default function AlarmOverlay({ alarm, onClose }: { alarm: FiredAlarm | null; onClose: () => void }) {
  const tonePath = useSettingsStore((s) => s.alarmTone?.path ?? null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const beepRef = useRef<{ stop: () => void; unlock: () => void } | null>(null)
  const [blocked, setBlocked] = useState(false)

  const stopSound = useCallback(() => {
    beepRef.current?.stop()
    beepRef.current = null
    try {
      audioRef.current?.pause()
    } catch {}
    audioRef.current = null
  }, [])

  useEffect(() => {
    if (!alarm) return
    setBlocked(false)
    let dead = false
    ;(async () => {
      let url: string | null = null
      if (tonePath) url = await alarmToneUrl(tonePath)
      if (dead) return
      if (url) {
        const a = new Audio(url)
        a.loop = true
        audioRef.current = a
        try {
          await a.play()
        } catch {
          if (!dead) setBlocked(true)
        }
      } else {
        beepRef.current = startWebBeep(() => {
          if (!dead) setBlocked(true)
        })
      }
    })()
    try {
      navigator.vibrate?.([400, 200, 400, 200, 800])
    } catch {}
    return () => {
      dead = true
      stopSound()
      try {
        navigator.vibrate?.(0)
      } catch {}
    }
  }, [alarm, tonePath, stopSound])

  if (!alarm) return null

  const unlock = () => {
    setBlocked(false)
    if (audioRef.current) {
      audioRef.current.play().catch(() => setBlocked(true))
    } else if (tonePath) {
      alarmToneUrl(tonePath).then((url) => {
        if (!url) return
        const a = new Audio(url)
        a.loop = true
        audioRef.current = a
        a.play().catch(() => setBlocked(true))
      })
    } else {
      beepRef.current?.unlock()
    }
  }

  const complete = () => {
    stopSound()
    try {
      useTasksStore.getState().updateTask(alarm.taskId, { status: 'done', completedAt: new Date() })
      useFoxSkinsStore.getState().recordTaskReward(alarm.taskId)
      cancelReminder(alarm.taskId)
    } catch {}
    onClose()
  }

  const snooze = () => {
    stopSound()
    try {
      snoozeAlarm(alarm.taskId, alarm.title, 10)
    } catch {}
    onClose()
  }

  const silence = () => {
    stopSound()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-6 text-center shadow-2xl">
        <div className="relative mx-auto flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full bg-[var(--accent)]/30" />
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[var(--accent)]">
            <BellRing className="h-9 w-9" />
          </span>
        </div>
        <p className="eyebrow mt-4">Alarma</p>
        <p className="mt-1 text-lg font-extrabold text-[var(--text)]">{alarm.title}</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{alarm.dueLabel}</p>
        {blocked && (
          <button
            onClick={unlock}
            className="mt-4 w-full rounded-xl border border-[var(--accent)]/50 bg-[var(--accent)]/10 py-2 text-xs font-bold text-[var(--accent)]"
          >
            Tocar para activar el sonido
          </button>
        )}
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            onClick={complete}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold text-[var(--bg)]"
          >
            <Check className="h-4 w-4" /> Completar
          </button>
          <button
            onClick={snooze}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] py-2.5 text-xs font-semibold text-[var(--text)]"
          >
            <Clock3 className="h-4 w-4" /> Posponer 10 min
          </button>
        </div>
        <button
          onClick={silence}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          <VolumeX className="h-4 w-4" /> Silenciar
        </button>
      </div>
    </div>
  )
}
