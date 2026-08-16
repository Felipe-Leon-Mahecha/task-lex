import { create } from 'zustand'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as fbSignOut,
  type User,
} from 'firebase/auth'
import { auth } from '../lib/firebase'
import { setSessionUser } from '../lib/session'
import { requestPermission } from '../lib/notifications'
import { startSync, stopSync } from '../lib/sync'

interface AuthState {
  user: User | null
  loading: boolean
  demo: boolean
  error: string | null
  init: () => void
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (email: string, password: string) => Promise<boolean>
  signInWithGoogle: () => Promise<boolean>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  demo: false,
  error: null,
  init: () => {
    if (!auth) {
      set({ loading: false, demo: true })
      return
    }
    onAuthStateChanged(auth, (user) => {
      setSessionUser(user)
      if (user) {
        startSync(user.uid)
        requestPermission().catch(() => {})
      } else {
        stopSync()
      }
      set({ user, loading: false })
    })
  },
  signIn: async (email, password) => {
    set({ error: null })
    try {
      await signInWithEmailAndPassword(auth!, email, password)
      return true
    } catch {
      set({ error: 'Credenciales inválidas.' })
      return false
    }
  },
  signUp: async (email, password) => {
    set({ error: null })
    try {
      await createUserWithEmailAndPassword(auth!, email, password)
      return true
    } catch (e) {
      const code = (e as { code?: string }).code
      set({
        error: code === 'auth/weak-password' ? 'Contraseña muy corta (mínimo 6).' : 'No se pudo crear la cuenta.',
      })
      return false
    }
  },
  signInWithGoogle: async () => {
    set({ error: null })
    try {
      await signInWithPopup(auth!, new GoogleAuthProvider())
      return true
    } catch (e) {
      const code = (e as { code?: string }).code
      if (code === 'auth/popup-blocked' || code === 'auth/operation-not-supported-in-this-environment') {
        set({
          error:
            'El navegador bloqueó la ventana de Google. Sal del modo computadora, permite popups, o usa correo y contraseña.',
        })
      } else if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        set({ error: null })
      } else if (code === 'auth/unauthorized-domain') {
        set({
          error:
            'El dominio no está autorizado en Firebase. Añade task-lex.vercel.app en Authentication → Settings → Authorized domains.',
        })
      } else {
        set({ error: 'No se pudo iniciar con Google. Usa correo y contraseña o inténtalo de nuevo.' })
      }
      return false
    }
  },
  signOut: async () => {
    await fbSignOut(auth!)
  },
}))
