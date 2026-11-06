import { useRef, useState, type DragEvent, type TouchEvent } from 'react'
import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react'
import type { Task } from '../../types/task'

const monthNames = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const weekday = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function CalendarView({
  tasks,
  onCreateTask,
  onMoveTask,
}: {
  tasks: Task[]
  onCreateTask?: (date: Date) => void
  onMoveTask?: (taskId: string, date: Date) => void
}) {
  const today = new Date()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selected, setSelected] = useState(today)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const year = month.getFullYear()
  const m = month.getMonth()
  const offset = (new Date(year, m, 1).getDay() + 6) % 7
  const days = new Date(year, m + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]

  const dayTasks = tasks.filter((t) => t.dueDate && sameDay(t.dueDate, selected))

  const moveTaskToHour = (taskId: string, hour: number) => {
    const target = new Date(selected)
    target.setHours(hour, 0, 0, 0)
    onMoveTask?.(taskId, target)
  }

  const moveToDay = (event: DragEvent<HTMLButtonElement>, targetDay: Date) => {
    event.preventDefault()
    const taskId = event.dataTransfer.getData('application/x-quacker-task') || draggingId
    if (taskId) {
      const task = tasks.find((item) => item.id === taskId)
      const target = new Date(targetDay)
      if (task?.dueDate) target.setHours(task.dueDate.getHours(), task.dueDate.getMinutes(), 0, 0)
      onMoveTask?.(taskId, target)
    }
    setDraggingId(null)
    setDragOver(null)
    setSelected(targetDay)
  }

  const startTouchDrag = (event: TouchEvent<HTMLLIElement>, taskId: string) => {
    if ((event.target as HTMLElement).closest('select, button, input')) return
    const touch = event.touches[0]
    touchTimer.current = setTimeout(() => {
      setDraggingId(taskId)
      if (navigator.vibrate) navigator.vibrate(18)
    }, 420)
    void touch
  }

  const moveTouchDrag = (event: TouchEvent<HTMLLIElement>) => {
    if (!draggingId) return
    event.preventDefault()
    const touch = event.touches[0]
    const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest<HTMLElement>('[data-drop-day]')
    setDragOver(target?.dataset.dropDay ? `day-${target.dataset.dropDay}` : null)
  }

  const endTouchDrag = (event: TouchEvent<HTMLLIElement>) => {
    if (touchTimer.current) clearTimeout(touchTimer.current)
    touchTimer.current = null
    if (draggingId) {
      const touch = event.changedTouches[0]
      const target = document.elementFromPoint(touch.clientX, touch.clientY)?.closest<HTMLElement>('[data-drop-day]')
      if (target?.dataset.dropDay) {
        const [year, month, day] = target.dataset.dropDay.split('-').map(Number)
        const targetDate = new Date(year, month - 1, day)
        const task = tasks.find((item) => item.id === draggingId)
        if (task?.dueDate) targetDate.setHours(task.dueDate.getHours(), task.dueDate.getMinutes(), 0, 0)
        onMoveTask?.(draggingId, targetDate)
        setSelected(targetDate)
      }
      setDraggingId(null)
      setDragOver(null)
    }
  }

  return (
    <div className="relative flex h-full flex-col rounded-[calc(var(--radius)*0.8)] border border-[var(--border)] bg-[var(--surface)]/75 p-4 pt-3 backdrop-blur-[6px]">
      <div className="mb-4 flex items-center justify-between gap-1">
        <button
          onClick={() => setMonth(new Date(year, m - 1, 1))}
          aria-label="Mes anterior"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 text-center">
          <p className="text-sm font-semibold capitalize">{monthNames[m]} {year}</p>
          <button onClick={() => { const d = new Date(); d.setDate(1); setMonth(d); setSelected(new Date()) }} className="text-[10px] font-medium text-[var(--accent)] hover:underline">Ir a hoy</button>
        </div>
        <button
          onClick={() => setMonth(new Date(year, m + 1, 1))}
          aria-label="Mes siguiente"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
        {onCreateTask && <button onClick={() => onCreateTask(selected)} title="Crear tarea para este día" aria-label="Crear tarea para este día" className="ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)] text-[var(--bg)] shadow-sm transition hover:brightness-105 active:scale-95"><Plus className="h-5 w-5" /></button>}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekday.map((w, i) => (
          <span key={i} className="py-1 text-[11px] text-[var(--text-muted)]">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={i} />
          const date = new Date(year, m, day)
          const isToday = sameDay(date, today)
          const isSelected = sameDay(date, selected)
          const hasOpen = tasks.some((t) => t.dueDate && sameDay(t.dueDate, date) && t.status !== 'done')
          return (
            <button
              key={i}
              data-drop-day={`${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`}
              onClick={() => setSelected(date)}
              onDragOver={(event) => { if (draggingId) { event.preventDefault(); setDragOver(`day-${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`) } }}
              onDragLeave={() => setDragOver(null)}
              onDrop={(event) => {
                moveToDay(event, date)
              }}
              className={`flex h-10 flex-col items-center justify-center rounded-lg text-sm transition-colors ${dragOver === `day-${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` ? 'bg-[var(--accent)]/25 ring-2 ring-[var(--accent)]' : ''} ${
                isToday
                  ? 'border border-[var(--accent)]'
                  : isSelected
                    ? 'bg-[var(--accent)] text-[var(--accent-text,#121212)]'
                    : 'hover:bg-[var(--surface-2)]'
              }`}
            >
              <span>{day}</span>
              {hasOpen && (
                <span className={`h-1 w-1 rounded-full ${isSelected ? 'bg-[var(--accent-text,#121212)]' : 'bg-[var(--accent)]'}`} />
              )}
            </button>
          )
        })}
      </div>
      <div className="mt-4 flex-1 rounded-[calc(var(--radius)*0.8)] border border-[var(--border)] p-4">
        <p className="eyebrow mb-2">
          {new Intl.DateTimeFormat('es-CO', { weekday: 'long', day: '2-digit', month: 'long' }).format(selected)}
        </p>
        {onMoveTask && <p className="mb-3 text-[10px] text-[var(--text-muted)]">Arrastra una tarea a otro día o usa «Mover…» para cambiar su hora.</p>}
        {dayTasks.length === 0 ? (
          <p className="flex items-center gap-2 text-sm italic text-[var(--text-muted)]">
            <Sparkles className="h-4 w-4 text-[var(--accent)]" />
            {sameDay(selected, today)
              ? 'Nada para hoy. ¡Día libre, a disfrutarlo!'
              : 'Ninguna tarea. Este día está despejado.'}
          </p>
        ) : (
          <ul className="space-y-1">
            {dayTasks.map((t) => (
              <li key={t.id} draggable={Boolean(onMoveTask)} onDragStart={(event) => { setDraggingId(t.id); event.dataTransfer.effectAllowed = 'move'; event.dataTransfer.setData('application/x-quacker-task', t.id) }} onDragEnd={() => { setDraggingId(null); setDragOver(null) }} onTouchStart={(event) => onMoveTask && startTouchDrag(event, t.id)} onTouchMove={moveTouchDrag} onTouchEnd={endTouchDrag} onTouchCancel={endTouchDrag} className={`flex min-w-0 cursor-grab items-center gap-2 rounded-lg px-2 py-1.5 text-sm active:cursor-grabbing ${draggingId === t.id ? 'opacity-40' : 'hover:bg-[var(--surface-2)]'}`} style={{ touchAction: draggingId === t.id ? 'none' : 'pan-y' }} title="Arrastra al día deseado o elige una hora">
                <span className={`min-w-0 flex-1 truncate ${t.status === 'done' ? 'text-[var(--text-muted)] line-through' : ''}`}>{t.title}</span>
                <span className="shrink-0 text-[10px] tabular-nums text-[var(--text-muted)]">
                  {new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(t.dueDate!)}
                </span>
                {onMoveTask && <select aria-label={`Cambiar hora de ${t.title}`} title="Cambiar hora" defaultValue="" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => event.stopPropagation()} onChange={(event) => { const hour = Number(event.target.value); if (Number.isInteger(hour)) moveTaskToHour(t.id, hour); event.target.value = '' }} className="h-8 max-w-[84px] shrink-0 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-1.5 text-[10px] font-semibold text-[var(--text)] outline-none focus:border-[var(--accent)]">
                  <option value="">Mover…</option>
                  {Array.from({ length: 24 }, (_, hour) => <option key={hour} value={hour}>{String(hour).padStart(2, '0')}:00</option>)}
                </select>}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
