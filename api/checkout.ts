import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const BOLD_LINK_API = 'https://integrations.api.bold.co/online/link/v1'

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

const BOLD_PACKS: Record<string, { total: number; label: string }> = {
  'punado': { total: 4900, label: 'Puñado de monedas Flux' },
  'bolsa': { total: 12900, label: 'Bolsa de monedas Flux' },
  'cosecha': { total: 19900, label: 'Cosecha de monedas Flux' },
  'baul': { total: 39900, label: 'Baúl de monedas Flux' },
  'premium-mensual': { total: 7900, label: 'Flux Premium mensual' },
  'premium-anual': { total: 59900, label: 'Flux Premium anual' },
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { packId, uid } = req.body || {}
  if (!packId || !uid || !/^[A-Za-z0-9]+$/.test(uid)) return res.status(400).json({ error: 'Datos inválidos' })

  const pack = BOLD_PACKS[packId]
  if (!pack) return res.status(400).json({ error: 'Paquete inválido' })

  const reference = `${uid}_${packId}_${Date.now()}`

  try {
    const r = await fetch(BOLD_LINK_API, {
      method: 'POST',
      headers: {
        Authorization: `x-api-key ${process.env.BOLD_IDENTITY_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount_type: 'CLOSE',
        amount: { currency: 'COP', taxes: [], tip_amount: 0, total_amount: pack.total },
        description: pack.label,
        reference,
        callback_url: 'https://task-lex.vercel.app/api/webhook',
      }),
    })
    const data = await r.json()
    if (!r.ok || !data?.payload?.url) {
      return res.status(502).json({ error: data?.error_message || 'Bold no disponible' })
    }
    try {
      await db.collection('boldLinks').doc(data.payload.payment_link).set({
        uid,
        packId,
        reference,
        total: pack.total,
        at: Date.now(),
      })
    } catch {}
    res.json({ url: data.payload.url, paymentLink: data.payload.payment_link, reference })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
}
