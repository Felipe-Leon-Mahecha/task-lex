import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  AtSign,
  Calendar,
  CloudUpload,
  Flame,
  MessageCircle,
  Rocket,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Star,
  Target,
  Timer,
  Waves,
  Globe,
  Info,
} from 'lucide-react'
import { APP_NAME, APP_VERSION } from '../lib/appInfo'
import { useUIStore } from '../store/ui'

const WA = 'https://wa.me/573104885609?text=¡Hola%20Felipe!%20Vi%20Flux%20y%20me%20interesa%20una%20p%C3%A1gina%20web.'
const IG = 'https://www.instagram.com/felipeleonmm'
const WEB = 'https://felipe-leon-web-studio.vercel.app/'

const bulletClass = 'flex items-start gap-2 text-sm'
const outlineBtn =
  'inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-4 py-2 text-sm hover:bg-[var(--surface-2)]'

const appFeatures = [
  { Icon: Flame, text: 'Meta diaria y racha de días productivos' },
  { Icon: Timer, text: 'Pomodoro con sonidos de foco: lluvia, lo-fi, violín o ruido blanco' },
  { Icon: Calendar, text: 'Calendario, tablero Kanban y Gantt para ver tus tareas como prefieras' },
  { Icon: CloudUpload, text: 'Sincronización en la nube: tu progreso seguro en cualquier dispositivo' },
]

const studioBullets = [
  { Icon: Sparkles, text: 'Diseño 100% a tu medida, con tu identidad' },
  { Icon: Smartphone, text: 'Perfectas en celular, tablet y PC' },
  { Icon: Rocket, text: 'Rápidas y bien posicionadas en Google' },
  { Icon: ShoppingBag, text: 'Tiendas online, catálogos y landing pages' },
]

export default function Credits() {
  const openUpdateModal = useUIStore((s) => s.openUpdateModal)

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <Link
        to="/"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Volver
      </Link>

      <div>
        <p className="eyebrow">Créditos</p>
        <h1 className="text-2xl font-bold tracking-tight">Hecho por Felipe Leon</h1>
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/15 to-transparent p-5">
          <div className="flex items-center gap-3">
            <Waves className="h-9 w-9 shrink-0 text-[var(--accent)]" />
            <div className="min-w-0">
              <p className="text-base font-bold leading-tight">
                {APP_NAME}
                <span className="ml-2 rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-xs text-[var(--accent)]">
                  v{APP_VERSION}
                </span>
              </p>
              <p className="text-xs text-[var(--text-muted)]">by ASCEND</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">
            {APP_NAME} es una app de productividad para poner orden en tu vida sin fricción. Nació de una idea
            simple: el trabajo, la universidad y lo personal no deberían vivir en apps distintas. En un solo lugar
            apartados temáticos con color e ícono, prioridades, subtareas, recordatorios y estadísticas que te
            muestran el ritmo real de tu semana.
          </p>
          <p className="mt-3 text-sm text-[var(--text-muted)]">
            Se llama {APP_NAME} porque tu día debería fluir: cada tarea pasa de pendiente a hecha como un hilo que
            se suelta, y la app te acompaña para que no se te escape nada.
          </p>
          <ul className="mt-5 space-y-2">
            {appFeatures.map(({ Icon, text }) => (
              <li key={text} className={bulletClass}>
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" /> {text}
              </li>
            ))}
          </ul>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-2">
            <Link to="/opiniones" className={outlineBtn}>
              <Star className="h-4 w-4" /> Reseñas
            </Link>
            <a href={IG} target="_blank" rel="noopener noreferrer" className={outlineBtn}>
              <AtSign className="h-4 w-4" /> Instagram
            </a>
            <button onClick={openUpdateModal} className={outlineBtn}>
              <Info className="h-4 w-4" /> Sobre la actualización
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <p className="eyebrow">Otros proyectos</p>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/15 to-transparent p-5">
          <p className="eyebrow">ASCEND</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight">¿Tu negocio todavía no tiene página web?</h2>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Creamos páginas web modernas, rápidas y con un diseño que refleja tu marca. De la idea al dominio: tu
            tienda, catálogo o portafolio listo para Google y para el celular.
          </p>
        </div>
        <div className="p-5">
          <ul className="space-y-2.5">
            {studioBullets.map(({ Icon, text }) => (
              <li key={text} className={bulletClass}>
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" /> {text}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--text-muted)]">
            ¿Te gustó cómo quedó esta app? Así se ve una web hecha con gusto.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={WA} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
            <a href={IG} target="_blank" rel="noopener noreferrer" className={outlineBtn}>
              <AtSign className="h-4 w-4" /> Instagram
            </a>
            <a href={WEB} target="_blank" rel="noopener noreferrer" className={outlineBtn}>
              <Globe className="h-4 w-4" /> Ver la web
            </a>
          </div>
        </div>
      </div>

      <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[var(--text-muted)]">
        <Target className="h-3 w-3" /> 310 488 5609 · © 2026 Felipe Matheus León
      </p>
    </div>
  )
}
