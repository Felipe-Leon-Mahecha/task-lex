import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'

export default function PetSpeechBubble({
  children,
  placement = 'above',
  align = 'right',
  className = '',
}: {
  children: ReactNode
  placement?: 'above' | 'below'
  align?: 'left' | 'center' | 'right'
  className?: string
}) {
  const bubbleRef = useRef<HTMLDivElement>(null)
  const tailRef = useRef<HTMLSpanElement>(null)
  const [flipped, setFlipped] = useState(false)
  const resolvedPlacement = flipped ? (placement === 'above' ? 'below' : 'above') : placement

  useLayoutEffect(() => {
    const bubble = bubbleRef.current
    if (!bubble) return
    const adjust = () => {
      const anchor = bubble.parentElement?.getBoundingClientRect()
      if (!anchor) return
      const margin = 10
      const gap = 9
      const width = bubble.offsetWidth
      const height = bubble.offsetHeight
      const aboveSpace = anchor.top - margin
      const belowSpace = window.innerHeight - anchor.bottom - margin
      const aboveFits = aboveSpace >= height + gap
      const belowFits = belowSpace >= height + gap

      let useAbove = placement === 'above'
      if (useAbove && !aboveFits && belowFits) useAbove = false
      else if (!useAbove && !belowFits && aboveFits) useAbove = true
      else if (!aboveFits && !belowFits) useAbove = aboveSpace >= belowSpace
      const shouldFlip = useAbove !== (placement === 'above')
      if (shouldFlip !== flipped) {
        setFlipped(shouldFlip)
        return
      }

      const desiredLeft = align === 'right'
        ? anchor.width - width
        : align === 'center'
          ? (anchor.width - width) / 2
          : 0
      const minLeft = margin - anchor.left
      const maxLeft = window.innerWidth - margin - anchor.left - width
      const left = Math.max(minLeft, Math.min(desiredLeft, maxLeft))
      const desiredTop = useAbove ? -height - gap : anchor.height + gap
      const minTop = margin - anchor.top
      const maxTop = window.innerHeight - margin - anchor.top - height
      const top = Math.max(minTop, Math.min(desiredTop, maxTop))
      bubble.style.left = `${left}px`
      bubble.style.top = `${top}px`

      const tail = tailRef.current
      if (tail) {
        const tailLeft = Math.max(14, Math.min(width - 20, anchor.left + anchor.width / 2 - (anchor.left + left) - 6))
        tail.style.left = `${tailLeft}px`
        tail.style.right = 'auto'
      }
    }

    adjust()
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(adjust)
    observer?.observe(bubble)
    if (bubble.parentElement) observer?.observe(bubble.parentElement)
    window.addEventListener('resize', adjust)
    window.addEventListener('scroll', adjust, true)
    window.visualViewport?.addEventListener('resize', adjust)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', adjust)
      window.removeEventListener('scroll', adjust, true)
      window.visualViewport?.removeEventListener('resize', adjust)
    }
  }, [placement, align, children, flipped])

  const tailVertical = resolvedPlacement === 'above' ? '-bottom-1.5' : '-top-1.5'

  return (
    <div ref={bubbleRef} className={`pointer-events-none absolute z-40 max-h-[calc(100dvh-20px)] w-max max-w-[min(260px,calc(100vw-24px))] rounded-2xl border border-black/5 bg-white px-3.5 py-2 text-[11px] leading-snug text-gray-800 shadow-[0_8px_24px_rgba(0,0,0,.2)] dark:bg-gray-100 ${className}`}>
      <span ref={tailRef} aria-hidden className={`absolute ${tailVertical} h-3 w-3 rotate-45 rounded-[2px] bg-white dark:bg-gray-100`} />
      <span className="pet-speech-content pointer-events-auto relative block max-h-[calc(100dvh-48px)] overflow-y-auto whitespace-normal break-words">{children}</span>
    </div>
  )
}
