import { collection, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from './firebase'
import type { NoteFolder, StoredNote } from '../types/notes'

export function noteDoc(uid: string, id: string) {
  return doc(collection(db!, 'users', uid, 'notes'), id)
}

export function folderDoc(uid: string, id: string) {
  return doc(collection(db!, 'users', uid, 'note_folders'), id)
}

export async function setNoteRemote(uid: string, note: StoredNote) {
  if (!db) return
  await setDoc(noteDoc(uid, note.id), note)
}

export async function setNoteTombstone(uid: string, id: string, ts: number) {
  if (!db) return
  await setDoc(noteDoc(uid, id), { id, _deleted: true, deletedAt: ts, updatedAt: ts })
}

export async function removeNoteRemote(uid: string, id: string) {
  if (!db) return
  await deleteDoc(noteDoc(uid, id))
}

export async function setFolderRemote(uid: string, folder: NoteFolder) {
  if (!db) return
  await setDoc(folderDoc(uid, folder.id), folder)
}

export async function setFolderTombstone(uid: string, id: string, ts: number) {
  if (!db) return
  await setDoc(folderDoc(uid, id), { id, _deleted: true, deletedAt: ts, updatedAt: ts })
}

export async function removeFolderRemote(uid: string, id: string) {
  if (!db) return
  await deleteDoc(folderDoc(uid, id))
}

export function notesMetaDoc(uid: string) {
  return doc(collection(db!, 'users', uid, 'notesMeta'), 'data')
}

export async function setNotesBgRemote(uid: string, bg: string | null) {
  if (!db) return
  await setDoc(notesMetaDoc(uid), { bg }, { merge: true })
}

export async function getNotesBgRemote(uid: string): Promise<string | null> {
  if (!db) return null
  try {
    const snap = await getDoc(notesMetaDoc(uid))
    if (!snap.exists()) return null
    const bg = (snap.data() as { bg?: unknown }).bg
    return typeof bg === 'string' && bg.startsWith('data:image/') ? bg : null
  } catch {
    return null
  }
}