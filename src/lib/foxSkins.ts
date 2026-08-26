export type SkinCategory = 'normal' | 'halloween' | 'navidad' | 'musical'

export interface FoxSkin {
  id: string
  name: string
  image: string
  category: SkinCategory
  cost: number
}

export const FOX_SKINS: FoxSkin[] = [
  { id: 'idle', name: 'Fox Classic', image: '/fox (IdleDefault).png', category: 'normal', cost: 0 },
  { id: 'vaquero', name: 'Vaquero', image: '/fox (Vaquero).png', category: 'normal', cost: 100 },
  { id: 'astronauta', name: 'Astronauta', image: '/fox (Astronauta).png', category: 'normal', cost: 100 },
  { id: 'aventurero', name: 'Aventurero', image: '/fox (Aventurero).png', category: 'normal', cost: 100 },
  { id: 'bufon', name: 'Bufón', image: '/fox (Bufon).png', category: 'normal', cost: 100 },
  { id: 'caballero', name: 'Caballero', image: '/fox (Caballero).png', category: 'normal', cost: 100 },
  { id: 'chef', name: 'Chef', image: '/fox (Chef).png', category: 'normal', cost: 100 },
  { id: 'cyberpunk', name: 'Cyberpunk', image: '/fox (Cyberpunk).png', category: 'normal', cost: 100 },
  { id: 'dragon', name: 'Dragón', image: '/fox (Dragon).png', category: 'normal', cost: 100 },
  { id: 'fuego', name: 'Fuego', image: '/fox (Fuego).png', category: 'normal', cost: 100 },
  { id: 'gamer', name: 'Gamer', image: '/fox (Gamer).png', category: 'normal', cost: 100 },
  { id: 'gamer-retro', name: 'Gamer Retro', image: '/fox (Gamer retro).png', category: 'normal', cost: 100 },
  { id: 'graduado', name: 'Graduado', image: '/fox (Graduado).png', category: 'normal', cost: 100 },
  { id: 'kenji', name: 'Kenji', image: '/fox (Kenji).png', category: 'normal', cost: 100 },
  { id: 'mago', name: 'Mago', image: '/fox (Mago).png', category: 'normal', cost: 100 },
  { id: 'marinero', name: 'Marinero', image: '/fox (Marinero).png', category: 'normal', cost: 100 },
  { id: 'mecha', name: 'Mecha', image: '/fox (Mecha).png', category: 'normal', cost: 100 },
  { id: 'ninja', name: 'Ninja', image: '/fox (Ninja).png', category: 'normal', cost: 100 },
  { id: 'noir', name: 'Noir', image: '/fox (Noir).png', category: 'normal', cost: 100 },
  { id: 'pijama-bufon', name: 'Pijama Bufón', image: '/fox (Pijama bufon).png', category: 'normal', cost: 100 },
  { id: 'pirata', name: 'Pirata', image: '/fox (Pirata).png', category: 'normal', cost: 100 },
  { id: 'pixel', name: 'Pixel', image: '/fox (Pixel).png', category: 'normal', cost: 100 },
  { id: 'rey', name: 'Rey', image: '/fox (Rey).png', category: 'normal', cost: 100 },
  { id: 'samuray', name: 'Samurái', image: '/fox (Samuray).png', category: 'normal', cost: 100 },
  { id: 'super', name: 'Superhéroe', image: '/fox (Super).png', category: 'normal', cost: 100 },
  { id: 'surfista', name: 'Surfista', image: '/fox (Surfista).png', category: 'normal', cost: 100 },
  { id: 'vampiro', name: 'Vampiro', image: '/fox (Vampiro).png', category: 'halloween', cost: 150 },
  { id: 'fantasma', name: 'Fantasma', image: '/fox (Fantasma).png', category: 'halloween', cost: 150 },
  { id: 'zombie', name: 'Zombie', image: '/fox (Zombie).png', category: 'halloween', cost: 150 },
  { id: 'momia', name: 'Momia', image: '/fox (Momia).png', category: 'halloween', cost: 150 },
  { id: 'frank', name: 'Frankenstein', image: '/fox (Frank).png', category: 'halloween', cost: 150 },
  { id: 'reno', name: 'Reno', image: '/fox (Reno).png', category: 'navidad', cost: 150 },
  { id: 'duende', name: 'Duende', image: '/fox (Duende).png', category: 'navidad', cost: 150 },
  { id: 'muneco-nieve', name: 'Muñeco de Nieve', image: '/fox (Muneco de nieve).png', category: 'navidad', cost: 150 },
  { id: 'santa', name: 'Santa Claus', image: '/fox (Santa Claus).png', category: 'navidad', cost: 150 },
  { id: 'rock', name: 'Rock', image: '/fox (Rock).png', category: 'musical', cost: 120 },
  { id: 'regue', name: 'Reguetón', image: '/fox (Regue).png', category: 'musical', cost: 120 },
  { id: 'jazz', name: 'Jazz', image: '/fox (Jazz).png', category: 'musical', cost: 120 },
  { id: 'pop', name: 'Pop', image: '/fox (Pop).png', category: 'musical', cost: 120 },
]

export function getSkinById(id: string): FoxSkin | undefined {
  return FOX_SKINS.find((s) => s.id === id)
}

export function getDefaultSkin(): FoxSkin {
  return FOX_SKINS[0]
}

export function isSeasonallyAvailable(skin: FoxSkin): boolean {
  if (skin.category === 'normal') return true
  const month = new Date().getMonth()
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

export function getDailyRotation(): FoxSkin[] {
  const available = FOX_SKINS.filter(
    (s) => s.id !== 'idle' && isSeasonallyAvailable(s)
  )
  const today = new Date().toISOString().slice(0, 10)
  let seed = 0
  for (let i = 0; i < today.length; i++) {
    seed = ((seed << 5) - seed + today.charCodeAt(i)) | 0
  }
    const shuffled = [...available].sort(() => {
      seed = ((seed * 1103515245 + 12345) & 0x7fffffff)
      return ((seed / 0x7fffffff) - 0.5)
    })
  return shuffled.slice(0, 3)
}

export const COIN_PACKS = [
  { id: 'punado', name: 'Puñado', price: 4900, coins: 100, image: '/coins/punado.png' },
  { id: 'bolsa', name: 'Bolsa', price: 12900, coins: 350, bonus: 50, image: '/coins/bolsa.png' },
  { id: 'cosecha', name: 'Cosecha', price: 19900, coins: 650, bonus: 150, image: '/coins/cosecha.png' },
  { id: 'baul', name: 'Baúl', price: 39900, coins: 1500, bonus: 500, image: '/coins/baul.png' },
]
