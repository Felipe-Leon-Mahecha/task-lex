import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { NoteFolder, StoredNote } from '../types/notes'
import { FOLDER_COLORS, makeId } from '../types/notes'
import { getCacheUid, getUid } from '../lib/session'
import { setFolderRemote, setFolderTombstone, setNoteRemote, setNoteTombstone, setNotesBgRemote } from '../lib/notesDb'

const NS = `task-lex-notes-${getCacheUid() ?? 'anon'}`
export const NOTES_KEY = NS

const MAX_TRASH = 100

export interface NoteTrashEntry {
  id: string
  deletedAt: number
}

interface NotesState {
  folders: NoteFolder[]
  notes: StoredNote[]
  trash: NoteTrashEntry[]
  trashFolders: NoteTrashEntry[]
  bgImage: string | null
  bgOpacity: number
  setBgOpacity: (opacity: number) => void
  setBgImage: (bg: string | null) => void
  applyRemoteBg: (bg: string | null) => void
  addFolder: (name: string, color?: string) => string
  renameFolder: (id: string, name: string, color?: string) => void
  deleteFolder: (id: string) => void
  createNote: (folderId: string | null) => StoredNote
  updateNote: (id: string, patch: Partial<Omit<StoredNote, 'id' | 'createdAt'>>) => void
  deleteNote: (id: string) => void
  togglePin: (id: string) => void
  toggleHighlight: (id: string) => void
  moveNote: (id: string, folderId: string | null) => void
}

const emptyNote = (folderId: string | null): StoredNote => ({
  id: makeId(),
  folderId,
  title: '',
  blocks: [{ id: makeId(), type: 'text', html: '', checked: false }],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  pinned: false,
})

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      folders: [],
      notes: [],
      trash: [],
      trashFolders: [],
      bgImage: null,
      bgOpacity: 25,
      setBgOpacity: (bgOpacity) => set({ bgOpacity: Math.max(0, Math.min(100, bgOpacity)) }),

      setBgImage: (bg) => {
        set({ bgImage: bg })
        const uid = getUid()
        if (uid) setNotesBgRemote(uid, bg).catch(() => {})
      },

      applyRemoteBg: (bg) => {
        set({ bgImage: bg })
      },

      addFolder: (name, color) => {
        const existing = get().folders.find((f) => f.name.trim().toLowerCase() === name.trim().toLowerCase())
        if (existing) return existing.id
        const folder: NoteFolder = {
          id: makeId(),
          name: name.trim(),
          color: color ?? FOLDER_COLORS[get().folders.length % FOLDER_COLORS.length],
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((s) => ({ folders: [...s.folders, folder] }))
        const uid = getUid()
        if (uid) setFolderRemote(uid, folder).catch(() => {})
        return folder.id
      },

      renameFolder: (id, name, color) => {
        const folder = get().folders.find((f) => f.id === id)
        if (!folder) return
        const next: NoteFolder = {
          ...folder,
          name: name.trim() || folder.name,
          color: color ?? folder.color,
          updatedAt: Date.now(),
        }
        set((s) => ({ folders: s.folders.map((f) => (f.id === id ? next : f)) }))
        const uid = getUid()
        if (uid) setFolderRemote(uid, next).catch(() => {})
      },

      deleteFolder: (id) => {
        const affected = get().notes.filter((n) => n.folderId === id)
        const now = Date.now()
        set((s) => ({
          folders: s.folders.filter((f) => f.id !== id),
          notes: s.notes.map((n) => (n.folderId === id ? { ...n, folderId: null, updatedAt: Date.now() } : n)),
          trashFolders: [{ id, deletedAt: now }, ...s.trashFolders.filter((t) => t.id !== id)].slice(0, MAX_TRASH),
        }))
        const uid = getUid()
        if (!uid) return
        setFolderTombstone(uid, id, now).catch(() => {})
        affected.forEach((n) => {
          const next = { ...n, folderId: null, updatedAt: Date.now() }
          setNoteRemote(uid, next).catch(() => {})
        })
      },

      createNote: (folderId) => {
        const note = emptyNote(folderId)
        set((s) => ({ notes: [note, ...s.notes] }))
        const uid = getUid()
        if (uid) setNoteRemote(uid, note).catch(() => {})
        return note
      },

      updateNote: (id, patch) => {
        const base = get().notes.find((n) => n.id === id)
        if (!base) return
        const next: StoredNote = { ...base, ...patch, updatedAt: Date.now() }
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? next : n)) }))
        const uid = getUid()
        if (uid) setNoteRemote(uid, next).catch(() => {})
      },

      deleteNote: (id) => {
        const now = Date.now()
        set((s) => ({
          notes: s.notes.filter((n) => n.id !== id),
          trash: [{ id, deletedAt: now }, ...s.trash.filter((t) => t.id !== id)].slice(0, MAX_TRASH),
        }))
        const uid = getUid()
        if (uid) setNoteTombstone(uid, id, now).catch(() => {})
      },

      togglePin: (id) => {
        const base = get().notes.find((n) => n.id === id)
        if (!base) return
        const next: StoredNote = { ...base, pinned: !base.pinned, updatedAt: Date.now() }
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? next : n)) }))
        const uid = getUid()
        if (uid) setNoteRemote(uid, next).catch(() => {})
      },

      toggleHighlight: (id) => {
        const base = get().notes.find((n) => n.id === id)
        if (!base) return
        const next: StoredNote = { ...base, highlighted: !base.highlighted, updatedAt: Date.now() }
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? next : n)) }))
        const uid = getUid()
        if (uid) setNoteRemote(uid, next).catch(() => {})
      },

      moveNote: (id, folderId) => {
        const base = get().notes.find((n) => n.id === id)
        if (!base) return
        const next: StoredNote = { ...base, folderId, updatedAt: Date.now() }
        set((s) => ({ notes: s.notes.map((n) => (n.id === id ? next : n)) }))
        const uid = getUid()
        if (uid) setNoteRemote(uid, next).catch(() => {})
      },
    }),
    { name: NS },
  ),
)
