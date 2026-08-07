import { useSettingsStore } from '../store/settings'
import { completedTodayCount } from './progress'
import type { Task } from '../types/task'

export function celebrate(particles = 60) {
  if (typeof window === 'undefined') return
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const colors = ['#e0b563', '#f4d9a6', '#34d399', '#8b5cf6', '#f472b6']
  const wrap = document.createElement('div')
  wrap.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:200;overflow:hidden'
  for (let i = 0; i < particles; i++) {
    const p = document.createElement('span')
    const size = 6 + Math.random() * 6
    p.style.cssText = `position:absolute;top:-12px;left:${Math.random() * 100}%;width:${size}px;height:${size}px;background:${colors[i % colors.length]};border-radius:${Math.random() > 0.5 ? '50%' : '2px'};animation:confetti-fall ${1.5 + Math.random() * 1.4}s linear ${Math.random() * 0.5}s forwards;opacity:0`
    wrap.appendChild(p)
  }
  document.body.appendChild(wrap)
  setTimeout(() => wrap.remove(), 4000)
}

export function celebrateCompletion(tasks: Task[]) {
  const goal = useSettingsStore.getState().dailyGoal
  const done = completedTodayCount(tasks)
  celebrate(done >= goal ? 90 : 30)
}
