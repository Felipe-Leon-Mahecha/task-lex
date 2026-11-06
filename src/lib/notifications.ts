import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { ReminderKind, Task } from '../types/task'
import { useSettingsStore } from '../store/settings'
import { ensureQuackerNotificationChannel, QUACKER_NOTIFICATION_CHANNEL } from './systemNotificationSound'

const QUEUE_KEY = 'task-lex-reminders'
const MAP_KEY = 'task-lex-notif-ids'
const DAILY_REMINDER_TASK_ID = '__quacker_daily_reminders__'

type Queued = { taskId: string; title: string; due: string; notified: boolean }
type NotifMap = { taskId: string; nid: number }[]

let swReg: ServiceWorkerRegistration | null = null
let nativePerm = false

const isNative = () => Capacitor.isNativePlatform()

export function notificationsEnabled() {
  return useSettingsStore.getState().notificationsOn
}

function hashId(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h) || 1
}

export async function requestPermission() {
  if (!notificationsEnabled()) return false
  if (isNative()) {
    const res = await LocalNotifications.requestPermissions()
    nativePerm = res.display === 'granted'
    return nativePerm
  }
  if (!('Notification' in window)) return false
  if (Notification.permission === 'default') {
    await Notification.requestPermission()
  }
  return Notification.permission === 'granted'
}

function loadQueue(): Queued[] {
  try {
    return JSON.parse(localStorage.getItem(QUEUE_KEY) ?? '[]') as Queued[]
  } catch {
    return []
  }
}

function saveQueue(q: Queued[]) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
}

function loadMap(): NotifMap {
  try {
    return JSON.parse(localStorage.getItem(MAP_KEY) ?? '[]') as NotifMap
  } catch {
    return []
  }
}

function saveMap(m: NotifMap) {
  localStorage.setItem(MAP_KEY, JSON.stringify(m))
}

function queueReminder(task: Task) {
  if (!task.dueDate) return
  const q = loadQueue()
  if (!q.some((r) => r.taskId === task.id)) {
    q.push({ taskId: task.id, title: task.title, due: task.dueDate.toISOString(), notified: false })
    saveQueue(q)
  }
}

function dueBody(due: Date) {
  return `Vence ${new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(due)}`
}

async function scheduleNative(task: Task, at: Date, type?: string, alarm = false) {
  if (!alarm) await ensureQuackerNotificationChannel().catch(() => {})
  if (!nativePerm) {
    await requestPermission()
    if (!nativePerm) return
  }
  const nid = hashId(task.id + (type || '') + (alarm ? '|alarm' : ''))
  saveMap([...loadMap().filter((x) => !(x.taskId === task.id && x.nid === nid)), { taskId: task.id, nid }])

  // Create action type for task actions
  const actionTypeId = 'TASK_ACTIONS'

  await LocalNotifications.schedule({
    notifications: [
      {
        id: nid,
        title: alarm ? `Alarma: ${task.title}` : `Quacker: ${task.title}`,
        body: type ? `${type}: ${task.dueDate ? dueBody(task.dueDate) : 'Esta tarea vence ahora.'}` : (task.dueDate ? dueBody(task.dueDate) : 'Esta tarea vence ahora.'),
        schedule: { at },
        smallIcon: 'ic_stat_flux',
        iconColor: '#25d366',
        sound: alarm ? 'alarma_quacker' : 'notification_system',
        ...(!alarm ? { channelId: QUACKER_NOTIFICATION_CHANNEL } : {}),
        ongoing: alarm,
        autoCancel: true,
        ...(alarm ? { vibration: true } : {}),
        actionTypeId,
        extra: { taskId: task.id },
      },
    ],
  })
  
  // Register action type if not already registered
  try {
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: actionTypeId,
          actions: [
            {
              id: 'complete',
              title: 'Completar',
              requiresAuthentication: false,
            },
            {
              id: 'snooze',
              title: 'Posponer 10 min',
              requiresAuthentication: false,
            },
          ],
        },
      ],
    })
  } catch (error) {
    console.error('Error registering action type:', error)
  }
}

export function cancelReminder(taskId: string) {
  if (isNative()) {
    const map = loadMap()
    const entries = map.filter((x) => x.taskId === taskId)
    saveMap(map.filter((x) => x.taskId !== taskId))
    if (entries.length > 0) {
      LocalNotifications.cancel({ notifications: entries.map((e) => ({ id: e.nid })) }).catch(() => {})
    }
    return
  }
  saveQueue(loadQueue().filter((r) => r.taskId !== taskId))
}

export async function scheduleReminder(task: Task) {
  if (!notificationsEnabled()) return
  if (!task.dueDate) return
  
  const kind: ReminderKind = task.reminderKind ?? 'notificacion'
  // Schedule main reminder if reminderLead is set (lead is in minutes)
  if (task.reminderLead) {
    const triggerTs = task.dueDate.getTime() - task.reminderLead * 60000
    await scheduleSingleReminder(task, triggerTs, 'Recordatorio', kind)
  }
  
  // Schedule 2-hour before reminder if enabled
  if (task.reminder2HoursBefore && task.dueDate) {
    const twoHoursMs = 2 * 60 * 60 * 1000
    const triggerTs = task.dueDate.getTime() - twoHoursMs
    await scheduleSingleReminder(task, triggerTs, '2 horas antes', kind)
  }
}

async function scheduleSingleReminder(task: Task, triggerTs: number, type: string, kind: ReminderKind = 'notificacion') {
  if (isNative()) {
    const at = new Date(Math.max(triggerTs, Date.now()))
    if (kind === 'ambas') {
      await scheduleNative(task, at, type, false)
      await scheduleNative(task, at, type, true)
    } else {
      await scheduleNative(task, at, type, kind === 'alarma')
    }
    return
  }
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const reg = await getSW()
  if (!reg) {
    queueReminder(task)
    return
  }
  if (triggerTs <= Date.now()) {
    queueReminder(task)
    return
  }
  const options: NotificationOptions = {
    body: task.dueDate ? `${type}: ${dueBody(task.dueDate)}` : `${type}: Esta tarea vence ahora.`,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    requireInteraction: kind !== 'notificacion',
  }
  try {
    if ('NotificationTrigger' in window) {
      ;(options as NotificationOptions & { showTrigger: unknown }).showTrigger = new (
        window as unknown as { NotificationTrigger: new (opts: { timestamp: number }) => unknown }
      ).NotificationTrigger({ timestamp: triggerTs })
    }
    await reg.showNotification(`Quacker: ${task.title}`, options)
  } catch {
    queueReminder(task)
  }
}

export function disableAllReminders() {
  if (isNative()) {
    const map = loadMap()
    saveMap([])
    if (map.length > 0) {
      LocalNotifications.cancel({ notifications: map.map((x) => ({ id: x.nid })) }).catch(() => {})
    }
    return
  }
  saveQueue([])
}

async function getSW() {
  if (swReg) return swReg
  if (!('serviceWorker' in navigator)) return null
  swReg = (await navigator.serviceWorker.getRegistration()) ?? null
  return swReg
}

export function runDueCheck() {
  if (isNative()) return
  if (!notificationsEnabled()) return
  if (!('Notification' in window) || Notification.permission !== 'granted') return
  const now = Date.now()
  let changed = false
  const q = loadQueue()
  for (const r of q) {
    if (!r.notified && new Date(r.due).getTime() <= now) {
      try {
        new Notification(`Quacker: ${r.title}`, {
          body: 'Esta tarea vence ahora.',
          icon: '/icons/icon-192.png',
        })
        r.notified = true
        changed = true
      } catch {}
    }
  }
  if (changed) saveQueue(q.filter((r) => new Date(r.due).getTime() > now - 86400000))
}

export function scheduleDailyReminders(tasks: Task[]) {
  if (!notificationsEnabled()) return
  const frequency = useSettingsStore.getState().dailyReminderFrequency
  const activeTasks = tasks.filter((t) => t.status !== 'done' && !t.archived && t.dueDate)

  if (isNative()) scheduleNativeDailyReminders(activeTasks, frequency)
}

export interface FiredAlarm {
  key: string
  taskId: string
  title: string
  dueLabel: string
}

const ALARMED_KEY = 'task-lex-alarmed'
const SNOOZE_KEY = 'task-lex-alarm-snooze'
const TONE_PREFIX = 'quacker-alarm-tone'
const MAX_TONE_BYTES = 5 * 1024 * 1024
const MAX_TONE_SECONDS = 15

async function audioDuration(file: File): Promise<number> {
  const url = URL.createObjectURL(file)
  const audio = new Audio()
  audio.preload = 'metadata'
  audio.src = url
  try {
    return await new Promise<number>((resolve, reject) => {
      const timeout = window.setTimeout(() => reject(new Error('No se pudo revisar la duración del audio.')), 8000)
      audio.onloadedmetadata = () => {
        window.clearTimeout(timeout)
        if (!Number.isFinite(audio.duration) || audio.duration <= 0) reject(new Error('El archivo de audio no se pudo validar.'))
        else resolve(audio.duration)
      }
      audio.onerror = () => {
        window.clearTimeout(timeout)
        reject(new Error('El archivo de audio no se pudo abrir.'))
      }
    })
  } finally {
    audio.pause()
    audio.removeAttribute('src')
    URL.revokeObjectURL(url)
  }
}

function bufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + 0x8000)))
  }
  return btoa(s)
}

export async function saveAlarmTone(file: File): Promise<{ name: string; path: string }> {
  if (file.size > MAX_TONE_BYTES) throw new Error('El tono debe pesar menos de 5 MB.')
  const duration = await audioDuration(file)
  if (duration > MAX_TONE_SECONDS) throw new Error('El tono debe durar 15 segundos o menos.')
  const ext = (file.name.split('.').pop() || 'mp3').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp3'
  const path = `${TONE_PREFIX}.${ext}`
  const data = bufferToBase64(await file.arrayBuffer())
  await Filesystem.writeFile({ path, data, directory: Directory.Data, recursive: true })
  return { name: file.name, path }
}

export async function deleteAlarmTone(path: string) {
  try {
    await Filesystem.deleteFile({ path, directory: Directory.Data })
  } catch {}
}

export async function alarmToneUrl(path: string): Promise<string | null> {
  try {
    const uri = await Filesystem.getUri({ path, directory: Directory.Data })
    return Capacitor.convertFileSrc(uri.uri)
  } catch {
    return null
  }
}

interface AlarmedEntry {
  k: string
  at: number
}

interface SnoozeEntry {
  taskId: string
  title: string
  at: number
}

function loadAlarmed(): AlarmedEntry[] {
  try {
    const v = JSON.parse(localStorage.getItem(ALARMED_KEY) ?? '[]') as AlarmedEntry[]
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

function wasAlarmed(key: string): boolean {
  return loadAlarmed().some((e) => e.k === key)
}

function markAlarmed(key: string) {
  const list = loadAlarmed().filter((e) => e.k !== key && Date.now() - e.at < 48 * 3600 * 1000)
  list.push({ k: key, at: Date.now() })
  try {
    localStorage.setItem(ALARMED_KEY, JSON.stringify(list))
  } catch {}
}

function loadSnoozes(): SnoozeEntry[] {
  try {
    const v = JSON.parse(localStorage.getItem(SNOOZE_KEY) ?? '[]') as SnoozeEntry[]
    return Array.isArray(v) ? v : []
  } catch {
    return []
  }
}

export function snoozeAlarm(taskId: string, title: string, minutes = 10) {
  const list = loadSnoozes().filter((s) => s.at > Date.now() - 3600000)
  list.push({ taskId, title, at: Date.now() + minutes * 60000 })
  try {
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(list))
  } catch {}
}

export function checkAlarms(tasks: Task[]): FiredAlarm | null {
  if (!notificationsEnabled()) return null
  const now = Date.now()
  const fresh = (ts: number) => ts <= now && now - ts < 24 * 3600 * 1000
  const snoozes = loadSnoozes()
  const keep: SnoozeEntry[] = []
  for (const s of snoozes) {
    if (fresh(s.at)) {
      const key = `snz:${s.taskId}:${s.at}`
      if (!wasAlarmed(key)) {
        markAlarmed(key)
        try {
          localStorage.setItem(
            SNOOZE_KEY,
            JSON.stringify(snoozes.filter((x) => x !== s)),
          )
        } catch {}
        return { key, taskId: s.taskId, title: s.title, dueLabel: 'Pospuesta' }
      }
    } else if (s.at > now) {
      keep.push(s)
    }
  }
  try {
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(keep))
  } catch {}
  for (const t of tasks) {
    if (t.status === 'done' || t.archived || !t.dueDate) continue
    if (t.dueDate.getTime() <= now) continue
    const kind = t.reminderKind ?? 'notificacion'
    if (kind !== 'alarma' && kind !== 'ambas') continue
    const triggers: { ts: number; tag: string }[] = []
    if (t.reminderLead) triggers.push({ ts: t.dueDate.getTime() - t.reminderLead * 60000, tag: 'lead' })
    if (t.reminder2HoursBefore) triggers.push({ ts: t.dueDate.getTime() - 2 * 3600 * 1000, tag: '2h' })
    for (const tr of triggers) {
      const key = `rmd:${t.id}:${tr.tag}:${tr.ts}`
      if (fresh(tr.ts) && !wasAlarmed(key)) {
        markAlarmed(key)
        return { key, taskId: t.id, title: t.title, dueLabel: dueBody(t.dueDate) }
      }
    }
  }
  return null
}

function localDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function dailyReminderTimes(day: Date, frequency: number) {
  const count = Math.max(1, Math.min(5, Math.round(frequency)))
  const firstHour = 9
  const lastHour = 17
  return Array.from({ length: count }, (_, index) => {
    const hour = count === 1 ? firstHour : firstHour + (lastHour - firstHour) * index / (count - 1)
    const at = new Date(day)
    at.setHours(Math.floor(hour), Math.round((hour % 1) * 60), 0, 0)
    return at
  })
}

async function scheduleNativeDailyReminders(tasks: Task[], frequency: number) {
  await ensureQuackerNotificationChannel().catch(() => {})
  const now = new Date()
  const startOfToday = new Date(now)
  startOfToday.setHours(0, 0, 0, 0)
  const days = [startOfToday, new Date(startOfToday)]
  days[1]!.setDate(days[1]!.getDate() + 1)
  const slotsPerDay = Math.max(1, Math.min(5, Math.round(frequency)))

  // Remove both the old immediate `daily-0` alarms and this date-based schedule
  // before rebuilding it. This also clears a bad same-night reminder left by an
  // earlier app version when the user opens Quacker late in the evening.
  const ids = new Set<number>(Array.from({ length: 5 }, (_, index) => hashId(`daily-${index}`)))
  for (const day of [new Date(startOfToday.getTime() - 86400000), ...days, new Date(days[1]!.getTime() + 86400000)]) {
    const key = localDateKey(day)
    for (let index = 0; index < 5; index++) ids.add(hashId(`daily-${key}-${index}`))
  }
  const map = loadMap()
  const previousDaily = map.filter((entry) => entry.taskId === DAILY_REMINDER_TASK_ID)
  saveMap(map.filter((entry) => entry.taskId !== DAILY_REMINDER_TASK_ID))
  await LocalNotifications.cancel({
    notifications: [...new Set([...ids, ...previousDaily.map((entry) => entry.nid)])].map((id) => ({ id })),
  }).catch(() => {})

  if (!tasks.length) return
  if (!nativePerm) {
    await requestPermission()
    if (!nativePerm) return
  }

  const notifications = []
  for (const day of days) {
    const dayKey = localDateKey(day)
    const dueToday = tasks.filter((task) => task.dueDate && localDateKey(task.dueDate) === dayKey)
    if (!dueToday.length) continue

    const times = dailyReminderTimes(day, slotsPerDay)
    for (let index = 0; index < times.length; index++) {
      const reminderTime = times[index]!
      if (reminderTime.getTime() <= now.getTime() + 60_000) continue
      const pendingTasks = dueToday.filter((task) => task.dueDate && task.dueDate.getTime() > reminderTime.getTime())
      if (!pendingTasks.length) continue

      notifications.push({
        id: hashId(`daily-${dayKey}-${index}`),
        title: 'Quacker: Tareas pendientes',
        body: `Tienes ${pendingTasks.length} tarea(s) pendiente(s) para hoy.`,
        schedule: { at: reminderTime },
        smallIcon: 'ic_stat_flux',
        iconColor: '#25d366',
        sound: 'notification_system',
        channelId: QUACKER_NOTIFICATION_CHANNEL,
      })
    }
  }

  if (notifications.length) {
    await LocalNotifications.schedule({ notifications })
    saveMap([
      ...loadMap().filter((entry) => entry.taskId !== DAILY_REMINDER_TASK_ID),
      ...notifications.map(({ id }) => ({ taskId: DAILY_REMINDER_TASK_ID, nid: id })),
    ])
  }
}
