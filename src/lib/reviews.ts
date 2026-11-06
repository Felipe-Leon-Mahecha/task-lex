import { auth } from './firebase'
import { apiUrl } from './apiUrl'

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

type Action = 'approved' | 'mine' | 'submit' | 'all' | 'status' | 'delete'

async function request(action: Action, data: Record<string, unknown> = {}, freshIdToken?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (action !== 'approved') {
    const token = freshIdToken ?? (auth?.currentUser ? await auth.currentUser.getIdToken() : null)
    if (!token) throw new Error('Inicia sesión para continuar.')
    headers.Authorization = `Bearer ${token}`
  }
  const response = await fetch(apiUrl('/api/reviews'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ action, ...data }),
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(String(payload.error ?? 'No se pudo completar la operación.'))
  return payload
}

export async function getMyReview(_uid: string): Promise<Review | null> {
  const payload = await request('mine')
  return payload.review ?? null
}

export async function submitReview(
  _uid: string,
  data: { name: string; rating: number; comment: string; public: boolean },
  freshIdToken?: string,
) {
  await request('submit', data, freshIdToken)
}

export async function getApprovedReviews(): Promise<Review[]> {
  const payload = await request('approved')
  return Array.isArray(payload.reviews) ? payload.reviews : []
}

export async function getAllReviews(): Promise<Review[]> {
  const payload = await request('all')
  return Array.isArray(payload.reviews) ? payload.reviews : []
}

export async function setReviewStatus(uid: string, status: Review['status']) {
  await request('status', { uid, status })
}

export async function deleteReview(uid: string) {
  await request('delete', { uid })
}
