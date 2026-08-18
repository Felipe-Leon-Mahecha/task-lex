import { useState, useRef, useEffect, useCallback } from 'react'
import { Mic, MicOff, Check, X, Loader2, ChevronDown } from 'lucide-react'
import { parseTaskWithAI, type ParsedTask } from '../../lib/ai'
import { isVoiceRecognitionSupported, startVoiceRecognition } from '../../lib/voice'
import { useSectionsStore } from '../../store/sections'
import { useTasksStore } from '../../store/tasks'
import { useSettingsStore } from '../../store/settings'
import { createTask } from '../../lib/tasks'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  getFoxState,
  getFoxStateForContext,
  setFoxProcessingStart,
  clearFoxProcessingStart,
  recordAppOpen,
  type FoxStateConfig,
} from '../../lib/fox'

function FoxBubble({ dialogue, className }: { dialogue: string; className?: string }) {
  return (
    <div className={`animate-fox-bubble relative max-w-[220px] rounded-2xl rounded-bl-sm bg-white px-3 py-2 text-xs leading-relaxed text-gray-800 shadow-md dark:bg-gray-100 ${className ?? ''}`}>
      <div className="absolute -bottom-1 left-2 h-2 w-2 rotate-45 bg-white dark:bg-gray-100" />
      {dialogue}
    </div>
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
  const [foxContext, setFoxContext] = useState<FoxStateConfig | null>(null)
  const [foxDialogue, setFoxDialogue] = useState('')
  const [showBubble, setShowBubble] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const sections = useSectionsStore((s) => s.sections)
  const addTask = useTasksStore((s) => s.addTask)
  const foxEnabled = useSettingsStore((s) => s.foxEnabled)
  const foxRandomMessages = useSettingsStore((s) => s.foxRandomMessages)

  const showFoxMessage = useCallback(() => {
    const { state, dialogue } = getFoxState()
    setFoxContext(state)
    setFoxDialogue(dialogue)
    setShowBubble(true)
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 6000)
  }, [])

  useEffect(() => {
    recordAppOpen()
    const { state, dialogue } = getFoxState()
    setFoxContext(state)
    setFoxDialogue(dialogue)
    setShowBubble(true)
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 5000)
    return () => { if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current) }
  }, [])

  useEffect(() => {
    if (!foxRandomMessages || !foxEnabled || open) return
    const interval = setInterval(() => {
      showFoxMessage()
    }, 90_000 + Math.random() * 60_000)
    return () => clearInterval(interval)
  }, [foxRandomMessages, foxEnabled, open, showFoxMessage])

  useEffect(() => {
    if (open) setShowBubble(true)
  }, [open])

  useEffect(() => {
    if (open && inputRef.current) inputRef.current.focus()
  }, [open])

  useEffect(() => {
    if (sections.length > 0 && !sectionId) setSectionId(sections[0].id)
  }, [sections, sectionId])

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const updateFox = (context: 'parsing' | 'processing' | 'done' | 'error' | 'completed') => {
    const { state, dialogue } = getFoxStateForContext(context)
    setFoxContext(state)
    setFoxDialogue(dialogue)
    setShowBubble(true)
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 6000)
  }

  const handleParse = async () => {
    const text = prompt.trim()
    if (!text) return
    setLoading(true)
    setError(null)
    setParsed(null)
    updateFox('parsing')
    setFoxProcessingStart()
    try {
      const result = await parseTaskWithAI(text)
      setParsed(result)
      clearFoxProcessingStart()
      updateFox('done')
    } catch (e) {
      clearFoxProcessingStart()
      updateFox('error')
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
    } catch {} finally {
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
    updateFox('completed')
    setTimeout(() => {
      setOpen(false)
      setPrompt('')
      setParsed(null)
      setCreated(false)
      setError(null)
      const { state, dialogue } = getFoxState()
      setFoxContext(state)
      setFoxDialogue(dialogue)
    }, 1500)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      parsed ? handleConfirm() : handleParse()
    }
  }

  const formatPreviewDate = (iso: string) => {
    try { return format(new Date(iso), "d 'de' MMMM 'a las' HH:mm", { locale: es }) }
    catch { return iso }
  }

  const selectedSection = sections.find((s) => s.id === sectionId)

  if (!foxEnabled) return null

  return (
    <>
      <div className="fixed bottom-20 right-2 z-50 md:bottom-6 md:right-4">
        <div className="relative">
          {showBubble && foxDialogue && !open && (
            <div className="absolute -top-14 right-0 z-10" style={{ overflow: 'visible' }}>
              <FoxBubble dialogue={foxDialogue} />
            </div>
          )}
          <button
            onClick={() => setOpen(true)}
            className="block transition-transform hover:scale-110 active:scale-95"
            aria-label="Fox - Asistente"
          >
            {foxContext && (
              <img
                src={foxContext.image}
                alt={foxContext.label}
                className="h-20 w-20 drop-shadow-lg md:h-16 md:w-16"
                style={{ objectFit: 'contain' }}
              />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div
            ref={panelRef}
            className="relative w-full max-w-md overflow-visible rounded-2xl border border-[var(--border)] bg-[var(--bg)] shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
          >
            {foxContext && (
              <div className="absolute -top-16 left-1/2 z-20 -translate-x-1/2" style={{ overflow: 'visible' }}>
                <img
                  src={foxContext.image}
                  alt={foxContext.label}
                  className="h-24 w-24 drop-shadow-xl md:h-20 md:w-20"
                  style={{ objectFit: 'contain' }}
                />
                {showBubble && foxDialogue && (
                  <div className="absolute -top-14 left-1/2 z-30 -translate-x-1/2" style={{ overflow: 'visible' }}>
                    <FoxBubble dialogue={foxDialogue} />
                  </div>
                )}
              </div>
            )}

            {created ? (
              <div className="flex flex-col items-center gap-3 pt-24 pb-8">
                {foxContext && (
                  <img
                    src={foxContext.image}
                    alt={foxContext.label}
                    className="h-20 w-20"
                    style={{ objectFit: 'contain' }}
                  />
                )}
                {foxDialogue && <FoxBubble dialogue={foxDialogue} />}
                <p className="text-sm font-semibold">Fox creó tu tarea</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 pt-20">
                  <div className="flex items-center gap-2">
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
                              onClick={() => { setSectionId(s.id); setShowSectionPicker(false) }}
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
                      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                      {loading ? 'Fox pensando...' : 'Analizar'}
                    </button>
                  </div>

                  {error && <p className="mt-2 text-xs text-red-500">{error}</p>}

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
                              <span key={tag} className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] text-[var(--text-muted)]">{tag}</span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button onClick={() => setParsed(null)} className="flex-1 rounded-lg border border-[var(--border)] py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--surface-2)]">Cancelar</button>
                        <button onClick={handleConfirm} className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2 text-xs font-semibold text-[var(--bg)] hover:opacity-90">
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
