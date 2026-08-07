import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { db } from './firebase'
import { APP_VERSION } from './appInfo'

export interface Review {
  uid: string
  name: string
  rating: number
  comment: string
  public: boolean
  status: 'pending' | 'approved'
  createdAt: string
  updatedAt: string
  version: string
}

export const reviewsCol = () => collection(db!, 'reviews')

function reviewDoc(uid: string) {
  return doc(reviewsCol(), uid)
}

function parse(data: Record<string, unknown>): Review {
  return {
    uid: String(data.uid ?? ''),
    name: String(data.name ?? 'Anónimo'),
    rating: Number(data.rating ?? 5),
    comment: String(data.comment ?? ''),
    public: Boolean(data.public ?? true),
    status: (data.status as Review['status']) ?? 'pending',
    createdAt: String(data.createdAt ?? new Date().toISOString()),
    updatedAt: String(data.updatedAt ?? new Date().toISOString()),
    version: String(data.version ?? ''),
  }
}

export async function getMyReview(uid: string): Promise<Review | null> {
  if (!db) return null
  const snap = await getDoc(reviewDoc(uid))
  return snap.exists() ? parse(snap.data() as Record<string, unknown>) : null
}

export async function submitReview(
  uid: string,
  data: { name: string; rating: number; comment: string; public: boolean },
) {
  if (!db) return
  const existing = await getMyReview(uid)
  const now = new Date().toISOString()
  await setDoc(
    reviewDoc(uid),
    {
      uid,
      name: data.name.trim() || 'Anónimo',
      rating: data.rating,
      comment: data.comment.trim(),
      public: data.public,
      status: 'pending',
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
      version: APP_VERSION,
    },
    { merge: true },
  )
}

export async function getApprovedReviews(): Promise<Review[]> {
  if (!db) return []
  const snap = await getDocs(query(reviewsCol(), where('status', '==', 'approved')))
  return snap.docs.map((d) => parse(d.data() as Record<string, unknown>))
}

export async function getAllReviews(): Promise<Review[]> {
  if (!db) return []
  const snap = await getDocs(reviewsCol())
  return snap.docs
    .map((d) => parse(d.data() as Record<string, unknown>))
    .sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1))
}

export async function setReviewStatus(uid: string, status: Review['status']) {
  if (!db) return
  await setDoc(reviewDoc(uid), { status }, { merge: true })
}

export async function deleteReview(uid: string) {
  if (!db) return
  await deleteDoc(reviewDoc(uid))
}
