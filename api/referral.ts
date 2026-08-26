import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const REWARD_INVITED = 100
const REWARD_INVITER = 200

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
  await ref.set({ coins: Math.max(0, (await ref.get()).data()?.coins || 0) + amount }, { merge: true })
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { action, uid, code } = req.body || {}
  if (!uid || !/^[A-Za-z0-9]+$/.test(uid)) return res.status(400).json({ error: 'Datos inválidos' })

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
    if ((await redeemRef.get()).exists) return res.json({ ok: false, reason: 'ya_canjeado' })

    await db.runTransaction(async (tx) => {
      tx.set(userRef, { referredBy: clean }, { merge: true })
      tx.set(redeemRef, { uid, inviterUid, code: clean, at: Date.now() })
    })
    await creditCoins(uid, REWARD_INVITED)
    await creditCoins(inviterUid, REWARD_INVITER)

    return res.json({ ok: true, reward: REWARD_INVITED })
  }

  res.status(400).json({ error: 'Acción inválida' })
}
