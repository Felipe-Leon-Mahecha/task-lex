import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const BOLD_LINK_API = 'https://integrations.api.bold.co/online/link/v1'

const BOLD_PACKS: Record<string, { coins: number; bonus: number; premiumDays?: number }> = {
  'punado': { coins: 100, bonus: 0 },
  'bolsa': { coins: 350, bonus: 50 },
  'cosecha': { coins: 650, bonus: 150 },
  'baul': { coins: 1500, bonus: 500 },
  'premium-mensual': { coins: 0, bonus: 0, premiumDays: 30 },
  'premium-anual': { coins: 0, bonus: 0, premiumDays: 365 },
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

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { paymentLink, uid } = req.body || {}
  if (!paymentLink || !uid || !/^[A-Za-z0-9]+$/.test(uid)) return res.status(400).json({ error: 'Datos inválidos' })

  let info: any
  try {
    const r = await fetch(`${BOLD_LINK_API}/${encodeURIComponent(paymentLink)}`, {
      headers: { Authorization: `x-api-key ${process.env.BOLD_IDENTITY_KEY}` },
    })
    if (!r.ok) return res.json({ verified: false, reason: 'link_no_encontrado' })
    info = await r.json()
  } catch {
    return res.json({ verified: false, reason: 'bold_no_disponible' })
  }

  if (info?.status !== 'PAID') return res.json({ verified: false, reason: 'no_pagado' })

  const reference: string = typeof info.reference === 'string' ? info.reference : ''
  const parts = reference.split('_')
  const refUid = parts[0]
  const packId = parts[1]
  const pack = packId ? BOLD_PACKS[packId] : null
  if (refUid !== uid || !pack) return res.json({ verified: false, reason: 'referencia_invalida' })

  const txnId: string = info.transaction_id || info.id || paymentLink
  const processedRef = db.collection('boldProcessed').doc(txnId)
  if ((await processedRef.get()).exists) return res.json({ verified: true, already: true })

  let credited: 'coins' | 'premium' = 'coins'
  await db.runTransaction(async (tx) => {
    const ref = db.collection('users').doc(uid).collection('foxSkins').doc('data')
    const snap = await tx.get(ref)
    const current = snap.exists ? snap.data() : null
    const patch: Record<string, unknown> = {
      equipped: current?.equipped ?? 'idle',
      unlocked: current?.unlocked ?? ['idle'],
      coins: (typeof current?.coins === 'number' ? current.coins : 0),
    }
    if (pack.premiumDays) {
      credited = 'premium'
      patch.premium = true
      const prevUntil = typeof current?.premiumUntil === 'number' ? current.premiumUntil : 0
      patch.premiumUntil = Math.max(Date.now(), prevUntil) + pack.premiumDays * 86400000
    } else {
      patch.coins += pack.coins + pack.bonus
    }
    tx.set(ref, patch, { merge: true })
    tx.set(processedRef, { uid, packId, txnId, at: Date.now(), via: 'verify' })
  })

  res.json({ verified: true, credited, packId })
}
