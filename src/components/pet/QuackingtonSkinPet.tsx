import { useCallback, useEffect, useRef, useState } from 'react'
import { getQuackingtonSkinById, pickQuackingtonSkinLine } from '../../lib/quackingtonSkins'
import { useSettingsStore } from '../../store/settings'
import SirQuackington from './SirQuackington'
import PetSpeechBubble from './PetSpeechBubble'

interface Props {
  skinId: string
  size?: number
  className?: string
  busy?: boolean
  effects?: boolean
  idleQuotes?: boolean
  movable?: boolean
}

export default function QuackingtonSkinPet({ skinId, size = 72, className = '', busy = false, effects = true, idleQuotes = true, movable = true }: Props) {
  const skin = getQuackingtonSkinById(skinId) ?? getQuackingtonSkinById('animado')!
  const quotesEnabled = useSettingsStore((state) => state.petQuotes)
  const [glitchFrame, setGlitchFrame] = useState<number | null>(null)
  const animationActiveRef = useRef(false)
  const [speech, setSpeech] = useState('')
  const speechRef = useRef('')
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])
  const speechTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const onAnimationChange = useCallback((active: boolean) => {
    animationActiveRef.current = active
    if (active) setGlitchFrame(null)
  }, [])

  const clearTimers = () => {
    for (const timer of timersRef.current) clearTimeout(timer)
    timersRef.current = []
  }

  const say = (line: string) => {
    if (!quotesEnabled) return
    speechRef.current = line
    setSpeech(line)
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
    speechTimerRef.current = setTimeout(() => {
      speechRef.current = ''
      setSpeech('')
      speechTimerRef.current = null
    }, 4200)
  }

  useEffect(() => {
    if (skin.animated || skin.glitchImages || !idleQuotes || !quotesEnabled) return
    let active = true
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(() => {
        if (!active) return
        if (document.visibilityState === 'visible' && Math.random() < 0.48 && !speechRef.current) {
          say(pickQuackingtonSkinLine(skin.id))
        }
        schedule()
      }, 85000 + Math.random() * 90000)
    }
    schedule()
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [skin.id, skin.animated, skin.glitchImages, idleQuotes, quotesEnabled])

  useEffect(() => {
    if (!effects || !skin.glitchImages?.length) return
    let active = true
    let nextTimer: ReturnType<typeof setTimeout>
    const scheduleGlitch = () => {
      nextTimer = setTimeout(() => {
        if (!active) return
        if (document.visibilityState !== 'visible' || busy || animationActiveRef.current) {
          scheduleGlitch()
          return
        }
        const order = [...skin.glitchImages!.keys()]
        for (let i = order.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[order[i], order[j]] = [order[j], order[i]]
        }
        const duration = 280 + Math.random() * 510
        setGlitchFrame(order[0])
        order.slice(1).forEach((frame, index) => {
          timersRef.current.push(setTimeout(() => setGlitchFrame(frame), (duration / order.length) * (index + 1)))
        })
        timersRef.current.push(setTimeout(() => {
          setGlitchFrame(null)
          if (Math.random() < 0.32 && !speechRef.current) say(pickQuackingtonSkinLine(skin.id))
          timersRef.current = []
          scheduleGlitch()
        }, duration))
      }, 15000 + Math.random() * 15000)
    }
    scheduleGlitch()
    return () => {
      active = false
      clearTimeout(nextTimer)
      clearTimers()
      setGlitchFrame(null)
    }
  }, [effects, skin.id, skin.glitchImages, quotesEnabled, busy])

  useEffect(() => () => {
    clearTimers()
    if (speechTimerRef.current) clearTimeout(speechTimerRef.current)
  }, [])

  if (skin.animated) {
    return <SirQuackington size={size} className={className} busy={busy} skinVoiceId={skin.id} movable={movable} />
  }

  const glitchImage = glitchFrame === null ? null : skin.glitchImages?.[glitchFrame]

  return (
    <button
      type="button"
      onClick={() => { if (!skin.glitchImages) say(pickQuackingtonSkinLine(skin.id)) }}
      aria-label={`Escuchar a ${skin.name}`}
      className={`relative block shrink-0 select-none border-0 bg-transparent p-0 text-left ${className}`}
      style={{ width: size, height: size, touchAction: 'manipulation' }}
    >
      {skin.glitchImages && effects ? (
        <SirQuackington size={size} className="absolute inset-0" busy={busy} skinVoiceId={skin.id} movable={movable} ambient={!glitchImage} ambientSpeechChance={0.08} overlayImage={glitchImage} onAnimationChange={onAnimationChange} />
      ) : (
        <img src={skin.image} alt={skin.name} draggable={false} className="pointer-events-none h-full w-full object-contain" />
      )}
      {speech && <PetSpeechBubble align="right">{speech}</PetSpeechBubble>}
    </button>
  )
}
