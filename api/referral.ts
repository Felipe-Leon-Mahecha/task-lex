import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const REWARD_INVITED = 500
const REWARD_INVITER = 500

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
    return typeof payload?.users?.[0]?.localId === 'string' ? payload.users[0].localId : null
  } catch {
    return null
  }
}

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

function codeFor(uid: string): string {
  return uid.slice(0, 8).toUpperCase()
}

async function creditCoins(uid: string, amount: number) {
  const ref = db.collection('users').doc(uid).collection('foxSkins').doc('data')
  await ref.set({ coins: FieldValue.increment(amount) }, { merge: true })
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, uid, code } = req.body || {}
  if (!uid || !/^[A-Za-z0-9]+$/.test(uid)) return res.status(400).json({ error: 'Datos inválidos' })
  const authenticatedUid = await uidFromAuthHeader(req)
  if (!authenticatedUid || authenticatedUid !== uid) return res.status(401).json({ error: 'Inicia sesión de nuevo para usar las invitaciones.' })

  if (action === 'code') {
    const myCode = codeFor(uid)
    await db.collection('referrals').doc(myCode).set({ uid, at: Date.now() }, { merge: true })
    return res.json({ code: myCode })
  }

  if (action === 'redeem') {
    if (!code || typeof code !== 'string') return res.status(400).json({ error: 'Falta el código' })
    const clean = code.trim().toUpperCase()

    const userRef = db.collection('users').doc(uid).collection('foxSkins').doc('data')
    const userSnap = await userRef.get()
    if (userSnap.data()?.referredBy) return res.json({ ok: false, reason: 'ya_canjeado' })

    const myCode = codeFor(uid)
    if (clean === myCode) return res.json({ ok: false, reason: 'codigo_propio' })

    const refDoc = await db.collection('referrals').doc(clean).get()
    if (!refDoc.exists || !refDoc.data()?.uid) return res.json({ ok: false, reason: 'codigo_invalido' })
    const inviterUid = refDoc.data().uid
    if (inviterUid === uid) return res.json({ ok: false, reason: 'codigo_propio' })

    const redeemRef = db.collection('referrals').doc(`redeemed_${uid}`)
    let duplicado = false
    await db.runTransaction(async (tx) => {
      const [redeemSnap, userTxSnap] = await Promise.all([tx.get(redeemRef), tx.get(userRef)])
      if (redeemSnap.exists || userTxSnap.data()?.referredBy) {
        duplicado = true
        return
      }
      tx.set(userRef, { referredBy: clean }, { merge: true })
      tx.set(redeemRef, { uid, inviterUid, code: clean, at: Date.now() })
      tx.set(
        userRef,
        { coins: FieldValue.increment(REWARD_INVITED) },
        { merge: true },
      )
      tx.set(
        db.collection('users').doc(inviterUid).collection('foxSkins').doc('data'),
        { coins: FieldValue.increment(REWARD_INVITER) },
        { merge: true },
      )
    })
    if (duplicado) return res.json({ ok: false, reason: 'ya_canjeado' })

    return res.json({ ok: true, reward: REWARD_INVITED })
  }

  res.status(400).json({ error: 'Acción inválida' })
}
