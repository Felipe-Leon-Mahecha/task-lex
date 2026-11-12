import type { User } from 'firebase/auth'

let timer = 0
let busy = false

async function heartbeat(user: User) {
  if (busy || document.visibilityState !== 'visible') return
  busy = true
  try {
    const token = await user.getIdToken()
    await fetch('/api/presence', { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
  } catch {} finally { busy = false }
}

export function startPresence(user: User): () => void {
  stopPresence()
  void heartbeat(user)
  timer = window.setInterval(() => void heartbeat(user), 60_000)
  const onVisible = () => { if (document.visibilityState === 'visible') void heartbeat(user) }
  document.addEventListener('visibilitychange', onVisible)
  return () => { stopPresence(); document.removeEventListener('visibilitychange', onVisible) }
}

export function stopPresence() {
  if (timer) window.clearInterval(timer)
  timer = 0
}

export type PresenceCounts = { online: number; offlineRecent: number }

export async function loadPresenceCounts(user: User): Promise<PresenceCounts> {
  const token = await user.getIdToken()
  const response = await fetch('/api/presence', { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' })
  if (!response.ok) throw new Error('No se pudieron cargar los datos de actividad.')
  const result = await response.json() as Partial<PresenceCounts>
  if (!Number.isFinite(result.online) || !Number.isFinite(result.offlineRecent)) throw new Error('Respuesta de actividad inválida.')
  return { online: result.online!, offlineRecent: result.offlineRecent! }
}
