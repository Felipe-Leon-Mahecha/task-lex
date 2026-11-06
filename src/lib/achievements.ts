import type { Task } from '../types/task'
import { startOfDay } from './dateUtils'
import { totalFocusMinutes } from './focusStats'

export interface Achievement {
  id: string
  title: string
  desc: string
  reward: number
  check: (s: AchievementStats) => boolean
  season?: { label: string; period: string }
}

export interface AchievementStats {
  totalCompleted: number
  streakDays: number
  focusMinutes: number
  bestDayCount: number
  daysActive: number
  spiderCrushes: number
}

export const ACHIEVEMENT_SKIN_REWARDS: Record<string, string> = { 'fantasma-aplastador': 'fantasma' }

const STORAGE_KEY = 'task-lex-achievements'
const CLAIMABLE_KEY = 'task-lex-achievements-claimable'
const CLAIMED_KEY = 'task-lex-achievements-claimed'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'primera', title: 'Primer paso', desc: 'Completa tu primera tarea', reward: 10, check: (s) => s.totalCompleted >= 1 },
  { id: 'diez', title: 'En rueda', desc: 'Completa 10 tareas', reward: 15, check: (s) => s.totalCompleted >= 10 },
  { id: 'cincuenta', title: 'Máquina', desc: 'Completa 50 tareas', reward: 40, check: (s) => s.totalCompleted >= 50 },
  { id: 'cien', title: 'Centenario', desc: 'Completa 100 tareas', reward: 80, check: (s) => s.totalCompleted >= 100 },
  { id: 'quinientos', title: 'Leyenda', desc: 'Completa 500 tareas', reward: 200, check: (s) => s.totalCompleted >= 500 },
  { id: 'racha3', title: 'Tres seguidos', desc: 'Racha de 3 días productivos', reward: 20, check: (s) => s.streakDays >= 3 },
  { id: 'racha7', title: 'Semana perfecta', desc: 'Racha de 7 días', reward: 300, check: (s) => s.streakDays >= 7 },
  { id: 'racha14', title: 'Dos semanas firmes', desc: 'Racha de 14 días', reward: 400, check: (s) => s.streakDays >= 14 },
  { id: 'racha21', title: 'Tres semanas imparables', desc: 'Racha de 21 días', reward: 500, check: (s) => s.streakDays >= 21 },
  { id: 'racha30', title: 'Imparable', desc: 'Racha de 30 días', reward: 500, check: (s) => s.streakDays >= 30 },
  { id: 'dia10', title: 'Día brutal', desc: '10 tareas completadas en un solo día', reward: 30, check: (s) => s.bestDayCount >= 10 },
  { id: 'dia20', title: 'Superhumano', desc: '20 tareas en un solo día', reward: 70, check: (s) => s.bestDayCount >= 20 },
  { id: 'foco60', title: 'Hora de foco', desc: '60 minutos de foco acumulados', reward: 15, check: (s) => s.focusMinutes >= 60 },
  { id: 'foco600', title: 'Zen master', desc: '600 minutos de foco acumulados', reward: 60, check: (s) => s.focusMinutes >= 600 },
  { id: 'foco3000', title: 'Monje del foco', desc: '3000 minutos de foco acumulados', reward: 250, check: (s) => s.focusMinutes >= 3000 },
  { id: 'diez-dias', title: 'Constancia', desc: 'Completa tareas durante 10 días distintos', reward: 40, check: (s) => s.daysActive >= 10 },
  { id: 'treinta-dias', title: 'Hábito en marcha', desc: 'Completa tareas durante 30 días distintos', reward: 100, check: (s) => s.daysActive >= 30 },
  { id: 'cien-dias', title: 'Parte de tu rutina', desc: 'Completa tareas durante 100 días distintos', reward: 250, check: (s) => s.daysActive >= 100 },
  { id: 'dia5', title: 'Buen ritmo', desc: 'Completa 5 tareas en un día', reward: 20, check: (s) => s.bestDayCount >= 5 },
  { id: 'racha4-semanas', title: 'Mes de enfoque', desc: 'Racha de 28 días', reward: 500, check: (s) => s.streakDays >= 28 },
  { id: 'racha50', title: 'Cincuenta días', desc: 'Racha de 50 días', reward: 700, check: (s) => s.streakDays >= 50 },
  { id: 'racha100', title: 'Una leyenda diaria', desc: 'Racha de 100 días', reward: 1200, check: (s) => s.streakDays >= 100 },
  { id: 'foco150', title: 'En la zona', desc: '150 minutos de foco acumulados', reward: 25, check: (s) => s.focusMinutes >= 150 },
  { id: 'foco1200', title: 'Concentración sólida', desc: '1200 minutos de foco acumulados', reward: 100, check: (s) => s.focusMinutes >= 1200 },
  { id: 'foco10000', title: 'Maestro del enfoque', desc: '10.000 minutos de foco acumulados', reward: 500, check: (s) => s.focusMinutes >= 10000 },
  { id: 'dia30', title: 'Día de récord', desc: '30 tareas completadas en un día', reward: 120, check: (s) => s.bestDayCount >= 30 },
  { id: 'mil', title: 'Mil pequeñas victorias', desc: 'Completa 1.000 tareas', reward: 500, check: (s) => s.totalCompleted >= 1000 },
  { id: 'dosmil', title: 'Productividad extraordinaria', desc: 'Completa 2.000 tareas', reward: 1000, check: (s) => s.totalCompleted >= 2000 },
  { id: 'cazador-aracnido', title: 'Cazador de sombras', desc: 'Aplasta 10 arañas en Quacker durante octubre de 2026.', reward: 60, season: { label: 'Halloween 2026', period: '1–31 de octubre de 2026' }, check: (s) => isHalloween2026() && s.spiderCrushes >= 10 },
  { id: 'fantasma-aplastador', title: 'El terror de las ocho patas', desc: 'Aplasta 50 arañas en Quacker durante octubre de 2026.', reward: 0, season: { label: 'Halloween 2026', period: '1–31 de octubre de 2026' }, check: (s) => isHalloween2026() && s.spiderCrushes >= 50 },
]

export function isHalloween2026(at = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', year: 'numeric', month: 'numeric' }).formatToParts(at)
  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  return year === 2026 && month === 10
}

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
  const known = new Set(ACHIEVEMENTS.map((achievement) => achievement.id))
  return [...new Set(load().filter((id) => known.has(id)))]
}

export function claimableAchievements(): string[] {
  try { return JSON.parse(localStorage.getItem(CLAIMABLE_KEY) || '[]') } catch { return [] }
}

export function claimedAchievements(): string[] {
  try { return JSON.parse(localStorage.getItem(CLAIMED_KEY) || '[]') } catch { return [] }
}

export function claimAchievement(id: string): Achievement | null {
  const achievement = ACHIEVEMENTS.find((item) => item.id === id)
  const pending = claimableAchievements()
  if (!achievement || !pending.includes(id)) return null
  localStorage.setItem(CLAIMABLE_KEY, JSON.stringify(pending.filter((item) => item !== id)))
  localStorage.setItem(CLAIMED_KEY, JSON.stringify([...new Set([...claimedAchievements(), id])]))
  return achievement
}

function savedSpiderCrushes() {
  try {
    const seasonal = localStorage.getItem('tasklex-halloween-spider-crushes-2026')
    if (seasonal !== null) return Math.max(0, Number(seasonal) || 0)
    return 0
  } catch { return 0 }
}

export function computeAchievementStats(tasks: Task[], spiderCrushes = savedSpiderCrushes()): AchievementStats {
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
    daysActive: byDay.size,
    spiderCrushes,
  }
}

export function evaluateAchievements(tasks: Task[], spiderCrushes?: number): Achievement[] {
  const stats = computeAchievementStats(tasks, spiderCrushes ?? savedSpiderCrushes())
  const already = new Set(load())
  const fresh: Achievement[] = []
  for (const a of ACHIEVEMENTS) {
    if (!already.has(a.id) && a.check(stats)) {
      already.add(a.id)
      fresh.push(a)
    }
  }
  if (fresh.length > 0) {
    save([...already])
    const pending = new Set(claimableAchievements())
    fresh.forEach((achievement) => pending.add(achievement.id))
    localStorage.setItem(CLAIMABLE_KEY, JSON.stringify([...pending]))
  }
  return fresh
}
