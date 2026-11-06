import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Archive, BarChart3, BookOpen, CalendarDays, ChevronDown, CircleHelp, Database, MessageCircleHeart, Search, ShieldCheck, Sparkles, WandSparkles } from 'lucide-react'
import { useTutorialStore } from '../store/tutorial'

const guides = [
  { icon: CalendarDays, title: 'Planifica la semana', text: 'Añade horarios recurrentes, detecta cruces y usa los espacios libres para planear actividades.', to: '/semana' },
  { icon: CalendarDays, title: 'Mueve una tarea en el calendario', text: 'Arrástrala a otro día o a una hora del horario diario para cambiar su fecha.', to: '/' },
  { icon: Sparkles, title: 'Filtra tus apartados', text: 'Abre un apartado y usa Vencidas, Para hoy o Próximos 7 días para encontrar lo importante.', to: '/s/trabajo' },
  { icon: BarChart3, title: 'Lee tu progreso', text: 'Compara tu actividad y revisa las conclusiones que resumen tu ritmo reciente.', to: '/estadisticas' },
  { icon: Archive, title: 'Recupera tareas', text: 'En Archivo puedes seleccionar varias tareas archivadas y restaurarlas juntas; también puedes deshacer la restauración.', to: '/archivo' },
  { icon: Database, title: 'Cuida tus datos', text: 'En tu perfil revisa la última sincronización y exporta una copia; desde Ajustes puedes importar un respaldo.', to: '/ajustes' },
]

const questions = [
  { q: '¿Cómo creo una tarea completa?', a: 'Pulsa Nueva tarea o usa Ctrl+N. Escribe un título y añade fecha, prioridad, recordatorio, pasos, etiquetas o enlaces según lo que necesites. Si cierras el formulario, el borrador se recupera automáticamente.' },
  { q: '¿Puedo crear una tarea para un día concreto?', a: 'Sí. En el calendario del Dashboard, toca el día y el formulario se abrirá con esa fecha ya seleccionada.' },
  { q: '¿Cómo cambio la vista de un apartado?', a: 'Abre el apartado y elige Lista o Línea de tiempo. Los filtros por prioridad y etiquetas se pueden desplegar cuando los necesites.' },
  { q: '¿Dónde encuentro lo que archivé?', a: 'Abre Archivo desde el menú lateral. Allí puedes alternar entre tareas completadas y archivadas; también puedes restaurarlas.' },
  { q: '¿Cómo puedo mover una tarea en el calendario?', a: 'Arrastra una tarea a otro día del calendario o a una hora del horario del día. La fecha y, al moverla de día, la hora se conservan.' },
  { q: '¿Cómo encuentro tareas urgentes en un apartado?', a: 'Usa las vistas rápidas Vencidas, Para hoy y Próximos 7 días. Cada una muestra cuántas tareas pendientes hay.' },
  { q: '¿Cómo detecto cruces en mi horario?', a: 'En Mi semana, los bloques que coinciden se marcan en rojo y aparecen listados arriba de la agenda.' },
  { q: '¿Puedo restaurar varias tareas archivadas?', a: 'Sí. En Archivo abre Archivadas, pulsa Seleccionar varias y luego Restaurar. Si te equivocas, usa Deshacer en el aviso.' },
  { q: '¿Cómo funciona la selección diaria de skins?', a: 'La selección rota cada día. Desliza o usa las flechas del carrusel para recorrerla; al llegar al final, continúa desde el principio.' },
  { q: '¿Puedo cambiar la apariencia y el tamaño del texto?', a: 'Sí. En Ajustes puedes elegir el tema de color, aumentar el tamaño general del texto y activar contraste reforzado.' },
  { q: '¿Cómo guardo una copia de mis datos?', a: 'Abre tu perfil desde el botón de usuario y pulsa Exportar mis datos. También puedes importar una copia desde Ajustes.' },
  { q: '¿Qué hago si algo no se sincroniza?', a: 'Revisa el indicador de conexión de la parte superior. Si vuelves a conectarte, Quacker reintentará las operaciones pendientes. Si continúa, envíanos una opinión con los detalles.' },
]

export default function Help() {
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es')
    return questions.filter((item) => !term || `${item.q} ${item.a}`.toLocaleLowerCase('es').includes(term))
  }, [query])

  return <div className="mx-auto max-w-5xl space-y-8 pb-8">
    <section className="relative overflow-hidden rounded-3xl border border-[var(--accent)]/25 bg-gradient-to-br from-[var(--surface)] via-[var(--surface)] to-[var(--accent)]/15 p-6 sm:p-9">
      <div className="pointer-events-none absolute -right-12 -top-16 h-56 w-56 rounded-full bg-[var(--accent)]/10 blur-3xl" />
      <div className="relative max-w-2xl">
        <p className="eyebrow">Centro de ayuda</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Vamos a ponerlo en orden.</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">Guías, respuestas y accesos rápidos para que aproveches Quacker sin tener que buscar por toda la app.</p>
        <label className="relative mt-6 block max-w-xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Busca una respuesta…" className="min-h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--bg)]/80 pl-12 pr-4 text-sm outline-none placeholder:text-[var(--text-muted)] focus:border-[var(--accent)]" />
        </label>
      </div>
    </section>

    <section>
      <div className="mb-4 flex items-end justify-between gap-3"><div><p className="eyebrow">Empieza por aquí</p><h2 className="mt-1 text-xl font-bold">Guías rápidas</h2></div><button onClick={() => useTutorialStore.getState().start()} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-2 text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent)]/10"><BookOpen className="h-4 w-4" />Ver recorrido</button></div>
      <div className="grid gap-3 sm:grid-cols-2">{guides.map(({ icon: Icon, title, text, to }, index) => <Link to={to} key={title} className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 transition-all hover:-translate-y-0.5 hover:border-[var(--accent)]/50 hover:shadow-lg"><div className="flex items-start gap-3"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--accent)]/10 text-[var(--accent)]"><Icon className="h-5 w-5" /></span><div className="min-w-0 flex-1"><p className="text-sm font-bold">{String(index + 1).padStart(2, '0')} · {title}</p><p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{text}</p></div><ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[var(--text-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--accent)]" /></div></Link>)}</div>
    </section>

    <section>
      <div className="mb-4"><p className="eyebrow">Respuestas claras</p><h2 className="mt-1 text-xl font-bold">Preguntas frecuentes</h2></div>
      <div className="space-y-2">{filtered.map(({ q, a }) => <details key={q} className="group rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 open:border-[var(--accent)]/40"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold"><span>{q}</span><ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-muted)] transition-transform group-open:rotate-180" /></summary><p className="mt-3 max-w-3xl border-t border-[var(--border)] pt-3 text-sm leading-relaxed text-[var(--text-muted)]">{a}</p></details>)}</div>
      {filtered.length === 0 && <div className="rounded-2xl border border-dashed border-[var(--border)] p-8 text-center"><CircleHelp className="mx-auto h-8 w-8 text-[var(--accent)]" /><p className="mt-3 text-sm font-semibold">No encontramos esa respuesta</p><p className="mt-1 text-xs text-[var(--text-muted)]">Prueba con otras palabras o cuéntanos qué necesitas.</p></div>}
    </section>

    <section className="grid gap-3 sm:grid-cols-3">
      <Link to="/opiniones" className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]/50"><MessageCircleHeart className="h-5 w-5 text-[var(--accent)]" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold">Habla con nosotros</span><span className="text-xs text-[var(--text-muted)]">Cuéntanos qué pasó</span></span><ArrowRight className="h-4 w-4 text-[var(--text-muted)]" /></Link>
      <Link to="/privacidad" className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]/50"><ShieldCheck className="h-5 w-5 text-[var(--accent)]" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold">Privacidad</span><span className="text-xs text-[var(--text-muted)]">Tus datos y controles</span></span><ArrowRight className="h-4 w-4 text-[var(--text-muted)]" /></Link>
      <Link to="/ajustes" className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 hover:border-[var(--accent)]/50"><WandSparkles className="h-5 w-5 text-[var(--accent)]" /><span className="min-w-0 flex-1"><span className="block text-sm font-bold">Personaliza Quacker</span><span className="text-xs text-[var(--text-muted)]">Ajustes, tema y accesibilidad</span></span><ArrowRight className="h-4 w-4 text-[var(--text-muted)]" /></Link>
    </section>
  </div>
}
