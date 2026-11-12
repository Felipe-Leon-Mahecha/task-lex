import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { ADMIN_EMAIL } from '../../lib/appInfo'
import { getHolidayPreview, HOLIDAY_PREVIEW_EVENT, type HolidayPreview } from '../../lib/holidayPreview'
import { useAuthStore } from '../../store/auth'

type EventMode = 'month' | 'christmas' | 'newyear' | null

function resolveMode(preview: HolidayPreview, now: Date): EventMode {
  if (preview === 'month') return 'month'
  if (preview === 'christmas24' || preview === 'christmas25') return 'christmas'
  if (preview === 'newyear') return 'newyear'
  if (now.getMonth() !== 11) return null
  if (now.getDate() === 24 || now.getDate() === 25) return 'christmas'
  if (now.getDate() === 31) return 'newyear'
  return 'month'
}

export default function DecemberAmbience() {
  const user = useAuthStore((s) => s.user)
  const isOwner = user?.email?.trim().toLowerCase() === ADMIN_EMAIL
  const location = useLocation()
  const [now, setNow] = useState(() => new Date())
  const [preview, setPreview] = useState<HolidayPreview>(() => getHolidayPreview())

  useEffect(() => {
    const refresh = () => { setNow(new Date()); setPreview(getHolidayPreview()) }
    window.addEventListener(HOLIDAY_PREVIEW_EVENT, refresh)
    const timer = window.setInterval(refresh, 30_000)
    return () => { window.removeEventListener(HOLIDAY_PREVIEW_EVENT, refresh); window.clearInterval(timer) }
  }, [])

  const mode = isOwner ? resolveMode(preview, now) : resolveMode('auto', now)
  useEffect(() => {
    document.documentElement.classList.toggle('quacker-december', !!mode)
    return () => document.documentElement.classList.remove('quacker-december')
  }, [mode])

  if (!mode || location.pathname === '/temporadas') return null
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const snow = Array.from({ length: reduceMotion ? 12 : 32 }, (_, index) => ({
    left: `${(index * 37 + 11) % 100}%`, delay: `${-((index * 1.7) % 12)}s`, duration: `${10 + (index % 9)}s`, size: 2 + (index % 4),
  }))
  const title = mode === 'christmas' ? (preview === 'christmas24' || (preview === 'auto' && now.getDate() === 24) ? 'Nochebuena · 24 de diciembre' : 'Navidad · 25 de diciembre') : mode === 'newyear' ? 'Cierre de año · 31 de diciembre' : 'Temporada de diciembre'

  return createPortal(<>
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[45] flex h-2 justify-around overflow-hidden">
      {Array.from({ length: 26 }, (_, index) => <span key={index} className={`december-light ${index % 4 === 0 ? 'december-light-gold' : index % 4 === 1 ? 'december-light-red' : index % 4 === 2 ? 'december-light-green' : 'december-light-blue'}`} />)}
    </div>
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[31] overflow-hidden">
      {snow.map((flake, index) => <i key={index} className="december-snow" style={{ left: flake.left, animationDelay: flake.delay, animationDuration: flake.duration, width: flake.size, height: flake.size }} />)}
      {mode === 'newyear' && !reduceMotion && <div className="december-fireworks"><span /><span /><span /></div>}
    </div>
    <div aria-hidden className={`pointer-events-none fixed right-3 top-4 z-[44] hidden rounded-full border border-white/15 bg-slate-950/65 px-3 py-1.5 text-[10px] font-bold tracking-wide text-amber-100 shadow-lg backdrop-blur sm:block ${mode === 'newyear' ? 'december-party' : ''}`}>{title}</div>
    {isOwner && now.getMonth() !== 11 && preview !== 'auto' && <div aria-hidden className="pointer-events-none fixed bottom-3 right-3 z-[44] rounded-full bg-slate-950/75 px-3 py-1 text-[9px] font-bold text-amber-100">Vista previa privada</div>}
  </>, document.body)
}
