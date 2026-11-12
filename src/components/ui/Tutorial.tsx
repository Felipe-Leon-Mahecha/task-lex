import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTutorialStore } from '../../store/tutorial'
import { useSectionsStore } from '../../store/sections'

type Rect = { left: number; top: number; width: number; height: number }
type Step = { path: string; selector?: string; title: string; body: string }

function buildSteps(sections: { id: string }[]): Step[] {
  const firstSection = sections[0]
  return [
    { path: '/', title: 'Bienvenido a Quacker', body: 'Esta guía recorre las herramientas principales. Puedes avanzar a tu ritmo y salir cuando quieras; vuelve a abrirla desde Ajustes → Guía rápida.' },
    { path: '/', selector: '[data-tut="menu"]', title: 'Navegación principal', body: 'Abre el menú para cambiar entre Tu día, bandeja, apartados, planes, notas, estadísticas, tienda y ajustes. En móvil, el menú también sirve para moverte por toda la app.' },
    { path: '/', selector: '[data-tut="search"]', title: 'Encuentra tareas rápido', body: 'Usa la búsqueda para localizar tareas por su contenido y saltar directamente al resultado.' },
    { path: '/', selector: '[data-tut="dashboard-title"]', title: 'Tu día', body: 'Aquí tienes una vista general de lo que requiere atención, tu avance y accesos para planear o personalizar la pantalla.' },
    { path: '/bandeja', title: 'Bandeja de entrada', body: 'Guarda aquí tareas que todavía no has organizado. Después puedes moverlas al apartado que corresponda.' },
    { path: firstSection ? `/s/${firstSection.id}` : '/', selector: firstSection ? '[data-tut="quick-add"]' : undefined, title: 'Apartados y tareas', body: 'Cada apartado ayuda a separar tus tareas por contexto. La entrada rápida crea una tarea sencilla; el formulario completo permite agregar fechas, prioridad, recordatorios y subtareas.' },
    { path: '/plan-dia', title: 'Plan del día', body: 'Organiza las tareas que quieres atender hoy y distribuye tu carga con intención.' },
    { path: '/semana', title: 'Plan semanal', body: 'Consulta y organiza tu semana para mantener visibles tus bloques y compromisos.' },
    { path: '/notas', selector: '[data-tut="notes-page"]', title: 'Notas', body: 'Guarda ideas y referencias. Las carpetas te ayudan a ordenar notas relacionadas y encontrarlas después.' },
    { path: '/estadisticas', title: 'Estadísticas', body: 'Revisa tu actividad y progreso a partir de las tareas que completas y tus sesiones de foco.' },
    { path: '/archivo', title: 'Archivo', body: 'Las tareas terminadas o archivadas se conservan aquí para que puedas consultarlas sin mezclar todo con lo pendiente.' },
    { path: '/tienda', selector: '[data-tut="shop-title"]', title: 'Tienda y recompensas', body: 'Personaliza tu espacio, revisa artículos y coleccionables, y consulta los logros y recompensas ligados a tu actividad.' },
    { path: '/temporadas', title: 'Temporadas', body: 'Consulta las actividades y colecciones de temporada disponibles para tu cuenta.' },
    { path: '/ajustes', title: 'Ajustes', body: 'Configura notificaciones, foco, apariencia, sonido, copias de seguridad, apartados y accesibilidad.' },
    { path: '/ayuda', title: 'Ayuda y privacidad', body: 'El centro de ayuda reúne respuestas y accesos a soporte. La política de privacidad explica cómo se tratan tus datos.' },
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
  const index = Math.max(0, Math.min(step, steps.length - 1))
  const current = steps[index]

  useEffect(() => {
    if (!open || !current) return
    setRect(null)
    if (location.pathname !== current.path) {
      navigate(current.path)
      return
    }
    if (!current.selector) return
    let frame = 0
    let timer = 0
    let retry = 0
    let cancelled = false
    const findTarget = () => {
      if (cancelled) return
      const target = document.querySelector<HTMLElement>(current.selector!)
      if (!target) {
        if (retry++ < 24) frame = window.requestAnimationFrame(findTarget)
        return
      }
      target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      timer = window.setTimeout(() => {
        if (cancelled) return
        const box = target.getBoundingClientRect()
        if (box.width && box.height) setRect({ left: box.left, top: box.top, width: box.width, height: box.height })
      }, 350)
    }
    frame = window.requestAnimationFrame(findTarget)
    return () => { cancelled = true; window.cancelAnimationFrame(frame); window.clearTimeout(timer) }
  }, [open, step, current, location.pathname, navigate])

  useEffect(() => {
    if (!open) return
    const update = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
      if (!current?.selector) return setRect(null)
      const target = document.querySelector<HTMLElement>(current.selector)
      if (!target) return
      const box = target.getBoundingClientRect()
      if (box.width && box.height) setRect({ left: box.left, top: box.top, width: box.width, height: box.height })
    }
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => { window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true) }
  }, [open, current])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') step + 1 >= steps.length ? close() : next()
      if (event.key === 'ArrowLeft' && step > 0) useTutorialStore.setState({ step: step - 1 })
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step, steps.length, close, next])

  if (!open || !current) return null
  const finishStep = () => step + 1 >= steps.length ? close() : next()
  const hasTarget = !!current.selector && !!rect
  const centerX = hasTarget ? rect!.left + rect!.width / 2 : viewport.width / 2
  const centerY = hasTarget ? rect!.top + rect!.height / 2 : viewport.height / 2
  const radius = hasTarget ? Math.max(rect!.width, rect!.height) / 2 + 20 : 0
  const panelWidth = Math.min(viewport.width * 0.92, 432)
  const panelLeft = Math.max(12, Math.min(viewport.width - panelWidth - 12, centerX - panelWidth / 2))
  const panelTop = hasTarget && centerY < viewport.height / 2
    ? Math.max(12, Math.min(viewport.height - 260, rect!.top + rect!.height + radius + 20))
    : undefined
  const panelBottom = hasTarget && panelTop === undefined ? Math.max(12, viewport.height - rect!.top + radius + 20) : undefined

  return <div className="fixed inset-0 z-[70]" aria-label="Recorrido guiado" role="dialog" aria-modal="true">
    <div className="absolute inset-0 bg-black/80" style={hasTarget ? { background: `radial-gradient(circle ${radius}px at ${centerX}px ${centerY}px, transparent 99%, rgba(0,0,0,.82) 100%)` } : undefined} />
    {hasTarget && <div aria-hidden className="pointer-events-none fixed rounded-full border-2 border-[var(--accent)] shadow-[0_0_0_4px_rgba(255,255,255,.2),0_0_30px_var(--accent)]" style={{ left: centerX - radius, top: centerY - radius, width: radius * 2, height: radius * 2 }} />}
    <section className="fixed max-h-[min(80vh,440px)] overflow-y-auto rounded-3xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-[0_24px_90px_rgba(0,0,0,.55)]" style={{ left: panelLeft, width: panelWidth, ...(panelTop !== undefined ? { top: panelTop } : panelBottom !== undefined ? { bottom: panelBottom } : { top: '50%', transform: 'translateY(-50%)' }) }}>
      <div className="mb-3 flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[.18em] text-[var(--accent)]">Guía completa</p><span className="rounded-full bg-[var(--surface-2)] px-2.5 py-1 text-[10px] font-bold text-[var(--text-muted)]">{String(index + 1).padStart(2, '0')} / {String(steps.length).padStart(2, '0')}</span></div>
      <h2 className="text-lg font-extrabold tracking-tight text-[var(--text)]">{current.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)]">{current.body}</p>
      <div className="mt-5 flex items-center justify-between gap-2 border-t border-[var(--border)] pt-4">
        <div className="flex gap-1"><button type="button" disabled={step <= 0} onClick={() => useTutorialStore.setState({ step: step - 1 })} className="rounded-xl px-3 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)] disabled:opacity-40">Atrás</button><button type="button" onClick={close} className="rounded-xl px-3 py-2.5 text-xs font-semibold text-[var(--text-muted)] transition hover:bg-[var(--surface-2)]">Salir</button></div>
        <button type="button" onClick={finishStep} className="btn-primary min-h-11 rounded-xl px-5">{index + 1 >= steps.length ? 'Terminar' : 'Continuar'}</button>
      </div>
    </section>
  </div>
}
