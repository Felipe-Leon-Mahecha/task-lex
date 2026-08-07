import { getUid } from './session'
import { saveFocusLog } from './taskDb'

type FocusEntry = { d: string; min: number }

const KEY = 'task-lex-focus-log'

export function dayKey(d: Date) {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

function load(): FocusEntry[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]') as FocusEntry[]
  } catch {
    return []
  }
}

function save(list: FocusEntry[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {}
}

export function getFocusLog(): FocusEntry[] {
  return load()
}

export function mergeRemoteFocus(remote: FocusEntry[]) {
  const local = load()
  const map = new Map<string, number>()
  for (const e of [...local, ...remote]) map.set(e.d, Math.max(map.get(e.d) ?? 0, e.min))
  const merged = Array.from(map.entries())
    .map(([d, min]) => ({ d, min }))
    .sort((a, b) => a.d.localeCompare(b.d))
    .slice(-90)
  save(merged)
}

export function addFocusMinutes(min: number) {
  const list = load()
  const k = dayKey(new Date())
  const i = list.findIndex((e) => e.d === k)
  if (i >= 0) list[i] = { d: k, min: list[i].min + min }
  else list.push({ d: k, min })
  const slim = list.slice(-90)
  save(slim)
  const uid = getUid()
  if (uid) saveFocusLog(uid, slim).catch(() => {})
}

export function last7Focus(): { label: string; min: number }[] {
  const map = new Map(load().map((e) => [e.d, e.min]))
  const labels = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
  const out: { label: string; min: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push({ label: labels[d.getDay()], min: map.get(dayKey(d)) ?? 0 })
  }
  return out
}

export function totalFocusMinutes() {
  return load().reduce((a, e) => a + e.min, 0)
}
