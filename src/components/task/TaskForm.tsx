import { useEffect, useRef, useState, type FormEvent } from 'react'
import { AlarmClock, Bell, BellRing, ChevronDown, ImagePlus, Loader2, Mic, Plus, Trash2, X } from 'lucide-react'
import Modal from '../ui/Modal'
import DateTimePicker from '../ui/DateTimePicker'
import Select from '../ui/Select'
import { type TaskInput } from '../../lib/tasks'
import { getUid } from '../../lib/session'
import { deleteTaskImage, uploadTaskImage } from '../../lib/taskImages'
import { startVoiceRecognition, isVoiceRecognitionSupported } from '../../lib/voice'
import type { LinkNote, Priority, Recurrence, ReminderKind, Status, Subtask } from '../../types/task'
import { useNotesStore } from '../../store/notes'
import { notifyApp } from '../../lib/appNotifications'

const field =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[var(--accent)]'

const priorityChips: { id: Priority; label: string; dot: string; sel: string }[] = [
  { id: 'baja', label: 'Baja', dot: 'bg-emerald-400', sel: 'border-emerald-400/40 text-emerald-300' },
  { id: 'media', label: 'Media', dot: 'bg-amber-300', sel: 'border-amber-300/40 text-amber-200' },
  { id: 'alta', label: 'Alta', dot: 'bg-red-400', sel: 'border-red-400/40 text-red-300' },
]

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
      {children}
    </p>
  )
}

interface Props {
  open: boolean
  initial: TaskInput | null
  presetDueDate?: Date | null
  sectionOptions?: { id: string; label: string }[]
  selectedSectionId?: string
  onSectionChange?: (id: string) => void
  onSave: (input: TaskInput) => void
  onClose: () => void
}

export default function TaskForm({ open, initial, presetDueDate = null, sectionOptions, selectedSectionId, onSectionChange, onSave, onClose }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [dueDate, setDueDate] = useState<Date | null>(initial?.dueDate ?? null)
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'media')
  const [status, setStatus] = useState<Status>(initial?.status ?? 'pending')
  const [recurrence, setRecurrence] = useState<Recurrence>(initial?.recurrence ?? 'none')
  const [focusDay, setFocusDay] = useState(initial?.focusDay ?? false)
  const [completeWithSubtasks, setCompleteWithSubtasks] = useState(initial?.completeWithSubtasks ?? false)
  const [reminderOption, setReminderOption] = useState<string>(() => {
    if (!initial?.reminderLead) return 'none'
    const mins = initial.reminderLead
    if (mins === 120) return '2h'
    if (mins === 60) return '1h'
    if (mins === 1440) return '1d'
    if (mins === 2880) return '2d'
    return 'custom'
  })
  const [customMinutes, setCustomMinutes] = useState<string>(() => {
    if (!initial?.reminderLead) return ''
    const mins = initial.reminderLead
    if (mins === 120 || mins === 60 || mins === 1440 || mins === 2880) return ''
    return mins.toString()
  })
  const [reminderKind, setReminderKind] = useState<ReminderKind>(initial?.reminderKind ?? 'notificacion')
  const [subtasks, setSubtasks] = useState<Subtask[]>(initial?.subtasks ?? [])
  const [notesLinks, setNotesLinks] = useState<LinkNote[]>(initial?.notesLinks ?? [])
  const [tagsText, setTagsText] = useState(initial?.tags.join(', ') ?? '')
  const [images, setImages] = useState<string[]>(initial?.images ?? [])
  const [uploading, setUploading] = useState(false)
  const [limitMsg, setLimitMsg] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [subtasksOpen, setSubtasksOpen] = useState(Boolean(initial?.subtasks?.length))
  const [draftRecovered, setDraftRecovered] = useState(false)
  const skipDraftSave = useRef(false)
  const MAX_IMAGES = 2
  const savedNotes = useNotesStore((state) => state.notes)
  const draftKey = `tasklex-task-draft:${getUid() ?? 'local'}`

  useEffect(() => {
    if (!open) return
    skipDraftSave.current = true
    setDraftRecovered(false)
    if (initial) {
      setSubtasksOpen(Boolean(initial.subtasks?.length))
      setTitle(initial.title ?? '')
      setDescription(initial.description ?? '')
      setDueDate(initial.dueDate ?? null)
      setPriority(initial.priority ?? 'media')
      setStatus(initial.status ?? 'pending')
      setRecurrence(initial.recurrence ?? 'none')
      setFocusDay(initial.focusDay ?? false)
      setCompleteWithSubtasks(initial.completeWithSubtasks ?? false)
      setSubtasks(initial.subtasks ?? [])
      setNotesLinks(initial.notesLinks ?? [])
      setTagsText(initial.tags?.join(', ') ?? '')
      setImages(initial.images ?? [])
      const lead = initial.reminderLead ?? null
      const presets: Record<number, string> = { 60: '1h', 120: '2h', 1440: '1d', 2880: '2d' }
      setReminderOption(lead === null ? 'none' : presets[lead] ?? 'custom')
      setCustomMinutes(lead !== null && !presets[lead] ? String(lead) : '')
      setReminderKind(initial.reminderKind ?? 'notificacion')
      setMoreOpen(Boolean(initial.reminderLead || initial.tags?.length || initial.notesLinks?.length || initial.images?.length || initial.focusDay))
      return
    }
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) {
        setTitle(''); setDescription(''); setDueDate(presetDueDate); setPriority('media'); setStatus('pending')
        setRecurrence('none'); setFocusDay(false); setCompleteWithSubtasks(false); setReminderOption('none')
        setCustomMinutes(''); setReminderKind('notificacion'); setSubtasks([]); setNotesLinks([]); setTagsText(''); setImages([]); setMoreOpen(false)
        return
      }
      const draft = JSON.parse(raw) as Record<string, unknown>
      setTitle(typeof draft.title === 'string' ? draft.title : '')
      setDescription(typeof draft.description === 'string' ? draft.description : '')
      setDueDate(typeof draft.dueDate === 'string' ? new Date(draft.dueDate) : presetDueDate)
      setPriority((draft.priority as Priority) ?? 'media')
      setStatus((draft.status as Status) ?? 'pending')
      setRecurrence((draft.recurrence as Recurrence) ?? 'none')
      setFocusDay(Boolean(draft.focusDay)); setCompleteWithSubtasks(Boolean(draft.completeWithSubtasks))
      setReminderOption(typeof draft.reminderOption === 'string' ? draft.reminderOption : 'none')
      setCustomMinutes(typeof draft.customMinutes === 'string' ? draft.customMinutes : '')
      setReminderKind((draft.reminderKind as ReminderKind) ?? 'notificacion')
      setSubtasks(Array.isArray(draft.subtasks) ? draft.subtasks as Subtask[] : [])
      setSubtasksOpen(Array.isArray(draft.subtasks) && draft.subtasks.length > 0)
      setNotesLinks(Array.isArray(draft.notesLinks) ? draft.notesLinks as LinkNote[] : [])
      setTagsText(typeof draft.tagsText === 'string' ? draft.tagsText : '')
      setImages(Array.isArray(draft.images) ? draft.images as string[] : [])
      setMoreOpen(Boolean(draft.moreOpen))
      setDraftRecovered(true)
    } catch {
      localStorage.removeItem(draftKey)
    }
  }, [open, initial, presetDueDate, draftKey])

  useEffect(() => {
    if (!open || initial) return
    if (skipDraftSave.current) { skipDraftSave.current = false; return }
    try {
      const hasContent = Boolean(title.trim() || description.trim() || dueDate || tagsText.trim() || subtasks.length || notesLinks.length || images.length || focusDay || reminderOption !== 'none')
      if (!hasContent) return
      localStorage.setItem(draftKey, JSON.stringify({ title, description, dueDate, priority, status, recurrence, focusDay, completeWithSubtasks, reminderOption, customMinutes, reminderKind, subtasks, notesLinks, tagsText, images, moreOpen }))
    } catch {}
  }, [open, initial, draftKey, title, description, dueDate, priority, status, recurrence, focusDay, completeWithSubtasks, reminderOption, customMinutes, reminderKind, subtasks, notesLinks, tagsText, images, moreOpen])

  const handleVoiceInput = async () => {
    if (!isVoiceRecognitionSupported()) {
      notifyApp({ title: 'Dictado por voz', message: 'Este dispositivo o navegador no admite reconocimiento de voz.', kind: 'warning' })
      return
    }

    setIsListening(true)
    try {
      const transcript = await startVoiceRecognition()
      setTitle(transcript)
    } catch (error) {
      console.error('Voice recognition error:', error)
      const msg = (error as Error).message
      if (msg === 'no-speech') {
        notifyApp({ title: 'No te escuché', message: 'No se detectó voz. Toca el micrófono e inténtalo de nuevo.', kind: 'info' })
      } else {
        notifyApp({ title: 'Falló el dictado', message: 'No se pudo reconocer la voz. Inténtalo de nuevo.', kind: 'error' })
      }
    } finally {
      setIsListening(false)
    }
  }

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
    const invalid = files.find((file) => !file.type.startsWith('image/'))
    if (invalid) {
      setUploadError('Elige archivos de imagen para adjuntarlos a la tarea.')
      return
    }
    const room = MAX_IMAGES - images.length
    if (room <= 0) {
      setLimitMsg(`Máximo ${MAX_IMAGES} fotos por tarea (espacio de tu nube gratis).`)
      setTimeout(() => setLimitMsg(null), 3500)
      return
    }
    setLimitMsg(files.length > room ? `Se añadirán ${room} de las imágenes seleccionadas (máximo ${MAX_IMAGES} por tarea).` : null)
    setUploadError(null)
    setUploading(true)
    const uid = getUid() ?? ''
    const next: string[] = []
    let failed = 0
    for (const file of files.slice(0, room)) {
      try {
        next.push(await uploadTaskImage(file, uid))
      } catch {
        failed++
      }
    }
    setImages((cur) => [...cur, ...next])
    if (failed > 0) setUploadError(`${failed === 1 ? 'Una imagen no se pudo procesar' : `${failed} imágenes no se pudieron procesar`}. Intenta con otro archivo.`)
    setUploading(false)
  }

  const removeImage = (url: string) => {
    setImages((cur) => cur.filter((u) => u !== url))
    deleteTaskImage(url).catch(() => {})
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    let leadTime: number | null = null
    if (reminderOption === '2h') leadTime = 120
    else if (reminderOption === '1h') leadTime = 60
    else if (reminderOption === '1d') leadTime = 1440
    else if (reminderOption === '2d') leadTime = 2880
    else if (reminderOption === 'custom' && customMinutes) leadTime = Number(customMinutes)

    try { localStorage.removeItem(draftKey) } catch {}
    onSave({
      title: title.trim(),
      description: description.trim(),
      dueDate,
      priority,
      status,
      recurrence,
      focusDay,
      completeWithSubtasks,
      reminderLead: leadTime,
      reminder2HoursBefore: false,
      reminderKind: leadTime ? reminderKind : undefined,
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
    <Modal open={open} onClose={onClose} title={initial ? 'Editar tarea' : 'Nueva tarea'} className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-[var(--accent)]/20 bg-[var(--accent)]/[0.06] px-4 py-3">
          <p className="text-sm font-semibold text-[var(--text)]">Una idea a la vez</p>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">Ponle nombre y, si quieres, añade fecha, prioridad y detalles.</p>
          {draftRecovered && <p className="mt-2 text-[11px] font-semibold text-[var(--accent)]">Borrador recuperado automáticamente</p>}
        </div>
        {sectionOptions && onSectionChange && <label className="block"><span className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">Guardar en apartado</span><Select value={selectedSectionId ?? ''} onChange={onSectionChange} options={sectionOptions.map((section) => ({ value: section.id, label: section.label }))} className={field} /></label>}
        <div>
          <SectionLabel>Lo básico</SectionLabel>
          <div className="mt-2 flex gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué tienes que hacer?"
              required
              className={`${field} flex-1 !py-3`}
            />
            {isVoiceRecognitionSupported() && (
              <button
                type="button"
                onClick={handleVoiceInput}
                disabled={isListening}
                className={`flex items-center justify-center rounded-lg border px-3 transition-colors ${
                  isListening
                    ? 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
                }`}
                title="Dictar título"
              >
                {isListening ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
              </button>
            )}
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Detalles (opcional)..."
            className={`${field} mt-2`}
          />
        </div>

        <div>
          <SectionLabel>Entrega y prioridad</SectionLabel>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Entrega</label>
              <DateTimePicker value={dueDate} onChange={setDueDate} />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[var(--text-muted)]">Repetición</label>
              <Select
                value={recurrence}
                onChange={(v) => setRecurrence(v as Recurrence)}
                options={[
                  { value: 'none', label: 'Una vez' },
                  { value: 'daily', label: 'Diaria' },
                  { value: 'weekly', label: 'Semanal' },
                  { value: 'monthly', label: 'Mensual' },
                ]}
                className={field}
              />
            </div>
          </div>
          <label className="mb-1 mt-3 block text-xs text-[var(--text-muted)]">Prioridad</label>
          <div className="grid grid-cols-3 gap-2">
            {priorityChips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setPriority(c.id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-colors ${
                  priority === c.id
                    ? `${c.sel} bg-[var(--surface-2)]`
                    : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border)]">
          <div className="flex items-center justify-between gap-2 px-4 py-3">
            <button type="button" aria-expanded={subtasksOpen} onClick={() => setSubtasksOpen((value) => !value)} className="flex min-w-0 items-center gap-2 text-left text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
              <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${subtasksOpen ? 'rotate-180' : ''}`} />
              <span>Sub-pasos</span><span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px]">{subtasks.length || 'opcional'}</span>
            </button>
            <button type="button" onClick={() => { setSubtasksOpen(true); addSubtask() }} className="flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--accent)] hover:underline">
              <Plus className="h-3.5 w-3.5" /> Añadir paso
            </button>
          </div>
          {subtasksOpen && <div className="space-y-2 border-t border-[var(--border)] px-4 py-3">
          {subtasks.length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">
              Divide una tarea grande en pasos pequeños (ej: "comprar el boleto", "empacar").
            </p>
          )}
          {subtasks.map((s) => (
            <div key={s.id} className="flex items-center gap-2">
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
          {subtasks.length > 1 && (
            <label className="mt-1 flex items-start gap-2 text-xs text-[var(--text-muted)]">
              <input
                type="checkbox"
                checked={completeWithSubtasks}
                onChange={(e) => setCompleteWithSubtasks(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--border)] bg-[var(--surface-2)] accent-[var(--accent)]"
              />
              Completar la tarea solo cuando todos los sub-pasos estén marcados
            </label>
          )}
          </div>}
        </div>

        <div className="rounded-xl border border-[var(--border)]">
          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Más opciones
            <ChevronDown className={`h-4 w-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
          </button>
          {moreOpen && (
            <div className="space-y-4 border-t border-[var(--border)] px-4 py-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Estado</label>
                  <Select
                    value={status}
                    onChange={(v) => setStatus(v as Status)}
                    options={[
                      { value: 'pending', label: 'Pendiente' },
                      { value: 'in_progress', label: 'En progreso' },
                      { value: 'waiting', label: 'En espera' },
                      { value: 'done', label: 'Hecha' },
                    ]}
                    className={field}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Avisar antes</label>
                  <Select
                    value={reminderOption}
                    onChange={(v) => setReminderOption(v)}
                    options={[
                      { value: 'none', label: 'Sin recordatorio' },
                      { value: '1h', label: '1 hora antes' },
                      { value: '2h', label: '2 horas antes' },
                      { value: '1d', label: '1 día antes' },
                      { value: '2d', label: '2 días antes' },
                      { value: 'custom', label: 'Personalizado' },
                    ]}
                    className={field}
                  />
                </div>
              </div>
              {reminderOption === 'custom' && (
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Minutos antes</label>
                  <input
                    type="number"
                    min={1}
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    placeholder="Ej: 30"
                    className={field}
                  />
                </div>
              )}
              {reminderOption !== 'none' && (
                <div>
                  <label className="mb-1 block text-xs text-[var(--text-muted)]">Tipo de aviso</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { v: 'notificacion', label: 'Notificación', icon: Bell },
                        { v: 'alarma', label: 'Alarma', icon: AlarmClock },
                        { v: 'ambas', label: 'Ambas', icon: BellRing },
                      ] as const
                    ).map((o) => (
                      <button
                        key={o.v}
                        type="button"
                        onClick={() => setReminderKind(o.v)}
                        className={`flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-semibold transition-colors ${
                          reminderKind === o.v
                            ? 'border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]'
                            : 'border-[var(--border)] bg-[var(--surface-2)] text-[var(--text-muted)] hover:text-[var(--text)]'
                        }`}
                      >
                        <o.icon className="h-3.5 w-3.5" />
                        {o.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                    La alarma suena fuerte y queda fija hasta que la toques.
                  </p>
                </div>
              )}

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={focusDay}
                  onChange={(e) => setFocusDay(e.target.checked)}
                  className="h-4 w-4 rounded border-[var(--border)] bg-[var(--surface-2)] accent-[var(--accent)]"
                />
                Marcar como foco del día
              </label>

              <div>
                <label className="mb-1 block text-xs text-[var(--text-muted)]">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                  placeholder="trabajo, estudio"
                  className={field}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]">Notas y links</span>
                  <button type="button" onClick={addNote} className="text-xs font-semibold text-[var(--accent)] hover:underline">
                    + Añadir
                  </button>
                </div>
                {savedNotes.length > 0 && <select value="" onChange={(event) => {
                  const note = savedNotes.find((item) => item.id === event.target.value)
                  if (!note || notesLinks.some((item) => item.type === 'nota' && item.content === note.id)) return
                  setNotesLinks((items) => [...items, { id: crypto.randomUUID(), type: 'nota', content: note.id, label: note.title || 'Nota sin título' }])
                }} className={`${field} mb-2`}>
                  <option value="">Vincular una nota existente…</option>
                  {savedNotes.map((note) => <option key={note.id} value={note.id}>{note.title || 'Nota sin título'}</option>)}
                </select>}
                {notesLinks.map((n) => (
                  <div key={n.id} className="mb-2 flex items-center gap-2">
                    <Select
                      value={n.type}
                      onChange={(v) => updateNote(n.id, { type: v as LinkNote['type'] })}
                      options={[
                        { value: 'link', label: 'Link' },
                        { value: 'nota', label: 'Nota' },
                      ]}
                      className="rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-2 text-xs outline-none w-24"
                    />
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
                  <span className="text-xs text-[var(--text-muted)]">Fotos</span>
                  <label className={`flex items-center gap-1 text-xs font-semibold text-[var(--accent)] ${uploading ? 'cursor-wait opacity-60' : 'cursor-pointer hover:underline'}`}>
                    {uploading ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <ImagePlus className="h-3.5 w-3.5" />
                    )}
                    {uploading ? 'Subiendo...' : '+ Añadir foto'}
                    <input type="file" accept="image/*" multiple disabled={uploading} className="hidden" onChange={onPickImages} />
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
                {uploadError && <p role="alert" className="text-xs text-red-400">{uploadError}</p>}
              </div>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 -mx-5 flex justify-end gap-2 border-t border-[var(--border)] bg-[var(--surface)]/95 px-5 pb-1 pt-3 backdrop-blur">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
          >
            Cancelar
          </button>
          <button type="submit" disabled={!title.trim() || uploading} className="btn-primary disabled:cursor-not-allowed disabled:opacity-50">
            Guardar
          </button>
        </div>
      </form>
    </Modal>
  )
}
