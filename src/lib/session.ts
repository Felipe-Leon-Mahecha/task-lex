import type { User } from 'firebase/auth'

let currentUser: User | null = null

const UID_KEY = 'task-lex-uid'

export function setSessionUser(user: User | null) {
  currentUser = user
}

export function getUid(): string | null {
  return currentUser?.uid ?? null
}

export function getCacheUid(): string | null {
  try {
    return localStorage.getItem(UID_KEY)
  } catch {
    return null
  }
}

export function setCacheUid(uid: string | null) {
  try {
    if (uid) localStorage.setItem(UID_KEY, uid)
    else localStorage.removeItem(UID_KEY)
  } catch {}
}
