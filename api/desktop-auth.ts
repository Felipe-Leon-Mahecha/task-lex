import { createHash, randomBytes } from 'node:crypto'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const auth = getAuth()
const db = getFirestore()

function ticketRef(ticket: string) {
  const digest = createHash('sha256').update(ticket).digest('hex')
  return db.collection('desktopAuthTickets').doc(digest)
}

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' })

  const { action, idToken, ticket } = req.body ?? {}
  try {
    if (action === 'create') {
      if (typeof idToken !== 'string' || idToken.length < 100 || idToken.length > 6000) return res.status(400).json({ error: 'Sesión de Google no válida.' })
      const decoded = await auth.verifyIdToken(idToken, true)
      const customToken = await auth.createCustomToken(decoded.uid)
      const rawTicket = randomBytes(32).toString('hex')
      await ticketRef(rawTicket).create({
        customToken,
        uid: decoded.uid,
        expiresAt: Date.now() + 120_000,
        createdAt: FieldValue.serverTimestamp(),
      })
      return res.status(200).json({ ok: true, ticket: rawTicket })
    }

    if (action === 'exchange') {
      if (typeof ticket !== 'string' || !/^[a-f0-9]{64}$/.test(ticket)) return res.status(400).json({ error: 'El enlace de regreso no es válido.' })
      let customToken = ''
      await db.runTransaction(async (tx) => {
        const ref = ticketRef(ticket)
        const snapshot = await tx.get(ref)
        const data = snapshot.data()
        if (!snapshot.exists || typeof data?.customToken !== 'string' || typeof data.expiresAt !== 'number' || data.expiresAt <= Date.now()) {
          throw new Error('ticket_expired')
        }
        customToken = data.customToken
        tx.delete(ref)
      })
      return res.status(200).json({ ok: true, customToken })
    }

    return res.status(400).json({ error: 'Acción no válida.' })
  } catch (error) {
    const code = (error as { code?: string; message?: string })?.code
    const message = (error as { message?: string })?.message
    if (message === 'ticket_expired') return res.status(410).json({ error: 'El pase expiró. Vuelve a iniciar sesión desde Quacker.' })
    if (code === 'auth/id-token-expired' || code === 'auth/argument-error' || code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: 'La sesión de Google expiró. Inténtalo de nuevo.' })
    }
    console.error('Desktop authentication failed', code ?? 'unknown')
    return res.status(500).json({ error: 'No se pudo conectar la sesión con Quacker.' })
  }
}
