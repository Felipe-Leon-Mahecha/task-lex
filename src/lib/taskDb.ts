import { collection, deleteDoc, doc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore'
import { db } from './firebase'
import type { SectionMeta, Task, ThemeConfig } from '../types/task'

export function toFirestore(t: Task) {
  return {
    ...t,
    dueDate: t.dueDate ? t.dueDate.toISOString() : null,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
  }
}

export function taskDoc(uid: string, id: string) {
  return doc(collection(db!, 'users', uid, 'tasks'), id)
}

export function sectionDoc(uid: string, sectionId: string) {
  return doc(collection(db!, 'users', uid, 'sections'), sectionId)
}

export function settingsDoc(uid: string) {
  return doc(collection(db!, 'users', uid), 'settings')
}

export function focusDoc(uid: string) {
  return doc(collection(db!, 'users', uid), 'focus')
}

export async function saveSettings(uid: string, settings: Record<string, unknown>) {
  if (!db) return
  await setDoc(settingsDoc(uid), settings)
}

export async function saveFocusLog(uid: string, entries: { d: string; min: number }[]) {
  if (!db) return
  await setDoc(focusDoc(uid), { entries })
}

export async function setTask(uid: string, task: Task) {
  if (!db) return
  await setDoc(taskDoc(uid, task.id), toFirestore(task))
}

export async function removeTask(uid: string, id: string) {
  if (!db) return
  await deleteDoc(taskDoc(uid, id))
}

export async function setSectionTheme(uid: string, sectionId: string, theme: ThemeConfig) {
  if (!db) return
  await setDoc(sectionDoc(uid, sectionId), { theme }, { merge: true })
}

export async function setSectionMeta(uid: string, meta: SectionMeta) {
  if (!db) return
  await setDoc(
    sectionDoc(uid, meta.id),
    { id: meta.id, label: meta.label, icon: meta.icon, order: meta.order },
    { merge: true },
  )
}

export async function removeSectionRemote(uid: string, sectionId: string) {
  if (!db) return
  const tasks = await getDocs(query(collection(db, 'users', uid, 'tasks'), where('sectionId', '==', sectionId)))
  const batch = writeBatch(db)
  batch.delete(sectionDoc(uid, sectionId))
  tasks.docs.forEach((d) => batch.delete(d.ref))
  await batch.commit()
}
