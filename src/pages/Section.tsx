import { useCallback, useEffect, useMemo, useState } from 'react'
import { Focus, Palette, Plus } from 'lucide-react'
import SectionShell from '../components/layout/SectionShell'
import Modal from '../components/ui/Modal'
import TaskForm from '../components/task/TaskForm'
import ThemeEditor from '../components/task/ThemeEditor'
import ListView from '../components/views/ListView'
import BoardView from '../components/views/BoardView'
import CalendarView from '../components/views/CalendarView'
import GanttView from '../components/views/GanttView'
import { useTasksStore } from '../store/tasks'
import { useUIStore } from '../store/ui'
import { useSectionsStore } from '../store/sections'
import { createTask, toTaskInput, type TaskInput } from '../lib/tasks'
import { nextOccurrence } from '../lib/recurrence'
import { celebrateCompletion } from '../lib/celebrate'
import type { Priority, Recurrence, SectionId, Status, Task, ViewMode } from '../types/task'

const recurrenceLabel: Record<Recurrence, string> = {
  none: '',
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
}
const viewTabs: { id: ViewMode; label: string }[] = [
  { id: 'list', label: 'Lista' },
  { id: 'board', label: 'Tablero' },
  { id: 'calendar', label: 'Calendario' },
  { id: 'gantt', label: 'Línea de tiempo' },
]
const priorityChips: { id: Priority | 'all'; label: string; dot: string }[] = [
  { id: 'all', label: 'Todas', dot: '' },
  { id: 'alta', label: 'Alta', dot: 'bg-red-400' },
  { id: 'media', label: 'Media', dot: 'bg-amber-300' },
  { id: 'baja', label: 'Baja', dot: 'bg-emerald-400' },
]

export default function Section({ sectionId }: { sectionId: SectionId }) {
  const tasks = useTasksStore((s) => s.tasks)
  const addTask = useTasksStore((s) => s.addTask)
  const updateTask = useTasksStore((s) => s.updateTask)
  const reorderTasks = useTasksStore((s) => s.reorderTasks)
  const view = useUIStore((s) => s.views[sectionId])
  const setView = useUIStore((s) => s.setView)
  const label = useSectionsStore((s) => s.sections.find((x) => x.id === sectionId)?.label ?? 'Apartado')
  const [open, setOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [recurringTask, setRecurringTask] = useState<Task | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const openFocus = useUIStore((s) => s.openFocus)

  const sectionTasks = tasks
    .filter((t) => t.sectionId === sectionId && !t.archived)
    .sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.getTime() - b.dueDate.getTime()
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return 0
    })

  const allTags = useMemo(
    () => Array.from(new Set(sectionTasks.flatMap((t) => t.tags))).sort(),
    [sectionTasks],
  )
  const filteredTasks = sectionTasks.filter(
    (t) =>
      (priorityFilter === 'all' || t.priority === priorityFilter) &&
      (!tagFilter || t.tags.includes(tagFilter)),
  )

  const openNew = useCallback(() => {
    setEditing(null)
    setOpen(true)
  }, [])

  const openEdit = useCallback((t: Task) => {
    setEditing(t)
    setOpen(true)
  }, [])

  const handleSave = useCallback(
    (input: TaskInput) => {
      if (editing) {
        updateTask(editing.id, {
          ...input,
          completedAt: input.status === 'done' ? (editing.completedAt ?? new Date()) : null,
        })
      } else {
        addTask(createTask(sectionId, input))
      }
      setOpen(false)
    },
    [editing, updateTask, addTask, sectionId],
  )

  const applyStatus = useCallback((t: Task, next: Status) => {
    if (next === 'done' && t.status !== 'done') {
      const all = useTasksStore.getState().tasks
      setTimeout(() => celebrateCompletion(all), 180)
    }
    useTasksStore
      .getState()
      .updateTask(t.id, { status: next, completedAt: next === 'done' ? (t.completedAt ?? new Date()) : null })
  }, [])

  const handleDuplicate = useCallback((t: Task) => {
    useTasksStore
      .getState()
      .addTask(createTask(t.sectionId, { ...toTaskInput(t), title: `${t.title} (copia)`, status: 'pending' }))
  }, [])

  const handleMoveSection = useCallback((id: string, sectionId: string) => {
    const t = useTasksStore.getState().tasks.find((x) => x.id === id)
    if (!t || t.sectionId === sectionId) return
    useTasksStore.getState().updateTask(id, { sectionId })
  }, [])

  useEffect(() => {
    const onNew = () => openNew()
    window.addEventListener('tasklex:new-task', onNew)
    return () => window.removeEventListener('tasklex:new-task', onNew)
  }, [openNew])

  const toggleStatus = useCallback((id: string) => {
    const t = useTasksStore.getState().tasks.find((x) => x.id === id)
    if (!t) return
    const next: Status = t.status === 'pending' ? 'in_progress' : t.status === 'in_progress' ? 'done' : 'pending'
    if (next === 'done' && t.recurrence !== 'none') {
      setRecurringTask(t)
      return
    }
    applyStatus(t, next)
  }, [applyStatus])

  const moveStatus = useCallback(
    (id: string, dir: -1 | 1) => {
      const t = useTasksStore.getState().tasks.find((x) => x.id === id)
      if (!t) return
      const order: Status[] = ['pending', 'in_progress', 'done']
      const j = Math.min(2, Math.max(0, order.indexOf(t.status) + dir))
      const next = order[j]
      if (next === 'done' && t.recurrence !== 'none') {
        setRecurringTask(t)
        return
      }
      applyStatus(t, next)
    },
    [applyStatus],
  )

  const completeAndRepeat = useCallback(() => {
    if (!recurringTask) return
    const t = recurringTask
    applyStatus(t, 'done')
    useTasksStore
      .getState()
      .addTask(createTask(t.sectionId, { ...toTaskInput(t), dueDate: nextOccurrence(t.dueDate ?? new Date(), t.recurrence) }))
    setRecurringTask(null)
  }, [recurringTask, applyStatus])

  const completeOnly = useCallback(() => {
    if (!recurringTask) return
    applyStatus(recurringTask, 'done')
    setRecurringTask(null)
  }, [recurringTask, applyStatus])

  const handleDelete = useCallback((id: string) => {
    setTaskToDelete(id)
    setDeleteOpen(true)
  }, [])

  const confirmDelete = useCallback(() => {
    if (taskToDelete) {
      useTasksStore.getState().deleteTask(taskToDelete)
      setTaskToDelete(null)
    }
    setDeleteOpen(false)
  }, [taskToDelete])

  const handleArchive = useCallback((id: string) => useTasksStore.getState().updateTask(id, { archived: true }), [])

  return (
    <SectionShell sectionId={sectionId}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight break-words">{label}</h1>
        </div>
        <button onClick={openNew} className="btn-primary shrink-0 whitespace-nowrap">
          <Plus className="h-4 w-4" /> Nueva tarea
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex rounded-full border border-[var(--border)] p-1">
          {viewTabs.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setView(sectionId, id)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                view === id ? 'bg-[var(--accent)] font-semibold text-[#121212]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={openFocus}
            className="flex items-center gap-1.5 text-xs text-[var(--accent)] hover:underline"
          >
            <Focus className="h-4 w-4" /> Modo foco
          </button>
          <button
            onClick={() => setThemeOpen(true)}
            className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <Palette className="h-4 w-4" /> Personalizar tema
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          {priorityChips.map((c) => (
            <button
              key={c.id}
              onClick={() => setPriorityFilter(c.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                priorityFilter === c.id
                  ? 'border-[var(--accent)] bg-[var(--accent)] font-semibold text-[#121212]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {c.dot && <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />}
              {c.label}
            </button>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  tagFilter === tag
                    ? 'border-[var(--accent)] bg-[var(--accent)] font-semibold text-[#121212]'
                    : 'border-[var(--border)] text-[var(--accent)] hover:bg-[var(--surface-2)]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5">
        {view === 'list' && (
          <div key="list" className="animate-in fade-in slide-in-from-left-2 duration-300">
            <ListView
              tasks={filteredTasks}
              onToggle={toggleStatus}
              onEdit={openEdit}
              onDelete={handleDelete}
              onArchive={handleArchive}
              onDuplicate={handleDuplicate}
              onMove={handleMoveSection}
              onReorder={reorderTasks}
            />
          </div>
        )}
        {view === 'board' && (
          <div key="board" className="animate-in fade-in slide-in-from-left-2 duration-300">
            <BoardView
              tasks={filteredTasks}
              onMove={moveStatus}
              onMoveSection={handleMoveSection}
              onDuplicate={handleDuplicate}
            />
          </div>
        )}
        {view === 'calendar' && (
          <div key="calendar" className="animate-in fade-in slide-in-from-left-2 duration-300">
            <CalendarView tasks={filteredTasks} />
          </div>
        )}
        {view === 'gantt' && (
          <div key="gantt" className="animate-in fade-in slide-in-from-left-2 duration-300">
            <GanttView tasks={filteredTasks} onToggle={toggleStatus} />
          </div>
        )}
      </div>

      {open && (
        <TaskForm
          open={open}
          initial={editing ? toTaskInput(editing) : null}
          onSave={handleSave}
          onClose={() => setOpen(false)}
        />
      )}
      <ThemeEditor sectionId={sectionId} open={themeOpen} onClose={() => setThemeOpen(false)} />

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar tarea"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            ¿Eliminar esta tarea? Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={confirmDelete}
              className="btn-primary justify-center"
            >
              Eliminar
            </button>
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={recurringTask !== null}
        onClose={() => setRecurringTask(null)}
        title="Tarea recurrente"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            <strong className="text-[var(--text)]">{recurringTask?.title}</strong> se repite (
            {recurringTask ? recurrenceLabel[recurringTask.recurrence] : ''}). ¿Quieres crear la
            siguiente?
          </p>
          <div className="flex flex-col gap-2">
            <button onClick={completeAndRepeat} className="btn-primary justify-center">
              Completar y crear la próxima
            </button>
            <button
              onClick={completeOnly}
              className="rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              Solo completar esta
            </button>
          </div>
        </div>
      </Modal>
    </SectionShell>
  )
}
