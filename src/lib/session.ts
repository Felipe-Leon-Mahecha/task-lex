import type { User } from 'firebase/auth'

let currentUser: User | null = null

export function setSessionUser(user: User | null) {
  currentUser = user
}

export function getUid(): string | null {
  return currentUser?.uid ?? null
}
