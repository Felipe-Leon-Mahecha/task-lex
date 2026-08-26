import crypto from 'node:crypto'
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

export const config = { api: { bodyParser: false } }

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

async function getRawBody(req: any): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

function signatureValid(rawBody: Buffer, sig: unknown): boolean {
  if (typeof sig !== 'string' || !sig) return false
  const payload = rawBody.toString('base64')
  const candidates = [process.env.BOLD_SECRET_KEY, process.env.BOLD_IDENTITY_KEY]
  if (process.env.BOLD_TEST_MODE === 'true') candidates.push('')
  for (const key of candidates) {
    if (key === undefined) continue
    const digest = crypto.createHmac('sha256', key).update(payload).digest('hex')
    const a = Buffer.from(digest, 'hex')
    let b: Buffer
    try {
      b = Buffer.from(sig, 'hex')
    } catch {
      continue
    }
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return true
  }
  return false
}

async function linkIsPaid(linkId: string): Promise<{ paid: boolean; reference?: string }> {
  try {
    const r = await fetch(`${BOLD_LINK_API}/${linkId}`, {
      headers: { Authorization: `x-api-key ${process.env.BOLD_IDENTITY_KEY}` },
    })
    if (!r.ok) return { paid: false }
    const info = await r.json()
    return { paid: info?.status === 'PAID', reference: info?.reference }
  } catch {
    return { paid: false }
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const rawBody = await getRawBody(req)
  if (!signatureValid(rawBody, req.headers['x-bold-signature'])) {
    return res.status(400).json({ error: 'Firma inválida' })
  }

  let body: any = {}
  try {
    body = JSON.parse(rawBody.toString('utf8'))
  } catch {}

  const linkId: string | undefined = body.payment_link || body.id || body.data?.payment_link || body.data?.id
  if (!linkId) return res.json({ received: true })

  const check = await linkIsPaid(linkId)
  if (!check.paid) return res.json({ received: true, status: 'no_pagado' })
  const reference: string = body.reference || body.data?.reference || check.reference || ''

  const txnId: string = body.transaction_id || body.data?.transaction_id || linkId
  const processedRef = db.collection('boldProcessed').doc(txnId)
  if ((await processedRef.get()).exists) return res.json({ received: true, status: 'duplicado' })

  const parts = reference.split('_')
  const uid = parts[0]
  const pack = parts[1] ? BOLD_PACKS[parts[1]] : null
  if (!uid || !pack || !/^[A-Za-z0-9]+$/.test(uid)) return res.json({ received: true, status: 'referencia_invalida' })

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
      patch.premium = true
      const prevUntil = typeof current?.premiumUntil === 'number' ? current.premiumUntil : 0
      patch.premiumUntil = Math.max(Date.now(), prevUntil) + pack.premiumDays * 86400000
    } else {
      patch.coins += pack.coins + pack.bonus
    }
    tx.set(ref, patch, { merge: true })
    tx.set(processedRef, { uid, packId: parts[1], txnId, at: Date.now() })
  })

  res.json({ received: true })
}
