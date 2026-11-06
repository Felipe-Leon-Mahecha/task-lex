import { useMemo, useState } from 'react'
import { CalendarCheck, ChevronDown, ChevronUp, CircleCheck, ListPlus, Sparkles, Target } from 'lucide-react'
import { useTasksStore } from '../store/tasks'
import { useSectionsStore } from '../store/sections'
import { isToday } from '../lib/tasks'

const now = new Date()
const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
const storageKey = `quacker-daily-plan:${todayKey}`

export default function DailyPlan() {
  const tasks = useTasksStore((state) => state.tasks)
  const updateTask = useTasksStore((state) => state.updateTask)
  const sections = useSectionsStore((state) => state.sections)
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try { const value = JSON.parse(localStorage.getItem(storageKey) ?? '[]'); return Array.isArray(value) ? value.filter((id) => typeof id === 'string') : [] } catch { return [] }
  })
  const [pickerOpen, setPickerOpen] = useState(false)
  const today = useMemo(() => tasks.filter((task) => !task.archived && task.status !== 'done' && (task.dueDate && isToday(task.dueDate) || task.focusDay)), [tasks])
  const selectedTasks = selectedIds.map((id) => tasks.find((task) => task.id === id)).filter((task) => task && !task.archived)
  const candidates = tasks.filter((task) => !task.archived && task.status !== 'done' && !selectedIds.includes(task.id))
  const persist = (ids: string[]) => { setSelectedIds(ids); try { localStorage.setItem(storageKey, JSON.stringify(ids)) } catch {} }
  const toggle = (id: string) => persist(selectedIds.includes(id) ? selectedIds.filter((item) => item !== id) : selectedIds.length < 5 ? [...selectedIds, id] : selectedIds)
  const move = (index: number, direction: -1 | 1) => { const next = [...selectedIds]; const target = index + direction; if (target < 0 || target >= next.length) return; [next[index], next[target]] = [next[target], next[index]]; persist(next) }

  return <div className="mx-auto max-w-5xl space-y-6">
    <section className="rounded-3xl border border-[var(--accent)]/25 bg-gradient-to-br from-[var(--surface)] to-[var(--accent)]/10 p-6 sm:p-8">
      <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]"><CalendarCheck className="h-6 w-6" /></span><div><p className="eyebrow">Plan diario</p><h1 className="mt-1 text-2xl font-extrabold">Elige lo importante de hoy.</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">Arma una ruta realista con hasta cinco tareas. El orden queda guardado para hoy y mañana empiezas con una hoja limpia.</p></div></div>
      <div className="mt-5 flex flex-wrap items-center gap-3"><div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-3 py-2 text-xs"><Target className="h-4 w-4 text-[var(--accent)]" />{selectedIds.length} de 5 espacios</div><span className="text-xs text-[var(--text-muted)]">{new Intl.DateTimeFormat('es-CO', { dateStyle: 'full' }).format(new Date())}</span></div>
    </section>

    <section>
      <div className="mb-3 flex items-center justify-between gap-3"><div><p className="eyebrow">Tu recorrido</p><h2 className="mt-1 text-lg font-bold">{selectedTasks.length ? 'En este orden' : 'Todavía no has elegido tareas'}</h2></div><button onClick={() => setPickerOpen((open) => !open)} className="btn-primary min-h-10 rounded-xl"><ListPlus className="h-4 w-4" />{pickerOpen ? 'Listo' : 'Añadir tareas'}</button></div>
      {selectedTasks.length === 0 ? <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center"><Sparkles className="mx-auto h-8 w-8 text-[var(--accent)]" /><p className="mt-3 text-sm font-semibold">Empieza con una prioridad clara</p><p className="mt-1 text-xs text-[var(--text-muted)]">Escoge hasta cinco tareas y ordénalas según tu energía y tu tiempo.</p></div> : <ol className="space-y-2">{selectedTasks.map((task, index) => task && <li key={task.id} className="card flex items-center gap-3 p-3 sm:p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/10 text-sm font-extrabold text-[var(--accent)]">{index + 1}</span><button onClick={() => updateTask(task.id, { status: 'done', completedAt: new Date() })} title="Marcar como hecha" className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"><CircleCheck className="h-5 w-5" /></button><div className="min-w-0 flex-1"><p className={`truncate text-sm font-semibold ${task.status === 'done' ? 'line-through text-[var(--text-muted)]' : ''}`}>{task.title}</p><p className="mt-0.5 text-[10px] text-[var(--text-muted)]">{sections.find((section) => section.id === task.sectionId)?.label ?? 'Bandeja de entrada'}{task.dueDate ? ` · ${new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(task.dueDate)}` : ''}</p></div><div className="flex shrink-0"><button aria-label="Subir tarea" disabled={index === 0} onClick={() => move(index, -1)} className="rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-30"><ChevronUp className="h-4 w-4" /></button><button aria-label="Bajar tarea" disabled={index === selectedTasks.length - 1} onClick={() => move(index, 1)} className="rounded-lg p-2 text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-30"><ChevronDown className="h-4 w-4" /></button><button aria-label="Quitar del plan" onClick={() => toggle(task.id)} className="rounded-lg px-2 text-xs text-[var(--text-muted)] hover:text-red-400">Quitar</button></div></li>)}</ol>}
    </section>

    {pickerOpen && <section className="animate-in fade-in slide-in-from-bottom-2 duration-200 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"><div className="mb-3 flex items-center justify-between"><div><h2 className="text-sm font-bold">Elige tareas</h2><p className="text-xs text-[var(--text-muted)]">{today.length ? 'Las de hoy y tus tareas en foco aparecen primero.' : 'Puedes elegir de toda tu lista activa.'}</p></div><button onClick={() => setPickerOpen(false)} className="text-xs font-semibold text-[var(--accent)]">Cerrar</button></div><div className="max-h-80 space-y-1 overflow-y-auto">{[...today, ...candidates.filter((task) => !today.some((item) => item.id === task.id))].map((task) => <label key={task.id} className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-[var(--surface-2)]"><input type="checkbox" checked={selectedIds.includes(task.id)} disabled={!selectedIds.includes(task.id) && selectedIds.length >= 5} onChange={() => toggle(task.id)} className="h-4 w-4 accent-[var(--accent)]" /><span className="min-w-0 flex-1 truncate text-sm">{task.title}</span><span className="shrink-0 text-[10px] text-[var(--text-muted)]">{sections.find((section) => section.id === task.sectionId)?.label ?? 'Bandeja'}</span></label>)}</div><p className="mt-2 text-[10px] text-[var(--text-muted)]">{candidates.length === 0 ? 'No hay más tareas activas para añadir.' : 'Elige solo lo que de verdad esperas completar.'}</p></section>}
  </div>
}
