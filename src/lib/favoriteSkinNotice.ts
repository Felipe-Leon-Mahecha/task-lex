import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { getDailyRotation, getDailySelection } from './foxSkins'
import { QUACKINGTON_COLLECTIBLE_SKINS } from './quackingtonSkins'
import { ensureQuackerNotificationChannel, QUACKER_NOTIFICATION_CHANNEL } from './systemNotificationSound'

const LINES = [
  '¡Una de tus skins favoritas llegó a la tienda!',
  'Tu próxima skin favorita puede ser tuya: está disponible hoy.',
  'La tienda tiene una sorpresa que guardaste en favoritos.',
]

export async function cancelFavoriteSkinNotices(uid: string | undefined) {
  if (!uid || !Capacitor.isNativePlatform()) return
  const key = `quacker-favorite-skin-schedule:${uid}`
  try {
    const ids = JSON.parse(localStorage.getItem(key) ?? '[]') as number[]
    if (ids.length) await LocalNotifications.cancel({ notifications: ids.map((id) => ({ id })) })
    localStorage.removeItem(key)
  } catch {}
}

export async function scheduleFavoriteSkinNotice(args: {
  uid: string
  enabled: boolean
  favoriteFoxIds: string[]
  favoriteDuckIds: string[]
  quackingtonOwned: boolean
}) {
  const { uid, enabled, favoriteFoxIds, favoriteDuckIds, quackingtonOwned } = args
  if (!uid) return
  const key = `quacker-favorite-skin-schedule:${uid}`
  let oldIds: number[] = []
  try { oldIds = JSON.parse(localStorage.getItem(key) ?? '[]') } catch {}
  if (Capacitor.isNativePlatform()) {
    if (oldIds.length) await LocalNotifications.cancel({ notifications: oldIds.map((id) => ({ id })) }).catch(() => {})
    if (!enabled || (!favoriteFoxIds.length && !favoriteDuckIds.length)) { localStorage.removeItem(key); return }
    const permission = await LocalNotifications.checkPermissions().catch(() => null)
    if (permission?.display !== 'granted') return
    const notifications: { id: number; title: string; body: string; schedule: { at: Date; allowWhileIdle: boolean }; sound: string; channelId: string }[] = []
    const scheduledIds: number[] = []
    const start = new Date(); start.setHours(0, 0, 0, 0)
    const ducks = QUACKINGTON_COLLECTIBLE_SKINS.filter((skin) => skin.id !== 'animado')
    for (let offset = 0; offset < 30; offset++) {
      const date = new Date(start); date.setDate(start.getDate() + offset)
      const foxNames = getDailyRotation(date).filter((skin) => favoriteFoxIds.includes(skin.id)).map((skin) => skin.name)
      const duckNames = quackingtonOwned ? getDailySelection(ducks, 'quackington', 5, date).filter((skin) => favoriteDuckIds.includes(skin.id)).map((skin) => skin.name) : []
      if (!foxNames.length && !duckNames.length) continue
      const day = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
      const id = Math.abs([...`${uid}:${day}`].reduce((hash, char) => (Math.imul(hash, 31) + char.charCodeAt(0)) | 0, 0)) || 1
      const emoji = foxNames.length && duckNames.length ? '🦊🦆' : duckNames.length ? '🦆' : '🦊'
      const body = `${LINES[Math.floor(Math.random() * LINES.length)]} ${emoji}`
      const at = new Date(date); at.setHours(9, 0, 0, 0)
      if (at.getTime() < Date.now()) at.setTime(Date.now() + 1200)
      notifications.push({ id, title: 'Favoritos en Quacker', body, schedule: { at, allowWhileIdle: true }, sound: 'notification_system', channelId: QUACKER_NOTIFICATION_CHANNEL })
      scheduledIds.push(id)
    }
    if (notifications.length) {
      await ensureQuackerNotificationChannel()
      await LocalNotifications.schedule({ notifications })
    }
    localStorage.setItem(key, JSON.stringify(scheduledIds))
    return
  }
  if (!enabled || (!('Notification' in window) || Notification.permission !== 'granted')) return
  const date = new Date()
  const foxNames = getDailyRotation(date).filter((skin) => favoriteFoxIds.includes(skin.id)).map((skin) => skin.name)
  const duckNames = quackingtonOwned ? getDailySelection(QUACKINGTON_COLLECTIBLE_SKINS.filter((skin) => skin.id !== 'animado'), 'quackington', 5, date).filter((skin) => favoriteDuckIds.includes(skin.id)).map((skin) => skin.name) : []
  if (!foxNames.length && !duckNames.length) return
  const emoji = foxNames.length && duckNames.length ? '🦊🦆' : duckNames.length ? '🦆' : '🦊'
  new Notification('Favoritos en Quacker', { body: `${LINES[Math.floor(Math.random() * LINES.length)]} ${emoji}` })
}
