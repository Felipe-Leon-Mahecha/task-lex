import type { Task } from '../../types/task'
import TaskCard from '../task/TaskCard'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'

function SortableTaskCard({ task, onToggle, onEdit, onDelete, onArchive, onDuplicate, onMove }: {
  task: Task
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onDuplicate?: (task: Task) => void
  onMove?: (id: string, sectionId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="relative group">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div {...listeners} className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-[var(--surface-2)]">
            <GripVertical className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
        </div>
        <TaskCard
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
          onArchive={onArchive}
          onDuplicate={onDuplicate}
          onMove={onMove}
        />
      </div>
    </div>
  )
}

export default function ListView({
  tasks,
  onToggle,
  onEdit,
  onDelete,
  onArchive,
  onDuplicate,
  onMove,
  onReorder,
}: {
  tasks: Task[]
  onToggle: (id: string) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onDuplicate?: (task: Task) => void
  onMove?: (id: string, sectionId: string) => void
  onReorder?: (oldIndex: number, newIndex: number) => void
}) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id && onReorder) {
      const oldIndex = tasks.findIndex((t) => t.id === active.id)
      const newIndex = tasks.findIndex((t) => t.id === over.id)
      onReorder(oldIndex, newIndex)
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="rounded-[calc(var(--radius)*0.8)] border border-dashed border-[var(--border)] p-8 text-center text-sm text-[var(--text-muted)]">
        Aún no hay tareas en este apartado. Crea la primera.
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((t, i) => (
            <div key={t.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 50}ms` }}>
              <SortableTaskCard
                task={t}
                onToggle={onToggle}
                onEdit={onEdit}
                onDelete={onDelete}
                onArchive={onArchive}
                onDuplicate={onDuplicate}
                onMove={onMove}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
