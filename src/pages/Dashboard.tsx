import { useMemo, useState } from 'react'
import { Flame, Target, CalendarDays, Star, Trophy, X, LayoutGrid } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { useTasksStore } from '../store/tasks'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { isToday } from '../lib/tasks'
import { completedTodayCount } from '../lib/progress'
import { startOfDay, sameDay } from '../lib/dateUtils'
import { last7Focus, totalFocusMinutes } from '../lib/focusStats'

function fmtTime(d: Date) {
  return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(d)
}



function Ring({ pct }: { pct: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="7" />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c - (c * Math.min(100, Math.max(0, pct))) / 100}
      />
    </svg>
  )
}

export default function Dashboard() {
  const tasks = useTasksStore((s) => s.tasks)
  const sections = useSectionsStore((s) => s.sections)
  const labelOf = (id: string) => sections.find((s) => s.id === id)?.label ?? id

  const stat = useMemo(() => {
    const now = new Date()
    const inWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    const todayTasks = tasks.filter((t) => !t.archived && t.dueDate && isToday(t.dueDate))
    const doneToday = todayTasks.filter((t) => t.status === 'done').length
    const todayPct = todayTasks.length ? Math.round((doneToday / todayTasks.length) * 100) : 0
    const week = tasks.filter(
      (t) => !t.archived && t.status !== 'done' && t.dueDate && t.dueDate > now && t.dueDate <= inWeek,
    )
    const focus = tasks.filter((t) => !t.archived && t.status !== 'done' && t.focusDay)
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return startOfDay(d)
    })
    const dayCounts = last7.map(
      (d) => tasks.filter((t) => t.status === 'done' && t.completedAt && sameDay(t.completedAt, d)).length,
    )
    const doneOnDay = (d: Date) => tasks.some((t) => t.status === 'done' && t.completedAt && sameDay(t.completedAt, d))
    let streak = 0
    const cursor = startOfDay(new Date())
    if (!doneOnDay(cursor)) cursor.setDate(cursor.getDate() - 1)
    while (doneOnDay(cursor)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    }
    return { todayTasks, doneToday, todayPct, week, focus, dayCounts, streak }
  }, [tasks])
  const { todayTasks, doneToday, todayPct, week, focus, dayCounts, streak } = stat

  const dailyGoal = useSettingsStore((s) => s.dailyGoal)
  const doneTotalToday = useMemo(() => completedTodayCount(tasks), [tasks])
  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((doneTotalToday / dailyGoal) * 100)) : 0
  const focusWeek = useMemo(() => last7Focus(), [])
  const focusMax = Math.max(1, ...focusWeek.map((f) => f.min))
  const focusHours = (totalFocusMinutes() / 60).toFixed(1)

  const total = tasks.length
  const done = useMemo(() => tasks.filter((t) => t.status === 'done' && !t.archived).length, [tasks])
  const pct = total ? Math.round((done / total) * 100) : 0

  const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const maxDay = Math.max(1, ...dayCounts)

  const [widgetBannerDismissed, setWidgetBannerDismissed] = useState(
    () => localStorage.getItem('flux-widget-banner') === '1',
  )
  const dismissWidgetBanner = () => {
    localStorage.setItem('flux-widget-banner', '1')
    setWidgetBannerDismissed(true)
  }

  return (
    <div>
      {Capacitor.getPlatform() === 'android' && !widgetBannerDismissed && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <LayoutGrid className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">Widget disponible</p>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Mantén presionado el ícono de Flux en tu pantalla y selecciona "Widgets". Arrastra el widget a tu inicio para ver tus tareas sin abrir la app.
            </p>
          </div>
          <button onClick={dismissWidgetBanner} className="shrink-0 rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface-2)]">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      <p className="eyebrow">Dashboard</p>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Vista general</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '0ms' }}>
          <p className="eyebrow">Hoy · {todayTasks.length}</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative">
              <Ring pct={todayPct} />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {todayPct}%
              </span>
            </div>
            <div>
              <p className="text-sm">
                <strong>{doneToday}</strong> de {todayTasks.length} completadas
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {todayTasks.length === 0 ? (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    Sin tareas para hoy. ¡A disfrutar el día!
                  </span>
                ) : todayPct === 100
                    ? '¡Día completo!'
                    : `${todayTasks.length - doneToday} pendientes por hoy.`}
              </p>
            </div>
          </div>
          {todayTasks.length > 0 && (
            <ul className="mt-4 space-y-2">
              {todayTasks.map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className={`truncate ${t.status === 'done' ? 'text-[var(--text-muted)] line-through' : ''}`}>
                    {t.title}
                  </span>
                  <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                    {labelOf(t.sectionId)} · {t.dueDate && fmtTime(t.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '50ms' }}>
          <p className="eyebrow">Semana · {week.length}</p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Vienen {week.length} tareas en los próximos 7 días.
          </p>
          {week.length > 0 && (
            <ul className="mt-3 space-y-2">
              {week.slice(0, 6).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{t.title}</span>
                  <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
                    {t.dueDate && fmtTime(t.dueDate)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '100ms' }}>
          <p className="eyebrow">Foco del día · {focus.length}</p>
          {focus.length === 0 ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Star className="h-4 w-4" />
              Sin foco marcado. Usa la estrella en tus tareas.
            </div>
          ) : (
            <ul className="mt-3 space-y-2">
              {focus.map((t) => (
                <li key={t.id} className="text-sm">
                  {t.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card p-5 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '150ms' }}>
          <p className="eyebrow">Meta diaria</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative">
              <Ring pct={goalPct} />
              <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">
                {goalPct}%
              </span>
            </div>
            <div>
              <p className="text-sm">
                <strong>{doneTotalToday}</strong> de {dailyGoal} tareas completadas hoy
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                {dailyGoal === 0 ? (
                  <span className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5" />
                    Sin meta. Configúrala en Ajustes.
                  </span>
                ) : goalPct >= 100
                    ? '¡Meta cumplida!'
                    : `Te faltan ${dailyGoal - doneTotalToday}.`}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-5 md:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <p className="eyebrow">Estadísticas semanales</p>
            <span className="flex items-center gap-1 text-sm font-semibold text-[var(--accent)]">
              <Flame className="h-4 w-4 fill-[var(--accent)]" /> Racha {streak} día{streak === 1 ? '' : 's'}
            </span>
          </div>
          <div className="mt-4 flex h-24 items-end gap-2">
            {dayCounts.map((c, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-[var(--text-muted)]">{c > 0 ? c : ''}</span>
                <div
                  className={`w-full rounded-t-md ${
                    c > 0 ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'
                  }`}
                  style={{ height: `${Math.max(4, (c / maxDay) * 80)}px` }}
                />
                <span className="text-[10px] text-[var(--text-muted)]">{weekdays[i]}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between">
            <p className="eyebrow">Minutos de foco · 7 días</p>
            <span className="flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
              <Target className="h-3.5 w-3.5" /> {focusHours} h en total
            </span>
          </div>
          <div className="mt-3 flex h-20 items-end gap-2">
            {focusWeek.map((f, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] text-[var(--text-muted)]">{f.min > 0 ? f.min : ''}</span>
                <div
                  className={`w-full rounded-t-md ${
                    f.min > 0 ? 'bg-[var(--accent-strong)]' : 'bg-[var(--surface-2)]'
                  }`}
                  style={{ height: `${Math.max(4, (f.min / focusMax) * 64)}px` }}
                />
                <span className="text-[10px] text-[var(--text-muted)]">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-4 p-5 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '250ms' }}>
        <p className="eyebrow">Progreso general</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {done} de {total} completadas ({pct}%)
        </p>
      </div>
    </div>
  )
}
