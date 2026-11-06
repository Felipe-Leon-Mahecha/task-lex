import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Archive, Inbox as InboxIcon, Plus, Sparkles } from 'lucide-react'
import { useTasksStore } from '../store/tasks'
import { useSectionsStore } from '../store/sections'
import { createTask } from '../lib/tasks'
import { toTaskInput } from '../lib/tasks'
import TaskForm from '../components/task/TaskForm'
import type { Task } from '../types/task'

export default function Inbox() {
  const location = useLocation()
  const navigate = useNavigate()
  const tasks = useTasksStore((state) => state.tasks)
  const addTask = useTasksStore((state) => state.addTask)
  const updateTask = useTasksStore((state) => state.updateTask)
  const sections = useSectionsStore((state) => state.sections)
  const [title, setTitle] = useState('')
  const [editing, setEditing] = useState<Task | null>(null)
  const items = tasks.filter((task) => task.sectionId === 'inbox' && !task.archived).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

  useEffect(() => {
    const taskId = new URLSearchParams(location.search).get('task')
    if (!taskId) return
    const task = tasks.find((item) => item.id === taskId && !item.archived)
    if (!task) return
    setEditing(task)
    navigate(location.pathname, { replace: true })
  }, [location.search, location.pathname, navigate, tasks])

  const capture = () => {
    const value = title.trim()
    if (!value) return
    addTask(createTask('inbox', { title: value, description: '', dueDate: null, priority: 'media', status: 'pending', recurrence: 'none', focusDay: false, reminderLead: null, reminder2HoursBefore: false, subtasks: [], notesLinks: [], images: [], tags: [] }))
    setTitle('')
  }
  const setTaskDate = (taskId: string, value: string) => {
    if (!value) {
      updateTask(taskId, { dueDate: null })
      return
    }
    const [year, month, day] = value.split('-').map(Number)
    updateTask(taskId, { dueDate: new Date(year, month - 1, day) })
  }

  return <div className="mx-auto max-w-4xl space-y-6">
    <section className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/25 bg-gradient-to-br from-[var(--surface)] to-[var(--accent)]/10 p-6 sm:p-8">
      <div className="flex items-start gap-4"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[var(--accent)]/15 text-[var(--accent)]"><InboxIcon className="h-6 w-6" /></span><div><p className="eyebrow">Bandeja de entrada</p><h1 className="mt-1 text-2xl font-extrabold">Saca las ideas de tu cabeza.</h1><p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--text-muted)]">Anota algo al vuelo y decide después a qué apartado pertenece. Aquí puedes capturar sin interrumpir lo que estás haciendo.</p></div></div>
      <form onSubmit={(event) => { event.preventDefault(); capture() }} className="mt-6 flex gap-2"><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="¿Qué no quieres olvidar?" className="min-h-12 min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg)]/75 px-4 text-sm outline-none focus:border-[var(--accent)]" /><button disabled={!title.trim()} className="btn-primary min-h-12 rounded-xl disabled:opacity-40"><Plus className="h-4 w-4" /><span className="hidden sm:inline">Capturar</span></button></form>
    </section>

    <div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Por aclarar</p><h2 className="mt-1 text-lg font-bold">{items.length} {items.length === 1 ? 'idea' : 'ideas'} sin organizar</h2></div><p className="hidden items-center gap-1.5 text-xs text-[var(--text-muted)] sm:flex"><Sparkles className="h-4 w-4 text-[var(--accent)]" />Asigna cada una cuando tengas un momento</p></div>
    {items.length === 0 ? <div className="rounded-3xl border border-dashed border-[var(--border)] p-10 text-center"><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]"><InboxIcon className="h-7 w-7" /></span><h2 className="mt-4 text-base font-bold">La bandeja está despejada</h2><p className="mx-auto mt-1 max-w-sm text-sm text-[var(--text-muted)]">Cuando se te ocurra una tarea, guárdala aquí primero y organízala con calma.</p></div> : <ul className="space-y-3">{items.map((task) => <li key={task.id} className="card flex flex-col gap-3 p-4 sm:flex-row sm:items-center"><button onClick={() => setEditing(task)} className="min-w-0 flex-1 text-left"><p className="font-semibold">{task.title}</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Capturada {new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(task.createdAt)}</p></button><div className="flex flex-wrap items-center gap-2"><label className="sr-only" htmlFor={`assign-${task.id}`}>Mover tarea a un apartado</label><select id={`assign-${task.id}`} value="inbox" onChange={(event) => updateTask(task.id, { sectionId: event.target.value })} className="min-h-10 min-w-40 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 text-xs"><option value="inbox" disabled>Elegir apartado…</option>{sections.map((section) => <option key={section.id} value={section.id}>{section.label}</option>)}</select><label className="sr-only" htmlFor={`date-${task.id}`}>Fecha de la tarea (opcional)</label><input id={`date-${task.id}`} type="date" value={task.dueDate ? `${task.dueDate.getFullYear()}-${String(task.dueDate.getMonth() + 1).padStart(2, '0')}-${String(task.dueDate.getDate()).padStart(2, '0')}` : ''} onChange={(event) => setTaskDate(task.id, event.target.value)} title="Añadir fecha (opcional)" className="min-h-10 w-36 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-2 text-xs text-[var(--text-muted)]" /><button title="Archivar" aria-label={`Archivar ${task.title}`} onClick={() => updateTask(task.id, { archived: true })} className="grid h-10 w-10 place-items-center rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)]"><Archive className="h-4 w-4" /></button></div></li>)}</ul>}
    {editing && <TaskForm open initial={toTaskInput(editing)} onClose={() => setEditing(null)} onSave={(input) => { updateTask(editing.id, { ...input, completedAt: input.status === 'done' ? (editing.completedAt ?? new Date()) : null }); setEditing(null) }} />}
  </div>
}
