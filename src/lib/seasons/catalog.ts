export type SeasonWindow = 'all' | 'oct' | 'dec' | 'feb' | 'seasonal'
export type SpecialKey =
  | 'halloween'
  | 'navidad'
  | 'sanvalentin'
  | 'amoramistad'
  | 'pascua'
  | 'cumple'
  | 'independencia'
  | 'acciongracias'

export interface ThemeEntry {
  key: string
  name: string
  type: string
  group: string
  window: SeasonWindow[]
  colors: string
  primary: string
  frank: string
}

const WINDOWS: Record<string, SeasonWindow[]> = {
  'Todo el año': ['all'],
  'Octubre': ['oct'],
  'Navidad': ['dec'],
  'San Valentín': ['feb'],
  'Según temporada': ['seasonal'],
  'Octubre y Navidad': ['oct', 'dec'],
}

const V = 'Videojuego'
const P = 'Película'
const S = 'Serie'
const AN = 'Anime'
const PER = 'Personaje'
const T = 'Tema'
const EP = 'Época'
const CO = 'Color'
const ES = 'Estilo'
const MU = 'Música'
const CR = 'Creepypasta'
const AR = 'Arte'
const ALT_DC = 'Versión alterna DC'
const ALT_M = 'Versión alterna Marvel'
const PER_DC = 'Personaje DC'
const PER_M = 'Personaje Marvel'
const SUB = 'Subtema'
const CRX = 'Crossover'
const PER_AN = 'Personaje anime'

type Row = [string, string, string, string, string]

const RAW: Row[] = [
  ['Hazbin Hotel', S, 'Hazbin/Helluva', 'Octubre', 'Rojo'],
  ['Helluva Boss', S, 'Hazbin/Helluva', 'Octubre', 'Rojo/Negro'],
  ['Rick y Morty', S, 'Rick y Morty', 'Todo el año', 'Verde/Celeste'],
  ['Looney Tunes: Bugs Bunny', S, 'Looney Tunes', 'Todo el año', 'Gris/Blanco'],
  ['Los Simpson', S, 'Los Simpson', 'Todo el año', 'Amarillo/Azul'],
  ['Scooby-Doo', S, 'Scooby-Doo', 'Todo el año', 'Café/Verde'],
  ['Ben 10', S, 'Ben 10', 'Todo el año', 'Verde/Negro'],
  ['Bob Esponja', S, 'Bob Esponja', 'Todo el año', 'Amarillo/Azul'],
  ['Brawl Stars', V, 'Brawl Stars', 'Todo el año', 'Amarillo/Azul'],
  ['Fortnite', V, 'Fortnite', 'Todo el año', 'Morado/Azul'],
  ['Roblox', V, 'Roblox', 'Todo el año', 'Blanco/Negro'],
  ['One Piece', AN, 'One Piece', 'Todo el año', 'Rojo/Dorado'],
  ['Naruto', AN, 'Naruto', 'Todo el año', 'Naranja/Negro'],
  ['Dragon Ball', AN, 'Dragon Ball', 'Todo el año', 'Naranja/Dorado'],
  ['Garten of Banban', V, 'Garten of Banban', 'Octubre', 'Rojo/Verde'],
  ['Harry Potter', P, 'Harry Potter', 'Todo el año', 'Dorado/Negro'],
  ['Phineas y Ferb', S, 'Phineas y Ferb', 'Todo el año', 'Naranja/Azul'],
  ['Transformers', P, 'Transformers', 'Todo el año', 'Rojo/Gris'],
  ['Jurassic Park', P, 'Jurassic Park', 'Todo el año', 'Rojo/Negro'],
  ['Mortal Kombat', V, 'Mortal Kombat', 'Todo el año', 'Negro/Rojo'],
  ['God of War', V, 'God of War', 'Todo el año', 'Gris/Rojo'],
  ['Subnautica', V, 'Subnautica', 'Todo el año', 'Azul/Naranja'],
  ['Toy Story', P, 'Toy Story', 'Todo el año', 'Azul/Amarillo'],
  ['Cars', P, 'Cars', 'Todo el año', 'Rojo'],
  ['Star Wars', P, 'Star Wars', 'Todo el año', 'Azul/Negro'],
  ['Dipper Pines', PER, 'Gravity Falls', 'Octubre', 'Azul/Dorado'],
  ['Five Nights at Freddy\'s 1', V, 'FNaF', 'Octubre', 'Negro/Café'],
  ['FNaF 2', V, 'FNaF', 'Octubre', 'Negro/Café'],
  ['FNaF 3', V, 'FNaF', 'Octubre', 'Verde/Negro'],
  ['FNaF 4', V, 'FNaF', 'Octubre', 'Negro/Rojo'],
  ['FNaF Sister Location', V, 'FNaF', 'Octubre', 'Naranja/Negro'],
  ['Ultimate Custom Night', V, 'FNaF', 'Octubre', 'Multicolor/Negro'],
  ['FNaF: Help Wanted', V, 'FNaF', 'Octubre', 'Negro/Azul'],
  ['Freddy Fazbear\'s Pizzeria Simulator', V, 'FNaF', 'Octubre', 'Rojo/Amarillo'],
  ['FNaF: Security Breach', V, 'FNaF', 'Octubre', 'Morado/Neón'],
  ['FNaF: Security Breach Ruin', V, 'FNaF', 'Octubre', 'Morado/Negro'],
  ['FNaF: Into the Pit', V, 'FNaF', 'Octubre', 'Negro/Café'],
  ['FNaF: Secret of the Mimic', V, 'FNaF', 'Octubre', 'Gris/Negro'],
  ['Poppy Playtime', V, 'Poppy Playtime', 'Octubre', 'Rojo/Azul'],
  ['Bendy and the Ink Machine', V, 'Bendy', 'Octubre', 'Sepia/Negro'],
  ['Bendy and the Dark Revival', V, 'Bendy', 'Octubre', 'Sepia/Negro'],
  ['Cuphead', V, 'Cuphead', 'Todo el año', 'Sepia/Rojo'],
  ['GTA V', V, 'GTA', 'Todo el año', 'Verde/Naranja'],
  ['GTA San Andreas', V, 'GTA', 'Todo el año', 'Verde'],
  ['GTA Vice City', V, 'GTA', 'Todo el año', 'Rosa/Azul'],
  ['The Forest', V, 'The Forest', 'Octubre', 'Verde/Gris'],
  ['Flappy Bird', V, 'Flappy Bird', 'Todo el año', 'Amarillo/Azul'],
  ['Happy Wheels', V, 'Happy Wheels', 'Octubre', 'Rojo/Negro'],
  ['Piratas', T, 'Piratas', 'Todo el año', 'Azul/Café'],
  ['Vaqueros', T, 'Vaqueros', 'Todo el año', 'Café/Dorado'],
  ['China antigua', EP, 'China', 'Todo el año', 'Rojo/Dorado'],
  ['Dragón chino', T, 'China', 'Todo el año', 'Rojo/Dorado'],
  ['Fuego', T, 'Elementos', 'Todo el año', 'Naranja/Rojo'],
  ['Hielo', T, 'Elementos', 'Todo el año', 'Celeste/Blanco'],
  ['Agua', T, 'Elementos', 'Todo el año', 'Azul/Celeste'],
  ['Neón', T, 'Elementos', 'Todo el año', 'Cian/Morado'],
  ['Roca volcánica', T, 'Elementos', 'Todo el año', 'Negro/Naranja'],
  ['Red Dead Redemption', V, 'Red Dead', 'Todo el año', 'Naranja/Café'],
  ['Minecraft', V, 'Minecraft', 'Todo el año', 'Verde'],
  ['Hollow Knight', V, 'Hollow Knight', 'Todo el año', 'Blanco/Negro'],
  ['Plants vs. Zombies 1', V, 'PvZ', 'Todo el año', 'Verde'],
  ['Plants vs. Zombies 2', V, 'PvZ', 'Todo el año', 'Verde/Multicolor'],
  ['Geometry Dash', V, 'Geometry Dash', 'Todo el año', 'Neón'],
  ['Just Shapes & Beats', V, 'JSAB', 'Todo el año', 'Neón'],
  ['Friday Night Funkin\'', V, 'FNF', 'Todo el año', 'Multicolor'],
  ['Angry Birds', V, 'Angry Birds', 'Todo el año', 'Rojo'],
  ['Clash Royale', V, 'Clash', 'Según temporada', 'Azul/Dorado'],
  ['Clash of Clans', V, 'Clash', 'Según temporada', 'Dorado/Verde'],
  ['Rayman', V, 'Rayman', 'Todo el año', 'Multicolor'],
  ['Spyro', V, 'Spyro', 'Todo el año', 'Morado'],
  ['Super Smash Bros', V, 'Smash Bros', 'Todo el año', 'Multicolor'],
  ['Super Smash Bros Melee', V, 'Smash Bros', 'Todo el año', 'Multicolor'],
  ['Undertale', V, 'Undertale', 'Todo el año', 'Negro/Rojo'],
  ['Granny', V, 'Granny', 'Octubre', 'Gris/Café'],
  ['Hello Neighbor', V, 'Hello Neighbor', 'Octubre', 'Naranja/Negro'],
  ['Among Us', V, 'Among Us', 'Todo el año', 'Rojo/Multicolor'],
  ['Fall Guys', V, 'Fall Guys', 'Todo el año', 'Multicolor'],
  ['Terraria', V, 'Terraria', 'Todo el año', 'Verde/Azul'],
  ['Rocket League', V, 'Rocket League', 'Todo el año', 'Azul/Naranja'],
  ['Mario', V, 'Mario', 'Todo el año', 'Rojo'],
  ['Mario Kart', V, 'Mario', 'Todo el año', 'Multicolor'],
  ['Mario 64', V, 'Mario', 'Todo el año', 'Rojo/Azul'],
  ['Luigi\'s Mansion', V, 'Mario', 'Octubre', 'Verde/Azul oscuro'],
  ['Super Mario Bros', V, 'Mario', 'Todo el año', 'Rojo/Azul'],
  ['Super Mario Bros 3', V, 'Mario', 'Todo el año', 'Rojo/Verde'],
  ['Super Mario Galaxy', V, 'Mario', 'Todo el año', 'Azul oscuro/Dorado'],
  ['Super Mario Galaxy 2', V, 'Mario', 'Todo el año', 'Azul oscuro/Dorado'],
  ['Super Mario Odyssey', V, 'Mario', 'Todo el año', 'Rojo/Multicolor'],
  ['Mario Kart 64', V, 'Mario', 'Todo el año', 'Multicolor'],
  ['Mario Kart 8 Deluxe', V, 'Mario', 'Todo el año', 'Multicolor'],
  ['Luigi', PER, 'Mario', 'Todo el año', 'Verde'],
  ['Bowser', PER, 'Mario', 'Todo el año', 'Verde/Naranja'],
  ['Yoshi', PER, 'Mario', 'Todo el año', 'Verde'],
  ['Wario', PER, 'Mario', 'Todo el año', 'Amarillo/Morado'],
  ['Donkey Kong', V, 'Mario', 'Todo el año', 'Café/Rojo'],
  ['Sonic 1', V, 'Sonic', 'Todo el año', 'Azul/Verde'],
  ['Sonic 2', V, 'Sonic', 'Todo el año', 'Azul/Amarillo'],
  ['Sonic 3 & Knuckles', V, 'Sonic', 'Todo el año', 'Azul/Rojo'],
  ['Sonic Adventure 2', V, 'Sonic', 'Todo el año', 'Azul/Negro'],
  ['Sonic Heroes', V, 'Sonic', 'Todo el año', 'Azul/Rojo'],
  ['Sonic Mania', V, 'Sonic', 'Todo el año', 'Azul/Multicolor'],
  ['Crash Bandicoot', V, 'Crash', 'Todo el año', 'Naranja'],
  ['Crash Team Racing', V, 'Crash', 'Todo el año', 'Naranja'],
  ['CTR Nitro-Fueled', V, 'Crash', 'Todo el año', 'Naranja/Multicolor'],
  ['Crash Bandicoot 2', V, 'Crash', 'Todo el año', 'Naranja'],
  ['Crash Bandicoot 3', V, 'Crash', 'Todo el año', 'Naranja/Azul'],
  ['Crash Bandicoot 4', V, 'Crash', 'Todo el año', 'Naranja/Multicolor'],
  ['Zelda/Link', V, 'Zelda', 'Todo el año', 'Verde/Dorado'],
  ['Ocarina of Time', V, 'Zelda', 'Todo el año', 'Verde/Dorado'],
  ['Twilight Princess', V, 'Zelda', 'Todo el año', 'Negro/Azul'],
  ['NFS Most Wanted 2005', V, 'NFS', 'Todo el año', 'Verde oscuro/Negro'],
  ['NFS Most Wanted 2012', V, 'NFS', 'Todo el año', 'Negro/Azul'],
  ['NFS Hot Pursuit', V, 'NFS', 'Todo el año', 'Rojo/Azul'],
  ['NFS Unbound', V, 'NFS', 'Todo el año', 'Neón/Multicolor'],
  ['NFS Underground', V, 'NFS', 'Todo el año', 'Azul neón/Negro'],
  ['NFS Underground 2', V, 'NFS', 'Todo el año', 'Azul neón/Naranja'],
  ['NFS Carbon', V, 'NFS', 'Todo el año', 'Naranja/Negro'],
  ['NFS ProStreet', V, 'NFS', 'Todo el año', 'Gris/Naranja'],
  ['NFS Undercover', V, 'NFS', 'Todo el año', 'Negro/Dorado'],
  ['NFS The Run', V, 'NFS', 'Todo el año', 'Naranja/Azul'],
  ['NFS Rivals', V, 'NFS', 'Todo el año', 'Rojo/Azul'],
  ['NFS Payback', V, 'NFS', 'Todo el año', 'Naranja/Negro'],
  ['NFS Heat', V, 'NFS', 'Todo el año', 'Neón/Naranja'],
  ['The Amazing Digital Circus', S, 'Digital Circus', 'Todo el año', 'Multicolor'],
  ['Kick Buttowski', S, 'Kick Buttowski', 'Todo el año', 'Rojo/Blanco'],
  ['Randy Cunningham: Ninja Total', S, 'Randy Cunningham', 'Octubre', 'Azul/Negro'],
  ['Un show más', S, 'Un show más', 'Todo el año', 'Verde/Azul'],
  ['Hora de aventura', S, 'Hora de aventura', 'Todo el año', 'Celeste/Amarillo'],
  ['Star vs. las fuerzas del mal', S, 'Star', 'Todo el año', 'Rosa/Morado'],
  ['Villanos (Black Hat)', S, 'Villanos', 'Octubre', 'Negro/Morado'],
  ['Bajoterra', S, 'Bajoterra', 'Todo el año', 'Multicolor'],
  ['Gravity Falls', S, 'Gravity Falls', 'Octubre', 'Azul pino/Amarillo'],
  ['Gravity Falls: el diario', SUB, 'Gravity Falls', 'Octubre', 'Azul/Dorado'],
  ['Gravity Falls: Bill', SUB, 'Gravity Falls', 'Octubre', 'Amarillo/Azul'],
  ['Gravity Falls: anomalías', SUB, 'Gravity Falls', 'Octubre', 'Azul/Morado'],
  ['Steven Universe', S, 'Steven Universe', 'Todo el año', 'Rosa/Multicolor'],
  ['Gumball', S, 'Gumball', 'Todo el año', 'Azul/Multicolor'],
  ['Coraje el perro cobarde', S, 'Coraje', 'Octubre', 'Rosa/Morado'],
  ['Monster', AN, 'Monster', 'Todo el año', 'Gris/Negro'],
  ['Death Note', AN, 'Death Note', 'Octubre', 'Negro/Rojo'],
  ['Ayanokōji', PER_AN, 'Classroom of the Elite', 'Todo el año', 'Blanco/Gris'],
  ['Coraline', P, 'Coraline', 'Octubre', 'Azul/Naranja'],
  ['Terrifier (Art the Clown)', P, 'Terrifier', 'Octubre', 'Negro/Rojo'],
  ['Jack Skeleton', PER, 'Pesadilla antes de Navidad', 'Octubre y Navidad', 'Negro/Blanco'],
  ['El Grinch', P, 'Grinch', 'Navidad', 'Verde/Rojo'],
  ['King Kong', P, 'Monstruos', 'Todo el año', 'Café/Verde selva'],
  ['Godzilla', P, 'Monstruos', 'Todo el año', 'Gris/Azul'],
  ['Cómo entrenar a tu dragón', P, 'Dragones', 'Todo el año', 'Azul/Gris'],
  ['Dragones', T, 'Dragones', 'Todo el año', 'Rojo/Negro'],
  ['Batman', PER_DC, 'DC', 'Todo el año', 'Negro/Gris'],
  ['Joker', PER_DC, 'DC', 'Todo el año', 'Morado/Verde'],
  ['Batman que Ríe', ALT_DC, 'DC', 'Octubre', 'Negro/Rojo'],
  ['Superman', PER_DC, 'DC', 'Todo el año', 'Azul/Rojo'],
  ['Spider-Man', PER_M, 'Marvel', 'Todo el año', 'Rojo/Azul'],
  ['Venom', PER_M, 'Marvel', 'Octubre', 'Negro/Blanco'],
  ['Deadpool', PER_M, 'Marvel', 'Todo el año', 'Rojo/Negro'],
  ['Iron Man', PER_M, 'Marvel', 'Todo el año', 'Rojo/Dorado'],
  ['Marvel Zombies', ALT_M, 'Marvel', 'Octubre', 'Verde/Rojo'],
  ['Ultron', ALT_M, 'Marvel', 'Todo el año', 'Gris/Rojo'],
  ['Avenged Sevenfold', MU, 'Rock', 'Octubre', 'Negro/Rojo'],
  ['Disturbed', MU, 'Rock', 'Octubre', 'Negro/Rojo'],
  ['Device', MU, 'Rock', 'Todo el año', 'Negro'],
  ['Linkin Park', MU, 'Rock', 'Todo el año', 'Gris/Negro'],
  ['Three Days Grace', MU, 'Rock', 'Todo el año', 'Negro/Rojo'],
  ['Rammstein', MU, 'Rock', 'Octubre', 'Rojo/Negro'],
  ['Five Finger Death Punch', MU, 'Rock', 'Todo el año', 'Rojo/Negro'],
  ['J Balvin: álbum Colores', MU, 'Reggaetón', 'Todo el año', 'Multicolor'],
  ['Creepypastas', T, 'Creepypastas', 'Octubre', 'Negro/Rojo'],
  ['Slenderman', CR, 'Creepypastas', 'Octubre', 'Negro/Blanco'],
  ['Jeff the Killer', CR, 'Creepypastas', 'Octubre', 'Blanco/Negro'],
  ['Sonic.exe', CRX, 'Creepypastas', 'Octubre', 'Azul/Rojo'],
  ['Mario.exe', CRX, 'Creepypastas', 'Octubre', 'Rojo/Negro'],
  ['Tails.exe', CRX, 'Creepypastas', 'Octubre', 'Naranja/Negro'],
  ['Herobrine', CR, 'Creepypastas', 'Octubre', 'Blanco/Café'],
  ['Ben Drowned', CR, 'Creepypastas', 'Octubre', 'Verde/Negro'],
  ['Backrooms', CR, 'Creepypastas', 'Octubre', 'Amarillo'],
  ['Lavender Town', CR, 'Creepypastas', 'Octubre', 'Morado'],
  ['Smile Dog', CR, 'Creepypastas', 'Octubre', 'Negro/Blanco'],
  ['The Rake', CR, 'Creepypastas', 'Octubre', 'Gris/Negro'],
  ['Eyeless Jack', CR, 'Creepypastas', 'Octubre', 'Negro/Azul'],
  ['Laughing Jack', CR, 'Creepypastas', 'Octubre', 'Blanco/Negro'],
  ['Pikachu', T, 'Pokémon', 'Todo el año', 'Amarillo'],
  ['Charizard', T, 'Pokémon', 'Todo el año', 'Naranja'],
  ['Gengar', T, 'Pokémon', 'Octubre', 'Morado'],
  ['Mewtwo', T, 'Pokémon', 'Todo el año', 'Morado/Blanco'],
  ['Umbreon', T, 'Pokémon', 'Todo el año', 'Negro/Dorado'],
  ['Tsunami', T, 'Desastres', 'Todo el año', 'Azul'],
  ['Huracán', T, 'Desastres', 'Todo el año', 'Gris/Azul'],
  ['Tornado', T, 'Desastres', 'Todo el año', 'Gris'],
  ['Erupción volcánica', T, 'Desastres', 'Todo el año', 'Rojo/Naranja'],
  ['Avalancha', T, 'Desastres', 'Todo el año', 'Blanco/Azul'],
  ['Tormenta eléctrica', T, 'Desastres', 'Todo el año', 'Azul oscuro/Amarillo'],
  ['La Mona Lisa', AR, 'Obras de arte', 'Todo el año', 'Café/Verde oliva'],
  ['La noche estrellada', AR, 'Obras de arte', 'Todo el año', 'Azul/Amarillo'],
  ['El grito', AR, 'Obras de arte', 'Octubre', 'Naranja/Azul'],
  ['La persistencia de la memoria', AR, 'Obras de arte', 'Todo el año', 'Naranja/Café'],
  ['La creación de Adán', AR, 'Obras de arte', 'Todo el año', 'Beige/Azul'],
  ['La joven de la perla', AR, 'Obras de arte', 'Todo el año', 'Azul/Dorado'],
  ['El beso (Klimt)', AR, 'Obras de arte', 'San Valentín', 'Dorado'],
  ['Guernica', AR, 'Obras de arte', 'Todo el año', 'Gris/Negro'],
  ['Filosofía', T, 'Filosofía', 'Todo el año', 'Gris/Dorado'],
  ['Ajedrez', T, 'Ajedrez', 'Todo el año', 'Blanco/Negro'],
  ['Programación', T, 'Tecnología', 'Todo el año', 'Verde/Negro'],
  ['Hacking', T, 'Tecnología', 'Todo el año', 'Verde neón/Negro'],
  ['Futuro', T, 'Futuro', 'Todo el año', 'Azul neón/Cian'],
  ['Naturaleza', T, 'Naturaleza', 'Todo el año', 'Verde'],
  ['León', T, 'Animales', 'Todo el año', 'Dorado'],
  ['Prehistoria/Dinosaurios', EP, 'Historia', 'Todo el año', 'Verde/Café'],
  ['Antiguo Egipto', EP, 'Historia', 'Todo el año', 'Dorado/Azul'],
  ['Antigua Grecia', EP, 'Historia', 'Todo el año', 'Blanco/Azul'],
  ['Antigua Roma', EP, 'Historia', 'Todo el año', 'Rojo/Dorado'],
  ['Edad Media', EP, 'Historia', 'Octubre', 'Gris/Café'],
  ['Vikingos', EP, 'Historia', 'Todo el año', 'Café/Gris'],
  ['Renacimiento', EP, 'Historia', 'Todo el año', 'Dorado/Café'],
  ['Segunda Guerra Mundial', EP, 'Historia', 'Todo el año', 'Gris/Verde militar'],
  ['Guerra Fría', EP, 'Historia', 'Todo el año', 'Rojo/Gris'],
  ['Dorado', CO, 'Colores', 'Todo el año', 'Dorado'],
  ['Plateado', CO, 'Colores', 'Todo el año', 'Plateado'],
  ['Cobre', CO, 'Colores', 'Todo el año', 'Cobre'],
  ['Bronce', CO, 'Colores', 'Todo el año', 'Bronce'],
  ['Prisma', CO, 'Colores', 'Todo el año', 'Multicolor'],
  ['Amatista', CO, 'Colores', 'Todo el año', 'Morado'],
  ['Esmeralda', CO, 'Colores', 'Todo el año', 'Verde'],
  ['Rubí', CO, 'Colores', 'San Valentín', 'Rojo'],
  ['Zafiro', CO, 'Colores', 'Todo el año', 'Azul'],
  ['Obsidiana', CO, 'Colores', 'Octubre', 'Negro'],
  ['Negro con líneas doradas', ES, 'Estilos', 'Todo el año', 'Negro/Dorado'],
  ['Morado con curvas de puntos', ES, 'Estilos', 'Todo el año', 'Morado'],
  ['Azul oscuro con partículas', ES, 'Estilos', 'Todo el año', 'Azul'],
  ['Rojo con textura rota', ES, 'Estilos', 'Octubre', 'Rojo'],
  ['Verde neón con rejilla', ES, 'Estilos', 'Todo el año', 'Verde neón'],
  ['Blanco y negro con trazos gruesos', ES, 'Estilos', 'Todo el año', 'Blanco/Negro'],
]

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

function frankOf(group: string): string {
  return normalize(group.replace(/\(.*?\)/g, ''))
}

function primaryOfColors(colors: string): string {
  const first = colors.split('/')[0].trim()
  return first || 'multicolor'
}

export const CATALOG: ThemeEntry[] = RAW.map(([name, type, group, win, colors]) => ({
  key: normalize(name).replace(/\s+/g, '-'),
  name,
  type,
  group,
  window: WINDOWS[win] ?? ['all'],
  colors,
  primary: primaryOfColors(colors),
  frank: frankOf(group),
}))

const seen: Record<string, number> = {}
for (const e of CATALOG) {
  const base = e.key
  const n = seen[base] ?? 0
  seen[base] = n + 1
  if (n > 0) e.key = `${base}-${n + 1}`
}

export const CATALOG_BY_KEY: Record<string, ThemeEntry> = Object.fromEntries(CATALOG.map((e) => [e.key, e]))

export function themeById(key: string | null | undefined): ThemeEntry | undefined {
  return key ? CATALOG_BY_KEY[key] : undefined
}

export const CHARACTER_TYPES = new Set([
  'Personaje',
  'Personaje DC',
  'Personaje Marvel',
  'Personaje anime',
  'Versión alterna',
  'Versión alterna DC',
  'Versión alterna Marvel',
])

export function isCharacterLike(entry: ThemeEntry): boolean {
  return CHARACTER_TYPES.has(entry.type)
}

export function characterCandidates(entry: ThemeEntry): ThemeEntry[] {
  if (entry.key === 'creepypastas') {
    return CATALOG.filter((c) => c.key !== entry.key && c.frank === entry.frank)
  }
  return CATALOG.filter((c) => c.key !== entry.key && c.frank === entry.frank && isCharacterLike(c))
}

export const SPECIAL_MONTHS: Record<SpecialKey, number> = {
  halloween: 10,
  navidad: 12,
  sanvalentin: 2,
  amoramistad: 9,
  pascua: 4,
  cumple: 9,
  independencia: 7,
  acciongracias: 11,
}

export const ALL_SPECIALS = Object.keys(SPECIAL_MONTHS) as SpecialKey[]

export function specialsOf(month: number): SpecialKey[] {
  return ALL_SPECIALS.filter((k) => SPECIAL_MONTHS[k] === month)
}

export function specialOf(month: number): SpecialKey | undefined {
  return (['halloween', 'navidad', 'sanvalentin'] as SpecialKey[]).find((k) => SPECIAL_MONTHS[k] === month)
}

export function specialLabel(kind: SpecialKey): string {
  if (kind === 'halloween') return 'Halloween'
  if (kind === 'navidad') return 'Navidad'
  if (kind === 'sanvalentin') return 'San Valentín'
  if (kind === 'amoramistad') return 'Amor y Amistad'
  if (kind === 'pascua') return 'Pascua'
  if (kind === 'cumple') return 'Mi cumpleaños'
  if (kind === 'independencia') return 'Independencia'
  return 'Acción de Gracias'
}

export function eligibleForMonth(month: number): ThemeEntry[] {
  const sps = specialsOf(month)
  return CATALOG.filter((e) => {
    if (e.window.includes('all')) return true
    if (e.window.includes('seasonal')) return true
    if (sps.includes('halloween') && e.window.includes('oct')) return true
    if (sps.includes('navidad') && e.window.includes('dec')) return true
    if (sps.includes('sanvalentin') && e.window.includes('feb')) return true
    return false
  })
}

export const MESES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
]

export function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

const HEX: Record<string, string> = {
  negro: '#18181b',
  blanco: '#f7f7f5',
  cafe: '#8a5a2b',
  rojo: '#e5383b',
  verde: '#16a34a',
  'verde oscuro': '#3f5a3d',
  azul: '#3b82f6',
  morado: '#8b5cf6',
  rosa: '#ec4899',
  naranja: '#f97316',
  amarillo: '#eab308',
  dorado: '#d4a017',
  plateado: '#c9d4e0',
  cobre: '#b87333',
  bronce: '#cd7f32',
  prisma: '#a78bfa',
  amatista: '#a78bfa',
  esmeralda: '#10b981',
  rubi: '#dc2626',
  zafiro: '#2563eb',
  obsidiana: '#15131a',
  gris: '#71717a',
  sepia: '#a98467',
  neon: '#22d3ee',
  celeste: '#7dd3fc',
  'azul oscuro': '#1e3a5f',
  'azul pino': '#0f4c4c',
  'azul neon': '#38bdf8',
  'verde selva': '#166534',
  'verde militar': '#4d7c0f',
  'verde neon': '#39ff14',
  'verde oliva': '#6b7f3e',
  multicolor: '#a78bfa',
  cian: '#22d3ee',
  beige: '#e8dcc8',
  'amarillo neon': '#ffe14d',
}

function hashHue(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h) % 360
}

export function hexOf(color: string): string {
  const c = color.toLowerCase().trim()
  return HEX[c] ?? `hsl(${hashHue(c)} 65% 55%)`
}

export function primaryOf(entry: ThemeEntry): string {
  return entry.primary
}

export function isMultiColored(entry: ThemeEntry): boolean {
  const c = entry.colors.toLowerCase()
  return c.includes('multicolor') || c.includes('prisma') || entry.primary === 'multicolor'
}

export function hexToRgba2(hex: string, alpha: number): string {
  const h = hex.replace('#', '')
  const num = h.length === 3 ? h.split('').map((x) => x + x).join('') : h
  const bigint = parseInt(num, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function shade(hex: string, amt = 0.25): string {
  const h = hex.replace('#', '')
  const num = h.length === 3 ? h.split('').map((x) => x + x).join('') : h
  const bigint = parseInt(num, 16)
  const r = Math.max(0, Math.round(((bigint >> 16) & 255) * (1 - amt)))
  const g = Math.max(0, Math.round(((bigint >> 8) & 255) * (1 - amt)))
  const b = Math.max(0, Math.round((bigint & 255) * (1 - amt)))
  return `rgb(${r}, ${g}, ${b})`
}
