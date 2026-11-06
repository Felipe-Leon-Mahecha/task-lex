import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const FOX_RARITY: Record<string, string> = {
  vaquero: 'Raro', astronauta: 'Raro', aventurero: 'Especial', bufon: 'Épico', caballero: 'Demon',
  chef: 'Raro', cyberpunk: 'Épico', dragon: 'Épico', fuego: 'Demon', gamer: 'Raro', 'gamer-retro': 'Especial',
  graduado: 'Especial', kenji: 'Épico', mago: 'Básico', marinero: 'Especial', mecha: 'Raro', ninja: 'Épico',
  noir: 'Épico', 'pijama-bufon': 'Raro', pirata: 'Raro', pixel: 'Épico', rey: 'Demon', samuray: 'Demon',
  super: 'Raro', surfista: 'Raro', fantasma: 'Demon', vampiro: 'Demon', zombie: 'Demon', momia: 'Demon',
  frank: 'Demon', reno: 'Épico', duende: 'Épico', 'muneco-nieve': 'Épico', santa: 'Demon', rock: 'Épico',
  regue: 'Básico', jazz: 'Épico', pop: 'Especial',
  angel: 'Demon', baterista: 'Raro', demonio: 'Demon', dinosaurio: 'Épico', emo: 'Raro',
  'escuchando-musica': 'Básico', espiritual: 'Demon', hippie: 'Especial', militar: 'Especial',
  plasma: 'Legendario', vikingo: 'Épico', ciborg: 'Épico',
}
const FOX_PRICE_BY_RARITY: Record<string, number> = { Básico: 10, Especial: 120, Raro: 150, Épico: 200, Demon: 270, Legendario: 550, Exclusivo: 1000 }
const FOX_PRICES: Record<string, number> = Object.fromEntries(Object.entries(FOX_RARITY).map(([id, rarity]) => [id, FOX_PRICE_BY_RARITY[rarity] ?? 150]))
const DUCK_PRICES: Record<string, number> = {
  'angry-duck': 120, 'dinosaurio-pato': 200, multipato: 150, 'patito-cool': 120,
  'patito-dragon': 270, 'patito-esponjoso': 200, 'patito-kawaii': 150, 'patito-playero': 120,
  'patito-rey': 270, 'pato-animatronico': 550, 'pato-baterista': 120, 'pato-buceador': 150,
  'pato-caballero': 270, 'pato-camarografo': 200, 'pato-ciborg': 200, 'pato-clasico': 10,
  'pato-de-los-80s': 200, 'pato-de-plasma': 270, 'pato-de-tinta': 550, 'pato-demon': 550,
  'pato-gloton': 120, 'pato-jax': 550, 'pato-jazz': 200, 'pato-luchador': 150,
  'pato-ninja': 200, 'pato-papa': 150, 'pato-pixel': 150, 'pato-pop': 120,
  'pato-robot-futurista': 200, 'pato-rockero': 200, 'pato-soldado': 150,
  'pato-urbano': 10, 'pato-vikingo': 150, glitch: 1000,
  'pato-angel': 550, 'pato-de-nieve': 200, 'pato-de-hule': 270, 'pato-dormilon': 120, 'pato-en-huevo': 120,
}
const DUCK_SEASONAL_MONTH: Record<string, number> = { 'pato-de-nieve': 11 }
const DUCK_RARITY: Record<string, string> = Object.fromEntries(Object.entries(DUCK_PRICES).map(([id, price]) => [id, ({ 10: 'Básico', 120: 'Especial', 150: 'Raro', 200: 'Épico', 270: 'Demon', 550: 'Legendario', 1000: 'Exclusivo' } as Record<number, string>)[price]]))
const DAILY_WEIGHTS: Record<string, number> = { Básico: 100, Especial: 65, Raro: 24, Épico: 7, Demon: 2, Legendario: 0.08, Exclusivo: 0.0000000001 }
const ACHIEVEMENT_REWARDS: Record<string, number> = {
  primera: 10, diez: 15, cincuenta: 40, cien: 80, quinientos: 200, racha3: 20,
  racha7: 300, racha14: 400, racha21: 500, racha30: 500, dia10: 30, dia20: 70,
  foco60: 15, foco600: 60, foco3000: 250, 'diez-dias': 40, 'treinta-dias': 100,
  'cien-dias': 250, dia5: 20, 'racha4-semanas': 500, racha50: 700, racha100: 1200,
  foco150: 25, foco1200: 100, foco10000: 500, dia30: 120, mil: 500, dosmil: 1000,
  'cazador-aracnido': 60, 'fantasma-aplastador': 0,
}
const ACHIEVEMENT_SKIN_REWARDS: Record<string, string> = { 'fantasma-aplastador': 'fantasma' }
const STANDARD_ACHIEVEMENT_IDS = Object.keys(ACHIEVEMENT_REWARDS).filter((id) => id !== 'cazador-aracnido' && id !== 'fantasma-aplastador')

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = getFirestore()

async function principalFromAuthHeader(req: any): Promise<{ uid: string; email: string; emailVerified: boolean } | null> {
  const match = String(req.headers?.authorization ?? '').match(/^Bearer (.+)$/)
  if (!match) return null
  try {
    const decoded = await getAuth().verifyIdToken(match[1])
    return {
      uid: decoded.uid,
      email: String(decoded.email ?? '').trim().toLowerCase(),
      emailVerified: decoded.email_verified === true,
    }
  } catch {
    return null
  }
}

function todayKey() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(new Date())
}

function dayKeyFor(date: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Bogota' }).format(date)
}

function bogotaDate() {
  const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Bogota', year: 'numeric', month: 'numeric', day: 'numeric' }).formatToParts(new Date())
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value)
  return new Date(Date.UTC(get('year'), get('month') - 1, get('day')))
}

function pickDaily<T extends { id: string; rarity: string }>(items: T[], collection: string, count: number, date: Date): T[] {
  const y = date.getUTCFullYear(), m = date.getUTCMonth() + 1, d = date.getUTCDate()
  const seedText = `${y}-${m}-${d}:${collection}`
  let seed = 2166136261
  for (const char of seedText) seed = Math.imul(seed ^ char.charCodeAt(0), 16777619) >>> 0
  const remaining = [...items]
  const chosen: T[] = []
  while (chosen.length < count && remaining.length) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    const total = remaining.reduce((sum, item) => sum + (DAILY_WEIGHTS[item.rarity] ?? 24), 0)
    let pick = (seed / 0x100000000) * total
    let index = 0
    for (; index < remaining.length - 1; index++) {
      pick -= DAILY_WEIGHTS[remaining[index].rarity] ?? 24
      if (pick < 0) break
    }
    chosen.push(remaining.splice(index, 1)[0])
  }
  return chosen
}

function easterSunday(year: number) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451)
  return new Date(Date.UTC(year, Math.floor((h + l - 7 * m + 114) / 31) - 1, ((h + l - 7 * m + 114) % 31) + 1))
}

function holidayDays(year: number) {
  const days = new Set<string>()
  const add = (date: Date, mondayTransfer = false) => {
    const moved = new Date(date)
    if (mondayTransfer && moved.getUTCDay() !== 1) moved.setUTCDate(moved.getUTCDate() + ((8 - moved.getUTCDay()) % 7))
    days.add(`${moved.getUTCFullYear()}-${moved.getUTCMonth()}-${moved.getUTCDate()}`)
  }
  for (const [month, day] of [[0, 1], [4, 1], [6, 20], [7, 7], [11, 8], [11, 25]]) add(new Date(Date.UTC(year, month, day)))
  for (const [month, day] of [[0, 6], [2, 19], [5, 29], [7, 15], [9, 12], [10, 1], [10, 11]]) add(new Date(Date.UTC(year, month, day)), true)
  const easter = easterSunday(year)
  for (const offset of [-3, -2, 43, 64, 71]) { const date = new Date(easter); date.setUTCDate(date.getUTCDate() + offset); add(date, offset > 0) }
  return days
}

function weekendDiscount(items: { id: string }[], date: Date) {
  if (!items.length) return null
  const dow = date.getUTCDay(), holidays = holidayDays(date.getUTCFullYear())
  const key = (day: Date) => `${day.getUTCFullYear()}-${day.getUTCMonth()}-${day.getUTCDate()}`
  const friday = new Date(date); friday.setUTCDate(date.getUTCDate() - ((dow + 2) % 7))
  const saturday = new Date(date); saturday.setUTCDate(date.getUTCDate() - ((dow + 1) % 7))
  let start: Date, end: Date
  const fridayHoliday = holidays.has(key(friday)), monday = new Date(saturday); monday.setUTCDate(saturday.getUTCDate() + 2)
  const mondayHoliday = holidays.has(key(monday))
  if (dow === 5 && fridayHoliday) { start = new Date(friday); end = new Date(friday); end.setUTCDate(end.getUTCDate() + 2) }
  else if (dow === 6 || dow === 0) { start = fridayHoliday ? new Date(friday) : new Date(saturday); end = new Date(saturday); end.setUTCDate(end.getUTCDate() + (mondayHoliday ? 2 : 1)) }
  else if (dow === 1 && mondayHoliday) { start = new Date(saturday); end = new Date(monday) }
  else return null
  if (date < start || date > end) return null
  const period = key(start)
  let seed = 0
  for (const char of period) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0
  return { skinId: items[seed % items.length].id, percent: [10, 15, 20, 25, 30, 40][(seed >>> 8) % 6] }
}

function validStorePrice(kind: string, itemId: string, basePrice: number, offeredPrice: unknown) {
  const date = bogotaDate()
  const month = date.getUTCMonth()
  const foxItems = Object.keys(FOX_PRICES).filter((id) => id !== 'idle').filter((id) => {
    if (['mago', 'vampiro', 'fantasma', 'zombie', 'momia', 'frank'].includes(id)) return month === 9
    if (['reno', 'duende', 'muneco-nieve', 'santa'].includes(id)) return month === 11
    if (['rock', 'regue', 'jazz', 'pop'].includes(id)) return month % 2 === 0
    return true
  }).map((id) => ({ id, rarity: FOX_RARITY[id] ?? 'Raro' }))
  const duckItems = Object.keys(DUCK_PRICES).filter((id) => DUCK_SEASONAL_MONTH[id] === undefined || DUCK_SEASONAL_MONTH[id] === month).map((id) => ({ id, rarity: DUCK_RARITY[id] ?? 'Raro' }))
  const daily = kind === 'fox' ? pickDaily(foxItems, 'fox', 4, date) : kind === 'duck' ? pickDaily(duckItems, 'quackington', 5, date) : []
  if (!daily.some((item) => item.id === itemId)) return false
  const sale = weekendDiscount(daily, date)
  const expected = sale?.skinId === itemId ? Math.round(basePrice * (100 - sale.percent) / 100) : basePrice
  return offeredPrice === undefined || offeredPrice === expected
}

async function achievementIsEarned(uid: string, id: string): Promise<boolean> {
  const userRef = db.collection('users').doc(uid)
  if (id === 'cazador-aracnido' || id === 'fantasma-aplastador') {
    const wallet = await userRef.collection('foxSkins').doc('data').get()
    const now = bogotaDate()
    if (now.getUTCFullYear() !== 2026 || now.getUTCMonth() !== 9) return false
    const count = Number(wallet.data()?.halloween2026SpiderCrushes ?? 0)
    return id === 'cazador-aracnido' ? count >= 10 : count >= 50
  }
  const [tasksSnap, focusSnap] = await Promise.all([
    userRef.collection('tasks').where('status', '==', 'done').get(),
    userRef.collection('focus').doc('focus').get(),
  ])
  const days = new Map<string, number>()
  for (const task of tasksSnap.docs) {
    const value = task.data().completedAt
    const completed = value instanceof Date ? value : typeof value === 'string' ? new Date(value) : value?.toDate?.()
    if (!(completed instanceof Date) || !Number.isFinite(completed.getTime()) || completed.getTime() > Date.now() + 60000) continue
    const key = dayKeyFor(completed)
    days.set(key, (days.get(key) ?? 0) + 1)
  }
  const totalCompleted = [...days.values()].reduce((sum, count) => sum + count, 0)
  const bestDayCount = Math.max(0, ...days.values())
  let cursor = bogotaDate()
  if (!days.has(dayKeyFor(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1)
  let streakDays = 0
  while (days.has(dayKeyFor(cursor))) { streakDays++; cursor.setUTCDate(cursor.getUTCDate() - 1) }
  const focusEntries = focusSnap.data()?.entries
  const focusMinutes = Array.isArray(focusEntries)
    ? focusEntries.reduce((sum: number, entry: any) => sum + (typeof entry?.min === 'number' && Number.isFinite(entry.min) ? Math.max(0, entry.min) : 0), 0)
    : 0
  const daysActive = days.size
  const checks: Record<string, boolean> = {
    primera: totalCompleted >= 1, diez: totalCompleted >= 10, cincuenta: totalCompleted >= 50,
    cien: totalCompleted >= 100, quinientos: totalCompleted >= 500, racha3: streakDays >= 3,
    racha7: streakDays >= 7, racha14: streakDays >= 14, racha21: streakDays >= 21,
    racha30: streakDays >= 30, dia10: bestDayCount >= 10, dia20: bestDayCount >= 20,
    foco60: focusMinutes >= 60, foco600: focusMinutes >= 600, foco3000: focusMinutes >= 3000,
    'diez-dias': daysActive >= 10, 'treinta-dias': daysActive >= 30, 'cien-dias': daysActive >= 100,
    dia5: bestDayCount >= 5, 'racha4-semanas': streakDays >= 28, racha50: streakDays >= 50,
    racha100: streakDays >= 100, foco150: focusMinutes >= 150, foco1200: focusMinutes >= 1200,
    foco10000: focusMinutes >= 10000, dia30: bestDayCount >= 30, mil: totalCompleted >= 1000,
    dosmil: totalCompleted >= 2000,
  }
  return checks[id] === true
}

function initialWallet() {
  return {
    coins: 0,
    spiderCrushes: 0,
    equipped: 'idle',
    unlocked: ['idle'],
    premium: false,
    premiumUntil: null,
    themeUnlocked: false,
    pet: 'fox',
    quackingtonOwned: false,
    quackingtonSkin: 'animado',
    quackingtonSkinsUnlocked: ['animado'],
    favoriteFoxSkins: [],
    favoriteQuackingtonSkins: [],
  }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const principal = await principalFromAuthHeader(req)
  if (!principal) return res.status(401).json({ error: 'Inicia sesión para continuar.' })
  const uid = principal.uid
  const owner = principal.email.trim().toLowerCase() === 'fmleonm19@gmail.com' && principal.emailVerified
  const { action, kind, itemId, taskId, achievementId, price: clientPrice } = req.body ?? {}
  const walletRef = db.collection('users').doc(uid).collection('foxSkins').doc('data')

  try {
    if (action === 'initialize') {
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(walletRef)
        if (!snap.exists) tx.create(walletRef, initialWallet())
      })
      const snap = await walletRef.get()
      return res.status(200).json({ ok: true, wallet: snap.data() ?? initialWallet() })
    }

    if (action === 'cosmetic') {
      const changes = req.body?.changes
      if (!changes || typeof changes !== 'object' || Array.isArray(changes)) return res.status(400).json({ error: 'Cambios inválidos.' })
      const allowed = new Set(['equipped', 'pet', 'quackingtonSkin', 'favoriteFoxSkins', 'favoriteQuackingtonSkins'])
      if (Object.keys(changes).length === 0 || Object.keys(changes).some((key) => !allowed.has(key))) return res.status(400).json({ error: 'Cambio no permitido.' })
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(walletRef)
        const data = snap.data() ?? initialWallet()
        const patch: Record<string, unknown> = {}
        if (changes.equipped !== undefined) {
          if (typeof changes.equipped !== 'string' || !(data.unlocked ?? ['idle']).includes(changes.equipped)) throw new Error('skin_not_owned')
          patch.equipped = changes.equipped
        }
        if (changes.pet !== undefined) {
          if (changes.pet !== 'fox' && changes.pet !== 'quackington') throw new Error('pet_not_owned')
          if (changes.pet === 'quackington' && !owner && !data.quackingtonOwned) throw new Error('pet_not_owned')
          patch.pet = changes.pet
        }
        if (changes.quackingtonSkin !== undefined) {
          if (typeof changes.quackingtonSkin !== 'string' || !(data.quackingtonSkinsUnlocked ?? ['animado']).includes(changes.quackingtonSkin) || (!owner && !data.quackingtonOwned)) throw new Error('skin_not_owned')
          patch.quackingtonSkin = changes.quackingtonSkin
        }
        for (const [field, value] of [['favoriteFoxSkins', changes.favoriteFoxSkins], ['favoriteQuackingtonSkins', changes.favoriteQuackingtonSkins]] as const) {
          if (value === undefined) continue
          if (!Array.isArray(value) || value.length > 100 || value.some((id) => typeof id !== 'string' || id.length > 80)) throw new Error('invalid_favorites')
          patch[field] = [...new Set(value)]
        }
        tx.set(walletRef, patch, { merge: true })
      })
      return res.status(200).json({ ok: true })
    }

    if (action === 'equip') {
      if (kind !== 'fox' && kind !== 'duck') return res.status(400).json({ error: 'Mascota inválida.' })
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(walletRef)
        const data = snap.data() ?? initialWallet()
        if (kind === 'fox') {
          if (!data.unlocked?.includes(itemId)) throw new Error('skin_not_owned')
          tx.set(walletRef, { equipped: itemId }, { merge: true })
        } else {
          if ((!owner && !data.quackingtonOwned) || !data.quackingtonSkinsUnlocked?.includes(itemId)) throw new Error('skin_not_owned')
          tx.set(walletRef, { pet: 'quackington', quackingtonSkin: itemId }, { merge: true })
        }
      })
      return res.status(200).json({ ok: true })
    }

    if (action === 'select-pet') {
      if (itemId !== 'fox' && itemId !== 'quackington') return res.status(400).json({ error: 'Mascota inválida.' })
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(walletRef)
        const data = snap.data() ?? initialWallet()
        if (itemId === 'quackington' && !owner && !data.quackingtonOwned) throw new Error('pet_not_owned')
        tx.set(walletRef, { pet: itemId }, { merge: true })
      })
      return res.status(200).json({ ok: true })
    }

    if (action === 'favorite') {
      if (kind !== 'fox' && kind !== 'duck') return res.status(400).json({ error: 'Mascota inválida.' })
      if (typeof itemId !== 'string' || itemId.length > 80) return res.status(400).json({ error: 'Skin inválida.' })
      const field = kind === 'fox' ? 'favoriteFoxSkins' : 'favoriteQuackingtonSkins'
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(walletRef)
        const data = snap.data() ?? initialWallet()
        const favorites: string[] = Array.isArray(data[field]) ? data[field] : []
        const next = favorites.includes(itemId) ? favorites.filter((id) => id !== itemId) : [...favorites, itemId].slice(-100)
        tx.set(walletRef, { [field]: next }, { merge: true })
      })
      return res.status(200).json({ ok: true })
    }

    if (action === 'spider-crush') {
      let count = 0
      let seasonCount = 0
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(walletRef)
        const data = snap.data() ?? initialWallet()
        const now = Date.now()
        const lastAt = typeof data.lastSpiderCrushAt === 'number' ? data.lastSpiderCrushAt : 0
        if (now - lastAt < 850) throw new Error('spider_rate')
        const day = todayKey()
        const todayCount = data.spiderCrushDay === day && typeof data.spiderCrushesToday === 'number' ? data.spiderCrushesToday : 0
        if (todayCount >= 100) throw new Error('spider_daily_cap')
        count = (typeof data.spiderCrushes === 'number' ? data.spiderCrushes : 0) + 1
        const current = bogotaDate()
        const inHalloween2026 = current.getUTCFullYear() === 2026 && current.getUTCMonth() === 9
        const existingSeasonCount = typeof data.halloween2026SpiderCrushes === 'number'
          ? data.halloween2026SpiderCrushes
          : 0
        seasonCount = inHalloween2026 ? existingSeasonCount + 1 : existingSeasonCount
        tx.set(walletRef, {
          spiderCrushes: count,
          ...(inHalloween2026 ? { halloween2026SpiderCrushes: seasonCount } : {}),
          lastSpiderCrushAt: now,
          spiderCrushDay: day,
          spiderCrushesToday: todayCount + 1,
        }, { merge: true })
      })
      return res.status(200).json({ ok: true, count, seasonCount })
    }

    if (action === 'purchase') {
      if (!['fox', 'duck', 'quackington', 'theme'].includes(kind)) return res.status(400).json({ error: 'Compra inválida.' })
      const price = kind === 'fox' ? FOX_PRICES[itemId] : kind === 'duck' ? DUCK_PRICES[itemId] : kind === 'quackington' ? 1000 : 500
      if (typeof price !== 'number') return res.status(400).json({ error: 'Artículo inválido.' })
      if ((kind === 'fox' || kind === 'duck') && !validStorePrice(kind, itemId, price, clientPrice)) return res.status(409).json({ error: 'El precio de la oferta cambió. Actualiza la tienda e inténtalo de nuevo.' })
      const charge = (kind === 'fox' || kind === 'duck') && typeof clientPrice === 'number' ? clientPrice : price
      let coins = 0
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(walletRef)
        const data = snap.data() ?? initialWallet()
        const unlocked: string[] = Array.isArray(data.unlocked) ? data.unlocked : ['idle']
        const ducks: string[] = Array.isArray(data.quackingtonSkinsUnlocked) ? data.quackingtonSkinsUnlocked : ['animado']
        const alreadyOwned = kind === 'fox' ? unlocked.includes(itemId) : kind === 'duck' ? ducks.includes(itemId) : kind === 'quackington' ? !!data.quackingtonOwned : !!data.themeUnlocked
        if (alreadyOwned) throw new Error('already_owned')
        coins = typeof data.coins === 'number' ? data.coins : 0
        if (!owner && coins < charge) throw new Error('insufficient_coins')
        const next: Record<string, unknown> = owner ? {} : { coins: coins - charge }
        if (kind === 'fox') Object.assign(next, { unlocked: FieldValue.arrayUnion(itemId), equipped: itemId })
        if (kind === 'duck') Object.assign(next, { quackingtonSkinsUnlocked: FieldValue.arrayUnion(itemId), quackingtonSkin: itemId })
        if (kind === 'quackington') Object.assign(next, { quackingtonOwned: true, pet: 'quackington' })
        if (kind === 'theme') next.themeUnlocked = true
        tx.set(walletRef, next, { merge: true })
      })
      const updated = await walletRef.get()
      return res.status(200).json({ ok: true, wallet: updated.data(), price: charge })
    }

    if (action === 'season-odds-purchase') {
      const themeId = req.body?.themeId
      const month = Number(req.body?.month)
      const year = Number(req.body?.year)
      const period = `${year}-${month}`
      const now = bogotaDate()
      if (typeof themeId !== 'string' || !/^[a-z0-9-]{1,80}$/.test(themeId)) return res.status(400).json({ error: 'Tema inválido.' })
      if (now.getUTCFullYear() !== year || now.getUTCMonth() + 1 !== month) throw new Error('odds_period')
      const seasonsRef = db.collection('users').doc(uid).collection('seasons').doc('data')
      let monthlyOdds: Record<string, any> | null = null
      let price = 0
      await db.runTransaction(async (tx) => {
        const [walletSnap, seasonsSnap] = await Promise.all([tx.get(walletRef), tx.get(seasonsRef)])
        const wallet = walletSnap.data() ?? initialWallet()
        const seasonData = seasonsSnap.data() ?? {}
        const activeSeason = seasonData.current
        if (activeSeason?.year === year && activeSeason?.month === month && activeSeason?.confirmed !== false) throw new Error('odds_closed')
        if (activeSeason?.year === year && activeSeason?.month === month && now.getUTCDate() > 3) throw new Error('odds_closed')
        const stored = seasonData.monthlyOdds
        let odds = stored?.period === period && stored?.baseScores && typeof stored.baseScores === 'object'
          ? stored
          : null
        if (!odds) {
          const submittedBase = req.body?.baseScores
          const validBase = submittedBase && typeof submittedBase === 'object' && !Array.isArray(submittedBase) &&
            Object.keys(submittedBase).length > 0 && Object.keys(submittedBase).length <= 250 &&
            Object.values(submittedBase).every((score) => typeof score === 'number' && Number.isFinite(score) && score >= 1 && score <= 200)
          if (!validBase || !Object.hasOwn(submittedBase, themeId)) throw new Error('odds_period')
          odds = { period, baseScores: submittedBase, boosts: {}, contributions: {} }
        }
        if (typeof odds.baseScores[themeId] !== 'number') throw new Error('odds_theme')
        const contributions = odds.contributions && typeof odds.contributions === 'object' ? odds.contributions : {}
        const boosts = odds.boosts && typeof odds.boosts === 'object' ? odds.boosts : {}
        const count = Math.min(1000, Math.max(0, Math.floor(Number(contributions[themeId]) || 0)))
        price = count < 3 ? 50 + count * 20 : 90 + (count - 2) * 40
        const coins = typeof wallet.coins === 'number' ? wallet.coins : 0
        if (!owner && coins < price) throw new Error('insufficient_coins')
        monthlyOdds = {
          period,
          baseScores: odds.baseScores,
          boosts: { ...boosts, [themeId]: (Number(boosts[themeId]) || 0) + price * 4 },
          contributions: { ...contributions, [themeId]: count + 1 },
        }
        tx.set(walletRef, owner ? {} : { coins: coins - price }, { merge: true })
        tx.set(seasonsRef, { monthlyOdds }, { merge: true })
      })
      const updatedWallet = await walletRef.get()
      return res.status(200).json({ ok: true, wallet: updatedWallet.data() ?? initialWallet(), monthlyOdds, price })
    }

    if (action === 'reward-task' || action === 'reward-focus') {
      const day = todayKey()
      if (action === 'reward-task' && (typeof taskId !== 'string' || taskId.length < 1 || taskId.length > 160)) return res.status(400).json({ error: 'Tarea inválida.' })
      let earned = 0
      let capped = false
      await db.runTransaction(async (tx) => {
        earned = 0
        capped = false
        const walletSnap = await tx.get(walletRef)
        const data = walletSnap.data() ?? initialWallet()
        const sameDay = data.lastRewardDate === day
        const taskCount = sameDay && typeof data.dailyTaskCount === 'number' ? data.dailyTaskCount : 0
        const focusCount = sameDay && typeof data.dailyFocusCount === 'number' ? data.dailyFocusCount : 0
        const ids: string[] = sameDay && Array.isArray(data.dailyTaskIds) ? data.dailyTaskIds : []
        if (action === 'reward-task') {
          if (ids.includes(taskId)) { capped = true; return }
          if (taskCount >= 5) { capped = true; return }
          earned = 5
          tx.set(walletRef, {
            coins: (typeof data.coins === 'number' ? data.coins : 0) + earned,
            lastRewardDate: day,
            dailyTaskCount: taskCount + 1,
            dailyFocusCount: focusCount,
            dailyTaskIds: FieldValue.arrayUnion(taskId),
          }, { merge: true })
        } else {
          if (focusCount >= 3) { capped = true; return }
          earned = 10
          tx.set(walletRef, {
            coins: (typeof data.coins === 'number' ? data.coins : 0) + earned,
            lastRewardDate: day,
            dailyTaskCount: taskCount,
            dailyFocusCount: focusCount + 1,
            dailyTaskIds: ids,
          }, { merge: true })
        }
      })
      const updated = await walletRef.get()
      return res.status(200).json({ ok: true, earned, capped, coins: updated.data()?.coins ?? 0 })
    }

    if (action === 'claim-achievement') {
      if (typeof achievementId !== 'string' || !Object.hasOwn(ACHIEVEMENT_REWARDS, achievementId)) return res.status(400).json({ error: 'Logro inválido.' })
      if (!(await achievementIsEarned(uid, achievementId))) return res.status(403).json({ error: 'Aún no cumples los requisitos de este logro.' })
      let claimed = false
      const reward = ACHIEVEMENT_REWARDS[achievementId]
      await db.runTransaction(async (tx) => {
        claimed = false
        const walletSnap = await tx.get(walletRef)
        const data = walletSnap.data() ?? initialWallet()
        const claimedIds: string[] = Array.isArray(data.achievementClaims) ? data.achievementClaims : []
        if (claimedIds.includes(achievementId)) return
        tx.set(walletRef, {
          coins: (typeof data.coins === 'number' ? data.coins : 0) + reward,
          achievementClaims: FieldValue.arrayUnion(achievementId),
          ...(ACHIEVEMENT_SKIN_REWARDS[achievementId] ? { unlocked: FieldValue.arrayUnion(ACHIEVEMENT_SKIN_REWARDS[achievementId]) } : {}),
        }, { merge: true })
        claimed = true
      })
      const updated = await walletRef.get()
      return res.status(200).json({ ok: true, claimed, reward: claimed ? reward : 0, coins: updated.data()?.coins ?? 0, wallet: updated.data() ?? {} })
    }

    if (action === 'claim-windows-welcome') {
      let claimed = false
      await db.runTransaction(async (tx) => {
        claimed = false
        const walletSnap = await tx.get(walletRef)
        const data = walletSnap.data() ?? initialWallet()
        if (data.windowsWelcomeRewardClaimed === true) return
        tx.set(walletRef, {
          coins: (typeof data.coins === 'number' ? data.coins : 0) + 500,
          windowsWelcomeRewardClaimed: true,
          windowsWelcomeRewardClaimedAt: FieldValue.serverTimestamp(),
        }, { merge: true })
        claimed = true
      })
      const updated = await walletRef.get()
      return res.status(200).json({ ok: true, claimed, reward: claimed ? 500 : 0, coins: updated.data()?.coins ?? 0, wallet: updated.data() ?? {} })
    }

    if (action === 'claim-milestone') {
      if (!['pato-plateado', 'pato-dorado', 'pato-prisma'].includes(itemId)) return res.status(400).json({ error: 'Premio inválido.' })
      let claimed = false
      await db.runTransaction(async (tx) => {
        claimed = false
        const walletSnap = await tx.get(walletRef)
        const data = walletSnap.data() ?? initialWallet()
        const milestoneClaims: string[] = Array.isArray(data.milestoneClaims) ? data.milestoneClaims : []
        if (milestoneClaims.includes(itemId)) return
        const achievementClaims: string[] = Array.isArray(data.achievementClaims) ? data.achievementClaims : []
        const claimCount = achievementClaims.filter((id) => STANDARD_ACHIEVEMENT_IDS.includes(id)).length
        const unlockedDucks: string[] = Array.isArray(data.quackingtonSkinsUnlocked) ? data.quackingtonSkinsUnlocked : ['animado']
        if (itemId === 'pato-plateado' && claimCount < Math.ceil(STANDARD_ACHIEVEMENT_IDS.length / 2)) throw new Error('milestone_locked')
        if (itemId === 'pato-dorado' && claimCount < STANDARD_ACHIEVEMENT_IDS.length) throw new Error('milestone_locked')
        if (itemId === 'pato-prisma' && Object.keys(DUCK_PRICES).some((id) => !unlockedDucks.includes(id))) throw new Error('milestone_locked')
        const patch: Record<string, unknown> = {
          quackingtonSkinsUnlocked: FieldValue.arrayUnion(itemId),
          quackingtonSkin: itemId,
          milestoneClaims: FieldValue.arrayUnion(itemId),
          ...(data.quackingtonOwned ? { pet: 'quackington' } : {}),
        }
        if (itemId === 'pato-dorado') {
          const pool = Object.keys(DUCK_PRICES).filter((id) => !unlockedDucks.includes(id))
          const selected: string[] = []
          while (pool.length > 0 && selected.length < 3) selected.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0])
          if (selected.length) patch.quackingtonSkinsUnlocked = FieldValue.arrayUnion(itemId, ...selected)
          patch.premium = true
          patch.premiumUntil = Math.max(Date.now(), typeof data.premiumUntil === 'number' ? data.premiumUntil : 0) + 60 * 86400000
        }
        tx.set(walletRef, patch, { merge: true })
        claimed = true
      })
      const updated = await walletRef.get()
      return res.status(200).json({ ok: true, claimed, wallet: updated.data() })
    }

    return res.status(400).json({ error: 'Acción inválida.' })
  } catch (error) {
    const message = error instanceof Error ? error.message : ''
    if (message === 'insufficient_coins') return res.status(400).json({ error: 'No tienes suficientes monedas.' })
    if (message === 'already_owned') return res.status(409).json({ error: 'Ya tienes este artículo.' })
    if (message === 'skin_not_owned' || message === 'pet_not_owned') return res.status(403).json({ error: 'No tienes desbloqueado ese artículo.' })
    if (message === 'milestone_locked') return res.status(403).json({ error: 'Aún no cumples los requisitos de este premio.' })
    if (message === 'spider_rate') return res.status(429).json({ error: 'Espera un momento antes de contar otra araña.' })
    if (message === 'spider_daily_cap') return res.status(429).json({ error: 'Alcanzaste el límite diario del evento.' })
    if (message === 'odds_period') return res.status(409).json({ error: 'Las probabilidades de este mes cambiaron. Actualiza la pantalla e inténtalo otra vez.' })
    if (message === 'odds_theme') return res.status(400).json({ error: 'Ese tema no participa en el sorteo de este mes.' })
    if (message === 'odds_closed') return res.status(409).json({ error: 'El plazo de probabilidades para esta temporada ya cerró.' })
    console.error('No se pudo actualizar la economía:', error)
    return res.status(500).json({ error: 'No se pudo completar la operación.' })
  }
}
