import { useState } from 'react'
import { ArrowLeft, ArrowRight, Copy, MoveRight, RefreshCw, Star } from 'lucide-react'
import type { Status, Task } from '../../types/task'
import MoveTaskModal from '../task/MoveTaskModal'

const order: Status[] = ['pending', 'in_progress', 'done']
const colLabel: Record<Status, string> = { pending: 'Pendiente', in_progress: 'En progreso', done: 'Hecha' }

function MiniCard({
  task,
  onMove,
  onMoveSection,
  onDuplicate,
}: {
  task: Task
  onMove: (id: string, dir: -1 | 1) => void
  onMoveSection: (id: string, sectionId: string) => void
  onDuplicate: (task: Task) => void
}) {
  const idx = order.indexOf(task.status)
  const [moveOpen, setMoveOpen] = useState(false)
  return (
    <div className="card p-3">
      <p className="text-sm font-semibold">{task.title}</p>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {task.focusDay && <Star className="h-3.5 w-3.5 fill-[var(--accent)] text-[var(--accent)]" />}
          {task.recurrence !== 'none' && <RefreshCw className="h-3.5 w-3.5 text-[var(--text-muted)]" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={idx === 0}
            onClick={() => onMove(task.id, -1)}
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-30"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </button>
          <button
            disabled={idx === 2}
            onClick={() => onMove(task.id, 1)}
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--accent)] disabled:opacity-30"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onDuplicate(task)}
            title="Duplicar"
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setMoveOpen(true)}
            title="Mover a otro apartado"
            className="rounded p-1 text-[var(--text-muted)] hover:text-[var(--accent)]"
          >
            <MoveRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <MoveTaskModal
        open={moveOpen}
        onClose={() => setMoveOpen(false)}
        currentId={task.sectionId}
        onMove={(sectionId) => onMoveSection(task.id, sectionId)}
      />
    </div>
  )
}

export default function BoardView({
  tasks,
  onMove,
  onMoveSection,
  onDuplicate,
}: {
  tasks: Task[]
  onMove: (id: string, dir: -1 | 1) => void
  onMoveSection: (id: string, sectionId: string) => void
  onDuplicate: (task: Task) => void
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {order.map((c) => {
        const colTasks = tasks.filter((t) => t.status === c)
        return (
          <div key={c} className="rounded-[calc(var(--radius)*0.8)] border border-[var(--border)] bg-[var(--surface)] p-3">
            <p className="eyebrow mb-3">
              {colLabel[c]} · {colTasks.length}
            </p>
            <div className="space-y-2">
              {colTasks.length === 0 ? (
                <p className="py-4 text-center text-xs text-[var(--text-muted)]">Vacío</p>
              ) : (
                colTasks.map((t, i) => (
                  <div key={t.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
                    <MiniCard task={t} onMove={onMove} onMoveSection={onMoveSection} onDuplicate={onDuplicate} />
                  </div>
                ))
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
