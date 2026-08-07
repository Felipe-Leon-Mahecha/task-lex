import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Modal from '../ui/Modal'
import { useSectionsStore } from '../../store/sections'
import IconPicker from './IconPicker'

export default function NewSectionModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const addSection = useSectionsStore((s) => s.addSection)
  const navigate = useNavigate()
  const [label, setLabel] = useState('')
  const [icon, setIcon] = useState('star')
  const [error, setError] = useState('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const name = label.trim()
    if (!name) {
      setError('Ponle un nombre al apartado.')
      return
    }
    const id = addSection(name, icon)
    setLabel('')
    setError('')
    onClose()
    navigate(`/s/${id}`)
  }

  return (
    <Modal open={open} onClose={onClose} title="Nuevo apartado">
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Nombre</label>
          <input
            autoFocus
            value={label}
            onChange={(e) => {
              setLabel(e.target.value)
              setError('')
            }}
            placeholder="Ej: Trabajo, Deporte, Ideas..."
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]"
          />
          {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
        <div>
          <label className="mb-2 block text-xs font-medium text-[var(--text-muted)]">Ícono</label>
          <IconPicker value={icon} onChange={setIcon} />
        </div>
        <div className="flex justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Crear apartado
          </button>
        </div>
      </form>
    </Modal>
  )
}
