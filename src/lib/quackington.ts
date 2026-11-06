export type QuackingtonAnimId =
  | 'default'
  | 'caida'
  | 'cuack'
  | 'vueltas'
  | 'dormir'
  | 'fiesta'
  | 'pan'
  | 'pensativo'
  | 'sacudirce'
  | 'saludo'
  | 'sostener'
  | 'rasca'
  | 'frio'

export interface QuackingtonAnim {
  id: QuackingtonAnimId
  name: string
  kind: 'static' | 'frames' | 'sheet'
  src?: string
  dir?: string
  count?: number
  fps?: number
  sheetUrl?: string
  cols?: number
  rows?: number
  frameW?: number
  frameH?: number
  zoom?: number
}

export const QUACKINGTON_IMAGE = '/quarkington/Skins/sir-quackington.webp'

const S = (dir: string, count: number, fps = 24, cols = 60, zoom = 1.15): QuackingtonAnim => ({
  id: dir as QuackingtonAnimId,
  name: dir,
  kind: 'sheet',
  sheetUrl: `/quarkington/Animacion ${dir}/web/mascot_sheet.png`,
  cols,
  rows: Math.ceil(count / cols),
  frameW: 120,
  frameH: 120,
  count,
  fps,
  zoom,
})

export const QUACKINGTON_ANIMS: Record<QuackingtonAnimId, QuackingtonAnim> = {
  default: { id: 'default', name: 'Sir Quackington', kind: 'static', src: QUACKINGTON_IMAGE },
  caida: { ...S('caida lenta', 240, 24, 60, 1.1), id: 'caida', name: 'Caída lenta' },
  cuack: { ...S('Cuack!', 96, 30, 60, 1.17), id: 'cuack', name: '¡Cuack!' },
  vueltas: { ...S('Dando vueltas', 240, 30, 60, 1.13), id: 'vueltas', name: 'Dando vueltas' },
  dormir: { ...S('dormir', 240, 28, 60, 1.09), id: 'dormir', name: 'Dormir' },
  fiesta: { ...S('marcha fiesta', 240, 30, 60, 1.12), id: 'fiesta', name: 'Marcha fiesta' },
  pan: { ...S('pan', 120, 30, 60, 1.23), id: 'pan', name: 'Pan' },
  pensativo: { id: 'pensativo', name: 'Pensativo', kind: 'sheet', sheetUrl: '/quarkington/Animacion pensativo/web/sirquackingtonnns_sheet.png', cols: 16, rows: 1, count: 16, frameW: 120, frameH: 120, fps: 28 },
  sacudirce: { ...S('sacudirce', 240, 30, 60, 1.16), id: 'sacudirce', name: 'Sacudirse' },
  saludo: { id: 'saludo', name: 'Saludo', kind: 'sheet', sheetUrl: '/quarkington/Animacion saludo/web/sirquackingtons_sheet.png', cols: 14, rows: 1, count: 14, frameW: 120, frameH: 120, fps: 15 },
  sostener: { ...S('sugetarlo', 240, 24, 60, 1.06), id: 'sostener', name: 'Sostener' },
  rasca: { ...S('se rasca el ala', 240, 33, 60, 1.25), id: 'rasca', name: 'Se rasca el ala' },
  frio: { id: 'frio', name: 'Frío', kind: 'sheet', sheetUrl: '/quarkington/Animacion frio/web/sirquackington_sheet.png', cols: 22, rows: 1, count: 22, frameW: 120, frameH: 120, fps: 1 },
}

export const QUACKINGTON_AMBIENT: QuackingtonAnimId[] = ['pan', 'cuack', 'vueltas', 'dormir', 'fiesta', 'rasca']

export function quackingtonFrameUrl(anim: QuackingtonAnim, index: number): string {
  return `${anim.dir}/frame_${String(index).padStart(4, '0')}.png`
}

export type QuackingtonLine = {
  trigger: string
  lines: string[]
}

export const QUACKINGTON_LINES: QuackingtonLine[] = [
  {
    trigger: 'idle',
    lines: [
      '¡Salud! Soy Sir Quackington, caballero del pan 🥖',
      'Un buen pan, una buena tarea: la receta del día.',
      '¿Tareas? Yo solo doy quacks, pero te apoyo con el pico.',
      'Recuerda: una baguette al día mantiene al quack alejado.',
      'Soy noble, elegante y... algo hambriento.',
      '¿Ya comiste pan hoy? Yo ya pensé en comer pan 12 veces.',
      'El pan se cuida, las tareas se cumplen. Ley del reino.',
      '¿Qué prefieres, descanso o pan? Yo también.',
      'Hoy yo no aplazo pan... ni tú tareas, ¿ok?',
      'Pluma al clima, quack al coleto, y a cumplir.',
      'Aveces las mejores ideas aparecen comiendo pan. Así lo confirmo.',
      'Un quack suave y un pan crujiente: felicidad.',
      'Mi coronel dice: el pan se comparte, las metas se disfrutan.',
      'Tírame pan y te doy un quack de aprobación.',
    ],
  },
  {
    trigger: 'saludo',
    lines: [
      '¡Buenos días! El pan espera, pero primero las tareas.',
      '¡Al fin llegaste! Tenía el ala tiesa de aburrimiento.',
      'Hoy vamos a ser productivos: yo con pan, tú con todo.',
      '¡Quack bienvenida! ¿Con qué pan celebramos la entrada?',
      '¡Qué bueno verte! Que hoy las tareas se rindan solas.',
      'Buen día, socio. El moño en alto y el ángel arreglado.',
    ],
  },
  {
    trigger: 'tap',
    lines: [
      '¡Ey! ¿Qué toque fue ese? ¿Así se saluda a un Sir? 🍞',
      'Con ese toque, ¿me invitas a un pan o qué?',
      'Toca con más nobleza, soy un caballero.',
      '¡Quack! Me hiciste cosquillas en el ala.',
      'Otro toque más y saco la espada... de pan.',
      'Acepto caricias, pero el pago es en croissant.',
    ],
  },
  {
    trigger: 'sacudirce',
    lines: [
      '¡¿Un terremoto?! No, fuiste tú... con pan todo se arregla.',
      '¡Cálmate! Soy noble, no un tambor.',
      '¡Woo! Me dejaste mareado. Quack...',
      'A este paso me sacudes hasta el alma (y el pan).',
      '¡Aguanta! Acabo de almorzar y voy a volar pan por el pico.',
    ],
  },
  {
    trigger: 'sostener',
    lines: [
      '¡¡Me tienes en el aire!! Soy un noble, no un dron.',
      '¡Qué altura! A este paso pido pan a domicilio.',
      'Sostener a un Sir tiene su precio: pan.',
      '¡Quack! Se me mueve el moño y no me gusta.',
      '¿Taxi? No, yo soy el pato volador. ¡Cuac!',
    ],
  },
  {
    trigger: 'caida',
    lines: [
      '¡Aterrizaje de caballero! Estilo... pan blando.',
      '¡Uff! ¡Menudo viaje! Que conste que sobrevivo hasta el pan.',
      'Aterricé con la dignidad intacta... casi.',
      '¡Quack! El vuelo terminó. ¿Habrá recompensa de pan?',
      'Eso se llama "aterrizaje con pan". Reconocido por el reino.',
    ],
  },
  {
    trigger: 'frio',
    lines: [
      '¡Brrr! Esto no es clima para un caballero del pan.',
      'Me congelo hasta las plumas... y el pan se endurece.',
      '¿Dónde quedó mi bufanda de migas?',
      '¡Quack congelado! Necesito sopa y un horno.',
      'Si veo nieve, pido pan caliente de emergencia.',
    ],
  },
  {
    trigger: 'pensativo',
    lines: [
      'Hmm... pensando en pan. Digo: en tus tareas.',
      'Analizando... ¿es posible comer pan y trabajar a la vez?',
      'Una mente noble analiza dos cosas: tareas y pan.',
      'Estoy meditando... si me traen un pan, ilumino.',
    ],
  },
  {
    trigger: 'cuack',
    lines: [
      '¡CUACK! Perdón, se me escapó.',
      'Quack quack... ups, me escucharon.',
      'Eso fue un quack de emoción. No me culpes.',
      '¡Cuac! Se me salió la sorpresa. Bueno, la alegría.',
    ],
  },
  {
    trigger: 'pan',
    lines: [
      '¡PAN! ¿Lo ves? ¡PAN! 🥖',
      'Mi sueño... una hogaza recién horneada.',
      '¡Quack pan! El instinto más fuerte que tengo.',
      'Un noble merece su pan diario.',
      '¡Huele a pan tostado! ¡Yo quiero ser feliz!',
    ],
  },
  {
    trigger: 'dormir',
    lines: [
      'Zzz... soñando con un pan gigante...',
      'Zzz... que cuando despierte haya croissants...',
      'Zzz... el pan más grande del reino...',
      'Zzz... quack... pan... quack...',
    ],
  },
  {
    trigger: 'fiesta',
    lines: [
      '¡Marcha fiesta! El pan baila conmigo.',
      '¡Al son del quack! El pan espera el bis.',
      '¡Esto es lo más cerca que estoy de una discoteca de pan!',
      '¡A bailar! Que el pan también merece gozadera.',
    ],
  },
  {
    trigger: 'rasca',
    lines: [
      'Perdón... el ala me picaba como pan tostado.',
      'Momento de higiene noble. Quack.',
      'Una plumita en su lugar, y un pan en el plato.',
      'Diez puntos para el que me alcance un pan tras esto.',
    ],
  },
  {
    trigger: 'vueltas',
    lines: [
      '¡Wiii! Dando vueltas como un pan en el horno.',
      '¿Viste eso? Ni los trompos giran tan elegante.',
      'Una vueltecita para celebrar... ¿hay pan?',
      '¡Más vueltas que un croissant en la vitrina!',
    ],
  },
  {
    trigger: 'oscuridad',
    lines: [
      'No puedo ver nada... ¿me tapaste la cara?',
      '¿Quién apagó la luz?... ¿Me cubriste con pan?',
      'A oscuras no distingo el pan del oro.',
      'Iluminen, que soy un Sir, no un murciélago.',
    ],
  },
  {
    trigger: 'recuperado',
    lines: [
      '¡Ya veo! El pan brillaba aquí... digo, la cara.',
      '¡Quack! Me asustaste, caballero del sigilo.',
      'Buen chiste. Puntaje: 5/10, pierde puntos por no traer pan.',
    ],
  },
  {
    trigger: 'tarea',
    lines: [
      '¡Tarea lista! ¿Ves? Noble y productivo a la vez.',
      '¡Quack! Una más al saco. Dejando espacio para el pan.',
      '¡Perfecto! Te aplaudo con las plumas.',
      '¡Y dale! Así se avanza. Yo aplaudo con alas.',
    ],
  },
]

export function quackingtonLines(trigger: string): string[] {
  return QUACKINGTON_LINES.find((q) => q.trigger === trigger)?.lines ?? QUACKINGTON_LINES[0].lines
}

export function pickQuackingtonLine(trigger: string): string {
  const lines = quackingtonLines(trigger)
  return lines[Math.floor(Math.random() * lines.length)]
}
