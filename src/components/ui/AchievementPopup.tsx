import { useEffect, useState } from 'react'
import { Trophy, X } from 'lucide-react'
import type { Achievement } from '../../lib/achievements'

interface QueuedItem {
  key: number
  achievement: Achievement
}

export default function AchievementPopup() {
  const [queue, setQueue] = useState<QueuedItem[]>([])
  const [current, setCurrent] = useState<QueuedItem | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Achievement>).detail
      if (!detail) return
      setQueue((q) => [...q, { key: Date.now() + Math.random(), achievement: detail }])
    }
    window.addEventListener('tasklex:achievement', handler)
    return () => window.removeEventListener('tasklex:achievement', handler)
  }, [])

  useEffect(() => {
    if (current || queue.length === 0) return
    const [next, ...rest] = queue
    setCurrent(next)
    setQueue(rest)
    const timer = setTimeout(() => setCurrent(null), 4500)
    return () => clearTimeout(timer)
  }, [queue, current])

  if (!current) return null

  return (
    <div className="fixed bottom-20 right-4 z-[160] animate-in slide-in-from-right-4 fade-in duration-300 md:bottom-6">
      <div className="card relative flex items-center gap-3 border border-[var(--accent)]/40 p-4 pr-8 shadow-lg" style={{ background: 'linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--accent) 12%, var(--surface)))' }}>
        <button
          onClick={() => setCurrent(null)}
          className="absolute right-1.5 top-1.5 rounded-full p-1 text-[var(--text-muted)] hover:text-[var(--text)]"
          aria-label="Cerrar"
        >
          <X className="h-3.5 w-3.5" />
        </button>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15">
          <Trophy className="h-5 w-5 text-[var(--accent)]" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--accent)]">¡Logro desbloqueado!</p>
          <p className="text-sm font-bold text-[var(--text)]">{current.achievement.title}</p>
          <p className="truncate text-xs text-[var(--text-muted)]">
            {current.achievement.desc} · +{current.achievement.reward} monedas
          </p>
        </div>
      </div>
    </div>
  )
}
