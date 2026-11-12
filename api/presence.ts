import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore, Timestamp } from 'firebase-admin/firestore'

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
const OWNER = 'fmleonm19@gmail.com'
const ONLINE_MS = 2 * 60_000
const RECENT_MS = 30 * 24 * 60 * 60_000

async function principal(req: any) {
  const match = String(req.headers?.authorization ?? '').match(/^Bearer (.+)$/)
  if (!match) return null
  try {
    const decoded = await getAuth().verifyIdToken(match[1])
    return { uid: decoded.uid, email: String(decoded.email ?? '').trim().toLowerCase(), emailVerified: decoded.email_verified === true }
  } catch { return null }
}

export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store')
  const account = await principal(req)
  if (!account) return res.status(401).json({ error: 'Sesión inválida.' })
  if (req.method === 'DELETE') {
    await db.collection('presence').doc(account.uid).delete()
    return res.status(204).end()
  }
  if (req.method === 'POST') {
    await db.collection('presence').doc(account.uid).set({ lastSeenAt: FieldValue.serverTimestamp() })
    return res.status(204).end()
  }
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido.' })
  if (account.email !== OWNER || !account.emailVerified) return res.status(403).json({ error: 'No autorizado.' })

  const now = Date.now()
  const onlineAfter = Timestamp.fromMillis(now - ONLINE_MS)
  const recentAfter = Timestamp.fromMillis(now - RECENT_MS)
  const cleanupRef = db.collection('meta').doc('presence-cleanup')
  const shouldCleanup = await db.runTransaction(async (transaction) => {
    const previous = await transaction.get(cleanupRef)
    const cleanedAt = previous.get('cleanedAt') as Timestamp | undefined
    if (cleanedAt && now - cleanedAt.toMillis() < 24 * 60 * 60_000) return false
    transaction.set(cleanupRef, { cleanedAt: Timestamp.fromMillis(now) })
    return true
  })
  if (shouldCleanup) {
    const expired = await db.collection('presence').where('lastSeenAt', '<', recentAfter).limit(450).get()
    if (!expired.empty) {
      const batch = db.batch()
      expired.docs.forEach((document) => batch.delete(document.ref))
      await batch.commit()
    }
  }
  const [online, recent] = await Promise.all([
    db.collection('presence').where('lastSeenAt', '>=', onlineAfter).get(),
    db.collection('presence').where('lastSeenAt', '>=', recentAfter).get(),
  ])
  const onlineIds = new Set(online.docs.map((document) => document.id))
  return res.status(200).json({ online: onlineIds.size, offlineRecent: recent.size - onlineIds.size })
}
