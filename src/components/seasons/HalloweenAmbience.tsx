import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { useSettingsStore } from '../../store/settings'
import { useFoxSkinsStore } from '../../store/foxSkins'
import { useTasksStore } from '../../store/tasks'
import { evaluateAchievements } from '../../lib/achievements'

type SpiderKind = 'crawler' | 'sprinter' | 'broodmother' | 'phantom' | 'spiderling'
type Spider = { id: number; x: number; y: number; size: number; hits: number; maxHits: number; crushed: boolean; fromLeft: boolean; kind: SpiderKind; route: number; expiresAt: number }

function useSeasonDate() {
  const [day, setDay] = useState(() => new Date().toDateString())
  useEffect(() => {
    const timer = window.setInterval(() => {
      const today = new Date().toDateString()
      setDay((current) => current === today ? current : today)
    }, 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const date = new Date(day)
  return { october: date.getMonth() === 9, oct31: date.getMonth() === 9 && date.getDate() === 31 }
}

export function HalloweenFooter() {
  const location = useLocation()
  const { october } = useSeasonDate()
  const enabled = useSettingsStore((s) => s.seasonalEffects)
  if (!enabled || !october || location.pathname === '/temporadas') return null
  return <div aria-hidden className="halloween-footer relative mt-12 flex min-h-28 items-end justify-center gap-8 overflow-hidden border-t border-orange-950/40 pb-3 sm:gap-14"><span className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-orange-950/20 to-transparent" />
    {[0, 1, 2, 3, 4].map((n) => <svg key={n} viewBox="0 0 64 58" className={`h-12 w-14 drop-shadow-lg sm:h-14 sm:w-16 ${n % 2 ? 'translate-y-1' : '-translate-y-2'}`}>
      {n === 2 ? <g stroke="#cbd5e1" strokeWidth="2.3" strokeLinejoin="round"><path d="M32 9c-13 0-22 10-22 23 0 12 8 21 22 21s22-9 22-21C54 19 45 9 32 9Z" fill="#11131b"/><path d="M17 30q4-7 10 0v6h-10Zm20 0q6-7 10 0v6H37Z" fill="#e2e8f0"/><path d="m25 42 3-4 4 4 4-4 4 4" fill="none"/><path d="M28 10V5q4-4 8 0v5" fill="#64748b"/></g>
        : <g stroke="#7c2d12" strokeWidth="2"><path d="M31 12q-3-9 4-9 0 7 6 8" fill="none" stroke="#4d7c0f"/><path d="M32 13C17 9 7 21 9 38c2 13 11 17 23 17s21-4 23-17C57 21 47 9 32 13Z" fill={n % 2 ? '#c2410c' : '#ea580c'}/><path d="M18 20q-7 13-2 25m16-34v42m16-33q7 13 2 25" fill="none" stroke="#fb923c" strokeWidth="3"/><path d="m20 32 7 6-7 2Zm24 0-7 6 7 2Z" fill="#17111a" stroke="none"/><path d="M27 44h10" stroke="#17111a" strokeWidth="3"/></g>}
    </svg>)}
  </div>
}

export default function HalloweenAmbience() {
  const location = useLocation()
  const { october, oct31 } = useSeasonDate()
  const enabled = useSettingsStore((s) => s.seasonalEffects)
  const spidersEnabled = useSettingsStore((s) => s.seasonalSpiders)
  const weatherEnabled = useSettingsStore((s) => s.seasonalWeather)
  const onSeasonsPage = location.pathname === '/temporadas'
  const [spiders, setSpiders] = useState<Spider[]>([])
  const [rain, setRain] = useState<'off' | 'rain' | 'storm'>('off')
  const [flash, setFlash] = useState(false)
  const [blackout, setBlackout] = useState(false)
  const [torch, setTorch] = useState(false)
  const torchOverlayRef = useRef<HTMLDivElement>(null)
  const spiderId = useRef(0)
  const reduceMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  useEffect(() => {
    const active = enabled && october && !onSeasonsPage
    document.documentElement.classList.toggle('quacker-halloween', active)
    return () => document.documentElement.classList.remove('quacker-halloween')
  }, [enabled, october, onSeasonsPage])

  useEffect(() => {
    setSpiders([]); setRain('off'); setFlash(false); setBlackout(false); setTorch(false)
    if (!enabled || !spidersEnabled || !october || onSeasonsPage) return
    let live = true
    let timer: number
    const specialPage = location.pathname === '/' || location.pathname.startsWith('/s/')
    const schedule = () => {
      timer = window.setTimeout(() => {
        if (!live) return
        if (document.visibilityState === 'visible') {
          const id = ++spiderId.current
          const roll = Math.random()
          const kind: SpiderKind = roll < .44 ? 'crawler' : roll < .66 ? 'sprinter' : roll < .82 ? 'broodmother' : 'phantom'
          const size = kind === 'crawler' ? 24 : kind === 'sprinter' ? 38 : 54
          const fromLeft = Math.random() < 0.5
          const hits = kind === 'crawler' ? 1 : kind === 'sprinter' ? 2 : 3
          setSpiders((all) => {
            let y = 16 + Math.random() * 68
            for (let attempt = 0; attempt < 5 && all.some((item) => Math.abs(item.y - y) < 20); attempt++) y = 16 + Math.random() * 68
            return [...all.slice(-3), { id, x: fromLeft ? 2 : 98, y, size, hits, maxHits: hits, crushed: false, fromLeft, kind, route: Math.floor(Math.random() * 4), expiresAt: Date.now() + (reduceMotion ? 25_000 : 16_000) }]
          })
        }
        schedule()
      }, specialPage
          ? (oct31 ? 12_000 : 18_000) + Math.random() * (oct31 ? 16_000 : 20_000)
          : (oct31 ? 24_000 : 32_000) + Math.random() * (oct31 ? 18_000 : 24_000))
    }
    schedule()
    return () => { live = false; window.clearTimeout(timer) }
  }, [enabled, spidersEnabled, onSeasonsPage, location.pathname, oct31, october])

  useEffect(() => {
    if (!enabled || !weatherEnabled || !october || onSeasonsPage) return
    let live = true
    let endTimer = 0
    let lightningInterval = 0
    const start = () => {
      const delay = (oct31 ? 75_000 : 170_000) + Math.random() * (oct31 ? 130_000 : 310_000)
      const timer = window.setTimeout(() => {
        if (!live || document.visibilityState !== 'visible') { start(); return }
        const storm = Math.random() < (oct31 ? 0.28 : 0.16)
        setRain(storm ? 'storm' : 'rain')
        if (storm && Math.random() < 0.035) {
          setBlackout(true); setTorch(false)
          endTimer = window.setTimeout(() => { setBlackout(false); setTorch(false) }, 5200)
        } else if (storm) {
          lightningInterval = window.setInterval(() => { setFlash(true); window.setTimeout(() => setFlash(false), 110 + Math.random() * 100) }, 3500 + Math.random() * 8000)
          endTimer = window.setTimeout(() => { window.clearInterval(lightningInterval); lightningInterval = 0; setFlash(false); setRain('off') }, 16_000 + Math.random() * 24_000)
          start()
          return
        }
        endTimer = window.setTimeout(() => setRain('off'), 12_000 + Math.random() * 20_000)
        start()
      }, delay)
      return timer
    }
    const timer = start()
    return () => { live = false; window.clearTimeout(timer); window.clearTimeout(endTimer); if (lightningInterval) window.clearInterval(lightningInterval); setRain('off'); setFlash(false); setBlackout(false); setTorch(false) }
  }, [enabled, weatherEnabled, oct31, october, onSeasonsPage])

  useEffect(() => {
    const active = spiders.filter((spider) => !spider.crushed)
    if (!active.length) return
    const timer = window.setTimeout(() => {
      const now = Date.now()
      setSpiders((all) => all.filter((spider) => spider.crushed || spider.expiresAt > now))
    }, Math.max(100, Math.min(...active.map((spider) => spider.expiresAt)) - Date.now()))
    return () => window.clearTimeout(timer)
  }, [spiders])

  useEffect(() => {
    if (!blackout || !torch) return
    let frame = 0
    let x = 0
    let y = 0
    const move = (event: PointerEvent) => {
      x = event.clientX
      y = event.clientY
      if (frame) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        const overlay = torchOverlayRef.current
        if (!overlay) return
        overlay.style.setProperty('--torch-x', `${x}px`)
        overlay.style.setProperty('--torch-y', `${y}px`)
      })
    }
    window.addEventListener('pointermove', move)
    return () => {
      window.removeEventListener('pointermove', move)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [blackout, torch])

  const rainDrops = useMemo(() => Array.from({ length: rain === 'storm' ? 56 : 34 }, (_, index) => ({
    id: index,
    left: `${Math.random() * 100}%`,
    top: `${-15 - Math.random() * 100}%`,
    delay: `${-Math.random() * 2.5}s`,
    length: 6 + Math.random() * 5,
    duration: rain === 'storm' ? .42 + Math.random() * .25 : 1.1 + Math.random() * .65,
  })), [rain])
  if (!enabled || !october || onSeasonsPage) return null
  const hitSpider = (spider: Spider, event: MouseEvent<HTMLButtonElement>) => {
    if (spider.hits > 1) {
      setSpiders((all) => all.map((item) => item.id === spider.id ? { ...item, hits: item.hits - 1, size: Math.max(16, Math.round(item.size * 0.72)) } : item))
      return
    }
    const hitRect = event.currentTarget.getBoundingClientRect()
    setSpiders((all) => all.map((item) => item.id === spider.id ? { ...item, crushed: true, x: event.clientX, y: event.clientY } : item))
    void registerSpiderCrush()
    if (spider.kind === 'broodmother') {
      const x = Math.min(91, Math.max(4, ((hitRect.left + hitRect.width / 2) / window.innerWidth) * 100))
      const y = Math.min(86, Math.max(12, ((hitRect.top + hitRect.height / 2) / window.innerHeight) * 100))
      const children: Spider[] = [-1, 0, 1].map((offset, index) => ({
        id: ++spiderId.current, x: Math.min(94, Math.max(4, x + offset * 3)), y: Math.min(90, Math.max(8, y + (index === 1 ? -3 : 3))),
        size: 24, hits: 1, maxHits: 1, crushed: false, fromLeft: offset !== 1, kind: 'spiderling', route: Math.floor(Math.random() * 4), expiresAt: Date.now() + (reduceMotion ? 25_000 : 16_000),
      }))
      window.setTimeout(() => setSpiders((all) => [...all.filter((item) => item.id !== spider.id || item.crushed), ...children]), 320)
    }
    window.setTimeout(() => setSpiders((all) => all.filter((item) => item.id !== spider.id)), 2_200)
  }

  const registerSpiderCrush = async () => {
    const count = await useFoxSkinsStore.getState().recordSpiderCrush()
    if (count === null) return
    const fresh = evaluateAchievements(useTasksStore.getState().tasks, count)
    for (const achievement of fresh) {
      window.dispatchEvent(new CustomEvent('tasklex:achievement', { detail: achievement }))
      window.dispatchEvent(new Event('tasklex:achievement-pending'))
    }
  }

  return createPortal(<>
    <div aria-hidden className="halloween-bunting pointer-events-none fixed inset-x-0 top-0 z-[45] flex justify-around">
      {Array.from({ length: 26 }, (_, i) => <span key={i} className={`halloween-flag ${i % 2 ? 'halloween-flag-blue' : 'halloween-flag-purple'}`} />)}
    </div>
    <div aria-hidden className="halloween-corner halloween-corner-left pointer-events-none fixed left-0 top-0 z-[34]"><SpiderWeb /></div>
    <div aria-hidden className="halloween-corner halloween-corner-right pointer-events-none fixed right-0 top-0 z-[34]"><SpiderWeb /></div>
    {spiders.map((spider) => {
      const speed = Math.max(4.8, 14 - (spider.maxHits - spider.hits) * 3.3)
      const icon = '🕷️'
      return <button key={spider.id} type="button" aria-label={spider.crushed ? 'Araña aplastada' : 'Aplastar araña'} onClick={(event) => !spider.crushed && hitSpider(spider, event)} className={`halloween-spider fixed z-[36] grid place-items-center rounded-full ${spider.fromLeft ? 'halloween-spider-left' : 'halloween-spider-right'} halloween-route-${spider.route} ${spider.kind === 'spiderling' ? 'halloween-spiderling' : ''} ${spider.kind === 'phantom' ? 'halloween-phantom' : ''} ${spider.kind === 'broodmother' ? 'halloween-broodmother' : ''} ${spider.crushed ? 'halloween-splat' : ''}`} style={{ left: spider.crushed ? `${spider.x}px` : `${spider.x}%`, top: spider.crushed ? `${spider.y}px` : `${spider.y}%`, width: spider.crushed ? Math.max(58, spider.size + 18) : Math.max(24, spider.size * 0.9), height: spider.crushed ? Math.max(58, spider.size + 18) : Math.max(24, spider.size * 0.9), fontSize: Math.max(13, spider.size * 0.72), animationDuration: spider.crushed ? '2.2s' : reduceMotion ? '24s' : `${speed}s` }}>
        {spider.crushed ? <SpiderSplat /> : <span aria-hidden style={{ display: 'inline-block', transform: spider.fromLeft ? 'rotate(-90deg)' : 'rotate(90deg)' }}>{icon}</span>}
      </button>
    })}
    {rain !== 'off' && <div aria-hidden className={`halloween-rain pointer-events-none fixed inset-0 z-[32] ${rain === 'storm' ? 'halloween-storm' : ''}`}>{rainDrops.map((drop) => <i key={drop.id} className="halloween-rain-drop" style={{ left: drop.left, top: drop.top, height: drop.length, animationDelay: drop.delay, animationDuration: `${drop.duration}s` }} />)}</div>}
    {flash && <div aria-hidden className="pointer-events-none fixed inset-0 z-[33] bg-white/60" />}
    {blackout && <>
      <div ref={torchOverlayRef} aria-hidden className="pointer-events-none fixed inset-0 z-[39]" style={{ background: torch ? 'radial-gradient(circle 180px at var(--torch-x, 42vw) var(--torch-y, 50vh), transparent 0%, rgba(2,3,8,.32) 55%, rgba(2,3,8,.96) 100%)' : 'rgba(2,3,8,.97)' }} />
      {!torch && <button type="button" onClick={() => setTorch(true)} className="fixed bottom-6 left-6 z-[41] grid h-14 w-14 place-items-center rounded-full border border-amber-300/50 bg-amber-900 text-2xl shadow-[0_0_26px_rgba(251,191,36,.35)]" aria-label="Encender antorcha">🔥</button>}
      {torch && <button type="button" onClick={() => setTorch(false)} className="fixed bottom-6 left-6 z-[41] grid h-14 w-14 place-items-center rounded-full border border-amber-300/50 bg-amber-900 text-2xl shadow-[0_0_26px_rgba(251,191,36,.35)]" aria-label="Apagar antorcha">🔥</button>}
    </>}
  </>, document.body)
}

function SpiderSplat() {
  return <svg aria-hidden viewBox="0 0 80 80" className="h-full w-full overflow-visible drop-shadow-[0_3px_4px_rgba(0,0,0,.55)]">
    <path d="M37 8 44 22 56 11 55 27 72 25 61 38 76 47 59 51 66 68 50 61 41 76 35 60 19 70 23 53 6 51 20 40 8 28 26 29Z" fill="#b51220" stroke="#51060d" strokeWidth="3" strokeLinejoin="round" />
    <path d="M30 32q9-8 19 0 8 7 1 17-7 9-18 3-10-6-2-20Z" fill="#7f0713" />
    <path d="M15 12q-4-9 3-8 7 3 3 12l-3 5Zm47 3q2-10 8-6 4 5-3 12l-4 3ZM9 62q-5-8 2-10 8 1 6 10l-2 5Zm54 10q-1-9 6-8 7 4 0 11l-5 3Z" fill="#9f0b19" stroke="#51060d" strokeWidth="2" strokeLinejoin="round" />
    <g fill="none" stroke="#18090b" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m34 39-11-8-7 2m11-10 9 9m10 7 11-8 7 2m-10-11-9 9M34 45l-11 8-7-2m11 10 9-9m10-7 11 8 7-2m-10 10-9-9" />
    </g>
    <ellipse cx="40" cy="41" rx="8" ry="6" fill="#18090b" /><circle cx="47" cy="37" r="4.5" fill="#18090b" />
    <circle cx="30" cy="27" r="2.5" fill="#f87171" /><circle cx="52" cy="51" r="2" fill="#ef4444" />
  </svg>
}

function SpiderWeb() {
  return <svg viewBox="0 0 120 100" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
    <path d="M0 0 120 0M0 0 0 100M0 0 120 100M0 0 100 120M0 0 120 44M0 0 44 100" />
    <path d="M18 0q2 15 0 20t0 22q18 0 22 4t40 0q0 21 4 25t0 27M42 0q3 24 0 28t0 28q24 0 28 4t0 40M70 0q4 29 0 34t0 35q27 0 32 5t0 26M0 20q15 2 20 0t22 0q0 18 4 22t0 40M0 48q23 3 28 0t28 0q0 24 4 28t0 24M0 74q28 4 34 0t35 0q0 24 5 28" />
  </svg>
}
