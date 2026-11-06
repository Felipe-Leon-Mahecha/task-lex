import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getAuth, type Auth } from 'firebase/auth'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getAnalytics, type Analytics } from 'firebase/analytics'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const configured = Boolean(config.apiKey && config.projectId)

export const firebaseApp: FirebaseApp | null = configured ? initializeApp(config) : null
export const db: Firestore | null = configured ? getFirestore(firebaseApp!) : null
export const auth: Auth | null = configured ? getAuth(firebaseApp!) : null
export const analytics: Analytics | null = (() => {
  if (!configured || typeof window === 'undefined') return null
  try {
    return getAnalytics(firebaseApp!)
  } catch {
    return null
  }
})()
export const storage: FirebaseStorage | null = configured ? getStorage(firebaseApp!) : null
