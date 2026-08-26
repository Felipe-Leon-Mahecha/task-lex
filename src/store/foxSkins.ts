import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUid } from '../lib/session'
import { doc, setDoc, increment, arrayUnion, onSnapshot } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getSkinById } from '../lib/foxSkins'

interface FoxSkinsState {
  equipped: string
  unlocked: string[]
  coins: number
  premium: boolean
  premiumUntil: number | null
  themeUnlocked: boolean
  todayTaskCoins: number
  todayFocusCoins: number
  todayTasksCompleted: number
  lastCoinDate: string
  equipSkin: (id: string) => void
  unlockSkin: (id: string) => boolean
  addCoins: (amount: number) => void
  spendCoins: (amount: number) => boolean
  unlockTheme: () => boolean
  recordTaskReward: () => { earned: number; capped: boolean }
  recordFocusReward: () => { earned: number; capped: boolean }
}

const DAILY_TASK_LIMIT = 5
const DAILY_FOCUS_LIMIT = 3
const TASK_COIN_REWARD = 5
const FOCUS_COIN_REWARD = 10

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

let unsubscribe: Unsubscribe | null = null
let syncedUid = ''

export function startFoxSkinsSync() {
  const uid = getUid()
  if (!uid || !db) return
  if (unsubscribe && syncedUid === uid) return
  stopFoxSkinsSync()
  const ref = doc(db, 'users', uid, 'foxSkins', 'data')
  unsubscribe = onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        setDoc(ref, { equipped: 'idle', unlocked: ['idle'], coins: 0 }).catch(() => {})
        return
      }
      const d = snap.data()
      const until = typeof d.premiumUntil === 'number' ? d.premiumUntil : null
      useFoxSkinsStore.setState({
        equipped: d.equipped || 'idle',
        unlocked: Array.isArray(d.unlocked) && d.unlocked.length ? d.unlocked : ['idle'],
        coins: typeof d.coins === 'number' ? d.coins : 0,
        premium: !!d.premium && (!until || until > Date.now()),
        premiumUntil: until,
        themeUnlocked: !!d.themeUnlocked,
      })
    },
    () => {},
  )
  syncedUid = uid
}

export function stopFoxSkinsSync() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
    syncedUid = ''
  }
}

async function patchRemote(patch: Record<string, unknown>) {
  const uid = getUid()
  if (!uid || !db) return
  try {
    await setDoc(doc(db, 'users', uid, 'foxSkins', 'data'), patch, { merge: true })
  } catch {}
}

export const useFoxSkinsStore = create<FoxSkinsState>()(
  persist(
    (set, get) => ({
      equipped: 'idle',
      unlocked: ['idle'],
      coins: 0,
      premium: false,
      premiumUntil: null,
      themeUnlocked: false,
      todayTaskCoins: 0,
      todayFocusCoins: 0,
      todayTasksCompleted: 0,
      lastCoinDate: '',

      equipSkin: (id: string) => {
        const { unlocked } = get()
        if (!unlocked.includes(id)) return
        set({ equipped: id })
        patchRemote({ equipped: id })
      },

      unlockSkin: (id: string) => {
        const { coins, unlocked } = get()
        if (unlocked.includes(id)) return false
        const skinData = getSkinById(id)
        if (!skinData) return false
        if (coins < skinData.cost) return false
        set({
          coins: coins - skinData.cost,
          unlocked: [...unlocked, id],
          equipped: id,
        })
        patchRemote({ coins: increment(-skinData.cost), unlocked: arrayUnion(id), equipped: id })
        return true
      },

      addCoins: (amount: number) => {
        set((s) => ({ coins: s.coins + amount }))
        patchRemote({ coins: increment(amount) })
      },

      spendCoins: (amount: number) => {
        const { coins } = get()
        if (coins < amount) return false
        set({ coins: coins - amount })
        patchRemote({ coins: increment(-amount) })
        return true
      },

      unlockTheme: () => {
        const { coins, themeUnlocked } = get()
        if (themeUnlocked) return true
        if (coins < 500) return false
        set({ coins: coins - 500, themeUnlocked: true })
        patchRemote({ coins: increment(-500), themeUnlocked: true })
        return true
      },

      recordTaskReward: () => {
        const state = get()
        const today = todayKey()
        let todayTasksCompleted = state.todayTasksCompleted
        let todayTaskCoins = state.todayTaskCoins
        let todayFocusCoins = state.todayFocusCoins
        if (state.lastCoinDate !== today) {
          todayTasksCompleted = 0
          todayTaskCoins = 0
          todayFocusCoins = 0
        }
        if (todayTasksCompleted >= DAILY_TASK_LIMIT) {
          set({ lastCoinDate: today, todayTasksCompleted, todayTaskCoins })
          return { earned: 0, capped: true }
        }
        todayTasksCompleted++
        todayTaskCoins += TASK_COIN_REWARD
        set({
          lastCoinDate: today,
          todayTasksCompleted,
          todayTaskCoins,
          todayFocusCoins,
          coins: state.coins + TASK_COIN_REWARD,
        })
        patchRemote({ coins: increment(TASK_COIN_REWARD) })
        return { earned: TASK_COIN_REWARD, capped: false }
      },

      recordFocusReward: () => {
        const state = get()
        const today = todayKey()
        let todayFocusCoins = state.todayFocusCoins
        let todayTasksCompleted = state.todayTasksCompleted
        let todayTaskCoins = state.todayTaskCoins
        if (state.lastCoinDate !== today) {
          todayFocusCoins = 0
          todayTasksCompleted = 0
          todayTaskCoins = 0
        }
        if (todayFocusCoins >= DAILY_FOCUS_LIMIT * FOCUS_COIN_REWARD) {
          set({ lastCoinDate: today, todayFocusCoins })
          return { earned: 0, capped: true }
        }
        todayFocusCoins += FOCUS_COIN_REWARD
        set({
          lastCoinDate: today,
          todayFocusCoins,
          todayTasksCompleted,
          todayTaskCoins,
          coins: state.coins + FOCUS_COIN_REWARD,
        })
        patchRemote({ coins: increment(FOCUS_COIN_REWARD) })
        return { earned: FOCUS_COIN_REWARD, capped: false }
      },
    }),
    {
      name: 'task-lex-fox-skins',
      partialize: (s) => ({
        equipped: s.equipped,
        unlocked: s.unlocked,
        coins: s.coins,
        premium: s.premium,
        premiumUntil: s.premiumUntil,
        themeUnlocked: s.themeUnlocked,
        todayTaskCoins: s.todayTaskCoins,
        todayFocusCoins: s.todayFocusCoins,
        todayTasksCompleted: s.todayTasksCompleted,
        lastCoinDate: s.lastCoinDate,
      }),
    },
  ),
)
