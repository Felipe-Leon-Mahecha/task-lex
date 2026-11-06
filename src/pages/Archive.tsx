import { useState } from 'react'
import { Link } from 'react-router-dom'
import { RotateCcw, Trash2, CheckCircle2, Archive as ArchiveIcon, Clock3 } from 'lucide-react'
import { useTasksStore } from '../store/tasks'
import { useSectionsStore } from '../store/sections'
import { useUndoStore } from '../store/undo'
import Modal from '../components/ui/Modal'

export default function Archive() {
  const tasks = useTasksStore((s) => s.tasks)
  const updateTask = useTasksStore((s) => s.updateTask)
  const deleteTask = useTasksStore((s) => s.deleteTask)
  const sections = useSectionsStore((s) => s.sections)
  const labelOf = (id: string) => sections.find((s) => s.id === id)?.label ?? id
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)
  const [tab, setTab] = useState<'completed' | 'archived'>('completed')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [selecting, setSelecting] = useState(false)

  const completed = tasks.filter((t) => t.status === 'done' && !t.archived).sort((a, b) => (b.completedAt?.getTime() ?? 0) - (a.completedAt?.getTime() ?? 0))
  const archived = tasks.filter((t) => t.archived).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

  const reopenCompleted = (id: string) => {
    const task = tasks.find((item) => item.id === id)
    if (!task) return
    useUndoStore.getState().addAction({ type: 'bulk-restore', taskId: id, previousTasks: [task], timestamp: Date.now() })
    updateTask(id, { archived: false, status: 'pending', completedAt: null })
  }
  const restoreArchived = (id: string) => {
    const task = tasks.find((item) => item.id === id)
    if (!task) return
    useUndoStore.getState().addAction({ type: 'bulk-restore', taskId: id, previousTasks: [task], timestamp: Date.now() })
    updateTask(id, { archived: false })
  }
  const restoreSelected = () => {
    const selected = archived.filter((task) => selectedIds.includes(task.id))
    if (!selected.length) return
    useUndoStore.getState().addAction({ type: 'bulk-restore', taskId: selected[0].id, previousTasks: selected, timestamp: Date.now() })
    selected.forEach((task) => updateTask(task.id, { archived: false }))
    setSelectedIds([])
    setSelecting(false)
  }

  const handleDeleteClick = (id: string) => {
    setTaskToDelete(id)
    setDeleteOpen(true)
  }

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete)
      setTaskToDelete(null)
    }
    setDeleteOpen(false)
  }

  return (
    <div>
      <p className="eyebrow">Archivo</p>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Historial y archivo</h1>

      <div className="mb-5 flex gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-1.5">
        <button onClick={() => setTab('completed')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${tab === 'completed' ? 'bg-[var(--accent)] text-[var(--accent-text,#121212)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}><CheckCircle2 className="h-4 w-4" />Completadas <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{completed.length}</span></button>
        <button onClick={() => setTab('archived')} className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold ${tab === 'archived' ? 'bg-[var(--accent)] text-[var(--accent-text,#121212)] shadow-sm' : 'text-[var(--text-muted)] hover:bg-[var(--surface-2)]'}`}><ArchiveIcon className="h-4 w-4" />Archivadas <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs">{archived.length}</span></button>
      </div>

      {tab === 'completed' && <section className="animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)]"><Clock3 className="h-4 w-4" />Completadas recientemente</div>
      {completed.length === 0 ? (
        <div className="mb-6 rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]"><CheckCircle2 className="h-6 w-6" /></div>
          <p className="mt-3 text-sm font-semibold text-[var(--text)]">Tu historial empieza con una tarea terminada</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Cuando completes algo, lo encontrarás aquí para consultarlo o reabrirlo.</p>
          <Link to="/" className="btn-primary mt-4">Volver al Dashboard</Link>
        </div>
      ) : (
        <ul className="mb-6 space-y-2">
          {completed.map((t) => (
            <li key={t.id} className="card flex items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm">{t.title}</p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {t.completedAt
                    ? `Hecha ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(t.completedAt)}`
                    : ''}
                </p>
              </div>
              <button
                onClick={() => reopenCompleted(t.id)}
                className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--surface-2)]"
              >
                Reabrir
              </button>
            </li>
          ))}
        </ul>
      )}

      </section>}

      {tab === 'archived' && <section className="animate-in fade-in slide-in-from-bottom-1 duration-200">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-muted)]"><ArchiveIcon className="h-4 w-4" />Guardadas fuera de tus listas activas</div>
      {archived.length > 0 && <div className="mb-3 flex flex-wrap items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-3">
        <span className="mr-auto text-xs text-[var(--text-muted)]">{selecting ? `${selectedIds.length} seleccionadas` : 'Administra varias tareas de una vez'}</span>
        <button onClick={() => { setSelecting((value) => !value); setSelectedIds([]) }} className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold hover:border-[var(--accent)]">{selecting ? 'Cancelar' : 'Seleccionar varias'}</button>
        {selecting && <>
          <button onClick={() => setSelectedIds(selectedIds.length === archived.length ? [] : archived.map((task) => task.id))} className="rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text-muted)]">{selectedIds.length === archived.length ? 'Quitar selección' : 'Seleccionar todas'}</button>
          <button disabled={!selectedIds.length} onClick={restoreSelected} className="rounded-xl bg-[var(--accent)] px-3 py-2 text-xs font-bold text-[var(--bg)] disabled:opacity-40"><RotateCcw className="mr-1 inline h-3.5 w-3.5" />Restaurar</button>
        </>}
      </div>}
      {archived.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)]"><ArchiveIcon className="h-6 w-6" /></div>
          <p className="mt-3 text-sm font-semibold text-[var(--text)]">No hay tareas archivadas</p>
          <p className="mt-1 text-xs text-[var(--text-muted)]">Archiva una tarea cuando quieras guardarla fuera de tu lista activa.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {archived.map((t) => (
            <li key={t.id} className={`card flex items-center justify-between gap-3 p-3 ${selecting ? '' : 'opacity-80'}`}>
              {selecting && <input type="checkbox" checked={selectedIds.includes(t.id)} onChange={() => setSelectedIds((ids) => ids.includes(t.id) ? ids.filter((id) => id !== t.id) : [...ids, t.id])} aria-label={`Seleccionar ${t.title}`} className="h-4 w-4 accent-[var(--accent)]" />}
              <div className="min-w-0">
                <p className={`truncate text-sm ${t.status === 'done' ? 'line-through text-[var(--text-muted)]' : ''}`}>{t.title}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{t.status === 'done' && t.completedAt ? `Completada ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium' }).format(t.completedAt)}` : `Sección: ${labelOf(t.sectionId)}`}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  title="Restaurar"
                  onClick={() => selecting ? setSelectedIds((ids) => ids.includes(t.id) ? ids.filter((id) => id !== t.id) : [...ids, t.id]) : restoreArchived(t.id)}
                  className="rounded p-2 text-[var(--text-muted)] hover:text-[var(--accent)]"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(t.id)}
                  title="Eliminar"
                  className="rounded p-2 text-[var(--text-muted)] hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
      </section>}
      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar tarea"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            ¿Eliminar definitivamente esta tarea? Esta acción no se puede deshacer.
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
    </div>
  )
}
