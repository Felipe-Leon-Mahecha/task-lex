const LAST_SYNC_KEY = 'task-lex-last-cloud-sync'

export function markCloudSync(uid: string) {
  const time = Date.now()
  try { localStorage.setItem(`${LAST_SYNC_KEY}:${uid}`, String(time)) } catch {}
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('tasklex:cloud-synced', { detail: { uid, time } }))
}

export function lastCloudSyncAt(uid?: string | null): number | null {
  try {
    const value = Number(uid ? localStorage.getItem(`${LAST_SYNC_KEY}:${uid}`) : null)
    return Number.isFinite(value) && value > 0 ? value : null
  } catch { return null }
}
