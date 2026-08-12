import { useState } from 'react'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useTasksStore } from '../store/tasks'
import { useSectionsStore } from '../store/sections'
import Modal from '../components/ui/Modal'

export default function Archive() {
  const tasks = useTasksStore((s) => s.tasks)
  const updateTask = useTasksStore((s) => s.updateTask)
  const deleteTask = useTasksStore((s) => s.deleteTask)
  const sections = useSectionsStore((s) => s.sections)
  const labelOf = (id: string) => sections.find((s) => s.id === id)?.label ?? id
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const completed = tasks.filter((t) => t.status === 'done' && !t.archived)
  const archived = tasks.filter((t) => t.archived)

  const restore = (id: string) => updateTask(id, { archived: false, status: 'pending', completedAt: null })

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

      <h2 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">
        Completadas · {completed.length}
      </h2>
      {completed.length === 0 ? (
        <p className="mb-6 text-sm text-[var(--text-muted)]">Aún no has completado tareas.</p>
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
                onClick={() => restore(t.id)}
                className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs hover:bg-[var(--surface-2)]"
              >
                Reabrir
              </button>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mb-2 text-sm font-semibold text-[var(--text-muted)]">
        Archivadas · {archived.length}
      </h2>
      {archived.length === 0 ? (
        <p className="text-sm text-[var(--text-muted)]">Sin tareas archivadas.</p>
      ) : (
        <ul className="space-y-2">
          {archived.map((t) => (
            <li key={t.id} className="card flex items-center justify-between gap-3 p-3 opacity-70">
              <div className="min-w-0">
                <p className="truncate text-sm line-through">{t.title}</p>
                <p className="text-[11px] text-[var(--text-muted)]">{labelOf(t.sectionId)}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => restore(t.id)}
                  title="Restaurar"
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
