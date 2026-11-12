import { useEffect, useState } from 'react'
import { Download, ExternalLink, LoaderCircle, ShieldCheck, Sparkles, X } from 'lucide-react'
import { Capacitor } from '@capacitor/core'
import { Link } from 'react-router-dom'
import { ADMIN_EMAIL, APP_VERSION } from '../../lib/appInfo'
import { ApkInstaller } from '../../lib/nativeApkUpdater'
import { useAuthStore } from '../../store/auth'

const OWNER_ONLY_PREFIXES = ['🎭 Temporadas', '🔄 Hasta 2 re-sorteos', '🤖 Quiz con IA', '🎉 Al sortear', '🔒 Vista previa privada']

interface UpdateModalProps {
  onClose: () => void
  forceOpen?: boolean
}

const CHANGELOG: Record<string, string[]> = {
  '5.2.19': [
    '🧭 Tutorial ampliado para recorrer las secciones principales; el foco visual ahora solo señala controles concretos.',
    '📊 Actividad real de cuentas para el panel privado de administración y actualización de la política de privacidad.',
    '🔒 Vista previa privada de las decoraciones de diciembre y sus eventos del 24, 25 y 31.',
  ],
  '5.2.18': [
    '🦊🦆 19 skins nuevas incorporadas con sus rarezas y precios correctos.',
    '❄️ Pato de nieve aparece en la tienda durante diciembre; Navideño y Noel quedan como recompensas exclusivas de temporada.',
    '🪙 Se alinearon los precios de Fox entre la tienda y el servidor para evitar rechazos de compra.',
  ],
  '5.2.17': [
    '🗓️ Cambia la hora de una tarea directamente desde el calendario; arrastrarla a otro día sigue disponible.',
    '🪙 Compras más fiables: validación de sesión con Firebase Admin y mensajes que explican el rechazo.',
    '🏆 Los logros nuevos y reclamables aparecen al inicio; los logros de Halloween se ocultan fuera de octubre.',
    '🐾 Fija o suelta a Fox y Quackington para colocarlos donde prefieras; en Notas ya no tapan el botón de fondo.',
    '📝 Más visibilidad para las imágenes de fondo de Notas y nombre actualizado de Pato locutor.',
  ],
  '5.2.16': [
    '🖼️ El fondo de los apartados permanece quieto al expandir una tarea.',
    '🪟 Inicio de sesión en Windows usa el flujo de redirección de Google para volver de forma fiable a Quacker.',
    '🪙 Se renueva la sesión del propietario antes de comprar con monedas ilimitadas y se muestran errores de validación con claridad.',
    '❄️ Iconografía navideña simplificada; panel de Premium rediseñado para explicar mejor sus beneficios.',
  ],
  '5.2.0': [
    '🎭 Temporadas e insignias: vista propia y recuadro “Ver insignias del año”',
    '🔄 Hasta 2 re-sorteos de por vida; al agotarlos la temporada queda fija',
    '🤖 Quiz con IA (Mistral): si fallas, ves la respuesta correcta y otra pregunta',
    '🎉 Al sortear: confeti, scroll al recuadro y aviso “¡Tienes una nueva insignia!”',
    '📝 Notas ahora se sincronizan en la nube entre tus dispositivos',
    '🛡️ Borrado de notas seguro: no vuelven a aparecer tras la sincronización',
    '🐛 Correcciones de estabilidad y rendimiento',
  ],
  '5.2.11': [
    '⬇️ Actualizaciones desde Quacker: descarga integrada, progreso visible y verificación del APK antes de instalar.',
    '🗂️ Nuevo centro de actualizaciones con la descarga vigente y el historial de versiones.',
    '🤖 Fox IA amplía su ayuda a tareas, notas, semana, apartados y mascotas según tus funciones disponibles.',
    '✨ Mejoras de estabilidad, seguridad y presentación en varias pantallas.',
  ],
  '5.2.12': [
    '🏅 Insignias de temporada: el nivel ahora se muestra pequeño y deja visible el icono.',
    '🛍️ El diálogo de confirmación de compra aparece centrado en la pantalla.',
    '🪟 Quacker para Windows: primera versión como aplicación de escritorio independiente.',
    '⬆️ Mejoras y ajustes del actualizador integrado.',
  ],
  '5.2.13': [
    '🧭 Inicio de sesión renovado para explicar mejor cómo Quacker te ayuda a organizar tus días.',
    '🔊 Nuevos efectos descargados para tareas, avisos, compras, logros y recompensas.',
    '🎡 Ruleta de temporada con sonido acompasado a la animación.',
    '📱 Tono de notificación actualizado en Android.',
  ],
  '5.2.14': [
    '🔔 Los avisos diarios ahora se programan durante el día y respetan la fecha real de cada tarea.',
    '🌙 Abrir Quacker por la noche ya no dispara de inmediato el aviso de tareas del día siguiente.',
  ],
  '5.1.0': [
    '🦆 Sir Quackington: nueva mascota con vida propia, animaciones y frases',
    '👆 Agárralo, muévelo y lánzalo: vuela, rebota y aterriza donde lo dejes',
    '⏰ Avisos por tarea: notificación, alarma fuerte o ambas, a la hora exacta',
    '🎵 Sube tu canción como tono de alarma desde Ajustes',
    '🔐 Compras y recompensas más seguras y estables',
    '✨ Nuevo inicio de sesión con fondo animado de panes',
    '🦊 Botón del asistente ahora arriba a la derecha',
    '🐛 Correcciones de estabilidad y rendimiento',
  ],
  '5.0.0': [
    '🦊 Fox IA completa: Mi día (planificador), Desglosar, Energía, Coach y Chat',
    '🔄 Reagendamiento inteligente: Fox reorganiza tus tareas vencidas',
    '🌅 Briefing diario: Fox te saluda con el resumen de tu día',
    '🏆 13 logros con recompensas en monedas y popup de celebración',
    'Quacker Premium con suscripción mensual y anual',
    '🛍️ Tienda de skins con inventario, monedas y packs',
    '🐛 Compra de monedas arreglada en la app Android',
  ],
  '4.0.0': [
    '🦊 Fox: asistente de IA para crear tareas con lenguaje natural',
    '🎤 Dictado por voz con reconocimiento nativo de Android',
    '🎨 Icono de zorro como botón flotante de Fox',
  ],
  '3.2.0': [
    '🎨 Sistema de temas mejorado: colores ahora responden a variables CSS',
    '✨ Animaciones premium en botones de acento para temas Oro, Plata, Diamante',
    '🐛 Corrección de colores fijos que no cambiaban con el tema',
  ],
  '3.0.0': [
    '🎨 Splash Screen animada con logo y branding profesional',
    '📳 Haptic Feedback: vibración al completar tareas (diferente por prioridad)',
    '👆 Gestos de Swipe: derecha para completar, izquierda para archivar',
    '↩️ Sistema Undo/Redo con botón deshacer en toast',
    '⚡ Quick Actions Menu (long press) con acciones rápidas',
    '🔄 Drag & Drop para reordenar tareas',
    '🔔 Notificaciones enriquecidas con acciones directas (Completar, Posponer)',
    '🎤 Voice Input para dictar tareas con reconocimiento nativo',
    '🏆 Streaks gamificados con badges y logros visuales',
    '📊 Estadísticas detalladas con gráficos de productividad',
    '⌨️ Atajos de teclado (Ctrl+N, Ctrl+F, Ctrl+/, Esc)',
    '🔊 Sonidos personalizados al crear/completar/eliminar tareas',
    '💾 Backup automático con frecuencia configurable',
    '📤 Compartir tareas con otras apps',
    '🔍 Búsqueda avanzada con filtros de prioridad, tags y fecha',
    '📅 Integración con Google Calendar nativo',
    '🌐 Modo offline robusto con sincronización automática',
    '📦 Exportar/importar datos completos',
    '🎨 Temas desbloqueables y dark mode automático',
  ],
  '2.5.0': [
    '🎨 Splash Screen animada con logo y branding profesional',
    '📳 Haptic Feedback: vibración al completar tareas (diferente por prioridad)',
    '👆 Gestos de Swipe: derecha para completar, izquierda para archivar',
    '↩️ Sistema Undo/Redo con botón deshacer en toast',
    '⚡ Quick Actions Menu (long press) con acciones rápidas',
    '🔄 Drag & Drop para reordenar tareas y entre secciones',
    '🔔 Notificaciones enriquecidas con acciones directas',
    '🎤 Voice Input para dictar tareas con reconocimiento nativo',
    '🏆 Streaks gamificados con badges y logros visuales',
    '📊 Estadísticas detalladas con gráficos de productividad',
    '⌨️ Atajos de teclado (Ctrl+N, Ctrl+F, Ctrl+/, Esc)',
    '🔊 Sonidos personalizados al crear/completar/eliminar tareas',
    '💾 Backup automático con frecuencia configurable',
    '📤 Compartir tareas con otras apps',
    '🔍 Búsqueda avanzada con filtros de prioridad, tags y fecha',
    '📅 Integración con Google Calendar nativo',
    '🌐 Modo offline robusto con sincronización automática',
    '📦 Exportar/importar datos completos',
    '🎨 Temas desbloqueables y dark mode automático',
  ],
  '2.0.0': [
    '🎨 Rebranding: Felipe León Web Studio → ASCEND',
    '✨ Animaciones suaves en toda la app',
    '📋 Panel semitransparente en vista Gantt',
    '🎯 Mejoras en transiciones de vistas',
  ],
}

export interface UpdateInfo {
  version: string
  url: string | null
  notes: string
  sha256?: string
  sizeBytes?: number
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d !== 0) return d
  }
  return 0
}

export async function checkForUpdate(current: string): Promise<UpdateInfo | null> {
  try {
    const r = await fetch('https://task-lex.vercel.app/update.json', { cache: 'no-store' })
    if (!r.ok) return null
    const d = (await r.json()) as Partial<UpdateInfo>
    if (typeof d.version !== 'string' || compareVersions(d.version, current) <= 0) return null
    try {
      if (localStorage.getItem('quacker-skip-update') === d.version) return null
    } catch {}
    return {
      version: d.version,
      url: typeof d.url === 'string' ? d.url : null,
      notes: typeof d.notes === 'string' ? d.notes : '',
      sha256: typeof d.sha256 === 'string' ? d.sha256 : undefined,
      sizeBytes: typeof d.sizeBytes === 'number' ? d.sizeBytes : undefined,
    }
  } catch {
    return null
  }
}

export function UpdateAvailableModal({ info, onClose }: { info: UpdateInfo; onClose: () => void }) {
  const [permissionNeeded, setPermissionNeeded] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [downloadedPath, setDownloadedPath] = useState('')
  const nativeAndroid = Capacitor.getPlatform() === 'android'
  const skip = () => {
    try {
      localStorage.setItem('quacker-skip-update', info.version)
    } catch {}
    onClose()
  }
  const download = async () => {
    setError('')
    if (!info.url) {
      setError('La descarga directa todavía no está configurada. Abre el centro de actualizaciones para ver las opciones.')
      return
    }
    try {
      if (!nativeAndroid || !info.sha256) {
        window.location.assign('/#/actualizaciones')
        return
      }
      if (downloadedPath) {
        await ApkInstaller.installApk({ path: downloadedPath })
        return
      }
      const permission = await ApkInstaller.canInstallUnknownApps()
      if (!permission.allowed) {
        await ApkInstaller.openInstallPermissionSettings()
        setPermissionNeeded(true)
        return
      }
      setPermissionNeeded(false)
      setDownloading(true)
      const progressHandle = await ApkInstaller.addListener('downloadProgress', (event) => {
        if (event.total > 0) setProgress(Math.min(100, Math.round((event.downloaded / event.total) * 100)))
      })
      try {
        const result = await ApkInstaller.downloadApk({ url: info.url, sha256: info.sha256, version: info.version })
        setDownloadedPath(result.path)
        setProgress(100)
        await ApkInstaller.installApk({ path: result.path })
      } finally {
        await progressHandle.remove()
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      if (message.toLowerCase().includes('permiso')) setPermissionNeeded(true)
      setError(message || 'No se pudo iniciar la actualización. Puedes descargarla desde la web.')
    } finally {
      setDownloading(false)
    }
  }
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
      <div className="card w-full max-w-md overflow-hidden p-0 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        <div className="relative overflow-hidden border-b border-[var(--border)] bg-gradient-to-br from-[var(--accent)]/20 via-[var(--accent)]/5 to-transparent p-6">
          <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full border border-[var(--accent)]/15" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-2 -top-6 h-28 w-28 rounded-full border border-[var(--accent)]/15" />
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5">
            <Sparkles className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <div>
            <p className="eyebrow">Quacker se renueva</p>
            <p className="text-lg font-bold">Versión {info.version}</p>
          </div>
        </div>
          <p className="mt-4 text-sm text-[var(--text-muted)]">Hay una nueva versión disponible. Descárgala para disfrutar de las mejoras.</p>
        </div>
        <div className="p-6">
        {info.notes && <p className="mt-4 text-sm text-[var(--text-muted)]">{info.notes}</p>}
        {info.url ? (
          <button onClick={() => void download()} disabled={downloading} className="btn-primary mt-5 flex w-full items-center justify-center gap-2 disabled:opacity-70">
            {downloading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : downloadedPath ? <ShieldCheck className="h-4 w-4" /> : <Download className="h-4 w-4" />}
            {downloading ? `Descargando ${progress}%` : permissionNeeded ? 'Ya concedí el permiso · Continuar' : downloadedPath ? 'Instalar actualización' : 'Descargar e instalar'}
          </button>
        ) : (
          <p className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]">
            Descárgala desde donde instalaste la app.
          </p>
        )}
        {downloading && <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--surface-2)]"><div className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-200" style={{ width: `${progress}%` }} /></div>}
        {permissionNeeded && <p className="mt-3 rounded-xl border border-[var(--accent)]/25 bg-[var(--accent)]/5 p-3 text-xs leading-relaxed text-[var(--text-muted)]">Android te pidió autorizar instalaciones de Quacker. Activa “Permitir desde esta fuente”, vuelve a la app y toca continuar.</p>}
        {error && <p role="alert" className="mt-3 rounded-xl border border-red-500/25 bg-red-500/5 p-3 text-xs leading-relaxed text-red-300">{error} <a className="underline" href="/#/actualizaciones">Abrir centro web</a></p>}
        <Link to="/actualizaciones" onClick={onClose} className="mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)]">
          Ver novedades y otras opciones <ExternalLink className="h-3.5 w-3.5" />
        </Link>
        <button
          onClick={skip}
          className="mt-2 w-full py-2 text-center text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text)]"
        >
          Ahora no
        </button>
        </div>
      </div>
    </div>
  )
}

export default function UpdateModal({ onClose, forceOpen }: UpdateModalProps) {
  const [isVisible, setIsVisible] = useState(false)
  const isOwner = useAuthStore((s) => s.user)?.email === ADMIN_EMAIL

  useEffect(() => {
    if (forceOpen) {
      setIsVisible(true)
      return
    }
    const lastSeenVersion = localStorage.getItem('flux-last-version')
    if (lastSeenVersion !== APP_VERSION) {
      setIsVisible(true)
    }
  }, [forceOpen])

  const handleClose = () => {
    localStorage.setItem('flux-last-version', APP_VERSION)
    setIsVisible(false)
    onClose()
  }

  if (!isVisible) return null

  const allChanges = CHANGELOG[APP_VERSION] || ['Mejoras de rendimiento y corrección de errores']
  const changes = isOwner
    ? allChanges
    : allChanges.filter((c) => !OWNER_ONLY_PREFIXES.some((p) => c.startsWith(p)))

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300" onClick={handleClose}>
      <div
        className="card max-h-[90vh] w-full max-w-md overflow-y-auto p-6 animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5">
              <Sparkles className="h-6 w-6 text-[var(--accent)]" />
            </div>
            <div>
              <p className="eyebrow">Novedades de Quacker</p>
              <p className="text-lg font-bold">Actualización {APP_VERSION}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium text-[var(--text)]">Cambios en esta versión:</p>
          <ul className="space-y-2">
            {changes.map((change, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
                {change}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleClose}
          className="btn-primary mt-6 w-full"
        >
          ¡Listo!
        </button>
      </div>
    </div>
  )
}
