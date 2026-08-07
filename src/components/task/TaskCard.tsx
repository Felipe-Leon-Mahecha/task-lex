import { memo, useState } from 'react'
import { Archive, Check, Copy, MoveRight, Pencil, Star, Trash2 } from 'lucide-react'
import type { Priority, Status, Task } from '../../types/task'
import PomodoroTimer from './PomodoroTimer'
import MoveTaskModal from './MoveTaskModal'
import Modal from '../ui/Modal'

const priorityMeta: Record<Priority, { label: string; className: string }> = {
  baja: { label: 'Baja', className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  media: { label: 'Media', className: 'border-amber-300/30 bg-amber-300/10 text-amber-200' },
  alta: { label: 'Alta', className: 'border-red-400/30 bg-red-400/10 text-red-300' },
}

const statusLabel: Record<Status, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  done: 'Hecha',
}

const recurrenceLabel = { none: '', daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' } as const

export default memo(function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onMove,
}: {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onDuplicate?: (task: Task) => void
  onMove?: (id: string, sectionId: string) => void
}) {
  const doneCount = task.subtasks.filter((s) => s.done).length
  const pm = priorityMeta[task.priority]
  const due = task.dueDate
    ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
        task.dueDate,
      )
    : null
  const [moveOpen, setMoveOpen] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  return (
    <div className={`card p-4 ${task.status === 'done' ? 'opacity-55' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`text-sm font-semibold ${
                task.status === 'done' ? 'text-[var(--text-muted)] line-through' : ''
              }`}
            >
              {task.title}
            </span>
            {task.focusDay && <Star className="h-4 w-4 fill-[var(--accent)] text-[var(--accent)]" />}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className={`rounded-full border px-2 py-0.5 text-[11px] ${pm.className}`}>{pm.label}</span>
            <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
              {statusLabel[task.status]}
            </span>
            {task.recurrence !== 'none' && (
              <span className="rounded-full border border-[var(--border)] px-2 py-0.5 text-[11px] text-[var(--text-muted)]">
                {recurrenceLabel[task.recurrence]}
              </span>
            )}
            {due && <span className="text-[11px] text-[var(--text-muted)]">{due}</span>}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2 py-0.5 text-[11px] text-[var(--accent)]"
              >
                #{tag}
              </span>
            ))}
          </div>
          {task.subtasks.length > 0 && (
            <p className="mt-2 text-[11px] text-[var(--text-muted)]">
              Sub-pasos: {doneCount}/{task.subtasks.length}
            </p>
          )}
          {task.images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {task.images.map((url) => (
                <button
                  key={url}
                  onClick={() => setPreview(url)}
                  className="overflow-hidden rounded-lg border border-[var(--border)] transition-transform hover:scale-105"
                >
                  <img src={url} alt="" className="h-12 w-12 object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {task.status === 'in_progress' && <PomodoroTimer task={task} />}
          <button
            onClick={() => onToggle(task.id)}
            title="Cambiar estado"
            className={`flex h-6 w-6 items-center justify-center rounded-full border transition-colors ${
              task.status === 'done'
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[#121212]'
                : 'border-[var(--border)] text-transparent hover:border-[var(--accent)]'
            }`}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {onDuplicate && (
            <button
              onClick={() => onDuplicate(task)}
              title="Duplicar"
              className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          {onMove && (
            <button
              onClick={() => setMoveOpen(true)}
              title="Mover a otro apartado"
              className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
            >
              <MoveRight className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => onDelete(task.id)}
            className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onArchive(task.id)}
            title="Archivar"
            className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>
      </div>
      {onMove && (
        <MoveTaskModal
          open={moveOpen}
          onClose={() => setMoveOpen(false)}
          currentId={task.sectionId}
          onMove={(sectionId) => onMove(task.id, sectionId)}
        />
      )}
      <Modal open={preview !== null} onClose={() => setPreview(null)} title="Foto">
        <div className="flex justify-center">
          <img src={preview ?? ''} alt="Foto de la tarea" className="max-h-[70vh] rounded-xl object-contain" />
        </div>
      </Modal>
    </div>
  )
})
