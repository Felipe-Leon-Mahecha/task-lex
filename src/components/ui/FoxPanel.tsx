import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Mic, MicOff, Check, X, Loader2, ChevronDown, CalendarClock, HelpCircle, ListTree, BatteryCharging, Sparkles, ArrowRight, Zap, Smile, Moon, Target, MessageCircle, Send, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { parseTaskWithAI, type ParsedTask } from '../../lib/ai'
import { planDay, askFox, breakDownTask, energyCheck, coachInsight, chatWithFox, rescheduleOverdue, dailyBriefing, type FoxTaskRef, type PlanBlock, type ChatMessage, type RescheduleItem } from '../../lib/foxAi'
import { isVoiceRecognitionSupported, startVoiceRecognition } from '../../lib/voice'
import { useSectionsStore } from '../../store/sections'
import { useTasksStore } from '../../store/tasks'
import { useSettingsStore } from '../../store/settings'
import { createTask } from '../../lib/tasks'
import { completedTodayCount } from '../../lib/progress'
import { computeAchievementStats } from '../../lib/achievements'
import { startOfDay, sameDay } from '../../lib/dateUtils'
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
import { useFoxSkinsStore } from '../../store/foxSkins'
import { getSkinById } from '../../lib/foxSkins'
import type { Subtask } from '../../types/task'

type FoxMode = 'crear' | 'preguntar' | 'dia' | 'desglosar' | 'energia' | 'coach' | 'chat' | 'reagendar'

const MODES: { id: FoxMode; label: string; icon: typeof Sparkles }[] = [
  { id: 'crear', label: 'Crear tarea', icon: Sparkles },
  { id: 'preguntar', label: 'Preguntar', icon: HelpCircle },
  { id: 'dia', label: 'Mi día', icon: CalendarClock },
  { id: 'desglosar', label: 'Desglosar', icon: ListTree },
  { id: 'energia', label: 'Energía', icon: BatteryCharging },
  { id: 'coach', label: 'Coach', icon: Target },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'reagendar', label: 'Reagendar', icon: RefreshCw },
]

function FoxBubble({ dialogue, direction = 'up', className }: { dialogue: string; direction?: 'up' | 'down'; className?: string }) {
  return (
    <div className={`animate-fox-bubble relative max-w-[300px] min-w-[140px] rounded-full bg-white px-4 py-1.5 text-[12px] leading-normal text-gray-800 shadow-md dark:bg-gray-100 ${className ?? ''}`}>
      {direction === 'down' && <div className="absolute -top-1 left-6 h-2 w-2 rotate-45 bg-white dark:bg-gray-100" />}
      {dialogue}
      {direction === 'up' && <div className="absolute -bottom-1 left-6 h-2 w-2 rotate-45 bg-white dark:bg-gray-100" />}
    </div>
  )
}

export default function FoxPanel() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<FoxMode>('crear')
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

  const [answer, setAnswer] = useState<string>('')
  const [planBlocks, setPlanBlocks] = useState<PlanBlock[]>([])
  const [planSummary, setPlanSummary] = useState<string>('')
  const [breakdownTargetId, setBreakdownTargetId] = useState<string>('')
  const [breakdownPreview, setBreakdownPreview] = useState<Subtask[]>([])
  const [breakdownApplied, setBreakdownApplied] = useState(false)
  const [energyMood, setEnergyMood] = useState<'concentrado' | 'normal' | 'cansado' | null>(null)
  const [energyResult, setEnergyResult] = useState<{ taskId: string | null; message: string } | null>(null)
  const [coachResult, setCoachResult] = useState<{ insight: string; tips: string[] } | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [reschedulePlan, setReschedulePlan] = useState<RescheduleItem[] | null>(null)
  const [rescheduleApplied, setRescheduleApplied] = useState(false)
  const briefingDoneRef = useRef(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)

  const sections = useSectionsStore((s) => s.sections)
  const tasks = useTasksStore((s) => s.tasks)
  const addTask = useTasksStore((s) => s.addTask)
  const updateTask = useTasksStore((s) => s.updateTask)
  const foxEnabled = useSettingsStore((s) => s.foxEnabled)
  const foxRandomMessages = useSettingsStore((s) => s.foxRandomMessages)
  const equipped = useFoxSkinsStore((s) => s.equipped)
  const skinImage = equipped !== 'idle' ? getSkinById(equipped)?.image ?? null : null

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== 'done' && !t.archived),
    [tasks],
  )

  const overdueTasks = useMemo(
    () => activeTasks.filter((t) => t.dueDate && t.dueDate.getTime() < Date.now()),
    [activeTasks],
  )

  const taskRefs: FoxTaskRef[] = useMemo(() => {
    const label = (id: string) => sections.find((s) => s.id === id)?.label ?? id
    return activeTasks.slice(0, 60).map((t) => ({
      id: t.id,
      title: t.title,
      section: label(t.sectionId),
      priority: t.priority,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
    }))
  }, [activeTasks, sections])

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
    if ((open && (mode === 'crear' || mode === 'preguntar')) && inputRef.current) inputRef.current.focus()
  }, [open, mode])

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

  const resetModeResults = () => {
    setError(null)
    setAnswer('')
    setPlanBlocks([])
    setPlanSummary('')
    setBreakdownTargetId('')
    setBreakdownPreview([])
    setBreakdownApplied(false)
    setEnergyMood(null)
    setEnergyResult(null)
    setCoachResult(null)
    setReschedulePlan(null)
    setRescheduleApplied(false)
  }

  const switchMode = (m: FoxMode) => {
    setMode(m)
    resetModeResults()
    setParsed(null)
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

  const handleAsk = async () => {
    const text = prompt.trim()
    if (!text) return
    setLoading(true)
    setError(null)
    setAnswer('')
    updateFox('parsing')
    try {
      const res = await askFox(text, taskRefs, { completadasHoy: completedTodayCount(tasks), pendientes: activeTasks.length })
      setAnswer(res.answer)
      updateFox('done')
    } catch (e) {
      updateFox('error')
      setError(e instanceof Error ? e.message : 'Error al preguntar')
    } finally {
      setLoading(false)
    }
  }

  const handlePlan = async () => {
    if (activeTasks.length === 0) {
      setError('No tienes tareas pendientes. ¡A descansar!')
      return
    }
    setLoading(true)
    setError(null)
    setPlanBlocks([])
    setPlanSummary('')
    updateFox('parsing')
    try {
      const res = await planDay(taskRefs)
      const map = new Map(activeTasks.map((t) => [t.id, t]))
      setPlanBlocks(res.plan.filter((b) => map.has(b.taskId)).sort((a, b) => a.startTime.localeCompare(b.startTime)))
      setPlanSummary(res.summary)
      updateFox('done')
    } catch (e) {
      updateFox('error')
      setError(e instanceof Error ? e.message : 'Error al planificar')
    } finally {
      setLoading(false)
    }
  }

  const handleBreakdown = async () => {
    const target = tasks.find((t) => t.id === breakdownTargetId)
    if (!target) {
      setError('Elige primero una tarea')
      return
    }
    setLoading(true)
    setError(null)
    setBreakdownPreview([])
    setBreakdownApplied(false)
    updateFox('parsing')
    try {
      const res = await breakDownTask(target.title, target.description)
      setBreakdownPreview(res.subtasks.map((text, i) => ({ id: `${target.id}-fox-${Date.now()}-${i}`, text, done: false })))
      updateFox('done')
    } catch (e) {
      updateFox('error')
      setError(e instanceof Error ? e.message : 'Error al desglosar')
    } finally {
      setLoading(false)
    }
  }

  const applyBreakdown = () => {
    const target = tasks.find((t) => t.id === breakdownTargetId)
    if (!target || breakdownPreview.length === 0) return
    updateTask(target.id, { subtasks: [...(target.subtasks ?? []), ...breakdownPreview] })
    setBreakdownApplied(true)
    updateFox('completed')
  }

  const handleEnergy = async (mood: 'concentrado' | 'normal' | 'cansado') => {
    if (activeTasks.length === 0) {
      setError('No tienes tareas pendientes para sugerirte')
      return
    }
    setEnergyMood(mood)
    setLoading(true)
    setError(null)
    setEnergyResult(null)
    updateFox('parsing')
    try {
      const res = await energyCheck(mood, taskRefs)
      setEnergyResult(res)
      updateFox('done')
    } catch (e) {
      updateFox('error')
      setError(e instanceof Error ? e.message : 'Error en el check-in')
    } finally {
      setLoading(false)
    }
  }

  const goSuggestedTask = () => {
    const target = energyResult?.taskId ? tasks.find((t) => t.id === energyResult.taskId) : null
    if (!target) return
    setOpen(false)
    navigate(`/s/${target.sectionId}`)
  }

  const coachStats = useMemo(() => {
    const base = computeAchievementStats(tasks)
    const last7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() - (6 - i))
      return startOfDay(d)
    })
    const dayCounts = last7.map((d) => ({
      fecha: format(d, 'yyyy-MM-dd'),
      completadas: tasks.filter((t) => t.status === 'done' && t.completedAt && sameDay(t.completedAt, d)).length,
    }))
    const hourCounts = new Map<number, number>()
    for (const t of tasks) {
      if (t.status !== 'done' || !t.completedAt) continue
      const h = new Date(t.completedAt).getHours()
      hourCounts.set(h, (hourCounts.get(h) ?? 0) + 1)
    }
    let bestHour: number | null = null
    let bestHourCount = 0
    for (const [h, n] of hourCounts) {
      if (n > bestHourCount) { bestHour = h; bestHourCount = n }
    }
    return {
      ...base,
      completadasHoy: completedTodayCount(tasks),
      pendientes: activeTasks.length,
      ultimos7dias: dayCounts,
      horaMasProductiva: bestHour,
    }
  }, [tasks, activeTasks.length])

  const handleCoach = async () => {
    setLoading(true)
    setError(null)
    setCoachResult(null)
    updateFox('parsing')
    try {
      const res = await coachInsight(coachStats)
      setCoachResult(res)
      updateFox('done')
    } catch (e) {
      updateFox('error')
      setError(e instanceof Error ? e.message : 'Error en el coaching')
    } finally {
      setLoading(false)
    }
  }

  const handleChatSend = async () => {
    const text = chatInput.trim()
    if (!text || loading) return
    const history: ChatMessage[] = [...chatMessages, { role: 'user', text }]
    setChatMessages(history)
    setChatInput('')
    setLoading(true)
    setError(null)
    updateFox('parsing')
    try {
      const res = await chatWithFox(history.slice(-12), taskRefs, coachStats)
      setChatMessages([...history, { role: 'fox', text: res.reply }])
      updateFox('done')
    } catch (e) {
      updateFox('error')
      setChatMessages([...history, { role: 'fox', text: 'Uy, se me enredaron las colas. Intenta de nuevo.' }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (mode === 'chat') chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMessages, mode])

  const handleReschedule = async () => {
    if (overdueTasks.length === 0) return
    setLoading(true)
    setError(null)
    setReschedulePlan(null)
    setRescheduleApplied(false)
    updateFox('parsing')
    try {
      const refs = overdueTasks.slice(0, 30).map((t) => ({
        id: t.id,
        title: t.title,
        section: sections.find((s) => s.id === t.sectionId)?.label ?? t.sectionId,
        priority: t.priority,
        dueDate: t.dueDate!.toISOString(),
      }))
      const res = await rescheduleOverdue(refs)
      const validIds = new Set(overdueTasks.map((t) => t.id))
      setReschedulePlan(res.plan.filter((p) => validIds.has(p.taskId)))
      updateFox('done')
    } catch (e) {
      updateFox('error')
      setError(e instanceof Error ? e.message : 'Error al reagendar')
    } finally {
      setLoading(false)
    }
  }

  const applyReschedule = () => {
    if (!reschedulePlan) return
    for (const item of reschedulePlan) {
      updateTask(item.taskId, { dueDate: new Date(item.newDueDate) })
    }
    setRescheduleApplied(true)
    updateFox('completed')
  }

  useEffect(() => {
    if (!foxEnabled || briefingDoneRef.current || tasks.length === 0) return
    const today = new Date().toISOString().slice(0, 10)
    let last = ''
    try { last = localStorage.getItem('task-lex-briefing-date') ?? '' } catch {}
    if (last === today) return
    briefingDoneRef.current = true
    try { localStorage.setItem('task-lex-briefing-date', today) } catch {}
    const vencidas = overdueTasks.length
    const stats = {
      pendientes: activeTasks.length,
      vencidas,
      completadasHoy: completedTodayCount(tasks),
      racha: computeAchievementStats(tasks).streakDays,
      primeraTarea: activeTasks
        .filter((t) => t.dueDate && t.dueDate.getTime() > Date.now())
        .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0]?.title ?? null,
    }
    dailyBriefing(stats)
      .then((res) => {
        setFoxDialogue(res.message)
        setShowBubble(true)
        if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
        bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 9000)
      })
      .catch(() => {})
  }, [foxEnabled, tasks, activeTasks, overdueTasks])

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
      if (mode === 'crear') parsed ? handleConfirm() : handleParse()
      if (mode === 'preguntar') handleAsk()
    }
  }

  const formatPreviewDate = (iso: string) => {
    try { return format(new Date(iso), "d 'de' MMMM 'a las' HH:mm", { locale: es }) }
    catch { return iso }
  }

  const selectedSection = sections.find((s) => s.id === sectionId)
  const breakdownTarget = tasks.find((t) => t.id === breakdownTargetId)

  if (!foxEnabled) return null

  return (
    <>
      <div className="fixed bottom-20 right-2 z-50 md:bottom-6 md:right-4">
        <div className="relative">
          {showBubble && foxDialogue && !open && (
            <div className="absolute -top-[72px] -left-2 z-10" style={{ overflow: 'visible' }}>
              <FoxBubble dialogue={foxDialogue} direction="down" />
            </div>
          )}
          <button
            onClick={() => setOpen(true)}
            className="block transition-transform hover:scale-110 active:scale-95"
            aria-label="Fox - Asistente"
          >
            {foxContext && (
              <img
                src={skinImage ?? foxContext.image}
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
              <div className="absolute -top-20 left-1/2 z-20 -translate-x-1/2" style={{ overflow: 'visible' }}>
                {showBubble && foxDialogue && (
                  <div className="absolute -top-14 left-1/2 z-30 -translate-x-1/2" style={{ overflow: 'visible' }}>
                    <FoxBubble dialogue={foxDialogue} direction="down" />
                  </div>
                )}
                <img
                  src={skinImage ?? foxContext.image}
                  alt={foxContext.label}
                  className="h-24 w-24 drop-shadow-xl md:h-20 md:w-20"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}

            {created ? (
              <div className="flex flex-col items-center gap-3 pt-28 pb-8">
                {foxContext && (
                  <img
                    src={skinImage ?? foxContext.image}
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
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 pt-24">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">Fox</span>
                    <span className="text-[11px] text-[var(--text-muted)]">tu asistente</span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex gap-1.5 overflow-x-auto border-b border-[var(--border)] px-3 py-2">
                  {MODES.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => switchMode(id)}
                      className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                        mode === id
                          ? 'bg-[var(--accent)] text-[var(--bg)]'
                          : 'bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text)]'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>

                <div className="max-h-[55vh] overflow-y-auto p-4">
                  {(mode === 'crear' || mode === 'preguntar') && (
                    <>
                      <textarea
                        ref={inputRef}
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={mode === 'crear' ? 'Ej: "Recordarme comprar harina mañana a las 4pm"' : 'Ej: "¿Qué tengo pendiente esta semana?"'}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      />

                      <div className="mt-3 flex items-center gap-2">
                        {mode === 'crear' && (
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
                        )}

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
                          onClick={mode === 'crear' ? handleParse : handleAsk}
                          disabled={!prompt.trim() || loading}
                          className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 py-1.5 text-xs font-semibold text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
                        >
                          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                          {loading ? 'Fox pensando...' : mode === 'crear' ? 'Analizar' : 'Preguntar'}
                        </button>
                      </div>

                      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                    </>
                  )}

                  {mode === 'crear' && parsed && (
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

                  {mode === 'preguntar' && answer && (
                    <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Fox responde</p>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--text)]">{answer}</p>
                    </div>
                  )}

                  {mode === 'dia' && (
                    <div className="space-y-3">
                      <button
                        onClick={handlePlan}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarClock className="h-4 w-4" />}
                        {loading ? 'Organizando tu día...' : 'Organiza mi día'}
                      </button>
                      {error && <p className="text-xs text-red-500">{error}</p>}
                      {planSummary && (
                        <div className="rounded-xl bg-[var(--accent)]/10 p-3 text-xs font-medium leading-relaxed text-[var(--text)]">
                          {planSummary}
                        </div>
                      )}
                      {planBlocks.map((b) => {
                        const task = tasks.find((t) => t.id === b.taskId)
                        if (!task) return null
                        return (
                          <div key={b.taskId + b.startTime} className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                            <div className="shrink-0 rounded-lg bg-[var(--surface-2)] px-2 py-1 text-center">
                              <p className="text-[11px] font-bold text-[var(--accent)]">{b.startTime}</p>
                              <p className="text-[9px] text-[var(--text-muted)]">{b.endTime}</p>
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-semibold text-[var(--text)]">{task.title}</p>
                              <p className="text-[11px] leading-snug text-[var(--text-muted)]">{b.reason}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {mode === 'desglosar' && (
                    <div className="space-y-3">
                      <select
                        value={breakdownTargetId}
                        onChange={(e) => { setBreakdownTargetId(e.target.value); setBreakdownPreview([]); setBreakdownApplied(false); setError(null) }}
                        className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                      >
                        <option value="">Elige una tarea...</option>
                        {activeTasks.slice(0, 50).map((t) => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleBreakdown}
                        disabled={!breakdownTargetId || loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListTree className="h-4 w-4" />}
                        {loading ? 'Dividiendo...' : 'Desglosar con IA'}
                      </button>
                      {error && <p className="text-xs text-red-500">{error}</p>}
                      {breakdownPreview.length > 0 && breakdownTarget && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                            Para "{breakdownTarget.title}"
                          </p>
                          <ul className="space-y-1.5">
                            {breakdownPreview.map((s) => (
                              <li key={s.id} className="flex items-start gap-2 text-xs text-[var(--text)]">
                                <Check className="mt-0.5 h-3 w-3 shrink-0 text-[var(--accent)]" />
                                {s.text}
                              </li>
                            ))}
                          </ul>
                          {breakdownApplied ? (
                            <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-[var(--accent)]">
                              <Check className="h-3.5 w-3.5" /> Subtareas agregadas
                            </p>
                          ) : (
                            <button onClick={applyBreakdown} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2 text-xs font-bold text-[var(--bg)] hover:opacity-90">
                              Agregar {breakdownPreview.length} subtareas
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {mode === 'energia' && (
                    <div className="space-y-3">
                      <p className="text-center text-xs text-[var(--text-muted)]">¿Cómo te sientes hoy?</p>
                      <div className="grid grid-cols-3 gap-2">
                        {([
                          { mood: 'concentrado', label: 'Concentrado', icon: Zap },
                          { mood: 'normal', label: 'Normal', icon: Smile },
                          { mood: 'cansado', label: 'Cansado', icon: Moon },
                        ] as const).map(({ mood, label, icon: Icon }) => (
                          <button
                            key={mood}
                            onClick={() => handleEnergy(mood)}
                            disabled={loading}
                            className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all active:scale-95 disabled:opacity-50 ${
                              energyMood === mood
                                ? 'border-[var(--accent)] bg-[var(--accent)]/10'
                                : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50'
                            }`}
                          >
                            <Icon className="h-5 w-5 text-[var(--accent)]" />
                            <span className="text-[11px] font-semibold text-[var(--text)]">{label}</span>
                          </button>
                        ))}
                      </div>
                      {loading && (
                        <p className="flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fox está eligiendo...
                        </p>
                      )}
                      {error && <p className="text-center text-xs text-red-500">{error}</p>}
                      {energyResult && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
                          {energyResult.taskId && (() => {
                            const suggested = tasks.find((t) => t.id === energyResult.taskId)
                            return suggested ? (
                              <>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Fox sugiere</p>
                                <p className="mt-1 text-sm font-bold text-[var(--text)]">{suggested.title}</p>
                                <p className="mt-2 text-xs leading-relaxed text-[var(--text-muted)]">{energyResult.message}</p>
                                <button onClick={goSuggestedTask} className="mx-auto mt-3 flex items-center gap-1 rounded-full bg-[var(--accent)] px-4 py-1.5 text-xs font-bold text-[var(--bg)] hover:opacity-90">
                                  Ver tarea <ArrowRight className="h-3 w-3" />
                                </button>
                              </>
                            ) : (
                              <p className="text-sm text-[var(--text)]">{energyResult.message}</p>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )}
                  {mode === 'coach' && (
                    <div className="space-y-3">
                      <button
                        onClick={handleCoach}
                        disabled={loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Target className="h-4 w-4" />}
                        {loading ? 'Analizando tus patrones...' : coachResult ? 'Analizar de nuevo' : 'Analiza mis patrones'}
                      </button>
                      {error && <p className="text-xs text-red-500">{error}</p>}
                      {coachResult && (
                        <div className="space-y-2">
                          <div className="rounded-xl bg-[var(--accent)]/10 p-3">
                            <p className="text-sm font-medium leading-relaxed text-[var(--text)]">{coachResult.insight}</p>
                          </div>
                          {coachResult.tips.map((tip, i) => (
                            <div key={i} className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--accent)]/15 text-[10px] font-extrabold text-[var(--accent)]">{i + 1}</span>
                              <p className="text-xs leading-relaxed text-[var(--text)]">{tip}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {mode === 'chat' && (
                    <div className="space-y-3">
                      <div className="flex max-h-[38vh] min-h-[120px] flex-col gap-2 overflow-y-auto">
                        {chatMessages.length === 0 && (
                          <p className="py-4 text-center text-xs leading-relaxed text-[var(--text-muted)]">
                            Habla con Fox de lo que quieras: tus tareas, ideas o cómo va tu día
                          </p>
                        )}
                        {chatMessages.map((m, i) => (
                          <div key={i} className={`max-w-[85%] whitespace-pre-wrap rounded-xl px-3 py-2 text-xs leading-relaxed ${
                            m.role === 'user'
                              ? 'self-end rounded-br-sm bg-[var(--accent)] text-[var(--bg)]'
                              : 'self-start rounded-bl-sm border border-[var(--border)] bg-[var(--surface)] text-[var(--text)]'
                          }`}>
                            {m.text}
                          </div>
                        ))}
                        {loading && mode === 'chat' && (
                          <div className="self-start rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--text-muted)]" />
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </div>
                      <div className="flex items-end gap-2">
                        <textarea
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleChatSend()
                            }
                          }}
                          placeholder='Ej: "¿Por dónde empiezo hoy?"'
                          rows={1}
                          className="max-h-24 flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                        />
                        <button
                          onClick={handleChatSend}
                          disabled={!chatInput.trim() || loading}
                          className="rounded-xl bg-[var(--accent)] p-2.5 text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
                          aria-label="Enviar"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                      {error && <p className="text-xs text-red-500">{error}</p>}
                    </div>
                  )}

                  {mode === 'reagendar' && (
                    <div className="space-y-3">
                      {overdueTasks.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-6 text-center">
                          <Check className="h-8 w-8 text-[var(--accent)]" />
                          <p className="text-sm font-semibold text-[var(--text)]">No tienes tareas vencidas</p>
                          <p className="text-xs text-[var(--text-muted)]">¡Todo al día! Fox no tiene nada que reagendar</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-center text-xs text-[var(--text-muted)]">
                            Tienes {overdueTasks.length} tarea{overdueTasks.length === 1 ? '' : 's'} vencida{overdueTasks.length === 1 ? '' : 's'}. Fox te ayuda a reorganizarla{overdueTasks.length === 1 ? '' : 's'}.
                          </p>
                          {!rescheduleApplied && (
                            <button
                              onClick={handleReschedule}
                              disabled={loading}
                              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] py-2.5 text-xs font-bold text-[var(--bg)] hover:opacity-90 disabled:opacity-50"
                            >
                              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                              {loading ? 'Reorganizando...' : reschedulePlan ? 'Reagendar de nuevo' : 'Reagendar con IA'}
                            </button>
                          )}
                          {error && <p className="text-xs text-red-500">{error}</p>}
                          {reschedulePlan && !rescheduleApplied && (
                            <div className="space-y-2">
                              {reschedulePlan.map((item) => {
                                const task = tasks.find((t) => t.id === item.taskId)
                                if (!task?.dueDate) return null
                                return (
                                  <div key={item.taskId} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                                    <p className="truncate text-xs font-semibold text-[var(--text)]">{task.title}</p>
                                    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                                      <span className="line-through text-red-400">{format(task.dueDate, "d MMM HH:mm", { locale: es })}</span>
                                      <ArrowRight className="h-3 w-3 shrink-0 text-[var(--text-muted)]" />
                                      <span className="font-semibold text-[var(--accent)]">{format(new Date(item.newDueDate), "d MMM HH:mm", { locale: es })}</span>
                                    </div>
                                    <p className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">{item.reason}</p>
                                  </div>
                                )
                              })}
                              <button onClick={applyReschedule} className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2.5 text-xs font-bold text-[var(--bg)] hover:opacity-90">
                                <Check className="h-3.5 w-3.5" />
                                Aplicar cambios
                              </button>
                            </div>
                          )}
                          {rescheduleApplied && (
                            <p className="flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent)]/10 py-3 text-xs font-semibold text-[var(--accent)]">
                              <Check className="h-4 w-4" /> Fechas actualizadas
                            </p>
                          )}
                        </>
                      )}
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
