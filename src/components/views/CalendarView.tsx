import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '../../types/task'

const monthNames = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
const weekday = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function CalendarView({ tasks }: { tasks: Task[] }) {
  const today = new Date()
  const [month, setMonth] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d
  })
  const [selected, setSelected] = useState(today)

  const year = month.getFullYear()
  const m = month.getMonth()
  const offset = (new Date(year, m, 1).getDay() + 6) % 7
  const days = new Date(year, m + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: days }, (_, i) => i + 1),
  ]

  const dayTasks = tasks.filter((t) => t.dueDate && sameDay(t.dueDate, selected))

  return (
    <div className="rounded-[calc(var(--radius)*0.8)] border border-[var(--border)] bg-[var(--surface)]/75 p-4 backdrop-blur-[6px]">
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={() => setMonth(new Date(year, m - 1, 1))}
          className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <p className="text-sm font-semibold capitalize">
          {monthNames[m]} {year}
        </p>
        <button
          onClick={() => setMonth(new Date(year, m + 1, 1))}
          className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
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
              onClick={() => setSelected(date)}
              className={`flex h-10 flex-col items-center justify-center rounded-lg text-sm transition-colors ${
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
      <div className="mt-4 rounded-[calc(var(--radius)*0.8)] border border-[var(--border)] p-4">
        <p className="eyebrow mb-2">
          Tareas ·{' '}
          {new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'long' }).format(selected)}
        </p>
        {dayTasks.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)]">Sin tareas este día.</p>
        ) : (
          <ul className="space-y-1">
            {dayTasks.map((t) => (
              <li key={t.id} className="flex items-center justify-between text-sm">
                <span className={t.status === 'done' ? 'text-[var(--text-muted)] line-through' : ''}>{t.title}</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(t.dueDate!)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
