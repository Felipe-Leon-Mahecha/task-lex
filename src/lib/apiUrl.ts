import { Capacitor } from '@capacitor/core'

const API_ORIGIN = Capacitor.getPlatform() === 'android'
  ? 'https://task-lex.vercel.app'
  : window.location.origin

export function apiUrl(path: string): string {
  return `${API_ORIGIN}/${path.replace(/^\/+/, '')}`
}
