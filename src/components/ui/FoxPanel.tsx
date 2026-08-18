import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Check, X, Loader2, ChevronDown } from 'lucide-react'
import { parseTaskWithAI, type ParsedTask } from '../../lib/ai'
import { isVoiceRecognitionSupported, startVoiceRecognition } from '../../lib/voice'
import { useSectionsStore } from '../../store/sections'
import { useTasksStore } from '../../store/tasks'
import { createTask } from '../../lib/tasks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function FoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className}>
      <path d="M8 8L20 28L8 52C8 52 4 36 8 20L8 8Z" fill="#D97706" />
      <path d="M56 8L44 28L56 52C56 52 60 36 56 20L56 8Z" fill="#D97706" />
      <path d="M12 14L20 28L12 44C12 44 10 34 12 22L12 14Z" fill="#FDE68A" />
      <path d="M52 14L44 28L52 44C52 44 54 34 52 22L52 14Z" fill="#FDE68A" />
      <ellipse cx="32" cy="38" rx="20" ry="18" fill="#EA580C" />
      <ellipse cx="32" cy="42" rx="14" ry="11" fill="#FEF3C7" />
      <circle cx="24" cy="32" r="3.5" fill="#1C1917" />
      <circle cx="40" cy="32" r="3.5" fill="#1C1917" />
      <circle cx="25" cy="31" r="1.2" fill="white" />
      <circle cx="41" cy="31" r="1.2" fill="white" />
      <ellipse cx="32" cy="39" rx="3" ry="2.2" fill="#1C1917" />
      <path d="M29 42Q32 45 35 42" stroke="#1C1917" strokeWidth="1.2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function FoxPanel() {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parsed, setParsed] = useState<ParsedTask | null>(null)
  const [listening, setListening] = useState(false)
  const [created, setCreated] = useState(false)
  const [sectionId, setSectionId] = useState<string>('')
  const [showSectionPicker, setShowSectionPicker] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const sections = useSectionsStore((s) => s.sections)
  const addTask = useTasksStore((s) => s.addTask)

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus()
    }
  }, [open])

  useEffect(() => {
    if (sections.length > 0 && !sectionId) {
      setSectionId(sections[0].id)
    }
  }, [sections, sectionId])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleParse = async () => {
    const text = prompt.trim()
    if (!text) return

    setLoading(true)
    setError(null)
    setParsed(null)

    try {
      const result = await parseTaskWithAI(text)
      setParsed(result)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al procesar')
    } finally {
      setLoading(false)
    }
  }

  const handleVoice = async () => {
    if (listening) return
    setListening(true)
    try {
      const text = await startVoiceRecognition()
      setPrompt(text)
    } catch {
    } finally {
      setListening(false)
    }
  }

  const handleConfirm = () => {
    if (!parsed || !sectionId) return

    const task = createTask(sectionId, {
      title: parsed.title,
      description: parsed.description,
      dueDate: parsed.dueDate ? new Date(parsed.dueDate) : null,
      priority: parsed.priority,
      status: 'pending',
      recurrence: 'none',
      focusDay: false,
      reminderLead: null,
      reminder2HoursBefore: false,
      subtasks: [],
      notesLinks: [],
      images: [],
      tags: parsed.tags,
    })

    addTask(task)
    setCreated(true)
    setTimeout(() => {
      setOpen(false)
      setPrompt('')
      setParsed(null)
      setCreated(false)
      setError(null)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (parsed) {
        handleConfirm()
      } else {
        handleParse()
      }
    }
  }

  const formatPreviewDate = (iso: string) => {
    try {
      return format(new Date(iso), "d 'de' MMMM 'a las' HH:mm", { locale: es })
    } catch {
      return iso
    }
  }

  const selectedSection = sections.find((s) => s.id === sectionId)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-2 z-50 transition-transform hover:scale-110 active:scale-95 md:bottom-6 md:right-4"
        aria-label="Fox - Agregar rápido"
      >
        <FoxIcon className="h-16 w-16 drop-shadow-lg md:h-14 md:w-14" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            ref={panelRef}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {created ? (
              <div className="flex flex-col items-center gap-3 p-8">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/20">
                  <Check className="h-7 w-7 text-green-500" />
                </div>
                <p className="text-sm font-semibold">Fox creó tu tarea</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FoxIcon className="h-6 w-6" />
                    <span className="text-sm font-semibold">Fox</span>
                    <span className="text-[11px] text-[var(--text-muted)]">asistente rápido</span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-4">
                  <textarea
                    ref={inputRef}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Ej: "Recordarme comprar harina mañana a las 4pm"'
                    rows={2}
                    className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  />

                  <div className="mt-3 flex items-center gap-2">
                    <div className="relative">
                      <button
                        onClick={() => setShowSectionPicker(!showSectionPicker)}
                        className="flex items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs text-[var(--text)] hover:bg-[var(--surface-2)]"
                      >
                        {selectedSection?.label ?? 'Sección'}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                      {showSectionPicker && (
                        <div className="absolute bottom-full left-0 z-10 mb-1 w-40 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg)] shadow-lg">
                          {sections.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSectionId(s.id)
                                setShowSectionPicker(false)
                              }}
                              className={`block w-full px-3 py-2 text-left text-xs hover:bg-[var(--surface)] ${
                                s.id === sectionId ? 'font-semibold text-[var(--accent)]' : 'text-[var(--text)]'
                              }`}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {isVoiceRecognitionSupported() && (
                      <button
                        onClick={handleVoice}
                        disabled={listening || loading}
                        className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] disabled:opacity-50"
                      >
                        {listening ? <MicOff className="h-4 w-4 animate-pulse text-red-500" /> : <Mic className="h-4 w-4" />}
                      </button>
                    )}

                    <div className="flex-1" />

                    <button
                      onClick={handleParse}
                      disabled={!prompt.trim() || loading}
                      className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      {loading ? 'Fox pensando...' : 'Analizar'}
                    </button>
                  </div>

                  {error && (
                    <p className="mt-2 text-xs text-red-500">{error}</p>
                  )}

                  {parsed && (
                    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        Fox encontró esto
                      </p>

                      <div className="space-y-2">
                        <div>
                          <label className="text-[10px] text-[var(--text-muted)]">Título</label>
                          <input
                            value={parsed.title}
                            onChange={(e) => setParsed({ ...parsed, title: e.target.value })}
                            className="block w-full rounded-lg bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                          />
                        </div>

                        {parsed.description && (
                          <div>
                            <label className="text-[10px] text-[var(--text-muted)]">Descripción</label>
                            <input
                              value={parsed.description}
                              onChange={(e) => setParsed({ ...parsed, description: e.target.value })}
                              className="block w-full rounded-lg bg-[var(--bg)] px-3 py-1.5 text-sm text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            />
                          </div>
                        )}

                        <div className="flex gap-3">
                          {parsed.dueDate && (
                            <div>
                              <label className="text-[10px] text-[var(--text-muted)]">Fecha</label>
                              <p className="text-xs text-[var(--text)]">{formatPreviewDate(parsed.dueDate)}</p>
                            </div>
                          )}
                          <div>
                            <label className="text-[10px] text-[var(--text-muted)]">Prioridad</label>
                            <p className="text-xs capitalize text-[var(--text)]">{parsed.priority}</p>
                          </div>
                        </div>

                        {parsed.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {parsed.tags.map((tag) => (
                              <span
                                key={tag}
                                className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => setParsed(null)}
                          className="flex-1 rounded-lg border border-[var(--border)] py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-2)]"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleConfirm}
                          className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2 text-xs font-semibold text-[var(--bg)] hover:opacity-90"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Crear tarea
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
