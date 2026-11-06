export type SkinCategory = 'normal' | 'halloween' | 'navidad' | 'musical'

export interface FoxSkin {
  id: string
  name: string
  image: string
  category: SkinCategory
  cost: number
  rarity?: 'Básico' | 'Especial' | 'Raro' | 'Épico' | 'Demon' | 'Legendario' | 'Exclusivo'
}

export const FOX_SKINS: FoxSkin[] = [
  { id: 'idle', name: 'Fox Classic', image: '/fox/fox (IdleDefault).png', category: 'normal', cost: 0 },
  { id: 'vaquero', name: 'Vaquero', image: '/fox/fox (Vaquero).png', category: 'normal', cost: 100 },
  { id: 'astronauta', name: 'Astronauta', image: '/fox/fox (Astronauta).png', category: 'normal', cost: 100 },
  { id: 'aventurero', name: 'Aventurero', image: '/fox/fox (Aventurero).png', category: 'normal', cost: 100 },
  { id: 'bufon', name: 'Bufón', image: '/fox/fox (Bufon).png', category: 'normal', cost: 100 },
  { id: 'caballero', name: 'Caballero', image: '/fox/fox (Caballero).png', category: 'normal', cost: 100 },
  { id: 'chef', name: 'Chef', image: '/fox/fox (Chef).png', category: 'normal', cost: 100 },
  { id: 'cyberpunk', name: 'Cyberpunk', image: '/fox/fox (Cyberpunk).png', category: 'normal', cost: 100 },
  { id: 'dragon', name: 'Dragón', image: '/fox/fox (Dragon).png', category: 'normal', cost: 100 },
  { id: 'fuego', name: 'Fuego', image: '/fox/fox (Fuego).png', category: 'normal', cost: 100 },
  { id: 'gamer', name: 'Gamer', image: '/fox/fox (Gamer).png', category: 'normal', cost: 100 },
  { id: 'gamer-retro', name: 'Gamer Retro', image: '/fox/fox (Gamer retro).png', category: 'normal', cost: 100 },
  { id: 'graduado', name: 'en graduación', image: '/fox/fox-en-graduacion.png', category: 'normal', cost: 100 },
  { id: 'kenji', name: 'Kenji', image: '/fox/fox (Kenji).png', category: 'normal', cost: 100 },
  { id: 'mago', name: 'Mago', image: '/fox/fox (Mago).png', category: 'halloween', cost: 150 },
  { id: 'marinero', name: 'Marinero', image: '/fox/fox (Marinero).png', category: 'normal', cost: 100 },
  { id: 'mecha', name: 'Mecha', image: '/fox/fox (Mecha).png', category: 'normal', cost: 100 },
  { id: 'ninja', name: 'Ninja', image: '/fox/fox (Ninja).png', category: 'normal', cost: 100 },
  { id: 'noir', name: 'Noir', image: '/fox/fox (Noir).png', category: 'normal', cost: 100 },
  { id: 'pijama-bufon', name: 'Pijama Bufón', image: '/fox/fox (Pijama bufon).png', category: 'normal', cost: 100 },
  { id: 'pirata', name: 'Pirata', image: '/fox/fox (Pirata).png', category: 'normal', cost: 100 },
  { id: 'pixel', name: 'Pixel', image: '/fox/fox (Pixel).png', category: 'normal', cost: 100 },
  { id: 'rey', name: 'Rey', image: '/fox/fox (Rey).png', category: 'normal', cost: 100 },
  { id: 'samuray', name: 'Samurái', image: '/fox/fox (Samuray).png', category: 'normal', cost: 100 },
  { id: 'super', name: 'Superhéroe', image: '/fox/fox (Super).png', category: 'normal', cost: 100 },
  { id: 'surfista', name: 'Surfista', image: '/fox/fox (Surfista).png', category: 'normal', cost: 100 },
  { id: 'vampiro', name: 'Vampiro', image: '/fox/fox (Vampiro).png', category: 'halloween', cost: 150 },
  { id: 'fantasma', name: 'Fantasma', image: '/fox/fox (Fantasma).png', category: 'halloween', cost: 150 },
  { id: 'zombie', name: 'Zombie', image: '/fox/fox (Zombie).png', category: 'halloween', cost: 150 },
  { id: 'momia', name: 'Momia', image: '/fox/fox (Momia).png', category: 'halloween', cost: 150 },
  { id: 'frank', name: 'Frankenstein', image: '/fox/fox (Frank).png', category: 'halloween', cost: 150 },
  { id: 'reno', name: 'Reno', image: '/fox/fox (Reno).png', category: 'navidad', cost: 150 },
  { id: 'duende', name: 'Duende', image: '/fox/fox (Duende).png', category: 'navidad', cost: 150 },
  { id: 'muneco-nieve', name: 'de nieve', image: '/fox/fox-de-nieve.png', category: 'navidad', cost: 150 },
  { id: 'santa', name: 'Santa Claus', image: '/fox/fox (Santa Claus).png', category: 'navidad', cost: 150 },
  { id: 'rock', name: 'Rock', image: '/fox/fox (Rock).png', category: 'musical', cost: 120 },
  { id: 'regue', name: 'Reguetón', image: '/fox/fox (Regue).png', category: 'musical', cost: 120 },
  { id: 'jazz', name: 'Jazz', image: '/fox/fox (Jazz).png', category: 'musical', cost: 120 },
  { id: 'pop', name: 'Pop', image: '/fox/fox (Pop).png', category: 'musical', cost: 120 },
  { id: 'angel', name: 'Ángel', image: '/fox/fox (Angel).png', category: 'normal', cost: 270 },
  { id: 'baterista', name: 'Baterista', image: '/fox/fox (Baterista).png', category: 'normal', cost: 150 },
  { id: 'demonio', name: 'Demonio', image: '/fox/fox (Demonio).png', category: 'normal', cost: 270 },
  { id: 'dinosaurio', name: 'Dinosaurio', image: '/fox/fox (Dinosaurio).png', category: 'normal', cost: 200 },
  { id: 'emo', name: 'Emo', image: '/fox/fox (Emo).png', category: 'normal', cost: 150 },
  { id: 'escuchando-musica', name: 'Escuchando música', image: '/fox/fox (Escuchando música).png', category: 'normal', cost: 10 },
  { id: 'espiritual', name: 'Espiritual', image: '/fox/fox (Espiritual).png', category: 'normal', cost: 270 },
  { id: 'hippie', name: 'Hippie', image: '/fox/fox (Hippie).png', category: 'normal', cost: 120 },
  { id: 'militar', name: 'Militar', image: '/fox/fox (Militar).png', category: 'normal', cost: 120 },
  { id: 'plasma', name: 'Plasma', image: '/fox/fox (Plasma).png', category: 'normal', cost: 550 },
  { id: 'vikingo', name: 'Vikingo', image: '/fox/fox (Vikingo).png', category: 'normal', cost: 200 },
  { id: 'ciborg', name: 'Cíborg', image: '/fox/Zorro (Cíborg).png', category: 'normal', cost: 200 },
]

const FOX_RARITY: Record<string, FoxSkin['rarity']> = {
  vaquero: 'Raro', astronauta: 'Raro', aventurero: 'Especial', bufon: 'Épico',
  caballero: 'Demon', chef: 'Raro', cyberpunk: 'Épico', dragon: 'Épico', fuego: 'Demon',
  gamer: 'Raro', 'gamer-retro': 'Especial', graduado: 'Especial', kenji: 'Épico', mago: 'Básico',
  marinero: 'Especial', mecha: 'Raro', ninja: 'Épico', noir: 'Épico', 'pijama-bufon': 'Raro',
  pirata: 'Raro', pixel: 'Épico', rey: 'Demon', samuray: 'Demon', super: 'Raro', surfista: 'Raro',
  fantasma: 'Demon', vampiro: 'Demon', zombie: 'Demon', momia: 'Demon', frank: 'Demon',
  reno: 'Épico', duende: 'Épico', 'muneco-nieve': 'Épico', santa: 'Demon',
  rock: 'Épico', regue: 'Básico', jazz: 'Épico', pop: 'Especial',
  angel: 'Demon', baterista: 'Raro', demonio: 'Demon', dinosaurio: 'Épico', emo: 'Raro',
  'escuchando-musica': 'Básico', espiritual: 'Demon', hippie: 'Especial', militar: 'Especial',
  plasma: 'Legendario', vikingo: 'Épico', ciborg: 'Épico',
}
const RARITY_PRICE: Record<NonNullable<FoxSkin['rarity']>, number> = {
  Básico: 10, Especial: 120, Raro: 150, Épico: 200, Demon: 270, Legendario: 550, Exclusivo: 1000,
}
for (const skin of FOX_SKINS) {
  skin.name = skin.id === 'idle' ? 'Fox clásico' : skin.id === 'graduado' ? 'Fox en graduación' : skin.id === 'muneco-nieve' ? 'Fox de nieve' : `Fox ${skin.name}`
  const rarity = FOX_RARITY[skin.id] ?? 'Raro'
  skin.rarity = rarity
  skin.cost = skin.id === 'idle' ? 0 : RARITY_PRICE[rarity]
}

export function getSkinById(id: string): FoxSkin | undefined {
  return FOX_SKINS.find((s) => s.id === id)
}

export function getDefaultSkin(): FoxSkin {
  return FOX_SKINS[0]
}

export function isSeasonallyAvailable(skin: FoxSkin, at = new Date()): boolean {
  if (skin.category === 'normal') return true
  const month = at.getMonth()
  if (skin.category === 'halloween') return month === 9
  if (skin.category === 'navidad') return month === 11
  if (skin.category === 'musical') return month % 2 === 0
  return false
}

export function getSeasonalPack(): SkinCategory | null {
  const month = new Date().getMonth()
  if (month === 9) return 'halloween'
  if (month === 11) return 'navidad'
  if (month % 2 === 0) return 'musical'
  return null
}

export function getDailyRotation(at = new Date()): FoxSkin[] {
  const available = FOX_SKINS.filter(
    (s) => s.id !== 'idle' && isSeasonallyAvailable(s, at)
  )
  return getDailySelection(available, 'fox', 4, at)
}

export function getDailySelection<T extends { id: string; rarity?: FoxSkin['rarity'] }>(items: readonly T[], collection: string, count = 4, at = new Date()): T[] {
  if (items.length <= count) return [...items]
  const day = `${at.getFullYear()}-${at.getMonth() + 1}-${at.getDate()}`
  const seedText = `${day}:${collection}`
  let seed = 2166136261
  for (let i = 0; i < seedText.length; i++) seed = Math.imul(seed ^ seedText.charCodeAt(i), 16777619) >>> 0
  const weights: Record<string, number> = { Básico: 100, Especial: 65, Raro: 24, Épico: 7, Demon: 2, Legendario: 0.08, Exclusivo: 0.0000000001 }
  const remaining = [...items]
  const chosen: T[] = []
  while (chosen.length < count && remaining.length) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const total = remaining.reduce((sum, item) => sum + (weights[item.rarity ?? 'Raro'] ?? 24), 0)
    let pick = (seed / 0x100000000) * total
    let index = 0
    for (; index < remaining.length - 1; index++) {
      pick -= weights[remaining[index].rarity ?? 'Raro'] ?? 24
      if (pick < 0) break
    }
    chosen.push(remaining.splice(index, 1)[0])
  }
  return chosen
}

export const COIN_PACKS = [
  { id: 'punado', name: 'Puñado', price: 4900, coins: 100, image: '/coins/punado.png' },
  { id: 'bolsa', name: 'Bolsa', price: 12900, coins: 350, bonus: 50, image: '/coins/bolsa.png' },
  { id: 'cosecha', name: 'Cosecha', price: 19900, coins: 650, bonus: 150, image: '/coins/cosecha.png' },
  { id: 'baul', name: 'Baúl', price: 39900, coins: 1500, bonus: 500, image: '/coins/baul.png' },
]
