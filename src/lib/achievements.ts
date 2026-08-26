import type { Task } from '../types/task'
import { startOfDay } from './dateUtils'
import { totalFocusMinutes } from './focusStats'

export interface Achievement {
  id: string
  title: string
  desc: string
  reward: number
  check: (s: AchievementStats) => boolean
}

export interface AchievementStats {
  totalCompleted: number
  streakDays: number
  focusMinutes: number
  bestDayCount: number
}

const STORAGE_KEY = 'task-lex-achievements'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'primera', title: 'Primer paso', desc: 'Completa tu primera tarea', reward: 10, check: (s) => s.totalCompleted >= 1 },
  { id: 'diez', title: 'En rueda', desc: 'Completa 10 tareas', reward: 15, check: (s) => s.totalCompleted >= 10 },
  { id: 'cincuenta', title: 'Máquina', desc: 'Completa 50 tareas', reward: 40, check: (s) => s.totalCompleted >= 50 },
  { id: 'cien', title: 'Centenario', desc: 'Completa 100 tareas', reward: 80, check: (s) => s.totalCompleted >= 100 },
  { id: 'quinientos', title: 'Leyenda', desc: 'Completa 500 tareas', reward: 200, check: (s) => s.totalCompleted >= 500 },
  { id: 'racha3', title: 'Tres seguidos', desc: 'Racha de 3 días productivos', reward: 20, check: (s) => s.streakDays >= 3 },
  { id: 'racha7', title: 'Semana perfecta', desc: 'Racha de 7 días', reward: 50, check: (s) => s.streakDays >= 7 },
  { id: 'racha30', title: 'Imparable', desc: 'Racha de 30 días', reward: 150, check: (s) => s.streakDays >= 30 },
  { id: 'dia10', title: 'Día brutal', desc: '10 tareas completadas en un solo día', reward: 30, check: (s) => s.bestDayCount >= 10 },
  { id: 'dia20', title: 'Superhumano', desc: '20 tareas en un solo día', reward: 70, check: (s) => s.bestDayCount >= 20 },
  { id: 'foco60', title: 'Hora de foco', desc: '60 minutos de foco acumulados', reward: 15, check: (s) => s.focusMinutes >= 60 },
  { id: 'foco600', title: 'Zen master', desc: '600 minutos de foco acumulados', reward: 60, check: (s) => s.focusMinutes >= 600 },
  { id: 'foco3000', title: 'Monje del foco', desc: '3000 minutos de foco acumulados', reward: 250, check: (s) => s.focusMinutes >= 3000 },
]

function load(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function save(ids: string[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
}

export function unlockedAchievements(): string[] {
  return load()
}

export function computeAchievementStats(tasks: Task[]): AchievementStats {
  const done = tasks.filter((t) => t.status === 'done')
  const byDay = new Map<string, number>()
  for (const t of done) {
    if (!t.completedAt) continue
    const key = startOfDay(t.completedAt).toDateString()
    byDay.set(key, (byDay.get(key) ?? 0) + 1)
  }
  const doneOnDay = (d: Date) => byDay.has(startOfDay(d).toDateString())
  let streak = 0
  const cursor = startOfDay(new Date())
  if (!doneOnDay(cursor)) cursor.setDate(cursor.getDate() - 1)
  while (doneOnDay(cursor)) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  let bestDayCount = 0
  for (const n of byDay.values()) bestDayCount = Math.max(bestDayCount, n)

  return {
    totalCompleted: done.length,
    streakDays: streak,
    focusMinutes: totalFocusMinutes(),
    bestDayCount,
  }
}

export function evaluateAchievements(tasks: Task[]): Achievement[] {
  const stats = computeAchievementStats(tasks)
  const already = new Set(load())
  const fresh: Achievement[] = []
  for (const a of ACHIEVEMENTS) {
    if (!already.has(a.id) && a.check(stats)) {
      already.add(a.id)
      fresh.push(a)
    }
  }
  if (fresh.length > 0) save([...already])
  return fresh
}
