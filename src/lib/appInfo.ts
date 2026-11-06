import { version } from '../../package.json'

export const APP_NAME = 'Quacker'
export const APP_VERSION = version
export const ADMIN_EMAIL = 'fmleonm19@gmail.com'
export const SEASONS_ACCESS_EMAILS = new Set([ADMIN_EMAIL, 'juanluisfrancorojas@gmail.com'])

export function canAccessSeasons(email: string | null | undefined): boolean {
  return !!email && SEASONS_ACCESS_EMAILS.has(email.trim().toLowerCase())
}
