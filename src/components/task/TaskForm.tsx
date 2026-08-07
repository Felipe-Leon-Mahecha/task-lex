import { useState, type FormEvent } from 'react'
import { ImagePlus, Loader2, Trash2, X } from 'lucide-react'
import Modal from '../ui/Modal'
import { toInputValue, type TaskInput } from '../../lib/tasks'
import { getUid } from '../../lib/session'
import { deleteTaskImage, uploadTaskImage } from '../../lib/taskImages'
import type { LinkNote, Priority, Recurrence, Status, Subtask } from '../../types/task'

const field =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]'

interface Props {
  open: boolean
  initial: TaskInput | null
  onSave: (input: TaskInput) => void
  onClose: () => void
}

export default function TaskForm({ open, initial, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dueDateStr, setDueDateStr] = useState(initial?.dueDate ? toInputValue(initial.dueDate) : '')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media')
  const [status, setStatus] = useState<Status>(initial?.status ?? 'pending')
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'none')
  const [focusDay, setFocusDay] = useState(initial?.focusDay ?? false)
  const [reminderLead, setReminderLead] = useState<number | null>(initial?.reminderLead ?? null)
  const [subtasks, setSubtasks] = useState<Subtask[]>(initial?.subtasks ?? [])
  const [notesLinks, setNotesLinks] = useState<LinkNote[]>(initial?.notesLinks ?? [])
  const [tagsText, setTagsText] = useState(initial?.tags.join(', ') ?? '')
  const [images, setImages] = useState<string[]>(initial?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [limitMsg, setLimitMsg] = useState<string | null>(null)
  const MAX_IMAGES = 2

  const addSubtask = () => setSubtasks([...subtasks, { id: crypto.randomUUID(), text: '', done: false }])
  const updateSubtask = (id: string, text: string) =>
    setSubtasks(subtasks.map((s) => (s.id === id ? { ...s, text } : s)))
  const removeSubtask = (id: string) => setSubtasks(subtasks.filter((s) => s.id !== id))

  const addNote = () => setNotesLinks([...notesLinks, { id: crypto.randomUUID(), type: 'link', content: '', label: '' }])
  const updateNote = (id: string, patch: Partial<LinkNote>) =>
    setNotesLinks(notesLinks.map((n) => (n.id === id ? { ...n, ...patch } : n)))
  const removeNote = (id: string) => setNotesLinks(notesLinks.filter((n) => n.id !== id))

  const onPickImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    e.target.value = ''
    const room = MAX_IMAGES - images.length
    if (room <= 0) {
      setLimitMsg(`Máximo ${MAX_IMAGES} fotos por tarea (espacio de tu nube gratis).`)
      setTimeout(() => setLimitMsg(null), 3500)
      return
    }
    setLimitMsg(null)
    setUploading(true)
    const uid = getUid() ?? ''
    const next: string[] = []
    for (const file of files.slice(0, room)) {
      try {
        next.push(await uploadTaskImage(file, uid))
      } catch {}
    }
    setImages((cur) => [...cur, ...next])
    setUploading(false)
  }

  const removeImage = (url: string) => {
    setImages((cur) => cur.filter((u) => u !== url))
    deleteTaskImage(url).catch(() => {})
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDateStr ? new Date(dueDateStr) : null,
      priority,
      status,
      recurrence,
      focusDay,
      reminderLead,
      subtasks: subtasks.filter((s) => s.text.trim()),
      notesLinks: notesLinks.filter((n) => n.content.trim()),
      images,
      tags: tagsText
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    })
  }

  return (
    <Modal open={open} onClose={onClose} title={initial ? 'Editar tarea' : 'Nueva tarea'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Título *</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="¿Qué tienes que hacer?"
            className={field}
            autoFocus
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Detalles..."
            className={field}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Entrega</label>
            <input
              type="datetime-local"
              value={dueDateStr}
              onChange={(e) => setDueDateStr(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Prioridad</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} className={field}>
              <option value="baja">Baja</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Estado</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as Status)} className={field}>
              <option value="pending">Pendiente</option>
              <option value="in_progress">En progreso</option>
              <option value="done">Hecha</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Recurrencia</label>
            <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as Recurrence)} className={field}>
              <option value="none">Sin recurrencia</option>
              <option value="daily">Diaria</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">Avisar antes</label>
          <select
            value={reminderLead ?? ''}
            onChange={(e) => setReminderLead(e.target.value ? Number(e.target.value) : null)}
            className={field}
          >
            <option value="">Sin aviso</option>
            <option value={3600000}>1 hora antes</option>
            <option value={86400000}>1 día antes</option>
            <option value={172800000}>2 días antes</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={focusDay}
            onChange={(e) => setFocusDay(e.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          Marcar como foco del día
        </label>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)]">Sub-pasos</span>
            <button type="button" onClick={addSubtask} className="text-xs text-[var(--accent)] hover:underline">
              + Añadir paso
            </button>
          </div>
          {subtasks.map((s) => (
            <div key={s.id} className="mb-2 flex items-center gap-2">
              <input
                value={s.text}
                onChange={(e) => updateSubtask(s.id, e.target.value)}
                placeholder="Paso..."
                className={field}
              />
              <button
                type="button"
                onClick={() => removeSubtask(s.id)}
                className="rounded p-1 text-[var(--text-muted)] hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)]">Notas y links</span>
            <button type="button" onClick={addNote} className="text-xs text-[var(--accent)] hover:underline">
              + Añadir
            </button>
          </div>
          {notesLinks.map((n) => (
            <div key={n.id} className="mb-2 flex items-center gap-2">
              <select
                value={n.type}
                onChange={(e) => updateNote(n.id, { type: e.target.value as LinkNote['type'] })}
                className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-xs outline-none"
              >
                <option value="link">Link</option>
                <option value="nota">Nota</option>
              </select>
              <input
                value={n.content}
                onChange={(e) => updateNote(n.id, { content: e.target.value })}
                placeholder={n.type === 'link' ? 'https://...' : 'Nota rápida'}
                className={field}
              />
              <button
                type="button"
                onClick={() => removeNote(n.id)}
                className="rounded p-1 text-[var(--text-muted)] hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--text-muted)]">Fotos</span>
            <label className="flex cursor-pointer items-center gap-1 text-xs text-[var(--accent)] hover:underline">
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <ImagePlus className="h-3.5 w-3.5" />
              )}
              {uploading ? 'Subiendo...' : '+ Añadir foto'}
              <input type="file" accept="image/*" multiple className="hidden" onChange={onPickImages} />
            </label>
          </div>
          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((url) => (
                <div key={url} className="group relative">
                  <img
                    src={url}
                    alt="Foto de la tarea"
                    className="h-14 w-14 rounded-lg border border-[var(--border)] object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    title="Quitar foto"
                    className="absolute -right-1.5 -top-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 text-[var(--text-muted)] hover:text-red-400"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          {limitMsg && <p className="text-xs text-red-400">{limitMsg}</p>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-[var(--text-muted)]">
            Etiquetas (separadas por coma)
          </label>
          <input
            value={tagsText}
            onChange={(e) => setTagsText(e.target.value)}
            placeholder="trabajo, estudio"
            className={field}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Cancelar
          </button>
          <button type="submit" className="btn-primary">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  )
}
