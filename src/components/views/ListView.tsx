import type { Task } from '../../types/task'
import TaskCard from '../task/TaskCard'

export default function ListView({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onMove,
}: {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onDuplicate?: (task: Task) => void
  onMove?: (id: string, sectionId: string) => void
}) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-[calc(var(--radius)*0.8)] border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
        Aún no hay tareas en este apartado. Crea la primera.
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {tasks.map((t) => (
        <TaskCard
          key={t.id}
          task={t}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onDuplicate={onDuplicate}
          onMove={onMove}
        />
      ))}
    </div>
  )
}
