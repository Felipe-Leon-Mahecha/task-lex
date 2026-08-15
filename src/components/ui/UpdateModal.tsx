import { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'
import { APP_VERSION } from '../../lib/appInfo'

interface UpdateModalProps {
  onClose: () => void
  forceOpen?: boolean
}

const CHANGELOG: Record<string, string[]> = {
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

export default function UpdateModal({ onClose, forceOpen }: UpdateModalProps) {
  const [isVisible, setIsVisible] = useState(false)

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

  const changes = CHANGELOG[APP_VERSION] || ['Mejoras de rendimiento y corrección de errores']

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
              <p className="eyebrow">Novedades</p>
              <p className="text-lg font-bold">Versión {APP_VERSION}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-full p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]"
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
          ¡Genial!
        </button>
      </div>
    </div>
  )
}
