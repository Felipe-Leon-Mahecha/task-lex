import { useSettingsStore } from '../../store/settings'

const LINES = {
  fox: [
    'Las tareas pendientes dan más miedo que una casa embrujada… ¡vamos con una!',
    'Vi una sombra en el calendario. Era solo esa tarea que lleva días esperándote.',
    'Patrulla de Halloween activa: yo vigilo los sustos y tú avanzas con tus pendientes.',
    'No temas a los monstruos; teme dejar todo para mañana. 🦊',
  ],
  duck: [
    '¡Quack! Escuché un ruido… era una tarea pidiendo que la completes.',
    'Este caballero no le teme a los fantasmas. Bueno… un poquito sí.',
    '¡A las mazmorras! Pero primero acabemos esa tarea pendiente.',
    'Si aparece un fantasma, le lanzo una baguette. ¡Feliz Halloween!',
  ],
} as const

export function pickHalloweenDialogue(pet: keyof typeof LINES): string | null {
  if (new Date().getMonth() !== 9 || !useSettingsStore.getState().seasonalEffects || Math.random() > 0.38) return null
  const choices = LINES[pet]
  return choices[Math.floor(Math.random() * choices.length)]
}
