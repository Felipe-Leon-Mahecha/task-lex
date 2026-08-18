export type FoxState =
  | 'idle'
  | 'alerta'
  | 'cargando'
  | 'pensando'
  | 'celebracion'
  | 'error'
  | 'saludo'
  | 'programando'
  | 'tarea_completada'
  | 'cafe'
  | 'estirandose'
  | 'reloj'
  | 'traje'
  | 'enojado'
  | 'llorando'

export interface FoxStateConfig {
  id: FoxState
  image: string
  label: string
  widgetOnly: boolean
  timeRange?: { start: number; end: number }
  dialogues: string[]
}

const FOX_STATES: FoxStateConfig[] = [
  {
    id: 'idle',
    image: '/fox (IdleDefault).png',
    label: 'Fox',
    widgetOnly: false,
    dialogues: [
      '¡Hola! Soy Fox, tu asistente 🦊',
      '¿Qué vamos a hacer hoy?',
      'Estoy aquí si me necesitas',
      '¡Hora de ser productivo!',
      'Dato curioso: los zorros pueden correr a 50 km/h',
      'Los zorros duermen con la cola sobre la nariz para mantenerla caliente',
      '¿Ya viste tus tareas pendientes?',
      'Un zorro puede oír un ratón desde 100 metros de distancia',
      '¿Necesitas ayuda con algo?',
      'Los zorros son_animales muy inteligentes y juguetones',
    ],
  },
  {
    id: 'alerta',
    image: '/fox (AlertaNotificación).png',
    label: 'Fox Alerta',
    widgetOnly: false,
    dialogues: [
      '¡Ey! Tienes una tarea que vence hoy 👀',
      'No se te olvide, esto vence hoy',
      'Atención: fecha límite hoy',
      '¡Urgente! Revisa esta tarea',
      'Tu tarea está esperando...',
    ],
  },
  {
    id: 'cargando',
    image: '/fox (CargandoTrabajando).png',
    label: 'Fox Trabajando',
    widgetOnly: false,
    dialogues: [
      'Estoy procesando, dame un momento...',
      'Trabajando en ello...',
      'Casi listo...',
      'Procesando tu solicitud...',
      'Un segundito...',
    ],
  },
  {
    id: 'pensando',
    image: '/fox (PensandoProcesando).png',
    label: 'Fox Pensando',
    widgetOnly: false,
    dialogues: [
      'Déjame pensar...',
      'Hmm, analizando...',
      'Procesando...',
      'Un momento...',
      'Estoy en ello...',
    ],
  },
  {
    id: 'celebracion',
    image: '/fox (CelebraciónLogro grande).png',
    label: 'Fox Celebrando',
    widgetOnly: false,
    dialogues: [
      '¡Increíble! ¡Lo lograste! 🎉',
      '¡Bravo! Eres genial',
      '¡Sigue así!',
      '¡Woo! ¡Otro logro más!',
      '¡Eso! ¡No paras de crecer!',
      '¡Campeón! ¿Cómo te sientes?',
      '¡Excelente trabajo!',
    ],
  },
  {
    id: 'error',
    image: '/fox (ErrorFalló algo).png',
    label: 'Fox Error',
    widgetOnly: false,
    dialogues: [
      'Algo salió mal 😅',
      'Ups, hubo un error',
      'Intenté pero fallé...',
      'Error detectado, pero no te preocupes',
      'Vamos a intentarlo de nuevo',
    ],
  },
  {
    id: 'saludo',
    image: '/fox (SaludoBienvenida).png',
    label: 'Fox Saludando',
    widgetOnly: false,
    timeRange: { start: 4, end: 10 },
    dialogues: [
      '¡Buenos días! ☀️ ¿Lista para el día?',
      '¡Hola! Buenos días, ¿dormiste bien?',
      '¡Arriba! Un nuevo día comienza',
      '¡Buenos días! Hoy puede ser un gran día',
      '¡Hola! Ya es un nuevo día para lograr cosas',
    ],
  },
  {
    id: 'programando',
    image: '/fox (Programandocon laptop).png',
    label: 'Fox Programando',
    widgetOnly: true,
    dialogues: ['Programando...', 'Trabajando en código...', 'Escribiendo...'],
  },
  {
    id: 'tarea_completada',
    image: '/fox (Tarea completada).png',
    label: 'Fox Completado',
    widgetOnly: false,
    dialogues: [
      '¡Tarea completada! Siguiente 🚀',
      '¡Listo! ¿Qué sigue?',
      '¡Boom! Una menos',
      '¡Genial! ¿Qué más?',
      'Eso fue rápido',
    ],
  },
  {
    id: 'cafe',
    image: '/fox (Tomando_cafe).png',
    label: 'Fox Café',
    widgetOnly: true,
    timeRange: { start: 3, end: 7 },
    dialogues: [
      'Tomando un cafecito...',
      'Café primero, tareas después ☕',
      'Energía renovada',
    ],
  },
  {
    id: 'estirandose',
    image: '/fox (EstirándoseDespertando).png',
    label: 'Fox Despertando',
    widgetOnly: false,
    timeRange: { start: 6, end: 11 },
    dialogues: [
      'Buenos días... estirándose...',
      'Despertando...',
      'Ahhh... buen día',
      'Hora de empezar',
    ],
  },
  {
    id: 'reloj',
    image: '/fox (Revisando relojAgenda).png',
    label: 'Fox Reloj',
    widgetOnly: true,
    dialogues: [
      '¿Qué hora es?',
      'Revisando la agenda...',
      'Hora de revisar el horario',
    ],
  },
  {
    id: 'traje',
    image: '/fox (Traje elegante).png',
    label: 'Fox Elegante',
    widgetOnly: true,
    dialogues: [
      '¿Cómo se ve?',
      'Elegante y profesional',
      'Listo para la reunión',
    ],
  },
  {
    id: 'enojado',
    image: '/fox (enojado).png',
    label: 'Fox Enojado',
    widgetOnly: true,
    dialogues: [
      '¡¿Dónde estás?! Llevo días esperándote',
      '¡Vuelve! Me extrañabas, ¿no?',
      '¡Hey! ¿Me olvidaste?',
      'Llevas tiempo sin abrir la app...',
    ],
  },
  {
    id: 'llorando',
    image: '/fox (llorando).png',
    label: 'Fox Triste',
    widgetOnly: true,
    dialogues: [
      '¿Me dejaste aquí solito? 😢',
      'Vuelve por favor...',
      'Te extrañé mucho...',
      '¿Ya no me quieres?',
    ],
  },
]

export function getFoxState(): { state: FoxStateConfig; dialogue: string } {
  const now = new Date()
  const hour = now.getHours()

  const lastOpen = localStorage.getItem('flux-last-open')
  const daysSinceOpen = lastOpen
    ? Math.floor((now.getTime() - new Date(lastOpen).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  if (daysSinceOpen >= 3) {
    const states = [FOX_STATES.find((s) => s.id === 'enojado')!, FOX_STATES.find((s) => s.id === 'llorando')!]
    const state = states[Math.floor(Math.random() * states.length)]
    return { state, dialogue: state.dialogues[Math.floor(Math.random() * state.dialogues.length)] }
  }

  const saludo = FOX_STATES.find((s) => s.id === 'saludo')!
  if (hour >= 4 && hour < 10) {
    const today = now.toDateString()
    const lastSaludo = localStorage.getItem('fox-last-saludo')
    if (lastSaludo !== today) {
      localStorage.setItem('fox-last-saludo', today)
      return { state: saludo, dialogue: saludo.dialogues[Math.floor(Math.random() * saludo.dialogues.length)] }
    }
  }

  if (hour >= 6 && hour < 11) {
    const today = now.toDateString()
    const lastEstirandose = localStorage.getItem('fox-last-estirandose')
    if (lastEstirandose !== today && Math.random() > 0.5) {
      localStorage.setItem('fox-last-estirandose', today)
      const state = FOX_STATES.find((s) => s.id === 'estirandose')!
      return { state, dialogue: state.dialogues[Math.floor(Math.random() * state.dialogues.length)] }
    }
  }

  const idle = FOX_STATES.find((s) => s.id === 'idle')!
  return { state: idle, dialogue: idle.dialogues[Math.floor(Math.random() * idle.dialogues.length)] }
}

export function getFoxStateForContext(
  context: 'parsing' | 'processing' | 'done' | 'error' | 'notification' | 'completed' | 'widget'
): { state: FoxStateConfig; dialogue: string } {
  const pick = (id: FoxState) => {
    const state = FOX_STATES.find((s) => s.id === id)!
    return { state, dialogue: state.dialogues[Math.floor(Math.random() * state.dialogues.length)] }
  }

  switch (context) {
    case 'parsing':
      return pick('pensando')
    case 'processing': {
      const now = Date.now()
      const start = (window as any).__foxProcessingStart as number | undefined
      if (start && now - start > 5000) return pick('cargando')
      return pick('pensando')
    }
    case 'done':
      return pick('celebracion')
    case 'error':
      return pick('error')
    case 'notification':
      return pick('alerta')
    case 'completed':
      return pick('tarea_completada')
    case 'widget':
      return getWidgetFox()
  }
}

function getWidgetFox(): { state: FoxStateConfig; dialogue: string } {
  const now = new Date()
  const hour = now.getHours()

  const lastOpen = localStorage.getItem('flux-last-open')
  const daysSinceOpen = lastOpen
    ? Math.floor((now.getTime() - new Date(lastOpen).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  if (daysSinceOpen >= 3) {
    const states = [FOX_STATES.find((s) => s.id === 'enojado')!, FOX_STATES.find((s) => s.id === 'llorando')!]
    const state = states[Math.floor(Math.random() * states.length)]
    return { state, dialogue: state.dialogues[Math.floor(Math.random() * state.dialogues.length)] }
  }

  if (hour >= 3 && hour < 7) {
    const cafe = FOX_STATES.find((s) => s.id === 'cafe')!
    return { state: cafe, dialogue: cafe.dialogues[Math.floor(Math.random() * cafe.dialogues.length)] }
  }

  const widgetStates = FOX_STATES.filter((s) => s.widgetOnly && s.id !== 'enojado' && s.id !== 'llorando' && s.id !== 'cafe')
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
  const state = widgetStates[dayOfYear % widgetStates.length]
  return { state, dialogue: state.dialogues[Math.floor(Math.random() * state.dialogues.length)] }
}

export function setFoxProcessingStart() {
  ;(window as any).__foxProcessingStart = Date.now()
}

export function clearFoxProcessingStart() {
  delete (window as any).__foxProcessingStart
}

export function recordAppOpen() {
  localStorage.setItem('flux-last-open', new Date().toISOString())
}

export function getAllFoxStates() {
  return FOX_STATES
}
