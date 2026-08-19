import { memo, useState, useRef } from 'react'
import { Archive, Check, Copy, MoveRight, Pencil, Share2, Star, Trash2 } from 'lucide-react'
import type { Priority, Status, Task } from '../../types/task'
import PomodoroTimer from './PomodoroTimer'
import MoveTaskModal from './MoveTaskModal'
import Modal from '../ui/Modal'
import { shareTask } from '../../lib/share'
import { hapticImpact } from '../../lib/haptics'
import { ImpactStyle } from '@capacitor/haptics'

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

function getDueUrgency(dueDate: Date | null, status: Status): { label: string; className: string } | null {
  if (!dueDate || status === 'done') return null
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startOfDue = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
  const diffDays = Math.round((startOfDue.getTime() - startOfToday.getTime()) / 86400000)

  if (diffDays < 0) {
    const days = Math.abs(diffDays)
    return {
      label: days === 1 ? 'Venció ayer' : `Venció hace ${days} días`,
      className: 'text-red-400',
    }
  }
  if (diffDays === 0) return { label: 'Vence hoy', className: 'text-red-400' }
  if (diffDays === 1) return { label: 'Vence mañana', className: 'text-amber-300' }
  if (diffDays <= 3) return { label: `Vence en ${diffDays} días`, className: 'text-amber-300' }
  return { label: `Vence en ${diffDays} días`, className: 'text-[var(--text-muted)]' }
}

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
  const [moveOpen, setMoveOpen] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)
  const [swipeOffset, setSwipeOffset] = useState(0)
  const due = task.dueDate
    ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
        task.dueDate,
      )
    : null
  const urgency = getDueUrgency(task.dueDate, task.status)
  const [preview, setPreview] = useState<string | null>(null)

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current
    const deltaY = e.touches[0].clientY - touchStartY.current
    
    // Solo permitir swipe horizontal
    if (Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      setSwipeOffset(deltaX)
    }
  }

  const handleTouchEnd = () => {
    const deltaX = swipeOffset
    
    if (Math.abs(deltaX) > 80) {
      if (deltaX > 0) {
        onToggle(task.id)
        hapticImpact(ImpactStyle.Medium)
      } else {
        onArchive(task.id)
        hapticImpact(ImpactStyle.Light)
      }
    }
    
    setSwipeOffset(0)
  }

  return (
    <div 
      className={`card p-5 ${task.status === 'done' ? 'opacity-55' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ transform: `translateX(${swipeOffset}px)`, transition: swipeOffset === 0 ? 'transform 0.2s' : 'none' }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Columna de texto: usa casi todo el ancho, solo cede ~36px a la columna de íconos */}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span
              className={`text-base font-semibold ${
                task.status === 'done' ? 'text-[var(--text-muted)] line-through' : ''
              }`}
            >
              {task.title}
            </span>
            {task.focusDay && <Star className="h-4 w-4 shrink-0 fill-[var(--accent)] text-[var(--accent)]" />}
          </div>

          {task.description && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{task.description}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-2.5 py-1 text-xs ${pm.className}`}>{pm.label}</span>
            <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
              {statusLabel[task.status]}
            </span>
            {task.recurrence !== 'none' && (
              <span className="rounded-full border border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-muted)]">
                {recurrenceLabel[task.recurrence]}
              </span>
            )}
            {task.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-2.5 py-1 text-xs text-[var(--accent)]"
              >
                #{tag}
              </span>
            ))}
          </div>

          {due && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)]">{due}</span>
              {urgency && <span className={`font-medium ${urgency.className}`}>· {urgency.label}</span>}
            </div>
          )}

          {task.subtasks.length > 0 && (
            <p className="mt-3 text-xs text-[var(--text-muted)]">
              Sub-pasos: {doneCount}/{task.subtasks.length}
            </p>
          )}
          {task.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
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
          {task.status === 'in_progress' && (
            <div className="mt-3">
              <PomodoroTimer task={task} />
            </div>
          )}
        </div>

        {/* Columna de íconos: vertical, angosta, no le roba ancho al texto */}
        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <button
            onClick={() => onToggle(task.id)}
            title="Cambiar estado"
            className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors ${
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
            onClick={() => shareTask(task.title, task.description)}
            title="Compartir"
            className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
          >
            <Share2 className="h-4 w-4" />
          </button>
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

      {moveOpen && onMove && <MoveTaskModal open={moveOpen} onClose={() => setMoveOpen(false)} currentId={task.id} onMove={(sectionId) => onMove(task.id, sectionId)} />}
      <Modal open={preview !== null} onClose={() => setPreview(null)} title="Foto">
        <div className="flex justify-center">
          <img src={preview ?? ''} alt="Foto de la tarea" className="max-h-[70vh] rounded-xl object-contain" />
        </div>
      </Modal>
    </div>
  )
})
