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

async function scheduleNative(task: Task, at: Date) {
  if (!nativePerm) {
    await requestPermission()
    if (!nativePerm) return
  }
  const nid = hashId(task.id)
  saveMap([...loadMap().filter((x) => x.taskId !== task.id), { taskId: task.id, nid }])
  await LocalNotifications.schedule({
    notifications: [
      {
        id: nid,
        title: `Flux: ${task.title}`,
        body: task.dueDate ? dueBody(task.dueDate) : 'Esta tarea vence ahora.',
        schedule: { at },
        smallIcon: 'ic_stat_flux',
        iconColor: '#25d366',
      },
    ],
  })
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
  if (!task.dueDate || !task.reminderLead) return
  const triggerTs = task.dueDate.getTime() - task.reminderLead
  if (isNative()) {
    if (triggerTs <= Date.now()) {
      await scheduleNative(task, new Date())
    } else {
      await scheduleNative(task, new Date(triggerTs))
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
    body: dueBody(task.dueDate),
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
