import Modal from '../ui/Modal'
import { useSectionsStore } from '../../store/sections'

export default function MoveTaskModal({
  open,
  onClose,
  currentId,
  onMove,
}: {
  open: boolean
  onClose: () => void
  currentId: string
  onMove: (sectionId: string) => void
}) {
  const sections = useSectionsStore((s) => s.sections)
  return (
    <Modal open={open} onClose={onClose} title="Mover tarea">
      <p className="mb-3 text-sm text-[var(--text-muted)]">¿A qué apartado la llevas?</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {sections.map((sec) => (
          <button
            key={sec.id}
            disabled={sec.id === currentId}
            onClick={() => {
              onMove(sec.id)
              onClose()
            }}
            className={`rounded-lg border border-[var(--border)] px-3 py-2.5 text-left text-sm transition-colors ${
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
