export type PrivateNotePayload = { title: string; blocks: import('../../types/notes').NoteBlock[] }
export type EncryptedNotePayload = { salt: string; iv: string; ciphertext: string }

const encode = (data: Uint8Array) => {
  let binary = ''
  for (let offset = 0; offset < data.length; offset += 0x8000) binary += String.fromCharCode(...data.subarray(offset, offset + 0x8000))
  return btoa(binary)
}
const decode = (data: string) => Uint8Array.from(atob(data), (char) => char.charCodeAt(0))

async function deriveKey(password: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: new Uint8Array(salt).buffer as ArrayBuffer, iterations: 180_000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt'])
}

export async function encryptPrivateNote(payload: PrivateNotePayload, password: string, existingSalt?: string): Promise<EncryptedNotePayload> {
  const salt = existingSalt ? decode(existingSalt) : crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await deriveKey(password, salt)
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(JSON.stringify(payload)))
  return { salt: encode(salt), iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) }
}

export async function decryptPrivateNote(data: EncryptedNotePayload, password: string): Promise<PrivateNotePayload> {
  const key = await deriveKey(password, decode(data.salt))
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: decode(data.iv) }, key, decode(data.ciphertext))
  const payload = JSON.parse(new TextDecoder().decode(plaintext)) as PrivateNotePayload
  if (typeof payload.title !== 'string' || !Array.isArray(payload.blocks)) throw new Error('Nota privada inválida')
  return payload
}
