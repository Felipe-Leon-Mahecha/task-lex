import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { getUid } from '../lib/session'
import { doc, onSnapshot } from 'firebase/firestore'
import type { Unsubscribe } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { getSkinById } from '../lib/foxSkins'
import { getQuackingtonSkinById } from '../lib/quackingtonSkins'
import { useAuthStore } from './auth'
import { ADMIN_EMAIL } from '../lib/appInfo'
import { apiUrl } from '../lib/apiUrl'
import { isHalloween2026 } from '../lib/achievements'
import { playAppSound, playCoinPickupSound } from '../lib/soundEffects'
import { useSettingsStore } from './settings'

interface FoxSkinsState {
  equipped: string
  unlocked: string[]
  coins: number
  premium: boolean
  premiumUntil: number | null
  themeUnlocked: boolean
  pet: 'fox' | 'quackington'
  quackingtonOwned: boolean
  quackingtonSkin: string
  quackingtonSkinsUnlocked: string[]
  favoriteFoxSkins: string[]
  favoriteQuackingtonSkins: string[]
  todayTaskCoins: number
  todayFocusCoins: number
  todayTasksCompleted: number
  lastCoinDate: string
  spiderCrushes: number
  halloween2026SpiderCrushes: number
  equipSkin: (id: string) => void
  unlockSkin: (id: string, price?: number) => Promise<boolean>
  addCoins: (amount: number, claimId?: string) => Promise<boolean>
  claimWindowsWelcomeReward: () => Promise<{ claimed: boolean; coins: number } | null>
  spendCoins: (amount: number) => Promise<boolean>
  unlockTheme: () => Promise<boolean>
  purchaseSeasonOdds: (themeId: string, month: number, year: number, baseScores: Record<string, number>) => Promise<{ period: string; baseScores: Record<string, number>; boosts: Record<string, number>; contributions: Record<string, number> } | null>
  setPet: (pet: 'fox' | 'quackington') => void
  unlockQuackington: () => Promise<boolean>
  equipQuackingtonSkin: (id: string) => void
  unlockQuackingtonSkin: (id: string, price?: number) => Promise<boolean>
  toggleFavoriteSkin: (pet: 'fox' | 'quackington', id: string) => void
  grantQuackingtonSkin: (id: string) => Promise<boolean>
  grantCollectionQuackingtonSkin: (id: string) => Promise<boolean>
  grantPremiumDays: (days: number) => Promise<void>
  grantQuackington: () => void
  recordTaskReward: (taskId?: string) => Promise<{ earned: number; capped: boolean }>
  recordFocusReward: () => Promise<{ earned: number; capped: boolean }>
  recordSpiderCrush: () => Promise<number | null>
  rewardedTaskIds: string[]
}

const DAILY_TASK_LIMIT = 5
const DAILY_FOCUS_LIMIT = 3
const TASK_COIN_REWARD = 5
const FOCUS_COIN_REWARD = 10
const QUACKINGTON_COST = 1000

export function useInfiniteCoins(): boolean {
  const user = useAuthStore((s) => s.user)
  return !!user && user.email?.trim().toLowerCase() === ADMIN_EMAIL && user.emailVerified === true
}

function isOwner(): boolean {
  const user = useAuthStore.getState().user
  return !!user && user.email?.trim().toLowerCase() === ADMIN_EMAIL && user.emailVerified === true
}

function todayKey(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

let unsubscribe: Unsubscribe | null = null
let syncedUid = ''
let lastEconomyError: string | null = null

export function getLastEconomyError(): string | null {
  return lastEconomyError
}

async function economyRequest(action: string, payload: Record<string, unknown> = {}) {
  const currentUser = auth?.currentUser
  lastEconomyError = null
  if (!currentUser) {
    lastEconomyError = 'La sesión no está disponible. Inicia sesión de nuevo e inténtalo.'
    return null
  }
  try {
    // Refresh the owner's token before economy requests so the API sees the latest
    // verified-email claim used by the server-side unlimited-coins bypass.
    const owner = currentUser.email?.trim().toLowerCase() === ADMIN_EMAIL && currentUser.emailVerified
    const token = await currentUser.getIdToken(owner)
    const response = await fetch(apiUrl('/api/economy'), {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, ...payload }),
    })
    const data = await response.json().catch(() => null)
    if (!response.ok) {
      lastEconomyError = typeof data?.error === 'string' ? data.error : `El servidor respondió con el error ${response.status}.`
      return null
    }
    return data
  } catch (error) {
    lastEconomyError = error instanceof Error ? error.message : 'No se pudo conectar con el servicio de compras.'
    return null
  }
}

function readLocalHalloweenSpiderCount() {
  if (!isHalloween2026()) return 0
  try { return Math.max(0, Number(localStorage.getItem('tasklex-halloween-spider-crushes-2026') ?? 0) || 0) } catch { return 0 }
}

function applyWallet(wallet: Record<string, unknown> | undefined) {
  if (!wallet) return
  useFoxSkinsStore.setState({
    coins: typeof wallet.coins === 'number' ? wallet.coins : useFoxSkinsStore.getState().coins,
    equipped: typeof wallet.equipped === 'string' ? wallet.equipped : useFoxSkinsStore.getState().equipped,
    unlocked: Array.isArray(wallet.unlocked) ? wallet.unlocked as string[] : useFoxSkinsStore.getState().unlocked,
    premium: typeof wallet.premium === 'boolean' ? wallet.premium : useFoxSkinsStore.getState().premium,
    premiumUntil: typeof wallet.premiumUntil === 'number' ? wallet.premiumUntil : null,
    themeUnlocked: typeof wallet.themeUnlocked === 'boolean' ? wallet.themeUnlocked : useFoxSkinsStore.getState().themeUnlocked,
    pet: wallet.pet === 'quackington' ? 'quackington' : 'fox',
    quackingtonOwned: !!wallet.quackingtonOwned,
    quackingtonSkin: typeof wallet.quackingtonSkin === 'string' ? wallet.quackingtonSkin : 'animado',
    quackingtonSkinsUnlocked: Array.isArray(wallet.quackingtonSkinsUnlocked) ? wallet.quackingtonSkinsUnlocked as string[] : ['animado'],
    favoriteFoxSkins: Array.isArray(wallet.favoriteFoxSkins) ? wallet.favoriteFoxSkins as string[] : [],
    favoriteQuackingtonSkins: Array.isArray(wallet.favoriteQuackingtonSkins) ? wallet.favoriteQuackingtonSkins as string[] : [],
    spiderCrushes: typeof wallet.spiderCrushes === 'number' ? wallet.spiderCrushes : useFoxSkinsStore.getState().spiderCrushes,
    halloween2026SpiderCrushes: typeof wallet.halloween2026SpiderCrushes === 'number'
      ? wallet.halloween2026SpiderCrushes
      : useFoxSkinsStore.getState().halloween2026SpiderCrushes,
  })
}

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
        void economyRequest('initialize').then((response) => applyWallet(response?.wallet))
        return
      }
      const d = snap.data()
      const local = useFoxSkinsStore.getState()
      const until = typeof d.premiumUntil === 'number' ? d.premiumUntil : null
      const owned = isOwner() || !!d.quackingtonOwned
      useFoxSkinsStore.setState({
        equipped: d.equipped || 'idle',
        unlocked: Array.isArray(d.unlocked) && d.unlocked.length ? d.unlocked : ['idle'],
        coins: typeof d.coins === 'number' ? d.coins : 0,
        premium: isOwner() || (!!d.premium && (!until || until > Date.now())),
        premiumUntil: until,
        themeUnlocked: !!d.themeUnlocked,
        pet: d.pet === 'quackington' || (owned && d.pet !== 'fox') ? 'quackington' : 'fox',
        quackingtonOwned: owned,
        quackingtonSkin: typeof d.quackingtonSkin === 'string' ? d.quackingtonSkin : local.quackingtonSkin || 'animado',
        quackingtonSkinsUnlocked: Array.isArray(d.quackingtonSkinsUnlocked) && d.quackingtonSkinsUnlocked.length
          ? d.quackingtonSkinsUnlocked
          : local.quackingtonSkinsUnlocked.length ? local.quackingtonSkinsUnlocked : ['animado'],
        favoriteFoxSkins: Array.isArray(d.favoriteFoxSkins) ? d.favoriteFoxSkins : local.favoriteFoxSkins,
        favoriteQuackingtonSkins: Array.isArray(d.favoriteQuackingtonSkins) ? d.favoriteQuackingtonSkins : local.favoriteQuackingtonSkins,
        spiderCrushes: typeof d.spiderCrushes === 'number' ? d.spiderCrushes : local.spiderCrushes,
        halloween2026SpiderCrushes: typeof d.halloween2026SpiderCrushes === 'number'
          ? d.halloween2026SpiderCrushes
          : Math.max(local.halloween2026SpiderCrushes, readLocalHalloweenSpiderCount()),
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
  const clean: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(patch)) if (v !== undefined) clean[k] = v
  if (Object.keys(clean).length === 0) return
  const result = await economyRequest('cosmetic', { changes: clean })
  if (!result) return
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
      pet: 'fox',
      quackingtonOwned: false,
      quackingtonSkin: 'animado',
      quackingtonSkinsUnlocked: ['animado'],
      favoriteFoxSkins: [],
      favoriteQuackingtonSkins: [],
      todayTaskCoins: 0,
      todayFocusCoins: 0,
      todayTasksCompleted: 0,
      lastCoinDate: '',
      spiderCrushes: 0,
      halloween2026SpiderCrushes: 0,
      rewardedTaskIds: [],

      equipSkin: (id: string) => {
        const { unlocked } = get()
        if (!unlocked.includes(id)) return
        set({ equipped: id })
        patchRemote({ equipped: id })
      },

      unlockSkin: async (id: string, price?: number) => {
        const { coins, unlocked } = get()
        if (unlocked.includes(id)) return false
        const skinData = getSkinById(id)
        if (!skinData) return false
        const purchasePrice = price === undefined ? skinData.cost : Math.max(0, Math.min(skinData.cost, Math.round(price)))
        if (auth?.currentUser) {
          const response = await economyRequest('purchase', { kind: 'fox', itemId: id, price: purchasePrice })
          if (!response?.ok) return false
          applyWallet(response.wallet)
          return true
        }
        const infinite = isOwner()
        if (!infinite && coins < purchasePrice) return false
        set({
          coins: infinite ? coins : coins - purchasePrice,
          unlocked: [...unlocked, id],
          equipped: id,
        })
        return true
      },

      addCoins: async (amount: number, claimId?: string) => {
        if (auth?.currentUser) {
          if (!claimId) return false
          const response = await economyRequest('claim-achievement', { achievementId: claimId })
          if (!response?.ok || !response.claimed) return false
          applyWallet(response.wallet)
          if (typeof response.coins === 'number') set({ coins: response.coins })
          if (amount > 0 && useSettingsStore.getState().soundsEnabled) playCoinPickupSound()
          return true
        }
        set((s) => ({ coins: s.coins + amount, ...(claimId === 'fantasma-aplastador' && !s.unlocked.includes('fantasma') ? { unlocked: [...s.unlocked, 'fantasma'] } : {}) }))
        if (amount > 0 && useSettingsStore.getState().soundsEnabled) playCoinPickupSound()
        return true
      },

      claimWindowsWelcomeReward: async () => {
        const response = await economyRequest('claim-windows-welcome')
        if (!response?.ok || typeof response.coins !== 'number') return null
        applyWallet(response.wallet)
        set({ coins: response.coins })
        return { claimed: response.claimed === true, coins: response.coins }
      },

      spendCoins: async (amount: number) => {
        const { coins } = get()
        const infinite = isOwner()
        if (!infinite && coins < amount) return false
        if (auth?.currentUser) return false
        set({ coins: infinite ? coins : coins - amount })
        return true
      },

      unlockTheme: async () => {
        const { coins, themeUnlocked } = get()
        if (themeUnlocked) return true
        if (auth?.currentUser) {
          const response = await economyRequest('purchase', { kind: 'theme' })
          if (!response?.ok) return false
          applyWallet(response.wallet)
          return true
        }
        const infinite = isOwner()
        if (!infinite && coins < 500) return false
        set({ coins: infinite ? coins : coins - 500, themeUnlocked: true })
        return true
      },

      purchaseSeasonOdds: async (themeId, month, year, baseScores) => {
        const response = await economyRequest('season-odds-purchase', { themeId, month, year, baseScores })
        if (!response?.ok || !response.wallet || !response.monthlyOdds) return null
        applyWallet(response.wallet)
        return response.monthlyOdds
      },

      setPet: (pet: 'fox' | 'quackington') => {
        const state = get()
        if (pet === 'quackington' && !state.quackingtonOwned) return
        if (auth?.currentUser) {
          void economyRequest('select-pet', { itemId: pet })
          return
        }
        set({ pet })
      },

      unlockQuackington: async () => {
        const { coins, quackingtonOwned } = get()
        if (quackingtonOwned) return true
        if (auth?.currentUser) {
          const response = await economyRequest('purchase', { kind: 'quackington' })
          if (!response?.ok) return false
          applyWallet(response.wallet)
          return true
        }
        const infinite = isOwner()
        if (!infinite && coins < QUACKINGTON_COST) return false
        set({ coins: infinite ? coins : coins - QUACKINGTON_COST, quackingtonOwned: true, pet: 'quackington' })
        return true
      },

      equipQuackingtonSkin: (id: string) => {
        const { quackingtonSkinsUnlocked, quackingtonOwned } = get()
        if (!quackingtonSkinsUnlocked.includes(id)) return
        set({ quackingtonSkin: id, ...(quackingtonOwned ? { pet: 'quackington' as const } : {}) })
        patchRemote({ quackingtonSkin: id, ...(quackingtonOwned ? { pet: 'quackington' } : {}) })
      },

      unlockQuackingtonSkin: async (id: string, price?: number) => {
        const state = get()
        if (state.quackingtonSkinsUnlocked.includes(id)) return false
        const skin = getQuackingtonSkinById(id)
        if (!skin || skin.rewardOnly) return false
        const purchasePrice = price === undefined ? skin.cost : Math.max(0, Math.min(skin.cost, Math.round(price)))
        if (auth?.currentUser) {
          const response = await economyRequest('purchase', { kind: 'duck', itemId: id, price: purchasePrice })
          if (!response?.ok) return false
          applyWallet(response.wallet)
          return true
        }
        const infinite = isOwner()
        if (!infinite && state.coins < purchasePrice) return false
        set({
          coins: infinite ? state.coins : state.coins - purchasePrice,
          quackingtonSkinsUnlocked: [...state.quackingtonSkinsUnlocked, id],
          quackingtonSkin: id,
          ...(state.quackingtonOwned ? { pet: 'quackington' as const } : {}),
        })
        return true
      },

      toggleFavoriteSkin: (pet, id) => {
        const key = pet === 'fox' ? 'favoriteFoxSkins' : 'favoriteQuackingtonSkins'
        const current = get()[key]
        const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
        set({ [key]: next } as Pick<FoxSkinsState, typeof key>)
        if (!current.includes(id)) playAppSound('skin-favorite', 0.2)
        patchRemote({ [key]: next })
      },

      grantQuackingtonSkin: async (id: string) => {
        const state = get()
        const skin = getQuackingtonSkinById(id)
        if (!skin?.rewardOnly || state.quackingtonSkinsUnlocked.includes(id)) return false
        if ((id === 'pato-navideno' || id === 'pato-noel') && !auth?.currentUser) return false
        if (auth?.currentUser) {
          const response = await economyRequest('claim-milestone', { itemId: id })
          if (!response?.ok || !response.claimed) return false
          applyWallet(response.wallet)
          return true
        }
        set({
          quackingtonSkinsUnlocked: [...state.quackingtonSkinsUnlocked, id],
          quackingtonSkin: id,
          ...(state.quackingtonOwned ? { pet: 'quackington' as const } : {}),
        })
        return true
      },

      grantCollectionQuackingtonSkin: async (id: string) => {
        const state = get()
        const skin = getQuackingtonSkinById(id)
        if (!skin || skin.rewardOnly || id === 'animado' || state.quackingtonSkinsUnlocked.includes(id)) return false
        if (auth?.currentUser) {
          const response = await economyRequest('claim-milestone', { itemId: id })
          if (!response?.ok || !response.claimed) return false
          applyWallet(response.wallet)
          return true
        }
        // Sin sesión no se otorgan skins (evita bypass offline).
        return false
      },

      grantPremiumDays: async (days: number) => {
        if (!Number.isFinite(days) || days <= 0) return
        if (auth?.currentUser) return
        const state = get()
        const premiumUntil = Math.max(Date.now(), state.premiumUntil ?? 0) + Math.floor(days) * 86400000
        set({ premium: true, premiumUntil })
      },

      grantQuackington: () => {
        if (auth?.currentUser) return
        set({ quackingtonOwned: true, pet: 'quackington' })
      },

      recordTaskReward: async (taskId?: string) => {
        if (isOwner()) return { earned: 0, capped: false }
        if (auth?.currentUser) {
          const response = await economyRequest('reward-task', { taskId })
          if (!response?.ok) return { earned: 0, capped: true }
          set({ coins: response.coins })
          const earned = response.earned ?? 0
          if (earned > 0) playCoinPickupSound()
          return { earned, capped: !!response.capped }
        }
        const state = get()
        const today = todayKey()
        let todayTasksCompleted = state.todayTasksCompleted
        let todayTaskCoins = state.todayTaskCoins
        let todayFocusCoins = state.todayFocusCoins
        let rewardedTaskIds = state.rewardedTaskIds
        if (state.lastCoinDate !== today) {
          todayTasksCompleted = 0
          todayTaskCoins = 0
          todayFocusCoins = 0
          rewardedTaskIds = []
        }
        if (taskId && rewardedTaskIds.includes(taskId)) {
          return { earned: 0, capped: false }
        }
        if (todayTasksCompleted >= DAILY_TASK_LIMIT) {
          set({ lastCoinDate: today, todayTasksCompleted, todayTaskCoins, todayFocusCoins, rewardedTaskIds })
          return { earned: 0, capped: true }
        }
        todayTasksCompleted++
        todayTaskCoins += TASK_COIN_REWARD
        if (taskId) rewardedTaskIds = [...rewardedTaskIds, taskId]
        set({
          lastCoinDate: today,
          todayTasksCompleted,
          todayTaskCoins,
          todayFocusCoins,
          rewardedTaskIds,
          coins: state.coins + TASK_COIN_REWARD,
        })
        if (useSettingsStore.getState().soundsEnabled) playCoinPickupSound()
        return { earned: TASK_COIN_REWARD, capped: false }
      },

      recordFocusReward: async () => {
        if (isOwner()) return { earned: 0, capped: false }
        if (auth?.currentUser) {
          const response = await economyRequest('reward-focus')
          if (!response?.ok) return { earned: 0, capped: true }
          set({ coins: response.coins })
          const earned = response.earned ?? 0
          if (earned > 0 && useSettingsStore.getState().soundsEnabled) playCoinPickupSound()
          return { earned, capped: !!response.capped }
        }
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
          set({ lastCoinDate: today, todayTasksCompleted, todayTaskCoins, todayFocusCoins })
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
        if (useSettingsStore.getState().soundsEnabled) playCoinPickupSound()
        return { earned: FOCUS_COIN_REWARD, capped: false }
      },

      recordSpiderCrush: async () => {
        if (auth?.currentUser) {
          const response = await economyRequest('spider-crush')
          if (!response?.ok || typeof response.count !== 'number') return null
          const seasonCount = typeof response.seasonCount === 'number' ? response.seasonCount : get().halloween2026SpiderCrushes
          set({ spiderCrushes: response.count, halloween2026SpiderCrushes: seasonCount })
          try { localStorage.setItem('tasklex-halloween-spider-crushes', String(response.count)) } catch {}
          if (isHalloween2026()) {
            try { localStorage.setItem('tasklex-halloween-spider-crushes-2026', String(seasonCount)) } catch {}
          }
          return seasonCount
        }
        const count = get().spiderCrushes + 1
        const inSeason = isHalloween2026()
        const seasonCount = inSeason ? get().halloween2026SpiderCrushes + 1 : get().halloween2026SpiderCrushes
        set({ spiderCrushes: count, halloween2026SpiderCrushes: seasonCount })
        try { localStorage.setItem('tasklex-halloween-spider-crushes', String(count)) } catch {}
        if (inSeason) { try { localStorage.setItem('tasklex-halloween-spider-crushes-2026', String(seasonCount)) } catch {} }
        return seasonCount
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
        pet: s.pet,
        quackingtonOwned: s.quackingtonOwned,
        quackingtonSkin: s.quackingtonSkin,
        quackingtonSkinsUnlocked: s.quackingtonSkinsUnlocked,
        favoriteFoxSkins: s.favoriteFoxSkins,
        favoriteQuackingtonSkins: s.favoriteQuackingtonSkins,
        todayTaskCoins: s.todayTaskCoins,
        todayFocusCoins: s.todayFocusCoins,
        todayTasksCompleted: s.todayTasksCompleted,
        lastCoinDate: s.lastCoinDate,
        rewardedTaskIds: s.rewardedTaskIds,
        spiderCrushes: s.spiderCrushes,
        halloween2026SpiderCrushes: s.halloween2026SpiderCrushes,
      }),
    },
  ),
)
