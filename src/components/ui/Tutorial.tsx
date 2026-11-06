import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTutorialStore } from '../../store/tutorial'
import { useSectionsStore } from '../../store/sections'

type Rect = { left: number; top: number; width: number; height: number }
type Step = { path: string; selector: string; title: string; body: string }

function buildSteps(sections: { id: string }[]): Step[] {
  const firstSection = sections[0]
  return [
    { path: '/', selector: '[data-tut="dashboard-title"]', title: 'Tu día empieza aquí', body: 'Desde esta pantalla puedes ver lo que sigue, planear el día y revisar tu avance. El menú lateral te lleva al resto de Quacker.' },
    { path: firstSection ? `/s/${firstSection.id}` : '/', selector: firstSection ? '[data-tut="quick-add"]' : '[data-tut="dashboard-title"]', title: 'Un espacio para cada cosa', body: 'Escribe una tarea aquí y pulsa Enter para agregarla rápido. Usa “Nueva tarea” si quieres añadir fecha, prioridad, subtareas o recordatorios.' },
    { path: '/notas', selector: '[data-tut="notes-page"]', title: 'Tus ideas también tienen su lugar', body: 'Ordena notas por carpetas y vuelve a ellas cuando necesites información que acompaña tus tareas.' },
    { path: '/tienda', selector: '[data-tut="shop-title"]', title: 'Personaliza y celebra tus avances', body: 'En la tienda encontrarás estilos, inventario, temas y logros. Completar tareas también te permite ganar recompensas.' },
  ]
}

export default function Tutorial() {
  const open = useTutorialStore((s) => s.open)
  const step = useTutorialStore((s) => s.step)
  const next = useTutorialStore((s) => s.next)
  const close = useTutorialStore((s) => s.close)
  const sections = useSectionsStore((s) => s.sections)
  const [rect, setRect] = useState<Rect | null>(null)
  const [viewport, setViewport] = useState({ width: window.innerWidth, height: window.innerHeight })
  const navigate = useNavigate()
  const location = useLocation()
  const steps = useMemo(() => buildSteps(sections), [sections])
  const index = Math.min(step, steps.length - 1)
  const current = steps[index]

  useEffect(() => {
    if (!open || !current) return
    setRect(null)
    if (location.pathname !== current.path) {
      navigate(current.path)
      return
    }
    let frame = 0
    let retry = 0
    let cancelled = false
    const findTarget = () => {
      if (cancelled) return
      const target = document.querySelector<HTMLElement>(current.selector)
      if (!target) {
        if (retry++ < 12) frame = window.requestAnimationFrame(findTarget)
        return
      }
      target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      window.setTimeout(() => {
        if (cancelled) return
        const box = target.getBoundingClientRect()
        if (box.width && box.height) setRect({ left: box.left, top: box.top, width: box.width, height: box.height })
      }, 300)
    }
    frame = window.requestAnimationFrame(findTarget)
    return () => { cancelled = true; if (frame) window.cancelAnimationFrame(frame) }
  }, [open, step, current, location.pathname, navigate])

  useEffect(() => {
    if (!open) return
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      const target = current && document.querySelector<HTMLElement>(current.selector)
      if (!target) return
      const box = target.getBoundingClientRect()
      if (box.width && box.height) setRect({ left: box.left, top: box.top, width: box.width, height: box.height })
    }
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true) }
  }, [open, current])

  if (!open || !current) return null
  const finishStep = () => step + 1 >= steps.length ? close() : next()
  const centerX = rect ? rect.left + rect.width / 2 : viewport.width / 2
  const centerY = rect ? rect.top + rect.height / 2 : viewport.height / 2
  const radius = rect ? Math.max(rect.width, rect.height) / 2 + 20 : 0
  const panelWidth = Math.min(viewport.width * 0.92, 432)
  const panelLeft = Math.max(12, Math.min(viewport.width - panelWidth - 12, centerX - panelWidth / 2))
  const panelTop = rect
    ? centerY < viewport.height / 2
      ? Math.max(12, Math.min(viewport.height - 240, rect.top + rect.height + radius + 20))
      : undefined
    : undefined
  const panelBottom = rect && panelTop === undefined ? Math.max(12, viewport.height - rect.top + radius + 20) : 16

  return <div className="fixed inset-0 z-[70]" aria-label="Recorrido guiado" role="dialog" aria-modal="true">
    <div className="absolute inset-0 bg-black/78" style={rect ? { background: `radial-gradient(circle ${radius}px at ${centerX}px ${centerY}px, transparent 99%, rgba(0,0,0,.80) 100%)` } : undefined} />
    {rect && <div aria-hidden className="pointer-events-none fixed rounded-full border-2 border-[var(--accent)] shadow-[0_0_0_4px_rgba(255,255,255,.2),0_0_30px_var(--accent)]" style={{ left: centerX - radius, top: centerY - radius, width: radius * 2, height: radius * 2 }} />}
    <section className="fixed rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-[0_24px_90px_rgba(0,0,0,.55)]" style={{ left: panelLeft, width: panelWidth, ...(panelTop !== undefined ? { top: panelTop } : { bottom: panelBottom }) }}>
      <div className="mb-3 flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--accent)]">Tu recorrido</p><span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)]">{String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span></div>
      <h2 className="text-lg font-extrabold tracking-tight text-[var(--text)]">{current.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{current.body}</p>
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
        <button type="button" onClick={close} className="rounded-xl px-3 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)]">Salir</button>
        <button type="button" onClick={finishStep} className="btn-primary min-h-11 rounded-xl px-5">{index + 1 >= steps.length ? 'Terminar recorrido' : 'Continuar'}</button>
      </div>
    </section>
  </div>
}
