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
  if (!db) return
  const [tasks, sections] = await Promise.all([
    getDocs(collection(db, 'users', uid, 'tasks')),
    getDocs(collection(db, 'users', uid, 'sections')),
  ])
  const refs = [
    ...tasks.docs.map((d) => d.ref),
    ...sections.docs.map((d) => d.ref),
    doc(db, 'users', uid, 'settings'),
    doc(db, 'users', uid, 'focus'),
    doc(db, 'users', uid, 'foxSkins', 'data'),
  ]
  for (const group of chunk(refs, 400)) {
    const batch = writeBatch(db)
    group.forEach((r) => batch.delete(r))
    await batch.commit()
  }
  if (storage) {
    try {
      const list = await listAll(ref(storage, `users/${uid}/images`))
      await Promise.all(list.items.map((item) => deleteObject(item)))
    } catch {}
  }
}

export async function deleteAccount(uid: string): Promise<DeleteResult> {
  try {
    await wipeUserData(uid)
  } catch {
    return 'error'
  }
  if (!auth?.currentUser) return 'ok'
  try {
    await deleteUser(auth.currentUser)
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
