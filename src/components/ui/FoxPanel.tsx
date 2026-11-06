import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Mic, MicOff, Check, X, Loader2, ChevronDown, CalendarClock, HelpCircle, ListTree, BatteryCharging, Sparkles, ArrowRight, Zap, Smile, Moon, Target, MessageCircle, Send, RefreshCw, Flame, ListTodo, CalendarPlus, Crown, Pin, PinOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { parseTaskWithAI, type ParsedTask } from '../../lib/ai'
import { planDay, askFox, breakDownTask, energyCheck, coachInsight, chatWithFox, rescheduleOverdue, dailyBriefing, type FoxTaskRef, type PlanBlock, type ChatMessage, type RescheduleItem, type AssistantAction } from '../../lib/foxAi'
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
import { useAuthStore } from '../../store/auth'
import { useNotesStore } from '../../store/notes'
import { ADMIN_EMAIL } from '../../lib/appInfo'
import { fetchCalendarEvents } from '../../lib/calendar'
import type { CalendarEvent } from '@ebarooni/capacitor-calendar'
import { getSkinById, getDefaultSkin } from '../../lib/foxSkins'
import QuackingtonSkinPet from '../pet/QuackingtonSkinPet'
import PetSpeechBubble from '../pet/PetSpeechBubble'
import { pickQuackingtonLine } from '../../lib/quackington'
import { getQuackingtonSkinById, pickQuackingtonSkinLine } from '../../lib/quackingtonSkins'
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

function FoxBubble({ dialogue, direction = 'up', align = 'center', className }: { dialogue: string; direction?: 'up' | 'down'; align?: 'left' | 'center' | 'right'; className?: string }) {
  return <PetSpeechBubble placement={direction === 'up' ? 'above' : 'below'} align={align} className={className}>{dialogue}</PetSpeechBubble>
}

function DuckBubble({ tick, skinId, direction = 'up' }: { tick: string; skinId: string; direction?: 'up' | 'down' }) {
  const line = useMemo(() => skinId === 'animado' ? pickQuackingtonLine('idle') : pickQuackingtonSkinLine(skinId), [tick, skinId])
  return <FoxBubble dialogue={line} direction={direction} />
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
  const [pendingActions, setPendingActions] = useState<AssistantAction[]>([])
  const [actionNotice, setActionNotice] = useState('')
  const [reschedulePlan, setReschedulePlan] = useState<RescheduleItem[] | null>(null)
  const [rescheduleApplied, setRescheduleApplied] = useState(false)
  const [freeTab, setFreeTab] = useState<'paywall' | 'basico'>('paywall')
  const [rescheduleLocalApplied, setRescheduleLocalApplied] = useState(false)
  const [calEvents, setCalEvents] = useState<CalendarEvent[] | null>(null)
  const [calUnavailable, setCalUnavailable] = useState(false)
  const [calLoading, setCalLoading] = useState(false)
  const [calSelected, setCalSelected] = useState<Record<string, boolean>>({})
  const [calImported, setCalImported] = useState(0)
  const briefingDoneRef = useRef(false)
  const floatingPetRef = useRef<HTMLDivElement>(null)
  const petDragRef = useRef<{ id: number; startX: number; startY: number; x: number; y: number; currentX: number; currentY: number; moved: boolean } | null>(null)
  const suppressPetClickRef = useRef(false)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const chatEndRef = useRef<HTMLDivElement>(null)
  const busyRef = useRef(false)

  const sections = useSectionsStore((s) => s.sections)
  const addSection = useSectionsStore((s) => s.addSection)
  const renameSection = useSectionsStore((s) => s.renameSection)
  const tasks = useTasksStore((s) => s.tasks)
  const addTask = useTasksStore((s) => s.addTask)
  const updateTask = useTasksStore((s) => s.updateTask)
  const notes = useNotesStore((s) => s.notes)
  const noteFolders = useNotesStore((s) => s.folders)
  const createNote = useNotesStore((s) => s.createNote)
  const updateNote = useNotesStore((s) => s.updateNote)
  const foxEnabled = useSettingsStore((s) => s.foxEnabled)
  const foxRandomMessages = useSettingsStore((s) => s.foxRandomMessages)
  const petQuotes = useSettingsStore((s) => s.petQuotes)
  const petAnchored = useSettingsStore((s) => s.petAnchored)
  const petPosition = useSettingsStore((s) => s.petPosition)
  const setPetAnchored = useSettingsStore((s) => s.setPetAnchored)
  const setPetPosition = useSettingsStore((s) => s.setPetPosition)
  const [floatingPetPosition, setFloatingPetPosition] = useState(petPosition)
  const equipped = useFoxSkinsStore((s) => s.equipped)
  const pet = useFoxSkinsStore((s) => s.pet)
  const quackingtonSkin = useFoxSkinsStore((s) => s.quackingtonSkin)
  const unlockedFoxSkins = useFoxSkinsStore((s) => s.unlocked)
  const unlockedDuckSkins = useFoxSkinsStore((s) => s.quackingtonSkinsUnlocked)
  const quackingtonOwned = useFoxSkinsStore((s) => s.quackingtonOwned)
  const equipSkin = useFoxSkinsStore((s) => s.equipSkin)
  const equipQuackingtonSkin = useFoxSkinsStore((s) => s.equipQuackingtonSkin)
  const setPet = useFoxSkinsStore((s) => s.setPet)
  const premium = useFoxSkinsStore((s) => s.premium)
  const user = useAuthStore((s) => s.user)
  const skinImage = getSkinById(equipped)?.image ?? getDefaultSkin().image

  const canUseAI = premium || user?.email === ADMIN_EMAIL

  const activeTasks = useMemo(
    () => tasks.filter((t) => t.status !== 'done' && !t.archived),
    [tasks],
  )

  const overdueTasks = useMemo(
    () => activeTasks.filter((t) => t.dueDate && t.dueDate.getTime() < Date.now()),
    [activeTasks],
  )

  const pendientesHoy = useMemo(
    () => activeTasks.filter((t) => t.dueDate && sameDay(t.dueDate, new Date())).length,
    [activeTasks],
  )

  const proximaTarea = useMemo(() => {
    const inicio = startOfDay(new Date())
    return activeTasks
      .filter((t) => t.dueDate && t.dueDate.getTime() >= inicio.getTime())
      .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())[0] ?? null
  }, [activeTasks])

  const taskRefs: FoxTaskRef[] = useMemo(() => {
    const label = (id: string) => sections.find((s) => s.id === id)?.label ?? id
    return activeTasks.slice(0, 60).map((t) => ({
      id: t.id,
      title: t.title,
      section: label(t.sectionId),
      sectionId: t.sectionId,
      priority: t.priority,
      dueDate: t.dueDate ? new Date(t.dueDate).toISOString() : null,
    }))
  }, [activeTasks, sections])

  const chatAppContext = () => {
    const plain = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()
    let weekBlocks: unknown[] = []
    try {
      const raw = localStorage.getItem(`quacker-weekly-routine:${user?.uid ?? 'local'}`)
      const parsed = raw ? JSON.parse(raw) : []
      if (Array.isArray(parsed)) weekBlocks = parsed.slice(0, 40)
    } catch {}
    return {
      sections: sections.slice(0, 30).map((s) => ({ id: s.id, label: s.label })),
      notes: notes.filter((n) => !n.privateNote && !n.privateData).slice(0, 30).map((n) => ({ id: n.id, title: n.title, folderId: n.folderId, content: n.blocks.map((b) => plain(b.html)).join('\n').slice(0, 700) })),
      folders: noteFolders.slice(0, 30).map((f) => ({ id: f.id, name: f.name })),
      weekBlocks,
      skins: {
        fox: unlockedFoxSkins,
        quackington: unlockedDuckSkins,
        quackingtonOwned,
        activePet: pet,
      },
    }
  }

  const showFoxMessage = useCallback(() => {
    if (!petQuotes) return
    const { state, dialogue } = getFoxState()
    setFoxContext(state)
    setFoxDialogue(dialogue)
    setShowBubble(true)
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 6000)
  }, [petQuotes])

  useEffect(() => {
    recordAppOpen()
    const { state, dialogue } = getFoxState()
    setFoxContext(state)
    setFoxDialogue(dialogue)
    if (!petQuotes) return
    setShowBubble(true)
    bubbleTimerRef.current = setTimeout(() => setShowBubble(false), 5000)
    return () => { if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current) }
  }, [petQuotes])

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
    if (!text || busyRef.current) return
    busyRef.current = true
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
      busyRef.current = false
      setLoading(false)
    }
  }

  const handleAsk = async () => {
    const text = prompt.trim()
    if (!text || busyRef.current) return
    busyRef.current = true
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
      busyRef.current = false
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
    if (!text || loading || busyRef.current) return
    busyRef.current = true
    const history: ChatMessage[] = [...chatMessages, { role: 'user', text }]
    setChatMessages(history)
    setChatInput('')
    setLoading(true)
    setError(null)
    updateFox('parsing')
    try {
      const res = await chatWithFox(history.slice(-12), taskRefs, coachStats, pet, mascotName, chatAppContext())
      setChatMessages([...history, { role: 'fox', text: res.reply }])
      setPendingActions(res.actions)
      setActionNotice('')
      updateFox('done')
    } catch (e) {
      updateFox('error')
      const msg = e instanceof Error ? e.message : ''
      setChatMessages([
        ...history,
        {
          role: 'fox',
          text: /premium/i.test(msg)
            ? 'Esta función es de Quacker Premium. Desbloquéala en la tienda para seguir conversando conmigo.'
            : msg
              ? `No pude conectarme: ${msg}`
              : 'Uy, se me enredaron las colas. Intenta de nuevo.',
        },
      ])
    } finally {
      busyRef.current = false
      setLoading(false)
    }
  }

  const applyChatActions = () => {
    let applied = 0
    const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
    for (const action of pendingActions) {
      const title = action.title?.trim().slice(0, 120) ?? ''
      const content = action.content?.trim().slice(0, 5000) ?? ''
      const existingTask = action.targetId ? tasks.find((t) => t.id === action.targetId && !t.archived) : undefined
      const existingNote = action.targetId ? notes.find((n) => n.id === action.targetId && !n.privateNote && !n.privateData) : undefined
      const date = action.dueDate ? new Date(action.dueDate) : null
      switch (action.type) {
        case 'create_task': {
          const section = sections.find((s) => s.id === action.sectionId) ?? sections[0]
          if (!title || !section || (action.dueDate && (!date || Number.isNaN(date.getTime())))) continue
          addTask(createTask(section.id, { title, description: (action.description ?? '').slice(0, 1000), dueDate: date, priority: action.priority ?? 'media', status: 'pending', recurrence: 'none', focusDay: false, reminderLead: null, reminder2HoursBefore: false, subtasks: [], notesLinks: [], images: [], tags: [] }))
          applied++; break
        }
        case 'update_task': {
          if (!existingTask || (action.sectionId && !sections.some((s) => s.id === action.sectionId))) continue
          const patch: Record<string, unknown> = {}
          if (title) patch.title = title
          if (action.description !== undefined) patch.description = action.description.slice(0, 1000)
          if (action.priority) patch.priority = action.priority
          if (action.dueDate !== undefined) {
            if (action.dueDate && (!date || Number.isNaN(date.getTime()))) continue
            patch.dueDate = date
          }
          if (action.sectionId) patch.sectionId = action.sectionId
          if (!Object.keys(patch).length) continue
          updateTask(existingTask.id, patch); applied++; break
        }
        case 'create_note': {
          if (!title || (action.folderId && !noteFolders.some((f) => f.id === action.folderId))) continue
          const note = createNote(action.folderId || null)
          updateNote(note.id, { title, blocks: [{ id: note.blocks[0].id, type: 'text', html: `<p>${escapeHtml(content || action.description || '')}</p>`, checked: false }] })
          applied++; break
        }
        case 'update_note': {
          if (!existingNote || (!title && !content)) continue
          updateNote(existingNote.id, { ...(title ? { title } : {}), ...(content ? { blocks: [{ id: existingNote.blocks[0]?.id ?? crypto.randomUUID(), type: 'text', html: `<p>${escapeHtml(content)}</p>`, checked: false }] } : {}) })
          applied++; break
        }
        case 'create_section': {
          if (!title || sections.some((section) => section.label.trim().toLowerCase() === title.toLowerCase())) continue
          addSection(title, (action.icon || 'ListTodo').slice(0, 32)); applied++; break
        }
        case 'rename_section': {
          const section = sections.find((item) => item.id === action.targetId)
          if (!section || !title || sections.some((item) => item.id !== section.id && item.label.trim().toLowerCase() === title.toLowerCase())) continue
          renameSection(section.id, title); applied++; break
        }
        case 'create_week_block': case 'update_week_block': {
          const blockTitle = title
          if (!blockTitle || !/^([01]\d|2[0-3]):[0-5]\d$/.test(action.start ?? '') || !/^([01]\d|2[0-3]):[0-5]\d$/.test(action.end ?? '') || (action.date && !/^\d{4}-\d{2}-\d{2}$/.test(action.date)) || (!action.date && !(action.days?.length))) continue
          if (action.type === 'update_week_block' && !action.targetId) continue
          localStorage.setItem('quacker-ai-week-action', JSON.stringify({ ...action, title: blockTitle, id: action.targetId }))
          setOpen(false)
          navigate('/semana')
          applied++; break
        }
        case 'equip_skin': {
          const id = action.skinId ?? ''
          const targetPet = action.pet ?? pet
          if (targetPet === 'quackington' && quackingtonOwned && unlockedDuckSkins.includes(id)) equipQuackingtonSkin(id)
          else if (targetPet === 'fox' && unlockedFoxSkins.includes(id)) { setPet('fox'); equipSkin(id) }
          else continue
          applied++; break
        }
        case 'set_active_pet': {
          if (action.pet === 'fox') { setPet('fox'); applied++ }
          else if (action.pet === 'quackington' && quackingtonOwned) { setPet('quackington'); applied++ }
          break
        }
        case 'navigate': {
          const allowed = new Set(['/', '/semana', '/notas', '/tienda', '/ajustes', '/estadisticas', '/temporadas', '/archivo', '/opiniones', '/ayuda', '/bandeja', '/plan-dia', '/creditos'])
          const validSectionRoute = action.route?.startsWith('/s/') && sections.some((section) => action.route === `/s/${section.id}`)
          if (action.route && (allowed.has(action.route) || validSectionRoute)) { setOpen(false); navigate(action.route); applied++ }
          break
        }
      }
    }
    setActionNotice(applied ? `Listo: apliqué ${applied} cambio${applied === 1 ? '' : 's'}.` : 'No pude aplicar la propuesta porque algunos datos ya no coinciden. Pídele otra propuesta a tu asistente.')
    setPendingActions([])
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

  const applyLocalReschedule = () => {
    const now = new Date()
    let moved = 0
    for (const t of overdueTasks) {
      const target = new Date(now)
      target.setHours(9, 0, 0, 0)
      if (target.getTime() <= now.getTime() + 30 * 60 * 1000) target.setHours(18, 0, 0, 0)
      updateTask(t.id, { dueDate: target })
      moved++
    }
    if (moved > 0) {
      setRescheduleLocalApplied(true)
      setTimeout(() => setRescheduleLocalApplied(false), 5000)
    }
  }

  const handleFetchCalendar = async () => {
    setCalLoading(true)
    try {
      const now = new Date()
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
      const events = await fetchCalendarEvents(start, new Date(start.getTime() + 86400000))
      if (events === null) {
        setCalEvents([])
        setCalUnavailable(true)
      } else {
        setCalEvents(events)
        setCalUnavailable(false)
        setCalSelected(Object.fromEntries(events.map((e) => [e.id, true])))
      }
    } finally {
      setCalLoading(false)
    }
  }

  const toggleCalEvent = (id: string) => setCalSelected((s) => ({ ...s, [id]: !s[id] }))

  const handleImportEvents = () => {
    if (!calEvents || !sectionId) return
    let n = 0
    for (const e of calEvents) {
      if (!calSelected[e.id]) continue
      addTask(createTask(sectionId, {
        title: e.title || 'Evento',
        description: e.description ?? '',
        dueDate: new Date(e.startDate),
        priority: 'media',
        status: 'pending',
        recurrence: 'none',
        focusDay: false,
        reminderLead: null,
        reminder2HoursBefore: false,
        subtasks: [],
        notesLinks: [],
        images: [],
        tags: [],
      }))
      n++
    }
    if (n > 0) {
      setCalImported(n)
      setCalEvents(null)
      setCalUnavailable(false)
      setTimeout(() => setCalImported(0), 5000)
    }
  }

  const handleGoPremium = () => {
    setOpen(false)
    navigate('/tienda')
  }

  useEffect(() => {
    if (!foxEnabled || !canUseAI || briefingDoneRef.current || tasks.length === 0) return
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
  }, [foxEnabled, canUseAI, tasks, activeTasks, overdueTasks])

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
    if (!parsed || !sectionId || busyRef.current) return
    busyRef.current = true
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
      busyRef.current = false
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
  const mascotName = pet === 'quackington' ? getQuackingtonSkinById(quackingtonSkin)?.name ?? 'Sir Quackington' : 'Fox'
  useEffect(() => setFloatingPetPosition(petPosition), [petPosition])

  const beginPetMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (petAnchored || (event.target as HTMLElement).closest('[data-pet-control]')) return
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const rect = floatingPetRef.current?.getBoundingClientRect()
    if (!rect) return
    petDragRef.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY, x: rect.left, y: rect.top, currentX: rect.left, currentY: rect.top, moved: false }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.preventDefault()
  }

  const movePet = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = petDragRef.current
    if (!drag || drag.id !== event.pointerId || petAnchored) return
    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    if (!drag.moved && Math.hypot(dx, dy) < 5) return
    drag.moved = true
    const rect = floatingPetRef.current?.getBoundingClientRect()
    const width = rect?.width ?? 96
    const height = rect?.height ?? 116
    drag.currentX = Math.max(4, Math.min(window.innerWidth - width - 4, drag.x + dx))
    drag.currentY = Math.max(4, Math.min(window.innerHeight - height - 4, drag.y + dy))
    setFloatingPetPosition({ x: drag.currentX, y: drag.currentY })
    event.preventDefault()
  }

  const endPetMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = petDragRef.current
    if (!drag || drag.id !== event.pointerId) return
    petDragRef.current = null
    if (drag.moved) {
      const position = { x: drag.currentX, y: drag.currentY }
      setFloatingPetPosition(position)
      setPetPosition(position)
      suppressPetClickRef.current = true
      window.setTimeout(() => { suppressPetClickRef.current = false }, 0)
    }
  }

  const togglePetAnchor = () => {
    if (petAnchored) {
      const rect = floatingPetRef.current?.getBoundingClientRect()
      const position = floatingPetPosition ?? (rect ? { x: rect.left, y: rect.top } : null)
      if (position) {
        setFloatingPetPosition(position)
        setPetPosition(position)
      }
      setPetAnchored(false)
    } else {
      setPetPosition(floatingPetPosition)
      setPetAnchored(true)
    }
  }

  if (!foxEnabled) return null

  return (
    <>
      <div
        ref={floatingPetRef}
        className={`fixed z-50 ${petAnchored ? '' : 'cursor-grab active:cursor-grabbing'}`}
        style={floatingPetPosition
          ? { left: floatingPetPosition.x, top: floatingPetPosition.y, touchAction: petAnchored ? 'auto' : 'none' }
        : { right: '0.5rem', top: '6rem', touchAction: petAnchored ? 'auto' : 'none' }}
        onPointerDown={beginPetMove}
        onPointerMove={movePet}
        onPointerUp={endPetMove}
        onPointerCancel={endPetMove}
        onClickCapture={(event) => { if (suppressPetClickRef.current) { event.preventDefault(); event.stopPropagation() } }}
      >
        <div className="relative">
          {showBubble && foxDialogue && !open && pet === 'fox' && petQuotes && (
            <FoxBubble dialogue={foxDialogue} direction="down" align="right" />
          )}
          {pet === 'quackington' ? (
            <div className="relative">
              <div className="flex flex-col items-center gap-2">
                <QuackingtonSkinPet
                  skinId={quackingtonSkin}
                  size={72}
                  className={quackingtonSkin === 'animado' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                  busy={loading || created}
                  movable={false}
                />
                <button
                  data-pet-control
                  onClick={() => setOpen(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--bg)] text-[var(--accent)] shadow-md transition-transform hover:scale-110 active:scale-95"
                  aria-label="Quacker - Asistente"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
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
          )}
          <button
            type="button"
            data-pet-control
            onPointerDown={(event) => event.stopPropagation()}
            onClick={togglePetAnchor}
            title={petAnchored ? 'Desanclar mascota para moverla' : 'Fijar mascota en este lugar'}
            aria-label={petAnchored ? 'Desanclar mascota' : 'Anclar mascota'}
            className="absolute -left-1 -top-1 grid h-7 w-7 place-items-center rounded-full border border-[var(--border)] bg-[var(--bg)]/95 text-[var(--text-muted)] shadow-md transition hover:text-[var(--accent)]"
          >
            {petAnchored ? <Pin className="h-3.5 w-3.5" /> : <PinOff className="h-3.5 w-3.5 text-[var(--accent)]" />}
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
                <div className="relative">
                  {showBubble && foxDialogue && petQuotes && (pet === 'quackington'
                    ? <DuckBubble tick={foxDialogue} skinId={quackingtonSkin} direction="up" />
                    : <FoxBubble dialogue={foxDialogue} direction="up" />)}
                  {pet === 'quackington' ? (
                    <QuackingtonSkinPet skinId={quackingtonSkin} size={96} className="drop-shadow-xl md:h-20 md:w-20" effects={false} idleQuotes={false} />
                  ) : (
                    <img
                      src={skinImage ?? foxContext.image}
                      alt={foxContext.label}
                      className="h-24 w-24 drop-shadow-xl md:h-20 md:w-20"
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                </div>
              </div>
            )}

            {!canUseAI ? (
              <>
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 pt-24">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{mascotName}</span>
                    <span className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] font-bold text-[var(--text-muted)]">Modo básico</span>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="rounded-lg p-1 text-[var(--text-muted)] hover:bg-[var(--surface)]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {freeTab === 'paywall' ? (
                  <div className="max-h-[55vh] overflow-y-auto p-5">
                    <div className="flex flex-col items-center text-center">
                      {pet === 'quackington' ? (
                        <QuackingtonSkinPet skinId={quackingtonSkin} size={112} className="drop-shadow-xl" effects={false} idleQuotes={false} />
                      ) : (
                        <img src={skinImage} alt="Fox" className="h-28 w-28 drop-shadow-xl" style={{ objectFit: 'contain' }} />
                      )}
                      <div className="mt-3 flex items-center gap-1.5 rounded-full bg-[var(--accent)]/15 px-3 py-1">
                        <Crown className="h-3.5 w-3.5 text-[var(--accent)]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Quacker Premium</span>
                      </div>
                      <h3 className="mt-3 text-base font-extrabold leading-snug text-[var(--text)]">Tu asistente puede ayudarte en toda la app</h3>
                      <p className="mt-1.5 max-w-[280px] text-xs leading-relaxed text-[var(--text-muted)]">
                        {mascotName} consulta tus datos y propone cambios. Tú decides si aplicarlos. Premium también desbloquea a Quackington.
                      </p>
                      <div className="mt-4 w-full space-y-2 text-left">
                        {[
                          'Crea tareas con voz o texto: "Recuerda comprar harina mañana"',
                          'Crea y edita notas normales y bloques de tu semana',
                          'Actualiza tareas, prioridades y fechas; confirma antes de aplicar',
                          'Organiza tu día, desglosa tareas y recibe sugerencias según tu energía',
                          'Cambia la mascota activa y equipa skins que ya desbloqueaste',
                        ].map((f) => (
                          <div key={f} className="flex items-start gap-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-2.5">
                            <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                            <p className="text-[11px] leading-snug text-[var(--text)]">{f}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={handleGoPremium}
                        className="mt-4 w-full rounded-xl py-3 text-sm font-extrabold uppercase tracking-wide text-[var(--bg)] shadow-lg transition-transform hover:brightness-105 active:scale-[0.98]"
                        style={{ background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))' }}
                      >
                        Quiero mi asistente
                      </button>
                      <button
                        onClick={() => setFreeTab('basico')}
                        className="mt-2 text-[11px] font-semibold text-[var(--text-muted)] underline underline-offset-2 hover:text-[var(--text)]"
                      >
                        Primero, prueba el modo básico gratis
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="max-h-[55vh] space-y-3 overflow-y-auto p-4">
                    <button
                      onClick={() => setFreeTab('paywall')}
                      className="flex w-full items-center justify-between rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/5 px-3 py-2.5"
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold text-[var(--accent)]">
                        <Sparkles className="h-3.5 w-3.5" /> Desbloquea el asistente completo
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-[var(--accent)]" />
                    </button>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Resumen del día</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg bg-[var(--bg)] p-2.5 text-center">
                          <ListTodo className="mx-auto h-4 w-4 text-[var(--accent)]" />
                          <p className="mt-1 text-lg font-extrabold text-[var(--text)]">{pendientesHoy}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">para hoy</p>
                        </div>
                        <div className="rounded-lg bg-[var(--bg)] p-2.5 text-center">
                          <RefreshCw className="mx-auto h-4 w-4 text-red-500" />
                          <p className="mt-1 text-lg font-extrabold text-[var(--text)]">{overdueTasks.length}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">vencidas</p>
                        </div>
                        <div className="rounded-lg bg-[var(--bg)] p-2.5 text-center">
                          <Check className="mx-auto h-4 w-4 text-[var(--accent)]" />
                          <p className="mt-1 text-lg font-extrabold text-[var(--text)]">{coachStats.completadasHoy}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">hechas hoy</p>
                        </div>
                        <div className="rounded-lg bg-[var(--bg)] p-2.5 text-center">
                          <Flame className="mx-auto h-4 w-4 text-orange-500" />
                          <p className="mt-1 text-lg font-extrabold text-[var(--text)]">{coachStats.streakDays}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">días de racha</p>
                        </div>
                      </div>
                      {proximaTarea && (
                        <button
                          onClick={() => { setOpen(false); navigate(`/s/${proximaTarea.sectionId}`) }}
                          className="mt-2 flex w-full items-center gap-2 rounded-lg bg-[var(--bg)] px-3 py-2 text-left hover:bg-[var(--surface-2)]"
                        >
                          <CalendarClock className="h-4 w-4 shrink-0 text-[var(--accent)]" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-xs font-semibold text-[var(--text)]">{proximaTarea.title}</span>
                            <span className="block text-[10px] text-[var(--text-muted)]">Próxima por vencer · {format(proximaTarea.dueDate!, 'd MMM', { locale: es })}</span>
                          </span>
                          <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                        </button>
                      )}
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Reagendar vencidas</p>
                        {rescheduleLocalApplied && (
                          <span className="flex items-center gap-1 rounded-full bg-[var(--accent)]/10 px-2 py-0.5 text-[10px] font-bold text-[var(--accent)]">
                            <Check className="h-3 w-3" /> Movidas
                          </span>
                        )}
                      </div>
                      {overdueTasks.length === 0 ? (
                        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                          <Check className="h-3.5 w-3.5 text-[var(--accent)]" /> Todo al día, sin vencidas
                        </p>
                      ) : (
                        <>
                          <p className="mt-1 text-xs leading-snug text-[var(--text-muted)]">
                            Tienes {overdueTasks.length} tarea{overdueTasks.length === 1 ? '' : 's'} vencida{overdueTasks.length === 1 ? '' : 's'}. Muévelas a hoy con un toque, sin IA.
                          </p>
                          <button
                            onClick={applyLocalReschedule}
                            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[var(--accent)] py-2 text-xs font-bold text-[var(--bg)] hover:opacity-90"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Mover todas a hoy
                          </button>
                        </>
                      )}
                    </div>

                    <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
                      <div className="flex items-center gap-2">
                        <CalendarPlus className="h-4 w-4 text-[var(--accent)]" />
                        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Importar del calendario</p>
                      </div>
                      {calImported > 0 && (
                        <p className="mt-2 flex items-center gap-1.5 rounded-lg bg-[var(--accent)]/10 px-3 py-2 text-[11px] font-bold text-[var(--accent)]">
                          <Check className="h-3.5 w-3.5" /> {calImported} evento{calImported === 1 ? '' : 's'} creado{calImported === 1 ? '' : 's'} como tarea
                        </p>
                      )}
                      {calLoading ? (
                        <p className="mt-2 flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Leyendo tu calendario...
                        </p>
                      ) : calEvents === null ? (
                        <>
                          <p className="mt-1 text-[11px] leading-snug text-[var(--text-muted)]">
                            Trae los eventos de hoy de tu calendario del celular y conviértelos en tareas.
                          </p>
                          <button
                            onClick={handleFetchCalendar}
                            className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] py-2 text-xs font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]"
                          >
                            <CalendarPlus className="h-3.5 w-3.5" /> Buscar eventos de hoy
                          </button>
                        </>
                      ) : calUnavailable ? (
                        <>
                          <p className="mt-1 text-xs leading-snug text-[var(--text-muted)]">
                            Solo disponible en la app Android: otorga permiso de calendario y vuelve a intentarlo.
                          </p>
                          <button
                            onClick={handleFetchCalendar}
                            className="mt-2 text-[11px] font-semibold text-[var(--accent)] underline underline-offset-2"
                          >
                            Reintentar
                          </button>
                        </>
                      ) : calEvents.length === 0 ? (
                        <>
                          <p className="mt-1 text-xs text-[var(--text-muted)]">No hay eventos para hoy en tu calendario.</p>
                          <button
                            onClick={handleFetchCalendar}
                            className="mt-2 text-[11px] font-semibold text-[var(--accent)] underline underline-offset-2"
                          >
                            Buscar de nuevo
                          </button>
                        </>
                      ) : (
                        <div className="mt-2 space-y-2">
                          {calEvents.map((e) => (
                            <label key={e.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2">
                              <input
                                type="checkbox"
                                checked={!!calSelected[e.id]}
                                onChange={() => toggleCalEvent(e.id)}
                                className="h-3.5 w-3.5 accent-[var(--accent)]"
                              />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-xs font-semibold text-[var(--text)]">{e.title || 'Sin título'}</span>
                                <span className="block text-[10px] text-[var(--text-muted)]">{format(new Date(e.startDate), "d 'de' MMM · HH:mm", { locale: es })}</span>
                              </span>
                            </label>
                          ))}
                          <div className="flex items-center gap-2">
                            <select
                              value={sectionId}
                              onChange={(e) => setSectionId(e.target.value)}
                              className="min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg)] px-2.5 py-2 text-xs text-[var(--text)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                            >
                              {sections.map((s) => (
                                <option key={s.id} value={s.id}>{s.label}</option>
                              ))}
                            </select>
                            <button
                              onClick={handleImportEvents}
                              className="shrink-0 rounded-lg bg-[var(--accent)] px-3 py-2 text-xs font-bold text-[var(--bg)] hover:opacity-90"
                            >
                              Crear {calEvents.filter((e) => calSelected[e.id]).length}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : created ? (
              <div className="flex flex-col items-center gap-3 pt-28 pb-8">
                <div className="relative">
                  {pet === 'quackington' ? (
                    <QuackingtonSkinPet skinId={quackingtonSkin} size={80} effects={false} idleQuotes={false} />
                  ) : foxContext && (
                    <img
                      src={skinImage ?? foxContext.image}
                      alt={foxContext.label}
                      className="h-20 w-20"
                      style={{ objectFit: 'contain' }}
                    />
                  )}
                  {foxDialogue && petQuotes && (pet === 'quackington'
                    ? <DuckBubble tick={foxDialogue} skinId={quackingtonSkin} />
                    : <FoxBubble dialogue={foxDialogue} />)}
                </div>
                <p className="text-sm font-semibold">{mascotName} creó tu tarea</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 pt-24">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{mascotName}</span>
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
                          {loading ? `${mascotName} pensando...` : mode === 'crear' ? 'Analizar' : 'Preguntar'}
                        </button>
                      </div>

                      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                    </>
                  )}

                  {mode === 'crear' && parsed && (
                    <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        {mascotName} encontró esto
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
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{mascotName} responde</p>
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
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> {mascotName} está eligiendo...
                        </p>
                      )}
                      {error && <p className="text-center text-xs text-red-500">{error}</p>}
                      {energyResult && (
                        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 text-center">
                          {energyResult.taskId && (() => {
                            const suggested = tasks.find((t) => t.id === energyResult.taskId)
                            return suggested ? (
                              <>
                                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">{mascotName} sugiere</p>
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
                            Habla con {mascotName} de lo que quieras: tus tareas, ideas o cómo va tu día
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
                        {pendingActions.length > 0 && (
                          <div className="self-start w-full rounded-xl border border-[var(--accent)]/40 bg-[var(--accent)]/5 p-3">
                            <p className="flex items-center gap-1.5 text-xs font-bold text-[var(--text)]"><Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" /> Propuesta para Quacker</p>
                            <ul className="mt-2 space-y-1.5">
                              {pendingActions.map((action, index) => <li key={`${action.type}-${index}`} className="text-[11px] leading-snug text-[var(--text-muted)]">• {action.summary}</li>)}
                            </ul>
                            <div className="mt-3 flex gap-2">
                              <button onClick={applyChatActions} className="flex-1 rounded-lg bg-[var(--accent)] px-3 py-2 text-[11px] font-bold text-[var(--bg)]">Aplicar cambios</button>
                              <button onClick={() => setPendingActions([])} className="rounded-lg border border-[var(--border)] px-3 py-2 text-[11px] font-semibold text-[var(--text-muted)]">Cancelar</button>
                            </div>
                          </div>
                        )}
                        {actionNotice && <p className="self-start text-[11px] text-[var(--text-muted)]">{actionNotice}</p>}
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
                          <p className="text-xs text-[var(--text-muted)]">¡Todo al día! {mascotName} no tiene nada que reagendar</p>
                        </div>
                      ) : (
                        <>
                          <p className="text-center text-xs text-[var(--text-muted)]">
                            Tienes {overdueTasks.length} tarea{overdueTasks.length === 1 ? '' : 's'} vencida{overdueTasks.length === 1 ? '' : 's'}. {mascotName} te ayuda a reorganizarla{overdueTasks.length === 1 ? '' : 's'}.
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
