import Modal from '../ui/Modal'
import { useSectionsStore } from '../../store/sections'

export default function MoveTaskModal({
  open,
  onClose,
  currentId,
  taskTitle,
  onMove,
}: {
  open: boolean
  onClose: () => void
  currentId: string
  taskTitle: string
  onMove: (sectionId: string) => void
}) {
  const sections = useSectionsStore((s) => s.sections)
  return (
    <Modal open={open} onClose={onClose} title="Mover tarea">
      <div className="mb-4 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/[0.06] p-3"><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Mover esta tarea</p><p className="mt-1 truncate text-sm font-bold text-[var(--text)]">{taskTitle}</p></div>
      <p className="mb-3 text-sm text-[var(--text-muted)]">Elige el apartado de destino.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {sections.map((sec) => (
          <button
            key={sec.id}
            disabled={sec.id === currentId}
            onClick={() => {
              onMove(sec.id)
              onClose()
            }}
            className={`min-h-11 rounded-lg border border-[var(--border)] px-3 py-2.5 text-left text-sm transition-colors ${
              sec.id === currentId
                ? 'opacity-40'
                : 'hover:border-[var(--accent)] hover:bg-[var(--surface-2)]'
            }`}
          >
            {sec.label}
          </button>
        ))}
      </div>
    </Modal>
  )
}
