import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'
import { useSettingsStore } from '../../store/settings'
import { ensureQuackerNotificationChannel, QUACKER_NOTIFICATION_CHANNEL } from '../systemNotificationSound'

const SEASON_REMINDER_1 = 9041
const SEASON_REMINDER_2 = 9042

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate()
}

function nextDay(from: Date, day: number): Date {
  const clamp = Math.min(day, daysInMonth(from.getFullYear(), from.getMonth()))
  let d = new Date(from.getFullYear(), from.getMonth(), clamp, 9, 0, 0, 0)
  if (d > from) return d
  const m = from.getMonth() + 1
  const y = m === 12 ? from.getFullYear() + 1 : from.getFullYear()
  return new Date(y, m % 12, Math.min(day, daysInMonth(y, m % 12)), 9, 0, 0, 0)
}

export async function scheduleSeasonReminders() {
  if (!Capacitor.isNativePlatform()) return
  if (!useSettingsStore.getState().notificationsOn) return
  const perm = await LocalNotifications.checkPermissions().catch(() => null)
  if (!perm || perm.display !== 'granted') return

  const now = new Date()
  const first = nextDay(now, 1)
  const fifteenth = nextDay(now, 15)
  if (first.getTime() === fifteenth.getTime()) {
    fifteenth.setDate(fifteenth.getDate() + 30)
  }

  try {
    await LocalNotifications.cancel({
      notifications: [{ id: SEASON_REMINDER_1 }, { id: SEASON_REMINDER_2 }],
    })
  } catch {}

  try {
    await ensureQuackerNotificationChannel()
    await LocalNotifications.schedule({
      notifications: [
        {
          id: SEASON_REMINDER_1,
          title: 'Quacker: ¡Sorteemos temporada!',
          body: 'Día 1 del mes: toca elegir la temporada. Entrá a Temporadas y sorteá una.',
          schedule: { at: first },
          smallIcon: 'ic_stat_flux',
          iconColor: '#d4a017',
          sound: 'notification_system',
          channelId: QUACKER_NOTIFICATION_CHANNEL,
        },
        {
          id: SEASON_REMINDER_2,
          title: 'Quacker: actualizá tu temporada',
          body: 'Día 15: momento de cambiar el personaje o el fondo de la temporada.',
          schedule: { at: fifteenth },
          smallIcon: 'ic_stat_flux',
          iconColor: '#d4a017',
          sound: 'notification_system',
          channelId: QUACKER_NOTIFICATION_CHANNEL,
        },
      ],
    })
  } catch {}
}
