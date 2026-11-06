import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'task-lex-season-background'
const OPACITY_KEY = 'task-lex-season-background-opacity'
const CHANGE_EVENT = 'task-lex-season-background-change'

function getSnapshot(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function subscribe(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function useSeasonBackground(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot, () => null)
}

export function getSeasonBgOpacity(): number {
  if (typeof window === 'undefined') return 0.25
  try {
    const raw = window.localStorage.getItem(OPACITY_KEY)
    const n = raw === null ? 0.25 : Number(raw)
    if (!Number.isFinite(n)) return 0.25
    return Math.min(1, Math.max(0.05, n))
  } catch {
    return 0.25
  }
}

export function useSeasonBgOpacity(): number {
  return useSyncExternalStore(subscribe, getSeasonBgOpacity, () => 0.25)
}

export function saveSeasonBgOpacity(value: number): void {
  try {
    window.localStorage.setItem(OPACITY_KEY, String(Math.min(1, Math.max(0.05, value))))
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    return
  }
}

export function saveSeasonBackground(dataUrl: string): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, dataUrl)
    window.dispatchEvent(new Event(CHANGE_EVENT))
    return true
  } catch {
    return false
  }
}

export function clearSeasonBackground(): void {
  let changed = false
  try {
    if (window.localStorage.getItem(STORAGE_KEY) !== null) {
      window.localStorage.removeItem(STORAGE_KEY)
      changed = true
    }
    if (window.localStorage.getItem(OPACITY_KEY) !== null) {
      window.localStorage.removeItem(OPACITY_KEY)
      changed = true
    }
  } catch {
    return
  }
  if (!changed) return
  try {
    window.dispatchEvent(new Event(CHANGE_EVENT))
  } catch {
    return
  }
}
