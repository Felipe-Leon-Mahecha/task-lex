import crypto from 'node:crypto'
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

const BOLD_LINK_API = 'https://integrations.api.bold.co/online/link/v1'

const BOLD_PACKS: Record<string, { coins: number; bonus: number; premiumDays?: number; quackington?: boolean }> = {
  punado: { coins: 100, bonus: 0 },
  bolsa: { coins: 350, bonus: 50 },
  cosecha: { coins: 650, bonus: 150 },
  baul: { coins: 1500, bonus: 500 },
  'premium-mensual': { coins: 0, bonus: 0, premiumDays: 30 },
  'premium-anual': { coins: 0, bonus: 0, premiumDays: 365 },
  quackington: { coins: 0, bonus: 0, quackington: true },
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
  const candidates = [process.env.BOLD_SECRET_KEY]
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

async function linkIsPaid(linkId: string): Promise<{ paid: boolean; reference?: string; total?: number }> {
  try {
    const r = await fetch(`${BOLD_LINK_API}/${encodeURIComponent(linkId)}`, {
      headers: { Authorization: `x-api-key ${process.env.BOLD_IDENTITY_KEY}` },
    })
    if (!r.ok) return { paid: false }
    const info = await r.json()
    return {
      paid: (info?.status ?? info?.payload?.status) === 'PAID',
      reference: info?.reference ?? info?.payload?.reference,
      total: info?.total ?? info?.payload?.total ?? info?.amount?.total_amount ?? info?.payload?.amount?.total_amount,
    }
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
  } catch {
    return res.status(400).json({ error: 'Body inválido' })
  }
  // Bold's current webhook uses CloudEvents-style SALE_APPROVED events and
  // places the API Link ID in data.metadata.reference (LNK_*).
  const event = body?.type ?? body?.event
  const linkId = body?.data?.metadata?.reference || body?.data?.link_id || body?.payload?.link_id || body?.link_id
  if (!['SALE_APPROVED', 'link.paid'].includes(event) || typeof linkId !== 'string' || !/^LNK_[A-Za-z0-9_-]+$/.test(linkId)) return res.status(200).json({ ok: true })
  const { paid, reference, total } = await linkIsPaid(linkId)
  if (!paid) return res.status(200).json({ ok: true })
  const linkRef = db.collection('boldLinks').doc(linkId)
  const linkSnap = await linkRef.get()
  const purchase = linkSnap.exists ? linkSnap.data() : null
  if (!purchase?.uid || !purchase?.packId || !BOLD_PACKS[purchase.packId]) return res.status(200).json({ ok: true })
  if (reference !== purchase.reference || typeof total !== 'number' || !Number.isFinite(total) || total !== purchase.amount) return res.status(200).json({ ok: true })
  const { uid, packId } = purchase as { uid: string; packId: string }
  const pack = BOLD_PACKS[packId]
  const processedRef = db.collection('boldProcessed').doc(linkId)
  let already = false
  await db.runTransaction(async (tx) => {
    const processed = await tx.get(processedRef)
    if (processed.exists) { already = true; return }
    const userRef = db.collection('users').doc(uid).collection('foxSkins').doc('data')
    const userSnap = await tx.get(userRef)
    const current = userSnap.exists ? userSnap.data() : null
    if (pack.premiumDays) {
      const previous = typeof current?.premiumUntil === 'number' ? current.premiumUntil : 0
      tx.set(userRef, { premium: true, premiumUntil: Math.max(Date.now(), previous) + pack.premiumDays * 86400000, quackingtonOwned: true }, { merge: true })
    } else if (pack.quackington) {
      tx.set(userRef, { quackingtonOwned: true, pet: 'quackington' }, { merge: true })
    } else {
      tx.set(userRef, { equipped: current?.equipped ?? 'idle', unlocked: current?.unlocked ?? ['idle'], coins: FieldValue.increment(pack.coins + pack.bonus) }, { merge: true })
    }
    tx.set(processedRef, { uid, packId, at: Date.now(), via: 'webhook' })
    tx.set(linkRef, { status: 'paid', paidAt: Date.now() }, { merge: true })
  })
  return res.status(200).json({ ok: true, credited: !already, already })
}
