import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

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
  punado: { total: 4900, label: 'Puñado de monedas Quacker' },
  bolsa: { total: 12900, label: 'Bolsa de monedas Quacker' },
  cosecha: { total: 19900, label: 'Cosecha de monedas Quacker' },
  baul: { total: 39900, label: 'Baúl de monedas Quacker' },
  'premium-mensual': { total: 7900, label: 'Quacker Premium mensual' },
  'premium-anual': { total: 59900, label: 'Quacker Premium anual' },
  quackington: { total: 12900, label: 'Sir Quackington (mascota Quacker)' },
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { packId } = req.body || {}
  if (!packId) return res.status(400).json({ error: 'Datos inválidos' })
  const uid = await uidFromAuthHeader(req)
  if (!uid) return res.status(401).json({ error: 'Sesión requerida' })
  const pack = BOLD_PACKS[packId]
  if (!pack) return res.status(400).json({ error: 'Paquete inválido' })
  const reference = `${uid}_${packId}_${Date.now()}`
  const base = (process.env.PUBLIC_URL || 'https://task-lex.vercel.app').replace(/\/$/, '')
  try {
    const r = await fetch(BOLD_LINK_API, {
      method: 'POST',
      headers: { Authorization: `x-api-key ${process.env.BOLD_IDENTITY_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount_type: 'CLOSE',
        amount: { currency: 'COP', taxes: [], tip_amount: 0, total_amount: pack.total },
        description: pack.label,
        reference,
        callback_url: `${base}/api/webhook`,
        redirect_url: `${base}/#/tienda`,
      }),
    })
    const data = await r.json()
    if (!r.ok) return res.status(500).json({ error: 'Error al crear enlace', details: data })
    // Bold's current API returns the checkout id and URL inside `payload`.
    // Keep `data` as a fallback for links created by older API versions.
    const paymentLink = data.payload?.payment_link || data.data?.link
    const url = data.payload?.url || data.data?.redirect_url || (paymentLink ? `https://checkout.bold.co/${paymentLink}` : null)
    if (typeof paymentLink !== 'string' || typeof url !== 'string') {
      return res.status(502).json({ error: 'Bold no devolvió un enlace de pago válido' })
    }
    await db.collection('boldLinks').doc(paymentLink).set({ uid, packId, reference, amount: pack.total, createdAt: Date.now(), status: 'created' })
    return res.status(200).json({ url, paymentLink, reference })
  } catch {
    return res.status(500).json({ error: 'Error al crear enlace' })
  }
}
