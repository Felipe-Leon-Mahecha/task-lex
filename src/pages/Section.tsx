import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Archive, Check, ChevronDown, Filter, List, MoreHorizontal, Palette, Plus, X, Zap } from 'lucide-react'
import SectionShell from '../components/layout/SectionShell'
import Modal from '../components/ui/Modal'
import TaskForm from '../components/task/TaskForm'
import ThemeEditor from '../components/task/ThemeEditor'
import ListView from '../components/views/ListView'
import GanttView from '../components/views/GanttView'
import BoardView from '../components/views/BoardView'
import { useTasksStore } from '../store/tasks'
import { useUIStore } from '../store/ui'
import { useSectionsStore } from '../store/sections'
import { createTask, toTaskInput, type TaskInput } from '../lib/tasks'
import { nextOccurrence } from '../lib/recurrence'
import { celebrateCompletion } from '../lib/celebrate'
import { useFoxSkinsStore } from '../store/foxSkins'
import { useSettingsStore } from '../store/settings'
import { playAppSound } from '../lib/soundEffects'
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
  { id: 'gantt', label: 'Línea de tiempo' },
]
const statusOrder: Status[] = ['pending', 'in_progress', 'waiting', 'done']
const priorityChips: { id: Priority | 'all'; label: string; dot: string }[] = [
  { id: 'all', label: 'Todas', dot: '' },
  { id: 'alta', label: 'Alta', dot: 'bg-red-400' },
  { id: 'media', label: 'Media', dot: 'bg-amber-300' },
  { id: 'baja', label: 'Baja', dot: 'bg-emerald-400' },
]
type QuickTaskFilter = 'all' | 'overdue' | 'today' | 'next7'

function isSameLocalDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function Section({ sectionId }: { sectionId: SectionId }) {
  const location = useLocation()
  const navigate = useNavigate()
  const tasks = useTasksStore((s) => s.tasks)
  const addTask = useTasksStore((s) => s.addTask)
  const updateTask = useTasksStore((s) => s.updateTask)
  const reorderTasks = useTasksStore((s) => s.reorderTasks)
  const view = useUIStore((s) => s.views[sectionId] ?? 'list')
  const setView = useUIStore((s) => s.setView)
  const label = useSectionsStore((s) => s.sections.find((x) => x.id === sectionId)?.label ?? 'Apartado')
  const [open, setOpen] = useState(false)
  const [themeOpen, setThemeOpen] = useState(false)
  const compactTasks = useSettingsStore((s) => s.compactTasks)
  const setCompactTasks = useSettingsStore((s) => s.setCompactTasks)
  const [editing, setEditing] = useState<Task | null>(null)
  const [recurringTask, setRecurringTask] = useState<Task | null>(null)
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [quickTitle, setQuickTitle] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [quickFilter, setQuickFilter] = useState<QuickTaskFilter>('all')
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [sortMode, setSortMode] = useState<'default' | 'completed' | 'pending' | 'priority'>('default')
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)

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
  const today = new Date()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const isOverdue = (date: Date | null) => !!date && date < today && !(isSameLocalDay(date, today) && date.getHours() === 0 && date.getMinutes() === 0)
  const nextWeek = new Date(todayStart)
  nextWeek.setDate(nextWeek.getDate() + 7)
  const quickCounts = {
    all: sectionTasks.length,
    overdue: sectionTasks.filter((task) => isOverdue(task.dueDate) && task.status !== 'done').length,
    today: sectionTasks.filter((task) => task.dueDate && isSameLocalDay(task.dueDate, today) && task.status !== 'done').length,
    next7: sectionTasks.filter((task) => task.dueDate && task.dueDate >= todayStart && task.dueDate < nextWeek && task.status !== 'done').length,
  }
  const filteredTasks = sectionTasks.filter(
    (t) =>
      (priorityFilter === 'all' || t.priority === priorityFilter) &&
      (!tagFilter || t.tags.includes(tagFilter)) &&
      (quickFilter === 'all' || (quickFilter === 'overdue' && isOverdue(t.dueDate) && t.status !== 'done') || (quickFilter === 'today' && !!t.dueDate && isSameLocalDay(t.dueDate, today) && t.status !== 'done') || (quickFilter === 'next7' && !!t.dueDate && t.dueDate >= todayStart && t.dueDate < nextWeek && t.status !== 'done')),
  ).sort((a, b) => {
    if (sortMode === 'completed') return Number(b.status === 'done') - Number(a.status === 'done') || (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0)
    if (sortMode === 'pending') return Number(a.status === 'done') - Number(b.status === 'done') || (a.dueDate?.getTime() ?? Infinity) - (b.dueDate?.getTime() ?? Infinity)
    if (sortMode === 'priority') return ({ alta: 0, media: 1, baja: 2 }[a.priority] - { alta: 0, media: 1, baja: 2 }[b.priority])
    return 0
  })

  const openNew = useCallback(() => {
    setEditing(null)
    setOpen(true)
  }, [])

  const openEdit = useCallback((t: Task) => {
    setEditing(t)
    setOpen(true)
  }, [])

  useEffect(() => {
    const taskId = new URLSearchParams(location.search).get('task')
    if (!taskId) return
    const task = tasks.find((item) => item.id === taskId && item.sectionId === sectionId && !item.archived)
    if (!task) return
    openEdit(task)
    navigate(location.pathname, { replace: true })
  }, [location.search, location.pathname, navigate, sectionId, tasks, openEdit])

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

  const handleQuickAdd = useCallback(() => {
    const text = quickTitle.trim()
    if (!text) return
    addTask(
      createTask(sectionId, {
        title: text,
        description: '',
        dueDate: null,
        priority: 'media',
        status: 'pending',
        recurrence: 'none',
        focusDay: false,
        reminderLead: null,
        reminder2HoursBefore: false,
        subtasks: [],
        notesLinks: [],
        images: [],
        tags: [],
      }),
    )
    setQuickTitle('')
  }, [quickTitle, addTask, sectionId])

  const applyStatus = useCallback((t: Task, next: Status) => {
    if (next === 'done' && t.status !== 'done') {
      setTimeout(() => celebrateCompletion(useTasksStore.getState().tasks), 180)
      useFoxSkinsStore.getState().recordTaskReward(t.id)
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
  const moveStatus = useCallback((id: string, direction: -1 | 1) => {
    const task = useTasksStore.getState().tasks.find((item) => item.id === id)
    if (!task) return
    const index = statusOrder.indexOf(task.status)
    const next = statusOrder[index + direction]
    if (next) useTasksStore.getState().updateTask(id, { status: next, completedAt: next === 'done' ? (task.completedAt ?? new Date()) : null })
  }, [])

  useEffect(() => {
    const onNew = () => openNew()
    window.addEventListener('tasklex:new-task', onNew)
    return () => window.removeEventListener('tasklex:new-task', onNew)
  }, [openNew])

  const toggleStatus = useCallback((id: string) => {
    const t = useTasksStore.getState().tasks.find((x) => x.id === id)
    if (!t) return
    const next: Status = t.status === 'done' ? 'pending' : 'done'
    if (next === 'done' && t.recurrence !== 'none') {
      setRecurringTask(t)
      return
    }
    applyStatus(t, next)
  }, [applyStatus])

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
  const toggleSelected = (id: string) => setSelectedIds((ids) => ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id])
  const archiveSelected = () => {
    selectedIds.forEach((id) => updateTask(id, { archived: true }))
    setSelectedIds([]); setSelectionMode(false)
  }
  const completeSelected = () => {
    selectedIds.forEach((id) => {
      const task = tasks.find((item) => item.id === id)
      if (task) updateTask(id, { status: 'done', completedAt: task.completedAt ?? new Date() })
    })
    setSelectedIds([]); setSelectionMode(false)
  }
  const deleteSelected = () => {
    selectedIds.forEach((id) => useTasksStore.getState().deleteTask(id))
    setSelectedIds([]); setSelectionMode(false); setBulkDeleteOpen(false)
  }

  return (
    <SectionShell sectionId={sectionId}>
      <div className="sticky -top-4 z-20 -mx-4 flex flex-wrap items-center justify-between gap-4 border-b border-[var(--border)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur-md md:-top-8 md:-mx-8 md:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight break-words">{label}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => { setCompactTasks(!compactTasks); playAppSound('task-complete', 0.1) }} aria-pressed={compactTasks} title={compactTasks ? 'Desactivar filas compactas' : 'Activar filas compactas'} aria-label={compactTasks ? 'Desactivar filas compactas' : 'Activar filas compactas'} className={`flex h-10 items-center justify-center gap-2 rounded-full border px-3 transition ${compactTasks ? 'border-[var(--accent)]/50 bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-muted)] hover:text-[var(--accent)]'}`}>
          <List className="h-4 w-4" /><span className="hidden text-[11px] font-semibold md:inline">Filas compactas</span>
        </button>
        <button type="button" onClick={() => setThemeOpen(true)} title="Personalizar apariencia del apartado" aria-label="Personalizar apariencia del apartado" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--border)] bg-[var(--surface)]/80 text-[var(--text-muted)] shadow-sm transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 hover:text-[var(--accent)]">
          <Palette className="h-5 w-5" />
        </button>
        <button onClick={openNew} className="btn-primary shrink-0 whitespace-nowrap gap-1.5 px-2.5 text-sm">
          <Plus className="h-4 w-4" /> Nueva tarea
        </button>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleQuickAdd()
        }}
        className="mt-4 flex items-center gap-2"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--border)] text-[var(--accent)]">
          <Zap className="h-4 w-4" />
        </span>
        <input
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          data-tut="quick-add"
          placeholder="Escribe una tarea y da Enter para agregarla"
          className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)]/75 px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]"
        />
        <button type="submit" disabled={!quickTitle.trim()} className="btn-primary shrink-0 whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50">
          <Plus className="h-4 w-4" /> Agregar
        </button>
      </form>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1 rounded-full border border-[var(--border)] p-1">
          {viewTabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={view === id}
              onClick={() => setView(sectionId, id)}
              className={`rounded-full px-3 py-1 text-xs transition-colors ${
                view === id ? 'bg-[var(--accent)] font-bold text-[var(--accent-text,#121212)] shadow-sm ring-1 ring-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]'
              }`}
            >
              {label}
            </button>
          ))}
          <div className="relative">
            <button type="button" aria-label="Opciones de tareas" aria-expanded={viewMenuOpen} onClick={() => setViewMenuOpen((open) => !open)} className="grid h-8 w-8 place-items-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--text)]"><MoreHorizontal className="h-4 w-4" /></button>
            {viewMenuOpen && <div className="absolute right-0 top-10 z-30 w-56 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-2 shadow-xl">
              <p className="px-2 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Tareas</p>
              <button type="button" onClick={() => { setSelectionMode(true); setSelectedIds([]); setView(sectionId, 'list'); setViewMenuOpen(false) }} className="w-full rounded-xl px-2.5 py-2 text-left text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]">Seleccionar para completar o borrar</button>
              <p className="px-2 pt-2 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">Ordenar por</p>
              {[['completed', 'Completadas · recientes primero'], ['pending', 'Por hacer · fecha ascendente'], ['priority', 'Prioridad · alta, media, baja'], ['default', 'Orden original']].map(([mode, label]) => <button type="button" key={mode} onClick={() => { setSortMode(mode as typeof sortMode); setViewMenuOpen(false) }} className={`w-full rounded-xl px-2.5 py-2 text-left text-xs hover:bg-[var(--surface-2)] ${sortMode === mode ? 'font-bold text-[var(--accent)]' : 'text-[var(--text)]'}`}>{label}</button>)}
            </div>}
          </div>
        </div>
        {(!view || view === 'list') && <button type="button" onClick={() => { setSelectionMode((mode) => !mode); setSelectedIds([]) }} className={`rounded-full border px-3 py-2 text-xs font-semibold ${selectionMode ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]' : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'}`}>{selectionMode ? 'Cancelar selección' : 'Seleccionar varias'}</button>}
      </div>

      <div className="mt-4 flex min-w-0 gap-2 overflow-x-auto pb-1" aria-label="Vistas rápidas de tareas">
        {([
          ['all', 'Todas', quickCounts.all],
          ['overdue', 'Vencidas', quickCounts.overdue],
          ['today', 'Para hoy', quickCounts.today],
          ['next7', 'Próximos 7 días', quickCounts.next7],
        ] as const).map(([id, name, count]) => <button key={id} onClick={() => setQuickFilter(id)} aria-pressed={quickFilter === id} className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${quickFilter === id ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-text,#121212)]' : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] hover:border-[var(--accent)]/50 hover:text-[var(--text)]'}`}>{name}<span className={`ml-2 rounded-full px-1.5 py-0.5 ${quickFilter === id ? 'bg-black/10' : 'bg-[var(--surface-2)]'}`}>{count}</span></button>)}
      </div>

      {selectionMode && <div className="mt-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--accent)]/30 bg-[var(--accent)]/[0.06] p-3 animate-in fade-in slide-in-from-top-1 duration-200">
        <span className="mr-auto text-xs font-semibold text-[var(--text)]">{selectedIds.length} seleccionada{selectedIds.length === 1 ? '' : 's'}</span>
        <button type="button" onClick={() => setSelectedIds(selectedIds.length === filteredTasks.length ? [] : filteredTasks.map((task) => task.id))} className="rounded-full border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] hover:text-[var(--text)]">{selectedIds.length === filteredTasks.length ? 'Quitar selección' : 'Seleccionar visibles'}</button>
        <button type="button" disabled={!selectedIds.length} onClick={completeSelected} className="flex items-center gap-1.5 rounded-full bg-[var(--accent)] px-3 py-2 text-xs font-bold text-[var(--accent-text,#121212)] disabled:opacity-40"><Check className="h-3.5 w-3.5" />Completar</button>
        <button type="button" disabled={!selectedIds.length} onClick={archiveSelected} className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)] disabled:opacity-40"><Archive className="h-3.5 w-3.5" />Archivar</button>
        <button type="button" disabled={!selectedIds.length} onClick={() => setBulkDeleteOpen(true)} className="flex items-center gap-1.5 rounded-full border border-rose-400/30 px-3 py-2 text-xs font-semibold text-rose-400 disabled:opacity-40">Eliminar</button>
        <button type="button" onClick={() => { setSelectionMode(false); setSelectedIds([]) }} aria-label="Salir de selección" className="rounded-full p-2 text-[var(--text-muted)] hover:bg-[var(--surface-2)]"><X className="h-4 w-4" /></button>
      </div>}

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/60 p-3">
        <button type="button" onClick={() => setFiltersOpen((value) => !value)} aria-expanded={filtersOpen} className="flex w-full items-center justify-between gap-2 text-left text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text)]">
          <span className="flex items-center gap-2"><Filter className="h-4 w-4 text-[var(--accent)]" />Filtros y etiquetas{(priorityFilter !== 'all' || tagFilter) && <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-[var(--accent)]">Activos</span>}</span>
          <ChevronDown className={`h-4 w-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
        </button>
        {filtersOpen && <div className="notes-filter-row mt-3 flex min-w-0 items-center gap-2 overflow-x-auto pb-1">
        <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
          {priorityChips.map((c) => (
            <button
              key={c.id}
              onClick={() => setPriorityFilter(c.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                priorityFilter === c.id
                  ? 'border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--accent-text,#121212)]'
                  : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
              }`}
            >
              {c.dot && <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />}
              {c.label}
            </button>
          ))}
        </div>
        {allTags.length > 0 && (
          <div className="flex shrink-0 flex-nowrap items-center gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  tagFilter === tag
                    ? 'border-[var(--accent)] bg-[var(--accent)] font-semibold text-[var(--accent-text,#121212)]'
                    : 'border-[var(--border)] text-[var(--accent)] hover:bg-[var(--surface-2)]'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
        </div>}
      </div>

      <div className="mt-5">
        {(!view || view === 'list') && (
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
              selectedIds={selectedIds}
              onSelect={toggleSelected}
              selectionMode={selectionMode}
            />
          </div>
        )}
        {view === 'board' && <div key="board" className="animate-in fade-in slide-in-from-left-2 duration-300"><BoardView tasks={filteredTasks} onMove={moveStatus} onMoveSection={handleMoveSection} onDuplicate={handleDuplicate} /></div>}
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

      <Modal open={bulkDeleteOpen} onClose={() => setBulkDeleteOpen(false)} title="Eliminar tareas seleccionadas">
        <div className="space-y-4"><p className="text-sm text-[var(--text-muted)]">¿Eliminar {selectedIds.length} tarea{selectedIds.length === 1 ? '' : 's'}? Podrás deshacer esta acción desde el aviso.</p><div className="flex gap-2"><button onClick={deleteSelected} className="btn-primary flex-1 justify-center">Eliminar</button><button onClick={() => setBulkDeleteOpen(false)} className="flex-1 rounded-full border border-[var(--border)] py-2 text-sm">Cancelar</button></div></div>
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
