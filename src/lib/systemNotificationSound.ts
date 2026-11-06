import { Capacitor } from '@capacitor/core'
import { LocalNotifications } from '@capacitor/local-notifications'

export const QUACKER_NOTIFICATION_CHANNEL = 'quacker_notices_v3'

let channelReady: Promise<void> | null = null

/** A new channel ID applies the updated downloaded notification tone on existing Android installs. */
export function ensureQuackerNotificationChannel(): Promise<void> {
  if (Capacitor.getPlatform() !== 'android') return Promise.resolve()
  if (!channelReady) {
    channelReady = LocalNotifications.createChannel({
      id: QUACKER_NOTIFICATION_CHANNEL,
      name: 'Avisos de Quacker',
      description: 'Recordatorios y novedades de la aplicación.',
      importance: 3,
      sound: 'notification_system',
      vibration: true,
    }).catch((error) => {
      channelReady = null
      throw error
    })
  }
  return channelReady
}
