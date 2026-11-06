import { memo, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Archive, Check, ChevronDown, ChevronUp, Copy, ExternalLink, FileText, MoveRight, Pencil, Share2, Star, Trash2 } from 'lucide-react'
import type { Priority, Status, Subtask, Task } from '../../types/task'
import PomodoroTimer from './PomodoroTimer'
import MoveTaskModal from './MoveTaskModal'
import Modal from '../ui/Modal'
import { shareTask } from '../../lib/share'
import { useSettingsStore } from '../../store/settings'
import { useTasksStore } from '../../store/tasks'
import { useFoxSkinsStore } from '../../store/foxSkins'
import { celebrateCompletion } from '../../lib/celebrate'
import { useNotesStore } from '../../store/notes'

const priorityMeta: Record<Priority, { label: string; className: string }> = {
  baja: { label: 'Baja', className: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300' },
  media: { label: 'Media', className: 'border-amber-300/30 bg-amber-300/10 text-amber-200' },
  alta: { label: 'Alta', className: 'border-red-400/30 bg-red-400/10 text-red-300' },
}

const statusLabel: Record<Status, string> = {
  pending: 'Pendiente',
  in_progress: 'En progreso',
  waiting: 'En espera',
  done: 'Hecha',
}
const statusTone: Record<Status, string> = {
  pending: 'border-[var(--border)] text-[var(--text-muted)]',
  in_progress: 'border-sky-400/30 bg-sky-400/10 text-sky-300',
  waiting: 'border-violet-400/30 bg-violet-400/10 text-violet-300',
  done: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300',
}

const recurrenceLabel = { none: '', daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual' } as const
const priorityRail: Record<Priority, string> = { baja: 'border-l-emerald-400', media: 'border-l-amber-300', alta: 'border-l-red-400' }

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

function toggleSubtask(task: Task, subId: string) {
  const store = useTasksStore.getState()
  const fresh = store.tasks.find((x) => x.id === task.id)
  if (!fresh) return
  const subtasks: Subtask[] = (fresh.subtasks ?? []).map((s) => (s.id === subId ? { ...s, done: !s.done } : s))
  const patch: Partial<Task> = { subtasks }

  if (fresh.completeWithSubtasks) {
    const allDone = subtasks.length > 0 && subtasks.every((s) => s.done)
    if (allDone && fresh.status !== 'done') {
      patch.status = 'done'
      patch.completedAt = fresh.completedAt ?? new Date()
      setTimeout(() => {
        const all = useTasksStore.getState().tasks
        celebrateCompletion(all)
        useFoxSkinsStore.getState().recordTaskReward(fresh.id)
      }, 180)
    } else if (!allDone && fresh.status === 'done') {
      patch.status = 'pending'
      patch.completedAt = null
    }
  }

  store.updateTask(fresh.id, patch)
}

export default memo(function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onMove,
  onSelect,
  selected = false,
  selectionMode = false,
}: {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onDuplicate?: (task: Task) => void
  onMove?: (id: string, sectionId: string) => void
  onSelect?: (id: string) => void
  selected?: boolean
  selectionMode?: boolean
}) {
  const compact = useSettingsStore((s) => s.compactTasks)
  const savedNotes = useNotesStore((s) => s.notes)
  const [expanded, setExpanded] = useState(!compact)
  useEffect(() => {
    if (compact && !expanded) return
    setExpanded(!compact)
  }, [compact])
  const doneCount = (task.subtasks ?? []).filter((s) => s.done).length
  const pm = priorityMeta[task.priority]
  const [moveOpen, setMoveOpen] = useState(false)
  const due = task.dueDate
    ? new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(
        task.dueDate,
      )
    : null
  const urgency = getDueUrgency(task.dueDate, task.status)
  const deleteDaysLeft = task.status === 'done' && task.completedAt ? Math.max(0, Math.ceil((task.completedAt.getTime() + 3 * 86400000 - Date.now()) / 86400000)) : null
  const [preview, setPreview] = useState<string | null>(null)

  if (compact && !expanded) {
    return (
      <div className={`card relative border-l-4 ${priorityRail[task.priority]} px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-lg ${task.status === 'done' ? 'opacity-55' : ''}`}>
        {selectionMode && <input type="checkbox" checked={selected} onChange={() => onSelect?.(task.id)} aria-label={`Seleccionar ${task.title}`} className="mr-2 h-4 w-4 accent-[var(--accent)]" />}
        <div className="flex items-center gap-3">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onToggle(task.id)}
            title="Cambiar estado"
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
              task.status === 'done'
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-text,#121212)]'
                : 'border-[var(--border)] text-transparent hover:border-[var(--accent)]'
            }`}
          >
            <Check className="h-4 w-4" />
          </button>
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              className={`truncate text-sm font-medium ${
                task.status === 'done' ? 'text-[var(--text-muted)] line-through' : ''
              }`}
            >
              {task.title}
            </span>
            {task.focusDay && task.status !== 'done' && (
              <Star className="h-3.5 w-3.5 shrink-0 fill-[var(--accent)] text-[var(--accent)]" />
            )}
          </div>
          {due && <span className="hidden shrink-0 text-[11px] text-[var(--text-muted)] sm:block">{due}</span>}
          {task.subtasks.length > 0 && (
            <span className="shrink-0 text-[11px] text-[var(--text-muted)]">
              {doneCount}/{task.subtasks.length}
            </span>
          )}
          <button
            onClick={() => setExpanded(true)}
            title="Ver detalle"
            aria-label="Ver detalle"
            className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>
        {deleteDaysLeft !== null && <p className="ml-11 mt-1 text-[10px] leading-snug text-[var(--text-muted)]">Se moverá al Archivo en {deleteDaysLeft} día{deleteDaysLeft === 1 ? '' : 's'}.</p>}
      </div>
    )
  }

  return (
    <div className={`card relative overflow-hidden border-l-4 ${priorityRail[task.priority]} p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg ${task.status === 'done' ? 'opacity-55' : ''}`}>
      {selectionMode && <label className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)]"><input type="checkbox" checked={selected} onChange={() => onSelect?.(task.id)} className="h-4 w-4 accent-[var(--accent)]" />Seleccionar tarea</label>}
      {compact && (
        <button
          onClick={() => setExpanded(false)}
          title="Contraer"
          aria-label="Contraer"
          className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] shadow-sm transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        >
          <ChevronUp className="h-4 w-4" />
        </button>
      )}
      <div className="flex items-start justify-between gap-3">
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
            <span className={`rounded-full border px-2.5 py-1 text-xs ${statusTone[task.status]}`}>
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
          {deleteDaysLeft !== null && <p className="mt-2 text-[11px] text-[var(--text-muted)]">Esta tarea se moverá al Archivo en {deleteDaysLeft} día{deleteDaysLeft === 1 ? '' : 's'}.</p>}

          {due && (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[var(--text-muted)]">{due}</span>
              {urgency && <span className={`font-medium ${urgency.className}`}>· {urgency.label}</span>}
            </div>
          )}

          {task.notesLinks.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{task.notesLinks.map((item) => {
            const note = item.type === 'nota' ? savedNotes.find((saved) => saved.id === item.content) : null
            if (note) return <Link key={item.id} to={`/notas/${note.id}`} className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[var(--accent)]/25 bg-[var(--accent)]/5 px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10"><FileText className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{note.title || item.label || 'Nota vinculada'}</span></Link>
            const external = item.type === 'link' && /^https?:\/\//i.test(item.content)
            return external ? <a key={item.id} href={item.content} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"><ExternalLink className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.label || item.content}</span></a> : <span key={item.id} className="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs text-[var(--text-muted)]"><FileText className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{item.label || item.content}</span></span>
          })}</div>}

          {task.subtasks.length > 0 && (
            <div className="mt-3 rounded-lg border border-[var(--border)] p-2">
              <div className="mb-1 flex items-center justify-between px-1">
                <p className="text-[11px] font-medium text-[var(--text-muted)]">
                  Sub-pasos {doneCount}/{task.subtasks.length}
                </p>
                {task.completeWithSubtasks && (
                  <span className="text-[10px] text-[var(--accent)]">Se completa con todos</span>
                )}
              </div>
              <div className="space-y-1">
                {task.subtasks.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => toggleSubtask(task, s.id)}
                    className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left transition-colors hover:bg-[var(--surface-2)]"
                  >
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border transition-colors ${
                        s.done ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-text,#121212)]' : 'border-[var(--border)]'
                      }`}
                    >
                      {s.done && <Check className="h-3 w-3" />}
                    </span>
                    <span className={`text-sm ${s.done ? 'text-[var(--text-muted)] line-through' : ''}`}>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
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

        <div className="flex shrink-0 flex-col items-center gap-1.5">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onToggle(task.id)}
            title="Cambiar estado"
            className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors ${
              task.status === 'done'
                ? 'border-[var(--accent)] bg-[var(--accent)] text-[var(--accent-text,#121212)]'
                : 'border-[var(--border)] text-transparent hover:border-[var(--accent)]'
            }`}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(task)}
            className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
          >
            <Pencil className="h-4 w-4" />
          </button>
          {onDuplicate && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => onDuplicate(task)}
              title="Duplicar"
              className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
            >
              <Copy className="h-4 w-4" />
            </button>
          )}
          {onMove && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setMoveOpen(true)}
              title="Mover a otro apartado"
              className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
            >
              <MoveRight className="h-4 w-4" />
            </button>
          )}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => shareTask(task.title, task.description)}
            title="Compartir"
            className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task.id)}
            className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-red-400"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onArchive(task.id)}
            title="Archivar"
            className="rounded p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
          >
            <Archive className="h-4 w-4" />
          </button>
        </div>
      </div>

      {moveOpen && onMove && <MoveTaskModal open={moveOpen} onClose={() => setMoveOpen(false)} currentId={task.sectionId} taskTitle={task.title} onMove={(sectionId) => onMove(task.id, sectionId)} />}
      <Modal open={preview !== null} onClose={() => setPreview(null)} title="Foto">
        <div className="flex justify-center">
          <img src={preview ?? ''} alt="Foto de la tarea" className="max-h-[70vh] rounded-xl object-contain" />
        </div>
      </Modal>
    </div>
  )
})
