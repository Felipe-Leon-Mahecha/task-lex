import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Capacitor } from '@capacitor/core'
import { Link, useNavigate } from 'react-router-dom'
import { Bell, BellOff, Calendar, Download, Music, Play, Upload, Trash2, Volume2, VolumeX, Search, Cloud, Database, BellRing, CloudUpload, RefreshCw, Users } from 'lucide-react'
import { createCloudBackup, importJSON, lastBackupAt, listCloudBackups, restoreCloudBackup, type CloudBackup } from '../lib/backup'
import { exportSeasonsJSON, importSeasonsJSON } from '../lib/seasons/seasonBackup'
import { useAuthStore } from '../store/auth'
import { alarmToneUrl, deleteAlarmTone, disableAllReminders, requestPermission, saveAlarmTone } from '../lib/notifications'
import { createCalendarEvent, requestCalendarPermissions } from '../lib/calendar'
import { cancelFavoriteSkinNotices } from '../lib/favoriteSkinNotice'
import { useSectionsStore } from '../store/sections'
import { useSettingsStore } from '../store/settings'
import { useSeasonsStore } from '../store/seasons'
import { useTutorialStore } from '../store/tutorial'
import { useTasksStore } from '../store/tasks'
import { ICON_MAP } from '../lib/sections'
import Modal from '../components/ui/Modal'
import InviteCard from '../components/ui/InviteCard'
import AiAssistantCard from '../components/settings/AiAssistantCard'
import { useOfflineStore } from '../store/offline'
import { lastCloudSyncAt } from '../lib/syncStatus'
import { ADMIN_EMAIL, canAccessSeasons } from '../lib/appInfo'
import { playAppSound } from '../lib/soundEffects'
import { loadPresenceCounts, type PresenceCounts } from '../lib/presence'
import { getHolidayPreview, setHolidayPreview, type HolidayPreview } from '../lib/holidayPreview'

const SETTINGS_CATEGORIES = [
  { id: 'help', label: 'Ayuda', words: 'tutorial recorrido guía soporte' },
  { id: 'preferences', label: 'Preferencias', words: 'meta diaria foco temporizador pomodoro descanso' },
  { id: 'notifications', label: 'Avisos', words: 'notificación recordatorio tarea alarma' },
  { id: 'calendar-sync', label: 'Calendario', words: 'sincronizar calendario dispositivo google fecha' },
  { id: 'sound', label: 'Sonido', words: 'audio tono música alarma' },
  { id: 'themes', label: 'Temas', words: 'tema colores aspecto interfaz tienda' },
  { id: 'seasonal', label: 'Eventos de temporada', words: 'diciembre navidad nochebuena año nuevo halloween lluvia tormenta arañas decoraciones' },
  { id: 'backup', label: 'Copia automática', words: 'backup respaldo copia automática frecuencia json' },
  { id: 'sections', label: 'Apartados', words: 'renombrar eliminar ordenar secciones' },
  { id: 'companion', label: 'Mascota y asistente', words: 'fox quackington mascota asistente mensajes' },
  { id: 'reading', label: 'Lectura y accesibilidad', words: 'texto grande contraste' },
  { id: 'data', label: 'Importar datos', words: 'restaurar importar json temporadas copia respaldo' },
]

function formatStatusDate(time: number | null) {
  if (!time) return 'Todavía no disponible'
  return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(time))
}

export default function Settings() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const sections = useSectionsStore((s) => s.sections)
  const renameSection = useSectionsStore((s) => s.renameSection)
  const removeSection = useSectionsStore((s) => s.removeSection)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)
  const user = useAuthStore((s) => s.user)
  const seasonsImportRef = useRef<HTMLInputElement>(null)
  const [settingsQuery, setSettingsQuery] = useState('')
  const isHalloweenMonth = new Date().getMonth() === 9
  const isOwner = user?.email?.trim().toLowerCase() === ADMIN_EMAIL
  const isOnline = useOfflineStore((s) => s.isOnline)
  const pendingOperations = useOfflineStore((s) => s.pendingOperations.length)
  const [lastSync, setLastSync] = useState<number | null>(() => lastCloudSyncAt(user?.uid))
  const [lastBackup, setLastBackup] = useState<number | null>(() => lastBackupAt())
  const [cloudBackups, setCloudBackups] = useState<CloudBackup[]>([])
  const [backupBusy, setBackupBusy] = useState(false)
  const visibleCategories = SETTINGS_CATEGORIES.filter((item) => (item.id !== 'seasonal' || isHalloweenMonth || isOwner) && `${item.label} ${item.words}`.toLocaleLowerCase('es').includes(settingsQuery.trim().toLocaleLowerCase('es')))
  const [presence, setPresence] = useState<PresenceCounts | null>(null)
  const [presenceError, setPresenceError] = useState(false)
  const [holidayPreview, setHolidayPreviewState] = useState<HolidayPreview>(() => getHolidayPreview())

  useEffect(() => {
    if (!isOwner || !user) { setPresence(null); return }
    let active = true
    const refresh = () => loadPresenceCounts(user).then((result) => { if (active) { setPresence(result); setPresenceError(false) } }).catch(() => { if (active) setPresenceError(true) })
    void refresh()
    const timer = window.setInterval(refresh, 60_000)
    return () => { active = false; window.clearInterval(timer) }
  }, [isOwner, user])

  useEffect(() => {
    const sync = (event: Event) => {
      const detail = (event as CustomEvent<{ uid: string; time: number }>).detail
      if (detail?.uid === user?.uid) setLastSync(detail.time)
    }
    const backup = () => {
      setLastBackup(lastBackupAt())
      if (user) listCloudBackups(user.uid).then(setCloudBackups).catch(() => {})
    }
    window.addEventListener('tasklex:cloud-synced', sync)
    window.addEventListener('tasklex:backup-exported', backup)
    return () => { window.removeEventListener('tasklex:cloud-synced', sync); window.removeEventListener('tasklex:backup-exported', backup) }
  }, [user?.uid])

  useEffect(() => {
    let active = true
    if (!user) {
      setCloudBackups([])
      return
    }
    listCloudBackups(user.uid)
      .then((backups) => { if (active) setCloudBackups(backups) })
      .catch(() => { if (active) setCloudBackups([]) })
    return () => { active = false }
  }, [user?.uid])

  const saveCloudBackupNow = async () => {
    if (!user) return
    setBackupBusy(true)
    try {
      await createCloudBackup(user.uid)
      setCloudBackups(await listCloudBackups(user.uid))
      setLastBackup(lastBackupAt())
      setMessage({ ok: true, text: 'Copia guardada en tu cuenta de Quacker.' })
    } catch (error) {
      setMessage({ ok: false, text: error instanceof Error ? error.message : 'No se pudo guardar la copia.' })
    } finally {
      setBackupBusy(false)
      window.setTimeout(() => setMessage(null), 5000)
    }
  }

  const importCloudBackup = async (backup: CloudBackup) => {
    if (!user) return
    setBackupBusy(true)
    try {
      const result = await restoreCloudBackup(user.uid, backup.path)
      setMessage({ ok: result.ok, text: result.ok ? 'Copia importada. Tus tareas más recientes se conservaron.' : result.message })
      window.setTimeout(() => setMessage(null), 5000)
    } finally {
      setBackupBusy(false)
    }
  }

  const canEditSeasons = canAccessSeasons(user?.email)
  const resetSeasons = useSeasonsStore((s) => s.resetAll)

  const handleSeasonsImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setMessage(null)
    const res = await importSeasonsJSON(file)
    setMessage({ ok: res.ok, text: res.message })
    if (seasonsImportRef.current) seasonsImportRef.current.value = ''
    setTimeout(() => setMessage(null), 3500)
  }
  const dailyGoal = useSettingsStore((s) => s.dailyGoal)
  const focusMinutes = useSettingsStore((s) => s.focusMinutes)
  const shortBreak = useSettingsStore((s) => s.shortBreak)
  const notificationsOn = useSettingsStore((s) => s.notificationsOn)
  const dailyReminderFrequency = useSettingsStore((s) => s.dailyReminderFrequency)
  const calendarSync = useSettingsStore((s) => s.calendarSync)
  const soundsEnabled = useSettingsStore((s) => s.soundsEnabled)
  const soundVolume = useSettingsStore((s) => s.soundVolume)
  const autoBackup = useSettingsStore((s) => s.autoBackup)
  const backupFrequency = useSettingsStore((s) => s.backupFrequency)
  const setDailyGoal = useSettingsStore((s) => s.setDailyGoal)
  const setFocusMinutes = useSettingsStore((s) => s.setFocusMinutes)
  const setShortBreak = useSettingsStore((s) => s.setShortBreak)
  const setNotificationsOn = useSettingsStore((s) => s.setNotificationsOn)
  const setDailyReminderFrequency = useSettingsStore((s) => s.setDailyReminderFrequency)
  const setCalendarSync = useSettingsStore((s) => s.setCalendarSync)
  const setSoundsEnabled = useSettingsStore((s) => s.setSoundsEnabled)
  const setSoundVolume = useSettingsStore((s) => s.setSoundVolume)
  const setAutoBackup = useSettingsStore((s) => s.setAutoBackup)
  const setBackupFrequency = useSettingsStore((s) => s.setBackupFrequency)
  const foxEnabled = useSettingsStore((s) => s.foxEnabled)
  const foxRandomMessages = useSettingsStore((s) => s.foxRandomMessages)
  const foxExpressions = useSettingsStore((s) => s.foxExpressions)
  const petQuotes = useSettingsStore((s) => s.petQuotes)
  const setFoxEnabled = useSettingsStore((s) => s.setFoxEnabled)
  const setFoxRandomMessages = useSettingsStore((s) => s.setFoxRandomMessages)
  const setFoxExpressions = useSettingsStore((s) => s.setFoxExpressions)
  const setPetQuotes = useSettingsStore((s) => s.setPetQuotes)
  const alarmTone = useSettingsStore((s) => s.alarmTone)
  const setAlarmTone = useSettingsStore((s) => s.setAlarmTone)
  const compactTasks = useSettingsStore((s) => s.compactTasks)
  const setCompactTasks = useSettingsStore((s) => s.setCompactTasks)
  const largeText = useSettingsStore((s) => s.largeText)
  const setLargeText = useSettingsStore((s) => s.setLargeText)
  const highContrast = useSettingsStore((s) => s.highContrast)
  const setHighContrast = useSettingsStore((s) => s.setHighContrast)
  const seasonalEffects = useSettingsStore((s) => s.seasonalEffects)
  const seasonalSpiders = useSettingsStore((s) => s.seasonalSpiders)
  const seasonalWeather = useSettingsStore((s) => s.seasonalWeather)
  const setSeasonalEffects = useSettingsStore((s) => s.setSeasonalEffects)
  const setSeasonalSpiders = useSettingsStore((s) => s.setSeasonalSpiders)
  const setSeasonalWeather = useSettingsStore((s) => s.setSeasonalWeather)
  const toneInputRef = useRef<HTMLInputElement>(null)
  const previewAudioRef = useRef<HTMLAudioElement | null>(null)
  const [toneBusy, setToneBusy] = useState(false)
  const [tonePlaying, setTonePlaying] = useState(false)

  useEffect(() => () => {
    previewAudioRef.current?.pause()
    previewAudioRef.current = null
  }, [])

  const onPickTone = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    if (!file.type.startsWith('audio/')) {
      setMessage({ ok: false, text: 'El archivo debe ser audio (mp3, wav, ogg…).' })
      return
    }
    setToneBusy(true)
    try {
      const prev = useSettingsStore.getState().alarmTone
      const saved = await saveAlarmTone(file)
      if (prev && prev.path !== saved.path) await deleteAlarmTone(prev.path)
      setAlarmTone(saved)
      setMessage({ ok: true, text: `Tono "${saved.name}" listo para tus alarmas.` })
    } catch (err) {
      setMessage({ ok: false, text: err instanceof Error ? err.message : 'No se pudo guardar el tono.' })
    } finally {
      setToneBusy(false)
    }
  }

  const onPreviewTone = async () => {
    if (previewAudioRef.current && !previewAudioRef.current.paused) {
      previewAudioRef.current.pause()
      previewAudioRef.current.currentTime = 0
      previewAudioRef.current = null
      setTonePlaying(false)
      return
    }
    const cur = useSettingsStore.getState().alarmTone
    if (!cur) return
    const url = await alarmToneUrl(cur.path)
    if (url) {
      const a = new Audio(url)
      previewAudioRef.current = a
      a.onended = () => setTonePlaying(false)
      a.onpause = () => setTonePlaying(false)
      a.play().then(() => setTonePlaying(true)).catch(() => setTonePlaying(false))
    }
  }

  const onRemoveTone = async () => {
    const cur = useSettingsStore.getState().alarmTone
    if (cur) await deleteAlarmTone(cur.path)
    setAlarmTone(null)
    setMessage({ ok: true, text: 'Volviste al tono de alarma por defecto.' })
  }

  const onImport = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const res = await importJSON(file)
    setMessage({ ok: res.ok, text: res.message })
    e.target.value = ''
  }

  const toggleNotifications = async (on: boolean) => {
    if (on) {
      setNotificationsOn(true)
      const granted = await requestPermission().catch(() => false)
      if (!granted) {
        setNotificationsOn(false)
        setMessage({ ok: false, text: 'Quacker necesita permiso del sistema para enviar notificaciones. Actívalo en los ajustes del teléfono y vuelve a intentarlo.' })
        return
      }
      playAppSound('task-complete', 0.1)
      setMessage({ ok: true, text: 'Notificaciones activadas en Quacker y autorizadas por el sistema.' })
      window.setTimeout(() => setMessage(null), 4500)
    } else {
      setNotificationsOn(false)
      disableAllReminders()
      void cancelFavoriteSkinNotices(user?.uid)
      playAppSound('task-complete', 0.1)
    }
  }

  const toggleCalendarSync = async (on: boolean) => {
    if (!on) { setCalendarSync(false); playAppSound('task-complete', 0.1); return }
    if (Capacitor.getPlatform() === 'web') {
      setMessage({ ok: false, text: 'La sincronización con el calendario del dispositivo funciona desde la app móvil.' })
      return
    }
    const allowed = await requestCalendarPermissions().catch(() => false)
    if (!allowed) {
      setMessage({ ok: false, text: 'No se activó la sincronización porque faltan permisos de calendario.' })
      return
    }
    setCalendarSync(true)
    playAppSound('task-complete', 0.1)
    const existing = useTasksStore.getState().tasks.filter((task) => !task.archived && task.dueDate && !task.calendarEventId)
    let synced = 0
    for (const task of existing) {
      const eventId = await createCalendarEvent({ title: task.title, description: task.description, dueDate: task.dueDate }).catch(() => null)
      if (eventId) { useTasksStore.getState().updateTask(task.id, { calendarEventId: eventId }); synced++ }
    }
    setMessage({ ok: true, text: synced ? `Sincronización activada. Añadí ${synced} tareas con fecha al calendario del teléfono.` : 'Sincronización activada. Las tareas nuevas con fecha aparecerán en el calendario del teléfono.' })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleDeleteSection = (id: string) => {
    setSectionToDelete(id)
    setDeleteOpen(true)
  }

  const confirmDeleteSection = () => {
    if (sectionToDelete) {
      removeSection(sectionToDelete)
      setSectionToDelete(null)
    }
    setDeleteOpen(false)
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="eyebrow">Ajustes</p>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Configuración</h1>

      <label className="relative mb-4 block">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
        <input value={settingsQuery} onChange={(event) => setSettingsQuery(event.target.value)} placeholder="Busca un ajuste: tema, calendario, foco…" className="min-h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-11 pr-4 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" />
      </label>

      <nav aria-label="Categorías de ajustes" className="sticky top-0 z-20 -mx-4 mb-4 flex gap-2 overflow-x-auto border-y border-[var(--border)] bg-[var(--bg)]/95 px-4 py-3 backdrop-blur-md md:-mx-8 md:px-8">
        {visibleCategories.map(({ id, label }) => <button key={id} type="button" onClick={() => id === 'themes' ? navigate('/tienda?panel=temas') : document.getElementById(`settings-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-xs font-semibold text-[var(--text-muted)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">{label}</button>)}
      </nav>

      {settingsQuery && visibleCategories.length === 0 && <p className="mb-4 rounded-xl border border-dashed border-[var(--border)] p-3 text-xs text-[var(--text-muted)]">No encontré un ajuste con “{settingsQuery}”. Prueba con otra palabra.</p>}

      <section className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Estado de la aplicación">
        <div className="card flex items-start gap-3 p-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${isOnline ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}><Cloud className="h-4 w-4" /></span><div><p className="text-xs font-bold">Conexión y sincronización</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">{!user ? 'Modo local' : isOnline ? `${pendingOperations ? `${pendingOperations} cambios por enviar` : 'Conexión disponible'}` : 'Sin conexión'} · Última señal: {formatStatusDate(lastSync)}</p></div></div>
        <div className="card flex items-start gap-3 p-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${calendarSync && Capacitor.getPlatform() !== 'web' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}><Calendar className="h-4 w-4" /></span><div><p className="text-xs font-bold">Calendario del teléfono</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">{Capacitor.getPlatform() === 'web' ? 'Disponible desde la app móvil' : calendarSync ? 'Preferencia de sincronización activa' : 'Preferencia de sincronización desactivada'}</p></div></div>
        <div className="card flex items-start gap-3 p-4"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${notificationsOn ? 'bg-emerald-500/10 text-emerald-500' : 'bg-[var(--surface-2)] text-[var(--text-muted)]'}`}><BellRing className="h-4 w-4" /></span><div><p className="text-xs font-bold">Notificaciones</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Preferencia {notificationsOn ? 'activada' : 'desactivada'}</p></div></div>
        <div className="card flex items-start gap-3 p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-500"><Database className="h-4 w-4" /></span><div><p className="text-xs font-bold">Última copia exportada</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">{formatStatusDate(lastBackup)}</p></div></div>
      </section>

      {isOwner && <section className="card mb-4 p-4" aria-label="Actividad real de usuarios"><div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-500/10 text-sky-500"><Users className="h-4 w-4" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold">Actividad de usuarios</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">Cifras reales desde que esta versión comenzó a registrar actividad: en línea en los últimos 2 minutos y desconectadas con actividad en los últimos 30 días.</p><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl bg-[var(--surface-2)] p-3"><p className="text-[10px] font-semibold text-[var(--text-muted)]">En línea ahora</p><p className="mt-1 text-xl font-black">{presence?.online ?? '—'}</p></div><div className="rounded-xl bg-[var(--surface-2)] p-3"><p className="text-[10px] font-semibold text-[var(--text-muted)]">Desconectadas recientes</p><p className="mt-1 text-xl font-black">{presence?.offlineRecent ?? '—'}</p></div></div>{presenceError && <p className="mt-2 text-[11px] text-amber-600">No se pudo consultar el servicio de actividad. Se actualizará automáticamente.</p>}</div></div></section>}

      <div className="space-y-4">
      <div id="settings-help" className="card w-full scroll-mt-20 p-5">
        <p className="text-sm font-semibold">Guía rápida</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Aprende lo esencial o encuentra una respuesta concreta.</p>
        <div className="mt-4 flex flex-wrap gap-2"><button onClick={() => useTutorialStore.getState().start()} className="btn-primary"><Play className="h-4 w-4" /> Ver recorrido animado</button><Link to="/ayuda" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text)] hover:border-[var(--accent)] hover:text-[var(--accent)]">Abrir centro de ayuda</Link></div>
      </div>

      <div id="settings-preferences" className="card w-full scroll-mt-20 p-5">
        <p className="text-sm font-semibold">Preferencias</p>
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Meta diaria de tareas</p>
              <p className="text-xs text-[var(--text-muted)]">Cuántas tareas completas por día.</p>
            </div>
            <input
              type="number"
              min={0}
              max={50}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Foco (minutos)</p>
              <p className="text-xs text-[var(--text-muted)]">Duración de cada sesión de foco.</p>
            </div>
            <input
              type="number"
              min={1}
              max={120}
              value={focusMinutes}
              onChange={(e) => setFocusMinutes(Number(e.target.value))}
              className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 -mt-2">
            {[15, 25, 30, 45, 60].map((minutes) => <button key={minutes} onClick={() => setFocusMinutes(minutes)} className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${focusMinutes === minutes ? 'bg-[var(--accent)] text-[var(--bg)]' : 'border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--text)]'}`}>{minutes} min</button>)}
          </div>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm">Descanso (minutos)</p>
              <p className="text-xs text-[var(--text-muted)]">Pausa entre sesiones de foco.</p>
            </div>
            <input
              type="number"
              min={1}
              max={60}
              value={shortBreak}
              onChange={(e) => setShortBreak(Number(e.target.value))}
              className="w-20 rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2 text-center text-sm outline-none focus:border-[var(--accent)]"
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-xl border border-[var(--accent)]/35 bg-[var(--accent)]/5 p-3">
              <p className="text-sm font-bold text-[var(--text)]">Tareas delgadas</p>
              <p className="text-xs text-[var(--text-muted)]">
                Muestra cada tarea como una fila fina; tócala para ver todos sus detalles.
              </p>
            </div>
            <button
              onClick={() => setCompactTasks(!compactTasks)}
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                compactTasks
                  ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                  : 'border-[var(--border)] text-[var(--text-muted)]'
              }`}
            >
              {compactTasks ? 'Activadas' : 'Apagadas'}
            </button>
          </div>
        </div>
      </div>

      <div id="settings-notifications" className="card w-full scroll-mt-20 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Notificaciones</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Avisos de vencimientos y recordatorios. En el celular llegan como notificación nativa.
            </p>
          </div>
          <button
            onClick={() => toggleNotifications(!notificationsOn)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              notificationsOn
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {notificationsOn ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {notificationsOn ? 'Activadas' : 'Apagadas'}
          </button>
        </div>
        {notificationsOn && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--border)] pt-4">
            <div>
              <p className="text-sm">Recordatorios diarios</p>
              <p className="text-xs text-[var(--text-muted)]">Veces al día para recordar tareas activas.</p>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setDailyReminderFrequency(n)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${
                    dailyReminderFrequency === n
                      ? 'bg-[var(--accent)] text-[var(--accent-text,#121212)]'
                      : 'bg-[var(--surface-2)] text-[var(--text-muted)]'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )}
        {notificationsOn && (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="flex items-center gap-1.5 text-sm">
                  <Music className="h-4 w-4 text-[var(--accent)]" /> Tono de alarma
                </p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {alarmTone ? alarmTone.name : 'Sube una canción o tono para tus alarmas.'}
                </p>
              </div>
              {alarmTone ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    onClick={onPreviewTone}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text)] hover:border-[var(--accent)]/60"
                  >
                    {tonePlaying ? <VolumeX className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />} {tonePlaying ? 'Detener' : 'Probar'}
                  </button>
                  <button
                    onClick={onRemoveTone}
                    className="flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-medium text-[var(--text-muted)] hover:text-red-400"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Quitar
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toneInputRef.current?.click()}
                  disabled={toneBusy}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--accent)]/50 bg-[var(--accent)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/20 disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" /> {toneBusy ? 'Subiendo…' : 'Subir tono'}
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-[var(--text-muted)]">Usa tonos breves de máximo 15 segundos y 5 MB. Puedes detener la vista previa cuando quieras.</p>
            <input ref={toneInputRef} type="file" accept="audio/*" className="hidden" onChange={onPickTone} />
          </div>
        )}
      </div>

      <div id="settings-calendar-sync" className="card w-full scroll-mt-20 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Sincronización con calendario</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Envía tareas con fecha al calendario predeterminado del teléfono; su cuenta configurada puede sincronizarlas con Google Calendar.
            </p>
          </div>
          <button
            onClick={() => toggleCalendarSync(!calendarSync)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              calendarSync
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            <Calendar className="h-4 w-4" />
            {calendarSync ? 'Activada' : 'Apagada'}
          </button>
        </div>
      </div>

      <div id="settings-sound" className="card w-full scroll-mt-20 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">Sonidos</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Efectos descargados para tareas, compras, recompensas, logros y la ruleta. Ajusta el volumen o siléncialos aquí.
            </p>
          </div>
          <button
            onClick={() => setSoundsEnabled(!soundsEnabled)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              soundsEnabled
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {soundsEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            {soundsEnabled ? 'Activados' : 'Apagados'}
          </button>
        </div>
        <div className={`mt-5 space-y-4 transition-opacity ${soundsEnabled ? '' : 'pointer-events-none opacity-45'}`}>
          <label className="block">
            <span className="flex items-center justify-between gap-3 text-xs font-semibold text-[var(--text-muted)]">
              <span>Volumen de efectos</span><span className="tabular-nums">{soundVolume}%</span>
            </span>
            <input aria-label="Volumen de efectos de la app" type="range" min={0} max={100} step={1} value={soundVolume} disabled={!soundsEnabled} onChange={(event) => setSoundVolume(Number(event.target.value))} className="mt-2 w-full accent-[var(--accent)]" />
            <span className="mt-1 block text-[10px] leading-relaxed text-[var(--text-muted)]">Ajusta los efectos que suenan dentro de Quacker. El tono de las notificaciones externas usa el volumen de notificaciones del teléfono.</span>
          </label>
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)]">Escuchar efectos</p>
            <div className="flex flex-wrap gap-2">
              {([
                ['Monedas', 'coin-reward'], ['Tarea lista', 'task-complete'], ['Compra', 'purchase'], ['Inicio', 'app-start'], ['Eliminar', 'task-delete'], ['Favorito', 'skin-favorite'], ['Menú', 'sidebar-open'], ['Notas', 'notes-open'], ['Tienda', 'shop-open'],
                ['Insignia', 'season-reveal'], ['Premium', 'premium'], ['¡Cuak!', 'duck-purchase'],
                ['Aviso interno', 'notification'], ['Aviso externo', 'system-notification'], ['Ruleta', 'season-roulette'],
              ] as const).map(([label, sound]) => (
                <button key={sound} type="button" onClick={() => playAppSound(sound, 0.4)} className="rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 text-[11px] font-semibold text-[var(--text)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/10">{label}</button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {(isHalloweenMonth || isOwner) && <div id="settings-seasonal" className="card w-full scroll-mt-20 p-5">
        <p className="text-sm font-semibold">Ajustes de temporada</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">En octubre activa adornos de Halloween, arañas interactivas y lluvia ocasional. Puedes desactivar cada efecto; las animaciones respetan “Reducir movimiento” del dispositivo.</p>
        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><span><span className="block text-sm font-medium">Decoración de Halloween</span><span className="text-xs text-[var(--text-muted)]">Viene activada en octubre; desactívala aquí si prefieres la interfaz normal.</span></span><input type="checkbox" checked={seasonalEffects} onChange={(event) => setSeasonalEffects(event.target.checked)} className="h-5 w-5 accent-[var(--accent)]" /></label>
          {seasonalEffects && <>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><span><span className="block text-sm font-medium">Arañas aplastables</span><span className="text-xs text-[var(--text-muted)]">Aparecen cada poco; hay corredoras, fantasma y una nodriza que se divide.</span></span><input type="checkbox" checked={seasonalSpiders} onChange={(event) => setSeasonalSpiders(event.target.checked)} className="h-5 w-5 accent-[var(--accent)]" /></label>
            <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3"><span><span className="block text-sm font-medium">Lluvia, tormentas y apagones sorpresa</span><span className="text-xs text-[var(--text-muted)]">Efectos visuales ocasionales; el apagón incluye una antorcha que puedes mover.</span></span><input type="checkbox" checked={seasonalWeather} onChange={(event) => setSeasonalWeather(event.target.checked)} className="h-5 w-5 accent-[var(--accent)]" /></label>
            <p className="px-1 text-[11px] text-[var(--text-muted)]">La risa de bruja y el sonido de trueno se conectarán cuando me pases los audios. La música no se reproducirá hasta tener el archivo y poder activarla aquí.</p>
          </>}
        </div>
        {isOwner && <div className="mt-5 border-t border-[var(--border)] pt-4"><p className="text-sm font-semibold">Vista previa privada de diciembre</p><p className="mt-1 text-xs text-[var(--text-muted)]">Solo tu cuenta puede activar estas decoraciones antes de diciembre. El resto verá cada evento automáticamente en sus fechas.</p><select value={holidayPreview} onChange={(event) => { const next = event.target.value as HolidayPreview; setHolidayPreviewState(next); setHolidayPreview(next) }} className="mt-3 min-h-10 w-full max-w-sm rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm"><option value="auto">Automático según la fecha</option><option value="month">Decoración de todo diciembre</option><option value="christmas24">Nochebuena · 24 de diciembre</option><option value="christmas25">Navidad · 25 de diciembre</option><option value="newyear">Evento del 31 de diciembre</option></select></div>}
      </div>}

      <div id="settings-backup" className="card w-full scroll-mt-20 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-semibold">Backup automático</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Guarda automáticamente una copia en tu cuenta después de sincronizar tus datos.
            </p>
          </div>
          <button
            onClick={() => setAutoBackup(!autoBackup)}
            className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              autoBackup
                ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                : 'border-[var(--border)] text-[var(--text-muted)]'
            }`}
          >
            {autoBackup ? 'Activado' : 'Apagado'}
          </button>
        </div>
        {autoBackup && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--text-muted)]">Cada:</label>
            {[3, 5, 7].map((d) => (
              <button
                key={d}
                onClick={() => setBackupFrequency(d)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  backupFrequency === d
                    ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]/50'
                }`}
              >
                {d} días
              </button>
            ))}
          </div>
        )}
        {user && <div className="mt-4 border-t border-[var(--border)] pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold">Copias en la nube</p>
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">Se conservan las 10 más recientes. La última copia: {formatStatusDate(cloudBackups[0]?.createdAt ?? null)}.</p>
            </div>
            <button type="button" onClick={saveCloudBackupNow} disabled={backupBusy || !isOnline} className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--text)] hover:border-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50">
              {backupBusy ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CloudUpload className="h-4 w-4" />}
              Guardar copia ahora
            </button>
          </div>
          {!isOnline && <p className="mt-2 text-[11px] text-amber-500">Conéctate para crear o consultar copias en la nube.</p>}
          {cloudBackups.length > 0 ? <ul className="mt-3 space-y-2">
            {cloudBackups.map((backup) => <li key={backup.path} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
              <span className="text-xs text-[var(--text-muted)]">{formatStatusDate(backup.createdAt)} · {(backup.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
              <button type="button" onClick={() => void importCloudBackup(backup)} disabled={backupBusy || !isOnline} className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10 disabled:opacity-50">Importar copia</button>
            </li>)}
          </ul> : <p className="mt-3 text-[11px] text-[var(--text-muted)]">Aún no hay copias guardadas.</p>}
        </div>}
      </div>

      <div id="settings-sections" className="card w-full scroll-mt-20 p-5">
        <p className="text-sm font-semibold">Apartados</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Los apartados aparecen en el menú lateral. Puedes renombrarlos o eliminarlos.
        </p>
        <ul className="mt-4 space-y-2">
          {sections.map((sec) => {
            const Icon = ICON_MAP[sec.icon]
            return (
              <li key={sec.id} className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-[var(--accent)]" />}
                  <input
                    key={sec.id}
                    defaultValue={sec.label}
                    onBlur={(e) => {
                      const v = e.target.value.trim()
                      if (v && v !== sec.label) renameSection(sec.id, v)
                    }}
                    className="w-full rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm outline-none transition-colors focus:border-[var(--border)] focus:bg-[var(--surface-2)]"
                  />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={() => handleDeleteSection(sec.id)}
                    className="shrink-0 rounded p-2 text-[var(--text-muted)] hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      <div id="settings-reading" className="card w-full scroll-mt-20 p-5">
        <p className="text-sm font-semibold">Lectura y accesibilidad</p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Ajusta el tamaño y el contraste para que Quacker se sienta cómodo en tu pantalla.</p>
        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <span><span className="block text-sm font-medium">Texto más grande</span><span className="text-xs text-[var(--text-muted)]">Aumenta el tamaño general de la interfaz.</span></span>
            <input type="checkbox" checked={largeText} onChange={(event) => setLargeText(event.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
          </label>
          <label className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3">
            <span><span className="block text-sm font-medium">Contraste reforzado</span><span className="text-xs text-[var(--text-muted)]">Hace más visibles el texto y los límites de los controles.</span></span>
            <input type="checkbox" checked={highContrast} onChange={(event) => setHighContrast(event.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
          </label>
        </div>
      </div>

      <div id="settings-companion" className="card w-full scroll-mt-20 p-5">
        <div className="flex items-center gap-2">
          <span className="text-lg">🦊</span>
          <p className="text-sm font-semibold">Sobre tu mascota</p>
        </div>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Configura las opciones de Fox y Sir Quackington, tus mascotas y asistentes virtuales.
        </p>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">Mascota activa</p>
              <p className="text-xs text-[var(--text-muted)]">Mostrar a Fox en la app</p>
            </div>
            <button
              onClick={() => setFoxEnabled(!foxEnabled)}
              className={`relative h-6 w-11 rounded-full transition-colors ${foxEnabled ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${foxEnabled ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
            </button>
          </div>

          {foxEnabled && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Mensajes aleatorios</p>
                  <p className="text-xs text-[var(--text-muted)]">Fox te habla de vez en cuando con datos curiosos y chistes</p>
                </div>
                <button
                  onClick={() => setFoxRandomMessages(!foxRandomMessages)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${foxRandomMessages ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${foxRandomMessages ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Expresiones</p>
                  <p className="text-xs text-[var(--text-muted)]">Fox cambia de expresión según el contexto (pensando, celebrando, etc.)</p>
                </div>
                <button
                  onClick={() => setFoxExpressions(!foxExpressions)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${foxExpressions ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${foxExpressions ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Frases de la mascota</p>
                  <p className="text-xs text-[var(--text-muted)]">Si las apagas, tu mascota solo hace la animación sin decir nada</p>
                </div>
                <button
                  onClick={() => setPetQuotes(!petQuotes)}
                  className={`relative h-6 w-11 rounded-full transition-colors ${petQuotes ? 'bg-[var(--accent)]' : 'bg-[var(--surface-2)]'}`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${petQuotes ? 'left-5.5 translate-x-0' : 'left-0.5'}`} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div id="settings-data" className="card w-full scroll-mt-20 p-5">
        <p className="text-sm font-semibold">Backup</p>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Importa una copia para recuperar tareas, notas, apartados y temas. Para exportar tus datos, abre tu perfil.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--surface-2)]"
          >
            <Upload className="mr-1 inline h-4 w-4" /> Importar JSON
          </button>
        </div>

        {canEditSeasons && (
          <div className="mt-4">
            <p className="text-sm font-semibold">Temporadas (solo nosotros)</p>
            <p className="mt-1 text-sm text-[var(--text-muted)]">
              Pasa el apartado de Temporadas tal cual lo tienes. Exporta e importa en la otra cuenta.
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={exportSeasonsJSON} className="btn-primary">
                <Download className="h-4 w-4" /> Exportar Temporadas (.json)
              </button>
              <button
                onClick={() => seasonsImportRef.current?.click()}
                className="rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--surface-2)]"
              >
                <Upload className="mr-1 inline h-4 w-4" /> Importar Temporadas (.json)
              </button>
            </div>
            <button onClick={() => { if (confirm('¿Borrar todas las insignias y el historial de temporadas?')) resetSeasons() }} className="mt-3 rounded-xl border border-red-400/30 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-400/10">Reiniciar datos de Temporadas</button>
            <input
              ref={seasonsImportRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleSeasonsImport}
            />
          </div>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onImport}
        />
        {message && (
          <p className={`mt-3 text-xs ${message.ok ? 'text-emerald-300' : 'text-red-400'}`}>
            {message.text}
          </p>
        )}
      </div>

      {canEditSeasons && <AiAssistantCard />}
      <InviteCard />
      </div>

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Eliminar apartado"
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-muted)]">
            ¿Eliminar el apartado "{sections.find((s) => s.id === sectionToDelete)?.label ?? ''}" y sus tareas? Esta acción no se puede deshacer.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={confirmDeleteSection}
              className="btn-primary justify-center"
            >
              Eliminar
            </button>
            <button
              onClick={() => setDeleteOpen(false)}
              className="rounded-full border border-[var(--border)] py-2 text-sm text-[var(--text)] hover:bg-[var(--surface-2)]"
            >
              Cancelar
            </button>
          </div>
        </div>
      </Modal>

    </div>
  )
}
