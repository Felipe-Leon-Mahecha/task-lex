import { useEffect, useMemo, useRef, useState, type CSSProperties, type TransitionEvent } from 'react'
import { Check, Dices, Sparkles } from 'lucide-react'
import type { ThemeEntry } from '../../lib/seasons/catalog'
import { hexOf, hexToRgba2, primaryOf, randItem } from '../../lib/seasons/catalog'
import SeasonThemeCard from './SeasonThemeCard'
import Modal from '../ui/Modal'

const CARD_WIDTH = 174

export default function SeasonRouletteModal({
  open,
  target,
  pool,
  onComplete,
  onClose,
}: {
  open: boolean
  target: ThemeEntry | null
  pool: ThemeEntry[]
  onComplete: () => void
  onClose: () => void
}) {
  const stageRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete
  const [phase, setPhase] = useState<'ready' | 'spinning' | 'revealed'>('ready')
  const [winnerIndex, setWinnerIndex] = useState(0)
  const [playKey, setPlayKey] = useState(0)
  const accent = target ? hexOf(primaryOf(target)) : '#a78bfa'

  const cards = useMemo(() => {
    if (!target) return []
    const randomCards = Array.from({ length: 17 }, () => randItem(pool.length ? pool : [target]))
    return [...randomCards, target]
  }, [target?.key, pool])

  useEffect(() => {
    if (!open || !target || !trackRef.current || !stageRef.current) return
    let firstFrame = 0
    let secondFrame = 0
    let fallback = 0
    let revealTimer = 0
    completedRef.current = false
    setPhase('ready')
    setWinnerIndex(cards.length - 1)
    trackRef.current.style.transition = 'none'
    trackRef.current.style.transform = 'translate3d(0,-50%,0)'

    firstFrame = requestAnimationFrame(() => {
      if (!trackRef.current || !stageRef.current) return
      const winner = trackRef.current.children.item(cards.length - 1) as HTMLElement | null
      if (!winner) return
      const centerOffset = winner.offsetLeft + winner.offsetWidth / 2 - stageRef.current.clientWidth / 2
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      secondFrame = requestAnimationFrame(() => {
        if (!trackRef.current) return
        setPhase('spinning')
        trackRef.current.style.transition = reducedMotion
          ? 'transform 900ms cubic-bezier(.16,1,.3,1)'
          : 'transform 4200ms cubic-bezier(.08,.74,.08,1)'
        trackRef.current.style.transform = `translate3d(-${Math.max(0, centerOffset)}px,-50%,0)`
        fallback = window.setTimeout(() => {
          if (completedRef.current) return
          completedRef.current = true
          setPhase('revealed')
          revealTimer = window.setTimeout(() => onCompleteRef.current(), 1150)
        }, reducedMotion ? 1050 : 4400)
      })
    })

    return () => {
      cancelAnimationFrame(firstFrame)
      cancelAnimationFrame(secondFrame)
      window.clearTimeout(fallback)
      window.clearTimeout(revealTimer)
    }
  }, [open, playKey, target?.key, cards.length])

  const handleTransitionEnd = (event: TransitionEvent<HTMLDivElement>) => {
    if (event.propertyName !== 'transform' || phase !== 'spinning' || completedRef.current) return
    completedRef.current = true
    setPhase('revealed')
    window.setTimeout(() => onCompleteRef.current(), 1150)
  }

  if (!open || !target) return null

  return (
    <Modal open={open} onClose={onClose} title="Sorteo de temporada" className="!max-w-5xl !overflow-hidden">
      <div className="relative -mx-5 -mt-2 overflow-hidden rounded-2xl sm:-mx-6">
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{ background: `radial-gradient(ellipse at 50% 5%, ${hexToRgba2(accent, 0.28)}, transparent 62%)` }} />
        <div className="relative flex flex-col items-center px-2 pb-5 pt-2 text-center sm:px-5">
          <span className="mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[.22em]" style={{ borderColor: `${accent}66`, color: accent, background: hexToRgba2(accent, 0.1) }}>
            <Dices className="h-3.5 w-3.5" /> Ruleta de temporadas
          </span>
          <h3 className="text-xl font-black tracking-tight text-[var(--text)] sm:text-2xl">{phase === 'revealed' ? '¡La temporada elegida!' : '¿Qué tema te acompañará?'}</h3>
          <p className="mt-1 max-w-lg text-xs leading-relaxed text-[var(--text-muted)] sm:text-sm">
            {phase === 'revealed' ? 'Tu nueva insignia está lista para comenzar su historia.' : 'Las tarjetas aceleran, giran y se frenan justo en el tema que salió sorteado.'}
          </p>

          <div ref={stageRef} className={`season-roulette-stage relative mt-6 w-full ${phase === 'revealed' ? 'is-revealed' : ''}`} style={{ '--roulette-accent': accent } as CSSProperties}>
            <span className="season-roulette-pointer" aria-hidden />
            <span className="season-roulette-pointer season-roulette-pointer-bottom" aria-hidden />
            <div className="season-roulette-edge season-roulette-edge-left" aria-hidden />
            <div className="season-roulette-edge season-roulette-edge-right" aria-hidden />
            <div className="season-roulette-window" aria-hidden />
            <div ref={trackRef} onTransitionEnd={handleTransitionEnd} className="season-roulette-track">
              {cards.map((entry, index) => (
                <div key={`${entry.key}-${index}`} className={`season-roulette-item ${index === winnerIndex && phase === 'revealed' ? 'is-winner' : ''}`} style={{ width: CARD_WIDTH }}>
                  <SeasonThemeCard entry={entry} count={1} badgeSize={56} active={index === winnerIndex && phase === 'revealed'} className="min-h-[164px] !rounded-2xl !p-2" />
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 flex min-h-8 items-center justify-center gap-2 text-xs font-semibold" style={{ color: phase === 'revealed' ? accent : 'var(--text-muted)' }}>
            {phase === 'revealed' ? <><Check className="h-4 w-4" /> {target.name}</> : <><Sparkles className="h-4 w-4 animate-pulse" /> La suerte está girando…</>}
          </div>
          {phase === 'spinning' && <div className="mt-1 h-1 w-40 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="season-roulette-progress h-full rounded-full" style={{ background: accent }} /></div>}
          {phase === 'ready' && <button type="button" className="sr-only" onClick={() => setPlayKey((key) => key + 1)}>Repetir animación</button>}
        </div>
      </div>
    </Modal>
  )
}
