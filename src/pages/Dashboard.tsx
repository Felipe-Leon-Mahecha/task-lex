import { useEffect, useMemo, useRef, useState } from 'react'
import { Flame, Target, Star, Trophy, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Eye, EyeOff, Settings2, CalendarCheck, ArrowRight, CircleCheck } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTasksStore } from '../store/tasks'
import { useSettingsStore } from '../store/settings'
import { useAuthStore } from '../store/auth'
import { isToday } from '../lib/tasks'
import { completedTodayCount } from '../lib/progress'
import { startOfDay, sameDay } from '../lib/dateUtils'
import { last7Focus, totalFocusMinutes } from '../lib/focusStats'
import DashboardTimer from '../components/task/DashboardTimer'
import CalendarView from '../components/views/CalendarView'
import Modal from '../components/ui/Modal'
import SeasonSummaryBox from '../components/seasons/SeasonSummaryBox'
import { canAccessSeasons } from '../lib/appInfo'
import { useDragScroll } from '../hooks/useDragScroll'

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
  const updateTask = useTasksStore((s) => s.updateTask)
  const user = useAuthStore((s) => s.user)
  const hasSeasonAccess = canAccessSeasons(user?.email)
  const [summaryIndex, setSummaryIndex] = useState(0)
  const summaryIndexRef = useRef(0)
  const summaryCarousel = useDragScroll<HTMLDivElement>()
  const scrollSummaryTo = (index: number, behavior: ScrollBehavior = 'smooth') => {
    const track = summaryCarousel.ref.current
    const card = track?.querySelectorAll<HTMLElement>('[data-carousel-card]')[index]
    if (!track || !card) return
    summaryIndexRef.current = index
    setSummaryIndex(index)
    const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2
    const cardCenter = card.getBoundingClientRect().left + card.clientWidth / 2
    track.scrollTo({ left: track.scrollLeft + cardCenter - trackCenter, behavior })
  }
  const syncSummaryIndex = () => {
    const track = summaryCarousel.ref.current
    if (!track) return
    const cards = [...track.querySelectorAll<HTMLElement>('[data-carousel-card]')]
    if (!cards.length) return
    const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2
    const nearest = cards.reduce((best, card, index) => Math.abs(card.getBoundingClientRect().left + card.clientWidth / 2 - trackCenter) < Math.abs(cards[best].getBoundingClientRect().left + cards[best].clientWidth / 2 - trackCenter) ? index : best, 0)
    summaryIndexRef.current = nearest
    setSummaryIndex(nearest)
  }
  const widgetKeys = ['summary', 'timer', 'calendar', 'stats', 'progress'] as const
  const widgetLabels: Record<(typeof widgetKeys)[number], string> = { summary: 'Resumen rápido', timer: 'Temporizador de foco', calendar: 'Calendario', stats: 'Estadísticas semanales', progress: 'Progreso general' }
  const [layoutOpen, setLayoutOpen] = useState(false)
  const [widgetOrder, setWidgetOrder] = useState<string[]>(() => {
    try { const stored = JSON.parse(localStorage.getItem('quacker-dashboard-order') ?? 'null'); return Array.isArray(stored) ? [...widgetKeys].sort((a, b) => stored.indexOf(a) - stored.indexOf(b)) : [...widgetKeys] } catch { return [...widgetKeys] }
  })
  const [hiddenWidgets, setHiddenWidgets] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem('quacker-dashboard-hidden')
      if (raw === null) return ['timer', 'stats', 'progress']
      const stored = JSON.parse(raw)
      return Array.isArray(stored) ? stored : []
    } catch { return ['timer', 'stats', 'progress'] }
  })
  useEffect(() => {
    if (hiddenWidgets.includes('summary')) return
    const frame = window.requestAnimationFrame(() => scrollSummaryTo(summaryIndexRef.current, 'auto'))
    return () => window.cancelAnimationFrame(frame)
  }, [hiddenWidgets])
  useEffect(() => { localStorage.setItem('quacker-dashboard-order', JSON.stringify(widgetOrder)) }, [widgetOrder])
  useEffect(() => { localStorage.setItem('quacker-dashboard-hidden', JSON.stringify(hiddenWidgets)) }, [hiddenWidgets])
  useEffect(() => {
    const showTimer = () => setHiddenWidgets((hidden) => hidden.filter((widget) => widget !== 'timer'))
    window.addEventListener('tasklex:ensure-focus-timer', showTimer)
    return () => window.removeEventListener('tasklex:ensure-focus-timer', showTimer)
  }, [])
  const moveWidget = (key: string, delta: number) => setWidgetOrder((order) => {
    const index = order.indexOf(key)
    const nextIndex = Math.min(order.length - 1, Math.max(0, index + delta))
    if (index < 0 || index === nextIndex) return order
    const next = [...order]; [next[index], next[nextIndex]] = [next[nextIndex], next[index]]; return next
  })
  const widgetStyle = (key: string) => ({ order: widgetOrder.indexOf(key) })

  const openCalCreate = (date: Date) => {
    window.dispatchEvent(new CustomEvent('tasklex:global-new-task', { detail: { dueDate: date } }))
  }

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
    const priorityOrder = { alta: 0, media: 1, baja: 2 }
    const nextTask = tasks
      .filter((task) => !task.archived && task.status !== 'done')
      .sort((a, b) => {
        if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime()
        if (a.dueDate) return -1
        if (b.dueDate) return 1
        return priorityOrder[a.priority] - priorityOrder[b.priority] || a.createdAt.getTime() - b.createdAt.getTime()
      })[0] ?? null
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
    return { todayTasks, doneToday, todayPct, week, focus, dayCounts, streak, nextTask }
  }, [tasks])
  const { todayTasks, doneToday, todayPct, week, focus, dayCounts, streak, nextTask } = stat

  const dailyGoal = useSettingsStore((s) => s.dailyGoal)
  const doneTotalToday = useMemo(() => completedTodayCount(tasks), [tasks])
  const goalPct = dailyGoal > 0 ? Math.min(100, Math.round((doneTotalToday / dailyGoal) * 100)) : 0
  const focusWeek = useMemo(() => last7Focus(), [])
  const focusMax = Math.max(1, ...focusWeek.map((f) => f.min))
  const focusHours = (totalFocusMinutes() / 60).toFixed(1)

  const total = useMemo(() => tasks.filter((t) => !t.archived).length, [tasks])
  const done = useMemo(() => tasks.filter((t) => t.status === 'done' && !t.archived).length, [tasks])
  const pct = total ? Math.round((done / total) * 100) : 0

  const weekdays = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const maxDay = Math.max(1, ...dayCounts)

  return (
    <div>
      {hasSeasonAccess && <SeasonSummaryBox />}
      <p className="eyebrow">Hoy</p>
      <div className="mb-6 flex items-center justify-between gap-3"><h1 data-tut="dashboard-title" className="text-2xl font-bold tracking-tight">Tu día</h1><div className="flex gap-2"><Link to="/plan-dia" className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"><CalendarCheck className="h-4 w-4" /><span className="hidden sm:inline">Planear día</span></Link><button type="button" onClick={() => setLayoutOpen(true)} className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"><Settings2 className="h-4 w-4" /><span className="hidden sm:inline">Personalizar vista</span></button></div></div>
      <section aria-label="Siguiente paso" className="relative mb-5 min-h-[190px] overflow-hidden rounded-2xl border border-[var(--accent)]/25 bg-gradient-to-br from-[var(--accent)]/[0.09] via-[var(--surface)] to-[var(--surface)] p-4 pb-[4.5rem] sm:min-h-[205px] sm:p-5 sm:pb-20">
        <div className="flex items-center gap-3"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/15 text-[var(--accent)]"><Target className="h-5 w-5" /></span><p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--accent)]">Tu siguiente paso</p></div>
        <div className="mt-3 min-w-0">
          {nextTask ? <><p className="truncate text-lg font-extrabold tracking-tight sm:text-xl">{nextTask.title}</p><p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">{nextTask.dueDate ? `Programada para ${new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(nextTask.dueDate)}` : 'Sin fecha · cuando tengas un momento'}</p></> : <><p className="text-lg font-extrabold tracking-tight">No tienes tareas pendientes.</p><p className="mt-1 text-xs text-[var(--text-muted)] sm:text-sm">Disfruta el espacio o captura algo para después.</p></>}
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2 sm:bottom-5 sm:right-5">
          {nextTask ? <><Link to={nextTask.sectionId === 'inbox' ? '/bandeja' : `/s/${nextTask.sectionId}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)]"><span>Abrir</span><ArrowRight className="h-3.5 w-3.5" /></Link><button onClick={() => updateTask(nextTask.id, { status: 'done', completedAt: new Date() })} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 text-xs font-bold text-[var(--accent-text,#121212)]"><CircleCheck className="h-4 w-4" /><span>Hecha</span></button></> : <Link to="/bandeja" className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[var(--accent)] px-3 text-xs font-bold text-[var(--accent-text,#121212)]">Capturar idea<ArrowRight className="h-3.5 w-3.5" /></Link>}
        </div>
      </section>
      <div className="grid gap-4 md:grid-cols-2">
      {!hiddenWidgets.includes('summary') && <div style={widgetStyle('summary')} className="relative min-w-0 max-w-full md:col-span-2">
      <section className="relative isolate mb-6 w-full min-w-0 max-w-full overflow-hidden" aria-label="Resumen del dashboard">
        <div className="mb-2 flex items-center justify-between px-1">
          <div><p className="eyebrow">Resumen rápido</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Arrastra o desliza la cinta para recorrer tus datos.</p></div>
          <div className="flex gap-1">
            <button aria-label="Tarjeta anterior" onClick={() => scrollSummaryTo((summaryIndex + 3) % 4)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)]"><ChevronLeft className="h-4 w-4" /></button>
            <button aria-label="Siguiente tarjeta" onClick={() => scrollSummaryTo((summaryIndex + 1) % 4)} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] transition hover:text-[var(--text)]"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="relative h-[260px] w-full min-w-0 max-w-full overflow-hidden sm:h-[230px]">
        <div ref={summaryCarousel.ref} onPointerDown={summaryCarousel.onPointerDown} onClickCapture={summaryCarousel.onClickCapture} onScroll={syncSummaryIndex} className="absolute inset-0 z-10 flex snap-x snap-mandatory select-none gap-4 overflow-x-auto px-[6%] pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" style={{ touchAction: 'pan-y', scrollPaddingInline: '6%', cursor: 'grab' }} aria-live="polite">
          <article data-carousel-card className="card summary-carousel-panel min-h-[190px] min-w-[88%] max-w-[88%] snap-center p-5 sm:min-h-[205px]"><p className="eyebrow">Hoy · {todayTasks.length}</p><div className="mt-3 flex items-center gap-4"><div className="relative shrink-0"><Ring pct={todayPct} /><span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{todayPct}%</span></div><div className="min-w-0"><p className="text-sm"><strong>{doneToday}</strong> de {todayTasks.length} completadas</p><p className="mt-1 text-xs text-[var(--text-muted)]">{todayTasks.length === 0 ? 'Sin tareas para hoy. ¡A disfrutar el día!' : todayPct === 100 ? '¡Día completo!' : `${todayTasks.length - doneToday} pendientes por hoy.`}</p></div></div>{todayTasks.length > 0 && <ul className="mt-3 grid gap-x-5 gap-y-1 sm:grid-cols-2">{todayTasks.slice(0, 4).map((t) => <li key={t.id} className="flex min-w-0 items-center justify-between gap-2 text-xs"><span className={`truncate ${t.status === 'done' ? 'text-[var(--text-muted)] line-through' : ''}`}>{t.title}</span><span className="shrink-0 text-[10px] text-[var(--text-muted)]">{t.dueDate && fmtTime(t.dueDate)}</span></li>)}</ul>}</article>
          <article data-carousel-card className="card summary-carousel-panel min-h-[190px] min-w-[88%] max-w-[88%] snap-center p-5 sm:min-h-[205px]"><p className="eyebrow">Próximos 7 días · {week.length}</p><p className="mt-3 text-sm text-[var(--text-muted)]">{week.length ? `Tienes ${week.length} tareas programadas para esta semana.` : 'Tu semana está despejada. Puedes planearla con calma.'}</p>{week.length > 0 && <ul className="mt-3 grid gap-x-5 gap-y-2 sm:grid-cols-2">{week.slice(0, 6).map((t) => <li key={t.id} className="flex min-w-0 items-center justify-between gap-2 text-sm"><span className="truncate">{t.title}</span><span className="shrink-0 text-[10px] text-[var(--text-muted)]">{t.dueDate && new Intl.DateTimeFormat('es-CO', { weekday: 'short', day: 'numeric' }).format(t.dueDate)}</span></li>)}</ul>}</article>
          <article data-carousel-card className="card summary-carousel-panel min-h-[190px] min-w-[88%] max-w-[88%] snap-center p-5 sm:min-h-[205px]"><p className="eyebrow">Foco del día · {focus.length}</p>{focus.length === 0 ? <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]"><Star className="h-4 w-4" />Sin foco marcado. Usa la estrella en una tarea importante.</div> : <ul className="mt-3 grid gap-2 sm:grid-cols-2">{focus.slice(0, 6).map((t) => <li key={t.id} className="flex items-center gap-2 text-sm"><Star className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" /><span className="truncate">{t.title}</span></li>)}</ul>}</article>
          <article data-carousel-card className="card summary-carousel-panel min-h-[190px] min-w-[88%] max-w-[88%] snap-center p-5 sm:min-h-[205px]"><p className="eyebrow">Meta diaria</p><div className="mt-3 flex items-center gap-4"><div className="relative shrink-0"><Ring pct={goalPct} /><span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{goalPct}%</span></div><div><p className="text-sm"><strong>{doneTotalToday}</strong> de {dailyGoal} tareas completadas</p><p className="mt-1 text-xs text-[var(--text-muted)]">{dailyGoal === 0 ? <span className="flex items-center gap-1"><Trophy className="h-3.5 w-3.5" />Sin meta. Configúrala en Ajustes.</span> : goalPct >= 100 ? '¡Meta cumplida!' : `Te faltan ${dailyGoal - doneTotalToday}.`}</p></div></div></article>
        </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">{['Hoy', 'Semana', 'Foco', 'Meta'].map((label, i) => <button key={label} aria-label={`Ver resumen: ${label}`} aria-current={summaryIndex === i ? 'true' : undefined} onClick={() => scrollSummaryTo(i)} className={`h-1.5 rounded-full transition-all ${summaryIndex === i ? 'w-6 bg-[var(--accent)]' : 'w-1.5 bg-[var(--border)]'}`} />)}</div>
      </section>
      </div>}

        {!hiddenWidgets.includes('timer') && <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ ...widgetStyle('timer'), animationDelay: '160ms' }}>
          <DashboardTimer />
        </div>}

        {!hiddenWidgets.includes('calendar') && <div className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ ...widgetStyle('calendar'), animationDelay: '170ms' }}>
          <div className="mb-2 flex items-center justify-between px-1">
            <p className="eyebrow">Calendario</p>
            <span className="text-[10px] text-[var(--text-muted)]">Toca un día para ver sus tareas</span>
          </div>
          <CalendarView tasks={tasks} onCreateTask={openCalCreate} onMoveTask={(id, dueDate) => updateTask(id, { dueDate: new Date(dueDate) })} />
        </div>}

        {!hiddenWidgets.includes('stats') && <div className="card p-5 md:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ ...widgetStyle('stats'), animationDelay: '200ms' }}>
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
        </div>}
      {!hiddenWidgets.includes('progress') && <div className="card p-5 md:col-span-2 animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: '250ms', order: widgetOrder.indexOf('progress') }}>
        <p className="eyebrow">Progreso general</p>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]">
          <div className="h-full rounded-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-[var(--text-muted)]">
          {done} de {total} completadas ({pct}%)
        </p>
      </div>}
      </div>

      {layoutOpen && <Modal open onClose={() => setLayoutOpen(false)} title="Personaliza tu dashboard" className="max-w-xl">
        <p className="mb-4 text-sm text-[var(--text-muted)]">Deja solo los bloques que te sirven y acomódalos a tu manera. Puedes volver a mostrarlos cuando quieras.</p>
        <div className="mb-4 grid gap-2 sm:grid-cols-2">
          <button onClick={() => { setHiddenWidgets(['timer', 'stats', 'progress']); setWidgetOrder([...widgetKeys]) }} className="rounded-xl border border-[var(--border)] p-3 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/[0.04]"><span className="block text-sm font-bold">Vista simple</span><span className="mt-1 block text-[11px] text-[var(--text-muted)]">Resumen de hoy y calendario.</span></button>
          <button onClick={() => { setHiddenWidgets([]); setWidgetOrder([...widgetKeys]) }} className="rounded-xl border border-[var(--border)] p-3 text-left transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/[0.04]"><span className="block text-sm font-bold">Vista completa</span><span className="mt-1 block text-[11px] text-[var(--text-muted)]">Temporizador, estadísticas y progreso.</span></button>
        </div>
        <div className="space-y-2">{widgetOrder.map((key, index) => <div key={key} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
          <div className="min-w-0 flex-1"><p className="text-sm font-semibold">{widgetLabels[key as keyof typeof widgetLabels]}</p><p className="text-[11px] text-[var(--text-muted)]">{hiddenWidgets.includes(key) ? 'Oculto en tu dashboard' : 'Visible en tu dashboard'}</p></div>
          <button aria-label={`Mover ${widgetLabels[key as keyof typeof widgetLabels]} arriba`} disabled={index === 0} onClick={() => moveWidget(key, -1)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button>
          <button aria-label={`Mover ${widgetLabels[key as keyof typeof widgetLabels]} abajo`} disabled={index === widgetOrder.length - 1} onClick={() => moveWidget(key, 1)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button>
          <button aria-label={`${hiddenWidgets.includes(key) ? 'Mostrar' : 'Ocultar'} ${widgetLabels[key as keyof typeof widgetLabels]}`} onClick={() => setHiddenWidgets((items) => items.includes(key) ? items.filter((item) => item !== key) : widgetKeys.length - items.length > 1 ? [...items, key] : items)} className="rounded-lg p-2 text-[var(--accent)] hover:bg-[var(--accent)]/10">{hiddenWidgets.includes(key) ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</button>
        </div>)}</div>
        <p className="mt-4 text-[11px] text-[var(--text-muted)]">Siempre queda visible al menos un bloque.</p>
      </Modal>}

    </div>
  )
}
