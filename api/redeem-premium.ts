import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const PREMIUM_COIN_COST = 1800
const PREMIUM_DAYS = 30

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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const uid = await uidFromAuthHeader(req)
  if (!uid) return res.status(401).json({ error: 'Inicia sesión para canjear Premium.' })

  try {
    const ref = db.collection('users').doc(uid).collection('foxSkins').doc('data')
    const result = await db.runTransaction(async (tx) => {
      const snapshot = await tx.get(ref)
      const data = snapshot.data() ?? {}
      const coins = typeof data.coins === 'number' ? data.coins : 0
      if (coins < PREMIUM_COIN_COST) return { ok: false as const, coins }
      const currentUntil = typeof data.premiumUntil === 'number' ? data.premiumUntil : 0
      const premiumUntil = Math.max(Date.now(), currentUntil) + PREMIUM_DAYS * 86400000
      tx.set(ref, { coins: coins - PREMIUM_COIN_COST, premium: true, premiumUntil, quackingtonOwned: true }, { merge: true })
      return { ok: true as const, coins: coins - PREMIUM_COIN_COST, premiumUntil }
    })
    if (!result.ok) return res.status(400).json({ error: `Necesitas ${PREMIUM_COIN_COST} monedas para canjear Premium.`, coins: result.coins })
    return res.status(200).json({ ok: true, ...result, days: PREMIUM_DAYS })
  } catch (error) {
    console.error('No se pudo canjear Premium:', error)
    return res.status(500).json({ error: 'No se pudo completar el canje. Inténtalo de nuevo.' })
  }
}
