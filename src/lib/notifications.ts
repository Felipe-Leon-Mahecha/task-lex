import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import type { Task } from '../types/task'
import { useSettingsStore } from '../store/settings'

const QUEUE_KEY = 'task-lex-reminders'
const MAP_KEY = 'task-lex-notif-ids'

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

async function scheduleNative(task: Task, at: Date, type?: string) {
  if (!nativePerm) {
    await requestPermission()
    if (!nativePerm) return
  }
  const nid = hashId(task.id + (type || ''))
  saveMap([...loadMap().filter((x) => x.taskId !== task.id), { taskId: task.id, nid }])
  
  // Create action type for task actions
  const actionTypeId = 'TASK_ACTIONS'
  
  await LocalNotifications.schedule({
    notifications: [
      {
        id: nid,
        title: `Flux: ${task.title}`,
        body: type ? `${type}: ${task.dueDate ? dueBody(task.dueDate) : 'Esta tarea vence ahora.'}` : (task.dueDate ? dueBody(task.dueDate) : 'Esta tarea vence ahora.'),
        schedule: { at },
        smallIcon: 'ic_stat_flux',
        iconColor: '#25d366',
        sound: 'notificacion_gem',
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
    const entry = map.find((x) => x.taskId === taskId)
    saveMap(map.filter((x) => x.taskId !== taskId))
    if (entry) {
      LocalNotifications.cancel({ notifications: [{ id: entry.nid }] }).catch(() => {})
    }
    return
  }
  saveQueue(loadQueue().filter((r) => r.taskId !== taskId))
}

export async function scheduleReminder(task: Task) {
  if (!notificationsEnabled()) return
  if (!task.dueDate) return
  
  // Schedule main reminder if reminderLead is set
  if (task.reminderLead) {
    const triggerTs = task.dueDate.getTime() - task.reminderLead
    await scheduleSingleReminder(task, triggerTs, 'Recordatorio')
  }
  
  // Schedule 2-hour before reminder if enabled
  if (task.reminder2HoursBefore && task.dueDate) {
    const twoHoursMs = 2 * 60 * 60 * 1000
    const triggerTs = task.dueDate.getTime() - twoHoursMs
    await scheduleSingleReminder(task, triggerTs, '2 horas antes')
  }
}

async function scheduleSingleReminder(task: Task, triggerTs: number, type: string) {
  if (isNative()) {
    if (triggerTs <= Date.now()) {
      await scheduleNative(task, new Date(), type)
    } else {
      await scheduleNative(task, new Date(triggerTs), type)
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
  }
  try {
    if ('NotificationTrigger' in window) {
      ;(options as NotificationOptions & { showTrigger: unknown }).showTrigger = new (
        window as unknown as { NotificationTrigger: new (opts: { timestamp: number }) => unknown }
      ).NotificationTrigger({ timestamp: triggerTs })
    }
    await reg.showNotification(`Flux: ${task.title}`, options)
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
        new Notification(`Flux: ${r.title}`, {
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
  
  if (activeTasks.length === 0) return
  
  const now = new Date()
  const hoursUntilDue = activeTasks.map((t) => {
    if (!t.dueDate) return Infinity
    const due = new Date(t.dueDate)
    const diff = due.getTime() - now.getTime()
    return diff / (1000 * 60 * 60)
  }).filter((h) => h > 0 && h < 24)
  
  if (hoursUntilDue.length === 0) return
  
  // Schedule reminders based on frequency (1-5 times per day)
  const interval = 24 / frequency // hours between reminders
  
  if (isNative()) {
    scheduleNativeDailyReminders(activeTasks, frequency, interval)
  }
}

async function scheduleNativeDailyReminders(tasks: Task[], frequency: number, interval: number) {
  if (!nativePerm) {
    await requestPermission()
    if (!nativePerm) return
  }
  
  const now = new Date()
  const notifications = []
  
  for (let i = 0; i < frequency; i++) {
    const reminderTime = new Date(now.getTime() + (i * interval * 60 * 60 * 1000))
    const pendingTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) > reminderTime)
    
    if (pendingTasks.length > 0) {
      const nid = hashId(`daily-${i}`)
      notifications.push({
        id: nid,
        title: `Flux: Tareas pendientes`,
        body: `Tienes ${pendingTasks.length} tarea(s) pendiente(s) para hoy.`,
        schedule: { at: reminderTime },
        smallIcon: 'ic_stat_flux',
        iconColor: '#25d366',
        sound: 'notificacion_gem',
      })
    }
  }
  
  if (notifications.length > 0) {
    await LocalNotifications.schedule({ notifications })
  }
}
