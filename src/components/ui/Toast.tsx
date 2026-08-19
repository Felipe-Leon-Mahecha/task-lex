import { useEffect, useState, useCallback } from 'react'
import { Undo2, X } from 'lucide-react'
import { useUndoStore } from '../../store/undo'
import { useTasksStore } from '../../store/tasks'
import type { Task } from '../../types/task'

export default function Toast() {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const actions = useUndoStore((s) => s.actions)
  const undoLast = useUndoStore((s) => s.undoLast)
  const addTask = useTasksStore((s) => s.addTask)
  const updateTask = useTasksStore((s) => s.updateTask)

  useEffect(() => {
    if (actions.length > 0) {
      const lastAction = actions[0]
      const messages = {
        complete: 'Tarea completada',
        archive: 'Tarea archivada',
        delete: 'Tarea eliminada',
        move: 'Tarea movida',
      }
      setMessage(messages[lastAction.type])
      setVisible(true)

      const timer = setTimeout(() => {
        setVisible(false)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [actions])

  const handleUndo = useCallback(() => {
    const action = undoLast()
    if (!action) return setVisible(false)

    if (action.type === 'delete' && action.previousState) {
      addTask(action.previousState as Task)
    } else if ((action.type === 'complete' || action.type === 'archive' || action.type === 'move') && action.previousState) {
      updateTask(action.taskId, action.previousState)
    }

    setVisible(false)
  }, [undoLast, addTask, updateTask])

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[150] animate-in slide-in-from-bottom-4 duration-300 md:left-auto md:right-4 md:w-auto">
      <div className="card flex items-center justify-between gap-4 p-4 shadow-lg">
        <span className="text-sm text-[var(--text)]">{message}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={handleUndo}
            className="flex items-center gap-1.5 rounded-full border border-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)]/20"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Deshacer
          </button>
          <button
            onClick={() => setVisible(false)}
            className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
