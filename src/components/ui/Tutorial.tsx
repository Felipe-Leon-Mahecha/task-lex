import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTutorialStore } from '../../store/tutorial'
import { useSectionsStore } from '../../store/sections'

interface Rect {
  left: number
  top: number
  width: number
  height: number
}

interface Step {
  selector?: string
  path?: string
  title: string
  body: string
}

function buildSteps(sections: { id: string; label: string }[]): Step[] {
  const steps: Step[] = [
    {
      selector: '[data-tut="search"]',
      title: 'Búsqueda rápida',
      body: 'Encuentra cualquier tarea, nota o etiqueta en segundos, sin importar en qué apartado esté. Atajo de teclado: tecla /.',
    },
    {
      selector: '[data-tut="focus"]',
      title: 'Foco y sonidos',
      body: 'Sesiones de concentración con descansos (Pomodoro). Toca el reloj para abrirlas y elige un sonido ambiente: lluvia, violín, lo-fi o ruido blanco.',
    },
    {
      selector: '[data-tut="logout"]',
      title: 'Tu sesión',
      body: 'Aquí cierras sesión. Tus tareas se guardan y sincronizan en la nube automáticamente.',
    },
    {
      path: '/',
      title: 'El Dashboard',
      body: 'Tu centro de control: meta diaria, racha de días productivos, tareas de hoy, próximos 7 días y estadísticas de la semana.',
    },
  ]
  sections.forEach((sec, i) => {
    steps.push({
      path: `/s/${sec.id}`,
      title: `Apartado: ${sec.label}`,
      body:
        i === 0
          ? `Cada tarea vive dentro de un apartado (una categoría). Este es "${sec.label}". Arriba tienes el botón "+ Nueva tarea", las pestañas de vista (Lista, Kanban, Calendario, Gantt) y filtros por prioridad y etiqueta.`
          : `Este apartado se llama "${sec.label}" y funciona igual que el anterior: crea tareas con "+ Nueva tarea" y cámbiales la vista con las pestañas de arriba.`,
    })
  })
  steps.push(
    {
      title: 'Cómo crear una tarea',
      body: 'Toca "+ Nueva tarea" y escribe el título. Puedes elegir prioridad (baja, media, alta), fecha de vencimiento, subtareas, si se repite (diaria, semanal o mensual), un recordatorio y adjuntar fotos. Nota: máximo 2 fotos por tarea para cuidar el espacio de tu nube gratuita.',
    },
    {
      title: 'Estados y acciones',
      body: 'Pasa una tarea por Pendiente → En progreso → Hecha con el botón de círculo. Dentro de cada tarea puedes duplicarla, moverla a otro apartado o archivarla. Las que completas cuentan para tu meta diaria y tu racha.',
    },
    {
      title: 'Vistas de cada apartado',
      body: 'Lista: todas en fila. Kanban: columnas por estado. Calendario: organizadas por fecha. Gantt: línea de tiempo. Cambias con las pestañas y Flux recuerda tu preferencia para cada apartado.',
    },
    {
      path: '/archivo',
      title: 'Archivo',
      body: 'Lo que archivas no se borra: va a parar aquí. Puedes restaurarlo a su apartado o eliminarlo definitivamente.',
    },
    {
      path: '/creditos',
      title: 'Sobre el creador',
      body: 'Flux la hizo Felipe Leon. Toca finalizar para ver los créditos y sus redes.',
    },
  )
  return steps
}

export default function Tutorial() {
  const open = useTutorialStore((s) => s.open)
  const step = useTutorialStore((s) => s.step)
  const next = useTutorialStore((s) => s.next)
  const close = useTutorialStore((s) => s.close)
  const sections = useSectionsStore((s) => s.sections)
  const [rect, setRect] = useState<Rect | null>(null)
  const navigate = useNavigate()

  const steps = useMemo(() => buildSteps(sections), [sections])
  const idx = Math.min(step, Math.max(0, steps.length - 1))
  const current = steps[idx]

  useEffect(() => {
    if (!open) return
    if (current.path) {
      setRect(null)
      navigate(current.path)
      return
    }
    if (!current.selector) {
      setRect(null)
      return
    }
    setRect(null)
    const el = document.querySelector<HTMLElement>(current.selector)
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const t = setTimeout(() => {
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.height > 0) {
        setRect({ left: r.left, top: r.top, width: r.width, height: r.height })
      }
    }, 400)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, step, current.selector, current.path])

  if (!open) return null

  const handleNext = () => {
    if (step + 1 >= steps.length) close()
    else next()
  }

  return (
    <div className="fixed inset-0 z-[70]">
      {rect ? (
        <div
          style={{
            position: 'fixed',
            left: rect.left - 6,
            top: rect.top - 6,
            width: rect.width + 12,
            height: rect.height + 12,
            borderRadius: 16,
            boxShadow: '0 0 0 2px var(--accent), 0 0 0 100vmax rgba(0,0,0,0.7)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-black/70" />
      )}
      <div className="absolute inset-x-0 bottom-6 mx-auto w-[min(92%,26rem)] rounded-2xl border border-[var(--border)] bg-[var(--bg)] p-5 shadow-2xl">
        <p className="eyebrow">
          Tutorial · Paso {idx + 1} de {steps.length}
        </p>
        <h3 className="mt-1 text-lg font-bold tracking-tight">{current.title}</h3>
        <p className="mt-1 text-sm text-[var(--text-muted)]">{current.body}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            onClick={close}
            className="rounded-full px-3 py-2 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
          >
            Omitir tutorial
          </button>
          <button onClick={handleNext} className="btn-primary accent-shine">
            {step + 1 >= steps.length ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>
  )
}
