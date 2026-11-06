import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

async function uidFromAuthHeader(req: any): Promise<string | null> {
  const m = (req.headers?.authorization || '').match(/^Bearer (.+)$/)
  if (!m) return null
  try {
    const r = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${process.env.VITE_FIREBASE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: m[1] }),
      },
    )
    if (!r.ok) return null
    const data = await r.json()
    const u = data?.users?.[0]
    return typeof u?.localId === 'string' ? u.localId : null
  } catch {
    return null
  }
}

const BOLD_LINK_API = 'https://integrations.api.bold.co/online/link/v1'

const BOLD_PACKS: Record<string, { coins: number; bonus: number; premiumDays?: number; quackington?: boolean }> = {
  'punado': { coins: 100, bonus: 0 },
  'bolsa': { coins: 350, bonus: 50 },
  'cosecha': { coins: 650, bonus: 150 },
  'baul': { coins: 1500, bonus: 500 },
  'premium-mensual': { coins: 0, bonus: 0, premiumDays: 30 },
  'premium-anual': { coins: 0, bonus: 0, premiumDays: 365 },
  'quackington': { coins: 0, bonus: 0, quackington: true },
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { paymentLink, uid } = req.body || {}
  if (typeof paymentLink !== 'string' || !/^LNK_[A-Za-z0-9_-]+$/.test(paymentLink) || !uid || !/^[A-Za-z0-9]+$/.test(uid)) return res.status(400).json({ error: 'Datos inválidos' })
  const tokenUid = await uidFromAuthHeader(req)
  if (!tokenUid) return res.status(401).json({ verified: false, reason: 'sin_sesion' })
  if (tokenUid !== uid) return res.status(403).json({ verified: false, reason: 'referencia_invalida' })
  const linkRef = db.collection('boldLinks').doc(paymentLink)
  const linkSnap = await linkRef.get()
  const purchase = linkSnap.exists ? linkSnap.data() : null
  if (!purchase || purchase.uid !== tokenUid || !BOLD_PACKS[purchase.packId]) return res.json({ verified: false, reason: 'referencia_invalida' })

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

  const status = info?.status ?? info?.payload?.status
  if (status !== 'PAID') return res.json({ verified: false, reason: ['ACTIVE', 'PENDING', 'PROCESSING'].includes(status) ? 'pago_pendiente' : 'no_pagado' })
  const total = info?.total ?? info?.payload?.total ?? info?.amount?.total_amount ?? info?.payload?.amount?.total_amount
  if (typeof total !== 'number' || !Number.isFinite(total) || total !== purchase.amount) return res.json({ verified: false, reason: 'monto_invalido' })
  const packId = purchase.packId as string
  const pack = BOLD_PACKS[packId]
  const reportedReference = info?.reference ?? info?.payload?.reference
  if (typeof reportedReference !== 'string' || reportedReference !== purchase.reference) return res.json({ verified: false, reason: 'referencia_invalida' })

  const txnId: string = info.transaction_id || info.id || paymentLink
  const processedRef = db.collection('boldProcessed').doc(paymentLink)
  let credited: 'coins' | 'premium' | 'quackington' = 'coins'
  let duplicado = false
  await db.runTransaction(async (tx) => {
    const already = await tx.get(processedRef)
    if (already.exists) {
      duplicado = true
      return
    }
    const ref = db.collection('users').doc(uid).collection('foxSkins').doc('data')
    const snap = await tx.get(ref)
    const current = snap.exists ? snap.data() : null
    if (pack.premiumDays) {
      credited = 'premium'
      const prevUntil = typeof current?.premiumUntil === 'number' ? current.premiumUntil : 0
      tx.set(
        ref,
        {
          premium: true,
          premiumUntil: Math.max(Date.now(), prevUntil) + pack.premiumDays * 86400000,
          quackingtonOwned: true,
        },
        { merge: true },
      )
    } else if (pack.quackington) {
      credited = 'quackington'
      tx.set(ref, { quackingtonOwned: true, pet: 'quackington' }, { merge: true })
    } else {
      credited = 'coins'
      tx.set(
        ref,
        {
          equipped: current?.equipped ?? 'idle',
          unlocked: current?.unlocked ?? ['idle'],
          coins: FieldValue.increment(pack.coins + pack.bonus),
        },
        { merge: true },
      )
    }
    tx.set(processedRef, { uid, packId, txnId, at: Date.now(), via: 'verify' })
    tx.set(linkRef, { status: 'paid', txnId, paidAt: Date.now() }, { merge: true })
  })
  if (duplicado) return res.json({ verified: true, already: true })

  res.json({ verified: true, credited, packId })
}
