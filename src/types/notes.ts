export type NoteBlockType = 'text' | 'subtitle' | 'quote' | 'check' | 'bullet' | 'number'

export interface NoteBlock {
  id: string
  type: NoteBlockType
  html: string
  checked: boolean
}

export interface NoteFolder {
  id: string
  name: string
  color: string
  createdAt: number
  updatedAt: number
}

export interface StoredNote {
  id: string
  folderId: string | null
  title: string
  blocks: NoteBlock[]
  createdAt: number
  updatedAt: number
  pinned: boolean
  highlighted?: boolean
  privateNote?: boolean
  privateData?: { salt: string; iv: string; ciphertext: string }
}

export const FOLDER_COLORS = [
  '#e5383b',
  '#f97316',
  '#eab308',
  '#16a34a',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
]

export function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}
