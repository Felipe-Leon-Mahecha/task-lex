import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Task } from '../../types/task'

const weekday = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function dayDiff(a: Date, b: Date) {
  return Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / 86400000)
}

export default function GanttView({
  tasks,
  onToggle,
}: {
  tasks: Task[]
  onToggle: (id: string) => void
}) {
  const today = startOfDay(new Date())
  const [start, setStart] = useState(() => {
    const d = startOfDay(new Date())
    d.setDate(d.getDate() - 1)
    return d
  })
  const DAYS = 14
  const days = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d
  })
  const isToday = days.some((d) => dayDiff(d, today) === 0)

  const withDue = tasks
    .filter((t) => t.dueDate)
    .sort((a, b) => (a.dueDate!.getTime() - b.dueDate!.getTime()))
  const noDue = tasks.filter((t) => !t.dueDate)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(start)
              d.setDate(start.getDate() - DAYS)
              setStart(d)
            }}
            className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm font-semibold capitalize">
            {new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(days[0])} –{' '}
            {new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(days[DAYS - 1])}
          </p>
          <button
            onClick={() => {
              const d = new Date(start)
              d.setDate(start.getDate() + DAYS)
              setStart(d)
            }}
            className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          {!isToday && (
            <button
              onClick={() => {
                const d = startOfDay(new Date())
                d.setDate(d.getDate() - 1)
                setStart(d)
              }}
              className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Hoy
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="min-w-[640px] rounded-lg border border-[var(--border)] bg-[var(--surface-2)] p-4 shadow-lg">
          <div className="grid grid-cols-[160px_1fr] gap-2">
            <div />
            <div className="relative grid grid-cols-14">
              {days.map((d, i) => {
                const wd = (d.getDay() + 6) % 7
                const isT = dayDiff(d, today) === 0
                return (
                  <div key={i} className="flex flex-col items-center text-center">
                    <span className={`text-[10px] uppercase ${isT ? 'font-bold text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                      {weekday[wd]}
                    </span>
                    <span className={`text-xs ${isT ? 'font-bold text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                      {d.getDate()}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-2 space-y-1.5">
            {withDue.map((t) => {
              const idx = dayDiff(t.dueDate!, start)
              const overdue = idx < 0
              const done = t.status === 'done'
              const left = Math.max(0, idx)
              const span = Math.min(DAYS - left, 1)
              const colW = 100 / DAYS
              return (
                <div key={t.id} className="grid grid-cols-[160px_1fr] items-center gap-2">
                  <button
                    onClick={() => onToggle(t.id)}
                    className={`truncate text-left text-xs ${done ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)]'}`}
                  >
                    {t.title}
                  </button>
                  <div className="relative h-6">
                    {days.map((_, i) => (
                      <div key={i} className="absolute top-1 bottom-1 w-px bg-[var(--border)] opacity-40" style={{ left: `${i * colW}%` }} />
                    ))}
                    {dayDiff(today, start) >= 0 && dayDiff(today, start) < DAYS && (
                      <div
                        className="absolute top-0 bottom-0 w-px bg-[var(--accent)]"
                        style={{ left: `${dayDiff(today, start) * colW}%` }}
                      />
                    )}
                    <button
                      onClick={() => onToggle(t.id)}
                      title={overdue ? `Vencida hace ${-idx} día(s)` : new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' }).format(t.dueDate!)}
                      className={`absolute top-1 h-4 rounded-full transition-transform hover:scale-105 ${
                        done
                          ? 'bg-emerald-400/70'
                          : overdue
                            ? 'bg-red-400/80'
                            : 'bg-[var(--accent)]'
                      }`}
                      style={{
                        left: `calc(${left * colW}% + 2px)`,
                        width: `calc(${span * colW}% - 4px)`,
                        minWidth: 18,
                      }}
                    />
                  </div>
                </div>
              )
            })}
            {noDue.map((t) => (
              <div key={t.id} className="grid grid-cols-[160px_1fr] items-center gap-2">
                <button
                  onClick={() => onToggle(t.id)}
                  className={`truncate text-left text-xs ${t.status === 'done' ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text-muted)]'}`}
                >
                  {t.title}
                </button>
                <div className="relative h-6 rounded-md border border-dashed border-[var(--border)] opacity-60">
                  <span className="absolute inset-0 flex items-center px-2 text-[10px] text-[var(--text-muted)]">
                    Sin fecha
                  </span>
                </div>
              </div>
            ))}
            {withDue.length === 0 && noDue.length === 0 && (
              <p className="py-6 text-center text-sm text-[var(--text-muted)]">Sin tareas para el calendario.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
