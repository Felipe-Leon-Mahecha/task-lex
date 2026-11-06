import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { getUid } from '../lib/session'
import { clearSeasonBackground } from '../lib/seasons/background'
import {
  ALL_SPECIALS,
  characterCandidates,
  eligibleForMonth,
  randItem,
  specialsOf,
  themeById,
  type SpecialKey,
  type ThemeEntry,
} from '../lib/seasons/catalog'

export interface SeasonRecord {
  themeId: string
  character: string | null
  year: number
  month: number
  confirmed?: boolean
}

export interface InsigniaEntry {
  count: number
  lastYear: number
  lastMonth: number
}

export interface SpecialInsignia {
  count: number
  themeId: string | null
  year: number
  month: number
}

export interface MonthlySeasonOdds {
  period: string
  baseScores: Record<string, number>
  boosts: Record<string, number>
  contributions: Record<string, number>
}

const EMPTY_SPECIAL: SpecialInsignia = { count: 0, themeId: null, year: 0, month: 0 }

function freshSpecials(): Record<SpecialKey, SpecialInsignia> {
  const out = {} as Record<SpecialKey, SpecialInsignia>
  for (const k of ALL_SPECIALS) out[k] = { ...EMPTY_SPECIAL }
  return out
}

let unsubscribe: Unsubscribe | null = null
let syncedUid = ''
let applyingRemote = false

function snapshotOf(s: SeasonsState) {
  return {
    current: s.current,
    insignias: s.insignias,
    specials: s.specials,
    monthlyOdds: s.monthlyOdds,
    reSortsLeft: s.reSortsLeft,
    reSortsPeriod: s.reSortsPeriod,
  }
}

async function saveRemote() {
  if (applyingRemote) return
  const uid = getUid()
  if (!uid || !db) return
  try {
    await setDoc(doc(db, 'users', uid, 'seasons', 'data'), snapshotOf(useSeasonsStore.getState()), {
      merge: true,
    })
  } catch {}
}

function validRecord(v: unknown): v is SeasonRecord {
  if (!v || typeof v !== 'object') return false
  const r = v as Record<string, unknown>
  return (
    typeof r.themeId === 'string' &&
    (r.character === null || typeof r.character === 'string') &&
    typeof r.year === 'number' &&
    typeof r.month === 'number' &&
    (r.confirmed === undefined || typeof r.confirmed === 'boolean')
  )
}

function validInsignias(v: unknown): v is Record<string, InsigniaEntry> {
  if (!v || typeof v !== 'object') return false
  return Object.values(v as Record<string, unknown>).every(
    (e) =>
      !!e &&
      typeof e === 'object' &&
      typeof (e as Record<string, unknown>).count === 'number' &&
      typeof (e as Record<string, unknown>).lastYear === 'number' &&
      typeof (e as Record<string, unknown>).lastMonth === 'number',
  )
}

function validMonthlyOdds(v: unknown): v is MonthlySeasonOdds {
  if (!v || typeof v !== 'object') return false
  const odds = v as Record<string, unknown>
  const validMap = (value: unknown, max: number) => !!value && typeof value === 'object' && !Array.isArray(value) &&
    Object.values(value as Record<string, unknown>).every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= max)
  return typeof odds.period === 'string' && /^\d{4}-(?:[1-9]|1[0-2])$/.test(odds.period) &&
    validMap(odds.baseScores, 500) && validMap(odds.boosts, 100_000) && validMap(odds.contributions, 1000)
}

function newMonthlyOdds(month: number, year: number, pool: ThemeEntry[]): MonthlySeasonOdds {
  return {
    period: `${year}-${month}`,
    baseScores: Object.fromEntries(pool.map((entry) => [entry.key, 40 + Math.floor(Math.random() * 81)])),
    boosts: {},
    contributions: {},
  }
}

export function startSeasonsSync() {
  const uid = getUid()
  if (!uid || !db) return
  if (unsubscribe && syncedUid === uid) return
  stopSeasonsSync()
  const ref = doc(db, 'users', uid, 'seasons', 'data')
  unsubscribe = onSnapshot(
    ref,
    (snap) => {
      if (!snap.exists()) {
        setDoc(ref, snapshotOf(useSeasonsStore.getState())).catch(() => {})
        if (!useSeasonsStore.getState().current) clearSeasonBackground()
        return
      }
      const d = snap.data()
      const patch: Partial<SeasonsState> = {}
      if (d.current === null || validRecord(d.current)) patch.current = d.current
      if (validInsignias(d.insignias)) patch.insignias = d.insignias
      if (validMonthlyOdds(d.monthlyOdds)) patch.monthlyOdds = d.monthlyOdds
      if (d.specials && typeof d.specials === 'object') {
        const sp = d.specials as Record<string, unknown>
        const next = { ...useSeasonsStore.getState().specials }
        let ok = false
        for (const k of ALL_SPECIALS) {
          const v = sp[k]
          if (
            v &&
            typeof v === 'object' &&
            typeof (v as Record<string, unknown>).count === 'number' &&
            typeof (v as Record<string, unknown>).year === 'number' &&
            typeof (v as Record<string, unknown>).month === 'number' &&
            ((v as Record<string, unknown>).themeId === null ||
              typeof (v as Record<string, unknown>).themeId === 'string')
          ) {
            next[k] = {
              count: (v as SpecialInsignia).count,
              themeId: (v as SpecialInsignia).themeId,
              year: (v as SpecialInsignia).year,
              month: (v as SpecialInsignia).month,
            }
            ok = true
          }
        }
        if (ok) patch.specials = next
      }
      if (typeof d.reSortsLeft === 'number') patch.reSortsLeft = Math.max(0, Math.min(2, d.reSortsLeft))
      if (typeof d.reSortsPeriod === 'string') patch.reSortsPeriod = d.reSortsPeriod
      if (Object.keys(patch).length === 0) return
      applyingRemote = true
      try {
        useSeasonsStore.setState(patch)
      } finally {
        applyingRemote = false
      }
      useSeasonsStore.getState().finalizeSeasonIfExpired()
      if (!useSeasonsStore.getState().current) clearSeasonBackground()
    },
    () => {},
  )
  syncedUid = uid
}

export function stopSeasonsSync() {
  if (unsubscribe) {
    unsubscribe()
    unsubscribe = null
    syncedUid = ''
  }
}

export interface SeasonsImportData {
  current: SeasonRecord | null
  insignias: Record<string, InsigniaEntry>
  specials: Record<SpecialKey, SpecialInsignia>
  monthlyOdds?: MonthlySeasonOdds
  reSortsLeft: number
  reSortsPeriod?: string
}

export function importSeasonsData(data: Partial<SeasonsImportData>) {
  const prev = useSeasonsStore.getState()
  useSeasonsStore.setState({
    current: data.current !== undefined ? data.current : prev.current,
    insignias: data.insignias ?? prev.insignias,
    specials: data.specials
      ? { ...freshSpecials(), ...data.specials }
      : prev.specials,
    monthlyOdds: data.monthlyOdds ?? prev.monthlyOdds,
    reSortsLeft:
      typeof data.reSortsLeft === 'number' ? Math.max(0, Math.min(2, data.reSortsLeft)) : prev.reSortsLeft,
    reSortsPeriod: data.reSortsPeriod ?? prev.reSortsPeriod,
  })
  saveRemote()
}

interface SeasonsState {
  current: SeasonRecord | null
  insignias: Record<string, InsigniaEntry>
  specials: Record<SpecialKey, SpecialInsignia>
  monthlyOdds: MonthlySeasonOdds | null
  reSortsLeft: number
  reSortsPeriod: string
  ensureMonthlyOdds: (month: number, year: number) => MonthlySeasonOdds
  setMonthlyOdds: (odds: MonthlySeasonOdds) => void
  previewSeason: (month: number, year: number) => ThemeEntry | null
  drawSeason: (month: number, year: number, selectedKey?: string) => ThemeEntry | null
  drawCharacter: () => string | null
  setCharacter: (name: string | null) => void
  clearCharacter: () => void
  consumeReSort: () => void
  confirmSeason: () => void
  finalizeSeasonIfExpired: () => void
  resetAll: () => void
}

export const useSeasonsStore = create<SeasonsState>()(
  persist(
    (set, get) => ({
      current: null,
      insignias: {},
      specials: freshSpecials(),
      monthlyOdds: null,
      reSortsLeft: 2,
      reSortsPeriod: '',
      ensureMonthlyOdds: (month, year) => {
        const period = `${year}-${month}`
        const current = get().monthlyOdds
        const pool = eligibleForMonth(month)
        if (current?.period === period && pool.every((entry) => typeof current.baseScores[entry.key] === 'number')) return current
        const odds = newMonthlyOdds(month, year, pool)
        set({ monthlyOdds: odds })
        saveRemote()
        return odds
      },
      setMonthlyOdds: (odds) => {
        if (!validMonthlyOdds(odds)) return
        set({ monthlyOdds: odds })
        saveRemote()
      },
      previewSeason: (month, year) => {
        const pool = eligibleForMonth(month)
        if (pool.length === 0) return null
        const monthlyOdds = get().ensureMonthlyOdds(month, year)
        const state = get()
        const samePeriod = state.current?.year === year && state.current.month === month
        if (samePeriod && state.current?.confirmed !== false) return null
        if (samePeriod && (new Date().getDate() > 3 || state.reSortsLeft <= 0)) return null
        const nowIdx = year * 12 + month
        let totalW = 0
        const weighed = pool.map((e) => {
          const prev = get().insignias[e.key]
          const lastIdx = prev ? prev.lastYear * 12 + prev.lastMonth : -1
          const gap = lastIdx < 0 ? Number.POSITIVE_INFINITY : nowIdx - lastIdx
          const score = (monthlyOdds.baseScores[e.key] ?? 40) + (monthlyOdds.boosts[e.key] ?? 0)
          const w = score * (gap > 6 ? 1 : 0.04)
          totalW += w
          return { e, w }
        })
        let r = Math.random() * totalW
        let entry = weighed[weighed.length - 1].e
        for (const { e, w } of weighed) {
          r -= w
          if (r <= 0) {
            entry = e
            break
          }
        }
        return entry
      },
      drawSeason: (month, year, selectedKey) => {
        const pool = eligibleForMonth(month)
        if (pool.length === 0) return null
        const period = `${year}-${month}`
        const state = get()
        const samePeriod = state.current?.year === year && state.current.month === month
        if (samePeriod && state.current?.confirmed !== false) return null
        if (samePeriod && (new Date().getDate() > 3 || state.reSortsLeft <= 0)) return null
        const entry = selectedKey
          ? pool.find((candidate) => candidate.key === selectedKey)
          : get().previewSeason(month, year)
        if (!entry) return null
        const record: SeasonRecord = { themeId: entry.key, character: null, year, month, confirmed: false }
        set((s) => {
          const isNewPeriod = s.reSortsPeriod !== period
          return { current: record, reSortsPeriod: period, reSortsLeft: isNewPeriod ? 2 : s.reSortsLeft }
        })
        if (new Date().getDate() > 3) get().confirmSeason()
        saveRemote()
        return entry
      },
      drawCharacter: () => {
        const cur = get().current
        if (!cur) return null
        const entry = themeById(cur.themeId)
        if (!entry) return null
        const cands = characterCandidates(entry)
        if (cands.length === 0) return null
        const picked = randItem(cands)
        set({ current: { ...cur, character: picked.name } })
        saveRemote()
        return picked.name
      },
      setCharacter: (name) => {
        const cur = get().current
        if (!cur) return
        const entry = themeById(cur.themeId)
        if (!entry || entry.key !== 'creepypastas') return
        const valid = name !== null && characterCandidates(entry).some((candidate) => candidate.name === name)
        set({ current: { ...cur, character: valid ? name : null } })
        saveRemote()
      },
      clearCharacter: () => {
        const cur = get().current
        if (!cur) return
        set({ current: { ...cur, character: null } })
        saveRemote()
      },
      consumeReSort: () => {
        const current = get().current
        const now = new Date()
        if (!current || current.confirmed !== false || now.getDate() > 3 || current.year !== now.getFullYear() || current.month !== now.getMonth() + 1) return
        set((s) => ({ reSortsLeft: Math.max(0, s.reSortsLeft - 1) }))
        saveRemote()
      },
      confirmSeason: () => {
        const current = get().current
        if (!current || current.confirmed !== false) return
        const entry = themeById(current.themeId)
        if (!entry) return
        set((s) => {
          const prev = s.insignias[entry.key]
          const insignias = {
            ...s.insignias,
            [entry.key]: { count: (prev?.count ?? 0) + 1, lastYear: current.year, lastMonth: current.month },
          }
          const specials = { ...s.specials }
          for (const sp of specialsOf(current.month)) {
            const old = specials[sp] ?? { ...EMPTY_SPECIAL }
            specials[sp] = { count: old.count + 1, themeId: entry.key, year: current.year, month: current.month }
          }
          return { current: { ...current, confirmed: true }, insignias, specials }
        })
        saveRemote()
      },
      finalizeSeasonIfExpired: () => {
        const current = get().current
        if (!current) return
        const now = new Date()
        const currentPeriod = current.year * 12 + current.month
        const activePeriod = now.getFullYear() * 12 + now.getMonth() + 1
        if (activePeriod > currentPeriod) {
          clearSeasonBackground()
          if (current.confirmed !== false) {
            set({ current: null })
            saveRemote()
            return
          }
          const entry = themeById(current.themeId)
          set((s) => {
            let insignias = s.insignias
            let specials = s.specials
            if (entry) {
              const prev = s.insignias[entry.key]
              insignias = {
                ...s.insignias,
                [entry.key]: { count: (prev?.count ?? 0) + 1, lastYear: current.year, lastMonth: current.month },
              }
              specials = { ...s.specials }
              for (const sp of specialsOf(current.month)) {
                const old = specials[sp] ?? { ...EMPTY_SPECIAL }
                specials[sp] = { count: old.count + 1, themeId: entry.key, year: current.year, month: current.month }
              }
            }
            return { current: null, insignias, specials }
          })
          saveRemote()
          return
        }
        if (current.confirmed === false && activePeriod === currentPeriod && now.getDate() > 3) get().confirmSeason()
      },
      resetAll: () => {
        set({
          current: null,
          insignias: {},
          specials: freshSpecials(),
          monthlyOdds: null,
          reSortsLeft: 2,
          reSortsPeriod: '',
        })
        saveRemote()
      },
    }),
    { 
      name: 'task-lex-seasons',
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<SeasonsState>
        return {
          ...current,
          ...p,
          reSortsPeriod: p.reSortsPeriod ?? '',
          monthlyOdds: validMonthlyOdds(p.monthlyOdds) ? p.monthlyOdds : null,
          specials: { ...freshSpecials(), ...(p.specials ?? {}) },
        } as SeasonsState
      },
    },
  ),
)

queueMicrotask(() => useSeasonsStore.getState().finalizeSeasonIfExpired())
