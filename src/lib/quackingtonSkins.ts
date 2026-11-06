import { QUACKINGTON_IMAGE } from './quackington'

export type QuackingtonSkinCategory = 'Todos' | 'Clásicos' | 'Aventura' | 'Fantasía' | 'Profesiones' | 'Música' | 'Estilo' | 'Especial' | 'Navidad'

export interface QuackingtonSkin {
  id: string
  name: string
  image: string
  category: Exclude<QuackingtonSkinCategory, 'Todos'>
  cost: number
  rarity?: 'Básico' | 'Especial' | 'Raro' | 'Épico' | 'Demon' | 'Legendario' | 'Exclusivo'
  voiceLines: string[]
  animated?: boolean
  glitchImages?: string[]
  rewardOnly?: boolean
  unlockHint?: string
}

const image = (name: string) => `/quarkington/Skins/${name}.webp`

export const QUACKINGTON_SKINS: QuackingtonSkin[] = [
  { id: 'animado', name: 'Sir Quackington', image: QUACKINGTON_IMAGE, category: 'Clásicos', cost: 0, animated: true, voiceLines: ['¡A sus órdenes! Bueno, cuando termine mi pan.', 'Un paso a la vez, y con dignidad de caballero.', '¿Listos para cumplir metas? Yo traje el pico.'] },
  { id: 'angry-duck', name: 'Pato enojado', image: image('angry-duck'), category: 'Estilo', cost: 100, voiceLines: ['No estoy bravo. Estoy concentrado con cara de bravo.', '¿Otra tarea pendiente? Ya mismo la espanto.', 'Respira. Yo pongo la cara seria por los dos.'] },
  { id: 'dinosaurio-pato', name: 'Pato dinosaurio', image: image('dinosaurio-pato'), category: 'Aventura', cost: 150, voiceLines: ['¡Raaawr! Eso significa que ya casi terminamos.', 'Esta tarea no se va a escapar de mis garras.', 'Soy pequeño, pero mi rugido tiene calendario.'] },
  { id: 'multipato', name: 'Multipato', image: image('multipato'), category: 'Fantasía', cost: 150, voiceLines: ['Somos varios patos y todos votamos por empezar.', 'Yo hago una tarea y mis clones supervisan.', 'Reunión de patos: queda aprobado avanzar.'] },
  { id: 'patito-cool', name: 'Patito cool', image: image('patito-cool'), category: 'Estilo', cost: 100, voiceLines: ['Todo tranqui. Una cosa a la vez y sale.', 'Cero estrés, mucho estilo y una tarea menos.', 'Yo pongo la actitud; tú pones el primer paso.'] },
  { id: 'patito-dragon', name: 'Patito dragón', image: image('patito-dragon'), category: 'Fantasía', cost: 150, voiceLines: ['¡Fuego! Pero solo para encender la motivación.', 'Protejo tus planes con escamas y pico.', 'Una meta completada merece un rugido legendario.'] },
  { id: 'patito-esponjoso', name: 'Patito esponjoso', image: image('patito-esponjoso'), category: 'Estilo', cost: 100, voiceLines: ['Sin afán, suavecito también se llega.', 'Te mando un abrazo de plumas antes de empezar.', 'Una pausa cómoda y luego seguimos.'] },
  { id: 'patito-kawaii', name: 'Patito kawaii', image: image('patito-kawaii'), category: 'Estilo', cost: 100, voiceLines: ['¡Tú puedes! Cada pasito cuenta un montón.', 'Pongámosle una estrellita a esa tarea cuando acabes.', 'Hoy vamos a hacer algo bonito por tu yo del futuro.'] },
  { id: 'patito-playero', name: 'Patito playero', image: image('patito-playero'), category: 'Estilo', cost: 100, voiceLines: ['Olas tranquilas, mente tranquila. ¿Qué hacemos primero?', 'La brisa está buena para tachar pendientes.', 'Después de esta tarea, descanso con sombrilla.'] },
  { id: 'patito-rey', name: 'Patito rey', image: image('patito-rey'), category: 'Fantasía', cost: 150, voiceLines: ['Por decreto real, hoy se avanza sin agobiarse.', 'El reino celebra cada pequeño logro.', 'Majestad, su próxima tarea está lista para conquistar.'] },
  { id: 'pato-animatronico', name: 'Pato animatrónico', image: image('pato-animatronico'), category: 'Especial', cost: 150, voiceLines: ['Sistema activo. Rutina de productividad iniciada.', 'Te estoy vigilando… la lista de tareas, digo.', 'Quedan pendientes en el escenario. A trabajar.'] },
  { id: 'pato-baterista', name: 'Pato baterista', image: '/quarkington/Skins/Pato%20baterista.png', category: 'Música', cost: 120, voiceLines: ['Tum, pa, tum. Ese es el ritmo para arrancar.', '¡Batería lista! Vamos con el siguiente compás.', 'Una tarea menos y hacemos solo de platillos.'] },
  { id: 'pato-buceador', name: 'Pato buceador', image: image('pato-buceador'), category: 'Aventura', cost: 120, voiceLines: ['Respira profundo y vamos paso a paso.', 'Hay tesoros al fondo… y tareas en la superficie.', 'Oxígeno suficiente. Enfoque también.'] },
  { id: 'pato-caballero', name: 'Pato caballero', image: image('pato-caballero'), category: 'Fantasía', cost: 150, voiceLines: ['A vuestra orden, mi buen compañero.', 'Con honor y paciencia se conquista cualquier pendiente.', 'Que ninguna tarea venza a un caballero organizado.'] },
  { id: 'pato-camarografo', name: 'Pato camarógrafo', image: image('pato-camarografo'), category: 'Profesiones', cost: 120, voiceLines: ['Grabando: el momento exacto en que empiezas.', 'Toma uno: abrir la tarea. Acción.', 'Ese logro quedó para la historia. Corte y seguimos.'] },
  { id: 'pato-ciborg', name: 'Pato ciborg', image: image('pato-ciborg'), category: 'Fantasía', cost: 150, voiceLines: ['Escaneo completo. Prioridad uno: empezar.', 'Batería al cien. Enfoque sincronizado.', 'Progreso detectado. Continúa, humano.'] },
  { id: 'pato-clasico', name: 'Pato clásico', image: image('pato-clasico'), category: 'Clásicos', cost: 100, voiceLines: ['Cuac. Un clásico nunca falla.', 'Volvamos a lo esencial: una tarea y un paso.', 'Sin adornos: tú puedes con esto.'] },
  { id: 'pato-de-los-80s', name: 'Pato ochentero', image: image('pato-de-los-80s'), category: 'Música', cost: 120, voiceLines: ['¡Qué nota! Vamos a romperla como en los ochenta.', 'Sube el volumen y baja esa lista de pendientes.', 'Pura energía retro, cero excusas.'] },
  { id: 'pato-de-plasma', name: 'Pato de plasma', image: image('pato-de-plasma'), category: 'Especial', cost: 150, voiceLines: ['Energía cargada. Enfoque liberado.', 'Esta idea viene con potencia de otra galaxia.', '¡Plasma arriba! Saquemos esa tarea adelante.'] },
  { id: 'pato-de-tinta', name: 'Pato de tinta', image: image('pato-de-tinta'), category: 'Especial', cost: 150, voiceLines: ['La tinta corre… y la lista también puede avanzar.', 'No dejes que los pendientes se derramen por el día.', 'Cuac oscuro. Plan claro.'] },
  { id: 'pato-demon', name: 'Pato locutor', image: '/quarkington/Skins/Pato%20locutor.png', category: 'Profesiones', cost: 150, voiceLines: ['¡Muy buenas! Transmitimos en directo el inicio de tu próxima tarea.', 'En cabina todo listo: tú eliges el siguiente paso.', '¡Atención, audiencia! Una meta más acaba de entrar al marcador.'] },
  { id: 'pato-gloton', name: 'Pato glotón', image: image('pato-gloton'), category: 'Estilo', cost: 100, voiceLines: ['Primero una tarea, luego una merienda. Trato hecho.', 'No pienso en comida. Bueno, sí pienso un poquito.', 'Cada pendiente tachado abre espacio para el postre.'] },
  { id: 'pato-jax', name: 'Pato bromista', image: image('pato-jax'), category: 'Estilo', cost: 120, voiceLines: ['¿Tu lista te mira raro? Parpadea primero.', 'Tengo un chiste sobre pendientes… luego te lo cuento.', 'Tranquilo, no muerdo. Solo hago cosquillas al calendario.'] },
  { id: 'pato-jazz', name: 'Pato jazz', image: image('pato-jazz'), category: 'Música', cost: 120, voiceLines: ['Suave con el ritmo, firme con el progreso.', 'Improvisa el camino, pero no olvides el compás.', 'Una tarea, un solo. Que fluya.'] },
  { id: 'pato-luchador', name: 'Pato luchador', image: image('pato-luchador'), category: 'Aventura', cost: 120, voiceLines: ['¡A la lona la procrastinación!', 'Round uno: empezar. Round dos: terminar.', 'Tú tienes la fuerza. Yo pongo la máscara.'] },
  { id: 'pato-ninja', name: 'Pato ninja', image: image('pato-ninja'), category: 'Aventura', cost: 120, voiceLines: ['Me acerco en silencio… a esa tarea pendiente.', 'La disciplina es mi técnica secreta.', 'Un movimiento preciso y un pendiente menos.'] },
  { id: 'pato-papa', name: 'Pato papá', image: image('pato-papa'), category: 'Profesiones', cost: 120, voiceLines: ['¿Ya tomaste agüita? Bueno, revisemos esa tarea.', 'Con calma, mijo: primero lo importante.', 'Estoy orgulloso de ti, incluso por empezar.'] },
  { id: 'pato-pixel', name: 'Pato pixel', image: image('pato-pixel'), category: 'Clásicos', cost: 100, voiceLines: ['Nivel cargado. Pulsa empezar para continuar.', 'Cada tarea suma puntos de experiencia.', 'Guardado automático… en mi memoria de ocho bits.'] },
  { id: 'pato-pop', name: 'Pato pop', image: '/quarkington/Skins/Pato%20pop.png', category: 'Música', cost: 120, voiceLines: ['¡Brilla! Tu siguiente logro te está esperando.', 'Dale play a tus planes y sigue el ritmo.', 'Este día tiene potencial de número uno.'] },
  { id: 'pato-robot-futurista', name: 'Pato robot futurista', image: image('pato-robot-futurista'), category: 'Fantasía', cost: 150, voiceLines: ['Predicción: te sentirás mejor después de empezar.', 'Protocolo del futuro: organizarse hoy.', 'Escaneo terminado. Tu potencial supera los cálculos.'] },
  { id: 'pato-rockero', name: 'Pato rockero', image: image('pato-rockero'), category: 'Música', cost: 120, voiceLines: ['¡Que suene duro! Hoy se tachan pendientes.', 'Sube la guitarra y baja esa lista.', 'El solo viene después de terminar.'] },
  { id: 'pato-soldado', name: 'Pato soldado', image: image('pato-soldado'), category: 'Profesiones', cost: 120, voiceLines: ['¡Atención! Misión: completar el siguiente paso.', 'Avanzamos juntos. Nadie se queda atrás.', 'Objetivo cumplido. Esperando nuevas órdenes.'] },
  { id: 'pato-urbano', name: 'Pato urbano', image: image('pato-urbano'), category: 'Estilo', cost: 120, voiceLines: ['Todo firme, parcero. Vamos con esa vuelta.', 'Paso corto, mente clara y seguimos.', 'La calle está dura, pero tú más.'] },
  { id: 'pato-vikingo', name: 'Pato vikingo', image: image('pato-vikingo'), category: 'Aventura', cost: 150, voiceLines: ['¡Por Odín, esa tarea no se completará sola!', 'Al drakkar, valiente. Hoy conquistamos el día.', 'Que los dioses sean testigos: ya empezaste.'] },
  { id: 'pato-angel', name: 'Pato ángel', image: '/quarkington/Skins/Pato%20angel.png', category: 'Especial', cost: 550, voiceLines: ['Una señal del cielo: hoy toca avanzar.', 'Que la calma te acompañe con cada tarea.', 'Tus pequeños logros también merecen brillo.'] },
  { id: 'pato-de-nieve', name: 'Pato de nieve', image: '/quarkington/Skins/Pato%20de%20nieve.png', category: 'Navidad', cost: 200, voiceLines: ['¡Brrr! Abrígate y vamos con esa tarea.', 'Hasta la nieve se derrite con constancia.', 'Un copo, un paso; un paso, una meta.'] },
  { id: 'pato-de-hule', name: 'Pato de hule', image: '/quarkington/Skins/Pato%20de%20ule.png', category: 'Clásicos', cost: 270, voiceLines: ['Cuac, el original compañero de baño.', 'Floto entre pendientes, pero no dejo ninguno atrás.', 'Un patito de hule y una lista bajo control.'] },
  { id: 'pato-dormilon', name: 'Pato dormilón', image: '/quarkington/Skins/Pato%20dormilon.png', category: 'Estilo', cost: 120, voiceLines: ['Cinco minutitos más… bueno, mejor empecemos.', 'Con sueño también se puede dar un pasito.', 'Primero una tarea y luego una siesta legendaria.'] },
  { id: 'pato-en-huevo', name: 'Pato en un huevo', image: '/quarkington/Skins/Pato%20en%20un%20huevo.png', category: 'Especial', cost: 120, voiceLines: ['Todavía estoy creciendo… ¡igual puedo ayudarte!', 'Cada gran comienzo cabe en un cascarón.', 'Rompe el cascarón y arranca con algo pequeño.'] },
  { id: 'pato-navideno', name: 'Pato navideño', image: '/quarkington/Skins/Pato%20navideno.png', category: 'Navidad', cost: 0, rarity: 'Exclusivo', rewardOnly: true, unlockHint: 'Recompensa por completar misiones de temporada en diciembre.', voiceLines: ['¡La temporada se celebra con metas cumplidas!', 'Un regalo para quien avanzó misión por misión.'] },
  { id: 'pato-noel', name: 'Pato Noel', image: '/quarkington/Skins/Pato%20noel.png', category: 'Navidad', cost: 0, rarity: 'Exclusivo', rewardOnly: true, unlockHint: 'Recompensa especial disponible en diciembre.', voiceLines: ['¡Jo, jo, jo! Cada meta trae un regalo.', 'La magia de diciembre también premia la constancia.'] },
  { id: 'glitch', name: 'Glitch', image: QUACKINGTON_IMAGE, category: 'Especial', cost: 300, voiceLines: ['E-e-error… era broma. Todo bajo control.', 'Me salió un cuac con interferencia.', 'Reiniciando… ¡listo! ¿En qué íbamos?'], glitchImages: [image('glitch-rojo'), image('glitch-azul'), image('glitch-verde')] },
  { id: 'pato-dorado', name: 'Pato dorado', image: '/quarkington/Skins/Pato%20dorado.png', category: 'Especial', cost: 0, rarity: 'Exclusivo', rewardOnly: true, voiceLines: ['¡Brillas como una meta cumplida!'] },
  { id: 'pato-plateado', name: 'Pato plateado', image: '/quarkington/Skins/Pato%20plateado.png', category: 'Especial', cost: 0, rarity: 'Exclusivo', rewardOnly: true, voiceLines: ['Un logro brillante, ganado con constancia.'] },
  { id: 'pato-prisma', name: 'Pato prisma', image: '/quarkington/Skins/Pato%20prisma.png', category: 'Especial', cost: 0, rarity: 'Exclusivo', rewardOnly: true, voiceLines: ['¡Toda la colección refleja tu estilo!'] },
]

const DUCK_RARITY: Record<string, NonNullable<QuackingtonSkin['rarity']>> = {
  animado: 'Exclusivo', 'angry-duck': 'Especial', 'dinosaurio-pato': 'Épico', multipato: 'Raro',
  'patito-cool': 'Especial', 'patito-dragon': 'Demon', 'patito-esponjoso': 'Épico',
  'patito-kawaii': 'Raro', 'patito-playero': 'Especial', 'patito-rey': 'Demon',
  'pato-animatronico': 'Legendario', 'pato-baterista': 'Especial', 'pato-buceador': 'Raro',
  'pato-caballero': 'Demon', 'pato-camarografo': 'Épico', 'pato-ciborg': 'Épico',
  'pato-clasico': 'Básico', 'pato-de-los-80s': 'Épico', 'pato-de-plasma': 'Demon',
  'pato-de-tinta': 'Legendario', 'pato-demon': 'Legendario', 'pato-gloton': 'Especial',
  'pato-jax': 'Legendario', 'pato-jazz': 'Épico', 'pato-luchador': 'Raro',
  'pato-ninja': 'Épico', 'pato-papa': 'Raro', 'pato-pixel': 'Raro', 'pato-pop': 'Especial',
  'pato-robot-futurista': 'Épico', 'pato-rockero': 'Épico', 'pato-soldado': 'Raro',
  'pato-urbano': 'Básico', 'pato-vikingo': 'Raro', glitch: 'Exclusivo',
  'pato-angel': 'Legendario', 'pato-de-nieve': 'Épico', 'pato-de-hule': 'Demon',
  'pato-dormilon': 'Especial', 'pato-en-huevo': 'Especial',
  'pato-navideno': 'Exclusivo', 'pato-noel': 'Exclusivo',
  'pato-dorado': 'Exclusivo', 'pato-plateado': 'Exclusivo', 'pato-prisma': 'Exclusivo',
}
const RARITY_PRICE: Record<NonNullable<QuackingtonSkin['rarity']>, number> = {
  Básico: 10, Especial: 120, Raro: 150, Épico: 200, Demon: 270, Legendario: 550, Exclusivo: 1000,
}
for (const skin of QUACKINGTON_SKINS) {
  const rarity = DUCK_RARITY[skin.id] ?? 'Raro'
  skin.rarity = rarity
  skin.cost = skin.id === 'animado' || skin.rewardOnly ? 0 : RARITY_PRICE[rarity]
}

export const QUACKINGTON_SKIN_CATEGORIES: QuackingtonSkinCategory[] = ['Todos', 'Clásicos', 'Aventura', 'Fantasía', 'Profesiones', 'Música', 'Estilo', 'Especial', 'Navidad']

export const QUACKINGTON_COLLECTIBLE_SKINS = QUACKINGTON_SKINS.filter((skin) => !skin.rewardOnly)

export function isQuackingtonSkinAvailable(skin: QuackingtonSkin, at = new Date()): boolean {
  return skin.category !== 'Navidad' || at.getMonth() === 11
}

export function getQuackingtonSkinById(id: string): QuackingtonSkin | undefined {
  return QUACKINGTON_SKINS.find((skin) => skin.id === id)
}

const lastVoiceBySkin = new Map<string, number>()

export function pickQuackingtonSkinLine(id: string): string {
  const lines = getQuackingtonSkinById(id)?.voiceLines ?? QUACKINGTON_SKINS[0].voiceLines
  if (lines.length === 1) return lines[0]
  const previous = lastVoiceBySkin.get(id)
  let index = Math.floor(Math.random() * lines.length)
  if (index === previous) index = (index + 1 + Math.floor(Math.random() * (lines.length - 1))) % lines.length
  lastVoiceBySkin.set(id, index)
  return lines[index]
}
