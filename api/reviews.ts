import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const ADMIN_EMAIL = 'fmleonm19@gmail.com'
const APP_VERSION = process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'web'

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

async function currentUser(req: any): Promise<{ uid: string; email: string; emailVerified: boolean } | null> {
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
    const user = payload?.users?.[0]
    if (typeof user?.localId !== 'string') return null
    return { uid: user.localId, email: String(user.email ?? '').toLowerCase(), emailVerified: user.emailVerified === true }
  } catch {
    return null
  }
}

function parseReview(data: FirebaseFirestore.DocumentData) {
  return {
    uid: String(data.uid ?? ''),
    name: String(data.name ?? 'Anónimo'),
    rating: Number(data.rating ?? 5),
    comment: String(data.comment ?? ''),
    public: Boolean(data.public ?? true),
    status: data.status === 'approved' ? 'approved' : 'pending',
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    version: String(data.version ?? ''),
  }
}

export default async function handler(req: any, res: any) {
  const origin = String(req.headers?.origin ?? '')
  const allowedOrigins = new Set(['https://task-lex.vercel.app', 'https://tasklex.vercel.app', 'https://localhost', 'http://localhost', 'capacitor://localhost'])
  if (allowedOrigins.has(origin)) res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Vary', 'Origin')
  res.setHeader('Cache-Control', 'no-store')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' })

  const body = req.body ?? {}
  const action = body.action

  try {
    if (action === 'approved') {
      const snapshot = await db.collection('reviews').where('status', '==', 'approved').get()
      return res.status(200).json({ reviews: snapshot.docs.map((doc) => parseReview(doc.data())).filter((review) => review.public) })
    }

    const user = await currentUser(req)
    if (!user) return res.status(401).json({ error: 'Inicia sesión e inténtalo de nuevo.' })

    if (action === 'mine') {
      const snapshot = await db.collection('reviews').doc(user.uid).get()
      return res.status(200).json({ review: snapshot.exists ? parseReview(snapshot.data()!) : null })
    }

    if (action === 'submit') {
      const name = String(body.name ?? '').trim().slice(0, 80) || 'Anónimo'
      const comment = String(body.comment ?? '').trim().slice(0, 2000)
      const rating = Number(body.rating)
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Elige una calificación de 1 a 5 estrellas.' })
      const ref = db.collection('reviews').doc(user.uid)
      const existing = await ref.get()
      const now = new Date().toISOString()
      const lastUpdate = Date.parse(String(existing.data()?.updatedAt ?? ''))
      if (existing.exists && Number.isFinite(lastUpdate) && Date.now() - lastUpdate < 30_000) {
        return res.status(429).json({ error: 'Espera un momento antes de volver a enviar tu opinión.' })
      }
      await ref.set({
        uid: user.uid,
        name,
        rating,
        comment,
        public: body.public !== false,
        status: 'pending',
        createdAt: existing.exists ? String(existing.data()?.createdAt ?? now) : now,
        updatedAt: now,
        version: APP_VERSION,
      }, { merge: true })
      return res.status(200).json({ ok: true })
    }

    if (user.email !== ADMIN_EMAIL || !user.emailVerified) return res.status(403).json({ error: 'No tienes permisos para esa acción.' })

    if (action === 'all') {
      const snapshot = await db.collection('reviews').get()
      const reviews = snapshot.docs.map((doc) => parseReview(doc.data())).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      return res.status(200).json({ reviews })
    }

    const targetUid = String(body.uid ?? '')
    if (!/^[A-Za-z0-9]+$/.test(targetUid)) return res.status(400).json({ error: 'Reseña inválida.' })
    const ref = db.collection('reviews').doc(targetUid)
    if (action === 'status') {
      if (body.status !== 'approved' && body.status !== 'pending') return res.status(400).json({ error: 'Estado inválido.' })
      await ref.set({ status: body.status, updatedAt: new Date().toISOString() }, { merge: true })
      return res.status(200).json({ ok: true })
    }
    if (action === 'delete') {
      await ref.delete()
      return res.status(200).json({ ok: true })
    }
    return res.status(400).json({ error: 'Acción inválida.' })
  } catch (error) {
    console.error('Error en API de reseñas:', error)
    return res.status(500).json({ error: 'No se pudo completar la operación de reseñas.' })
  }
}
