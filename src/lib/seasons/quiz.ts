import type { ThemeEntry } from './catalog'
import { CATALOG, randItem } from './catalog'
import { askAI } from '../assistant'
import { useAiStore } from '../../store/ai'

export type QuizKind = 'mc' | 'tf' | 'open'

export interface Question {
  kind: QuizKind
  question: string
  correct: string
  options?: string[]
  hint?: string
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const tmp = dp[j]
      dp[j] = Math.min(dp[j] + 1, dp[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1))
      prev = tmp
    }
  }
  return dp[n]
}

const STOPWORDS = new Set([
  'de',
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'del',
  'al',
  'o',
  'y',
  'e',
  'que',
  'con',
  'en',
  'para',
  'por',
])

export function answerMatches(user: string, correct: string): boolean {
  const raw = user.trim()
  if (!raw) return false
  const u = norm(raw)
  const c = norm(correct)
  if (u === c) return true
  const uc = u.split(' ').filter((w) => w && !STOPWORDS.has(w))
  const cc = c.split(' ').filter((w) => w && !STOPWORDS.has(w))
  if (cc.length >= 2) {
    const hits = cc.filter((w) => uc.includes(w) || (w.length >= 2 && uc.some((x) => x.includes(w) || w.includes(x)))).length
    return hits >= Math.max(1, Math.floor(cc.length * 0.5))
  }
  if (uc.length === 1 && uc[0].length >= 4 && c.includes(uc[0])) return true
  return levenshtein(u, c) <= 2
}

const QUIZ_BANK: Record<string, Question[]> = {
  minecraft: [
    { kind: 'mc', question: '¿Qué mob verde explota al acercarte en Minecraft?', correct: 'Creeper', options: ['Creeper', 'Zombie', 'Enderman', 'Esqueleto'] },
    { kind: 'tf', question: 'El Nether es el "cielo" dentro de Minecraft.', correct: 'Falso' },
    { kind: 'open', question: '¿Cómo se llama el dragón jefe final de Minecraft?', correct: 'Ender Dragon', hint: 'Termina en Dragon' },
  ],
  'hazbin-hotel': [
    { kind: 'mc', question: '¿Quién es el huésped famoso que dirige la radio en Hazbin Hotel?', correct: 'Alastor', options: ['Alastor', 'Charlie', 'Angel Dust', 'Vaggie'] },
    { kind: 'tf', question: 'Charlie quiere redimir a los pecadores para que vayan al Cielo.', correct: 'Verdadero' },
  ],
  'helluva-boss': [
    { kind: 'mc', question: '¿Quién patrocina a la empresa I.M.P. en Helluva Boss?', correct: 'Blitzo', options: ['Blitzo', 'Stolas', 'Moxxie', 'Verosika'] },
    { kind: 'open', question: '¿Cómo se llama el príncipe búho enamorado de Blitzo?', correct: 'Stolas', hint: 'Empieza con S' },
  ],
  'five-nights-at-freddys-1': [
    { kind: 'mc', question: '¿En qué lugar ocurre el primer Five Nights at Freddy\'s?', correct: 'Freddy Fazbear\'s Pizza', options: ['Freddy Fazbear\'s Pizza', 'Circus Baby\'s', 'Fazbear\'s Fright', 'Pizzaplex'] },
    { kind: 'tf', question: 'Golden Freddy es uno de los animatrónicos del primer juego.', correct: 'Verdadero' },
  ],
  'fnaf-2': [
    { kind: 'open', question: 'En FNaF 2 jugás como guardia nocturno en Freddy Fazbear\'s Pizza. ¿Qué robot te da de comer la cara?', correct: 'Puppet', hint: 'Es la marioneta' },
  ],
  'poppy-playtime': [
    { kind: 'mc', question: '¿Qué color de mascota besa Huggy Wuggy al final del capítulo 1?', correct: 'Morado', options: ['Morado', 'Rojo', 'Verde', 'Azul'] },
  ],
  cuphead: [
    { kind: 'mc', question: '¿Con quién apostó Cuphead su alma para pagar la deuda?', correct: 'El Diablo', options: ['El Diablo', 'El Rey Dado', 'Cala María', 'El genio'] },
    { kind: 'tf', question: 'Cuphead está inspirado en los dibujos animados de los años 30.', correct: 'Verdadero' },
  ],
  'gta-v': [
    { kind: 'mc', question: '¿Cuál de estos NO es un protagonista de GTA V?', correct: 'Niko Bellic', options: ['Niko Bellic', 'Michael', 'Franklin', 'Trevor'] },
  ],
  'red-dead-redemption': [
    { kind: 'mc', question: '¿Cómo se llama el protagonista de Red Dead Redemption 2?', correct: 'Arthur Morgan', options: ['Arthur Morgan', 'John Marston', 'Dutch', 'Micah'] },
  ],
  'hollow-knight': [
    { kind: 'mc', question: '¿En qué reino se desarrolla Hollow Knight?', correct: 'Hallownest', options: ['Hallownest', 'Hogwarts', 'Hyrule', 'Nestria'] },
  ],
  'plants-vs-zombies-1': [
    { kind: 'tf', question: 'En PvZ los zombies tienen hambre de cerebros.', correct: 'Verdadero' },
    { kind: 'open', question: '¿Qué planta dispara guisantes?', correct: 'Lanzaguisantes', hint: 'La lanzas, literal' },
  ],
  undertale: [
    { kind: 'open', question: '¿Cómo se llama el protagonista humano de Undertale?', correct: 'Frisk', hint: 'Se descubre al final' },
  ],
  'among-us': [
    { kind: 'tf', question: 'En Among Us la tarea de cables se hace con dos colores.', correct: 'Verdadero' },
  ],
  mario: [
    { kind: 'mc', question: '¿Cómo derrota Mario al enemigo clásico?', correct: 'Saltándole encima', options: ['Saltándole encima', 'Golpes', 'Lanzando caparazones', 'Con fuego'] },
    { kind: 'open', question: '¿Cuál es el nombre del hermano gemelo verde de Mario?', correct: 'Luigi', hint: 'Lo conocés' },
  ],
  'luigis-mansion': [
    { kind: 'mc', question: '¿Qué invento usa Luigi en su mansión para atrapar fantasmas?', correct: 'Aspiradora', options: ['Aspiradora', 'Red', 'Espada', 'Revólver'] },
  ],
  sonic: [
    { kind: 'open', question: '¿Qué colecciona Sonic?', correct: 'Anillos', hint: 'Esferas doradas' },
  ],
  'crash-bandicoot': [
    { kind: 'open', question: '¿Qué fruta colecciona Crash?', correct: 'Wumpa', hint: 'Es un mango gigante' },
  ],
  gengar: [
    { kind: 'tf', question: 'Gengar es un Pokémon de tipo Fantasma.', correct: 'Verdadero' },
  ],
  pikachu: [
    { kind: 'open', question: '¿Qué lanza Pikachu con su cola?', correct: 'Rayo', hint: 'Electricidad' },
  ],
  'mario-64': [
    { kind: 'open', question: '¿Cuántas estrellas hay que recoger en Super Mario 64?', correct: '120', hint: 'Más de 100' },
  ],
  slenderman: [
    { kind: 'mc', question: '¿Qué sucede si mirás mucho tiempo a Slenderman?', correct: 'Vas perdiendo cordura', options: ['Vas perdiendo cordura', 'Te vuelves amigo', 'Ganas poderes', 'Nada'] },
  ],
  backrooms: [
    { kind: 'tf', question: 'La Backrooms tiene un nivel hecho de pasillos amarillos.', correct: 'Verdadero' },
  ],
  'the-amazing-digital-circus': [
    { kind: 'open', question: '¿Cómo se llama el lugar donde quedan atrapados los humanos?', correct: 'Circus', hint: 'Aparece en el nombre' },
  ],
  'gravity-falls': [
    { kind: 'mc', question: '¿Quién es el autor del Diario 3?', correct: 'Ford', options: ['Ford', 'Stan', 'Dipper', 'Soos'] },
  ],
  'hora-de-aventura': [
    { kind: 'open', question: '¿Cómo se llama el perro hermano de Finn?', correct: 'Jake', hint: 'Le estira el brazo' },
  ],
  'death-note': [
    { kind: 'open', question: '¿Qué nombre escribe Light en la Death Note?', correct: 'L', hint: 'Letter' },
    { kind: 'tf', question: 'Light Yagami quiere purgar el mundo de criminales.', correct: 'Verdadero' },
  ],
  coraline: [
    { kind: 'mc', question: '¿Qué tiene la Otra Madre en lugar de ojos?', correct: 'Botones', options: ['Botones', 'Monedas', 'Perlas', 'Luces'] },
  ],
  'el-grinch': [
    { kind: 'mc', question: '¿Qué se roba el Grinch en Navidad?', correct: 'Los regalos', options: ['Los regalos', 'El árbol', 'La nieve', 'Las luces'] },
  ],
  batman: [
    { kind: 'open', question: '¿En qué ciudad protege Batman?', correct: 'Gotham', hint: 'Ciudad oscura' },
  ],
  joker: [
    { kind: 'open', question: '¿Cómo se fichó al Joker? ¿Qué nombre usamos?', correct: 'Arthur', hint: 'Comienza con A', },
    { kind: 'tf', question: 'El Joker es el archienemigo de Superman.', correct: 'Falso' },
  ],
  'spider-man': [
    { kind: 'open', question: '¿Qué lo picó a Peter Parker?', correct: 'Araña', hint: '8 patas' },
  ],
  'el-grito': [
    { kind: 'open', question: '¿Quién pintó "El grito"?', correct: 'Munch', hint: 'Apellido noruego' },
  ],
  'la-noche-estrellada': [
    { kind: 'open', question: '¿Quién pintó "La noche estrellada"?', correct: 'Van Gogh', hint: 'Se cortó una oreja' },
  ],
  terremoto: [
    { kind: 'mc', question: '¿Cómo se llama el aparato que mide la magnitud de un terremoto?', correct: 'Sismógrafo', options: ['Sismógrafo', 'Termómetro', 'Barómetro', 'Anemómetro'] },
  ],
  ajedrez: [
    { kind: 'mc', question: '¿Qué pieza se mueve en L?', correct: 'Caballo', options: ['Caballo', 'Alfil', 'Torre', 'Peón'] },
  ],
  'antiguo-egipto': [
    { kind: 'open', question: '¿Cómo se llaman las tumbas de los faraones?', correct: 'Pirámides', hint: 'Triángulos gigantes' },
  ],
  vikingos: [
    { kind: 'tf', question: 'Los vikingos navegaban con barcos llamados drakkars.', correct: 'Verdadero' },
  ],
}

export function randomQuestion(entry: ThemeEntry): Question {
  const bank = QUIZ_BANK[entry.key]
  if (bank && bank.length > 0) return randItem(bank)
  return proceduralQuestion(entry)
}

function proceduralQuestion(entry: ThemeEntry): Question {
  const roll = Math.random()
  const others = CATALOG.filter((c) => c.key !== entry.key)

  if (roll < 0.38) {
    const groupOptions = shuffle([entry.group, ...uniqueRandoms(others.map((c) => c.group), 3)])
    return {
      kind: 'mc',
      question: `¿De qué franquicia o grupo es "${entry.name}"?`,
      correct: entry.group,
      options: groupOptions,
    }
  }

  if (roll < 0.68) {
    const typeOptions = shuffle([entry.type, ...uniqueRandoms(others.map((c) => c.type), 3)])
    return {
      kind: 'mc',
      question: `¿Qué tipo de contenido es "${entry.name}"?`,
      correct: entry.type,
      options: typeOptions,
    }
  }

  if (roll < 0.85) {
    const aroundYear = Math.random() < 0.5
    if (aroundYear) {
      return {
        kind: 'tf',
        question: `"${entry.name}" está disponible todo el año para una temporada.`,
        correct: entry.window.includes('all') ? 'Verdadero' : 'Falso',
      }
    }
    return {
      kind: 'tf',
      question: `"${entry.name}" es contenido de miedo/terror para octubre.`,
      correct: entry.window.includes('oct') ? 'Verdadero' : 'Falso',
    }
  }

  const useGroup = Math.random() < 0.6
  return {
    kind: 'open',
    question: useGroup
      ? `Sin opciones: ¿a qué grupo o franquicia pertenece "${entry.name}"?`
      : `Sin opciones: ¿qué tipo de contenido es "${entry.name}"?`,
    correct: useGroup ? entry.group : entry.type,
    hint: useGroup ? 'Escribí el nombre de la franquicia' : 'Videojuego, película, serie…',
  }
}

function uniqueRandoms(items: string[], count: number): string[] {
  const out: string[] = []
  const pool = shuffle([...items])
  for (const it of pool) {
    if (!out.includes(it)) out.push(it)
    if (out.length >= count) break
  }
  while (out.length < count) out.push('Sin rumbo')
  return out
}

const QUIZ_SYSTEM =
  'Sos el "modo asistente" de una app de gestión de temporadas. Tu única tarea: crear UNA pregunta ' +
  'de lore real, curiosa y bien pensada sobre el tema (serie, videojuego, película, anime, personaje o época) ' +
  'que te pasan. Tono colombiano, divertido pero no ridículo. La pregunta debe poder responderse con lo que ' +
  'sabe un fan. Respondé ÚNICAMENTE un objeto JSON válido, sin markdown y sin texto extra. ' +
  'Esquema: {"kind": "mc" | "tf" | "open", "question": string, "correct": string, "options"?: string[] (solo para mc, 4 opciones y tu "correct" debe ser literalmente una de ellas), "hint"?: string (opcional)}. ' +
  'Para "open", "correct" debe ser la respuesta corta (máx 4 palabras). Para "tf", "correct" debe ser "Verdadero" o "Falso".'

export async function aiGeneratedQuestion(entry: ThemeEntry): Promise<Question> {
  const cfg = useAiStore.getState()
  if (cfg.provider === 'none' || cfg.keys.filter((k) => k.trim()).length === 0) {
    throw new Error('Asistente desactivado')
  }

  const themeInfo =
    `Tema: "${entry.name}". Tipo: ${entry.type}. Franquicia/grupo: ${entry.group}. ` +
    `Disponibilidad: ${entry.window.join(' / ')}. Colores del tema: ${entry.colors}.`

  let raw = ''
  try {
    raw = await askAI({
      provider: cfg.provider,
      keys: cfg.keys,
      model: cfg.model,
      baseUrl: cfg.baseUrl,
      system: QUIZ_SYSTEM,
      user: `${themeInfo}\nGenerá la pregunta ahora.`,
    })
  } catch (err) {
    throw new Error(err instanceof Error ? err.message : 'Fallo al llamar al asistente')
  }

  return parseAiQuestion(raw)
}

export function parseAiQuestion(raw: string): Question {
  const cleaned = raw.replace(/```(?:json)?/gi, '').trim()
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1) throw new Error('La IA no devolvió JSON válido')
  const obj = JSON.parse(cleaned.slice(start, end + 1)) as Partial<Question> & { kind?: string }
  const kind = obj.kind === 'mc' || obj.kind === 'tf' ? obj.kind : 'open'
  if (!obj.question || typeof obj.question !== 'string' || !obj.question.trim()) {
    throw new Error('La IA no devolvió pregunta')
  }

  if (kind === 'mc') {
    const options = Array.isArray(obj.options)
      ? obj.options.filter((o): o is string => typeof o === 'string' && !!o.trim())
      : []
    if (options.length >= 2 && typeof obj.correct === 'string' && options.includes(obj.correct)) {
      return { kind, question: obj.question.trim(), correct: obj.correct, options: shuffle([...options]) }
    }
    throw new Error('Opciones inválidas de la IA')
  }

  if (kind === 'tf') {
    const correct = obj.correct === 'Falso' ? 'Falso' : 'Verdadero'
    return { kind, question: obj.question.trim(), correct }
  }

  const correct = typeof obj.correct === 'string' && obj.correct.trim() ? obj.correct.trim() : ''
  if (!correct) throw new Error('La IA no devolvió respuesta')
  return { kind, question: obj.question.trim(), correct, hint: obj.hint ?? 'Tu respuesta…' }
}