import { useEffect, useMemo, useRef, useState } from 'react'
import { addDays, format, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { AlertTriangle, CalendarDays, CalendarPlus, Check, ChevronLeft, ChevronRight, Clock3, Pencil, Plus, Sparkles, Trash2 } from 'lucide-react'
import Modal from '../components/ui/Modal'
import { useTasksStore } from '../store/tasks'
import { useAuthStore } from '../store/auth'
import { useSectionsStore } from '../store/sections'
import { isToday } from '../lib/tasks'
import type { Task } from '../types/task'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

type WeekBlock = {
  id: string
  title: string
  details: string
  start: string
  end: string
  days: number[]
  date: string | null
  color: string
}
type DayEntry = { id: string; title: string; details: string; start: string; end: string; color: string; allDay?: boolean; routine?: WeekBlock; task?: Task }
type Conflict = { day: Date; first: DayEntry; second: DayEntry }
type FreeSlot = { day: Date; start: string; end: string; minutes: number }

const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#fb7185', '#a78bfa', '#22d3ee']
const HOUR_HEIGHT = 58
const FIRST_HOUR = 6
const LAST_HOUR = 23
const DAYS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
const minutes = (value: string) => { const [h, m] = value.split(':').map(Number); return h * 60 + m }
const asTime = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`
const dayKey = (date: Date) => format(date, 'yyyy-MM-dd')
const intersects = (a: DayEntry, b: DayEntry) => !a.allDay && !b.allDay && minutes(a.start) < minutes(b.end) && minutes(b.start) < minutes(a.end)

function defaultBlocks(): WeekBlock[] { return [] }

function getFreeSlots(day: Date, entries: DayEntry[]): FreeSlot[] {
  const startOfDayMinutes = 8 * 60
  const endOfDayMinutes = 18 * 60
  let cursor = startOfDayMinutes
  const busy = entries.filter((entry) => !entry.allDay).map((entry) => ({ start: Math.max(startOfDayMinutes, minutes(entry.start)), end: Math.min(endOfDayMinutes, minutes(entry.end)) })).filter((entry) => entry.end > entry.start).sort((a, b) => a.start - b.start)
  const slots: FreeSlot[] = []
  for (const interval of busy) {
    if (interval.start - cursor >= 60) slots.push({ day, start: asTime(cursor), end: asTime(cursor + 60), minutes: 60 })
    cursor = Math.max(cursor, interval.end)
  }
  if (endOfDayMinutes - cursor >= 60) slots.push({ day, start: asTime(cursor), end: asTime(cursor + 60), minutes: 60 })
  return slots
}

export default function WeeklyPlan() {
  const user = useAuthStore((s) => s.user)
  const tasks = useTasksStore((s) => s.tasks)
  const updateTask = useTasksStore((s) => s.updateTask)
  const sections = useSectionsStore((s) => s.sections)
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }))
  const [blocks, setBlocks] = useState<WeekBlock[]>(defaultBlocks)
  const [loadedKey, setLoadedKey] = useState<string | null>(null)
  const cloudValue = useRef<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<WeekBlock | null>(null)
  const [title, setTitle] = useState('')
  const [details, setDetails] = useState('')
  const [start, setStart] = useState('08:00')
  const [end, setEnd] = useState('09:00')
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4])
  const [date, setDate] = useState('')
  const [color, setColor] = useState(COLORS[0])
  const [view, setView] = useState<'week' | 'agenda'>('week')
  const [syncIssue, setSyncIssue] = useState<string | null>(null)
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null)
  const [dropDayIndex, setDropDayIndex] = useState<number | null>(null)
  const storageKey = `quacker-weekly-routine:${user?.uid ?? 'local'}`

  useEffect(() => {
    if (loadedKey !== storageKey) return
    setLoadedKey(null)
    const readLocal = (): WeekBlock[] => {
      try { const saved = JSON.parse(localStorage.getItem(storageKey) ?? '[]'); return Array.isArray(saved) ? saved.filter((item) => item && typeof item.id === 'string') : [] } catch { return [] }
    }
    if (!user?.uid || !db) {
      cloudValue.current = null
      setBlocks(readLocal())
      setLoadedKey(storageKey)
      return
    }
    const ref = doc(db, 'users', user.uid, 'weeklyPlan', 'data')
    return onSnapshot(ref, (snapshot) => {
      const remote = snapshot.exists() && Array.isArray(snapshot.data().blocks) ? snapshot.data().blocks as WeekBlock[] : null
      const next = remote ?? readLocal()
      cloudValue.current = JSON.stringify(next)
      localStorage.setItem(storageKey, JSON.stringify(next))
      setBlocks(next)
      setLoadedKey(storageKey)
      setSyncIssue(null)
      if (!remote) void setDoc(ref, { blocks: next }, { merge: true }).catch(() => setSyncIssue('No se pudo guardar tu horario en la nube. Tus cambios siguen guardados en este dispositivo.'))
    }, () => {
      setBlocks(readLocal())
      setLoadedKey(storageKey)
      setSyncIssue('No se pudo conectar con la nube. Tus cambios siguen guardados en este dispositivo.')
    })
  }, [storageKey, user?.uid])

  useEffect(() => {
    if (loadedKey !== storageKey) return
    const serialized = JSON.stringify(blocks)
    localStorage.setItem(storageKey, serialized)
    if (!user?.uid || !db || cloudValue.current === serialized) return
    cloudValue.current = serialized
    void setDoc(doc(db, 'users', user.uid, 'weeklyPlan', 'data'), { blocks }, { merge: true })
      .then(() => setSyncIssue(null))
      .catch(() => setSyncIssue('No se pudo sincronizar el horario. Tus cambios siguen guardados en este dispositivo.'))
  }, [blocks, loadedKey, storageKey, user?.uid])

  useEffect(() => {
    if (loadedKey !== storageKey) return
    const applyAssistantBlock = (block: Record<string, unknown>) => {
      if (!block || typeof block.title !== 'string' || typeof block.start !== 'string' || typeof block.end !== 'string') return
      const days = Array.isArray(block.days) ? block.days.filter((day): day is number => Number.isInteger(day) && day >= 0 && day <= 6) : []
      const date = typeof block.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(block.date) ? block.date : null
      if (!date && days.length === 0) return
      const id = typeof block.id === 'string' ? block.id : crypto.randomUUID()
      const next: WeekBlock = { id, title: block.title.slice(0, 120), details: typeof block.details === 'string' ? block.details.slice(0, 1000) : '', start: block.start, end: block.end, days, date, color: COLORS[0] }
      setBlocks((current) => block.type === 'update_week_block' ? current.map((item) => item.id === id ? { ...item, ...next } : item) : [...current, next])
    }
    try {
      const pending = localStorage.getItem('quacker-ai-week-action')
      if (pending) {
        localStorage.removeItem('quacker-ai-week-action')
        applyAssistantBlock(JSON.parse(pending))
      }
    } catch {}
  }, [loadedKey, storageKey])

  const weekDays = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart])
  const weekEnd = useMemo(() => addDays(weekStart, 7), [weekStart])
  const tasksByDay = useMemo(() => tasks.filter((task) => !task.archived && task.dueDate && task.dueDate >= weekStart && task.dueDate < weekEnd), [tasks, weekStart, weekEnd])
  const weekLabel = `${format(weekDays[0], 'd MMM', { locale: es })} – ${format(weekDays[6], 'd MMM yyyy', { locale: es })}`

  const openEditor = (block?: WeekBlock, options?: { defaultDays?: number[]; date?: string; start?: string; end?: string }) => {
    setEditorOpen(true)
    setEditing(block ?? null)
    setTitle(block?.title ?? '')
    setDetails(block?.details ?? '')
    setStart(block?.start ?? options?.start ?? '08:00')
    setEnd(block?.end ?? options?.end ?? '09:00')
    setDays(block?.days ?? options?.defaultDays ?? [0, 1, 2, 3, 4])
    setDate(block?.date ?? options?.date ?? '')
    setColor(block?.color ?? COLORS[0])
  }

  const saveBlock = () => {
    if (!title.trim() || minutes(end) <= minutes(start) || (!date && days.length === 0)) return
    const next: WeekBlock = { id: editing?.id ?? crypto.randomUUID(), title: title.trim(), details: details.trim(), start, end, days, date: date || null, color }
    setBlocks((current) => editing ? current.map((item) => item.id === editing.id ? next : item) : [...current, next])
    setEditing(null)
    setEditorOpen(false)
  }

  const moveTaskToDrop = (event: React.DragEvent<HTMLDivElement>, day: Date) => {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('application/x-quacker-task') || draggingTaskId
    setDraggingTaskId(null)
    setDropDayIndex(null)
    if (!taskId) return
    const task = tasks.find((item) => item.id === taskId)
    if (!task || task.archived) return
    const bounds = event.currentTarget.getBoundingClientRect()
    const relativeY = Math.max(0, Math.min(bounds.height, event.clientY - bounds.top))
    const rawMinutes = FIRST_HOUR * 60 + (relativeY / HOUR_HEIGHT) * 60
    const snappedMinutes = Math.min((LAST_HOUR * 60) - 15, Math.max(FIRST_HOUR * 60, Math.round(rawMinutes / 15) * 15))
    const nextDate = new Date(day)
    nextDate.setHours(Math.floor(snappedMinutes / 60), snappedMinutes % 60, 0, 0)
    updateTask(taskId, { dueDate: nextDate })
  }

  const entriesByDay = useMemo(() => weekDays.map((day, dayIndex) => {
    const key = dayKey(day)
    const routines = blocks.filter((block) => block.date ? block.date === key : block.days.includes(dayIndex))
    const dayTasks = tasksByDay.filter((task) => task.dueDate && dayKey(task.dueDate) === key)
    const entries: DayEntry[] = [
      ...routines.map((block) => ({ id: `routine-${block.id}`, title: block.title, details: block.details, start: block.start, end: block.end, color: block.color, routine: block })),
      ...dayTasks.map((task) => {
        const allDay = task.dueDate!.getHours() === 0 && task.dueDate!.getMinutes() === 0
        const taskStart = allDay ? '09:00' : format(task.dueDate!, 'HH:mm')
        const endMinute = Math.min(23 * 60 + 59, minutes(taskStart) + 45)
        return { id: `task-${task.id}`, title: task.title, details: sections.find((section) => section.id === task.sectionId)?.label ?? 'Tarea', start: taskStart, end: asTime(endMinute), allDay, color: task.status === 'done' ? '#64748b' : '#f59e0b', task }
      }),
    ]
    return entries.sort((a, b) => a.start.localeCompare(b.start))
  }), [blocks, sections, tasksByDay, weekDays])

  const conflicts = useMemo(() => {
    const result: Conflict[] = []
    entriesByDay.forEach((entries, index) => {
      for (let i = 0; i < entries.length; i++) for (let j = i + 1; j < entries.length; j++) {
        if (intersects(entries[i], entries[j])) result.push({ day: weekDays[index], first: entries[i], second: entries[j] })
      }
    })
    return result
  }, [entriesByDay, weekDays])
  const conflictIdsByDay = useMemo(() => {
    const ids = new Set<string>()
    conflicts.forEach(({ day, first, second }) => { ids.add(`${dayKey(day)}:${first.id}`); ids.add(`${dayKey(day)}:${second.id}`) })
    return ids
  }, [conflicts])
  const freeSlots = useMemo(() => entriesByDay.flatMap((entries, index) => getFreeSlots(weekDays[index], entries)).slice(0, 3), [entriesByDay, weekDays])
  const routineCount = blocks.filter((block) => !block.date).length
  const pendingTasks = tasksByDay.filter((task) => task.status !== 'done').length

  return <div className="mx-auto max-w-[1500px] space-y-5">
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow">Organiza tu semana</p><h1 className="mt-1 text-3xl font-extrabold tracking-tight">Mi semana</h1><p className="mt-2 max-w-2xl text-sm text-[var(--text-muted)]">Reúne tu rutina, tus planes y tus tareas para saber qué viene y dónde tienes tiempo libre.</p></div>
      <button onClick={() => openEditor()} className="btn-primary"><CalendarPlus className="h-4 w-4" /> Añadir horario</button>
    </header>

    {syncIssue && <div role="status" className="flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/[0.08] px-3 py-2.5 text-xs text-[var(--text-muted)]"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /><span>{syncIssue}</span></div>}

    <section className="card flex flex-wrap items-center justify-between gap-3 p-3 sm:p-4">
      <div className="flex items-center gap-1.5 sm:gap-2"><button aria-label="Semana anterior" onClick={() => setWeekStart((d) => addDays(d, -7))} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)]"><ChevronLeft className="h-4 w-4" /></button><button aria-label="Semana siguiente" onClick={() => setWeekStart((d) => addDays(d, 7))} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] hover:bg-[var(--surface-2)]"><ChevronRight className="h-4 w-4" /></button><button onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="rounded-xl px-3 py-2 text-xs font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10">Hoy</button></div>
      <p className="text-center text-sm font-bold capitalize text-[var(--text)]">{weekLabel}</p>
      <div className="flex rounded-xl bg-[var(--surface-2)] p-1" role="tablist" aria-label="Vista de agenda"><button role="tab" aria-selected={view === 'week'} onClick={() => setView('week')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view === 'week' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)]'}`}>Semana</button><button role="tab" aria-selected={view === 'agenda'} onClick={() => setView('agenda')} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${view === 'agenda' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--text-muted)]'}`}>Agenda</button></div>
    </section>

    <section className="grid gap-3 sm:grid-cols-3">
      <div className="card flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]"><CalendarDays className="h-5 w-5" /></span><div><p className="text-xl font-extrabold">{routineCount}</p><p className="text-xs text-[var(--text-muted)]">rutinas semanales</p></div></div>
      <div className="card flex items-center gap-3 p-4"><span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-400/15 text-amber-500"><Check className="h-5 w-5" /></span><div><p className="text-xl font-extrabold">{pendingTasks}</p><p className="text-xs text-[var(--text-muted)]">tareas pendientes esta semana</p></div></div>
      <div className={`card flex items-center gap-3 p-4 ${conflicts.length ? 'border-red-400/40' : ''}`}><span className={`grid h-10 w-10 place-items-center rounded-xl ${conflicts.length ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>{conflicts.length ? <AlertTriangle className="h-5 w-5" /> : <Check className="h-5 w-5" />}</span><div><p className="text-xl font-extrabold">{conflicts.length}</p><p className="text-xs text-[var(--text-muted)]">{conflicts.length === 1 ? 'traslape por revisar' : 'traslapes por revisar'}</p></div></div>
    </section>

    {conflicts.length > 0 && <section className="rounded-2xl border border-red-400/35 bg-red-500/[0.06] p-4" aria-live="polite"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" /><div className="min-w-0 flex-1"><h2 className="font-bold">Hay horarios que se cruzan</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Revisa estos bloques. Puedes editarlos directamente desde la agenda.</p><ul className="mt-3 grid gap-2 sm:grid-cols-2">{conflicts.slice(0, 6).map((conflict, index) => <li key={`${dayKey(conflict.day)}-${conflict.first.id}-${conflict.second.id}-${index}`} className="rounded-xl border border-red-400/20 bg-[var(--surface)]/80 px-3 py-2 text-xs"><span className="font-bold capitalize">{format(conflict.day, 'EEEE d MMM', { locale: es })}</span><span className="mx-1.5 text-[var(--text-muted)]">·</span><span>{conflict.first.title}</span><span className="mx-1 text-red-500">↔</span><span>{conflict.second.title}</span></li>)}</ul></div></div></section>}

    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-4 py-3"><div><h2 className="font-bold">Espacios para ti</h2><p className="mt-0.5 text-xs text-[var(--text-muted)]">Huecos de una hora entre las 8:00 a. m. y las 6:00 p. m., según lo que ya planeaste.</p></div><Sparkles className="h-5 w-5 text-amber-400" /></div>
      <div className="grid gap-2 p-3 sm:grid-cols-3">{freeSlots.length ? freeSlots.map((slot) => <button key={`${dayKey(slot.day)}-${slot.start}`} onClick={() => openEditor(undefined, { date: dayKey(slot.day), start: slot.start, end: slot.end })} className="group flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] p-3 text-left transition hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/[0.04]"><span><span className="block text-xs font-bold capitalize">{format(slot.day, 'EEEE d MMM', { locale: es })}</span><span className="mt-1 block text-xs text-[var(--text-muted)]"><Clock3 className="mr-1 inline h-3.5 w-3.5" />{slot.start}–{slot.end}</span></span><span className="rounded-lg bg-[var(--accent)]/10 px-2.5 py-1.5 text-[10px] font-bold text-[var(--accent)] group-hover:bg-[var(--accent)] group-hover:text-[var(--bg)]">Planear</span></button>) : <p className="px-2 py-3 text-xs text-[var(--text-muted)]">No encontramos huecos de una hora en horario diurno esta semana. Puedes añadir un bloque en cualquier momento.</p>}</div>
    </section>

    {view === 'week' ? <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
      <div className="min-w-[980px]">
        <div className="sticky top-0 z-10 grid grid-cols-[58px_repeat(7,minmax(0,1fr))] border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur"><div className="border-r border-[var(--border)]" />{weekDays.map((day, index) => <div key={day.toISOString()} className={`border-r border-[var(--border)] p-2.5 text-center last:border-r-0 ${isToday(day) ? 'bg-[var(--accent)]/10' : ''}`}><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{DAYS[index]}</p><p className={`mt-1 text-sm font-extrabold ${isToday(day) ? 'text-[var(--accent)]' : 'text-[var(--text)]'}`}>{format(day, 'd MMM', { locale: es })}</p><button onClick={() => openEditor(undefined, { date: dayKey(day) })} className="mt-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-[var(--accent)] hover:bg-[var(--accent)]/10"><Plus className="h-3 w-3" /> Añadir</button></div>)}</div>
        <div className="grid grid-cols-[58px_repeat(7,minmax(0,1fr))]"><div>{Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => FIRST_HOUR + i).map((hour) => <div key={hour} className="h-[58px] border-r border-b border-[var(--border)] pr-2 pt-1 text-right text-[10px] text-[var(--text-muted)]">{String(hour).padStart(2, '0')}:00</div>)}</div>{weekDays.map((day, dayIndex) => <div key={day.toISOString()} onDragOver={(event) => { if (draggingTaskId) { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setDropDayIndex(dayIndex) } }} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropDayIndex(null) }} onDrop={(event) => moveTaskToDrop(event, day)} className={`group/day relative border-r border-[var(--border)] last:border-r-0 transition-colors ${isToday(day) ? 'bg-[var(--accent)]/[0.025]' : ''} ${dropDayIndex === dayIndex ? 'bg-[var(--accent)]/10 ring-2 ring-inset ring-[var(--accent)]/40' : ''}`} style={{ height: (LAST_HOUR - FIRST_HOUR) * HOUR_HEIGHT }}>{Array.from({ length: LAST_HOUR - FIRST_HOUR }, (_, i) => <div key={i} className="h-[58px] border-b border-[var(--border)]/70" />)}{entriesByDay[dayIndex].map((event) => {
          const top = Math.max(0, ((minutes(event.start) - FIRST_HOUR * 60) / 60) * HOUR_HEIGHT)
          const height = Math.max(28, ((minutes(event.end) - minutes(event.start)) / 60) * HOUR_HEIGHT)
          const hasConflict = conflictIdsByDay.has(`${dayKey(day)}:${event.id}`)
          return <article key={event.id} draggable={Boolean(event.task)} onDragStart={(dragEvent) => { if (!event.task) return; setDraggingTaskId(event.task.id); dragEvent.dataTransfer.effectAllowed = 'move'; dragEvent.dataTransfer.setData('application/x-quacker-task', event.task.id) }} onDragEnd={() => { setDraggingTaskId(null); setDropDayIndex(null) }} title={event.task ? `${event.details} · Arrastra para moverla de día y hora` : event.details || event.title} style={{ top, height, borderLeftColor: hasConflict ? '#ef4444' : event.color, backgroundColor: hasConflict ? 'rgba(239,68,68,.12)' : `${event.color}20` }} className={`group absolute left-1 right-1 z-[1] overflow-hidden rounded-lg border-l-[3px] px-1.5 py-1 text-[10px] leading-tight text-[var(--text)] shadow-sm ${event.task ? 'cursor-grab active:cursor-grabbing' : ''} ${draggingTaskId === event.task?.id ? 'opacity-40' : ''} ${hasConflict ? 'ring-1 ring-inset ring-red-500/30' : ''}`}><p className="line-clamp-2 pr-4 font-bold">{event.title}</p><p className="mt-0.5 opacity-75">{event.allDay ? 'Sin hora · se muestra aquí como referencia' : `${event.start}–${event.end}`}</p>{event.routine && <button aria-label={`Editar horario ${event.title}`} onClick={() => openEditor(event.routine)} className="absolute right-0.5 top-0.5 rounded bg-[var(--surface)]/90 p-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Pencil className="h-3 w-3" /></button>}{event.task && <button onClick={() => updateTask(event.task!.id, { status: event.task!.status === 'done' ? 'pending' : 'done' })} className="absolute bottom-1 right-1 rounded bg-[var(--surface)]/90 px-1.5 py-1 font-bold opacity-100 sm:opacity-0 sm:group-hover:opacity-100">{event.task.status === 'done' ? 'Reabrir' : 'Completar'}</button>}</article>
        })}</div>)}</div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-[var(--border)] px-4 py-3 text-[10px] text-[var(--text-muted)]"><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-amber-400" />Tareas</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-sky-400" />Tu horario</span><span><i className="mr-1 inline-block h-2.5 w-2.5 rounded-sm bg-red-400" />Traslape</span><span>Las tareas sin hora se muestran como referencia. Arrastra una tarea para cambiarle el día y la hora.</span></div>
    </div> : <section className="space-y-3">{weekDays.map((day, dayIndex) => {
      const entries = entriesByDay[dayIndex]
      const dayConflicts = conflicts.filter((item) => dayKey(item.day) === dayKey(day)).length
      return <article key={day.toISOString()} className={`card overflow-hidden ${isToday(day) ? 'border-[var(--accent)]/40' : ''}`}><header className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3"><div><h2 className="font-bold capitalize">{format(day, 'EEEE d MMMM', { locale: es })}{isToday(day) && <span className="ml-2 rounded-full bg-[var(--accent)]/10 px-2 py-1 text-[10px] text-[var(--accent)]">Hoy</span>}</h2><p className="mt-1 text-[10px] text-[var(--text-muted)]">{entries.length} {entries.length === 1 ? 'actividad' : 'actividades'}{dayConflicts > 0 ? ` · ${dayConflicts} traslape${dayConflicts > 1 ? 's' : ''}` : ''}</p></div><button onClick={() => openEditor(undefined, { date: dayKey(day) })} className="grid h-9 w-9 place-items-center rounded-xl border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--accent)]/10" aria-label={`Añadir evento el ${DAYS[dayIndex]}`}><Plus className="h-4 w-4" /></button></header><div className="divide-y divide-[var(--border)]">{entries.length ? entries.map((event) => <div key={event.id} className="flex items-center gap-3 px-4 py-3"><span className="h-9 w-1 shrink-0 rounded-full" style={{ background: conflictIdsByDay.has(`${dayKey(day)}:${event.id}`) ? '#ef4444' : event.color }} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{event.title}</p><p className="mt-0.5 text-xs text-[var(--text-muted)]">{event.allDay ? 'Sin hora' : `${event.start} – ${event.end}`}{event.details ? ` · ${event.details}` : ''}</p></div>{event.routine && <button onClick={() => openEditor(event.routine)} className="rounded-lg p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]" aria-label={`Editar ${event.title}`}><Pencil className="h-4 w-4" /></button>}{event.task && <button onClick={() => updateTask(event.task!.id, { status: event.task!.status === 'done' ? 'pending' : 'done' })} className={`rounded-lg p-2 ${event.task.status === 'done' ? 'text-emerald-500' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`} aria-label={event.task.status === 'done' ? 'Reabrir tarea' : 'Completar tarea'}><Check className="h-4 w-4" /></button>}</div>) : <p className="px-4 py-5 text-xs text-[var(--text-muted)]">Día libre. ¿Quieres dejar algo planeado?</p>}</div></article>
    })}</section>}

    <section className="grid gap-3 md:grid-cols-2"><div className="card p-4"><h2 className="text-sm font-bold">Tu rutina semanal</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Bloques repetidos como trabajo, clases o actividades. Toca uno para editarlo.</p><div className="mt-3 flex flex-wrap gap-2">{blocks.filter((block) => !block.date).map((block) => <span key={block.id} className="flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs"><span className="h-2 w-2 rounded-full" style={{ background: block.color }} />{block.title}<span className="text-[var(--text-muted)]">{block.start}–{block.end}</span><button aria-label={`Editar horario ${block.title}`} onClick={() => openEditor(block)} className="text-[var(--text-muted)] hover:text-[var(--accent)]"><Pencil className="h-3 w-3" /></button><button aria-label={`Eliminar horario ${block.title}`} onClick={() => setBlocks((items) => items.filter((item) => item.id !== block.id))} className="text-[var(--text-muted)] hover:text-red-400"><Trash2 className="h-3 w-3" /></button></span>)}{routineCount === 0 && <p className="text-xs text-[var(--text-muted)]">Aún no has añadido bloques de rutina.</p>}</div></div><div className="card flex items-start gap-3 p-4"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" /><div><h2 className="text-sm font-bold">Tus tareas ya están aquí</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Se sincronizan desde todos los apartados cuando tienen fecha. Si no tienen hora, aparecen como referencia y no bloquean tus espacios disponibles.</p></div></div></section>

    <Modal open={editorOpen} onClose={() => { setEditing(null); setEditorOpen(false) }} title={editing ? 'Editar horario' : date ? 'Planear este espacio' : 'Añadir a mi semana'}>
      <div className="space-y-4">
        <label className="block text-xs font-bold">Nombre<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Trabajo, clase, entrenamiento…" className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm" /></label>
        <label className="block text-xs font-bold">Detalles (opcional)<input value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Lugar, persona o nota rápida" className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5 text-sm" /></label>
        <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Desde<input type="time" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2" /></label><label className="text-xs font-bold">Hasta<input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2" /></label></div>
        <label className="block text-xs font-bold">Tipo de horario<div className="mt-2 grid grid-cols-2 gap-2"><button type="button" onClick={() => setDate('')} className={`rounded-xl border px-3 py-2.5 text-left text-xs ${!date ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)]'}`}><span className="block font-bold">Se repite</span><span className="mt-1 block font-normal opacity-75">Cada semana</span></button><button type="button" onClick={() => setDate((value) => value || dayKey(weekDays[0]))} className={`rounded-xl border px-3 py-2.5 text-left text-xs ${date ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)]'}`}><span className="block font-bold">Una sola vez</span><span className="mt-1 block font-normal opacity-75">Para una fecha específica</span></button></div></label>
        {date ? <label className="block text-xs font-bold">Fecha<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1.5 w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2" /></label> : <div><p className="mb-2 text-xs font-bold">Días de la semana</p><div className="flex flex-wrap gap-2">{DAYS.map((day, index) => <button type="button" key={day} onClick={() => setDays((current) => current.includes(index) ? current.filter((d) => d !== index) : [...current, index].sort())} className={`rounded-full px-3 py-1.5 text-xs font-bold ${days.includes(index) ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] text-[var(--text-muted)]'}`}>{day.slice(0, 2)}</button>)}</div></div>}
        <div><p className="mb-2 text-xs font-bold">Color del bloque</p><div className="flex gap-2">{COLORS.map((value) => <button type="button" key={value} aria-label={`Color ${value}`} onClick={() => setColor(value)} className="h-7 w-7 rounded-full border-2" style={{ background: value, borderColor: value === color ? 'var(--text)' : 'transparent' }} />)}</div></div>
        {minutes(end) > minutes(start) && <p className="rounded-xl bg-[var(--surface-2)] px-3 py-2 text-xs text-[var(--text-muted)]"><Clock3 className="mr-1.5 inline h-3.5 w-3.5" />Duración: {Math.floor((minutes(end) - minutes(start)) / 60) ? `${Math.floor((minutes(end) - minutes(start)) / 60)} h ` : ''}{(minutes(end) - minutes(start)) % 60 ? `${(minutes(end) - minutes(start)) % 60} min` : ''}</p>}
        <div className="flex justify-end gap-2">{editing && <button onClick={() => { setBlocks((items) => items.filter((item) => item.id !== editing.id)); setEditing(null); setEditorOpen(false) }} className="mr-auto flex items-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10"><Trash2 className="h-4 w-4" />Eliminar</button>}<button onClick={() => { setEditing(null); setEditorOpen(false) }} className="btn-ghost">Cancelar</button><button onClick={saveBlock} disabled={!title.trim() || minutes(end) <= minutes(start) || (!date && days.length === 0)} className="btn-primary">Guardar horario</button></div>
      </div>
    </Modal>
  </div>
}
