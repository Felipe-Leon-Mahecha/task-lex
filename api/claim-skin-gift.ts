import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const FOX_RARITY: Record<string, string> = {
  vampiro: 'Exclusivo', caballero: 'Demon', fantasma: 'Demon', zombie: 'Demon', momia: 'Demon', frank: 'Demon',
  angel: 'Demon', demonio: 'Demon', espiritual: 'Demon', plasma: 'Legendario',
}
const DUCK_RARITY: Record<string, string> = {
  animado: 'Exclusivo', glitch: 'Exclusivo', 'pato-animatronico': 'Legendario', 'pato-de-tinta': 'Legendario',
  'pato-demon': 'Legendario', 'pato-jax': 'Legendario', 'patito-dragon': 'Demon', 'patito-rey': 'Demon',
  'pato-caballero': 'Demon', 'pato-de-plasma': 'Demon',
  'pato-angel': 'Legendario',
}
const RANGES: Record<string, [number, number]> = {
  Exclusivo: [100, 400], Legendario: [50, 300], Demon: [10, 200],
}
const GIFT_INTERVAL = 15 * 86400000

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

async function uidFromAuthHeader(req: any): Promise<string | null> {
  const match = String(req.headers?.authorization ?? '').match(/^Bearer (.+)$/)
  if (!match || !process.env.VITE_FIREBASE_API_KEY) return null
  try {
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken: match[1] }),
    })
    if (!response.ok) return null
    const payload = await response.json()
    const uid = payload?.users?.[0]?.localId
    return typeof uid === 'string' ? uid : null
  } catch {
    return null
  }
}

function weightedCoins([min, max]: [number, number]): number {
  return Math.round(min + (max - min) * Math.random() ** 2)
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const uid = await uidFromAuthHeader(req)
  if (!uid) return res.status(401).json({ error: 'Inicia sesión para revisar tus regalos.' })

  try {
    const ref = db.collection('users').doc(uid).collection('foxSkins').doc('data')
    const result = await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref)
      const data = snapshot.data() ?? {}
      const pet = data.pet === 'quackington' ? 'quackington' : 'fox'
      const skinId = pet === 'fox' ? String(data.equipped ?? 'idle') : String(data.quackingtonSkin ?? 'animado')
      const rarity = (pet === 'fox' ? FOX_RARITY : DUCK_RARITY)[skinId]
      const range = rarity ? RANGES[rarity] : undefined
      if (!range) return { status: 'ineligible' as const }
      const now = Date.now()
      const nextAt = typeof data.skinGiftNextAt === 'number' ? data.skinGiftNextAt : 0
      if (nextAt > now) return { status: 'cooldown' as const, nextAt }
      const amount = weightedCoins(range)
      const coins = typeof data.coins === 'number' ? data.coins : 0
      tx.set(ref, { coins: coins + amount, skinGiftNextAt: now + GIFT_INTERVAL }, { merge: true })
      return { status: 'claimed' as const, amount, coins: coins + amount, nextAt: now + GIFT_INTERVAL, rarity, skinId, pet }
    })
    return res.status(200).json(result)
  } catch (error) {
    console.error('No se pudo entregar el regalo de skin:', error)
    return res.status(500).json({ error: 'No se pudo revisar el regalo. Inténtalo de nuevo.' })
  }
}
