import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type SyntheticEvent } from 'react'

/** Lets a horizontal track be dragged with a mouse or finger. */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const start = useRef<{ pointerId: number; x: number; y: number; scrollLeft: number; scrollSnapType: string; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const settleFrame = useRef<number | null>(null)
  const settleSnapType = useRef<string | null>(null)

  const onPointerDown = useCallback((event: ReactPointerEvent<T>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return
    const track = ref.current
    if (!track) return
    if (settleFrame.current !== null) {
      cancelAnimationFrame(settleFrame.current)
      settleFrame.current = null
      if (track && settleSnapType.current !== null) track.style.scrollSnapType = settleSnapType.current
      settleSnapType.current = null
    }
    start.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, scrollLeft: track.scrollLeft, scrollSnapType: track.style.scrollSnapType, moved: false }
    track.style.scrollSnapType = 'none'

    const cleanup = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onEnd)
      window.removeEventListener('pointercancel', onEnd)
    }
    const onMove = (moveEvent: PointerEvent) => {
      const current = start.current
      if (!current || current.pointerId !== moveEvent.pointerId) return
      const dx = moveEvent.clientX - current.x
      const dy = moveEvent.clientY - current.y
      if (!current.moved && Math.abs(dx) < 6) return
      if (!current.moved && Math.abs(dy) > Math.abs(dx) * 1.15) {
        start.current = null
        if (ref.current) ref.current.style.scrollSnapType = current.scrollSnapType
        cleanup()
        return
      }
      current.moved = true
      moveEvent.preventDefault()
      if (ref.current) ref.current.scrollLeft = current.scrollLeft - dx
    }
    const onEnd = (endEvent: PointerEvent) => {
      const current = start.current
      if (!current || current.pointerId !== endEvent.pointerId) return
      start.current = null
      cleanup()
      const currentTrack = ref.current
      if (!current.moved) {
        if (currentTrack) currentTrack.style.scrollSnapType = current.scrollSnapType
        return
      }
      const cards = currentTrack ? [...currentTrack.querySelectorAll<HTMLElement>('[data-carousel-card]')] : []
      if (currentTrack && cards.length) {
        const center = currentTrack.getBoundingClientRect().left + currentTrack.clientWidth / 2
        const nearest = cards.reduce((best, card) => Math.abs(card.getBoundingClientRect().left + card.clientWidth / 2 - center) < Math.abs(best.getBoundingClientRect().left + best.clientWidth / 2 - center) ? card : best)
        const cardCenter = nearest.getBoundingClientRect().left + nearest.clientWidth / 2
        const from = currentTrack.scrollLeft
        const max = currentTrack.scrollWidth - currentTrack.clientWidth
        const to = Math.max(0, Math.min(max, from + cardCenter - center))
        const started = performance.now()
        const duration = 560
        const animateSettle = (time: number) => {
          const progress = Math.min(1, (time - started) / duration)
          const eased = 1 - Math.pow(1 - progress, 3)
          currentTrack!.scrollLeft = from + (to - from) * eased
          if (progress < 1) settleFrame.current = requestAnimationFrame(animateSettle)
          else {
            settleFrame.current = null
            currentTrack!.style.scrollSnapType = settleSnapType.current ?? current.scrollSnapType
            settleSnapType.current = null
          }
        }
        if (Math.abs(to - from) > 1) {
          settleSnapType.current = current.scrollSnapType
          settleFrame.current = requestAnimationFrame(animateSettle)
        }
        else currentTrack.style.scrollSnapType = current.scrollSnapType
      } else if (currentTrack) {
        currentTrack.style.scrollSnapType = current.scrollSnapType
      }
      suppressClick.current = true
      window.setTimeout(() => { suppressClick.current = false }, 0)
    }
    window.addEventListener('pointermove', onMove, { passive: false })
    window.addEventListener('pointerup', onEnd)
    window.addEventListener('pointercancel', onEnd)
  }, [])

  const onClickCapture = useCallback((event: SyntheticEvent<T>) => {
    if (!suppressClick.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClick.current = false
  }, [])

  return { ref, onPointerDown, onClickCapture }
}
