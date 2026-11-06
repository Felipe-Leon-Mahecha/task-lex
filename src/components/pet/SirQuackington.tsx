import { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect, useMemo } from 'react'
import {
  QUACKINGTON_ANIMS,
  QUACKINGTON_AMBIENT,
  quackingtonFrameUrl,
  pickQuackingtonLine,
  type QuackingtonAnim,
  type QuackingtonAnimId,
} from '../../lib/quackington'
import { pickQuackingtonSkinLine } from '../../lib/quackingtonSkins'
import { pickHalloweenDialogue } from '../../lib/seasons/halloweenDialogue'
import { useSettingsStore } from '../../store/settings'
import PetSpeechBubble from './PetSpeechBubble'

export interface SirQuackingtonHandle {
  play: (id: QuackingtonAnimId, opts?: { once?: boolean }) => void
}

interface Props {
  size?: number
  className?: string
  ambient?: boolean
  busy?: boolean
  skinVoiceId?: string
  ambientSpeechChance?: number
  overlayImage?: string | null
  onAnimationChange?: (active: boolean) => void
  movable?: boolean
}

type PlayState =
  | { id: 'default' }
  | { id: 'playing'; anim: QuackingtonAnim; frame: number; once: boolean; fps: number }
  | { id: 'sheet'; anim: QuackingtonAnim; frame: number; once: boolean; fps: number }

const TAP_WINDOW = 1100
const TAP_SLOP = 10
const GRAB_DELAY = 320
const GRAB_DIST = 14
const FALL_MS = 1250
const FLING_MIN = 750
const GRAVITY = 2300
const BOUNCE_DAMP = 0.72
const MAX_FLIGHT_MS = 8000
const PLATFORM_MARGIN = 24

function Prefetch({ urls }: { urls: string[] }) {
  useEffect(() => {
    if (typeof Image === 'undefined') return
    const c: HTMLImageElement[] = []
    for (const u of urls) {
      const img = new Image()
      img.src = u
      c.push(img)
    }
    return () => c.forEach((i) => { i.src = '' })
  }, [urls])
  return null
}

const SirQuackington = forwardRef<SirQuackingtonHandle, Props>(function SirQuackington(
  { size = 64, className = '', ambient = true, busy = false, skinVoiceId = 'animado', ambientSpeechChance = 0.55, overlayImage = null, onAnimationChange, movable = true },
  ref,
) {
  const [playState, setPlayState] = useState<PlayState>({ id: 'default' })
  const [bubble, setBubble] = useState<{ text: string; id: number } | null>(null)
  const [cold, setCold] = useState(false)

  useEffect(() => { onAnimationChange?.(playState.id !== 'default') }, [playState.id, onAnimationChange])

  const [dragging, setDragging] = useState(false)
  const [dragPos, setDragPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [returning, setReturning] = useState(false)
  const [homePos, setHomePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })

  const homeRef = useRef<HTMLDivElement | null>(null)
  const ambientTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bubbleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const petQuotesRef = useRef(useSettingsStore((s) => s.petQuotes))
  petQuotesRef.current = useSettingsStore((s) => s.petQuotes)
  const voiceLine = useCallback(
    (trigger: string) => pickHalloweenDialogue('duck') ?? (skinVoiceId === 'animado' ? pickQuackingtonLine(trigger) : pickQuackingtonSkinLine(skinVoiceId)),
    [skinVoiceId],
  )
  const tapTimesRef = useRef<number[]>([])
  const pointerRef = useRef<{
    downX: number
    downY: number
    downAt: number
    pressed: boolean
    mode: 'none' | 'rub' | 'grab'
    grabbed: boolean
    id: number | null
  }>({ downX: 0, downY: 0, downAt: 0, pressed: false, mode: 'none', grabbed: false, id: null })
  const draggingRef = useRef(false)
  const grabFrozenRef = useRef(false)
  const fallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const darknessShownRef = useRef(false)
  const anchorRef = useRef({ x: 0, y: 0 })
  const velRef = useRef<{ x: number; y: number; t: number }[]>([])
  const flightRef = useRef({
    active: false,
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    startAt: 0,
    lastT: 0,
    raf: 0,
  })
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const winActionsRef = useRef<{
    move: (e: PointerEvent) => void
    up: (e: PointerEvent) => void
    cancel: (e: PointerEvent) => void
  } | null>(null)

  const showBubble = useCallback((text: string, opts?: { force?: boolean }) => {
    if (!opts?.force && !petQuotesRef.current) return
    setBubble({ text, id: Date.now() })
    if (bubbleTimerRef.current) clearTimeout(bubbleTimerRef.current)
    bubbleTimerRef.current = setTimeout(() => setBubble(null), 4200)
  }, [])

  const stopAmbientTimer = useCallback(() => {
    if (ambientTimerRef.current) {
      clearTimeout(ambientTimerRef.current)
      ambientTimerRef.current = null
    }
  }, [])

  const detachWindow = useCallback(() => {
    if (winActionsRef.current) {
      window.removeEventListener('pointermove', winActionsRef.current.move)
      window.removeEventListener('pointerup', winActionsRef.current.up)
      window.removeEventListener('pointercancel', winActionsRef.current.cancel)
      winActionsRef.current = null
    }
  }, [])

  const play = useCallback(
    (id: QuackingtonAnimId, opts?: { once?: boolean }) => {
      const anim = QUACKINGTON_ANIMS[id]
      if (!anim) return
      stopAmbientTimer()
      if (anim.kind === 'frames') {
        const image = new Image()
        image.src = quackingtonFrameUrl(anim, 0)
      } else if (anim.kind === 'sheet' && anim.sheetUrl) {
        const image = new Image()
        image.src = anim.sheetUrl
      }
      if (anim.kind === 'static') {
        setPlayState({ id: 'default' })
        return
      }
      if (anim.kind === 'sheet') {
        setPlayState({ id: 'sheet', anim, frame: 0, once: opts?.once ?? true, fps: anim.fps ?? 12 })
        return
      }
      setPlayState({ id: 'playing', anim, frame: 0, once: opts?.once ?? true, fps: anim.fps ?? 24 })
    },
    [stopAmbientTimer],
  )

  useImperativeHandle(ref, () => ({ play }), [play])

  const ambientBagRef = useRef<QuackingtonAnimId[]>([])
  const pickAmbient = useCallback(() => {
    const pool = [...QUACKINGTON_AMBIENT]
    if (cold) pool.push('frio')
    let bag = ambientBagRef.current.filter((id) => pool.includes(id))
    if (bag.length === 0) {
      bag = [...pool]
      for (let i = bag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        const tmp = bag[i]!
        bag[i] = bag[j]!
        bag[j] = tmp
      }
    }
    const id = bag.pop()!
    ambientBagRef.current = bag
    return id
  }, [cold])

  useEffect(() => {
    try {
      const src = QUACKINGTON_ANIMS.default.src
      if (!src || document.querySelector(`link[data-preload="${src}"]`)) return
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      link.setAttribute('data-preload', src)
      document.head.appendChild(link)
    } catch {}
  }, [])

  const startAmbientLoop = useCallback(
    (firstMin = 30_000, firstSpread = 30_000) => {
      stopAmbientTimer()
      const schedule = (min = 30_000, spread = 30_000) => {
        ambientTimerRef.current = setTimeout(() => {
          ambientTimerRef.current = null
          if (document.visibilityState === 'hidden' || draggingRef.current) {
            schedule()
            return
          }
          if (Math.random() < 0.55) {
            const id = pickAmbient()
            play(id, { once: true })
            if (Math.random() < ambientSpeechChance) showBubble(voiceLine(id))
          }
          schedule()
        }, min + Math.random() * spread)
      }
      schedule(firstMin, firstSpread)
    },
    [pickAmbient, play, showBubble, stopAmbientTimer, voiceLine, ambientSpeechChance],
  )

  useEffect(() => {
    draggingRef.current = dragging
  }, [dragging])

  useEffect(() => {
    const onResize = () => {
      if (draggingRef.current || flightRef.current.active) return
      const home = homeRef.current
      if (!home) return
      const r = home.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const m = 40
      if (cx < -m || cx > window.innerWidth + m || cy < -m || cy > window.innerHeight + m) {
        setOffset({ x: 0, y: 0 })
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    return () => {
      stopAmbientTimer()
      detachWindow()
      if (fallTimerRef.current) {
        clearTimeout(fallTimerRef.current)
        fallTimerRef.current = null
      }
      if (bubbleTimerRef.current) {
        clearTimeout(bubbleTimerRef.current)
        bubbleTimerRef.current = null
      }
      const fl = flightRef.current
      if (fl.raf) cancelAnimationFrame(fl.raf)
      fl.active = false
    }
  }, [stopAmbientTimer, detachWindow])

  useEffect(() => {
    if (dragging) return
    if (busy) {
      stopAmbientTimer()
      play('pensativo', { once: false })
      return
    }
    setPlayState({ id: 'default' })
    if (ambient) startAmbientLoop()
  }, [busy, dragging, ambient, play, startAmbientLoop, stopAmbientTimer])

  useEffect(() => {
    if (playState.id !== 'default' || dragging || busy || !ambient) return
    startAmbientLoop(12_000, 13_000)
  }, [playState, dragging, busy, ambient, startAmbientLoop])

  useEffect(() => {
    if (dragging) return
    const now = new Date()
    let last: string | null = null
    try {
      last = localStorage.getItem('quacker-last-saludo')
    } catch {}
    const today = now.toDateString()
    if (last !== today) {
      try {
        localStorage.setItem('quacker-last-saludo', today)
      } catch {}
      play('saludo', { once: true })
      showBubble(voiceLine('saludo'))
    }
  }, [dragging, play, showBubble, voiceLine])

  useEffect(() => {
    if (dragging || cold) return
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) return
    try {
      const raw = localStorage.getItem('quacker-cold')
      if (raw) {
        const c = JSON.parse(raw)
        if (c.at && Date.now() - c.at < 60 * 60 * 1000) {
          setCold(typeof c.temp === 'number' && c.temp < 15)
          return
        }
      }
    } catch {}
    try {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`,
          )
            .then((r) => r.json())
            .then((d) => {
              const temp = d?.current_weather?.temperature as number | undefined
              if (typeof temp === 'number') {
                try {
                  localStorage.setItem('quacker-cold', JSON.stringify({ temp, at: Date.now() }))
                } catch {}
                setCold(temp < 15)
              }
            })
            .catch(() => {})
        },
        () => {},
        { timeout: 4000, maximumAge: 900000 },
      )
    } catch {}
  }, [dragging, cold])

  const triggerTap = useCallback(() => {
    const now = Date.now()
    const times = tapTimesRef.current
    times.push(now)
    while (times.length && now - times[0] > TAP_WINDOW) times.shift()
    if (times.length >= 3) {
      tapTimesRef.current = []
      play('sacudirce', { once: true })
      showBubble(voiceLine('sacudirce'))
      return
    }
    if (Math.random() < 0.5) {
      play('cuack', { once: true })
      showBubble(voiceLine('tap'))
    }
  }, [play, showBubble, voiceLine])

  const triggerTickle = useCallback(() => {
    play('rasca', { once: true })
    showBubble(voiceLine('rasca'))
  }, [play, showBubble, voiceLine])

  const landAt = useCallback(
    (lx: number, ly: number) => {
      const f = flightRef.current
      if (f.raf) {
        cancelAnimationFrame(f.raf)
        f.raf = 0
      }
      f.active = false
      detachWindow()
      const padX = size / 2 + 8
      const padY = size / 2 + 8
      const maxX = Math.max(padX, window.innerWidth - padX)
      const maxY = Math.max(padY, window.innerHeight - padY)
      const cx = Math.max(padX, Math.min(maxX, lx))
      const cy = Math.max(padY, Math.min(maxY, ly))
      const a = anchorRef.current
      setOffset({ x: cx - a.x, y: cy - a.y })
      setDragging(false)
      setReturning(false)
      setPlayState({ id: 'default' })
      showBubble(voiceLine('caida'))
    },
    [detachWindow, showBubble, size, voiceLine],
  )

  const startFlight = useCallback(
    (x: number, y: number, vx: number, vy: number, platformY: number) => {
      play('caida', { once: false })
      const half = size / 2
      const f = flightRef.current
      f.active = true
      f.x = x
      f.y = y
      f.vx = vx
      f.vy = vy
      f.startAt = performance.now()
      f.lastT = f.startAt
      setDragPos({ x: f.x, y: f.y })
      const step = (now: number) => {
        if (!f.active) return
        const dt = Math.min(Math.max((now - f.lastT) / 1000, 0.001), 0.05)
        f.lastT = now
        const minX = half + 8
        const maxX = Math.max(minX + 1, window.innerWidth - half - 8)
        const minY = half + 4
        f.vy += GRAVITY * dt
        f.x += f.vx * dt
        f.y += f.vy * dt
        const jiggle = 0.9 + Math.random() * 0.2
        if (f.x < minX) {
          f.x = minX
          f.vx = Math.abs(f.vx) * BOUNCE_DAMP * jiggle
        } else if (f.x > maxX) {
          f.x = maxX
          f.vx = -Math.abs(f.vx) * BOUNCE_DAMP * jiggle
        }
        if (f.y < minY) {
          f.y = minY
          f.vy = Math.abs(f.vy) * BOUNCE_DAMP
        }
        setDragPos({ x: f.x, y: f.y })
        if (f.y >= platformY && f.vy > 0) {
          landAt(Math.max(minX, Math.min(maxX, f.x)), platformY)
          return
        }
        if (now - f.startAt > MAX_FLIGHT_MS) {
          landAt(Math.max(minX, Math.min(maxX, f.x)), platformY)
          return
        }
        f.raf = requestAnimationFrame(step)
      }
      if (f.raf) cancelAnimationFrame(f.raf)
      f.raf = requestAnimationFrame(step)
    },
    [play, size, landAt],
  )

  const beginGrab = useCallback(
    (x: number, y: number, pid: number) => {
      detachWindow()
      if (fallTimerRef.current) {
        clearTimeout(fallTimerRef.current)
        fallTimerRef.current = null
      }
      const fl = flightRef.current
      if (fl.raf) cancelAnimationFrame(fl.raf)
      fl.active = false
      fl.raf = 0
      const home = homeRef.current
      if (home) {
        const r = home.getBoundingClientRect()
        anchorRef.current = { x: r.left + r.width / 2 - offset.x, y: r.top + r.height / 2 - offset.y }
      }
      velRef.current = [{ x, y, t: performance.now() }]
      const handleMove = (e: PointerEvent) => {
        if (e.pointerId !== pid) return
        setDragPos({ x: e.clientX, y: e.clientY })
        const v = velRef.current
        v.push({ x: e.clientX, y: e.clientY, t: performance.now() })
        if (v.length > 6) v.shift()
      }
      const handleUp = (e: PointerEvent) => {
        if (e.pointerId !== pid) return
        detachWindow()
        grabFrozenRef.current = false
        const pr = pointerRef.current
        pr.pressed = false
        pr.grabbed = false
        pr.mode = 'none'
        pr.id = null
        const v = velRef.current
        let vx = 0
        let vy = 0
        if (v.length >= 2) {
          const b = v[v.length - 1]
          let s = v[0]
          for (let k = v.length - 1; k >= 0; k--) {
            if (b.t - v[k].t >= 80) {
              s = v[k]
              break
            }
          }
          const dt = Math.max((b.t - s.t) / 1000, 0.016)
          vx = (b.x - s.x) / dt
          vy = (b.y - s.y) / dt
          const sp = Math.hypot(vx, vy)
          if (sp > 3200) {
            vx = (vx / sp) * 3200
            vy = (vy / sp) * 3200
          }
          vx *= 0.85
          vy *= 0.85
        }
        const platformY = Math.max(size / 2 + 8, window.innerHeight - size / 2 - PLATFORM_MARGIN)
        const pad = size / 2 + 8
        const cx = Math.max(pad, Math.min(window.innerWidth - pad, e.clientX))
        if (Math.hypot(vx, vy) >= FLING_MIN) {
          startFlight(cx, e.clientY, vx, vy, platformY)
          return
        }
        const ax = anchorRef.current.x + offset.x
        const ay = anchorRef.current.y + offset.y
        if (Math.hypot(e.clientX - ax, e.clientY - ay) <= size) {
          landAt(e.clientX, e.clientY)
          return
        }
        play('caida', { once: false })
        setHomePos({ x: cx, y: platformY })
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (!pointerRef.current.grabbed && draggingRef.current) setReturning(true)
          })
        })
        if (fallTimerRef.current) clearTimeout(fallTimerRef.current)
        fallTimerRef.current = setTimeout(() => {
          fallTimerRef.current = null
          landAt(cx, platformY)
        }, FALL_MS + 60)
      }
      pointerRef.current.grabbed = true
      grabFrozenRef.current = true
      setReturning(false)
      setPlayState({ id: 'sheet', anim: QUACKINGTON_ANIMS.sostener, frame: 0, once: true, fps: 24 })
      setDragging(true)
      setDragPos({ x, y })
      window.addEventListener('pointermove', handleMove)
      window.addEventListener('pointerup', handleUp)
      window.addEventListener('pointercancel', handleUp)
      winActionsRef.current = { move: handleMove, up: handleUp, cancel: handleUp }
    },
    [detachWindow, offset, play, size, landAt, startFlight],
  )

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState !== 'visible') return
      const f = flightRef.current
      if (f.active && performance.now() - f.lastT > 3000) {
        landAt(f.x, f.y)
        return
      }
      if (draggingRef.current && !f.active && !fallTimerRef.current) {
        detachWindow()
        setDragging(false)
        setReturning(false)
        setPlayState({ id: 'default' })
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [detachWindow, landAt])

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return
    e.preventDefault()
    const p = pointerRef.current
    if (p.pressed) {
      if (Date.now() - p.downAt < 8000) return
      detachWindow()
      const fl = flightRef.current
      if (fl.raf) cancelAnimationFrame(fl.raf)
      fl.active = false
      if (fallTimerRef.current) {
        clearTimeout(fallTimerRef.current)
        fallTimerRef.current = null
      }
      setDragging(false)
      setReturning(false)
      setPlayState({ id: 'default' })
    }
    p.downX = e.clientX
    p.downY = e.clientY
    p.downAt = Date.now()
    p.pressed = true
    p.mode = 'none'
    p.grabbed = false
    p.id = e.pointerId
    grabFrozenRef.current = false
    darknessShownRef.current = false
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const p = pointerRef.current
      if (!p.pressed || p.grabbed) return
      if (p.id !== null && e.pointerId !== p.id) return
      const dx = e.clientX - p.downX
      const dy = e.clientY - p.downY
      const dist = Math.hypot(dx, dy)
      const held = Date.now() - p.downAt
      if (p.mode === 'grab') return
      if (dist > GRAB_DIST || held > GRAB_DELAY) {
        if (dist <= GRAB_DIST) {
          if (!darknessShownRef.current) {
            darknessShownRef.current = true
            showBubble(voiceLine('oscuridad'), { force: true })
          }
          return
        }
        p.mode = 'grab'
        beginGrab(e.clientX, e.clientY, e.pointerId)
        return
      }
      if (p.mode !== 'none') return
      if (dist > TAP_SLOP) {
        p.mode = 'rub'
        triggerTickle()
      }
    },
    [beginGrab, triggerTickle, showBubble],
  )

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const p = pointerRef.current
      if (!p.pressed) return
      if (p.id !== null && e.pointerId !== p.id) return
      p.pressed = false
      p.id = null
      if (p.grabbed) return
      const moved = Math.hypot(e.clientX - p.downX, e.clientY - p.downY)
      const held = Date.now() - p.downAt
      if (p.mode === 'rub') return
      if (moved <= TAP_SLOP && held < GRAB_DELAY) {
        triggerTap()
      }
    },
    [triggerTap],
  )

  useEffect(() => {
    if (playState.id !== 'playing') return
    const st = playState
    if (st.anim.id === 'sostener') return
    const count = st.anim.count ?? 1
    if (st.frame >= count) {
      if (st.once) setPlayState({ id: 'default' })
      else setPlayState({ id: 'playing', anim: st.anim, frame: 0, once: false, fps: st.fps })
      return
    }
    const t = setTimeout(
      () => setPlayState({ id: 'playing', anim: st.anim, frame: st.frame + 1, once: st.once, fps: st.fps }),
      1000 / st.fps,
    )
    return () => clearTimeout(t)
  }, [playState])

  useEffect(() => {
    if (playState.id !== 'sheet') return
    const st = playState
    const count = st.anim.count ?? st.anim.cols ?? 1
    if (st.anim.id === 'sostener') {
      if (st.frame >= count - 10) return
    } else if (st.frame >= count) {
      if (st.once) setPlayState({ id: 'default' })
      else setPlayState({ id: 'sheet', anim: st.anim, frame: 0, once: false, fps: st.fps })
      return
    }
    const t = setTimeout(
      () => setPlayState({ id: 'sheet', anim: st.anim, frame: st.frame + 1, once: st.once, fps: st.fps }),
      1000 / st.fps,
    )
    return () => clearTimeout(t)
  }, [playState])

  const prefetch = useMemo(() => {
    if (playState.id !== 'playing' || playState.anim.kind !== 'frames' || playState.anim.id === 'sostener') {
      return null
    }
    return Array.from({ length: 4 }, (_, i) => playState.frame + 1 + i)
      .filter((n) => n < (playState.anim.count ?? 1))
      .map((n) => quackingtonFrameUrl(playState.anim, n))
  }, [playState])

  const sheetFrame =
    playState.id === 'sheet'
      ? Math.min(playState.frame, Math.max(0, (playState.anim.count ?? playState.anim.cols ?? 1) - 1))
      : 0

  const frameRender =
    playState.id === 'default' ? null : playState.id === 'playing' ? (
      <img
        src={quackingtonFrameUrl(playState.anim, Math.min(playState.frame, (playState.anim.count ?? 1) - 1))}
        alt=""
        draggable={false}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    ) : (
      <div
        style={{
          width: size,
          height: size,
          scale: playState.anim.zoom ?? 1.15,
          backgroundImage: `url("${playState.anim.sheetUrl}")`,
          backgroundPosition: `-${(sheetFrame % (playState.anim.cols ?? 1)) * size}px -${Math.floor(sheetFrame / (playState.anim.cols ?? 1)) * size}px`,
          backgroundSize: `${(playState.anim.cols ?? 1) * size}px ${(playState.anim.rows ?? 1) * size}px`,
          backgroundRepeat: 'no-repeat',
        }}
      />
    )

  const defaultRender = (
    <img src={QUACKINGTON_ANIMS.default.src} alt="Sir Quackington" draggable={false} style={{ width: size, height: size, objectFit: 'contain' }} />
  )

  const bubbleEl = bubble && !dragging ? (
    <PetSpeechBubble align="right">{bubble.text}</PetSpeechBubble>
  ) : null

  const homeDuck = (
    <div
      ref={homeRef}
      className={`relative select-none ${className}`}
      style={{
        touchAction: movable ? 'none' : 'manipulation',
        transform: offset.x || offset.y ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
      }}
      onPointerDown={movable ? onPointerDown : undefined}
      onPointerMove={movable ? onPointerMove : undefined}
      onPointerUp={movable ? onPointerUp : undefined}
      onPointerCancel={movable ? onPointerUp : undefined}
    >
      {bubbleEl}
      <div className="relative" style={{ width: size, height: size }}>
        {frameRender ? <div className="absolute inset-0 animate-in fade-in duration-150">{frameRender}</div> : defaultRender}
      </div>
      {overlayImage && <img src={overlayImage} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />}
      {prefetch && <Prefetch urls={prefetch} />}
    </div>
  )

  if (dragging) {
    const left = returning ? homePos.x : dragPos.x
    const top = returning ? homePos.y : dragPos.y
    const flying = flightRef.current.active
    const flip = flying && flightRef.current.vx > 0 ? -1 : 1
    return (
      <div className="pointer-events-none fixed inset-0 z-[70]">
        <div
          className="pointer-events-none absolute"
          style={{
            left: 0,
            top: 0,
            transition: returning ? `transform ${FALL_MS}ms ease-in` : 'none',
            transform: `translate3d(${left - size / 2}px, ${top - size / 2}px, 0)${flip === -1 ? ' scaleX(-1)' : ''}`,
            width: size,
            height: size,
          }}
        >
          <div className="relative" style={{ width: size, height: size }}>
            {frameRender ?? defaultRender}
          </div>
          {overlayImage && <img src={overlayImage} alt="" draggable={false} className="pointer-events-none absolute inset-0 h-full w-full object-contain" />}
        </div>
      </div>
    )
  }

  return homeDuck
})

export default SirQuackington
