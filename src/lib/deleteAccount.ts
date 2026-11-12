import { deleteUser } from 'firebase/auth'
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore'
import { ref, listAll, deleteObject } from 'firebase/storage'
import { auth, db, storage } from './firebase'

export type DeleteResult = 'ok' | 'recent-login' | 'error'

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

export async function wipeUserData(uid: string): Promise<void> {
  if (!db) throw new Error('No se pudo conectar con la base de datos.')
  const userRef = doc(db, 'users', uid)
  const refs: ReturnType<typeof doc>[] = []
  const collections = ['tasks', 'sections', 'foxSkins', 'settings', 'focus', 'seasons', 'notes', 'note_folders', 'notesMeta', 'weeklyPlan']
  for (const col of collections) {
    try {
      const snap = await getDocs(collection(userRef, col))
      snap.docs.forEach((d) => refs.push(d.ref))
    } catch {}
  }
  refs.push(userRef)
  for (const group of chunk(refs, 400)) {
    const batch = writeBatch(db)
    group.forEach((r) => batch.delete(r))
    await batch.commit()
  }
  if (storage) {
    const removeFolder = async (folder: ReturnType<typeof ref>): Promise<void> => {
      const list = await listAll(folder)
      await Promise.all(list.items.map((item) => deleteObject(item)))
      await Promise.all(list.prefixes.map((prefix) => removeFolder(prefix)))
    }
    await removeFolder(ref(storage, `users/${uid}`))
  }
}

export async function deleteAccount(uid: string): Promise<DeleteResult> {
  const currentUser = auth?.currentUser
  if (!currentUser || currentUser.uid !== uid) return 'error'
  const lastSignInAt = Date.parse(currentUser.metadata.lastSignInTime ?? '')
  if (!Number.isFinite(lastSignInAt) || Date.now() - lastSignInAt > 4 * 60 * 1000) return 'recent-login'
  try {
    const token = await currentUser.getIdToken()
    await fetch('/api/presence', { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
  } catch {}
  try {
    await wipeUserData(uid)
  } catch {
    return 'error'
  }
  try {
    await deleteUser(currentUser)
  } catch (e) {
    const code = (e as { code?: string }).code
    if (code === 'auth/requires-recent-login') return 'recent-login'
    return 'error'
  }
  return 'ok'
}

export function clearLocalData(): void {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith('task-lex'))
      .forEach((k) => localStorage.removeItem(k))
  } catch {}
}
